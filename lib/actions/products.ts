'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id }
  })
}

export async function createProduct(formData: FormData) {
  // Get all images from formData
  const images = formData.getAll('images') as string[]

  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    costPrice: formData.get('costPrice')
      ? parseFloat(formData.get('costPrice') as string)
      : null,
    category: formData.get('category') as string,
    stock: parseInt(formData.get('stock') as string) || 0,
    status: formData.get('status') as string || 'draft',
    images: images
  }

  await prisma.product.create({ data })
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function updateProduct(id: string, formData: FormData) {
  const images = formData.getAll('images') as string[]
  
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    costPrice: formData.get('costPrice')
      ? parseFloat(formData.get('costPrice') as string)
      : null,
    category: formData.get('category') as string,
    stock: parseInt(formData.get('stock') as string) || 0,
    status: formData.get('status') as string,
    // Only update images if any are provided (checked implementation in form always sends current state)
    images: images
  }

  await prisma.product.update({
    where: { id },
    data
  })
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
  revalidatePath('/')
}
