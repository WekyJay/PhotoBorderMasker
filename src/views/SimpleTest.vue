<template>
  <div class="min-h-screen bg-background text-text p-8">
    <h1 class="text-2xl mb-4">Konva 简单测试</h1>
    
    <div class="space-y-4">
      <button class="el-button el-button--primary" @click="initCanvas">初始化画布</button>
      <button class="el-button" @click="addTestImage">添加测试图片</button>
      <button class="el-button" @click="addTestText">添加测试文本</button>
      
      <div ref="container" class="border border-border rounded-lg" style="width: 600px; height: 400px;"></div>
      
      <div class="text-sm">
        <p>状态: {{ status }}</p>
        <p>画布: {{ stage ? '已创建' : '未创建' }}</p>
        <p>图层: {{ layer ? '已创建' : '未创建' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Konva from 'konva'
import exampleImageUrl from '../assets/images/example-image.jpg'

const container = ref<HTMLDivElement | null>(null)
const stage = ref<Konva.Stage | null>(null)
const layer = ref<Konva.Layer | null>(null)
const status = ref('准备就绪')

const initCanvas = () => {
  if (!container.value) {
    status.value = '容器未找到'
    return
  }
  
  try {
    // 清理现有画布
    if (stage.value) {
      stage.value.destroy()
    }
    
    // 创建新画布
    stage.value = new Konva.Stage({
      container: container.value,
      width: 600,
      height: 400
    })
    
    layer.value = new Konva.Layer()
    stage.value.add(layer.value)
    
    // 添加背景
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      fill: '#1a1a1a'
    })
    layer.value.add(bg)
    layer.value.draw()
    
    status.value = '画布初始化成功'
  } catch (error) {
    status.value = '画布初始化失败: ' + error
    console.error('Canvas init error:', error)
  }
}

const addTestImage = () => {
  if (!layer.value) {
    status.value = '请先初始化画布'
    return
  }
  
  const img = new Image()
  img.onload = () => {
    try {
      const konvaImg = new Konva.Image({
        x: 50,
        y: 50,
        image: img,
        width: 200,
        height: 150
      })
      
      layer.value!.add(konvaImg)
      layer.value!.draw()
      status.value = '图片添加成功'
    } catch (error) {
      status.value = '图片添加失败: ' + error
      console.error('Image add error:', error)
    }
  }
  img.onerror = (error) => {
    status.value = '图片加载失败'
    console.error('Image load error:', error)
  }
  img.src = exampleImageUrl
}

const addTestText = () => {
  if (!layer.value) {
    status.value = '请先初始化画布'
    return
  }
  
  try {
    const text = new Konva.Text({
      x: 300,
      y: 100,
      text: 'Hello Konva!',
      fontSize: 24,
      fontFamily: 'Inter',
      fill: '#ffffff'
    })
    
    layer.value.add(text)
    layer.value.draw()
    status.value = '文本添加成功'
  } catch (error) {
    status.value = '文本添加失败: ' + error
    console.error('Text add error:', error)
  }
}

onMounted(() => {
  status.value = '组件已挂载'
})
</script>