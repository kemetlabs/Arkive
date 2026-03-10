"""
Extended integration tests for the /api/status endpoint.

Tests:
- Response includes `next_backup` field
- `next_backup` is None when no scheduler or no jobs
- `next_backup` returns an ISO string when scheduler has jobs
"""
from unittest.mock import MagicMock

import aiosqlite
import pytest

pytestmark = pytest.mark.asyncio


async def test_status_includes_next_backup_field(client):
    """GET /api/status always includes `next_backup` key in response."""
    resp = await client.get("/api/status")
    assert resp.status_code == 200
    body = resp.json()
    assert "next_backup" in body


async def test_next_backup_is_none_when_no_scheduler(client):
    """next_backup is None when app.state.scheduler is None (test default)."""
    # The conftest fixture sets scheduler = None
    resp = await client.get("/api/status")
    assert resp.status_code == 200
    assert resp.json()["next_backup"] is None


async def test_next_backup_is_none_when_no_jobs(client):
    """next_backup is None when scheduler exists but has no jobs."""
    mock_scheduler = MagicMock()
    mock_scheduler.get_all_next_runs.return_value = {}

    # Inject the mock scheduler into app state
    transport = client._transport
    app = transport.app
    app.state.scheduler = mock_scheduler

    try:
        resp = await client.get("/api/status")
        assert resp.status_code == 200
        assert resp.json()["next_backup"] is None
    finally:
        app.state.scheduler = None


async def test_next_backup_returns_soonest_iso_string(client):
    """next_backup returns the soonest ISO timestamp when scheduler has jobs."""
    mock_scheduler = MagicMock()
    mock_scheduler.get_all_next_runs.return_value = {
        "job1": "2026-03-02T06:00:00",
        "job2": "2026-03-01T18:00:00",  # soonest
        "job3": "2026-03-03T07:00:00",
    }

    transport = client._transport
    app = transport.app
    app.state.scheduler = mock_scheduler

    try:
        resp = await client.get("/api/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["next_backup"] == "2026-03-01T18:00:00"
    finally:
        app.state.scheduler = None


async def test_next_backup_handles_scheduler_exception(client):
    """next_backup is None if scheduler.get_all_next_runs() raises."""
    mock_scheduler = MagicMock()
    mock_scheduler.get_all_next_runs.side_effect = RuntimeError("scheduler error")

    transport = client._transport
    app = transport.app
    app.state.scheduler = mock_scheduler

    try:
        resp = await client.get("/api/status")
        assert resp.status_code == 200
        assert resp.json()["next_backup"] is None
    finally:
        app.state.scheduler = None


async def test_status_platform_falls_back_to_live_runtime_when_setting_missing(client):
    """Status should report live runtime platform even if settings.platform is absent."""
    transport = client._transport
    app = transport.app

    async with aiosqlite.connect(app.state.config.db_path) as db:
        await db.execute("DELETE FROM settings WHERE key = 'platform'")
        await db.commit()

    resp = await client.get("/api/status")
    assert resp.status_code == 200
    expected_platform = app.state.platform if isinstance(app.state.platform, str) else app.state.platform.value
    assert resp.json()["platform"] == expected_platform
