import { z } from 'zod'

// Schema for creating a product
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .max(9999999.99, 'Price is too high'),
  costPrice: z
    .number()
    .positive('Cost price must be greater than 0')
    .max(9999999.99, 'Cost price is too high')
    .optional()
    .nullable(),
  category: z
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional()
    .nullable(),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .default(0),
  status: z.enum(['draft', 'active']).default('draft'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
})

// Schema for updating a product (all fields optional except what's being updated)
export const updateProductSchema = createProductSchema.partial()

// Schema for query parameters
export const productQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'all']).optional().default('all'),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['name', 'price', 'createdAt', 'stock']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
