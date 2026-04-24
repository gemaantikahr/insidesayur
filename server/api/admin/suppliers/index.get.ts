import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return suppliers
})
