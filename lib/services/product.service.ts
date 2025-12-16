import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from '@/lib/validations/product'

export class ProductService {
  /**
   * Get all products with filtering, pagination, and sorting
   */
  static async getProducts(query: ProductQueryInput) {
    const { status, category, search, page, limit, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.ProductWhereInput = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive',
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products: products.map(this.serializeProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      },
    }
  }

  /**
   * Get products for public display (only active products)
   */
  static async getPublicProducts(query: Omit<ProductQueryInput, 'status'>) {
    return this.getProducts({ ...query, status: 'active' })
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return null
    }

    return this.serializeProduct(product)
  }

  /**
   * Get a single active product by ID (for public access)
   */
  static async getPublicProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id, status: 'active' },
    })

    if (!product) {
      return null
    }

    return this.serializeProduct(product)
  }

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductInput) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        costPrice: data.costPrice ?? null,
        category: data.category ?? null,
        stock: data.stock,
        status: data.status,
        images: data.images,
      },
    })

    return this.serializeProduct(product)
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, data: UpdateProductInput) {
    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return null
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.images !== undefined && { images: data.images }),
      },
    })

    return this.serializeProduct(product)
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string) {
    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return false
    }

    await prisma.product.delete({ where: { id } })
    return true
  }

  /**
   * Get all unique categories
   */
  static async getCategories() {
    const products = await prisma.product.findMany({
      where: { status: 'active', category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    })

    return products
      .map((p) => p.category)
      .filter((c): c is string => c !== null)
  }

  /**
   * Serialize product for API response (convert Decimal to number)
   */
  private static serializeProduct(product: {
    id: string
    name: string
    description: string | null
    price: Prisma.Decimal
    costPrice: Prisma.Decimal | null
    images: string[]
    category: string | null
    stock: number
    status: string
    createdAt: Date
    updatedAt: Date
  }) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      images: product.images,
      category: product.category,
      stock: product.stock,
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }
  }
}
