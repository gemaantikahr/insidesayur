import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { status, search, startDate, endDate } = query

  const where: any = {}

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search as string, mode: 'insensitive' } },
      { customerPhone: { contains: search as string } },
      { id: { contains: search as string } }
    ]
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string)
    }
    if (endDate) {
      const end = new Date(endDate as string)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
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
