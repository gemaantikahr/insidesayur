import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        googleMapsUrl: body.googleMapsUrl || null,
        phoneNumber: body.phoneNumber,
        isActive: body.isActive ?? true
      }
    })

    return supplier
  } catch (error: any) {
    console.error('Error creating supplier:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create supplier'
    })
  }
})
