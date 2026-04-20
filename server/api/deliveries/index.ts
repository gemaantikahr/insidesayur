import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const deliveries = await prisma.delivery.findMany({
      orderBy: {
        sequence: 'asc'
      }
    })
    return deliveries
  }

  if (method === 'POST') {
    // Add authentication check here if needed
    const body = await readBody(event)
    
    const delivery = await prisma.delivery.create({
      data: {
        label: body.label,
        strikeoutPrice: body.strikeoutPrice ? Number(body.strikeoutPrice) : null,
        price: Number(body.price),
        sequence: Number(body.sequence || 0),
        isActive: Boolean(body.isActive ?? true)
      }
    })
    
    return delivery
  }
})
