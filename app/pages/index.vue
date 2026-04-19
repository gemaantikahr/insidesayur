<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({ title: 'dinosayurus — Fresh Organic Produce' })

// ---- State ----
const globalSearch = ref('')
const selectedCategoryId = ref<number | null>(null)
const productSearch = ref('')
const debouncedGlobalSearch = ref('')
const debouncedProductSearch = ref('')

// ---- Debounce timers ----
let globalTimer: ReturnType<typeof setTimeout> | null = null
let productTimer: ReturnType<typeof setTimeout> | null = null

watch(globalSearch, (v) => {
  if (globalTimer) clearTimeout(globalTimer)
  globalTimer = setTimeout(() => { debouncedGlobalSearch.value = v }, 350)
})

watch(productSearch, (v) => {
  if (productTimer) clearTimeout(productTimer)
  productTimer = setTimeout(() => { debouncedProductSearch.value = v }, 350)
})

// Combine search: global search overrides per-section search
const activeSearch = computed(() => debouncedGlobalSearch.value || debouncedProductSearch.value)

// ---- API calls ----
const { data: categories } = await useApiFetch<any[]>('/api/storefront/categories')

const productParams = computed(() => {
  const params: Record<string, string> = {}
  if (selectedCategoryId.value) params.category = String(selectedCategoryId.value)
  if (activeSearch.value) params.search = activeSearch.value
  return params
})

const { data: products, pending: loadingProducts } = await useApiFetch<any[]>('/api/storefront/products', {
  query: productParams,
  watch: [productParams],
})

// ---- Group products by category ----
const groupedProducts = computed(() => {
  if (!products.value || !categories.value) return []

  // If a specific category is selected, show a single group
  if (selectedCategoryId.value) {
    const cat = categories.value.find((c: any) => c.id === selectedCategoryId.value)
    return [{
      category: cat || { id: 0, name: 'Results', slug: 'results' },
      products: products.value,
    }]
  }

  // If searching, show flat results
  if (activeSearch.value) {
    return [{
      category: { id: 0, name: `Search results for "${activeSearch.value}"`, slug: 'search' },
      products: products.value,
    }]
  }

  // Otherwise group by category
  const groups: { category: any; products: any[] }[] = []
  for (const cat of categories.value) {
    const items = products.value.filter((p: any) => p.productCategoryId === cat.id)
    if (items.length > 0) {
      groups.push({ category: cat, products: items })
    }
  }
  return groups
})

// ---- Helpers ----
function selectCategory(id: number | null) {
  selectedCategoryId.value = selectedCategoryId.value === id ? null : id
  productSearch.value = ''
  debouncedProductSearch.value = ''
}

function getFirstImage(product: any) {
  if (product.images && product.images.length > 0) return product.images[0].imageUrl
  return null
}

function getLowestPrice(product: any) {
  if (!product.units || product.units.length === 0) return null
  const prices = product.units.map((u: any) => parseFloat(u.price))
  return Math.min(...prices)
}

function getFirstUnit(product: any) {
  if (!product.units || product.units.length === 0) return ''
  return product.units[0].label
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function clearGlobalSearch() {
  globalSearch.value = ''
  debouncedGlobalSearch.value = ''
}
</script>

<template>
  <!-- Global Search -->
  <section class="mb-10">
    <div class="relative group">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <span class="material-symbols-outlined text-outline">search</span>
      </div>
      <input
        v-model="globalSearch"
        class="w-full h-14 pl-12 pr-12 bg-surface-container-highest rounded-xl border-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline font-body"
        placeholder="Cari sayur, buah segar, herba..."
        type="text"
      />
      <button
        v-if="globalSearch"
        @click="clearGlobalSearch"
        class="absolute inset-y-0 right-4 flex items-center text-outline hover:text-on-surface transition-colors"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  </section>

  <!-- Category Chips -->
  <section class="mb-12" v-if="categories && categories.length > 0">
    <div class="flex gap-4 flex-wrap gap-y-3">
      <button
        @click="selectCategory(null)"
        :class="[
          'flex-shrink-0 px-6 py-3 rounded-full font-label text-sm font-semibold tracking-wide transition-all duration-200',
          selectedCategoryId === null
            ? 'bg-primary text-on-primary shadow-[0_-4px_32px_rgba(28,109,37,0.06)]'
            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
        ]"
      >
        Semua
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="selectCategory(cat.id)"
        :class="[
          'flex-shrink-0 px-6 py-3 rounded-full font-label text-sm font-semibold tracking-wide transition-all duration-200',
          selectedCategoryId === cat.id
            ? 'bg-primary text-on-primary shadow-[0_-4px_32px_rgba(28,109,37,0.06)]'
            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
        ]"
      >
        {{ cat.name }}
      </button>
    </div>
  </section>

  <!-- Loading State -->
  <section v-if="loadingProducts" class="mb-16 flex flex-col items-center justify-center py-20">
    <div class="w-10 h-10 rounded-full border-4 border-primary-container border-t-primary animate-spin"></div>
    <p class="mt-4 text-on-surface-variant font-body text-sm">Memuat produk segar...</p>
  </section>

  <!-- Empty State -->
  <section v-else-if="!products || products.length === 0" class="mb-16 flex flex-col items-center justify-center py-20">
    <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
    <h3 class="font-headline text-xl font-bold text-on-surface mb-2">Produk tidak ditemukan</h3>
    <p class="text-on-surface-variant font-body text-sm">Coba kata kunci lain atau pilih kategori berbeda</p>
  </section>

  <!-- Product Groups (by category) -->
  <template v-else>
    <section v-for="group in groupedProducts" :key="group.category.id" class="mb-16">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h3 class="font-headline text-3xl font-extrabold tracking-tight text-primary">{{ group.category.name }}</h3>
          <p class="font-body text-on-surface-variant text-sm mt-1" v-if="!activeSearch">Langsung dari kebun ke meja Anda</p>
        </div>
      </div>

      <!-- Per-section search (only when not already using global search) -->
      <div v-if="!debouncedGlobalSearch && groupedProducts.length > 1" class="mb-6 relative group">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-outline text-sm">search</span>
        </div>
        <input
          v-model="productSearch"
          class="w-full h-10 pl-10 pr-4 bg-surface-container-highest rounded-lg border-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline font-body text-sm"
          :placeholder="`Cari di ${group.category.name}...`"
          type="text"
        />
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink v-for="product in group.products" :key="product.id" :to="`/products/${product.slug}`" class="group block">
          <div class="aspect-square rounded-xl overflow-hidden bg-surface-container relative mb-4">
            <!-- Product image -->
            <img
              v-if="getFirstImage(product)"
              :src="getFirstImage(product)"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high">
              <span class="material-symbols-outlined text-5xl text-outline-variant">eco</span>
            </div>

            <!-- Add button -->
            <button class="absolute bottom-3 right-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-primary-dim">
              <span class="material-symbols-outlined text-xl">add</span>
            </button>

            <!-- Category badge -->
            <div
              v-if="product.category"
              class="absolute top-3 left-3 px-2 py-1 bg-tertiary-container text-on-tertiary-container text-[9px] font-bold uppercase tracking-widest rounded-sm"
            >
              {{ product.category.name }}
            </div>
          </div>
          <div>
            <h4 class="font-headline font-bold text-on-surface text-lg leading-snug">{{ product.name }}</h4>
            <p class="font-body text-on-surface-variant text-xs mb-2">{{ getFirstUnit(product) }}</p>
            <div class="flex justify-between items-center">
              <span v-if="getLowestPrice(product) !== null" class="font-headline font-extrabold text-primary">
                Rp{{ formatPrice(getLowestPrice(product)!) }}
              </span>
              <span v-else class="font-headline font-extrabold text-outline text-sm">Harga belum tersedia</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </template>

  <!-- Editorial Banner Section -->
  <section class="mb-8">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div class="md:col-span-7 aspect-[4/5] md:aspect-[16/10] overflow-hidden rounded-xl bg-surface-container-low relative group">
        <img
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt="Fresh organic vegetables with morning dew"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf6LX_oJ_h226Q0q-po3IkhM2vBQlF_aiZ2R7EMp3D_MfeW4pLEjZwr-GNJmkyq9LYM-gFSIo6QUijyGgG5WEIA5kzeBOeAlPMxDNdChyAecj8eIObqMVu9QSUGKB2JBHe5tlQwRYT_5l_ASthMakdWYuBAk5gkz7bjmSnsp9mxFy7YTTUy8omiJDXdOJ0N10mNVmBEuWizEWBY1EOu57PLIfmEje1lNRuGxuLHkoEJ9SKhwMn0azHsL7TPOOJLR8HPfRP0f1pKbuY"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-8">
          <span class="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm w-fit mb-3">Pilihan Musim</span>
          <h2 class="font-headline text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">Panen Segar<br/>Sayuran Hijau</h2>
          <p class="text-white/90 font-body text-sm md:text-base max-w-md">Dipetik langsung dari kebun mitra kami pagi ini untuk kesegaran terbaik.</p>
        </div>
      </div>
      <div class="md:col-span-5 flex flex-col gap-6">
        <div class="aspect-[16/9] md:aspect-[4/3] rounded-xl bg-surface-container-high overflow-hidden relative group">
          <img
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt="Colorful fresh vegetables arrangement"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWBcvi-TXTz2d5aNCizG6lOuplgI1H4BBFcmeqcE1bBL9pZcvzAsUbWWUAmknSD7eSBeKYPRmpE3Tpdttmine8HvbLNPKQ8cD4G39d523I70sPzNbGxDfnnADKn_nr0IBsUBMq9bj5OwCbZWMkRxien_Nu7MU2p2ZXGZMBb24Q_aHVQ9u8R7m-NuC1o6dYFr0BqkPAKcsxGK3r8LRB7yVwSKMUjDJlZMcnt5FqgEe4hP6L66M3aTPhhBgRr-Qq7XjUumY_mAX9u9xx"
          />
          <div class="absolute bottom-6 left-6 right-6">
            <h3 class="font-headline text-xl font-bold text-white drop-shadow-md">Koleksi Sayuran Segar</h3>
          </div>
        </div>
        <div class="p-8 bg-secondary-container rounded-xl flex flex-col justify-center">
          <h4 class="font-headline text-2xl font-bold text-on-secondary-container mb-2">dinosayurus story</h4>
          <p class="font-body text-on-secondary-fixed-variant text-sm mb-4 leading-relaxed">Temukan kurasi mingguan produk segar dan cerita dari kebun tempat mereka ditanam.</p>
          <a class="text-primary font-bold text-sm border-b-2 border-primary-container inline-flex items-center gap-2 w-fit cursor-pointer" href="#">Baca Selengkapnya <span class="material-symbols-outlined text-sm">arrow_forward</span></a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
