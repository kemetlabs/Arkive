"""Unit tests for subprocess cancellation behavior."""

import asyncio

import pytest

from app.utils.subprocess_runner import run_command


@pytest.mark.asyncio
async def test_run_command_can_be_cancelled():
    """run_command should kill a long-running subprocess when cancel_check flips true."""
    cancel_state = {"stop": False}

    async def trigger_cancel():
        await asyncio.sleep(0.2)
        cancel_state["stop"] = True

    cancel_task = asyncio.create_task(trigger_cancel())
    try:
        result = await run_command(
            ["python3", "-c", "import time; time.sleep(10)"],
            timeout=30,
            cancel_check=lambda: cancel_state["stop"],
            cancel_poll_interval=0.05,
        )
    finally:
        await cancel_task

    assert result.returncode == -2
    assert result.stderr == "Command cancelled"
