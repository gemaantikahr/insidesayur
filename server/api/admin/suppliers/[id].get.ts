import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')

  const supplier = await prisma.supplier.findUnique({
    where: { id }
  })

  if (!supplier) {
    throw createError({
      statusCode: 404,
      message: 'Supplier not found'
    })
  }

  return supplier
})
