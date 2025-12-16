import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getCorsHeaders } from './cors'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse<T>(
  request: NextRequest,
  data: ApiResponse<T>,
  status: number = 200
) {
  const response = NextResponse.json(data, { status })
  const corsHeaders = getCorsHeaders(request)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(request: NextRequest, error: ZodError) {
  const errors: Record<string, string[]> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })

  return jsonResponse(
    request,
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    400
  )
}

/**
 * Handle generic errors
 */
export function handleError(request: NextRequest, error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return handleValidationError(request, error)
  }

  const message = error instanceof Error ? error.message : 'Internal server error'
  return jsonResponse(
    request,
    {
      success: false,
      error: message,
    },
    500
  )
}

/**
 * Rate limiting map (simple in-memory implementation)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
