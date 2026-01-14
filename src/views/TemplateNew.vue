<template>
  <div class="min-h-screen flex flex-col bg-background text-text">
    <header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded bg-accent/40"></div>
          <div class="text-lg font-semibold">新增模板</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="el-button" @click="goHome">返回首页</button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="rounded-xl border border-border bg-card p-6 space-y-4">
          <div class="text-sm font-medium">模板信息</div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">模板名称</span>
            <input class="el-input__inner w-full" v-model="name" placeholder="例如：我的基础模板" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">边框颜色</span>
            <input class="el-input__inner w-full" type="color" v-model="color" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">厚度</span>
            <input class="el-input__inner w-full" type="number" min="0" max="200" v-model.number="thickness" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">圆角</span>
            <input class="el-input__inner w-full" type="number" min="0" max="120" v-model.number="radius" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">内距</span>
            <input class="el-input__inner w-full" type="number" min="0" max="240" v-model.number="innerPadding" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-24">外距</span>
            <input class="el-input__inner w-full" type="number" min="0" max="240" v-model.number="outerPadding" />
          </div>
          <div class="pt-2">
            <button class="el-button el-button--primary" @click="createTemplate">创建并进入编辑器</button>
          </div>
        </section>
        <aside class="rounded-xl border border-border bg-card p-6">
          <div class="text-sm font-medium mb-2">说明</div>
          <div class="text-xs text-gray-500">创建后将在编辑器右侧“模板”处可见，并自动选中。你可以在编辑器中继续添加文本、品牌图标或矩形元素。</div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'

const router = useRouter()
const store = useTemplatesStore()

const name = ref('新模板')
const color = ref('#ffffff')
const thickness = ref(60)
const radius = ref(0)
const innerPadding = ref(40)
const outerPadding = ref(40)

const goHome = () => router.push('/')

const createTemplate = () => {
  store.load()
  const id = 'tpl-' + Date.now()
  const tpl = { id, name: name.value, version: 1, border: { thickness: thickness.value, color: color.value, radius: radius.value, innerPadding: innerPadding.value, outerPadding: outerPadding.value }, items: [] }
  store.save(tpl)
  router.push(`/editor?tplId=${encodeURIComponent(id)}`)
}
</script>

<style></style>
