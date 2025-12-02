"""
Real-time Subscription Manager

Utilities for managing Supabase real-time subscriptions with automatic cleanup.
"""

from dataclasses import dataclass
from typing import Optional, Callable, Dict, Any
from supabase import Client


@dataclass
class SubscriptionConfig:
    """Subscription configuration."""

    channel: str  # Channel name
    table: Optional[str] = None  # Table name to subscribe to
    schema: str = "public"  # Schema name (default: 'public')
    event: str = "*"  # Event filter (INSERT, UPDATE, DELETE, or '*' for all)
    on_insert: Optional[Callable[[Dict[str, Any]], None]] = None  # Callback for INSERT events
    on_update: Optional[Callable[[Dict[str, Any]], None]] = None  # Callback for UPDATE events
    on_delete: Optional[Callable[[Dict[str, Any]], None]] = None  # Callback for DELETE events
    on_event: Optional[Callable[[str, Dict[str, Any]], None]] = None  # Callback for any event


class SubscriptionManager:
    """
    Manages Supabase real-time subscriptions with automatic cleanup.

    Example:
        ```python
        from supabase_core_python import SubscriptionManager

        manager = SubscriptionManager(supabase)

        # Subscribe to posts table
        manager.subscribe(SubscriptionConfig(
            channel="posts-changes",
            table="posts",
            on_insert=lambda payload: print(f"New post: {payload['new']}"),
            on_update=lambda payload: print(f"Updated post: {payload['new']}"),
            on_delete=lambda payload: print(f"Deleted post: {payload['old']}"),
        ))

        # Later, cleanup
        manager.unsubscribe("posts-changes")
        # Or cleanup all
        manager.cleanup()
        ```
    """

    def __init__(self, client: Client):
        """
        Initialize subscription manager.

        Args:
            client: Supabase client instance
        """
        self.client = client
        self.channels: Dict[str, Any] = {}

    def subscribe(self, config: SubscriptionConfig) -> Any:
        """
        Subscribes to real-time changes.

        Args:
            config: Subscription configuration

        Returns:
            Channel instance
        """
        # Remove existing subscription if present
        if config.channel in self.channels:
            self.unsubscribe(config.channel)

        # Create channel
        channel = self.client.channel(config.channel)

        # Subscribe to table changes if table is specified
        if config.table:
            channel = channel.on(
                "postgres_changes",
                {
                    "event": config.event,
                    "schema": config.schema,
                    "table": config.table,
                },
                lambda payload: self._handle_payload(payload, config),
            )

        # Subscribe to channel
        channel.subscribe()

        # Store channel
        self.channels[config.channel] = channel

        return channel

    def _handle_payload(
        self, payload: Dict[str, Any], config: SubscriptionConfig
    ) -> None:
        """Handle incoming payload and route to appropriate callback."""
        event_type = payload.get("eventType", "")

        # Call general event handler
        if config.on_event:
            config.on_event(event_type, payload)

        # Call specific event handlers
        if event_type == "INSERT" and config.on_insert:
            config.on_insert(payload)
        elif event_type == "UPDATE" and config.on_update:
            config.on_update(payload)
        elif event_type == "DELETE" and config.on_delete:
            config.on_delete(payload)

    def unsubscribe(self, channel_name: str) -> None:
        """
        Unsubscribes from a channel.

        Args:
            channel_name: Name of the channel to unsubscribe from
        """
        if channel_name in self.channels:
            channel = self.channels[channel_name]
            self.client.remove_channel(channel)
            del self.channels[channel_name]

    def cleanup(self) -> None:
        """Unsubscribes from all channels."""
        for channel_name in list(self.channels.keys()):
            self.unsubscribe(channel_name)

