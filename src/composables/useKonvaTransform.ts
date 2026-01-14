import { ref } from 'vue'
import type { Ref } from 'vue'
import Konva from 'konva'

export const useKonvaTransform = (
  layerRef: Ref<Konva.Layer | null>,
  items: Ref<any[]>
) => {
  const transformerRef = ref<Konva.Transformer | null>(null)

  const throttle = (fn: (...args:any[]) => void, wait = 32) => {
    let last = 0
    let timeout: any = null
    return (...args:any[]) => {
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

  const attach = (node: any) => {
    if (!layerRef.value || !node) return
    if (transformerRef.value) { transformerRef.value.destroy(); transformerRef.value = null }
    const tr = new Konva.Transformer({ nodes: [node], rotateEnabled: false, enabledAnchors: ['top-left','top-right','bottom-left','bottom-right'] })
    transformerRef.value = tr
    layerRef.value.add(tr as any)
    tr.moveToTop()
    layerRef.value.draw()
  }

  const clear = () => {
    if (transformerRef.value) { transformerRef.value.destroy(); transformerRef.value = null }
    layerRef.value?.draw()
  }

  const bindTextTransforms = (text: Konva.Text, idx: number) => {
    text.on('transform', throttle(() => { 
      const fs = text.fontSize() * text.scaleX()
      items.value[idx].fontSize = Math.max(8, Math.min(96, fs)) // 限制字体大小范围
    }, 16))
    text.on('transformend', () => { 
      text.scale({ x: 1, y: 1 })
      text.fontSize(items.value[idx].fontSize)
      layerRef.value?.draw()
    })
  }

  // Bind rectangle transforms
  const bindRectTransforms = (rect: Konva.Rect, idx: number) => {
    rect.on('transform', throttle(() => { 
      const w = Math.max(8, rect.width() * rect.scaleX())
      const h = Math.max(8, rect.height() * rect.scaleY())
      items.value[idx].w = w
      items.value[idx].h = h
    }, 16))
    rect.on('transformend', () => { 
      rect.scale({ x: 1, y: 1 })
      rect.size({ 
        width: items.value[idx].w || rect.width(), 
        height: items.value[idx].h || rect.height() 
      })
      layerRef.value?.draw()
    })
  }

  const bindImageTransforms = (imgNode: Konva.Image, idx: number) => {
    // natW and natH are the natural width and height of the image
    const natW = (imgNode.image() as any)?.width || imgNode.width()
    const natH = (imgNode.image() as any)?.height || imgNode.height()
    const ratio = natW && natH ? (natW / natH) : 1

    imgNode.on('transform', throttle(() => {
      const w = Math.max(16, imgNode.width() * imgNode.scaleX()) // 最小宽度16px
      const h = Math.round(w / ratio)
      items.value[idx].w = w
      items.value[idx].h = h
      // 保持宽高比
      imgNode.scaleY(imgNode.scaleX())
    }, 16))
    imgNode.on('transformend', () => {
      const w = items.value[idx].w
      const h = Math.round(w / ratio)
      items.value[idx].h = h
      imgNode.scale({ x: 1, y: 1 })
      imgNode.size({ width: w, height: h })
      layerRef.value?.draw()
    })
  }

  return { transformerRef, attach, clear, bindTextTransforms, bindRectTransforms, bindImageTransforms }
}
