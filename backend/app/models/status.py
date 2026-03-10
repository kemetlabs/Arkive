"""Pydantic models for system status."""

from pydantic import BaseModel


class StatusResponse(BaseModel):
    status: str = "ok"
    version: str
    hostname: str
    uptime_seconds: int
    platform: str
    setup_completed: bool
    last_backup: dict | None = None
    next_backup: dict | None = None
    targets: dict = {"total": 0, "healthy": 0}
    databases: dict = {"total": 0, "healthy": 0}
    storage: dict = {"total_bytes": 0}
