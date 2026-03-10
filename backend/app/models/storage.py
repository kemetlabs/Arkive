"""Pydantic models for storage stats."""

from pydantic import BaseModel


class StorageStats(BaseModel):
    total_size_bytes: int = 0
    target_count: int = 0
    snapshot_count: int = 0
    targets: list[dict] = []
    size_history: list[dict] = []
