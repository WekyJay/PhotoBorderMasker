<template>
  <div class="min-h-screen flex flex-col bg-background text-text">
    <header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded bg-accent/40"></div>
          <div class="text-lg font-semibold">Photo Border Masker</div>
          <span class="ml-3 text-xs text-gray-400">本地生成 · 暗色设计</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="el-button el-button--primary" @click="goNewTemplate">新增模板</button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <section class="rounded-xl border border-border bg-card p-8">
        <div class="max-w-xl mx-auto text-center">
          <div class="text-2xl font-semibold mb-2">快速为照片生成优雅边框与信息栏</div>
          <div class="text-sm text-gray-400 mb-6">上传图片后，将自动应用默认模板并解析 EXIF 信息</div>
          <div 
            class="rounded-lg border-2 transition-all duration-200 p-8 cursor-pointer"
            :class="dragActive ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border bg-background/60 hover:border-border/80'"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave" 
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <div class="space-y-3 text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <div class="text-lg font-medium" v-if="!loading.image && !loading.parsing">
                {{ dragActive ? '释放以上传图片' : '拖拽图片到此处' }}
              </div>
              <div class="text-sm text-gray-400" v-if="!loading.image && !loading.parsing">
                或点击选择文件 • 支持 JPEG / PNG / WEBP
              </div>
              
              <!-- 加载状态 -->
              <div v-if="loading.image || loading.parsing" class="space-y-2">
                <div class="w-8 h-8 mx-auto border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                <div class="text-sm text-accent">
                  {{ loading.parsing ? '解析 EXIF 信息中...' : '加载图片中...' }}
                </div>
              </div>
              
              <!-- 预览 -->
              <div class="mt-4" v-if="previewUrl && !loading.image && !loading.parsing">
                <img :src="previewUrl" alt="预览" class="inline-block max-h-32 rounded-lg border border-border shadow-lg" />
                <div class="mt-2 text-sm text-green-400">✓ 图片已准备就绪</div>
              </div>
              
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
            </div>
          </div>
        </div>
      </section>

      <aside class="rounded-xl border border-border bg-card p-6 space-y-4">
        <div class="text-sm font-medium">模板与操作</div>
        <div class="space-y-2">
          <button class="el-button el-button--primary w-full" @click="goNewTemplate">新增模板</button>
          <button class="el-button w-full" @click="goTemplateManager">管理模板</button>
        </div>
        <div class="text-xs text-gray-500">创建和管理你的模板，在编辑器中应用不同的样式</div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUploadStore } from '../stores/upload'
import * as exifr from 'exifr'

const router = useRouter()
const upload = useUploadStore()
const previewUrl = ref<string | null>(null)
const loading = ref({ image: false, parsing: false })
const dragActive = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const goNewTemplate = () => { router.push('/templates/new') }
const goTemplateManager = () => { router.push('/templates') }
const goEditorWithFile = () => { 
  // 立即跳转，不要延迟，避免upload store被清理
  router.push('/generator')
}

const triggerFileInput = () => {
  if (loading.image || loading.parsing) return
  fileInput.value?.click()
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  dragActive.value = true
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragActive.value = false
}

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  loading.value.image = true
  loading.value.parsing = true
  
  try {
    // 解析EXIF信息
    const exifData = await exifr.parse(file)
    loading.value.parsing = false
    
    // 设置文件和预览
    upload.setFile(file)
    previewUrl.value = upload.objectUrl
    loading.value.image = false
    
    // 立即跳转到编辑器
    goEditorWithFile()
    
  } catch (error) {
    console.warn('EXIF解析失败:', error)
    loading.value.parsing = false
    
    // 即使EXIF解析失败也继续处理图片
    upload.setFile(file)
    previewUrl.value = upload.objectUrl
    loading.value.image = false
    
    goEditorWithFile()
  }
}

const onFile = async (e: any) => {
  const file = e.target.files[0]
  if (!file) return
  dragActive.value = false
  await processFile(file)
}

const onDrop = async (e: DragEvent) => {
  e.preventDefault()
  dragActive.value = false
  const file = (e.dataTransfer as DataTransfer).files[0]
  if (!file) return
  await processFile(file)
}
</script>

<style></style>
