import { defineStore } from 'pinia'

export const useTemplatesStore = defineStore('pbm-templates', {
  state: () => ({ templates: [] as any[] }),
  actions: {
    load() {
      const cached = localStorage.getItem('pbm_templates')
      if (cached) {
        this.templates = JSON.parse(cached)
      } else {
        const modules = import.meta.glob('../assets/templates/*.json', { eager: true }) as Record<string, any>
        const defaults = Object.values(modules).map((m: any) => m.default ?? m)
        this.templates = defaults
      }
    },
    save(tpl: any) {
      const existingIndex = this.templates.findIndex(t => t.id === tpl.id)
      if (existingIndex >= 0) {
        // 更新现有模板
        this.templates[existingIndex] = { ...tpl }
      } else {
        // 添加新模板
        this.templates.push(tpl)
      }
      this.syncToStorage()
    },
    delete(templateId: string) {
      const index = this.templates.findIndex(t => t.id === templateId)
      if (index >= 0) {
        this.templates.splice(index, 1)
        this.syncToStorage()
        return true
      }
      return false
    },
    update(templateId: string, updates: any) {
      const index = this.templates.findIndex(t => t.id === templateId)
      if (index >= 0) {
        this.templates[index] = { ...this.templates[index], ...updates }
        this.syncToStorage()
        return true
      }
      return false
    },
    duplicate(templateId: string) {
      const template = this.templates.find(t => t.id === templateId)
      if (template) {
        const newId = 'tpl-' + Date.now()
        const duplicated = {
          ...template,
          id: newId,
          name: template.name + ' (副本)'
        }
        this.templates.push(duplicated)
        this.syncToStorage()
        return duplicated
      }
      return null
    },
    syncToStorage() {
      localStorage.setItem('pbm_templates', JSON.stringify(this.templates))
    },
    canDelete(templateId: string) {
      // 不能删除默认模板
      return templateId !== 'default'
    }
  }
})
