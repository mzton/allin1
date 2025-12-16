import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Next.js dev server
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]

// Add production origins from environment
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','))
}

export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  const isAllowed = origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

export function corsResponse(request: NextRequest, response: NextResponse) {
  const corsHeaders = getCorsHeaders(request)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function handleCorsPreflightRequest(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
