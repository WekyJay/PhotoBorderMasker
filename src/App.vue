<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 本文件仅作为应用入口和页面调度器使用
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('[GlobalError]', (e as any).error || e.message)
  })
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[UnhandledRejection]', (e as any).reason)
  })
}
</script>

<style></style>

