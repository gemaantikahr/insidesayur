<script setup lang="ts">
import { Pencil, Trash2, Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: suppliers, pending, refresh } = await useApiFetch<any[]>('/api/admin/suppliers')

async function deleteSupplier(id: number, name: string) {
  if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/suppliers/${id}`, {
      method: 'DELETE'
    })

    refresh()
  } catch (error) {
    alert('Failed to delete supplier')
  }
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Suppliers</h1>
      <div class="mt-4 sm:mt-0">
        <NuxtLink
          to="/admin/suppliers/create"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus class="h-4 w-4 mr-2" />
          Add Supplier
        </NuxtLink>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone Number</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Google Maps</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="pending">
                  <td colspan="5" class="py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
                <tr v-else-if="!suppliers || suppliers.length === 0">
                  <td colspan="5" class="py-4 text-center text-sm text-gray-500">No suppliers found.</td>
                </tr>
                <tr v-else v-for="supplier in suppliers" :key="supplier.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ supplier.name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ supplier.phoneNumber }}
                  </td>
                  <td class="px-3 py-4 text-sm text-gray-500">
                    <a
                      v-if="supplier.googleMapsUrl"
                      :href="supplier.googleMapsUrl"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      View Map
                    </a>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="[
                        supplier.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
                      ]"
                    >
                      {{ supplier.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div class="flex justify-end gap-2">
                      <NuxtLink
                        :to="`/admin/suppliers/${supplier.id}`"
                        class="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Pencil class="h-4 w-4 mr-1" /> Edit
                      </NuxtLink>
                      <button
                        @click="deleteSupplier(supplier.id, supplier.name)"
                        class="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 class="h-4 w-4 mr-1" /> Delete
                      </button>
                    </div>
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
