"""Pydantic models for activity log."""

from pydantic import BaseModel


class ActivityEntry(BaseModel):
    id: int
    type: str
    action: str
    message: str
    details: dict = {}
    severity: str = "info"
    timestamp: str
