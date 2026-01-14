<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="cancel">
    <div class="rounded-xl border border-border bg-card p-6 w-[400px] max-w-[90vw]">
      <div class="flex items-center gap-3 mb-4">
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center"
          :class="{
            'bg-red-500/20 text-red-400': type === 'danger',
            'bg-yellow-500/20 text-yellow-400': type === 'warning',
            'bg-blue-500/20 text-blue-400': type === 'info'
          }"
        >
          <svg v-if="type === 'danger'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <svg v-else-if="type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <div class="text-lg font-medium">{{ title }}</div>
        </div>
      </div>
      
      <div class="text-sm text-gray-400 mb-6">
        {{ message }}
      </div>
      
      <div class="flex justify-end gap-2">
        <button class="el-button" @click="cancel">{{ cancelText }}</button>
        <button 
          class="el-button"
          :class="{
            'el-button--danger': type === 'danger',
            'el-button--primary': type !== 'danger'
          }"
          @click="confirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  type?: 'danger' | 'warning' | 'info'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: '确认',
  cancelText: '取消'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>