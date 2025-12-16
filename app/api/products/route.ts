import { NextRequest } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { productQuerySchema, createProductSchema } from '@/lib/validations/product'
import { jsonResponse, handleError, checkRateLimit, getClientIp } from '@/lib/api-utils'
import { handleCorsPreflightRequest } from '@/lib/cors'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/products
 * Get all products (public endpoint - only returns active products)
 * Query params: status, category, search, page, limit, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public API
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`products:${clientIp}`, 100, 60000)

    if (!rateLimit.allowed) {
      return jsonResponse(
        request,
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        429
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    }

    // Check if this is an admin request (authenticated)
    const session = await getServerSession(authOptions)
    const isAdmin = !!session?.user

    // Validate query parameters
    const query = productQuerySchema.parse(queryParams)

    // Get products (admin sees all, public sees only active)
    const result = isAdmin
      ? await ProductService.getProducts(query)
      : await ProductService.getPublicProducts(query)

    return jsonResponse(request, {
      success: true,
      data: result,
    })
  } catch (error) {
    return handleError(request, error)
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonResponse(
        request,
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // Create product
    const product = await ProductService.createProduct(data)

    return jsonResponse(
      request,
      {
        success: true,
        data: product,
      },
      201
    )
  } catch (error) {
    return handleError(request, error)
  }
}

/**
 * OPTIONS /api/products
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request)
}
