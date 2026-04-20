import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.method
  const idStr = getRouterParam(event, 'id')
  const id = parseInt(idStr || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const delivery = await prisma.delivery.findUnique({
    where: { id }
  })

  if (!delivery) {
    throw createError({ statusCode: 404, statusMessage: 'Delivery option not found' })
  }

  if (method === 'GET') {
    return delivery
  }

  if (method === 'PUT') {
    const body = await readBody(event)

    if (!body.label) {
      throw createError({ statusCode: 400, statusMessage: 'Label is required' })
    }

    if (body.price === undefined || body.price === null || body.price === '') {
      throw createError({ statusCode: 400, statusMessage: 'Price is required' })
    }

    try {
      const updatedDelivery = await prisma.delivery.update({
        where: { id },
        data: {
          label: body.label,
          strikeoutPrice: body.strikeoutPrice ? Number(body.strikeoutPrice) : null,
          price: Number(body.price),
          sequence: Number(body.sequence || 0),
          isActive: Boolean(body.isActive ?? true)
        }
      })
      return updatedDelivery
    } catch (error: any) {
      console.error('Error updating delivery:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to update delivery option' })
    }
  }

  if (method === 'DELETE') {
    await prisma.delivery.delete({
      where: { id }
    })

    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
