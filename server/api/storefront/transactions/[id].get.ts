import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction ID is required' })
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      delivery: true,
      items: {
        include: {
          product: true,
          unit: true,
          package: true
        }
      }
    }
  })

  if (!transaction) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return transaction
})
