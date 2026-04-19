<script setup lang="ts">
const router = useRouter()
const { cartItemCount } = useCart()
</script>

<template>
  <div class="min-h-screen bg-surface text-on-surface font-body antialiased">
    <!-- Transparent overlaid header -->
    <header class="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md">
      <div class="flex justify-between items-center px-4 h-14 w-full max-w-screen-xl mx-auto">
        <button
          @click="router.back()"
          class="w-10 h-10 rounded-full bg-surface/60 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-surface transition-colors active:scale-95"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <NuxtLink to="/" class="font-headline text-lg font-black text-primary uppercase tracking-widest">dinosayurus</NuxtLink>
        <NuxtLink to="/checkout" class="w-10 h-10 rounded-full bg-surface/60 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-surface transition-colors active:scale-95 relative">
          <span class="material-symbols-outlined">shopping_bag</span>
          <span v-if="cartItemCount > 0" class="absolute top-0 right-0 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface/50">{{ cartItemCount > 9 ? '9+' : cartItemCount }}</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Full-bleed content (no padding wrapper) -->
    <main>
      <slot />
    </main>
  </div>
</template>
