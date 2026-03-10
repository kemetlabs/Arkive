"""Pydantic models for backup jobs and job runs."""

from pydantic import BaseModel, Field


class BackupJobCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(default="full")
    schedule: str = Field(..., min_length=1)
    targets: list[str] = []
    directories: list[str] = []
    exclude_patterns: list[str] = []
    include_databases: bool = True
    include_flash: bool = True


class BackupJobUpdate(BaseModel):
    name: str | None = None
    schedule: str | None = None
    enabled: bool | None = None
    targets: list[str] | None = None
    directories: list[str] | None = None
    exclude_patterns: list[str] | None = None
    include_databases: bool | None = None
    include_flash: bool | None = None


class BackupJobResponse(BaseModel):
    id: str
    name: str
    type: str
    schedule: str
    enabled: bool
    targets: list[str]
    directories: list[str]
    exclude_patterns: list[str]
    include_databases: bool
    include_flash: bool
    created_at: str
    updated_at: str
    last_run: dict | None = None
    next_run: str | None = None


class JobRunResponse(BaseModel):
    id: str
    job_id: str
    status: str
    trigger: str
    started_at: str
    completed_at: str | None = None
    duration_seconds: int | None = None
    databases_discovered: int = 0
    databases_dumped: int = 0
    databases_failed: int = 0
    flash_backed_up: int = 0
    flash_size_bytes: int = 0
    total_size_bytes: int = 0
    error_message: str | None = None
    targets: list[dict] = []
    databases: list[dict] = []
