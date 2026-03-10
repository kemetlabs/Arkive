"""Activity log API routes."""

import json

import aiosqlite
from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_db, require_auth

router = APIRouter(prefix="/activity", tags=["activity"], dependencies=[Depends(require_auth)])


@router.get("")
async def list_activity(
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    type: str | None = None,
    severity: str | None = None,
    db: aiosqlite.Connection = Depends(get_db),
):
    """List activity log entries."""
    conditions = []
    params = []
    if type:
        conditions.append("type = ?")
        params.append(type)
    if severity:
        conditions.append("severity = ?")
        params.append(severity)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""  # nosec B608

    # Total count
    cursor = await db.execute(f"SELECT COUNT(*) as total FROM activity_log {where}", params)  # nosec B608
    total = (await cursor.fetchone())["total"]

    # Fetch
    cursor = await db.execute(
        f"SELECT * FROM activity_log {where} ORDER BY timestamp DESC LIMIT ? OFFSET ?",  # nosec B608
        (*params, limit, offset),
    )
    rows = await cursor.fetchall()
    entries = []
    for row in rows:
        entry = dict(row)
        entry["details"] = json.loads(entry.get("details", "{}"))
        entries.append(entry)

    return {
        "items": entries,
        "activities": entries,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total,
    }
