import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const categoryId = query.category ? parseInt(query.category as string) : undefined
  const search = (query.search as string) || ''

  const where: any = {
    isActive: true,
  }

  if (categoryId) {
    where.productCategoryId = categoryId
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { sequence: 'asc' },
      },
      units: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return products
})
