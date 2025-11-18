import { AppError, Result, ok, err } from './index';

// ... (existing imports)

/**
 * Circuit Breaker State
 */
enum CircuitState {
  CLOSED,   // Normal operation
  OPEN,     // Failing, reject immediately
  HALF_OPEN // Testing if service is back
}

/**
 * Advanced Error Handling: Circuit Breaker
 * Prevents cascading failures by stopping calls to a failing service.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  
  constructor(
    private failureThreshold: number = 5, 
    private resetTimeout: number = 10000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit Breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      if (this.state === CircuitState.HALF_OPEN) {
        this.reset();
      }
      return result;
    } catch (e) {
      this.recordFailure();
      throw e;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private reset() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
}

