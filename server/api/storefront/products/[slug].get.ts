import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sequence: 'asc' },
      },
      units: true,
      packages: true,
    },
  })

  if (!product || !product.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return product
})
