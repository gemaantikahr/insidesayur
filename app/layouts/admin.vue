<script setup lang="ts">
import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Folder, Package } from 'lucide-vue-next'

const isSidebarOpen = ref(true)

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/categories', icon: Folder },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Users', href: '#', icon: Users },
  { name: 'Settings', href: '#', icon: Settings },
]

const logout = async () => {
  await useApi('/api/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside :class="['bg-white border-r border-gray-200 transition-all duration-300 flex flex-col', isSidebarOpen ? 'w-64' : 'w-20']">
      <div class="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <div class="h-8 w-8 bg-black rounded flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-sm">IS</span>
        </div>
        <span v-if="isSidebarOpen" class="ml-3 font-semibold text-gray-900 truncate">InsideSayur</span>
      </div>
      
      <div class="flex-1 py-4 overflow-y-auto">
        <nav class="px-3 space-y-1">
          <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900" active-class="bg-gray-100 text-gray-900">
            <component :is="item.icon" :class="['shrink-0 h-5 w-5', isSidebarOpen ? 'mr-3' : 'mx-auto']" />
            <span v-if="isSidebarOpen">{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>
      
      <div class="p-4 border-t border-gray-200">
        <button @click="logout" class="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
          <LogOut :class="['shrink-0 h-5 w-5 group-hover:text-red-600', isSidebarOpen ? 'mr-3' : 'mx-auto']" />
          <span v-if="isSidebarOpen">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top header -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="isSidebarOpen = !isSidebarOpen" class="text-gray-500 hover:text-gray-700 focus:outline-none">
            <Menu class="h-6 w-6" />
          </button>
        </div>
        <div class="flex items-center space-x-4">
          <button class="text-gray-400 hover:text-gray-500">
            <Bell class="h-5 w-5" />
          </button>
          <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span class="text-sm font-medium text-gray-600">A</span>
          </div>
        </div>
      </header>

      <!-- Main content area -->
      <main class="flex-1 p-6 sm:p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
