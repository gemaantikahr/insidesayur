import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { sequence: 'asc' },
  })

  return categories
})
