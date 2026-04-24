<script setup lang="ts">
import { Eye, Search, Filter } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const filters = ref({
  status: 'ALL',
  search: '',
  startDate: '',
  endDate: ''
})

const queryParams = computed(() => {
  const params: any = {}
  if (filters.value.status !== 'ALL') params.status = filters.value.status
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate
  return params
})

const { data: transactions, pending, refresh } = await useApiFetch<any[]>('/api/admin/transactions', {
  query: queryParams
})

const statusOptions = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'IN_PREPARE', label: 'In Prepare' },
  { value: 'WAITING_FOR_DRIVER', label: 'Waiting for Driver' },
  { value: 'IN_DELIVERY', label: 'In Delivery' },
  { value: 'COMPLETED', label: 'Completed' }
]

function resetFilters() {
  filters.value = {
    status: 'ALL',
    search: '',
    startDate: '',
    endDate: ''
  }
}

watch(filters, () => {
  refresh()
}, { deep: true })

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'IN_PREPARE': 'bg-blue-100 text-blue-800',
    'WAITING_FOR_DRIVER': 'bg-purple-100 text-purple-800',
    'IN_DELIVERY': 'bg-indigo-100 text-indigo-800',
    'COMPLETED': 'bg-green-100 text-green-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'PENDING': 'Pending',
    'CANCELLED': 'Cancelled',
    'IN_PREPARE': 'In Prepare',
    'WAITING_FOR_DRIVER': 'Waiting for Driver',
    'IN_DELIVERY': 'In Delivery',
    'COMPLETED': 'Completed'
  }
  return labels[status] || status
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
    </div>

    <!-- Filter Section -->
    <div class="mt-6 bg-white shadow rounded-lg p-4">
      <div class="flex items-center gap-2 mb-4">
        <Filter class="h-5 w-5 text-gray-500" />
        <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="filters.search"
              type="text"
              id="search"
              placeholder="Name, phone, or ID..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            id="status"
            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            v-model="filters.startDate"
            type="date"
            id="startDate"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <!-- End Date -->
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            v-model="filters.endDate"
            type="date"
            id="endDate"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <!-- Reset Button -->
      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Transaction ID</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="pending">
                  <td colspan="7" class="py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
                <tr v-else-if="!transactions || transactions.length === 0">
                  <td colspan="7" class="py-4 text-center text-sm text-gray-500">No transactions found.</td>
                </tr>
                <tr v-else v-for="transaction in transactions" :key="transaction.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div class="font-mono text-xs text-gray-900">{{ transaction.id.split('-')[0] }}...</div>
                  </td>
                  <td class="px-3 py-4 text-sm text-gray-900">
                    <div class="font-medium text-gray-900">{{ transaction.customerName }}</div>
                    <div class="text-gray-500 text-xs">{{ transaction.customerPhone }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ transaction.items.reduce((acc: number, item: any) => acc + item.quantity, 0) }} items
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                    Rp{{ formatPrice(transaction.totalAmount) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span :class="[getStatusColor(transaction.status), 'inline-flex rounded-full px-2 py-1 text-xs font-semibold']">
                      {{ getStatusLabel(transaction.status) }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ formatDate(transaction.createdAt) }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <NuxtLink :to="`/admin/transactions/${transaction.id}`" class="text-blue-600 hover:text-blue-900 inline-flex items-center">
                      <Eye class="h-4 w-4 mr-1" /> View
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
