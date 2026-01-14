<template>
  <div class="min-h-screen flex flex-col bg-background text-text">
    <header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/" class="flex items-center gap-3 cursor-pointer">
            <div class="w-8 h-8 rounded bg-accent/40"></div>
            <div class="text-lg font-semibold">模板管理</div>
          </router-link>
          <span class="ml-3 text-xs text-gray-400">管理你的模板</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="el-button el-button--primary" @click="goNewTemplate">新增模板</button>
          <label class="el-button">
            导入模板
            <input type="file" accept="application/json" class="hidden" @change="importTemplate" />
          </label>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <div class="space-y-4">
        <!-- 模板统计 -->
        <div class="rounded-xl border border-border bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-lg font-medium">我的模板</div>
              <div class="text-sm text-gray-400">共 {{ store.templates.length }} 个模板</div>
            </div>
            <div class="flex items-center gap-2">
              <button class="el-button" @click="exportAllTemplates">导出全部</button>
              <button class="el-button" @click="refreshTemplates">刷新</button>
            </div>
          </div>
        </div>

        <!-- 模板列表 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="template in store.templates" 
            :key="template.id"
            class="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors"
          >
            <!-- 模板预览 -->
            <div class="aspect-video rounded-lg bg-background/60 mb-3 flex items-center justify-center relative overflow-hidden">
              <div 
                class="w-24 h-16 rounded border-2 flex items-center justify-center text-xs"
                :style="{ 
                  borderColor: template.border?.color || '#ffffff',
                  backgroundColor: template.border?.color || '#ffffff'
                }"
              >
                <div class="w-20 h-12 bg-gray-600 rounded flex items-center justify-center text-white text-xs">
                  预览
                </div>
              </div>
              
              <!-- 元素数量指示器 -->
              <div class="absolute top-2 right-2 bg-accent/20 text-accent px-2 py-1 rounded text-xs">
                {{ template.items?.length || 0 }} 元素
              </div>
            </div>

            <!-- 模板信息 -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="font-medium truncate">{{ template.name }}</h3>
                <span class="text-xs text-gray-400">v{{ template.version || 1 }}</span>
              </div>
              
              <div class="text-xs text-gray-400 space-y-1">
                <div>ID: {{ template.id }}</div>
                <div v-if="template.border">
                  边框: {{ template.border.color }} / {{ template.border.thickness || template.border.bottom || 0 }}px
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="mt-4 flex items-center gap-2">
              <button 
                class="el-button el-button--primary flex-1" 
                @click="useTemplate(template.id)"
              >
                使用
              </button>
              <button 
                class="el-button" 
                @click="editTemplate(template.id)"
              >
                编辑
              </button>
              <button 
                class="el-button" 
                @click="duplicateTemplate(template.id)"
              >
                复制
              </button>
              <button 
                class="el-button" 
                @click="exportTemplate(template)"
              >
                导出
              </button>
              <button 
                v-if="store.canDelete(template.id)"
                class="el-button el-button--danger" 
                @click="confirmDelete(template)"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="store.templates.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">还没有模板</div>
          <button class="el-button el-button--primary" @click="goNewTemplate">创建第一个模板</button>
        </div>
      </div>
    </main>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :show="deleteDialog.show"
      type="danger"
      title="确认删除"
      :message="`确定要删除模板 &quot;${deleteDialog.template?.name}&quot; 吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="confirmDeleteAction"
      @cancel="cancelDelete"
    />

    <!-- 成功提示 -->
    <div v-if="notification.show" class="fixed top-4 right-4 z-50">
      <div 
        class="rounded-lg border border-border bg-card p-4 shadow-lg"
        :class="{
          'border-green-500 bg-green-500/10': notification.type === 'success',
          'border-red-500 bg-red-500/10': notification.type === 'error'
        }"
      >
        <div class="flex items-center gap-2">
          <div 
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500': notification.type === 'success',
              'bg-red-500': notification.type === 'error'
            }"
          ></div>
          <span class="text-sm">{{ notification.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const router = useRouter()
const store = useTemplatesStore()

const deleteDialog = reactive({
  show: false,
  template: null as any
})

const notification = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

const goNewTemplate = () => {
  router.push('/templates/new')
}

const useTemplate = (templateId: string) => {
  router.push(`/generator?tplId=${encodeURIComponent(templateId)}`)
}

const editTemplate = (templateId: string) => {
  router.push(`/editor?tplId=${encodeURIComponent(templateId)}`)
}

const duplicateTemplate = (templateId: string) => {
  const duplicated = store.duplicate(templateId)
  if (duplicated) {
    showNotification('success', `模板已复制为 "${duplicated.name}"`)
  } else {
    showNotification('error', '复制失败')
  }
}

const exportTemplate = (template: any) => {
  try {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name || 'template'}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('success', '模板已导出')
  } catch (error) {
    showNotification('error', '导出失败')
  }
}

const exportAllTemplates = () => {
  try {
    const data = {
      templates: store.templates,
      exportTime: new Date().toISOString(),
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-templates-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('success', '所有模板已导出')
  } catch (error) {
    showNotification('error', '导出失败')
  }
}

const importTemplate = async (e: any) => {
  const file = e.target.files[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (data.templates && Array.isArray(data.templates)) {
      // 批量导入
      let imported = 0
      for (const template of data.templates) {
        if (template.id && template.name) {
          // 生成新ID避免冲突
          const newId = 'imported-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
          store.save({ ...template, id: newId })
          imported++
        }
      }
      showNotification('success', `成功导入 ${imported} 个模板`)
    } else if (data.id && data.name) {
      // 单个模板导入
      const newId = 'imported-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      store.save({ ...data, id: newId })
      showNotification('success', `模板 "${data.name}" 导入成功`)
    } else {
      showNotification('error', '无效的模板文件格式')
    }
  } catch (error) {
    showNotification('error', '导入失败：文件格式错误')
  }
  
  e.target.value = ''
}

const confirmDelete = (template: any) => {
  deleteDialog.template = template
  deleteDialog.show = true
}

const cancelDelete = () => {
  deleteDialog.show = false
  deleteDialog.template = null
}

const confirmDeleteAction = () => {
  if (deleteDialog.template) {
    const success = store.delete(deleteDialog.template.id)
    if (success) {
      showNotification('success', `模板 "${deleteDialog.template.name}" 已删除`)
    } else {
      showNotification('error', '删除失败')
    }
  }
  cancelDelete()
}

const refreshTemplates = () => {
  store.load()
  showNotification('success', '模板列表已刷新')
}

const showNotification = (type: 'success' | 'error', message: string) => {
  notification.type = type
  notification.message = message
  notification.show = true
  
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

onMounted(() => {
  store.load()
})
</script>

<style scoped>
.el-button--danger {
  background: #dc2626;
  color: white;
  border-color: transparent;
}

.el-button--danger:hover {
  background: #b91c1c;
}
</style>