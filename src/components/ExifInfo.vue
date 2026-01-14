<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <div class="text-sm font-medium">EXIF</div>
      <button class="el-button el-button--small" @click="collapsed = !collapsed">{{ collapsed ? '展开' : '收起' }}</button>
    </div>
    <div v-if="exif && !collapsed">
      <div :class="`grid grid-cols-${columns} gap-y-2 text-xs`">
        <div
          v-for="p in entries"
          :key="p.key"
          class="cursor-move select-none hover:border hover:border-gray-400 hover:rounded px-2 border border-transparent box-border"
          draggable="true"
          @dragstart="onDragStart(p)"
        >{{ p.label }}：{{ p.value }}</div>
      </div>
    </div>
    <div v-else-if="!exif" class="text-xs text-gray-500">{{ emptyText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import { EXIF_FIELDS, EXIF_LABELS, formatExifField } from '../utils/exif'

const props = defineProps({
  exif: { type: Object as PropType<Record<string, any> | null>, default: null },
  fields: { type: Array as PropType<string[]>, default: () => [] },
  columns: { type: Number, default: 2 },
  emptyText: { type: String, default: '待上传图片或未解析到 EXIF' },
  collapsible: { type: Boolean, default: true },
  defaultCollapsed: { type: Boolean, default: false },
})

const usedFields = computed(() => (props.fields && props.fields.length ? props.fields : EXIF_FIELDS))
const entries = computed(() => usedFields.value.map(k => ({ key: k, label: EXIF_LABELS[k] || k, value: formatExifField(k, (props.exif as any)?.[k], props.exif || {}) })))

const collapsed = ref(props.collapsible ? props.defaultCollapsed : false)

const onDragStart = (p: { key:string; label:string; value:string }) => {
  try {
    const dt = (event as DragEvent).dataTransfer
    if (!dt) return
    const payload = JSON.stringify({ key: p.key, label: p.label, value: p.value })
    dt.setData('application/exif-field', payload)
    dt.setData('text/plain', `${p.label}：${p.value}`)
    dt.effectAllowed = 'copy'
  } catch {}
}
</script>

<style></style>
