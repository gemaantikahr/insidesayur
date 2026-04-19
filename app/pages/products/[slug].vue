<script setup lang="ts">
definePageMeta({ layout: 'product' })

const route = useRoute()
const slug = route.params.slug as string

const { data: product, error } = await useApiFetch<any>(`/api/storefront/products/${slug}`)

// Redirect if not found
if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
}

useHead({
  title: `${product.value.name} — dinosayurus`,
})

// ---- State ----
const selectedUnitIndex = ref(0)
const selectedPackageIndex = ref(0)
const quantity = ref(1)
const activeImageIndex = ref(0)

// ---- Computed ----
const selectedUnit = computed(() => {
  if (!product.value?.units?.length) return null
  return product.value.units[selectedUnitIndex.value]
})

const selectedPrice = computed(() => {
  if (!selectedUnit.value) return 0
  return parseFloat(selectedUnit.value.price)
})

const selectedPackage = computed(() => {
  if (!product.value?.packages?.length) return null
  return product.value.packages[selectedPackageIndex.value]
})

const selectedPackagePrice = computed(() => {
  if (!selectedPackage.value) return 0
  return parseFloat(selectedPackage.value.price)
})

const totalPrice = computed(() => (selectedPrice.value + selectedPackagePrice.value) * quantity.value)

const currentImage = computed(() => {
  if (!product.value?.images?.length) return null
  return product.value.images[activeImageIndex.value]?.imageUrl
})

// ---- Actions ----
function selectUnit(index: number) {
  selectedUnitIndex.value = index
}

function selectPackage(index: number) {
  selectedPackageIndex.value = index
}

function incrementQty() {
  if (quantity.value < 99) quantity.value++
}

function decrementQty() {
  if (quantity.value > 1) quantity.value--
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

const { addToCart } = useCart()
const isAdded = ref(false)
const showToast = ref(false)
let toastTimer: any = null

function handleAddToCart() {
  if (!product.value || !selectedUnit.value) return

  addToCart({
    product: {
      id: product.value.id,
      name: product.value.name,
      slug: product.value.slug,
      image: currentImage.value,
    },
    unit: {
      label: selectedUnit.value.label,
      price: parseFloat(selectedUnit.value.price),
    },
    pkg: selectedPackage.value ? {
      name: selectedPackage.value.name,
      price: parseFloat(selectedPackage.value.price),
    } : null,
    quantity: quantity.value,
    totalPrice: totalPrice.value,
  })

  isAdded.value = true
  showToast.value = true
  
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<template>
  <!-- Hero Image -->
  <section class="relative w-full h-[420px] sm:h-[500px] bg-surface-container overflow-hidden">
    <img
      v-if="currentImage"
      :src="currentImage"
      :alt="product.name"
      class="w-full h-full object-cover object-center"
    />
    <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high">
      <span class="material-symbols-outlined text-8xl text-outline-variant">eco</span>
    </div>

    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent"></div>

    <!-- Image dots indicator -->
    <div v-if="product.images && product.images.length > 1" class="absolute bottom-24 left-0 right-0 flex justify-center gap-2 z-10">
      <button
        v-for="(img, i) in product.images"
        :key="img.id"
        @click="activeImageIndex = i"
        :class="[
          'w-2.5 h-2.5 rounded-full transition-all duration-300',
          activeImageIndex === i
            ? 'bg-primary scale-125 shadow-md'
            : 'bg-white/50 hover:bg-white/80'
        ]"
      />
    </div>
  </section>

  <!-- Product Info Card -->
  <section class="px-6 -mt-20 relative z-10 max-w-3xl mx-auto">
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-outline-variant/10">
      <!-- Category Badge -->
      <div v-if="product.category" class="inline-flex items-center gap-1.5 bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full mb-4">
        <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">eco</span>
        <span class="font-label text-[11px] font-bold uppercase tracking-widest">{{ product.category.name }}</span>
      </div>

      <!-- Product Name -->
      <h1 class="font-headline text-3xl sm:text-4xl lg:text-5xl leading-[1.1] font-extrabold text-on-surface tracking-tight mb-4">
        {{ product.name }}
      </h1>

      <!-- Description -->
      <p class="font-body text-on-surface-variant text-base sm:text-lg leading-relaxed mb-6">
        {{ product.description || 'Produk segar pilihan, langsung dari kebun mitra kami.' }}
      </p>

      <!-- Price -->
      <div class="flex items-baseline gap-3">
        <span class="font-headline text-3xl sm:text-4xl font-extrabold text-primary">Rp{{ formatPrice(selectedPrice) }}</span>
        <span class="font-label text-sm text-outline">/ {{ selectedUnit?.label || 'unit' }}</span>
      </div>
    </div>
  </section>

  <!-- Selection Section -->
  <section class="mt-8 px-6 max-w-3xl mx-auto pb-44">
    <!-- Unit Weight Selector -->
    <div v-if="product.units && product.units.length > 0" class="mb-10">
      <h3 class="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-xl">scale</span>
        Pilih Ukuran
      </h3>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="(unit, index) in product.units"
          :key="unit.id"
          @click="selectUnit(index)"
          :class="[
            'font-label text-sm px-6 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200',
            selectedUnitIndex === index
              ? 'bg-primary-container text-on-primary-container font-bold border-primary shadow-md shadow-primary/10'
              : 'bg-surface-container-low text-on-surface-variant font-medium border-transparent hover:border-outline-variant hover:bg-surface-container'
          ]"
        >
          {{ unit.label }} — Rp{{ formatPrice(parseFloat(unit.price)) }}
        </button>
      </div>
    </div>

    <!-- Packaging Options -->
    <div v-if="product.packages && product.packages.length > 0" class="mb-10">
      <h3 class="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-xl">inventory_2</span>
        Kemasan
      </h3>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="(pkg, index) in product.packages"
          :key="pkg.id"
          @click="selectPackage(index)"
          :class="[
            'font-label text-sm px-5 py-3.5 rounded-2xl border-2 cursor-pointer flex items-center gap-2 transition-all',
            selectedPackageIndex === index
              ? 'bg-primary-container text-on-primary-container font-bold border-primary shadow-md shadow-primary/10'
              : 'bg-surface-container-low text-on-surface-variant font-medium border-transparent hover:border-outline-variant hover:bg-surface-container'
          ]"
        >
          <img v-if="pkg.image" :src="pkg.image" :alt="pkg.name" class="w-6 h-6 object-cover rounded-md" />
          <span v-else class="material-symbols-outlined text-lg" :style="selectedPackageIndex === index ? 'font-variation-settings: \'FILL\' 1;' : ''">package</span>
          {{ pkg.name }} <span v-if="parseFloat(pkg.price) > 0">(+Rp{{ formatPrice(parseFloat(pkg.price)) }})</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Floating Action Bar -->
  <div class="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl pt-4 pb-6 px-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 border-t border-outline-variant/15">
    <div v-if="!isAdded" class="max-w-3xl mx-auto flex items-center gap-4">
      <!-- Quantity Stepper -->
      <div class="flex items-center bg-surface-container-highest rounded-2xl p-1 border border-outline-variant/15">
        <button
          @click="decrementQty"
          class="w-11 h-11 rounded-xl bg-white text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors active:scale-95"
        >
          <span class="material-symbols-outlined text-xl">remove</span>
        </button>
        <span class="font-headline font-extrabold text-lg text-on-surface w-10 text-center">{{ quantity }}</span>
        <button
          @click="incrementQty"
          class="w-11 h-11 rounded-xl bg-white text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors active:scale-95"
        >
          <span class="material-symbols-outlined text-xl">add</span>
        </button>
      </div>

      <!-- Add to Cart Button -->
      <button @click="handleAddToCart" class="flex-grow bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-base sm:text-lg rounded-2xl py-4 px-6 shadow-lg shadow-primary/20 flex justify-center items-center gap-2.5 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200">
        <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">shopping_cart_checkout</span>
        <span>Rp{{ formatPrice(totalPrice) }}</span>
        <span class="hidden sm:inline">—</span>
        <span class="hidden sm:inline">Tambah</span>
        <span class="sm:hidden">+</span>
      </button>
    </div>

    <!-- Success State -->
    <div v-else class="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
      <NuxtLink to="/checkout" class="w-full sm:flex-1 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-base rounded-2xl py-4 px-6 shadow-lg shadow-primary/20 flex justify-center items-center gap-2 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200">
        <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">shopping_cart</span>
        Lihat Keranjang
      </NuxtLink>
      <NuxtLink to="/" class="w-full sm:flex-1 bg-surface-container-low text-on-surface-variant font-headline font-bold text-base rounded-2xl py-4 px-6 border border-outline-variant/30 flex justify-center items-center gap-2 hover:bg-surface-container hover:text-on-surface active:scale-[0.98] transition-all duration-200">
        <span class="material-symbols-outlined text-xl">search</span>
        Cari Produk Lain
      </NuxtLink>
    </div>
  </div>

  <!-- Toast Notification -->
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div v-if="showToast" class="fixed bottom-28 left-0 right-0 z-[60] flex justify-center pointer-events-none px-4">
      <div class="bg-inverse-surface text-inverse-on-surface font-body text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <span class="material-symbols-outlined text-primary-fixed text-lg">check_circle</span>
        <span>Berhasil ditambahkan ke keranjang!</span>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
