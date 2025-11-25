/**
 * Real-time Event Handlers
 * 
 * Common event handler patterns for Supabase real-time subscriptions.
 * 
 * Dependencies: @supabase/supabase-js
 */

/**
 * Postgres change event payload.
 */
export interface PostgresChangePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
  schema: string
  table: string
}

/**
 * Generic event handler function type.
 */
export type EventHandler<T = any> = (payload: PostgresChangePayload<T>) => void

/**
 * Creates an event handler that filters by specific columns.
 * 
 * @param columns - Column names to watch for changes
 * @param handler - Handler function
 * @returns Filtered event handler
 * 
 * @example
 * ```typescript
 * const handler = createFilteredHandler(['status', 'priority'], (payload) => {
 *   console.log('Status or priority changed:', payload.new)
 * })
 * ```
 */
export function createFilteredHandler<T = any>(
  columns: string[],
  handler: EventHandler<T>
): EventHandler<T> {
  return (payload: PostgresChangePayload<T>) => {
    if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
      // Check if any watched columns changed
      const hasChanges = columns.some(
        (col) => (payload.old as any)?.[col] !== (payload.new as any)?.[col]
      )

      if (hasChanges) {
        handler(payload)
      }
    } else {
      // INSERT or DELETE - always call handler
      handler(payload)
    }
  }
}

/**
 * Creates an event handler that debounces rapid changes.
 * Useful for avoiding too many updates in quick succession.
 * 
 * @param handler - Handler function
 * @param delayMs - Debounce delay in milliseconds
 * @returns Debounced event handler
 * 
 * @example
 * ```typescript
 * const handler = createDebouncedHandler((payload) => {
 *   console.log('Change detected:', payload.new)
 * }, 500) // Wait 500ms after last change
 * ```
 */
export function createDebouncedHandler<T = any>(
  handler: EventHandler<T>,
  delayMs: number = 300
): EventHandler<T> {
  let timeoutId: NodeJS.Timeout | null = null

  return (payload: PostgresChangePayload<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      handler(payload)
      timeoutId = null
    }, delayMs)
  }
}

/**
 * Creates an event handler that only processes events matching a condition.
 * 
 * @param condition - Function that returns true if event should be processed
 * @param handler - Handler function
 * @returns Conditional event handler
 * 
 * @example
 * ```typescript
 * const handler = createConditionalHandler(
 *   (payload) => payload.new?.status === 'published',
 *   (payload) => {
 *     console.log('New published post:', payload.new)
 *   }
 * )
 * ```
 */
export function createConditionalHandler<T = any>(
  condition: (payload: PostgresChangePayload<T>) => boolean,
  handler: EventHandler<T>
): EventHandler<T> {
  return (payload: PostgresChangePayload<T>) => {
    if (condition(payload)) {
      handler(payload)
    }
  }
}

