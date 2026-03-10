"""Extended unit tests for app/cli.py — restore and config commands."""

import json
from unittest.mock import MagicMock, patch

import pytest
from click.testing import CliRunner

from app.cli import cli


@pytest.fixture
def runner():
    return CliRunner()


@pytest.fixture
def mock_client():
    """Return a mock httpx.Client."""
    return MagicMock()


# ---------------------------------------------------------------------------
# restore list
# ---------------------------------------------------------------------------


def test_restore_list_human_output(runner):
    """restore list shows snapshot list in human-readable form."""
    snapshots_response = {
        "snapshots": [
            {"id": "abc12345", "time": "2025-01-01T00:00:00Z", "target_id": "t1", "size_bytes": 1024},
            {"id": "def67890", "time": "2025-01-02T00:00:00Z", "target_id": "t2", "size_bytes": 2048},
        ]
    }
    mock_resp = MagicMock()
    mock_resp.json.return_value = snapshots_response
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["restore", "list"])

    assert result.exit_code == 0, f"exit_code={result.exit_code}\n{result.output}"
    assert "abc12345" in result.output
    assert "def67890" in result.output


def test_restore_list_empty(runner):
    """restore list shows 'No snapshots available' when empty."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"snapshots": []}
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["restore", "list"])

    assert result.exit_code == 0
    assert "No snapshots" in result.output


def test_restore_list_json_mode(runner):
    """restore list --json outputs valid JSON."""
    snapshots_response = {"snapshots": [{"id": "abc12345", "time": "2025-01-01T00:00:00Z"}]}
    mock_resp = MagicMock()
    mock_resp.json.return_value = snapshots_response
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["--json", "restore", "list"])

    assert result.exit_code == 0
    data = json.loads(result.output)
    assert "snapshots" in data


# ---------------------------------------------------------------------------
# restore run
# ---------------------------------------------------------------------------


def test_restore_run_success(runner):
    """restore run requires an explicit --restore-to destination."""
    with patch("app.cli._get_client") as mock_get_client:
        result = runner.invoke(cli, ["restore", "run", "abc12345", "--target", "t1"])

    assert result.exit_code == 2
    assert "--restore-to" in result.output
    mock_get_client.assert_not_called()


def test_restore_run_with_target_path(runner):
    """restore run accepts --target-path option."""
    restore_response = {"status": "success"}
    mock_resp = MagicMock()
    mock_resp.json.return_value = restore_response
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.post.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["restore", "run", "abc12345", "--target", "t1", "--restore-to", "/mnt/restore"])

    assert result.exit_code == 0
    call_args = mock_http.post.call_args
    payload = call_args[1].get("json", {})
    assert payload.get("restore_to") == "/mnt/restore"
    assert payload.get("target") == "t1"


def test_restore_run_json_mode(runner):
    """restore run --json outputs valid JSON."""
    restore_response = {"status": "success", "run_id": "r123"}
    mock_resp = MagicMock()
    mock_resp.json.return_value = restore_response
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.post.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(
            cli,
            ["--json", "restore", "run", "abc12345", "--target", "t1", "--restore-to", "/mnt/restore"],
        )

    assert result.exit_code == 0
    data = json.loads(result.output)
    assert data["status"] == "success"


# ---------------------------------------------------------------------------
# config show
# ---------------------------------------------------------------------------


def test_config_show_human_output(runner):
    """config show displays settings in human-readable form."""
    settings_response = {
        "settings": {
            "keep_daily": "7",
            "keep_weekly": "4",
            "notifications_enabled": "1",
        }
    }
    mock_resp = MagicMock()
    mock_resp.json.return_value = settings_response
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["config", "show"])

    assert result.exit_code == 0, f"exit_code={result.exit_code}\n{result.output}"
    assert "keep_daily" in result.output


def test_config_show_json_mode(runner):
    """config show --json outputs valid JSON."""
    settings_response = {"settings": {"keep_daily": "7"}}
    mock_resp = MagicMock()
    mock_resp.json.return_value = settings_response
    mock_resp.raise_for_status = MagicMock()

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["--json", "config", "show"])

    assert result.exit_code == 0
    data = json.loads(result.output)
    assert "settings" in data


# ---------------------------------------------------------------------------
# config export
# ---------------------------------------------------------------------------


def test_config_export_outputs_yaml(runner):
    """config export outputs YAML content from /api/settings/export."""
    yaml_content = "keep_daily: 7\nkeep_weekly: 4\n"
    mock_resp = MagicMock()
    mock_resp.text = yaml_content
    mock_resp.raise_for_status = MagicMock()
    # raise_for_status should not raise
    mock_resp.json.side_effect = Exception("not JSON")

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["config", "export"])

    assert result.exit_code == 0, f"exit_code={result.exit_code}\n{result.output}"
    assert "keep_daily" in result.output
    # Verify correct endpoint was called
    mock_http.get.assert_called_once_with("/api/settings/export")


def test_config_export_json_mode(runner):
    """config export --json wraps YAML in JSON."""
    yaml_content = "keep_daily: 7\n"
    mock_resp = MagicMock()
    mock_resp.text = yaml_content
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.side_effect = Exception("not JSON")

    with patch("app.cli._get_client") as mock_get_client:
        mock_http = MagicMock()
        mock_http.get.return_value = mock_resp
        mock_get_client.return_value = mock_http

        result = runner.invoke(cli, ["--json", "config", "export"])

    assert result.exit_code == 0
    data = json.loads(result.output)
    assert "yaml" in data
    assert "keep_daily" in data["yaml"]
