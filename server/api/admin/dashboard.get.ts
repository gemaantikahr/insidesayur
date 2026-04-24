import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Get date ranges
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Run all queries in parallel for performance
  const [
    totalTransactions,
    pendingTransactions,
    completedTransactions,
    cancelledTransactions,
    inProgressTransactions,
    totalProducts,
    totalCategories,
    totalPackages,
    revenueThisMonth,
    revenueLastMonth,
    revenueToday,
    todayTransactionCount,
    recentTransactions,
    topProducts,
    statusCounts,
  ] = await Promise.all([
    // Total transactions
    prisma.transaction.count(),

    // Pending
    prisma.transaction.count({ where: { status: 'PENDING' } }),

    // Completed
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),

    // Cancelled
    prisma.transaction.count({ where: { status: 'CANCELLED' } }),

    // In progress (IN_PREPARE + WAITING_FOR_DRIVER + IN_DELIVERY)
    prisma.transaction.count({
      where: {
        status: { in: ['IN_PREPARE', 'WAITING_FOR_DRIVER', 'IN_DELIVERY'] }
      }
    }),

    // Total products
    prisma.product.count(),

    // Total categories
    prisma.productCategory.count(),

    // Total packages
    prisma.package.count(),

    // Revenue this month
    prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' }
      }
    }),

    // Revenue last month
    prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: 'CANCELLED' }
      }
    }),

    // Revenue today
    prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startOfToday },
        status: { not: 'CANCELLED' }
      }
    }),

    // Today's transaction count
    prisma.transaction.count({
      where: { createdAt: { gte: startOfToday } }
    }),

    // Recent 5 transactions
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        delivery: true,
        items: {
          include: {
            product: true,
            unit: true,
          }
        }
      }
    }),

    // Top selling products (by quantity)
    prisma.transactionItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // All status counts
    prisma.transaction.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ])

  // Enrich top products with product names
  const topProductIds = topProducts.map(p => p.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    include: { images: { take: 1, orderBy: { sequence: 'asc' } } }
  })

  const enrichedTopProducts = topProducts.map(tp => {
    const product = products.find(p => p.id === tp.productId)
    return {
      id: tp.productId,
      name: product?.name || 'Unknown',
      image: product?.images?.[0]?.imageUrl || null,
      totalQuantity: tp._sum.quantity,
      totalRevenue: tp._sum.totalPrice,
    }
  })

  // Calculate growth percentage
  const currentRevenue = Number(revenueThisMonth._sum.totalAmount || 0)
  const lastMonthRevenue = Number(revenueLastMonth._sum.totalAmount || 0)
  const revenueGrowth = lastMonthRevenue > 0
    ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : currentRevenue > 0 ? 100 : 0

  return {
    stats: {
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      cancelledTransactions,
      inProgressTransactions,
      totalProducts,
      totalCategories,
      totalPackages,
      todayTransactionCount,
    },
    revenue: {
      thisMonth: currentRevenue,
      lastMonth: lastMonthRevenue,
      today: Number(revenueToday._sum.totalAmount || 0),
      growthPercent: Math.round(revenueGrowth * 10) / 10,
    },
    recentTransactions,
    topProducts: enrichedTopProducts,
    statusCounts: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
  }
})
