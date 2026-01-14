<template>
  <div class="min-h-screen flex flex-col bg-background text-text">
    <header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded bg-accent/40"></div>
          <div class="text-lg font-semibold">阴影测试</div>
          <span class="ml-3 text-xs text-gray-400">Konva 阴影渲染验证</span>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <section class="space-y-4">
        <div class="rounded-xl border border-border bg-card p-2">
          <div class="relative w-full overflow-auto rounded-lg border border-border bg-card">
            <div ref="stageWrap" class="relative w-full min-h-[420px]"></div>
          </div>
        </div>
      </section>

      <aside class="rounded-xl border border-border bg-card p-4 space-y-4">
        <div class="text-sm font-medium">模糊背景测试</div>
        <div class="space-y-3">
          <label class="el-button el-button--primary">
            上传图片
            <input type="file" accept="image/*" class="hidden" @change="onFile" />
          </label>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">启用模糊背景</span>
            <input type="checkbox" v-model="enableBlurBg" @change="scheduleRender" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items中心 gap-2">
              <span class="text-xs w-24">模糊半径</span>
              <input class="el-input__inner w-full" type="range" min="1" max="20" step="1" v-model.number="blurRadius" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">不透明度</span>
              <input class="el-input__inner w-full" type="range" min="0.3" max="0.8" step="0.05" v-model.number="bgOpacity" @input="scheduleRender" />
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Konva from 'konva'
import exampleImageUrl from '../assets/images/example-image.jpg'

const stageWrap = ref<HTMLDivElement | null>(null)
const stageRef = ref<Konva.Stage | null>(null)
const layerRef = ref<Konva.Layer | null>(null)
const imgObjRef = ref<HTMLImageElement | null>(null)
const enableBlurBg = ref(true)
const blurRadius = ref(12)
const bgOpacity = ref(0.5)
let rafId: number | null = null

const scheduleRender = () => { if (rafId) return; rafId = requestAnimationFrame(() => { rafId = null; rebuild() }) }
const onFile = (e: any) => { const file = e.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => { imgObjRef.value = img; scheduleRender() }; img.src = url }

const rebuild = () => {
  const wrap = stageWrap.value!; const w = wrap.clientWidth; const h = Math.max(420, Math.round(w * 0.66))
  if (!stageRef.value) stageRef.value = new Konva.Stage({ container: wrap, width: w, height: h })
  else stageRef.value.size({ width: w, height: h })
  if (layerRef.value && layerRef.value.getStage()) layerRef.value.destroy()
  layerRef.value = new Konva.Layer(); stageRef.value.add(layerRef.value)
  if (!imgObjRef.value) return
  const iw = imgObjRef.value.width; const ih = imgObjRef.value.height
  const bw = Math.min(w - 80, iw); const scale = bw / iw; const iwScaled = Math.round(iw * scale); const ihScaled = Math.round(ih * scale)
  const fx = Math.round((w - iwScaled) / 2); const fy = Math.round((h - ihScaled) / 2)
  const borderPadding = 40
  const matX = Math.max(0, fx - borderPadding)
  const matY = Math.max(0, fy - borderPadding)
  const matW = Math.min(w, iwScaled + borderPadding * 2)
  const matH = Math.min(h, ihScaled + borderPadding * 2)
  const mat = new Konva.Rect({ x: matX, y: matY, width: matW, height: matH, fill: '#ffffff' })
  layerRef.value.add(mat)
  if (enableBlurBg.value) {
    const coverScale = Math.max(matW / iw, matH / ih)
    const bgW = Math.round(iw * coverScale)
    const bgH = Math.round(ih * coverScale)
    const bgX = Math.round(matX + (matW - bgW) / 2)
    const bgY = Math.round(matY + (matH - bgH) / 2)
    const bgImg = new Konva.Image({ image: imgObjRef.value, x: bgX, y: bgY, width: bgW, height: bgH, opacity: bgOpacity.value })
    bgImg.cache()
    bgImg.filters([Konva.Filters.Blur])
    ;(bgImg as any).blurRadius(blurRadius.value)
    layerRef.value.add(bgImg)
  }
  const img = new Konva.Image({ image: imgObjRef.value, x: fx, y: fy, width: iwScaled, height: ihScaled })
  layerRef.value.add(img)
  layerRef.value.draw()
}

onMounted(() => { const img = new Image(); img.onload = () => { imgObjRef.value = img; scheduleRender() }; img.src = exampleImageUrl; window.addEventListener('resize', () => { scheduleRender() }) })
</script>

<style></style>
