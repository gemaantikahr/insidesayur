<script setup lang="ts">
import { Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: transactions, pending } = await useApiFetch<any[]>('/api/admin/transactions')

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
