/**
 * Base class for custom transport plugins.
 * 
 * Allows extending the logger with custom transport destinations.
 */

import type { LogEntry } from '../types/logger';

/**
 * Base interface for transport plugins.
 */
export interface TransportPlugin {
  /**
   * Name of the transport.
   */
  name: string;

  /**
   * Initializes the transport.
   */
  initialize?(): Promise<void> | void;

  /**
   * Writes a log entry.
   */
  write(entry: LogEntry): Promise<void> | void;

  /**
   * Flushes any buffered entries.
   */
  flush?(): Promise<void> | void;

  /**
   * Closes the transport.
   */
  close?(): Promise<void> | void;
}

/**
 * Transport plugin registry.
 */
class TransportRegistry {
  private transports: Map<string, TransportPlugin> = new Map();

  /**
   * Registers a transport plugin.
   */
  register(transport: TransportPlugin): void {
    this.transports.set(transport.name, transport);
  }

  /**
   * Gets a transport by name.
   */
  get(name: string): TransportPlugin | undefined {
    return this.transports.get(name);
  }

  /**
   * Gets all registered transports.
   */
  getAll(): TransportPlugin[] {
    return Array.from(this.transports.values());
  }

  /**
   * Unregisters a transport.
   */
  unregister(name: string): void {
    this.transports.delete(name);
  }
}

// Singleton registry
let registry: TransportRegistry | null = null;

/**
 * Gets the transport registry.
 */
export function getTransportRegistry(): TransportRegistry {
  if (!registry) {
    registry = new TransportRegistry();
  }
  return registry;
}

/**
 * Registers a custom transport plugin.
 */
export function registerTransport(transport: TransportPlugin): void {
  getTransportRegistry().register(transport);
}

