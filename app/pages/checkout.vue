<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({ title: 'Checkout — dinosayurus' })

const { $swal } = useNuxtApp()
const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()

const customer = ref({
  name: '',
  phone: '',
  address: '',
  notes: '',
  lat: null as number | null,
  lng: null as number | null,
})

const { data: deliveries } = await useFetch<any[]>('/api/storefront/deliveries')
const selectedDeliveryId = ref<number | null>(null)

const selectedDelivery = computed(() => {
  return deliveries.value?.find((d) => d.id === selectedDeliveryId.value)
})

const finalTotal = computed(() => {
  const deliveryPrice = selectedDelivery.value ? Number(selectedDelivery.value.price) : 0
  return cartTotal.value + deliveryPrice
})

const isSubmitting = ref(false)
const orderSuccess = ref(false)

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

async function placeOrder() {
  if (!customer.value.name || !customer.value.phone || !customer.value.address) {
    await $swal.fire({
      icon: 'warning',
      title: 'Data Tidak Lengkap',
      text: 'Mohon lengkapi data pengiriman Anda.',
      confirmButtonColor: '#000'
    })
    return
  }

  if (!selectedDeliveryId.value) {
    await $swal.fire({
      icon: 'warning',
      title: 'Pilih Pengiriman',
      text: 'Mohon pilih opsi pengiriman.',
      confirmButtonColor: '#000'
    })
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch('/api/storefront/checkout', {
      method: 'POST',
      body: {
        customer: customer.value,
        cart: cart.value,
        selectedDeliveryId: selectedDeliveryId.value,
        totalAmount: finalTotal.value
      }
    })

    clearCart()
    isSubmitting.value = false

    // Redirect to transaction detail
    navigateTo(`/transactions/${response.id}`)
  } catch (error) {
    console.error('Checkout failed:', error)
    await $swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.',
      confirmButtonColor: '#000'
    })
    isSubmitting.value = false
  }
}

const mapContainer = ref<HTMLElement | null>(null)

let leafletMap: any = null
let leafletMarker: any = null

function getCurrentLocation() {
  if (navigator.geolocation && leafletMap && leafletMarker) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc: [number, number] = [position.coords.latitude, position.coords.longitude]
        leafletMap.setView(userLoc, 15)
        leafletMarker.setLatLng(userLoc)
        customer.value.lat = userLoc[0]
        customer.value.lng = userLoc[1]
      },
      () => {
        $swal.fire({
          icon: 'error',
          title: 'Akses Lokasi Ditolak',
          text: 'Tidak dapat mengakses lokasi Anda. Mohon pastikan izin lokasi diaktifkan di browser Anda.',
          confirmButtonColor: '#000'
        })
      }
    )
  } else {
    $swal.fire({
      icon: 'error',
      title: 'Tidak Didukung',
      text: 'Browser Anda tidak mendukung fitur lokasi.',
      confirmButtonColor: '#000'
    })
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid SSR issues with Leaflet
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    
    // Fix for Leaflet default icon path issues with bundlers
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    // Default location (e.g. Jakarta)
    const defaultLocation: [number, number] = [-6.2088, 106.8456]
    customer.value.lat = defaultLocation[0]
    customer.value.lng = defaultLocation[1]

    if (mapContainer.value) {
      leafletMap = L.map(mapContainer.value).setView(defaultLocation, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap)

      leafletMarker = L.marker(defaultLocation, { draggable: true, icon: customIcon }).addTo(leafletMap)

      leafletMarker.on('dragend', () => {
        const pos = leafletMarker.getLatLng()
        customer.value.lat = pos.lat
        customer.value.lng = pos.lng
      })

      leafletMap.on('click', (e: any) => {
        leafletMarker.setLatLng(e.latlng)
        customer.value.lat = e.latlng.lat
        customer.value.lng = e.latlng.lng
      })

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc: [number, number] = [position.coords.latitude, position.coords.longitude]
            leafletMap.setView(userLoc, 15)
            leafletMarker.setLatLng(userLoc)
            customer.value.lat = userLoc[0]
            customer.value.lng = userLoc[1]
          },
          () => {
            console.log('Geolocation permission denied or unavailable.')
          }
        )
      }
    }
  }
})
</script>

<template>
  <div class="bg-surface-container-lowest min-h-screen pb-32">
    
    <!-- Empty Cart -->
    <div v-if="cart.length === 0" class="px-6 py-32 text-center">
      <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_cart</span>
      <h2 class="font-headline text-2xl font-bold text-on-surface mb-2">Keranjang kosong</h2>
      <p class="font-body text-on-surface-variant mb-10">Yuk mulai belanja sayur dan buah segar!</p>
      <NuxtLink to="/" class="inline-flex w-full bg-primary text-on-primary font-headline font-bold text-lg rounded-full py-4 justify-center hover:bg-primary-dim transition-colors">
        Mulai Belanja
      </NuxtLink>
    </div>

    <!-- Checkout Layout -->
    <div v-else>
      <div class="px-4 py-4 bg-surface">
        <h1 class="font-headline text-2xl font-extrabold text-on-surface">Checkout</h1>
      </div>

      <!-- Cart Items -->
      <div class="bg-surface-container-lowest px-4 py-2 border-t border-outline-variant/10">
          <div v-for="item in cart" :key="item.id" class="py-4 flex gap-4">
            <img v-if="item.product.image" :src="item.product.image" :alt="item.product.name" class="w-20 h-20 object-cover rounded-xl bg-surface-container" />
            <div v-else class="w-20 h-20 rounded-xl bg-surface-container flex items-center justify-center">
              <span class="material-symbols-outlined text-outline-variant">eco</span>
            </div>
            
            <div class="flex-grow flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start">
                  <h3 class="font-headline font-bold text-on-surface leading-tight">{{ item.product.name }}</h3>
                  <button @click="removeFromCart(item.id)" class="text-error hover:text-error-dim transition-colors">
                    <span class="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
                <p class="font-body text-sm text-on-surface-variant mt-1">
                  {{ item.unit.label }} <span v-if="item.pkg">| {{ item.pkg.name }}</span>
                </p>
              </div>

              <div class="flex justify-between items-end mt-2">
                <span class="font-headline font-bold text-primary">Rp{{ formatPrice(item.totalPrice) }}</span>
                
                <div class="flex items-center bg-surface-container-highest rounded-lg p-0.5 border border-outline-variant/15">
                  <button @click="updateQuantity(item.id, item.quantity - 1)" class="w-8 h-8 rounded-md bg-white text-on-surface-variant flex items-center justify-center active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span class="font-headline font-bold text-sm text-on-surface w-8 text-center">{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, item.quantity + 1)" class="w-8 h-8 rounded-md bg-white text-on-surface-variant flex items-center justify-center active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- Spacer -->
      <div class="h-2 bg-surface-container-low"></div>

      <!-- Delivery Options -->
      <div class="bg-surface-container-lowest px-4 py-6">
        <h2 class="font-headline font-bold text-lg mb-4 text-on-surface">Pilihan Pengiriman</h2>
        <div class="space-y-3">
          <label v-for="delivery in deliveries" :key="delivery.id" class="flex items-center p-4 border rounded-xl cursor-pointer transition-colors" :class="selectedDeliveryId === delivery.id ? 'border-primary bg-primary-container/10' : 'border-outline-variant/30 hover:border-outline'">
            <input type="radio" :value="delivery.id" v-model="selectedDeliveryId" class="w-4 h-4 text-primary bg-surface border-outline focus:ring-primary focus:ring-2" />
            <div class="ml-3 flex-grow">
              <span class="block font-headline font-bold text-on-surface text-sm">{{ delivery.label }}</span>
            </div>
            <div class="text-right">
              <span v-if="delivery.strikeoutPrice" class="block text-xs line-through text-outline-variant">Rp{{ formatPrice(delivery.strikeoutPrice) }}</span>
              <span class="block font-headline font-bold text-primary">Rp{{ formatPrice(delivery.price) }}</span>
            </div>
          </label>
        </div>
      </div>
      
      <!-- Spacer -->
      <div class="h-2 bg-surface-container-low"></div>

      <!-- Customer Details Form -->
      <div class="bg-surface-container-lowest px-4 py-6">
        <h2 class="font-headline font-bold text-lg mb-4 text-on-surface">Detail Pengiriman</h2>
        
        <form @submit.prevent="placeOrder" class="space-y-4" id="checkout-form">
          <div>
            <label class="block font-label text-xs font-bold text-on-surface-variant mb-1 ml-1">Nama Lengkap *</label>
            <input v-model="customer.name" type="text" required class="w-full bg-surface-container-low rounded-xl border-none focus:ring-1 focus:ring-primary px-4 py-3.5 font-body text-sm placeholder:text-outline-variant" placeholder="Masukkan nama Anda" />
          </div>
          <div>
            <label class="block font-label text-xs font-bold text-on-surface-variant mb-1 ml-1">Nomor WhatsApp *</label>
            <input v-model="customer.phone" type="tel" required class="w-full bg-surface-container-low rounded-xl border-none focus:ring-1 focus:ring-primary px-4 py-3.5 font-body text-sm placeholder:text-outline-variant" placeholder="081234567890" />
          </div>
          <div>
            <label class="block font-label text-xs font-bold text-on-surface-variant mb-1 ml-1">Alamat Lengkap *</label>
            <textarea v-model="customer.address" required rows="3" class="w-full bg-surface-container-low rounded-xl border-none focus:ring-1 focus:ring-primary px-4 py-3.5 font-body text-sm placeholder:text-outline-variant resize-none" placeholder="Jalan, RT/RW, Patokan..."></textarea>
          </div>
          <div>
            <label class="block font-label text-xs font-bold text-on-surface-variant mb-1 ml-1">Catatan Tambahan (Opsional)</label>
            <input v-model="customer.notes" type="text" class="w-full bg-surface-container-low rounded-xl border-none focus:ring-1 focus:ring-primary px-4 py-3.5 font-body text-sm placeholder:text-outline-variant" placeholder="Contoh: Titip di pos satpam" />
          </div>
          <div>
            <div class="flex justify-between items-end mb-1 ml-1">
              <label class="block font-label text-xs font-bold text-on-surface-variant">Titik Lokasi (Geser pin pada peta)</label>
              <button type="button" @click="getCurrentLocation" class="flex items-center gap-1 text-primary hover:text-primary-dim transition-colors text-xs font-bold bg-primary-container/20 hover:bg-primary-container/40 px-2 py-1 rounded-md">
                <span class="material-symbols-outlined text-[14px]">my_location</span>
                Lokasi Sekarang
              </button>
            </div>
            <div ref="mapContainer" class="w-full h-64 bg-surface-container-low rounded-xl border border-outline-variant/20 z-0 relative"></div>
            <p class="font-body text-[10px] text-on-surface-variant mt-1 ml-1">
              Lokasi yang dipilih: {{ customer.lat?.toFixed(5) }}, {{ customer.lng?.toFixed(5) }}
            </p>
          </div>
        </form>
      </div>
      
      <!-- Summary details -->
      <div class="h-2 bg-surface-container-low"></div>
      <div class="bg-surface-container-lowest px-4 py-6 mb-8">
        <h2 class="font-headline font-bold text-lg mb-4 text-on-surface">Ringkasan Pembayaran</h2>
        <div class="flex justify-between items-center mb-2">
          <span class="font-body text-sm text-on-surface-variant">Total Belanja</span>
          <span class="font-body text-sm font-semibold text-on-surface">Rp{{ formatPrice(cartTotal) }}</span>
        </div>
        <div class="flex justify-between items-center mb-4">
          <span class="font-body text-sm text-on-surface-variant">Ongkos Kirim</span>
          <span v-if="selectedDelivery" class="font-body text-sm font-semibold text-primary">Rp{{ formatPrice(selectedDelivery.price) }}</span>
          <span v-else class="font-body text-sm font-semibold text-outline-variant">Pilih pengiriman</span>
        </div>
        <div class="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
          <span class="font-headline font-bold text-on-surface">Total Tagihan</span>
          <span class="font-headline text-xl font-extrabold text-primary">Rp{{ formatPrice(finalTotal) }}</span>
        </div>
      </div>

    </div>

    <!-- Mobile Native Floating Checkout Bar -->
    <div v-if="cart.length > 0 && !orderSuccess" class="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl pt-4 pb-6 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 border-t border-outline-variant/15">
      <div class="max-w-screen-md mx-auto flex items-center gap-4">
        <div class="flex-grow hidden sm:block">
          <span class="block font-label text-xs text-on-surface-variant uppercase tracking-widest">Total</span>
          <span class="block font-headline text-2xl font-extrabold text-primary leading-none mt-1">Rp{{ formatPrice(finalTotal) }}</span>
        </div>
        <button type="submit" form="checkout-form" :disabled="isSubmitting" class="w-full sm:w-auto flex-grow sm:flex-grow-0 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-lg rounded-full py-4 px-8 shadow-lg shadow-primary/20 flex justify-center items-center gap-2 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100">
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin">refresh</span>
          <span v-if="isSubmitting">Memproses...</span>
          <template v-else>
            <span>Buat Pesanan</span>
            <span class="sm:hidden ml-1">• Rp{{ formatPrice(finalTotal) }}</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
