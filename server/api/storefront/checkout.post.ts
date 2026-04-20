import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customer, cart, selectedDeliveryId, totalAmount } = body

  if (!customer.name || !customer.phone || !customer.address || !selectedDeliveryId || !cart || cart.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid checkout data' })
  }

  // Get delivery option details
  const delivery = await prisma.delivery.findUnique({
    where: { id: selectedDeliveryId }
  })

  if (!delivery) {
    throw createError({ statusCode: 400, statusMessage: 'Delivery option not found' })
  }

  // Map cart items to TransactionItem structure
  const transactionItems = cart.map((item: any) => ({
    productId: item.product.id,
    unitId: item.unit.id,
    packageId: item.pkg ? item.pkg.id : null,
    quantity: item.quantity,
    price: item.totalPrice / item.quantity, // single item price
    totalPrice: item.totalPrice
  }))

  try {
    const transaction = await prisma.transaction.create({
      data: {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerNotes: customer.notes || null,
        lat: customer.lat || null,
        lng: customer.lng || null,
        deliveryId: delivery.id,
        deliveryPrice: delivery.price,
        totalAmount: totalAmount,
        status: 'Menunggu Konfirmasi',
        items: {
          create: transactionItems
        }
      }
    })

    return {
      success: true,
      id: transaction.id
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create transaction' })
  }
})
