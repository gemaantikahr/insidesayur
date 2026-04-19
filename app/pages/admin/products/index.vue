<script setup lang="ts">
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: products, pending, refresh } = await useApiFetch<any[]>('/api/products')

const deleteProduct = async (id: number) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await useApi(`/api/products/${id}`, { method: 'DELETE' })
      await refresh()
    } catch (error) {
      alert('Failed to delete product')
    }
  }
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
      <div class="mt-4 sm:mt-0">
        <NuxtLink to="/admin/products/create" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
          <Plus class="-ml-1 mr-2 h-5 w-5" />
          Add Product
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
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Image</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Units</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="pending">
                  <td colspan="6" class="py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
                <tr v-else-if="!products || products.length === 0">
                  <td colspan="6" class="py-4 text-center text-sm text-gray-500">No products found.</td>
                </tr>
                <tr v-else v-for="product in products" :key="product.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img v-if="product.images && product.images.length > 0" :src="product.images[0].imageUrl" alt="" class="h-10 w-10 rounded-md object-cover border border-gray-200" />
                      <div v-else class="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                        <span class="text-xs text-gray-400">No Img</span>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <div class="font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-gray-500 text-xs">{{ product.slug }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ product.category?.name || 'Unknown' }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="flex flex-col gap-y-1">
                      <span v-for="unit in product.units" :key="unit.id" class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {{ unit.label }}: Rp{{ unit.price }}
                      </span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span :class="[product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'inline-flex rounded-full px-2 text-xs font-semibold leading-5']">
                      {{ product.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                    <NuxtLink :to="`/admin/products/${product.id}`" class="text-blue-600 hover:text-blue-900 inline-flex items-center">
                      <Edit class="h-4 w-4 mr-1" /> Edit
                    </NuxtLink>
                    <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900 inline-flex items-center">
                      <Trash2 class="h-4 w-4 mr-1" /> Delete
                    </button>
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
