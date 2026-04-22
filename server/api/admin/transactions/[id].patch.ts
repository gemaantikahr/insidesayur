import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction ID is required' })
  }

  const body = await readBody(event)
  const { status } = body

  if (!status) {
    throw createError({ statusCode: 400, statusMessage: 'Status is required' })
  }

  const validStatuses = ['PENDING', 'CANCELLED', 'IN_PREPARE', 'WAITING_FOR_DRIVER', 'IN_DELIVERY', 'COMPLETED']
  if (!validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: { status },
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

  return transaction
})
