<template>
  <div class="konva-canvas-wrapper">
    <div 
      ref="stageWrap" 
      class="relative w-full overflow-hidden rounded-lg border border-border bg-card"
      :style="{ minHeight: minHeight + 'px' }"
    >
      <!-- 网格背景 -->
      <div v-if="showGrid" class="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
        <div class="text-center space-y-3">
          <div class="w-8 h-8 mx-auto border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div class="text-sm text-muted">{{ loadingText }}</div>
        </div>
      </div>
      
      <!-- 右键菜单 -->
      <div ref="contextMenu" class="context-menu">
        <button @click="$emit('edit-selected')" v-if="hasSelection">编辑</button>
        <button @click="$emit('duplicate-selected')" v-if="hasSelection">复制</button>
        <button @click="$emit('delete-selected')" v-if="hasSelection" class="text-red-400">删除</button>
        <div class="border-t border-border my-1" v-if="hasSelection"></div>
        <button @click="$emit('add-text')">添加文本</button>
        <button @click="$emit('add-rect')">添加矩形</button>
      </div>
      
      <!-- 选择提示 -->
      <div v-if="showSelectionHint && !hasSelection" class="absolute top-4 left-4 text-xs text-muted bg-card/80 px-2 py-1 rounded">
        点击元素进行选择，拖拽移动位置
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="flex items-center justify-between mt-3 px-2">
      <div class="flex items-center gap-2">
        <button 
          class="text-xs px-2 py-1 rounded border border-border hover:bg-layer transition-colors"
          :class="{ 'bg-accent text-white border-accent': showGrid }"
          @click="$emit('toggle-grid')"
        >
          网格
        </button>
        <button 
          class="text-xs px-2 py-1 rounded border border-border hover:bg-layer transition-colors"
          @click="$emit('fit-to-screen')"
        >
          适应屏幕
        </button>
      </div>
      
      <div class="flex items-center gap-2 text-xs text-muted">
        <span v-if="stageSize.width">{{ stageSize.width }} × {{ stageSize.height }}</span>
        <span v-if="selectedIndex !== null">选中: #{{ selectedIndex + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  minHeight?: number
  loading?: boolean
  loadingText?: string
  showGrid?: boolean
  selectedIndex?: number | null
  showSelectionHint?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: 420,
  loading: false,
  loadingText: '加载中...',
  showGrid: false,
  selectedIndex: null,
  showSelectionHint: true
})

const emit = defineEmits<{
  'edit-selected': []
  'duplicate-selected': []
  'delete-selected': []
  'add-text': []
  'add-rect': []
  'toggle-grid': []
  'fit-to-screen': []
  'context-menu': [x: number, y: number]
}>()

const stageWrap = ref<HTMLDivElement | null>(null)
const contextMenu = ref<HTMLDivElement | null>(null)
const stageSize = ref({ width: 0, height: 0 })

const hasSelection = computed(() => props.selectedIndex !== null)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // 监听容器大小变化
  if (stageWrap.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        stageSize.value = {
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height)
        }
      }
    })
    resizeObserver.observe(stageWrap.value)
  }
  
  // 监听右键菜单
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  document.removeEventListener('click', closeContextMenu)
})

const closeContextMenu = () => {
  if (contextMenu.value) {
    contextMenu.value.style.display = 'none'
  }
}

const showContextMenu = (x: number, y: number) => {
  if (contextMenu.value) {
    contextMenu.value.style.left = `${x}px`
    contextMenu.value.style.top = `${y}px`
    contextMenu.value.style.display = 'block'
  }
  emit('context-menu', x, y)
}

defineExpose({
  stageWrap,
  showContextMenu,
  closeContextMenu
})
</script>

<style scoped>
.grid-bg {
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.context-menu {
  position: absolute;
  min-width: 140px;
  background: var(--layer);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  display: none;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.context-menu button {
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.15s ease;
}

.context-menu button:hover {
  background: rgba(255,255,255,0.05);
}
</style>