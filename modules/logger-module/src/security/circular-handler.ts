/**
 * Circular reference handling for safe object serialization.
 * 
 * Prevents "Converting circular structure to JSON" errors when
 * logging complex objects with circular references.
 */

/**
 * Safely serializes an object, handling circular references.
 * 
 * @param obj - Object to serialize
 * @param maxDepth - Maximum depth to serialize (default: 10)
 * @returns Serialized object or string representation
 */
export function safeSerialize(
  obj: unknown,
  maxDepth: number = 10
): unknown {
  const seen = new WeakSet();
  
  function serialize(value: unknown, depth: number = 0): unknown {
    if (depth > maxDepth) {
      return '[Max Depth Reached]';
    }
    
    if (value === null || value === undefined) {
      return value;
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    
    if (Array.isArray(value)) {
      return value.map(item => serialize(item, depth + 1));
    }
    
    if (typeof value === 'object') {
      // Check for circular reference
      if (seen.has(value as object)) {
        return '[Circular Reference]';
      }
      
      seen.add(value as object);
      
      try {
        const serialized: Record<string, unknown> = {};
        
        for (const [key, val] of Object.entries(value)) {
          try {
            serialized[key] = serialize(val, depth + 1);
          } catch (err) {
            serialized[key] = `[Serialization Error: ${err instanceof Error ? err.message : String(err)}]`;
          }
        }
        
        seen.delete(value as object);
        return serialized;
      } catch (err) {
        seen.delete(value as object);
        return `[Serialization Error: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }
    
    // Fallback for other types
    try {
      return String(value);
    } catch {
      return '[Unable to Serialize]';
    }
  }
  
  return serialize(obj);
}

/**
 * Converts an object to a JSON string, handling circular references.
 * 
 * @param obj - Object to stringify
 * @param space - Indentation space (default: 2)
 * @returns JSON string
 */
export function safeStringify(
  obj: unknown,
  space: number = 2
): string {
  try {
    const serialized = safeSerialize(obj);
    return JSON.stringify(serialized, null, space);
  } catch (err) {
    return `[Stringify Error: ${err instanceof Error ? err.message : String(err)}]`;
  }
}

