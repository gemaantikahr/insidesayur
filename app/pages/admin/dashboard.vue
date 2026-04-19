<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data } = await useApiFetch('/api/auth/me')

const stats = [
  { name: 'Total Users', stat: '71,897' },
  { name: 'Active Orders', stat: '58.16%' },
  { name: 'Revenue', stat: 'Rp24,574.00' },
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
    
    <div class="mt-6">
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 class="text-lg font-medium text-gray-900">Welcome back, {{ data?.user?.name || 'Administrator' }}!</h2>
        <p class="text-gray-500 mt-1">Here's an overview of your platform's performance.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="mt-6">
      <dl class="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div v-for="item in stats" :key="item.name" class="px-4 py-5 bg-white shadow-sm rounded-lg overflow-hidden sm:p-6 border border-gray-200">
          <dt class="text-sm font-medium text-gray-500 truncate">
            {{ item.name }}
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ item.stat }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
