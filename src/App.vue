<script setup lang="ts">
import { provideAppData } from './composables/useAppData'

// Provide reactive app data to all child components (both routes)
provideAppData()
</script>

<template>
  <router-view />
</template>
