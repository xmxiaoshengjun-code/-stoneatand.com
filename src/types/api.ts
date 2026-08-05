/**
 * API response and request types.
 */

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

/**
 * Creates a success API response.
 */
export function successResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
  return { code: API_STATUS_CODES.OK, data, message };
}

/**
 * Creates a created API response.
 */
export function createdResponse<T>(data: T, message = 'Created'): ApiResponse<T> {
  return { code: API_STATUS_CODES.CREATED, data, message };
}

/**
 * Creates an error API response.
 */
export function errorResponse(code: number, message: string, details?: Record<string, string[]>): ApiError {
  return { code, message, details };
}
