import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Custom API error class for consistent error handling
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message: string = 'Bad request') {
    return new ApiError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Not found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'Conflict') {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string;
  code: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Handle API errors and return consistent response
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp,
      },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  logger.error('Unexpected API error', error);

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string };
    
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this data already exists',
          code: 'DUPLICATE_ENTRY',
          statusCode: 409,
          timestamp,
        },
        { status: 409 }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
          statusCode: 404,
          timestamp,
        },
        { status: 404 }
      );
    }
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp,
    },
    { status: 500 }
  );
}

/**
 * Success response helper
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
