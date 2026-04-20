import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const deliveries = await prisma.delivery.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      sequence: 'asc'
    }
  })
  
  return deliveries
})
