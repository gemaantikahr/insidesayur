<script setup lang="ts">
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const productId = route.params.id

const { data: categories } = await useApiFetch<any[]>('/api/categories')
const { data: product, pending: fetching, error } = await useApiFetch<any>(`/api/products/${productId}`)

if (error.value || !product.value) {
  if (!import.meta.server) {
    alert('Product not found')
    router.push('/admin/products')
  }
}

const form = ref({
  name: '',
  slug: '',
  productCategoryId: '',
  description: '',
  isActive: true,
})

// Dynamic Units
const units = ref<{ id?: number, label: string, price: number }[]>([])

// Dynamic Images (Existing + New)
const existingImages = ref<{ id: number, imageUrl: string, sequence: number }[]>([])
const newImages = ref<{ file: File, preview: string, sequence: number }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

watchEffect(() => {
  if (product.value) {
    form.value.name = product.value.name
    form.value.slug = product.value.slug
    form.value.productCategoryId = product.value.productCategoryId
    form.value.description = product.value.description || ''
    form.value.isActive = product.value.isActive
    
    if (product.value.units) {
      units.value = product.value.units.map((u: any) => ({
        id: u.id,
        label: u.label,
        price: Number(u.price)
      }))
    }
    if (units.value.length === 0) {
      units.value.push({ label: '1 Kg', price: 0 })
    }

    if (product.value.images) {
      existingImages.value = product.value.images.map((i: any) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        sequence: i.sequence
      })).sort((a: any, b: any) => a.sequence - b.sequence)
    }
  }
})

const addUnit = () => {
  units.value.push({ label: '', price: 0 })
}

const removeUnit = (index: number) => {
  if (units.value.length > 1) {
    units.value.splice(index, 1)
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    const totalCurrentImages = existingImages.value.length + newImages.value.length
    const files = Array.from(target.files)
    files.forEach((file, index) => {
      newImages.value.push({
        file,
        preview: URL.createObjectURL(file),
        sequence: totalCurrentImages + index
      })
    })
    target.value = ''
  }
}

const removeExistingImage = (index: number) => {
  existingImages.value.splice(index, 1)
  recalculateSequences()
}

const removeNewImage = (index: number) => {
  newImages.value.splice(index, 1)
  recalculateSequences()
}

const moveExistingImageUp = (index: number) => {
  if (index > 0) {
    const temp = existingImages.value[index]
    existingImages.value[index] = existingImages.value[index - 1]
    existingImages.value[index - 1] = temp
    recalculateSequences()
  }
}

const moveExistingImageDown = (index: number) => {
  // If moving down, check if it's the last existing image
  if (index < existingImages.value.length - 1) {
    const temp = existingImages.value[index]
    existingImages.value[index] = existingImages.value[index + 1]
    existingImages.value[index + 1] = temp
    recalculateSequences()
  } else if (newImages.value.length > 0) {
    // Edge case: Move existing image down into new images is complex, 
    // for simplicity we keep them separated or we need a unified array.
    // Let's implement unified sequence recalculation.
  }
}

const moveNewImageUp = (index: number) => {
  if (index > 0) {
    const temp = newImages.value[index]
    newImages.value[index] = newImages.value[index - 1]
    newImages.value[index - 1] = temp
    recalculateSequences()
  }
}

const moveNewImageDown = (index: number) => {
  if (index < newImages.value.length - 1) {
    const temp = newImages.value[index]
    newImages.value[index] = newImages.value[index + 1]
    newImages.value[index + 1] = temp
    recalculateSequences()
  }
}

const recalculateSequences = () => {
  let seq = 0
  existingImages.value.forEach(img => img.sequence = seq++)
  newImages.value.forEach(img => img.sequence = seq++)
}

const loading = ref(false)
const errorMsg = ref('')

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''
  
  if (!form.value.productCategoryId) {
    errorMsg.value = 'Please select a category'
    loading.value = false
    return
  }

  const invalidUnits = units.value.filter(u => !u.label || u.price <= 0)
  if (invalidUnits.length > 0) {
    errorMsg.value = 'All units must have a label and a price greater than 0'
    loading.value = false
    return
  }

  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('slug', form.value.slug)
    formData.append('product_category_id', form.value.productCategoryId)
    formData.append('description', form.value.description)
    formData.append('is_active', form.value.isActive.toString())
    
    // Units
    const unitsData = units.value.map(u => ({ id: u.id, label: u.label, price: Number(u.price) }))
    formData.append('units', JSON.stringify(unitsData))

    // Retained Images
    const retainedImages = existingImages.value.map(img => ({ id: img.id, sequence: img.sequence }))
    formData.append('retained_images', JSON.stringify(retainedImages))

    // New Images
    newImages.value.forEach((img) => {
      formData.append(`image_${img.sequence}`, img.file, img.file.name)
    })

    await useApi(`/api/products/${productId}`, {
      method: 'PUT',
      body: formData
    })

    router.push('/admin/products')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || 'Failed to update product'
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
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Edit Product</h1>
      </div>
    </div>

    <div v-if="fetching" class="flex justify-center py-12">
      <div class="text-gray-500">Loading...</div>
    </div>

    <form v-else-if="product" @submit.prevent="submitForm" class="space-y-8">
      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
        {{ errorMsg }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Left Column -->
        <div class="md:col-span-2 space-y-8">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 sm:p-8">
            <h2 class="text-base font-semibold leading-7 text-gray-900 mb-6">Basic Information</h2>
            
            <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div class="sm:col-span-4">
                <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
                <div class="mt-2">
                  <input type="text" id="name" v-model="form.name" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
                </div>
              </div>

              <div class="sm:col-span-4">
                <label for="slug" class="block text-sm font-medium leading-6 text-gray-900">Slug</label>
                <div class="mt-2">
                  <input type="text" id="slug" v-model="form.slug" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
                </div>
              </div>

              <div class="sm:col-span-3">
                <label for="category" class="block text-sm font-medium leading-6 text-gray-900">Category</label>
                <div class="mt-2">
                  <select id="category" v-model="form.productCategoryId" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:max-w-xs sm:text-sm sm:leading-6 px-3">
                    <option value="" disabled>Select a category</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
              </div>

              <div class="col-span-full">
                <label for="description" class="block text-sm font-medium leading-6 text-gray-900 mb-2">Description</label>
                <ClientOnly>
                  <RichEditor v-model="form.description" />
                  <template #fallback>
                    <div class="h-32 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 text-gray-500">
                      Loading editor...
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- Unit Weights -->
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 sm:p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900">Unit Weights & Prices</h2>
              <button type="button" @click="addUnit" class="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                <Plus class="h-4 w-4 mr-1" /> Add Unit
              </button>
            </div>
            
            <div class="space-y-4">
              <div v-for="(unit, index) in units" :key="index" class="flex items-end gap-x-4">
                <div class="flex-grow">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Label (e.g., 1 Kg)</label>
                  <input type="text" v-model="unit.label" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-3" />
                </div>
                <div class="flex-grow">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Price</label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" step="0.01" min="0" v-model="unit.price" required class="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" />
                  </div>
                </div>
                <div class="pb-1">
                  <button type="button" @click="removeUnit(index)" :disabled="units.length === 1" class="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 sm:p-8">
            <h2 class="text-base font-semibold leading-7 text-gray-900 mb-6">Status</h2>
            <div class="flex items-center gap-x-3">
              <div class="flex h-6 items-center">
                <input id="is_active" name="is_active" type="checkbox" v-model="form.isActive" class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
              </div>
              <div class="text-sm leading-6">
                <label for="is_active" class="font-medium text-gray-900">Active</label>
                <p class="text-gray-500 text-xs">Visible on storefront</p>
              </div>
            </div>
          </div>

          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 sm:p-8">
            <h2 class="text-base font-semibold leading-7 text-gray-900 mb-6">Images</h2>
            
            <div class="mb-4">
              <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" multiple class="hidden" id="file-upload" />
              <label for="file-upload" class="cursor-pointer flex justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Plus class="h-5 w-5 mr-2 text-gray-400" />
                Upload Images
              </label>
            </div>

            <div v-if="existingImages.length > 0 || newImages.length > 0" class="space-y-3">
              <!-- Existing Images -->
              <div v-for="(img, index) in existingImages" :key="'ex-'+img.id" class="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
                <div class="flex items-center space-x-3">
                  <div class="flex flex-col space-y-1">
                    <button type="button" @click="moveExistingImageUp(index)" :disabled="index === 0" class="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button type="button" @click="moveExistingImageDown(index)" :disabled="index === existingImages.length - 1 && newImages.length === 0" class="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                  <img :src="img.imageUrl" class="h-12 w-12 object-cover rounded shadow-sm" />
                </div>
                <button type="button" @click="removeExistingImage(index)" class="text-red-400 hover:text-red-600 p-1">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>

              <!-- New Images -->
              <div v-for="(img, index) in newImages" :key="'new-'+index" class="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div class="flex items-center space-x-3">
                  <div class="flex flex-col space-y-1">
                    <button type="button" @click="moveNewImageUp(index)" :disabled="index === 0 && existingImages.length === 0" class="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button type="button" @click="moveNewImageDown(index)" :disabled="index === newImages.length - 1" class="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                  <img :src="img.preview" class="h-12 w-12 object-cover rounded shadow-sm" />
                  <span class="text-xs text-blue-500 font-mono truncate w-20">New</span>
                </div>
                <button type="button" @click="removeNewImage(index)" class="text-red-400 hover:text-red-600 p-1">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div v-else class="text-center py-4 text-sm text-gray-500">
              No images uploaded yet.
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-x-6">
        <button type="button" @click="router.back()" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
        <button type="submit" :disabled="loading" class="rounded-md bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 inline-flex items-center">
          <Save class="w-4 h-4 mr-2" />
          {{ loading ? 'Saving...' : 'Update Product' }}
        </button>
      </div>
    </form>
  </div>
</template>
