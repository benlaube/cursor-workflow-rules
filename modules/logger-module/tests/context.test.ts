/**
 * Context propagation tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setLogContext,
  getLogContext,
  clearLogContext,
  withLogContext,
  withLogContextAsync,
} from '../src/context';

describe('Context Management', () => {
  beforeEach(() => {
    clearLogContext();
  });

  it('should set and get context', () => {
    setLogContext({
      source: 'user',
      action: 'test',
      component: 'backend',
    });

    const context = getLogContext();
    expect(context?.source).toBe('user');
    expect(context?.action).toBe('test');
    expect(context?.component).toBe('backend');
  });

  it('should merge context', () => {
    setLogContext({ source: 'user' });
    setLogContext({ action: 'test' });

    const context = getLogContext();
    expect(context?.source).toBe('user');
    expect(context?.action).toBe('test');
  });

  it('should clear context', () => {
    setLogContext({ source: 'user' });
    clearLogContext();

    const context = getLogContext();
    expect(context).toBeUndefined();
  });

  it('should scope context with withLogContext', () => {
    setLogContext({ source: 'user' });

    const result = withLogContext({ action: 'test' }, () => {
      const context = getLogContext();
      expect(context?.source).toBe('user');
      expect(context?.action).toBe('test');
      return 'result';
    });

    expect(result).toBe('result');

    // Context should be restored
    const context = getLogContext();
    expect(context?.source).toBe('user');
    expect(context?.action).toBeUndefined();
  });

  it('should scope context with withLogContextAsync', async () => {
    setLogContext({ source: 'user' });

    const result = await withLogContextAsync({ action: 'test' }, async () => {
      const context = getLogContext();
      expect(context?.source).toBe('user');
      expect(context?.action).toBe('test');
      return Promise.resolve('result');
    });

    expect(result).toBe('result');

    // Context should be restored
    const context = getLogContext();
    expect(context?.source).toBe('user');
    expect(context?.action).toBeUndefined();
  });
});

