"""Activity log helper for recording CRUD operations."""

import json
import logging

import aiosqlite

logger = logging.getLogger("arkive.activity")


async def log_activity(
    db: aiosqlite.Connection,
    type: str,
    action: str,
    message: str,
    details: dict | None = None,
    severity: str = "info",
) -> None:
    """Insert an activity log entry."""
    await db.execute(
        "INSERT INTO activity_log (type, action, message, details, severity) VALUES (?, ?, ?, ?, ?)",
        (type, action, message, json.dumps(details or {}), severity),
    )
    await db.commit()
