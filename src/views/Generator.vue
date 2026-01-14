<template>
  <div class="min-h-screen flex flex-col bg-background text-text">
    <header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/" class="flex items-center gap-3 cursor-pointer">
            <div class="w-8 h-8 rounded bg-accent/40"></div>
            <div class="text-lg font-semibold">生成器</div>
          </router-link>
          <span class="ml-3 text-xs text-gray-400">应用模板生成图片</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="el-button el-button--primary" @click="openExport">导出</button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <section class="space-y-4">
        <div class="rounded-xl border border-border bg-card p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-lg border border-border bg-background/60 p-4 flex items-center justify-center min-h-[180px]" @dragover.prevent @drop.prevent="onDrop">
              <div class="text-center">
                <div class="text-sm mb-2">拖拽图片到此或</div>
                <label class="el-button el-button--primary">
                  选择图片
                  <input type="file" accept="image/*" class="hidden" @change="onFile" />
                </label>
                <div class="mt-2 text-xs text-gray-500">支持 JPEG / PNG / WEBP</div>
                <div class="mt-2 text-xs" v-if="loading.parsing">解析 EXIF 中…</div>
                <div class="mt-1 text-xs" v-if="loading.image">加载图片中…</div>
                <div class="mt-3" v-if="imageReady && imageData">
                  <img :src="imageData" alt="预览" class="inline-block max-h-24 rounded border border-border" />
                </div>
              </div>
            </div>
            <div class="rounded-lg border border-border bg-background/60 p-4">
              <ExifInfo :exif="exif" :fields="['Make','Model','ISO','FNumber','ExposureTime','FocalLength','DateTimeOriginal']" />
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-4">
          <div class="text-sm font-medium mb-3">添加元素</div>
          <div class="grid grid-cols-3 gap-2">
            <button class="el-button" @click="addText">文本</button>
            <button class="el-button" @click="addRect">矩形</button>
            <button class="el-button" @click="addIcon">品牌</button>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-2">
          <div class="relative w-full overflow-auto rounded-lg border border-border bg-card">
            <div ref="stageWrap" class="relative w-full min-h-[520px]">
              <div ref="menu" class="context-menu"></div>
            </div>
          </div>
        </div>
      </section>

      <aside class="rounded-xl border border-border bg-card p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">模板</div>
          <button class="el-button el-button--small" @click="goTemplateManager">管理</button>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs w-16">选择</span>
            <select class="el-select w-full" v-model="selectedTemplateId" @change="applySelectedTemplate">
              <option v-for="t in store.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="el-button el-button--small flex-1">
              导入JSON
              <input type="file" accept="application/json" class="hidden" @change="onTemplateFile" />
            </label>
            <button 
              v-if="selectedTemplateId && store.canDelete(selectedTemplateId)"
              class="el-button el-button--small text-red-400 hover:bg-red-500/10" 
              @click="deleteCurrentTemplate"
            >
              删除
            </button>
          </div>
        </div>

        <div class="h-px w-full bg-border my-2"></div>

        <div class="text-sm font-medium">元素编辑</div>
        <div v-if="selectedIndex!==null" class="mt-3 space-y-3 transition-all duration-150">
          <div class="text-xs text-gray-400">选中元素 #{{ selectedIndex }}</div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type==='text'">
            <span class="text-xs w-20">文本</span>
            <input ref="textEditRef" class="el-input__inner w-full" v-model="items[selectedIndex].text" @input="updateSelected('text', items[selectedIndex].text)" />
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type==='text'">
            <span class="text-xs w-20">字体</span>
            <select class="el-select w-full" v-model="items[selectedIndex].fontFamily" @change="updateSelected('fontFamily', items[selectedIndex].fontFamily)">
              <option value="-apple-system">System</option>
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type!=='rect'">
            <span class="text-xs w-20">字号</span>
            <input class="el-input__inner w-full" type="number" min="8" max="96" v-model.number="items[selectedIndex].fontSize" @input="updateSelected('fontSize', items[selectedIndex].fontSize)" />
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type==='icon'">
            <span class="text-xs w-20">品牌</span>
            <select class="el-select w-full" v-model="items[selectedIndex].brand" @change="updateSelected('brand', items[selectedIndex].brand)">
              <option v-for="bk in brandOptions" :key="bk.key" :value="bk.key">{{ bk.label }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">颜色</span>
            <input class="el-input__inner w-full" type="color" v-model="items[selectedIndex].color" @input="updateSelected('color', items[selectedIndex].color)" />
          </div>
          <div class="flex items-center justify-end">
            <button class="el-button el-button--danger" @click="removeSelected">删除元素</button>
          </div>
        </div>

        <div class="h-px w-full bg-border my-2"></div>

        <div class="text-sm font-medium">导出</div>
        <button class="el-button el-button--primary w-full" @click="openExport">导出图片</button>
      </aside>
    </main>

    <div v-if="exporting" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="rounded-xl border border-border bg-card p-6 w-[480px]">
        <div class="text-sm font-medium mb-4">导出图片</div>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">格式</span>
            <select class="el-select w-full" v-model="exportOptions.format" disabled>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="el-button" @click="exporting=false">取消</button>
          <button class="el-button el-button--primary" @click="doExport">导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import { useUploadStore } from '../stores/upload'
import Konva from 'konva'
import { useKonvaTransform } from '../composables/useKonvaTransform'
import * as exifr from 'exifr'
import { computeFrameLayout, drawFrame, createRoundedImageGroup } from '../composables/useFrameLayout'
import ExifInfo from '../components/ExifInfo.vue'
import exampleImageUrl from '../assets/images/example-image.jpg'

const router = useRouter()
const store = useTemplatesStore()
const upload = useUploadStore()
const textEditRef = ref<HTMLInputElement | null>(null)
const stageWrap = ref<HTMLDivElement | null>(null)
const menu = ref<HTMLDivElement | null>(null)
const stageRef = ref<Konva.Stage | null>(null)
const layerRef = ref<Konva.Layer | null>(null)
const imageNodeRef = ref<Konva.Image | null>(null)
const imageData = ref<string | null>(null)
const imgObjRef = ref<HTMLImageElement | null>(null)
const imageReady = ref(false)
const exif = ref<any | null>(null)
const border = reactive({ thickness: 60, top: 0, right: 0, bottom: 60, left: 0, style: 'solid' as 'solid'|'dashed'|'dotted', color: '#ffffff', radius: 0, innerPadding: 0, outerPadding: 0 })
const items = ref<any[]>([])
const selectedIndex = ref<number | null>(null)
const nodes = ref<any[]>([])
const { transformerRef, attach, clear, bindTextTransforms, bindRectTransforms, bindImageTransforms } = useKonvaTransform(layerRef as any, items as any)
const exporting = ref(false)
const exportOptions = reactive({ format: 'png' as 'png', quality: 1 })
const exportPixelRatio = ref(1)
const selectedTemplateId = ref<string | null>(null)
const loading = reactive({ image: false, parsing: false })
const suppressRender = ref(false)
let rafId: number | null = null
let resizeTimer: any = null

const throttle = (fn: (...args: any[]) => void, wait = 16) => {
  let last = 0
  let timeout: any = null
  return (...args: any[]) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      last = now
      fn(...args)
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(() => { last = Date.now(); fn(...args) }, remaining)
    }
  }
}

const formatDate = (d: any) => { if (!d) return '-'; const dt = new Date(d); if (isNaN(dt.getTime())) return String(d); const pad = (x: any)=> String(x).padStart(2,'0'); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}` }

const brandMap: Record<string,string> = { Canon:'canon', Nikon:'nikon', SONY:'sony', Sony:'sony', FUJIFILM:'fujifilm', Fujifilm:'fujifilm', Apple:'apple', Samsung:'samsung', HUAWEI:'huawei', Huawei:'huawei', Xiaomi:'xiaomi', DJI:'dji', GoPro:'gopro' }
const logoUrls = import.meta.glob('../assets/brand-logos/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const getLogoUrl = (brandKey: string): string | undefined => { if (!brandKey) return undefined; const q = brandKey.toLowerCase(); for (const [path, url] of Object.entries(logoUrls)) { const fn = path.split('/').pop()!.toLowerCase(); if (fn.includes(q)) return url } return undefined }
const brandOptions = Object.keys(logoUrls).map(p => { const fn = p.split('/').pop()!; const key = fn.replace(/\.svg$/i,'').toLowerCase(); const label = key; const icon = (logoUrls as any)[p]; return { key, label, icon } }).sort((a,b)=>a.key.localeCompare(b.key))
const resolveBrand = () => { if (!exif.value) return ''; const make = exif.value.Make || ''; for (const k of Object.keys(brandMap)) { if (make.includes(k)) return brandMap[k] } return make || (exif.value.Model || '') }

const scheduleRender = throttle(() => { 
  if (rafId) return
  rafId = requestAnimationFrame(() => { 
    rafId = null
    if (!suppressRender.value) {
      rebuildStage() 
    }
  }) 
}, 16) // 限制到60fps

const rebuildStage = () => {
  const wrap = stageWrap.value!; const w = wrap.clientWidth; const h = Math.max(520, Math.round(w * 0.62))
  if (!stageRef.value) {
    stageRef.value = new Konva.Stage({ container: wrap, width: w, height: h })
  } else {
    stageRef.value.size({ width: w, height: h })
  }
  if (layerRef.value && layerRef.value.getStage()) {
    layerRef.value.destroy()
  }
  layerRef.value = new Konva.Layer()
  stageRef.value.add(layerRef.value as Konva.Layer)
  clear()
  if (imageData.value && imageReady.value && imgObjRef.value) {
    console.log('Rebuilding stage with image:', imgObjRef.value.width, 'x', imgObjRef.value.height)
    
    const layout = computeFrameLayout({ w: imgObjRef.value.width, h: imgObjRef.value.height }, border as any, w)
    stageRef.value!.size({ width: w, height: Math.max(layout.vh, h) })
    
    const { bg } = drawFrame(layerRef.value!, layout, border.color)
    bg.on('click tap', () => { clearSelection() })
    
    bindExifDragDrop()
    exportPixelRatio.value = layout.iwScaled ? Math.max(1, imgObjRef.value.width/layout.iwScaled) : 1
    
    const imgGroup = createRoundedImageGroup(imgObjRef.value, layout)
    const img = imgGroup.getChildren()[0] as Konva.Image
    imageNodeRef.value = img
    layerRef.value!.add(imgGroup)
    
    // 添加所有元素
    nodes.value = []
    items.value.forEach((it, idx) => addItemNode(it, idx))
    
    layerRef.value!.draw()
    console.log('Stage rebuilt successfully')
  } else {
    console.log('Cannot rebuild stage - missing data:', {
      imageData: !!imageData.value,
      imageReady: imageReady.value,
      imgObj: !!imgObjRef.value
    })
  }
}

const addItemNode = (it: any, idx: number) => {
  if (it.type === 'text') {
    const text = new Konva.Text({ x: it.x, y: it.y, text: resolveText(it.text), fontSize: it.fontSize || 16, fontFamily: it.fontFamily || 'Inter', fill: it.color || '#000000' })
    text.on('click', () => { selectItem(idx, text); openEdit() })
    bindTextTransforms(text, idx)
    layerRef.value!.add(text)
    nodes.value[idx] = text
  } else if (it.type === 'rect') {
    const rect = new Konva.Rect({ x: it.x, y: it.y, width: it.w || 120, height: it.h || 24, fill: it.color || '#000000' })
    rect.on('click', () => { selectItem(idx, rect); openEdit() })
    bindRectTransforms(rect, idx)
    layerRef.value!.add(rect)
    nodes.value[idx] = rect
  } else if (it.type === 'icon') {
    const brand = it.brand || resolveBrand()
    const key = brandMap[brand] || brand
    const makeKey = typeof key === 'string' ? key.toLowerCase() : ''
    const assetUrl = getLogoUrl(makeKey)
    if (assetUrl) {
      const url = assetUrl
      const imgObj = new Image()
      imgObj.onload = () => {
        const ratio = imgObj.width / imgObj.height || 1
        let targetH = it.h || 32
        let targetW = it.w || Math.round(targetH * ratio)
        if (it.h && it.w) { targetW = Math.round(targetH * ratio) } else if (it.w && !it.h) { targetH = Math.round(it.w / ratio) }
        const imgNode = new Konva.Image({ image: imgObj, x: it.x, y: it.y, width: targetW, height: Math.round(targetH) })
        imgNode.on('click', () => { selectItem(idx, imgNode); openEdit() })
        bindImageTransforms(imgNode, idx)
        layerRef.value!.add(imgNode)
        nodes.value[idx] = imgNode
        items.value[idx].w = targetW; items.value[idx].h = Math.round(targetH)
        layerRef.value!.draw()
      }
      imgObj.src = url
    } else {
      const text = new Konva.Text({ x: it.x, y: it.y, text: brand || 'Brand', fontSize: it.fontSize || 20, fill: it.color || '#000000' })
      text.on('click', () => { selectItem(idx, text); attach(text); openEdit() })
      layerRef.value!.add(text)
      nodes.value[idx] = text
    }
  }
}
const centerPoint = () => {
  const w = stageRef.value?.width() || 600
  const h = stageRef.value?.height() || 400
  return { x: Math.round(w/2), y: Math.round(h/2) }
}
const addText = () => {
  const c = centerPoint()
  items.value.push({ type: 'text', text: 'Text {ISO}', x: c.x - 60, y: c.y, fontSize: 18, color: '#000000', fontFamily: 'Inter' })
  scheduleRender()
}
const addRect = () => {
  const c = centerPoint()
  items.value.push({ type: 'rect', x: c.x - 60, y: c.y - 20, w: 120, h: 40, color: '#000000' })
  scheduleRender()
}
const addIcon = () => {
  const c = centerPoint()
  const b = resolveBrand()
  items.value.push({ type: 'icon', brand: b, x: c.x - 16, y: c.y - 16, w: 32, h: 32, color: '#000000' })
  scheduleRender()
}
const selectItem = (idx: number, node: any) => { selectedIndex.value = idx }
const clearSelection = () => { selectedIndex.value = null; clear() }
const removeSelected = () => { if (selectedIndex.value==null) return; items.value.splice(selectedIndex.value as number, 1); clearSelection(); scheduleRender() }

const resolveText = (tpl: string) => { if (!exif.value) return tpl; const et = exif.value; const t = Number(et.ExposureTime); const dict: Record<string,string> = {
  ISO: et.ISO != null ? String(et.ISO) : '-',
  FNumber: et.FNumber != null ? Number(et.FNumber).toFixed(1) : '-',
  Exposure: et.ExposureTime != null ? (t >= 1 ? `${t.toFixed(1)}s` : String(Math.round(1/t))) : '-',
  Focal: et.FocalLength != null ? String(Math.round(Number(et.FocalLength))) : '-',
  Make: et.Make || '-',
  Model: et.Model || '-',
  Date: formatDate(et.DateTimeOriginal)
}; return tpl.replace(/\{([^}]+)\}/g, (_, k) => { const v = dict[k]; if (v!=null) return v; const raw = (et as any)[k]; return raw!=null ? String(raw) : `{${k}}` }) }

const loadImage = (url: string) => { 
  console.log('Loading image:', url)
  imageReady.value = false
  loading.image = true
  
  const img = new Image()
  img.onload = () => { 
    console.log('Image loaded successfully:', img.width, 'x', img.height)
    imgObjRef.value = img
    imageReady.value = true
    loading.image = false
    scheduleRender()
    applySelectedTemplate()
  }
  img.onerror = (error) => {
    console.error('Image loading failed:', error)
    loading.image = false
  }
  img.src = url 
}
const onFile = async (e: any) => { const file = e.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); imageData.value = url; loadImage(url); try { loading.parsing = true; exif.value = await (exifr as any).parse(file); loading.parsing = false; } catch { loading.parsing = false } }
const onDrop = async (e: DragEvent) => { const file = (e.dataTransfer as DataTransfer).files[0]; if (!file) return; const name = (file.name || '').toLowerCase(); const isJson = name.endsWith('.json') || (file.type || '').includes('json'); if (isJson) { try { const text = await file.text(); const tpl = JSON.parse(text); applyTemplateObject(tpl) } catch {} return } const url = URL.createObjectURL(file); imageData.value = url; loadImage(url); try { loading.parsing = true; exif.value = await (exifr as any).parse(file); loading.parsing = false; } catch { loading.parsing = false } }
const onTemplateFile = async (e: any) => { const file = e.target.files[0]; if (!file) return; try { const text = await file.text(); const tpl = JSON.parse(text); applyTemplateObject(tpl) } catch {} e.target.value = '' }
const applyTemplateObject = (tpl: any) => { if (!tpl || typeof tpl !== 'object') return; if (tpl.border) Object.assign(border, tpl.border); if (Array.isArray(tpl.items)) items.value = tpl.items; scheduleRender() }

const updateSelected = (field: string, value: any) => { if (selectedIndex.value==null) return; const it = items.value[selectedIndex.value as number]; it[field] = value; scheduleRender() }
const applySelectedTemplate = () => { if (!selectedTemplateId.value) return; const tpl = store.templates.find(t => t.id === selectedTemplateId.value); if (!tpl) return; Object.assign(border, tpl.border); items.value = tpl.items || []; scheduleRender() }
const openEdit = () => { if (textEditRef.value) textEditRef.value.focus() }

const openExport = () => { exporting.value = true }
const doExport = () => { if (!stageRef.value) return; const mime = 'image/png'; const pr = exportPixelRatio.value || 1; const dataURL = stageRef.value!.toDataURL({ mimeType: mime, pixelRatio: pr }); const a = document.createElement('a'); a.href = dataURL; a.download = 'photo.png'; a.click(); exporting.value = false }

const goTemplateManager = () => { router.push('/templates') }

const deleteCurrentTemplate = () => {
  if (!selectedTemplateId.value) return
  
  const template = store.templates.find(t => t.id === selectedTemplateId.value)
  if (!template) return
  
  if (confirm(`确定要删除模板 "${template.name}" 吗？此操作不可撤销。`)) {
    const success = store.delete(selectedTemplateId.value)
    if (success) {
      // 选择第一个可用模板
      selectedTemplateId.value = store.templates[0]?.id || null
      applySelectedTemplate()
      alert('模板已删除')
    } else {
      alert('删除失败')
    }
  }
}

onMounted(async () => {
  // 加载模板
  store.load()
  console.log('Templates loaded:', store.templates.length)
  
  // 设置默认模板
  selectedTemplateId.value = (store.templates.find(t=>t.id==='default')?.id) || store.templates[0]?.id || null
  console.log('Selected template ID:', selectedTemplateId.value)
  
  // 初始化画布
  scheduleRender()
  
  // 设置事件监听器
  window.addEventListener('resize', () => { 
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(scheduleRender, 120) 
  })
  
  if (stageWrap.value && 'ResizeObserver' in window) { 
    const ro = new ResizeObserver(() => { 
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(scheduleRender, 120) 
    })
    ro.observe(stageWrap.value) 
  }
  
  window.addEventListener('keydown', (e) => { 
    if (e.key === 'Delete') { 
      const ae = document.activeElement as HTMLElement | null
      const tag = (ae?.tagName || '').toLowerCase()
      if (tag==='input' || tag==='textarea') return
      removeSelected() 
    } 
  })
  // 检查是否有从首页传来的图片数据
  if (upload.objectUrl && upload.file) {
    console.log('Loading image from upload store:', upload.objectUrl)
    imageData.value = upload.objectUrl
    loadImage(upload.objectUrl)
    
    // 解析EXIF信息
    try { 
      loading.parsing = true
      exif.value = await (exifr as any).parse(upload.file)
      loading.parsing = false
      console.log('EXIF parsed:', exif.value)
    } catch (error) { 
      console.warn('EXIF parsing failed:', error)
      loading.parsing = false 
    }
    
    // 清理upload store
    upload.clear()
  } else {
    console.log('No image data in upload store, loading example image')
    // 如果没有上传的图片，使用示例图片
    imageData.value = exampleImageUrl
    loadImage(exampleImageUrl)
    
    // 设置示例EXIF数据
    exif.value = {
      Make: 'Canon',
      Model: 'EOS R6',
      ISO: 400,
      FNumber: 2.8,
      ExposureTime: 0.01,
      FocalLength: 50,
      DateTimeOriginal: new Date().toISOString()
    }
  }
})

let exifDragBound = false
const bindExifDragDrop = () => {
  if (exifDragBound || !stageRef.value) return
  exifDragBound = true
  const el = stageRef.value!.container()
  el.addEventListener('dragover', (e: DragEvent) => {
    const dt = e.dataTransfer
    if (dt && Array.from(dt.types).includes('application/exif-field')) { e.preventDefault(); dt.dropEffect = 'copy' }
  })
  el.addEventListener('drop', (e: DragEvent) => {
    const dt = e.dataTransfer
    if (!dt) return
    const t = dt.getData('application/exif-field')
    if (!t) return
    e.preventDefault()
    let data: any = null
    try { data = JSON.parse(t) } catch {}
    if (!data) return
    const rect = el.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    const key = String(data.key || '')
    const map: Record<string,{en:string;ph:string}> = {
      ISO:{ en:'ISO', ph:'ISO' },
      FNumber:{ en:'Aperture', ph:'FNumber' },
      ExposureTime:{ en:'Shutter', ph:'Exposure' },
      FocalLength:{ en:'Focal', ph:'Focal' },
      Make:{ en:'Make', ph:'Make' },
      Model:{ en:'Model', ph:'Model' },
      DateTimeOriginal:{ en:'Date', ph:'Date' },
    }
    const en = (map[key]?.en) || key || 'Field'
    const ph = (map[key]?.ph) || key
    const text = `${en} {${ph}}`
    items.value.push({ type: 'text', text, x, y, fontSize: 18, color: '#000000' })
    scheduleRender()
  })
}

watch(border, () => { scheduleRender() }, { deep: true })
watch(imageData, () => { scheduleRender() })
watch(exif, () => { scheduleRender() })
</script>

<style></style>
