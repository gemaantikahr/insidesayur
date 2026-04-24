<script setup lang="ts">
import {
  TrendingUp, TrendingDown, ShoppingCart, Package, Folder, Box, Clock,
  CheckCircle, XCircle, Truck, Eye, ArrowUpRight, Loader2
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: me } = await useApiFetch('/api/auth/me')
const { data: dashboard, pending } = await useApiFetch<any>('/api/admin/dashboard')

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'PENDING': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'CANCELLED': 'bg-red-50 text-red-700 ring-red-600/20',
    'IN_PREPARE': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'WAITING_FOR_DRIVER': 'bg-purple-50 text-purple-700 ring-purple-600/20',
    'IN_DELIVERY': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    'COMPLETED': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  }
  return colors[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'PENDING': 'Pending',
    'CANCELLED': 'Cancelled',
    'IN_PREPARE': 'Preparing',
    'WAITING_FOR_DRIVER': 'Waiting Driver',
    'IN_DELIVERY': 'In Delivery',
    'COMPLETED': 'Completed',
  }
  return labels[status] || status
}

function getStatusIcon(status: string) {
  const icons: Record<string, any> = {
    'PENDING': Clock,
    'CANCELLED': XCircle,
    'IN_PREPARE': Package,
    'WAITING_FOR_DRIVER': Clock,
    'IN_DELIVERY': Truck,
    'COMPLETED': CheckCircle,
  }
  return icons[status] || Clock
}

// Get current hour greeting
const hour = new Date().getHours()
const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam'
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <Loader2 class="h-8 w-8 animate-spin text-gray-400 mx-auto" />
        <p class="mt-3 text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>

    <div v-else-if="dashboard">
      <!-- Greeting -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ greeting }}, {{ me?.user?.name || 'Admin' }} 👋</h1>
        <p class="text-gray-500 mt-1 text-sm">Berikut ringkasan toko kamu hari ini.</p>
      </div>

      <!-- Revenue Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Revenue Today -->
        <div class="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[40px] -mr-2 -mt-2 transition-all group-hover:w-24 group-hover:h-24"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp class="w-4 h-4 text-emerald-600" />
              </div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Hari Ini</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">Rp{{ formatPrice(dashboard.revenue.today) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ dashboard.stats.todayTransactionCount }} transaksi</p>
          </div>
        </div>

        <!-- Revenue This Month -->
        <div class="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[40px] -mr-2 -mt-2 transition-all group-hover:w-24 group-hover:h-24"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart class="w-4 h-4 text-blue-600" />
              </div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Bulan Ini</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">Rp{{ formatPrice(dashboard.revenue.thisMonth) }}</p>
            <div class="flex items-center mt-1">
              <span v-if="dashboard.revenue.growthPercent >= 0" class="inline-flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp class="w-3 h-3 mr-0.5" />
                +{{ dashboard.revenue.growthPercent }}%
              </span>
              <span v-else class="inline-flex items-center text-xs font-medium text-red-600">
                <TrendingDown class="w-3 h-3 mr-0.5" />
                {{ dashboard.revenue.growthPercent }}%
              </span>
              <span class="text-xs text-gray-400 ml-1">vs bulan lalu</span>
            </div>
          </div>
        </div>

        <!-- Pending Orders -->
        <div class="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-[40px] -mr-2 -mt-2 transition-all group-hover:w-24 group-hover:h-24"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock class="w-4 h-4 text-amber-600" />
              </div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Perlu Diproses</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ dashboard.stats.pendingTransactions }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ dashboard.stats.inProgressTransactions }} sedang diproses</p>
          </div>
        </div>

        <!-- Total Products -->
        <div class="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-[40px] -mr-2 -mt-2 transition-all group-hover:w-24 group-hover:h-24"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Package class="w-4 h-4 text-purple-600" />
              </div>
              <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Produk</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ dashboard.stats.totalProducts }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ dashboard.stats.totalCategories }} kategori · {{ dashboard.stats.totalPackages }} paket</p>
          </div>
        </div>
      </div>

      <!-- Order Status Pipeline -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Status Pesanan</h2>
          <NuxtLink to="/admin/transactions" class="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
            Lihat Semua <ArrowUpRight class="w-3 h-3" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            v-for="status in ['PENDING', 'IN_PREPARE', 'WAITING_FOR_DRIVER', 'IN_DELIVERY', 'COMPLETED', 'CANCELLED']"
            :key="status"
            :class="[
              'rounded-lg p-3 text-center transition-all hover:scale-[1.02]',
              status === 'PENDING' ? 'bg-amber-50 border border-amber-200' :
              status === 'IN_PREPARE' ? 'bg-blue-50 border border-blue-200' :
              status === 'WAITING_FOR_DRIVER' ? 'bg-purple-50 border border-purple-200' :
              status === 'IN_DELIVERY' ? 'bg-indigo-50 border border-indigo-200' :
              status === 'COMPLETED' ? 'bg-emerald-50 border border-emerald-200' :
              'bg-red-50 border border-red-200'
            ]"
          >
            <component
              :is="getStatusIcon(status)"
              :class="[
                'w-5 h-5 mx-auto mb-1.5',
                status === 'PENDING' ? 'text-amber-600' :
                status === 'IN_PREPARE' ? 'text-blue-600' :
                status === 'WAITING_FOR_DRIVER' ? 'text-purple-600' :
                status === 'IN_DELIVERY' ? 'text-indigo-600' :
                status === 'COMPLETED' ? 'text-emerald-600' :
                'text-red-600'
              ]"
            />
            <p class="text-xl font-bold text-gray-900">{{ dashboard.statusCounts[status] || 0 }}</p>
            <p class="text-[11px] font-medium text-gray-500 mt-0.5 leading-tight">{{ getStatusLabel(status) }}</p>
          </div>
        </div>
      </div>

      <!-- Two Column: Recent Transactions + Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Recent Transactions -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Transaksi Terbaru</h2>
            <NuxtLink to="/admin/transactions" class="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
              Lihat Semua <ArrowUpRight class="w-3 h-3" />
            </NuxtLink>
          </div>

          <div v-if="dashboard.recentTransactions.length === 0" class="p-8 text-center">
            <ShoppingCart class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Belum ada transaksi.</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <NuxtLink
              v-for="tx in dashboard.recentTransactions"
              :key="tx.id"
              :to="`/admin/transactions/${tx.id}`"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <!-- Avatar -->
              <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-sm font-semibold text-gray-600">
                {{ tx.customerName?.charAt(0)?.toUpperCase() || '?' }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ tx.customerName }}</p>
                  <span :class="[getStatusColor(tx.status), 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset']">
                    {{ getStatusLabel(tx.status) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ tx.items?.length || 0 }} item · {{ formatDate(tx.createdAt) }}
                </p>
              </div>

              <!-- Amount -->
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold text-gray-900">Rp{{ formatPrice(tx.totalAmount) }}</p>
                <Eye class="w-3.5 h-3.5 text-gray-400 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Produk Terlaris</h2>
            <NuxtLink to="/admin/products" class="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
              Lihat Semua <ArrowUpRight class="w-3 h-3" />
            </NuxtLink>
          </div>

          <div v-if="dashboard.topProducts.length === 0" class="p-8 text-center">
            <Package class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Belum ada data penjualan.</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(product, index) in dashboard.topProducts"
              :key="product.id"
              class="flex items-center gap-3 px-5 py-3.5"
            >
              <!-- Rank -->
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                index === 0 ? 'bg-amber-100 text-amber-700' :
                index === 1 ? 'bg-gray-200 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-500'
              ]">
                {{ index + 1 }}
              </div>

              <!-- Product Image -->
              <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                <img v-if="product.image" :src="product.image" alt="" class="w-full h-full object-cover" />
                <span v-else class="text-lg">🥬</span>
              </div>

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
                <p class="text-xs text-gray-500">{{ product.totalQuantity }} terjual</p>
              </div>

              <!-- Revenue -->
              <p class="text-xs font-semibold text-gray-700 shrink-0">Rp{{ formatPrice(product.totalRevenue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NuxtLink
          to="/admin/transactions"
          class="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <ShoppingCart class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Transaksi</p>
            <p class="text-xs text-gray-500">{{ dashboard.stats.totalTransactions }} total</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/admin/products"
          class="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <Package class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Produk</p>
            <p class="text-xs text-gray-500">{{ dashboard.stats.totalProducts }} item</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/admin/categories"
          class="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Folder class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Kategori</p>
            <p class="text-xs text-gray-500">{{ dashboard.stats.totalCategories }} kategori</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/admin/packages"
          class="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div class="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Box class="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Paket</p>
            <p class="text-xs text-gray-500">{{ dashboard.stats.totalPackages }} paket</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
