<template>
  <div class="min-h-screen bg-background text-text p-8">
    <h1 class="text-2xl mb-4">图片上传测试</h1>
    
    <div class="space-y-4">
      <div>
        <label class="el-button el-button--primary">
          选择图片
          <input type="file" accept="image/*" class="hidden" @change="onFile" />
        </label>
      </div>
      
      <div v-if="imageUrl" class="space-y-2">
        <p>图片URL: {{ imageUrl }}</p>
        <img :src="imageUrl" alt="测试图片" class="max-w-md border" />
      </div>
      
      <div v-if="exifData" class="space-y-2">
        <p>EXIF数据:</p>
        <pre class="bg-card p-4 rounded text-sm">{{ JSON.stringify(exifData, null, 2) }}</pre>
      </div>
      
      <div class="space-y-2">
        <p>Upload Store状态:</p>
        <pre class="bg-card p-4 rounded text-sm">{{ JSON.stringify({ objectUrl: upload.objectUrl, hasFile: !!upload.file }, null, 2) }}</pre>
      </div>
      
      <div>
        <button class="el-button" @click="goToGenerator">跳转到生成器</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUploadStore } from '../stores/upload'
import * as exifr from 'exifr'

const router = useRouter()
const upload = useUploadStore()
const imageUrl = ref<string | null>(null)
const exifData = ref<any>(null)

const onFile = async (e: any) => {
  const file = e.target.files[0]
  if (!file) return
  
  console.log('File selected:', file.name, file.type, file.size)
  
  // 创建预览URL
  imageUrl.value = URL.createObjectURL(file)
  console.log('Preview URL created:', imageUrl.value)
  
  // 设置到store
  upload.setFile(file)
  console.log('File set to store:', upload.objectUrl)
  
  // 解析EXIF
  try {
    exifData.value = await exifr.parse(file)
    console.log('EXIF parsed:', exifData.value)
  } catch (error) {
    console.error('EXIF parsing failed:', error)
  }
}

const goToGenerator = () => {
  console.log('Navigating to generator with store data:', {
    objectUrl: upload.objectUrl,
    hasFile: !!upload.file
  })
  router.push('/generator')
}
</script>