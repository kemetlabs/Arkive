#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://127.0.0.1:8200"
API_KEY=""
TIMEOUT=10
TMP_DIR=""
COOKIE_JAR=""
PDF_PATH=""

usage() {
  cat <<'EOF'
Arkive homeserver smoke test

Usage:
  scripts/homeserver-smoke-test.sh [--base-url URL] [--api-key KEY] [--timeout SECONDS]

Examples:
  scripts/homeserver-smoke-test.sh --base-url http://tower:8200
  scripts/homeserver-smoke-test.sh --base-url http://tower:8200 --api-key ark_xxx

What it checks:
  - Public health endpoint: GET /api/status
  - Header auth flow with X-API-Key (when --api-key is provided)
  - Browser session login/logout flow via cookie auth (when --api-key is provided)
  - Restore plan markdown + PDF download (when --api-key is provided)
EOF
}

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

pass() {
  echo "PASS: $*"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

json_get() {
  local key="$1"
  python3 -c 'import json,sys; data=json.load(sys.stdin); value=data
for part in sys.argv[1].split("."):
    if isinstance(value, dict):
        value=value.get(part)
    else:
        value=None
        break
print("" if value is None else value)' "$key"
}

http_code() {
  local body_file="$1"
  shift
  curl --silent --show-error --location --max-time "$TIMEOUT" \
    --output "$body_file" --write-out "%{http_code}" "$@"
}

auth_header() {
  printf 'X-API-Key: %s' "$API_KEY"
}

base_origin() {
  printf '%s' "${BASE_URL%/}"
}

cleanup() {
  if [[ -n "$TMP_DIR" && -d "$TMP_DIR" ]]; then
    rm -rf "$TMP_DIR"
  fi
}

trap cleanup EXIT

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --api-key)
      API_KEY="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      fail "unknown argument: $1"
      ;;
  esac
done

need_cmd curl
need_cmd python3

TMP_DIR="$(mktemp -d)"
COOKIE_JAR="$TMP_DIR/cookies.txt"
PDF_PATH="$TMP_DIR/restore-plan.bin"

STATUS_BODY="$TMP_DIR/status.json"
STATUS_CODE="$(http_code "$STATUS_BODY" "${BASE_URL%/}/api/status")"
[[ "$STATUS_CODE" == "200" ]] || fail "GET /api/status returned HTTP $STATUS_CODE"

STATUS_VALUE="$(json_get status < "$STATUS_BODY")"
SETUP_COMPLETED="$(json_get setup_completed < "$STATUS_BODY")"
[[ -n "$STATUS_VALUE" ]] || fail "GET /api/status response missing 'status'"
pass "public health endpoint reachable (status=${STATUS_VALUE}, setup_completed=${SETUP_COMPLETED})"

if [[ -z "$API_KEY" ]]; then
  echo "INFO: no API key provided, skipping authenticated smoke checks"
  exit 0
fi

JOBS_BODY="$TMP_DIR/jobs.json"
JOBS_CODE="$(http_code "$JOBS_BODY" -H "$(auth_header)" "${BASE_URL%/}/api/jobs")"
[[ "$JOBS_CODE" == "200" ]] || fail "GET /api/jobs with X-API-Key returned HTTP $JOBS_CODE"
pass "header auth works for GET /api/jobs"

LOGIN_BODY="$TMP_DIR/login.json"
LOGIN_CODE="$(http_code "$LOGIN_BODY" \
  --cookie-jar "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  --data "{\"api_key\":\"$API_KEY\"}" \
  "${BASE_URL%/}/api/auth/login")"
[[ "$LOGIN_CODE" == "200" ]] || fail "POST /api/auth/login returned HTTP $LOGIN_CODE"

LOGIN_AUTHENTICATED="$(json_get authenticated < "$LOGIN_BODY")"
[[ "$LOGIN_AUTHENTICATED" == "True" || "$LOGIN_AUTHENTICATED" == "true" ]] || fail "login did not report authenticated=true"
pass "browser session login works"

SESSION_BODY="$TMP_DIR/session.json"
SESSION_CODE="$(http_code "$SESSION_BODY" \
  --cookie "$COOKIE_JAR" \
  "${BASE_URL%/}/api/auth/session")"
[[ "$SESSION_CODE" == "200" ]] || fail "GET /api/auth/session returned HTTP $SESSION_CODE"

SESSION_AUTHENTICATED="$(json_get authenticated < "$SESSION_BODY")"
[[ "$SESSION_AUTHENTICATED" == "True" || "$SESSION_AUTHENTICATED" == "true" ]] || fail "session cookie is not authenticated"
pass "session cookie is accepted by /api/auth/session"

COOKIE_JOBS_BODY="$TMP_DIR/jobs-cookie.json"
COOKIE_JOBS_CODE="$(http_code "$COOKIE_JOBS_BODY" \
  --cookie "$COOKIE_JAR" \
  "${BASE_URL%/}/api/jobs")"
[[ "$COOKIE_JOBS_CODE" == "200" ]] || fail "GET /api/jobs with session cookie returned HTTP $COOKIE_JOBS_CODE"
pass "session cookie works for protected GET /api/jobs"

PLAN_BODY="$TMP_DIR/restore-plan.md"
PLAN_CODE="$(http_code "$PLAN_BODY" \
  --cookie "$COOKIE_JAR" \
  "${BASE_URL%/}/api/restore/plan")"
[[ "$PLAN_CODE" == "200" ]] || fail "GET /api/restore/plan returned HTTP $PLAN_CODE"
grep -q "Arkive Disaster Recovery Plan" "$PLAN_BODY" || fail "restore plan markdown missing expected title"
pass "restore plan markdown is downloadable"

PDF_CODE="$(curl --silent --show-error --location --max-time "$TIMEOUT" \
  --cookie "$COOKIE_JAR" \
  --output "$PDF_PATH" --write-out "%{http_code}" \
  "${BASE_URL%/}/api/restore/plan/pdf")"
[[ "$PDF_CODE" == "200" ]] || fail "GET /api/restore/plan/pdf returned HTTP $PDF_CODE"
[[ -s "$PDF_PATH" ]] || fail "restore plan PDF download was empty"
pass "restore plan PDF download works"

LOGOUT_BODY="$TMP_DIR/logout.json"
LOGOUT_CODE="$(http_code "$LOGOUT_BODY" \
  --cookie "$COOKIE_JAR" \
  --cookie-jar "$COOKIE_JAR" \
  -H "Origin: $(base_origin)" \
  -X POST \
  "${BASE_URL%/}/api/auth/logout")"
[[ "$LOGOUT_CODE" == "200" ]] || fail "POST /api/auth/logout returned HTTP $LOGOUT_CODE"
pass "browser session logout works"

POST_LOGOUT_SESSION_BODY="$TMP_DIR/session-after-logout.json"
POST_LOGOUT_SESSION_CODE="$(http_code "$POST_LOGOUT_SESSION_BODY" \
  --cookie "$COOKIE_JAR" \
  "${BASE_URL%/}/api/auth/session")"
[[ "$POST_LOGOUT_SESSION_CODE" == "200" ]] || fail "GET /api/auth/session after logout returned HTTP $POST_LOGOUT_SESSION_CODE"

POST_LOGOUT_AUTHENTICATED="$(json_get authenticated < "$POST_LOGOUT_SESSION_BODY")"
[[ "$POST_LOGOUT_AUTHENTICATED" == "False" || "$POST_LOGOUT_AUTHENTICATED" == "false" || -z "$POST_LOGOUT_AUTHENTICATED" ]] || fail "session still authenticated after logout"
pass "session cookie is cleared after logout"

echo "DONE: homeserver smoke test passed"
