<script setup lang="ts">
const { cartItemCount } = useCart()
</script>

<template>
  <div class="min-h-screen bg-surface text-on-surface font-body antialiased">
    <!-- Header -->
    <header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
      <div class="flex justify-between items-center px-6 h-16 w-full max-w-screen-xl mx-auto">
        <div class="flex items-center gap-4">
          <span class="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 active:duration-150 cursor-pointer">menu</span>
        </div>
        <NuxtLink to="/" class="font-headline text-2xl font-bold tracking-tight text-primary">dinosayurus</NuxtLink>
        <NuxtLink to="/checkout" class="flex items-center gap-4 relative">
          <span class="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 active:duration-150 cursor-pointer">shopping_bag</span>
          <span v-if="cartItemCount > 0" class="absolute -top-1 -right-1.5 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{{ cartItemCount > 9 ? '9+' : cartItemCount }}</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Main content -->
    <main class="pt-20 pb-28">
      <div class="px-6 max-w-screen-xl mx-auto">
        <slot />
      </div>
    </main>

    <!-- Bottom nav -->
    <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-6 bg-surface rounded-t-3xl z-50 shadow-[0_-4px_32px_rgba(28,109,37,0.06)] border-t border-outline-variant/10">
      <NuxtLink to="/" class="flex flex-col items-center justify-center bg-on-primary text-primary rounded-full px-5 py-1.5 transition-all active:scale-90 duration-200">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">potted_plant</span>
        <span class="font-label text-[10px] font-semibold uppercase tracking-widest mt-0.5">Market</span>
      </NuxtLink>
      <div class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-all active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">local_florist</span>
        <span class="font-label text-[10px] font-semibold uppercase tracking-widest mt-0.5">Garden</span>
      </div>
      <NuxtLink to="/checkout" class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-all active:scale-90 duration-200 cursor-pointer relative">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="font-label text-[10px] font-semibold uppercase tracking-widest mt-0.5">Cart</span>
        <span v-if="cartItemCount > 0" class="absolute -top-1 -right-2 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{{ cartItemCount > 9 ? '9+' : cartItemCount }}</span>
      </NuxtLink>
      <div class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-all active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">person</span>
        <span class="font-label text-[10px] font-semibold uppercase tracking-widest mt-0.5">Profile</span>
      </div>
    </nav>
  </div>
</template>
