import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const transactions = await prisma.transaction.findMany({
    include: {
      delivery: true,
      items: {
        include: {
          product: true,
          unit: true,
          package: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return transactions
})
