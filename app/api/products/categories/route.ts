import { NextRequest } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { jsonResponse, handleError, checkRateLimit, getClientIp } from '@/lib/api-utils'
import { handleCorsPreflightRequest } from '@/lib/cors'

/**
 * GET /api/products/categories
 * Get all unique product categories
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`categories:${clientIp}`, 100, 60000)

    if (!rateLimit.allowed) {
      return jsonResponse(
        request,
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        429
      )
    }

    const categories = await ProductService.getCategories()

    return jsonResponse(request, {
      success: true,
      data: categories,
    })
  } catch (error) {
    return handleError(request, error)
  }
}

/**
 * OPTIONS /api/products/categories
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request)
}
