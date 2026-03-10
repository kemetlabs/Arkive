"""In-memory async pub/sub for SSE event streaming."""

import asyncio
import logging
from typing import Any

logger = logging.getLogger("arkive.events")


class EventBus:
    """In-memory async pub/sub for SSE event streaming."""

    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        """Create a new subscriber queue."""
        q: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=100)
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        """Remove a subscriber queue."""
        try:
            self._subscribers.remove(q)
        except ValueError:
            pass

    async def publish(self, event_type: str, data: dict[str, Any]) -> None:
        """Publish an event to all subscribers. Drop for slow consumers."""
        for q in self._subscribers:
            try:
                q.put_nowait({"event": event_type, "data": data})
            except asyncio.QueueFull:
                logger.warning("Dropping event %s for slow consumer", event_type)
