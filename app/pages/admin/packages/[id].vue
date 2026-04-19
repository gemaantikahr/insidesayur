<script setup lang="ts">
import { ArrowLeft, Save, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const packageId = route.params.id

const { data: pkg, pending: fetching, error } = await useApiFetch<any>(`/api/packages/${packageId}`)

if (error.value || !pkg.value) {
  if (!import.meta.server) {
    alert('Package not found')
    router.push('/admin/packages')
  }
}

const form = ref({
  name: '',
  price: 0,
  sequence: 0,
  isActive: true,
})

const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<string | null>(null)
const removeImage = ref(false)
const loading = ref(false)
const errorMsg = ref('')

watchEffect(() => {
  if (pkg.value) {
    form.value.name = pkg.value.name
    form.value.price = Number(pkg.value.price)
    form.value.sequence = pkg.value.sequence
    form.value.isActive = pkg.value.isActive
    if (pkg.value.image) {
      previewImage.value = pkg.value.image
    }
  }
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    previewImage.value = URL.createObjectURL(file)
    removeImage.value = false
  }
}

const handleRemoveImage = () => {
  previewImage.value = null
  removeImage.value = true
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''
  
  if (form.value.price <= 0) {
    errorMsg.value = 'Price must be greater than 0'
    loading.value = false
    return
  }

  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('price', form.value.price.toString())
    formData.append('sequence', form.value.sequence.toString())
    formData.append('is_active', form.value.isActive.toString())
    formData.append('remove_image', removeImage.value.toString())
    
    if (fileInput.value?.files && fileInput.value.files.length > 0) {
      formData.append('image', fileInput.value.files[0])
    }

    await useApi(`/api/packages/${packageId}`, {
      method: 'PUT',
      body: formData
    })

    router.push('/admin/packages')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || 'Failed to update package'
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
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Edit Package</h1>
      </div>
    </div>

    <div v-if="fetching" class="flex justify-center py-12">
      <div class="text-gray-500">Loading...</div>
    </div>

    <div v-else-if="pkg" class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <form @submit.prevent="submitForm" class="p-6 sm:p-8">
        <div v-if="errorMsg" class="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          <div class="sm:col-span-4">
            <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
            <div class="mt-2">
              <input type="text" id="name" v-model="form.name" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="price" class="block text-sm font-medium leading-6 text-gray-900">Price</label>
            <div class="mt-2 relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input type="number" step="0.01" min="0" id="price" v-model="form.price" required class="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="sequence" class="block text-sm font-medium leading-6 text-gray-900">Sequence</label>
            <div class="mt-2">
              <input type="number" id="sequence" v-model="form.sequence" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div class="col-span-full">
            <label for="image" class="block text-sm font-medium leading-6 text-gray-900">Image</label>
            <div class="mt-2 flex items-center gap-x-4">
              <div class="relative group">
                <img v-if="previewImage" :src="previewImage" class="h-20 w-20 object-cover rounded-md border border-gray-200" />
                <div v-else class="h-20 w-20 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                  <span class="text-xs">No img</span>
                </div>
                <button v-if="previewImage" type="button" @click="handleRemoveImage" class="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
              <input type="file" id="image" ref="fileInput" @change="handleFileChange" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
            </div>
          </div>

          <div class="sm:col-span-6">
            <div class="flex items-center gap-x-3">
              <div class="flex h-6 items-center">
                <input id="is_active" name="is_active" type="checkbox" v-model="form.isActive" class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
              </div>
              <div class="text-sm leading-6">
                <label for="is_active" class="font-medium text-gray-900">Active Status</label>
                <p class="text-gray-500">Determine whether this package is visible.</p>
              </div>
            </div>
          </div>
          
        </div>

        <div class="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
          <button type="button" @click="router.back()" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
          <button type="submit" :disabled="loading" class="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 inline-flex items-center">
            <Save class="w-4 h-4 mr-2" />
            {{ loading ? 'Saving...' : 'Update Package' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
