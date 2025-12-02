/**
 * Security utilities tests.
 */

import { describe, it, expect } from 'vitest';
import {
  scrubPII,
  scrubObject,
  sanitizeError,
  safeSerialize,
} from '../src/security';

describe('Security Utilities', () => {
  it('should scrub email addresses', () => {
    const text = 'Contact user@example.com for details';
    const scrubbed = scrubPII(text);
    expect(scrubbed).toContain('[REDACTED]');
    expect(scrubbed).not.toContain('user@example.com');
  });

  it('should scrub phone numbers', () => {
    const text = 'Call 555-123-4567';
    const scrubbed = scrubPII(text);
    expect(scrubbed).toContain('[REDACTED]');
  });

  it('should scrub objects recursively', () => {
    const obj = {
      email: 'user@example.com',
      phone: '555-123-4567',
      nested: {
        password: 'secret123',
      },
    };

    const scrubbed = scrubObject(obj, [], ['password', 'email']);
    expect(scrubbed).toHaveProperty('email', '[REDACTED]');
    expect(scrubbed).toHaveProperty('nested');
    expect((scrubbed as any).nested).toHaveProperty('password', '[REDACTED]');
  });

  it('should sanitize errors', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at /Users/test/file.ts:10:20';

    const sanitized = sanitizeError(error, true);
    expect(sanitized.message).toBe('Test error');
    expect(sanitized.stack).not.toContain('/Users/test');
  });

  it('should handle circular references', () => {
    const obj: any = { name: 'test' };
    obj.self = obj;

    const serialized = safeSerialize(obj);
    expect(serialized).toHaveProperty('name', 'test');
    expect(serialized).toHaveProperty('self', '[Circular Reference]');
  });
});

