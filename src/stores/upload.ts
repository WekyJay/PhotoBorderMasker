import { defineStore } from 'pinia'

export const useUploadStore = defineStore('pbm-upload', {
  state: () => ({ objectUrl: null as string | null, file: null as File | null }),
  actions: {
    setFile(file: File) { this.file = file; this.objectUrl = URL.createObjectURL(file) },
    clear() { if (this.objectUrl) { try { URL.revokeObjectURL(this.objectUrl) } catch {} } this.objectUrl = null; this.file = null }
  }
})
