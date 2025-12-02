/**
 * Real-time Subscription Manager
 * 
 * Utilities for managing Supabase real-time subscriptions with automatic cleanup.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Subscription configuration.
 */
export interface SubscriptionConfig {
  /** Channel name */
  channel: string
  /** Table name to subscribe to */
  table?: string
  /** Schema name (default: 'public') */
  schema?: string
  /** Event filter (INSERT, UPDATE, DELETE, or '*' for all) */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  /** Callback for INSERT events */
  onInsert?: (payload: any) => void
  /** Callback for UPDATE events */
  onUpdate?: (payload: any) => void
  /** Callback for DELETE events */
  onDelete?: (payload: any) => void
  /** Callback for any event */
  onEvent?: (event: string, payload: any) => void
}

/**
 * Manages Supabase real-time subscriptions with automatic cleanup.
 * 
 * @example
 * ```typescript
 * const manager = new SubscriptionManager(supabase)
 * 
 * // Subscribe to posts table
 * manager.subscribe({
 *   channel: 'posts-changes',
 *   table: 'posts',
 *   onInsert: (payload) => console.log('New post:', payload.new),
 *   onUpdate: (payload) => console.log('Updated post:', payload.new),
 *   onDelete: (payload) => console.log('Deleted post:', payload.old),
 * })
 * 
 * // Later, cleanup
 * manager.unsubscribe('posts-changes')
 * // Or cleanup all
 * manager.cleanup()
 * ```
 */
export class SubscriptionManager {
  private supabase: SupabaseClient<Database>
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Subscribes to real-time changes.
   * 
   * @param config - Subscription configuration
   * @returns Channel instance
   */
  subscribe(config: SubscriptionConfig): RealtimeChannel {
    const { channel, table, schema = 'public', event = '*', onInsert, onUpdate, onDelete, onEvent } = config

    // Remove existing subscription if present
    if (this.channels.has(channel)) {
      this.unsubscribe(channel)
    }

    let channelBuilder = this.supabase.channel(channel)

    // Subscribe to table changes if table is specified
    if (table) {
      channelBuilder = channelBuilder.on(
        'postgres_changes',
        {
          event: event as any,
          schema,
          table,
        },
        (payload) => {
          if (onEvent) {
            onEvent(payload.eventType, payload)
          }

          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload)
              break
            case 'UPDATE':
              if (onUpdate) onUpdate(payload)
              break
            case 'DELETE':
              if (onDelete) onDelete(payload)
              break
          }
        }
      )
    }

    const channelInstance = channelBuilder.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to channel: ${channel}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to channel: ${channel}`)
      }
    })

    this.channels.set(channel, channelInstance)
    return channelInstance
  }

  /**
   * Unsubscribes from a specific channel.
   * 
   * @param channel - Channel name
   */
  unsubscribe(channel: string): void {
    const channelInstance = this.channels.get(channel)
    if (channelInstance) {
      this.supabase.removeChannel(channelInstance)
      this.channels.delete(channel)
      console.log(`Unsubscribed from channel: ${channel}`)
    }
  }

  /**
   * Unsubscribes from all channels and cleans up.
   */
  cleanup(): void {
    for (const [channel] of this.channels) {
      this.unsubscribe(channel)
    }
  }

  /**
   * Gets all active channel names.
   * 
   * @returns Array of channel names
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }
}

/**
 * Creates a new subscription manager instance.
 * 
 * @param supabase - Supabase client instance
 * @returns Subscription manager
 * 
 * @example
 * ```typescript
 * const manager = createSubscriptionManager(supabase)
 * manager.subscribe({ channel: 'posts', table: 'posts', onInsert: handleNewPost })
 * ```
 */
export function createSubscriptionManager(supabase: SupabaseClient<Database>): SubscriptionManager {
  return new SubscriptionManager(supabase)
}

