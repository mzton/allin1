import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@allin1.com' },
    update: {},
    create: {
      email: 'admin@allin1.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('Created admin user:', admin.email)

  // Create some sample products
  const products = [
    {
      name: 'Ceramic Minimalist Vase',
      description: 'Hand-thrown ceramic vase with a matte finish. Perfect for dried stems or fresh flowers.',
      price: 48,
      category: 'Home Decor',
      stock: 25,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=10'],
    },
    {
      name: 'Linen Lounge Chair',
      description: 'A low-profile lounge chair upholstered in premium breathable linen. Designed for ultimate relaxation.',
      price: 350,
      category: 'Furniture',
      stock: 10,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=11'],
    },
    {
      name: 'Analog Desk Clock',
      description: 'Silent movement analog clock with a solid oak frame. A timeless addition to any workspace.',
      price: 85,
      category: 'Workspace',
      stock: 30,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=12'],
    },
    {
      name: 'Matte Black Lamp',
      description: 'Adjustable desk lamp with a sleek matte black finish. Provides warm, focused lighting.',
      price: 120,
      category: 'Lighting',
      stock: 15,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=13'],
    },
    {
      name: 'Wool Throw Blanket',
      description: '100% Merino wool throw. Soft, warm, and lightweight. Perfect for chilly evenings.',
      price: 110,
      category: 'Textiles',
      stock: 20,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=14'],
    },
    {
      name: 'Abstract Wall Art',
      description: 'Original abstract print on archival paper. Framed in natural wood.',
      price: 195,
      category: 'Art',
      stock: 8,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=15'],
    },
    {
      name: 'Oak Coffee Table',
      description: 'Solid oak coffee table with rounded edges. Minimalist design that fits any living room.',
      price: 420,
      category: 'Furniture',
      stock: 5,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=16'],
    },
    {
      name: 'Glass Water Carafe',
      description: 'Hand-blown glass carafe with a cork stopper. Elegant hydration for your desk or bedside.',
      price: 35,
      category: 'Kitchen',
      stock: 40,
      status: 'active',
      images: ['https://picsum.photos/600/800?random=17'],
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: product,
      create: product,
    })
  }

  console.log(`Seeded ${products.length} products`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
