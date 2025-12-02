import { vi, type Mock } from 'vitest';

/**
 * A robust Mock Supabase Client that mimics the chainable API.
 * Allows setting return values for specific query chains.
 */
export class SupabaseMock {
  public from: Mock;
  public select: Mock;
  public insert: Mock;
  public update: Mock;
  public delete: Mock;
  public eq: Mock;
  public single: Mock;
  public order: Mock;

  constructor() {
    this.single = vi.fn();
    this.order = vi.fn().mockReturnThis();
    this.eq = vi.fn().mockReturnThis();
    
    // Terminal operations (return data)
    this.select = vi.fn().mockReturnValue({
      eq: this.eq,
      single: this.single,
      order: this.order,
      data: [],
      error: null
    });

    this.insert = vi.fn().mockResolvedValue({ data: null, error: null });
    this.update = vi.fn().mockResolvedValue({ data: null, error: null });
    this.delete = vi.fn().mockResolvedValue({ data: null, error: null });

    // Entry point
    this.from = vi.fn().mockReturnValue({
      select: this.select,
      insert: this.insert,
      update: this.update,
      delete: this.delete
    });
  }

  /**
   * Helper to mock a successful database response for a specific table.
   */
  mockSuccess(data: any) {
    this.select.mockReturnValue({
      eq: this.eq,
      order: this.order,
      single: vi.fn().mockResolvedValue({ data, error: null }),
      data,
      error: null,
      then: (resolve: any) => resolve({ data, error: null }) // Make it awaitable
    });
  }

  /**
   * Helper to mock a database error.
   */
  mockError(message: string) {
    const errorResponse = { data: null, error: { message } };
    this.select.mockReturnValue({
      eq: this.eq,
      order: this.order,
      single: vi.fn().mockResolvedValue(errorResponse),
      ...errorResponse,
      then: (resolve: any) => resolve(errorResponse)
    });
  }
}

export const createMockSupabase = () => new SupabaseMock();

/**
 * Creates a mock logger for testing.
 * 
 * Provides Vitest mock functions for all logger methods.
 * 
 * @returns Mock logger instance
 * 
 * @example
 * ```typescript
 * const mockLogger = createMockLogger();
 * const service = new UserService(mockLogger);
 * 
 * service.login('user-1');
 * 
 * expect(mockLogger.info).toHaveBeenCalledWith('User logged in');
 * ```
 */
export function createMockLogger() {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    userAction: vi.fn(),
    notice: vi.fn(),
    success: vi.fn(),
    failure: vi.fn(),
    child: vi.fn().mockReturnThis(),
    getPinoLogger: vi.fn().mockReturnValue({}),
    shutdown: vi.fn().mockResolvedValue(undefined),
  };
}
