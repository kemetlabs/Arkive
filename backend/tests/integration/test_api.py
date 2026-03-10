"""Tests for API endpoints."""

import pytest


@pytest.mark.asyncio
async def test_status_endpoint(client):
    """Test /api/status returns valid response."""
    response = await client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "degraded", "error")
    assert "version" in data
    assert "hostname" in data
    assert "checks" in data
