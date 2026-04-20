<script setup lang="ts">
import { ArrowLeft, Clock, MapPin, Package, CheckCircle2 } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const route = useRoute()
const transactionId = route.params.id

const { data: transaction, pending, error } = await useFetch<any>(`/api/storefront/transactions/${transactionId}`)

if (error.value || !transaction.value) {
  if (!import.meta.server) {
    alert('Transaksi tidak ditemukan.')
    navigateTo('/')
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}
</script>

<template>
  <div class="bg-surface-container-lowest min-h-screen pb-20">
    <!-- Header -->
    <header class="bg-surface border-b border-outline-variant/15 sticky top-0 z-30">
      <div class="max-w-screen-md mx-auto px-4 h-16 flex items-center gap-3">
        <NuxtLink to="/" class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-95 transition-colors text-on-surface-variant">
          <ArrowLeft class="w-6 h-6" />
        </NuxtLink>
        <h1 class="font-headline text-xl font-bold text-on-surface">Detail Transaksi</h1>
      </div>
    </header>

    <div v-if="pending" class="px-6 py-20 text-center">
      <span class="material-symbols-outlined text-4xl text-primary animate-spin mb-4">refresh</span>
      <p class="font-body text-on-surface-variant">Memuat data transaksi...</p>
    </div>

    <div v-else-if="transaction" class="max-w-screen-md mx-auto">
      
      <!-- Status Banner -->
      <div class="bg-primary-container px-6 py-8 text-center border-b border-primary/10">
        <div class="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Clock class="w-8 h-8" />
        </div>
        <h2 class="font-headline text-2xl font-extrabold text-on-primary-container mb-1">
          {{ transaction.status }}
        </h2>
        <p class="font-body text-sm text-on-primary-container/80">
          ID: <span class="font-mono text-xs">{{ transaction.id.split('-')[0] }}...</span>
        </p>
      </div>

      <!-- Transaction Info -->
      <div class="px-4 py-6 bg-surface">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <Package class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-headline font-bold text-on-surface leading-tight">Informasi Pesanan</h3>
            <p class="font-body text-xs text-on-surface-variant mt-0.5">{{ formatDate(transaction.createdAt) }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Items -->
          <div v-for="item in transaction.items" :key="item.id" class="flex gap-4">
            <div class="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-outline-variant">eco</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-headline font-bold text-on-surface text-sm">{{ item.product.name }}</h4>
              <p class="font-body text-xs text-on-surface-variant mt-0.5">
                {{ item.unit.label }} <span v-if="item.package">| {{ item.package.name }}</span>
              </p>
              <div class="flex justify-between items-end mt-2">
                <span class="font-body text-xs text-on-surface-variant">{{ item.quantity }}x Rp{{ formatPrice(item.price) }}</span>
                <span class="font-headline font-bold text-sm text-on-surface">Rp{{ formatPrice(item.totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="h-2 bg-surface-container-low"></div>

      <!-- Delivery Info -->
      <div class="px-4 py-6 bg-surface">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <MapPin class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-headline font-bold text-on-surface leading-tight">Detail Pengiriman</h3>
            <p class="font-body text-xs text-on-surface-variant mt-0.5">{{ transaction.delivery.label }}</p>
          </div>
        </div>

        <div class="space-y-3 font-body text-sm text-on-surface-variant">
          <div>
            <span class="block text-xs font-bold uppercase tracking-wider text-outline mb-0.5">Nama</span>
            <span class="text-on-surface">{{ transaction.customerName }}</span>
          </div>
          <div>
            <span class="block text-xs font-bold uppercase tracking-wider text-outline mb-0.5">WhatsApp</span>
            <span class="text-on-surface">{{ transaction.customerPhone }}</span>
          </div>
          <div>
            <span class="block text-xs font-bold uppercase tracking-wider text-outline mb-0.5">Alamat Lengkap</span>
            <span class="text-on-surface">{{ transaction.customerAddress }}</span>
          </div>
          <div v-if="transaction.customerNotes">
            <span class="block text-xs font-bold uppercase tracking-wider text-outline mb-0.5">Catatan</span>
            <span class="text-on-surface">{{ transaction.customerNotes }}</span>
          </div>
        </div>
      </div>

      <div class="h-2 bg-surface-container-low"></div>

      <!-- Payment Summary -->
      <div class="px-4 py-6 bg-surface mb-8">
        <h3 class="font-headline font-bold text-lg text-on-surface mb-4">Ringkasan Pembayaran</h3>
        
        <div class="space-y-2 mb-4">
          <div class="flex justify-between">
            <span class="font-body text-sm text-on-surface-variant">Total Harga ({{ transaction.items.reduce((acc, item) => acc + item.quantity, 0) }} barang)</span>
            <span class="font-body text-sm text-on-surface">Rp{{ formatPrice(transaction.totalAmount - transaction.deliveryPrice) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-body text-sm text-on-surface-variant">Ongkos Kirim ({{ transaction.delivery.label }})</span>
            <span class="font-body text-sm text-on-surface">Rp{{ formatPrice(transaction.deliveryPrice) }}</span>
          </div>
        </div>

        <div class="pt-4 border-t border-outline-variant/15 flex justify-between items-center">
          <span class="font-headline font-bold text-on-surface">Total Tagihan</span>
          <span class="font-headline text-xl font-extrabold text-primary">Rp{{ formatPrice(transaction.totalAmount) }}</span>
        </div>
      </div>

      <div class="px-4 pb-8">
        <a :href="`https://wa.me/6281234567890?text=Halo%20min,%20saya%20mau%20konfirmasi%20pesanan%20dengan%20ID%20${transaction.id}`" target="_blank" class="w-full bg-[#25D366] text-white font-headline font-bold text-lg rounded-full py-4 flex justify-center items-center gap-2 hover:bg-[#1ebd5b] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20">
          <span class="material-symbols-outlined">chat</span>
          Konfirmasi via WhatsApp
        </a>
      </div>

    </div>
  </div>
</template>
