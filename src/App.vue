<script setup lang="ts">
import { onMounted } from 'vue'
import { provideAppData } from './composables/useAppData'

const appData = provideAppData()

// Load persisted data from server file on mount
onMounted(() => {
  appData.loadData()
})
</script>

<template>
  <router-view />
</template>
