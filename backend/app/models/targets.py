"""Pydantic models for storage targets."""

from pydantic import BaseModel, Field


class TargetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    type: str = Field(...)  # b2, dropbox, gdrive, s3, local, sftp
    config: dict = {}


class TargetUpdate(BaseModel):
    name: str | None = None
    enabled: bool | None = None
    config: dict | None = None


class TargetResponse(BaseModel):
    id: str
    name: str
    type: str
    enabled: bool
    status: str
    last_tested: str | None = None
    snapshot_count: int = 0
    total_size_bytes: int = 0
    created_at: str
    updated_at: str
    config: dict = {}  # Credentials redacted in response


class TargetTestResult(BaseModel):
    target_id: str
    status: str  # ok, error
    message: str
    latency_ms: int | None = None
