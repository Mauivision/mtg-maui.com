/**
 * API Route Middleware Utilities
 * Provides logging and performance tracking for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Wraps an API route handler with logging and error handling
 */
export function withLogging<T>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Log request
      logger.apiRequest(method, path, {
        query: Object.fromEntries(url.searchParams),
      });

      // Execute handler
      const response = await handler(request, context);

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log response
      logger.apiResponse(method, path, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`API ${method} ${path} failed`, error, { duration });
      throw error;
    }
  };
}

/**
 * Measures execution time of an async function
 */
export async function measureTime<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    logger.performance(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Operation "${operation}" failed`, error, { duration });
    throw error;
  }
}
