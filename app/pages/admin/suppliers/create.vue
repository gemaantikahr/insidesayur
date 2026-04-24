<script setup lang="ts">
import { ArrowLeft, Save } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const router = useRouter()

const form = ref({
  name: '',
  phoneNumber: '',
  googleMapsUrl: '',
  isActive: true
})

const loading = ref(false)
const errorMsg = ref('')

async function submitForm() {
  loading.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/admin/suppliers', {
      method: 'POST',
      body: form.value
    })

    router.push('/admin/suppliers')
  } catch (error: any) {
    console.error('Error creating supplier:', error)
    errorMsg.value = error.data?.message || error.message || 'Failed to create supplier'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div class="flex items-center">
        <button @click="router.back()" class="mr-4 text-gray-500 hover:text-gray-900">
          <ArrowLeft class="h-6 w-6" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Create Supplier</h1>
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <form @submit.prevent="submitForm" class="p-6 sm:p-8">
        <div v-if="errorMsg" class="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div class="sm:col-span-4">
            <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
            <div class="mt-2">
              <input type="text" id="name" v-model="form.name" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-4">
            <label for="phoneNumber" class="block text-sm font-medium leading-6 text-gray-900">Phone Number</label>
            <div class="mt-2">
              <input type="text" id="phoneNumber" v-model="form.phoneNumber" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-4">
            <label for="googleMapsUrl" class="block text-sm font-medium leading-6 text-gray-900">Google Maps URL</label>
            <div class="mt-2">
              <input type="url" id="googleMapsUrl" v-model="form.googleMapsUrl" placeholder="https://maps.google.com/..." class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-6">
            <div class="flex items-center gap-x-3">
              <div class="flex h-6 items-center">
                <input id="isActive" name="isActive" type="checkbox" v-model="form.isActive" class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
              </div>
              <div class="text-sm leading-6">
                <label for="isActive" class="font-medium text-gray-900">Active Status</label>
                <p class="text-gray-500">Determine whether this supplier is active.</p>
              </div>
            </div>
          </div>

        </div>

        <div class="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
          <button type="button" @click="router.back()" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
          <button type="submit" :disabled="loading" class="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 inline-flex items-center">
            <Save class="w-4 h-4 mr-2" />
            {{ loading ? 'Saving...' : 'Save Supplier' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
