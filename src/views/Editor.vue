<template>
  <div class="min-h-screen flex flex-col bg-background text-text">
    <header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items中心 gap-3">
          <router-link to="/" class="flex items-center gap-3 cursor-pointer">
            <div class="w-8 h-8 rounded bg-accent/40"></div>
            <div class="text-lg font-semibold">Photo Border Masker</div>
          </router-link>
          <span class="ml-3 text-xs text-gray-400">纯暗色 · 本地处理</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="el-button" @click="undo">撤销</button>
          <button class="el-button" @click="redo">重做</button>
          <button class="el-button el-button--primary" @click="openExport">导出</button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <section class="space-y-4">
        <div class="rounded-xl border border-border bg-card p-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="w-full rounded-lg border border-border bg-background/60 p-4">
              <ExifInfo :exif="exif" />
            </div>
            
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-2">
          <div class="relative w-full overflow-auto rounded-lg border border-border bg-card">
            <div ref="stageWrap" class="relative w-full min-h-[420px]">
              <div ref="bgFx" class="absolute pointer-events-none"></div>
              <div ref="imgFx" class="absolute pointer-events-none"></div>
              <div ref="menu" class="context-menu">
                <button @click="openEdit">编辑</button>
                <button @click="removeSelected">删除</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="rounded-xl border border-border bg-card p-4 space-y-4">
        <div class="text-sm font-medium">边框设置</div>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs w-20">上边</span>
              <input class="el-input__inner w-full" type="number" min="0" max="200" v-model.number="border.top" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-20">右边</span>
              <input class="el-input__inner w-full" type="number" min="0" max="200" v-model.number="border.right" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-20">下边</span>
              <input class="el-input__inner w-full" type="number" min="0" max="200" v-model.number="border.bottom" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-20">左边</span>
              <input class="el-input__inner w-full" type="number" min="0" max="200" v-model.number="border.left" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">圆角</span>
            <input class="el-input__inner w-full" type="number" min="0" max="120" v-model.number="border.radius" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">内距</span>
            <input class="el-input__inner w-full" type="number" min="0" max="240" v-model.number="border.innerPadding" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">外距</span>
            <input class="el-input__inner w-full" type="number" min="0" max="240" v-model.number="border.outerPadding" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">颜色</span>
            <input class="el-input__inner w-full" type="color" v-model="border.color" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">样式</span>
            <select class="el-select w-full" v-model="border.style">
              <option value="solid">solid</option>
              <option value="dashed">dashed</option>
              <option value="dotted">dotted</option>
            </select>
          </div>
        </div>

        <div class="h-px w-full bg-border my-2"></div>

        <div class="text-sm font-medium">图片效果</div>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">启用阴影</span>
            <input type="checkbox" v-model="imageFx.enableShadow" @change="scheduleRender" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">预设</span>
            <select class="el-select w-full" v-model="imageFx.preset" @change="scheduleRender">
              <option value="soft-shadow">soft-shadow</option>
              <option value="deep-shadow">deep-shadow</option>
              <option value="inner-shadow">inner-shadow</option>
              <option value="glow-effect">glow-effect</option>
              <option value="multi-shadow">multi-shadow</option>
              <option value="custom">custom</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">角度</span>
              <input class="el-input__inner w-full" type="range" min="0" max="360" step="1" v-model.number="imageFx.angleDeg" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">距离</span>
              <input class="el-input__inner w-full" type="range" min="0" max="48" step="1" v-model.number="imageFx.distance" @input="scheduleRender" />
            </div>
          </div>
          <div v-if="imageFx.preset==='custom'" class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">X偏移</span>
              <input class="el-input__inner w-full" type="number" min="-48" max="48" v-model.number="imageFx.custom.x" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">Y偏移</span>
              <input class="el-input__inner w-full" type="number" min="-48" max="48" v-model.number="imageFx.custom.y" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">模糊</span>
              <input class="el-input__inner w-full" type="number" min="0" max="48" v-model.number="imageFx.custom.blur" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">扩散</span>
              <input class="el-input__inner w-full" type="number" min="0" max="24" v-model.number="imageFx.custom.spread" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2 col-span-2">
              <span class="text-xs w-24">颜色</span>
              <input class="el-input__inner w-full" type="color" v-model="imageFx.custom.color" @input="scheduleRender" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">模糊边框</span>
            <input type="checkbox" v-model="imageFx.enableBlurBorder" @change="scheduleRender" />
          </div>
          <div class="grid grid-cols-2 gap-2" v-if="imageFx.enableBlurBorder">
            <div class="flex items-center gap-2">
              <span class="text-xs w-24">半径</span>
              <input class="el-input__inner w-full" type="range" min="1" max="30" step="1" v-model.number="imageFx.blurRadius" @input="scheduleRender" />
            </div>
            <div class="flex items-center gap-2 col-span-2">
              <span class="text-xs w-24">主色</span>
              <input type="checkbox" v-model="imageFx.autoColor" @change="applyAutoColor" />
              <input class="el-input__inner w-full" type="color" v-model="imageFx.blurColor" @input="scheduleRender" />
            </div>
          </div>
        </div>

        <div class="text-sm font-medium">元素</div>
        <div class="flex flex-wrap gap-2">
          <button class="el-button" @click="addText('ISO {ISO}')">添加文本</button>
          <button class="el-button" @click="addBrandIcon">添加品牌图标</button>
          <button class="el-button" @click="addRect">添加矩形</button>
        </div>

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
              <option value="Courier New">Courier New</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type!=='rect'">
            <span class="text-xs w-20">字号</span>
            <input class="el-input__inner w-full" type="number" min="8" max="96" step="1" :value="Math.round(items[selectedIndex].fontSize || 0)" @input="updateSelected('fontSize', Math.round(Number(($event.target as HTMLInputElement).value)))" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-20">颜色</span>
            <input class="el-input__inner w-full" type="color" v-model="items[selectedIndex].color" @input="updateSelected('color', items[selectedIndex].color)" />
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type==='rect' || items[selectedIndex]?.type==='icon'">
            <span class="text-xs w-20">宽度</span>
            <input class="el-input__inner w-full" type="number" min="8" max="2000" v-model.number="items[selectedIndex].w" @input="updateSelected('w', items[selectedIndex].w)" />
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type==='rect' || items[selectedIndex]?.type==='icon'">
            <span class="text-xs w-20">高度</span>
            <input class="el-input__inner w-full" type="number" min="8" max="2000" v-model.number="items[selectedIndex].h" @input="updateSelected('h', items[selectedIndex].h)" />
          </div>
          <div class="flex items-center gap-2" v-if="items[selectedIndex]?.type==='icon'">
            <span class="text-xs w-20">品牌</span>
            <el-select class="w-full" v-model="items[selectedIndex].brand" @change="updateSelected('brand', items[selectedIndex].brand)">
              <el-option v-for="bk in brandOptions" :key="bk.key" :label="bk.label" :value="bk.key">
                <div class="flex items-center gap-2">
                  <img v-if="bk.icon" :src="bk.icon" alt="" class="w-5 h-5" />
                  <span>{{ bk.label }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
          <div v-if="items[selectedIndex]?.type==='text' && extractKeys(items[selectedIndex].text).length" class="space-y-2">
            <div class="text-xs text-gray-400">参数</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2" v-for="pf in getPlaceholderFields(items[selectedIndex].text)" :key="pf.field">
                <span class="text-xs w-20">{{ pf.label }}</span>
                <input class="el-input__inner w-full" type="text" :value="exif?.[pf.field] ?? ''" @input="onParamInput(pf.field, ($event.target as HTMLInputElement).value)" />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end">
            <button class="el-button el-button--danger" @click="removeSelected">删除元素</button>
          </div>
        </div>

        <div class="h-px w-full bg-border my-2"></div>

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
          <div class="grid grid-cols-2 gap-2">
            <button class="el-button el-button--primary" @click="saveCurrentTemplate">保存</button>
            <button class="el-button" @click="newTemplate">新建</button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="el-button" @click="exportCurrentTemplate">导出</button>
            <label class="el-button">
              导入
              <input type="file" accept="application/json" class="hidden" @change="importTemplate" />
            </label>
          </div>
          <div v-if="selectedTemplateId && store.canDelete(selectedTemplateId)" class="pt-1">
            <button 
              class="el-button el-button--danger w-full" 
              @click="deleteCurrentTemplate"
            >
              删除当前模板
            </button>
          </div>
        </div>
      </aside>
    </main>

    <div v-if="exporting" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="rounded-xl border border-border bg-card p-6 w-[480px]">
        <div class="text-sm font-medium mb-4">导出图片</div>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">格式</span>
            <select class="el-select w-full" v-model="exportOptions.format">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
            </select>
          </div>
          <div class="flex items-center gap-2" v-if="exportOptions.format!=='png'">
            <span class="text-xs w-24">质量</span>
            <input class="el-input__inner w-full" type="range" min="0.5" max="1" step="0.05" v-model.number="exportOptions.quality" />
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
// Copied logic from previous App.vue
import { ref, reactive, onMounted, watch } from 'vue'
import { useTemplatesStore } from '../stores/templates'
import { useUploadStore } from '../stores/upload'
import { useRoute, useRouter } from 'vue-router'
import { useKonvaTransform } from '../composables/useKonvaTransform'
import { addBlurBackgroundCover, createShadowedImage } from '../composables/useKonvaEffects'
import { computeDominantColor } from '../composables/useImageUtils'
import { computeFrameLayout, drawFrame } from '../composables/useFrameLayout'
import Konva from 'konva'
import * as exifr from 'exifr'
import exampleImageUrl from '../assets/images/example-image.jpg'
 
import ExifInfo from '../components/ExifInfo.vue'

const store = useTemplatesStore()
const upload = useUploadStore()
const route = useRoute()
const router = useRouter()
const textEditRef = ref<HTMLInputElement | null>(null)
const stageWrap = ref<HTMLDivElement | null>(null)
const menu = ref<HTMLDivElement | null>(null)
const bgFx = ref<HTMLDivElement | null>(null)
const imgFx = ref<HTMLDivElement | null>(null)
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
const exporting = ref(false)
const exportOptions = reactive({ format: 'png' as 'png'|'jpeg'|'webp', quality: 0.95 })
const selectedTemplateId = ref<string | null>(null)
const loading = reactive({ image: false, parsing: false })
const showGrid = ref(false)
const showGuides = ref(false)
const historyStack = ref<string[]>([])
const redoStack = ref<string[]>([])
const throttle = (fn: (...args:any[]) => void, wait = 32) => { let last = 0; let timeout: any = null; return (...args:any[]) => { const now = Date.now(); const remaining = wait - (now - last); if (remaining <= 0) { last = now; fn(...args) } else { clearTimeout(timeout); timeout = setTimeout(() => { last = Date.now(); fn(...args) }, remaining) } } }
const suppressRender = ref(false)
let rafId: number | null = null
let resizeTimer: any = null
let delegatedBound = false

type ShadowPreset = 'soft-shadow'|'deep-shadow'|'inner-shadow'|'glow-effect'|'multi-shadow'|'custom'
interface ImageFxState { enableShadow: boolean; preset: ShadowPreset; angleDeg: number; distance: number; custom: { x:number; y:number; blur:number; spread:number; color:string }; enableBlurBorder: boolean; blurRadius: number; blurColor: string; autoColor: boolean; dominantColor: string }
const imageFx = reactive<ImageFxState>({ enableShadow: true, preset: 'soft-shadow', angleDeg: 45, distance: 8, custom: { x:2, y:2, blur:8, spread:0, color: 'rgba(0,0,0,0.15)' }, enableBlurBorder: false, blurRadius: 3, blurColor: '#000000', autoColor: true, dominantColor: '#000000' })

const formatAperture = (f: any) => f ? `ƒ${Number(f).toFixed(1)}` : '-'
const formatShutter = (t: any) => { if (!t) return '-'; const n = Number(t); if (n >= 1) return `${n.toFixed(1)}s`; return `1/${Math.round(1/n)}` }
const formatFocal = (f: any) => f ? `${Math.round(Number(f))}mm` : '-'
const formatDate = (d: any) => { if (!d) return '-'; const dt = new Date(d); if (isNaN(dt.getTime())) return String(d); const pad = (x: any)=> String(x).padStart(2,'0'); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}` }
const formatExposureBias = (v:any) => v!=null ? `${v>0?'+':''}${Number(v).toFixed(1)} EV` : '-'
const formatMeteringMode = (m:any) => { const map:Record<number,string>={1:'平均',2:'中央重点',3:'点测',4:'多点',5:'矩阵',6:'局部',255:'其他'}; const n=Number(m); return map[n]||String(m)||'-' }
const formatExposureProgram = (p:any) => { const map:Record<number,string>={1:'手动',2:'程序自动',3:'光圈优先',4:'快门优先',5:'创意',6:'动作',7:'人像',8:'风景'}; const n=Number(p); return map[n]||String(p)||'-' }
const formatWhiteBalance = (w:any) => { const n=Number(w); return n===1?'手动':n===0?'自动':(w!=null?String(w):'-') }
const formatFlash = (f:any) => { const n=Number(f); return (n&1)?'已触发':'未触发' }
const formatLens = (ex:any) => { const lm=(ex?.LensModel||''); const lk=(ex?.LensMake||''); const v=(lk&&lm)?`${lk} ${lm}`:lm||lk; return v||'-' }

const brandMap: Record<string,string> = { Canon:'canon', Nikon:'nikon', SONY:'sony', Sony:'sony', FUJIFILM:'fujifilm', Fujifilm:'fujifilm', Apple:'apple', Samsung:'samsung', HUAWEI:'huawei', Huawei:'huawei', Xiaomi:'xiaomi', DJI:'dji', GoPro:'gopro' }
const logoUrls = import.meta.glob('../assets/brand-logos/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const getLogoUrl = (brandKey: string): string | undefined => { if (!brandKey) return undefined; const q = brandKey.toLowerCase(); for (const [path, url] of Object.entries(logoUrls)) { const fn = path.split('/').pop()!.toLowerCase(); if (fn.includes(q)) return url } return undefined }
const brandOptions = Object.entries(brandMap).reduce((acc: any[], [name, key]) => { const k = key.toLowerCase(); const icon = getLogoUrl(k) || ''; if (!acc.some(x=>x.key===k)) acc.push({ key: k, label: name, icon }); return acc }, [])
const { transformerRef, attach, clear, bindTextTransforms, bindRectTransforms, bindImageTransforms } = useKonvaTransform(layerRef as any, items as any)
const brandIcons: Record<string,(fill:string)=>string> = {
  canon: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='transparent'/><text x='80' y='26' font-family='Inter' font-size='20' fill='${f}' text-anchor='middle'>CANON</text></svg>`,
  nikon: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='transparent'/><text x='80' y='26' font-family='Inter' font-size='20' fill='${f}' text-anchor='middle'>NIKON</text></svg>`,
  sony: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='transparent'/><text x='80' y='26' font-family='Inter' font-size='20' fill='${f}' text-anchor='middle'>SONY</text></svg>`,
  fujifilm: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='透明'/><text x='80' y='26' font-family='Inter' font-size='20' fill='${f}' text-anchor='middle'>FUJIFILM</text></svg>`,
  apple: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='transparent' stroke='${f}'/><text x='20' y='26' font-family='Inter' font-size='20' fill='${f}' text-anchor='middle'></text></svg>`,
  samsung: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='transparent'/><text x='80' y='26' font-family='Inter' font-size='18' fill='${f}' text-anchor='middle'>SAMSUNG</text></svg>`,
  huawei: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='transparent'/><text x='80' y='26' font-family='Inter' font-size='18' fill='${f}' text-anchor='middle'>HUAWEI</text></svg>`,
  xiaomi: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'><rect width='120' height='40' rx='8' fill='transparent' stroke='${f}'/><text x='60' y='26' font-family='Inter' font-size='18' fill='${f}' text-anchor='middle'>MI</text></svg>`,
  dji: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'><rect width='120' height='40' rx='8' fill='transparent'/><text x='60' y='26' font-family='Inter' font-size='20' fill='${f}' text-anchor='middle'>DJI</text></svg>`,
  gopro: f=>`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><rect width='160' height='40' rx='6' fill='transparent'/><text x='80' y='26' font-family='Inter' font-size='18' fill='${f}' text-anchor='middle'>GoPro</text></svg>`
}
const svgToDataUrl = (svg: string) => 'data:image/svg+xml;base64,' + btoa(svg)

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
  const wrap = stageWrap.value!; const w = wrap.clientWidth; const h = Math.max(420, wrap.clientWidth * 0.66)
  if (!stageRef.value) {
    stageRef.value = new Konva.Stage({ container: wrap, width: w, height: h })
    bindDelegatedEvents()
  } else {
    stageRef.value.size({ width: w, height: h })
  }
  if (layerRef.value && layerRef.value.getStage()) {
    layerRef.value.destroy()
  }
  layerRef.value = new Konva.Layer()
  stageRef.value.add(layerRef.value as Konva.Layer)
  clear()
  if (imageData.value) {
    if (!imageReady.value || !imgObjRef.value) return
    const layout = computeFrameLayout({ w: imgObjRef.value.width, h: imgObjRef.value.height }, border as any, w)
    stageRef.value!.size({ width: w, height: Math.max(layout.vh, h) })
    const { bg, mat } = drawFrame(layerRef.value!, layout, border.color)
    bg.on('click tap', () => { clearSelection(); closeContextMenu() })
    bindExifDragDrop()
    if (showGrid.value) { const gridGroup = new Konva.Group(); const step = 40; for (let x = 0; x < w; x += step) gridGroup.add(new Konva.Line({ points: [x, 0, x, stageRef.value!.height()], stroke: '#1e1e1e', strokeWidth: 1, opacity: 0.35 })); for (let y = 0; y < stageRef.value!.height(); y += step) gridGroup.add(new Konva.Line({ points: [0, y, w, y], stroke: '#1e1e1e', strokeWidth: 1, opacity: 0.35 })); layerRef.value!.add(gridGroup) }
    if (imageFx.enableBlurBorder && imgObjRef.value) {
      const rect = { x: layout.fx, y: layout.fy, w: Math.round(layout.bw), h: Math.round(layout.ihScaled + layout.inner*2 + layout.top + layout.bottom) }
      addBlurBackgroundCover(layerRef.value!, imgObjRef.value, rect, { radius: imageFx.blurRadius })
    }
    // Shadow via Konva: draw a near-transparent rounded rect behind image
    const sx = layout.sx
    const sy = layout.sy
    const rMax = layout.rMax
    const img = createShadowedImage(imgObjRef.value!, { x: sx, y: sy, w: layout.iwScaled, h: layout.ihScaled }, { enable: imageFx.enableShadow, preset: imageFx.preset, distance: imageFx.distance, angle: imageFx.angleDeg, custom: { x: imageFx.custom.x, y: imageFx.custom.y, blur: imageFx.custom.blur } })
    imageNodeRef.value = img; layerRef.value!.add(img)
    const styleDash = border.style === 'dashed' ? [8,6] : border.style === 'dotted' ? [2,4] : null
    if (styleDash) {
      const { fx, fy, bw, left, right, top, ihScaled } = layout
      layerRef.value!.add(new Konva.Line({ points: [fx + left, fy + top, fx + bw - right, fy + top], stroke: border.color, strokeWidth: 2, dash: styleDash }))
      layerRef.value!.add(new Konva.Line({ points: [fx + left, fy + top, fx + left, fy + top + ihScaled], stroke: border.color, strokeWidth: 2, dash: styleDash }))
      layerRef.value!.add(new Konva.Line({ points: [fx + left, fy + top + ihScaled, fx + bw - right, fy + top + ihScaled], stroke: border.color, strokeWidth: 2, dash: styleDash }))
      layerRef.value!.add(new Konva.Line({ points: [fx + bw - right, fy + top, fx + bw - right, fy + top + ihScaled], stroke: border.color, strokeWidth: 2, dash: styleDash }))
    }
    nodes.value = []; items.value.forEach((it, idx) => addItemNode(it, idx))
    if (showGuides.value) { 
      const { fx, fy, bw, outer, inner, top, bottom, ihScaled } = layout
      const frameCenterX = fx + bw/2
      const frameCenterY = fy + (ihScaled + inner*2 + top + bottom)/2
      layerRef.value!.add(new Konva.Line({ points: [frameCenterX, outer, frameCenterX, stageRef.value!.height()], stroke: '#2563eb', strokeWidth: 1, dash: [6,4], opacity: 0.6 }))
      layerRef.value!.add(new Konva.Line({ points: [fx, frameCenterY, fx + bw, frameCenterY], stroke: '#2563eb', strokeWidth: 1, dash: [6,4], opacity: 0.6 }))
    }
    layerRef.value!.draw(); if (selectedIndex.value != null && nodes.value[selectedIndex.value]) attach(nodes.value[selectedIndex.value])
    applyImageFx({ fx, fy, iwScaled, ihScaled, rMax, left, inner, top })
  }
}

const addItemNode = (it: any, idx: number) => {
  if (it.type === 'text') {
    const text = new Konva.Text({ x: it.x, y: it.y, text: resolveText(it.text), fontSize: it.fontSize || 16, fill: it.color || '#eaeaea', fontFamily: it.fontFamily || 'Inter' })
    text.draggable(true)
    text.on('click', () => { selectItem(idx, text, false) })
    text.on('dragmove', () => { suppressRender.value = true; const p = text.position(); items.value[idx].x = p.x; items.value[idx].y = p.y; closeContextMenu() })
    bindTextTransforms(text, idx)
    text.on('dragend', () => { suppressRender.value = false; pushHistory(); scheduleRender() })
    layerRef.value!.add(text)
    nodes.value[idx] = text
  } else if (it.type === 'rect') {
    const rect = new Konva.Rect({ x: it.x, y: it.y, width: it.w || 120, height: it.h || 24, fill: it.color || '#1e1e1e' })
    rect.draggable(true)
    rect.on('click', () => { selectItem(idx, rect, false) })
    rect.on('dragmove', () => { suppressRender.value = true; const p = rect.position(); items.value[idx].x = p.x; items.value[idx].y = p.y; closeContextMenu() })
    bindRectTransforms(rect, idx)
    rect.on('dragend', () => { suppressRender.value = false; pushHistory(); scheduleRender() })
    layerRef.value!.add(rect)
    nodes.value[idx] = rect
  } else if (it.type === 'icon') {
    const brand = it.brand || resolveBrand()
    const key = brandMap[brand] || brand
    const makeKey = typeof key === 'string' ? key.toLowerCase() : ''
    const assetUrl = getLogoUrl(makeKey)
    const svgFactory = brandIcons[makeKey]
    if (assetUrl) {
      const url = assetUrl
      const imgObj = new Image()
      imgObj.onload = () => {
        const ratio = imgObj.width / imgObj.height || 1
        const targetH = it.h || 32
        const targetW = it.w || Math.round(targetH * ratio)
        const imgNode = new Konva.Image({ image: imgObj, x: it.x, y: it.y, width: targetW, height: Math.round(targetH) })
        imgNode.draggable(true)
        imgNode.on('click', () => { selectItem(idx, imgNode, false) })
        imgNode.on('dragmove', () => { suppressRender.value = true; const p = imgNode.position(); items.value[idx].x = p.x; items.value[idx].y = p.y; closeContextMenu() })
        bindImageTransforms(imgNode, idx)
        imgNode.on('dragend', () => { suppressRender.value = false; pushHistory(); scheduleRender() })
        layerRef.value!.add(imgNode)
        nodes.value[idx] = imgNode
        items.value[idx].w = targetW; items.value[idx].h = Math.round(targetH)
        layerRef.value!.draw()
      }
      imgObj.src = url
    } else if (svgFactory) {
      const svg = svgFactory(it.color || '#eaeaea')
      const url = svgToDataUrl(svg)
      const imgObj = new Image()
      imgObj.onload = () => {
        const ratio = imgObj.width / imgObj.height || 1
        const targetH = it.h || 32
        const targetW = it.w || Math.round(targetH * ratio)
        const imgNode = new Konva.Image({ image: imgObj, x: it.x, y: it.y, width: targetW, height: Math.round(targetH) })
        imgNode.draggable(true)
        imgNode.on('click', () => { selectItem(idx, imgNode, false) })
        imgNode.on('dragmove', () => { suppressRender.value = true; const p = imgNode.position(); items.value[idx].x = p.x; items.value[idx].y = p.y; closeContextMenu() })
        bindImageTransforms(imgNode, idx)
        imgNode.on('dragend', () => { suppressRender.value = false; pushHistory(); scheduleRender() })
        layerRef.value!.add(imgNode)
        nodes.value[idx] = imgNode
        items.value[idx].w = targetW; items.value[idx].h = Math.round(targetH)
        layerRef.value!.draw()
      }
      imgObj.src = url
    } else {
      const text = new Konva.Text({ x: it.x, y: it.y, text: brand || 'Brand', fontSize: it.fontSize || 20, fill: it.color || '#eaeaea' })
      text.draggable(true)
      text.on('click', () => { selectItem(idx, text, false) })
      text.on('dragmove', () => { suppressRender.value = true; const p = text.position(); items.value[idx].x = p.x; items.value[idx].y = p.y; closeContextMenu() })
      text.on('dragend', () => { suppressRender.value = false; pushHistory(); scheduleRender() })
      layerRef.value!.add(text)
      nodes.value[idx] = text
    }
  }
}

const selectItem = (idx: number, node: any, highlight = false) => { selectedIndex.value = idx; attach(node); openEdit(); closeContextMenu() }
const clearSelection = () => { selectedIndex.value = null; clear() }
const removeSelected = () => { if (selectedIndex.value==null) return; pushHistory(); items.value.splice(selectedIndex.value,1); clearSelection(); scheduleRender() }
const openEdit = () => { if (selectedIndex.value==null) return; setTimeout(() => { textEditRef.value?.focus() }, 0) }
const openContextMenu = (x:number, y:number) => { const m = menu.value!; m.style.left = `${x}px`; m.style.top = `${y}px`; m.style.display = 'block'; setTimeout(()=>document.addEventListener('click', closeContextMenu, { once:true }),0) }
const closeContextMenu = () => { const m = menu.value!; m.style.display = 'none' }
const pushHistory = () => { const snapshot = JSON.stringify({ items: items.value, border: { ...border } }); historyStack.value.push(snapshot); redoStack.value = [] }
const undo = () => { if (!historyStack.value.length) return; const current = JSON.stringify({ items: items.value, border: { ...border } }); redoStack.value.push(current); const snap = historyStack.value.pop()!; const state = JSON.parse(snap); items.value = state.items; Object.assign(border, state.border); scheduleRender(); clearSelection() }
const redo = () => { if (!redoStack.value.length) return; const snap = redoStack.value.pop()!; historyStack.value.push(JSON.stringify({ items: items.value, border: { ...border } })); const state = JSON.parse(snap); items.value = state.items; Object.assign(border, state.border); scheduleRender(); clearSelection() }

const resolveBrand = () => { if (!exif.value) return ''; const make = exif.value.Make || ''; for (const k of Object.keys(brandMap)) { if (make.includes(k)) return brandMap[k] } return make || (exif.value.Model || '') }
const resolveText = (tpl: string) => { if (!exif.value) return tpl; const et = exif.value; const t = Number(et.ExposureTime); const dict: Record<string,string> = {
  ISO: et.ISO != null ? String(et.ISO) : '-',
  FNumber: et.FNumber != null ? Number(et.FNumber).toFixed(1) : '-',
  Exposure: et.ExposureTime != null ? (t >= 1 ? `${t.toFixed(1)}s` : String(Math.round(1/t))) : '-',
  Focal: et.FocalLength != null ? String(Math.round(Number(et.FocalLength))) : '-',
  Make: et.Make || '-',
  Model: et.Model || '-',
  Date: formatDate(et.DateTimeOriginal)
}; return tpl.replace(/\{([^}]+)\}/g, (_, k) => { const v = dict[k]; if (v!=null) return v; const raw = (et as any)[k]; return raw!=null ? String(raw) : `{${k}}` }) }
const extractKeys = (text: string) => { const m = text.match(/\{([^}]+)\}/g) || []; return m.map(s => s.slice(1,-1)) }
const exifFieldMap: Record<string,{label:string, field:string}> = { ISO:{label:'ISO',field:'ISO'}, FNumber:{label:'光圈',field:'FNumber'}, Exposure:{label:'快门',field:'ExposureTime'}, Focal:{label:'焦距',field:'FocalLength'}, Make:{label:'品牌',field:'Make'}, Model:{label:'型号',field:'Model'} }
const getPlaceholderFields = (text: string) => extractKeys(text).map(k => exifFieldMap[k]).filter(Boolean as any)
const onParamInput = (field: string, value: any) => { if (!exif.value) exif.value = {}; (exif.value as any)[field] = value; scheduleRender() }

const loadImage = (url: string) => { imageReady.value = false; const img = new Image(); img.onload = () => { imgObjRef.value = img; imageReady.value = true; loading.image = false; if (url.startsWith('blob:')) { try { URL.revokeObjectURL(url) } catch {} } if (imageFx.autoColor) applyAutoColor(); scheduleRender(); applySelectedTemplate(); }; loading.image = true; img.src = url }
const onFile = async (e: any) => { const file = e.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); imageData.value = url; loadImage(url); try { loading.parsing = true; exif.value = await (exifr as any).parse(file); loading.parsing = false; } catch { loading.parsing = false } }
const onDrop = async (e: DragEvent) => { const file = (e.dataTransfer as DataTransfer).files[0]; if (!file) return; const url = URL.createObjectURL(file); imageData.value = url; loadImage(url); try { loading.parsing = true; exif.value = await (exifr as any).parse(file); loading.parsing = false; } catch { loading.parsing = false } }

const addText = (text: string) => { pushHistory(); items.value.push({ type:'text', text, x:40, y:40, fontSize:18, color:'#000000' }); scheduleRender() }
const addRect = () => { pushHistory(); items.value.push({ type:'rect', x:40, y:80, w:160, h:28, color:'#000000' }); scheduleRender() }
const addBrandIcon = () => { pushHistory(); items.value.push({ type:'icon', x:40, y:120, fontSize:20, color:'#000000' }); scheduleRender() }

const saveCurrentTemplate = () => { 
  if (!selectedTemplateId.value) {
    newTemplate()
    return
  }
  
  const templateName = prompt('请输入模板名称:', store.templates.find(t => t.id === selectedTemplateId.value)?.name || '我的模板')
  if (!templateName) return
  
  const tpl = { 
    id: selectedTemplateId.value, 
    name: templateName, 
    version: 1, 
    border: { ...border }, 
    items: items.value 
  }
  store.save(tpl)
  alert('模板已保存')
}

const exportCurrentTemplate = () => { 
  const template = store.templates.find(t => t.id === selectedTemplateId.value)
  const tpl = { 
    id: selectedTemplateId.value || Date.now(), 
    name: template?.name || '导出模板', 
    version: 1, 
    border: { ...border }, 
    items: items.value 
  }
  const blob = new Blob([JSON.stringify(tpl, null, 2)], { type:'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${tpl.name}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

const goTemplateManager = () => { 
  router.push('/templates') 
}

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
const importTemplate = async (e: any) => { const file = e.target.files[0]; if (!file) return; const text = await file.text(); try { const tpl = JSON.parse(text); Object.assign(border, tpl.border); items.value = tpl.items || []; scheduleRender() } catch {} }

const openExport = () => { exporting.value = true }
const doExport = () => { if (!stageRef.value) return; const mime = exportOptions.format === 'png' ? 'image/png' : exportOptions.format === 'jpeg' ? 'image/jpeg' : 'image/webp'; const dataURL = stageRef.value!.toDataURL({ mimeType: mime, quality: exportOptions.quality }); const a = document.createElement('a'); a.href = dataURL; a.download = `photo.${exportOptions.format}`; a.click(); exporting.value = false }

onMounted(() => {
  store.load(); scheduleRender(); window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(scheduleRender, 120) }); if (stageWrap.value && 'ResizeObserver' in window) { const ro = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(scheduleRender, 120) }); ro.observe(stageWrap.value) } window.addEventListener('keydown', (e) => { const z = (e.key === 'z' || e.key === 'Z'); const y = (e.key === 'y' || e.key === 'Y'); if ((e.ctrlKey || e.metaKey) && z && !e.shiftKey) { e.preventDefault(); undo() } if ((e.ctrlKey || e.metaKey) && (y || (z && e.shiftKey))) { e.preventDefault(); redo() } if (e.key==='Delete') { const ae = document.activeElement as HTMLElement | null; const tag = (ae?.tagName || '').toLowerCase(); if (tag==='input' || tag==='textarea') return; removeSelected() } })
  if (!store.templates.length) { const tpl = defaultTemplate(); store.save(tpl) }
  selectedTemplateId.value = (store.templates.find(t=>t.id==='default')?.id) || store.templates[0]?.id || null
  const qId = (route.query.tplId as string) || null
  if (qId) { const tpl = store.templates.find(t => t.id === qId); if (tpl) { selectedTemplateId.value = qId; applySelectedTemplate() } }
  imageData.value = exampleImageUrl; loadImage(exampleImageUrl)
  exif.value = { Make:'Canon', Model:'EOS R6', LensModel:'RF 50mm F1.8', ISO:400, FNumber:2.8, ExposureTime:0.01, FocalLength:50, DateTimeOriginal: new Date().toISOString(), WhiteBalance:0, MeteringMode:5, ExposureProgram:3, ExposureBiasValue:0.3, Flash:0 }
})

const bindDelegatedEvents = () => {
  if (delegatedBound || !stageRef.value) return
  delegatedBound = true
  stageRef.value!.on('click tap', (evt: any) => {
    const target = evt.target
    if (!target || target === stageRef.value || target === layerRef.value) { clearSelection() }
  })
  stageRef.value!.on('dblclick', (evt: any) => {
    const target = evt.target
    if (!target || target === layerRef.value) { clearSelection(); return }
    const idx = nodes.value.findIndex(n => n === target)
    if (idx >= 0) { selectItem(idx, target, true) } else { clearSelection() }
  })
}

let exifDragBound = false
const bindExifDragDrop = () => {
  if (exifDragBound || !stageRef.value) return
  exifDragBound = true
  const el = stageRef.value!.container()
  el.addEventListener('dragover', (e: DragEvent) => {
    const dt = e.dataTransfer
    if (dt && Array.from(dt.types).includes('application/exif-field')) {
      e.preventDefault(); dt.dropEffect = 'copy'
    }
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

const updateSelected = (field: string, value: any) => { if (selectedIndex.value==null) return; const it = items.value[selectedIndex.value as number]; it[field] = value; scheduleRender() }
const defaultTemplate = () => ({ id: 'default', name: '基础模板', version: 1, border: { thickness: 60, top: 0, right: 0, bottom: 60, left: 0, color: '#ffffff', radius: 0, innerPadding: 0, outerPadding: 0, style: 'solid' }, items: [ { type: 'text', text: 'ISO {ISO}', x: 40, y: 40, fontSize: 18, color: '#000000' }, { type: 'text', text: 'ƒ{FNumber}', x: 40, y: 70, fontSize: 18, color: '#000000' }, { type: 'text', text: '1/{Exposure}', x: 40, y: 100, fontSize: 18, color: '#000000' }, { type: 'text', text: '{Focal}mm', x: 40, y: 130, fontSize: 18, color: '#000000' }, { type: 'text', text: '{Make} {Model}', x: 40, y: 160, fontSize: 18, color: '#000000' } ] })
const applySelectedTemplate = () => { if (!selectedTemplateId.value) return; const tpl = store.templates.find(t => t.id === selectedTemplateId.value); if (!tpl) return; Object.assign(border, tpl.border); items.value = tpl.items || []; scheduleRender() }
const newTemplate = () => { const id = 'tpl-' + Date.now(); const tpl = { id, name: '新建模板', version: 1, border: { thickness: 60, top: 0, right: 0, bottom: 60, left: 0, color: '#ffffff', radius: 0, innerPadding: 0, outerPadding: 0, style: 'solid' }, items: [] }; store.save(tpl); selectedTemplateId.value = id; applySelectedTemplate() }

// 移除对 items 的深度监听，避免在缩放过程中频繁重建舞台造成卡顿
watch(border, () => { scheduleRender() }, { deep: true })
watch(imageData, () => { scheduleRender() })
watch(exif, () => { scheduleRender() })
const applyAutoColor = () => { if (!imgObjRef.value) return; const col = computeDominantColor(imgObjRef.value); imageFx.dominantColor = col; if (imageFx.autoColor) { imageFx.blurColor = col } scheduleRender() }

const applyImageFx = (pos: { fx:number; fy:number; iwScaled:number; ihScaled:number; rMax:number; left:number; inner:number; top:number }) => {
  const bg = bgFx.value; const fg = imgFx.value; if (!bg || !fg) return
  const x = Math.round(pos.fx + pos.left + pos.inner)
  const y = Math.round(pos.fy + pos.top + pos.inner)
  fg.style.position = 'absolute'; fg.style.pointerEvents = 'none'; fg.style.left = `${x}px`; fg.style.top = `${y}px`; fg.style.width = `${pos.iwScaled}px`; fg.style.height = `${pos.ihScaled}px`; fg.style.borderRadius = `${pos.rMax}px`; fg.style.zIndex = '10'; fg.style.boxShadow = 'none'; fg.style.filter = 'none'; fg.style.opacity = '0'
  bg.style.position = 'absolute'; bg.style.pointerEvents = 'none'; bg.style.left = `${x}px`; bg.style.top = `${y}px`; bg.style.width = `${pos.iwScaled}px`; bg.style.height = `${pos.ihScaled}px`; bg.style.borderRadius = `${pos.rMax}px`; bg.style.zIndex = '5'; bg.style.backgroundImage = 'none'; bg.style.backgroundSize = 'cover'; bg.style.backgroundPosition = 'center'; bg.style.filter = 'none'; bg.style.opacity = '0'; bg.style.boxShadow = 'none'
}
</script>
