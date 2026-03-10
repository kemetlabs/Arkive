"""Tests for app.utils.subprocess_runner."""

import sys

import pytest

from app.utils.subprocess_runner import run_command


@pytest.mark.asyncio
async def test_run_command_passes_input_data_to_stdin():
    """input_data should be delivered to the subprocess stdin pipe."""
    result = await run_command(
        [
            sys.executable,
            "-c",
            "import sys; data=sys.stdin.read(); print(data, end='')",
        ],
        input_data="hello-stdin\n",
        timeout=10,
    )

    assert result.returncode == 0
    assert result.stdout == "hello-stdin\n"
