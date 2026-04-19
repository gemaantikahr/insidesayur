<script setup lang="ts">
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: categories, pending, refresh } = await useApiFetch<any[]>('/api/categories')

const deleteCategory = async (id: number) => {
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      await useApi(`/api/categories/${id}`, { method: 'DELETE' })
      await refresh()
    } catch (error) {
      alert('Failed to delete category')
    }
  }
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Product Categories</h1>
      <div class="mt-4 sm:mt-0">
        <NuxtLink to="/admin/categories/create" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
          <Plus class="-ml-1 mr-2 h-5 w-5" />
          Add Category
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
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sequence</th>
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
                <tr v-else-if="!categories || categories.length === 0">
                  <td colspan="5" class="py-4 text-center text-sm text-gray-500">No categories found.</td>
                </tr>
                <tr v-else v-for="category in categories" :key="category.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img v-if="category.image" :src="category.image" alt="" class="h-10 w-10 rounded-md object-cover" />
                      <div v-else class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                        <span class="text-xs text-gray-500">No Img</span>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <div class="font-medium text-gray-900">{{ category.name }}</div>
                    <div class="text-gray-500 text-xs">{{ category.slug }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ category.sequence }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span :class="[category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'inline-flex rounded-full px-2 text-xs font-semibold leading-5']">
                      {{ category.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                    <NuxtLink :to="`/admin/categories/${category.id}`" class="text-blue-600 hover:text-blue-900 inline-flex items-center">
                      <Edit class="h-4 w-4 mr-1" /> Edit
                    </NuxtLink>
                    <button @click="deleteCategory(category.id)" class="text-red-600 hover:text-red-900 inline-flex items-center">
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
