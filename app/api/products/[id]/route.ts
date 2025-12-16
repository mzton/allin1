import { NextRequest } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { updateProductSchema } from '@/lib/validations/product'
import { jsonResponse, handleError, checkRateLimit, getClientIp } from '@/lib/api-utils'
import { handleCorsPreflightRequest } from '@/lib/cors'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`product:${clientIp}`, 200, 60000)

    if (!rateLimit.allowed) {
      return jsonResponse(
        request,
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        429
      )
    }

    // Check if admin (can see draft products)
    const session = await getServerSession(authOptions)
    const isAdmin = !!session?.user

    const product = isAdmin
      ? await ProductService.getProductById(id)
      : await ProductService.getPublicProductById(id)

    if (!product) {
      return jsonResponse(
        request,
        { success: false, error: 'Product not found' },
        404
      )
    }

    return jsonResponse(request, {
      success: true,
      data: product,
    })
  } catch (error) {
    return handleError(request, error)
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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
    const data = updateProductSchema.parse(body)

    // Update product
    const product = await ProductService.updateProduct(id, data)

    if (!product) {
      return jsonResponse(
        request,
        { success: false, error: 'Product not found' },
        404
      )
    }

    return jsonResponse(request, {
      success: true,
      data: product,
    })
  } catch (error) {
    return handleError(request, error)
  }
}

/**
 * PATCH /api/products/[id]
 * Partially update a product (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params })
}

/**
 * DELETE /api/products/[id]
 * Delete a product (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonResponse(
        request,
        { success: false, error: 'Unauthorized' },
        401
      )
    }

    const deleted = await ProductService.deleteProduct(id)

    if (!deleted) {
      return jsonResponse(
        request,
        { success: false, error: 'Product not found' },
        404
      )
    }

    return jsonResponse(request, {
      success: true,
      data: { message: 'Product deleted successfully' },
    })
  } catch (error) {
    return handleError(request, error)
  }
}

/**
 * OPTIONS /api/products/[id]
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request)
}
