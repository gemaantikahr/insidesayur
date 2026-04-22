<script setup lang="ts">
import { ArrowLeft, Clock, MapPin, Package, Save } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const transactionId = route.params.id
const { $swal } = useNuxtApp()

const { data: transaction, pending, error, refresh } = await useApiFetch<any>(`/api/admin/transactions/${transactionId}`)

if (error.value || !transaction.value) {
  if (!import.meta.server) {
    $swal.fire({
      icon: 'error',
      title: 'Transaction Not Found',
      text: 'The transaction you are looking for does not exist.',
      confirmButtonColor: '#000'
    }).then(() => {
      navigateTo('/admin/transactions')
    })
  }
}

const selectedStatus = ref(transaction.value?.status || 'PENDING')
const isUpdating = ref(false)

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'IN_PREPARE', label: 'In Prepare', color: 'bg-blue-100 text-blue-800' },
  { value: 'WAITING_FOR_DRIVER', label: 'Waiting for Driver', color: 'bg-purple-100 text-purple-800' },
  { value: 'IN_DELIVERY', label: 'In Delivery', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' }
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

async function updateStatus() {
  if (!transaction.value) return

  const result = await $swal.fire({
    title: 'Update Status?',
    text: `Change transaction status to ${selectedStatus.value}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#000',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'Cancel'
  })

  if (!result.isConfirmed) return

  isUpdating.value = true
  try {
    await useApi(`/api/admin/transactions/${transactionId}`, {
      method: 'PATCH',
      body: { status: selectedStatus.value }
    })
    await refresh()
    await $swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Transaction status updated successfully!',
      confirmButtonColor: '#000'
    })
  } catch (error) {
    await $swal.fire({
      icon: 'error',
      title: 'Failed',
      text: 'Failed to update transaction status',
      confirmButtonColor: '#000'
    })
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/admin/transactions" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft class="h-4 w-4 mr-1" />
        Back to Transactions
      </NuxtLink>
    </div>

    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Transaction Detail</h1>
    </div>

    <div v-if="pending" class="text-center py-12">
      <p class="text-gray-500">Loading transaction...</p>
    </div>

    <div v-else-if="transaction" class="space-y-6">

      <!-- Status Update Card -->
      <div class="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
        <div class="flex items-end gap-4">
          <div class="flex-grow">
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Transaction Status</label>
            <select
              id="status"
              v-model="selectedStatus"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <button
            @click="updateStatus"
            :disabled="isUpdating || selectedStatus === transaction.status"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save class="h-4 w-4 mr-2" />
            {{ isUpdating ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>

      <!-- Transaction Info -->
      <div class="bg-white shadow rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock class="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Transaction Information</h2>
            <p class="text-sm text-gray-500">{{ formatDate(transaction.createdAt) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase">Transaction ID</span>
            <span class="text-sm text-gray-900 font-mono">{{ transaction.id }}</span>
          </div>
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase">Current Status</span>
            <span :class="[statusOptions.find(s => s.value === transaction.status)?.color, 'inline-flex rounded-full px-2 py-1 text-xs font-semibold mt-1']">
              {{ statusOptions.find(s => s.value === transaction.status)?.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white shadow rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Package class="w-5 h-5 text-gray-600" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">Order Items</h2>
        </div>

        <div class="space-y-4">
          <div v-for="item in transaction.items" :key="item.id" class="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
            <div class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <span class="text-gray-400 text-2xl">🥬</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-semibold text-gray-900">{{ item.product.name }}</h4>
              <p class="text-sm text-gray-500 mt-1">
                {{ item.unit.label }} <span v-if="item.package">| {{ item.package.name }}</span>
              </p>
              <div class="flex justify-between items-end mt-2">
                <span class="text-sm text-gray-600">{{ item.quantity }}x Rp{{ formatPrice(item.price) }}</span>
                <span class="font-semibold text-gray-900">Rp{{ formatPrice(item.totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Info -->
      <div class="bg-white shadow rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <MapPin class="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Delivery Information</h2>
            <p class="text-sm text-gray-500">{{ transaction.delivery.label }}</p>
          </div>
        </div>

        <div class="space-y-3 mt-4">
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase">Customer Name</span>
            <span class="text-sm text-gray-900">{{ transaction.customerName }}</span>
          </div>
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase">WhatsApp</span>
            <span class="text-sm text-gray-900">{{ transaction.customerPhone }}</span>
          </div>
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase">Address</span>
            <span class="text-sm text-gray-900">{{ transaction.customerAddress }}</span>
          </div>
          <div v-if="transaction.customerNotes">
            <span class="block text-xs font-medium text-gray-500 uppercase">Notes</span>
            <span class="text-sm text-gray-900">{{ transaction.customerNotes }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>

        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal ({{ transaction.items.reduce((acc: number, item: any) => acc + item.quantity, 0) }} items)</span>
            <span class="text-gray-900">Rp{{ formatPrice(transaction.totalAmount - transaction.deliveryPrice) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Delivery ({{ transaction.delivery.label }})</span>
            <span class="text-gray-900">Rp{{ formatPrice(transaction.deliveryPrice) }}</span>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-200 flex justify-between items-center">
          <span class="text-lg font-semibold text-gray-900">Total</span>
          <span class="text-2xl font-bold text-gray-900">Rp{{ formatPrice(transaction.totalAmount) }}</span>
        </div>
      </div>

    </div>
  </div>
</template>
