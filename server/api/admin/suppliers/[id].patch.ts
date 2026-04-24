import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: body.name,
      googleMapsUrl: body.googleMapsUrl || null,
      phoneNumber: body.phoneNumber,
      isActive: body.isActive
    }
  })

  return supplier
})
