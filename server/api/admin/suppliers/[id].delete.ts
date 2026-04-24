import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')

  await prisma.supplier.delete({
    where: { id }
  })

  return { success: true }
})
