<script setup lang="ts">
import { ArrowLeft, Save } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const deliveryId = route.params.id

const { data: delivery, pending: fetching, error } = await useApiFetch<any>(`/api/deliveries/${deliveryId}`)

if (error.value || !delivery.value) {
  if (!import.meta.server) {
    alert('Delivery option not found')
    router.push('/admin/deliveries')
  }
}

const form = ref({
  label: '',
  price: '',
  strikeoutPrice: '',
  sequence: 0,
  isActive: true,
})

const loading = ref(false)
const errorMsg = ref('')

// Initialize form once data is loaded
watchEffect(() => {
  if (delivery.value) {
    form.value.label = delivery.value.label
    form.value.price = delivery.value.price
    form.value.strikeoutPrice = delivery.value.strikeoutPrice || ''
    form.value.sequence = delivery.value.sequence
    form.value.isActive = delivery.value.isActive
  }
})

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    await useApi(`/api/deliveries/${deliveryId}`, {
      method: 'PUT',
      body: {
        label: form.value.label,
        price: form.value.price,
        strikeoutPrice: form.value.strikeoutPrice || null,
        sequence: form.value.sequence,
        isActive: form.value.isActive
      }
    })

    router.push('/admin/deliveries')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || 'Failed to update delivery option'
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
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Edit Delivery Option</h1>
      </div>
    </div>

    <div v-if="fetching" class="flex justify-center py-12">
      <div class="text-gray-500">Loading...</div>
    </div>

    <div v-else-if="delivery" class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <form @submit.prevent="submitForm" class="p-6 sm:p-8">
        <div v-if="errorMsg" class="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          <div class="sm:col-span-4">
            <label for="label" class="block text-sm font-medium leading-6 text-gray-900">Label</label>
            <div class="mt-2">
              <input type="text" id="label" v-model="form.label" required placeholder="e.g. Standard Delivery, Express Delivery" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="price" class="block text-sm font-medium leading-6 text-gray-900">Price (Rp)</label>
            <div class="mt-2">
              <input type="number" id="price" v-model="form.price" required min="0" step="100" placeholder="0" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="strikeoutPrice" class="block text-sm font-medium leading-6 text-gray-900">Strikeout Price (Rp) <span class="text-gray-400 font-normal">— Optional</span></label>
            <div class="mt-2">
              <input type="number" id="strikeoutPrice" v-model="form.strikeoutPrice" min="0" step="100" placeholder="Original price before discount" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
            <p class="mt-1 text-xs text-gray-500">Displayed as a crossed-out price next to the actual price.</p>
          </div>

          <div class="sm:col-span-2">
            <label for="sequence" class="block text-sm font-medium leading-6 text-gray-900">Sequence</label>
            <div class="mt-2">
              <input type="number" id="sequence" v-model="form.sequence" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-6">
            <div class="flex items-center gap-x-3">
              <div class="flex h-6 items-center">
                <input id="is_active" name="is_active" type="checkbox" v-model="form.isActive" class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
              </div>
              <div class="text-sm leading-6">
                <label for="is_active" class="font-medium text-gray-900">Active Status</label>
                <p class="text-gray-500">Determine whether this delivery option is available for checkout.</p>
              </div>
            </div>
          </div>
          
        </div>

        <div class="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
          <button type="button" @click="router.back()" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
          <button type="submit" :disabled="loading" class="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 inline-flex items-center">
            <Save class="w-4 h-4 mr-2" />
            {{ loading ? 'Saving...' : 'Update Delivery Option' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
