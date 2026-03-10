"""Pydantic models for snapshots."""

from pydantic import BaseModel


class SnapshotResponse(BaseModel):
    id: str
    target_id: str
    full_id: str
    time: str
    hostname: str | None = None
    paths: list[str] = []
    tags: list[str] = []
    size_bytes: int = 0
