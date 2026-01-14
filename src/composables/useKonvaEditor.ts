import { ref, reactive, watch } from 'vue'
import type { Ref } from 'vue'
import Konva from 'konva'
import { useKonvaTransform } from './useKonvaTransform'
import { computeFrameLayout, drawFrame, createRoundedImageGroup } from './useFrameLayout'
import { createShadowedImage, addBlurBackgroundCover } from './useKonvaEffects'

export interface EditorItem {
  type: 'text' | 'rect' | 'icon'
  x: number
  y: number
  text?: string
  fontSize?: number
  fontFamily?: string
  color: string
  w?: number
  h?: number
  brand?: string
}

export interface BorderConfig {
  thickness: number
  top: number
  right: number
  bottom: number
  left: number
  innerPadding: number
  outerPadding: number
  color: string
  radius: number
  style: 'solid' | 'dashed' | 'dotted'
}

export interface ImageFxConfig {
  enableShadow: boolean
  preset: 'soft-shadow' | 'deep-shadow' | 'inner-shadow' | 'glow-effect' | 'multi-shadow' | 'custom'
  angleDeg: number
  distance: number
  custom: { x: number; y: number; blur: number; spread: number; color: string }
  enableBlurBorder: boolean
  blurRadius: number
  blurColor: string
  autoColor: boolean
}

export const useKonvaEditor = (
  stageWrap: Ref<HTMLDivElement | null>,
  imageData: Ref<string | null>,
  imgObjRef: Ref<HTMLImageElement | null>,
  imageReady: Ref<boolean>
) => {
  const stageRef = ref<Konva.Stage | null>(null)
  const layerRef = ref<Konva.Layer | null>(null)
  const imageNodeRef = ref<Konva.Image | null>(null)
  const items = ref<EditorItem[]>([])
  const selectedIndex = ref<number | null>(null)
  const nodes = ref<any[]>([])
  const suppressRender = ref(false)
  
  let rafId: number | null = null
  let resizeTimer: any = null

  const { transformerRef, attach, clear, bindTextTransforms, bindRectTransforms, bindImageTransforms } = useKonvaTransform(layerRef as any, items as any)

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

  const scheduleRender = throttle(() => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      if (!suppressRender.value) {
        rebuildStage()
      }
    })
  }, 16)

  const rebuildStage = () => {
    const wrap = stageWrap.value
    if (!wrap) return

    const w = wrap.clientWidth
    const h = Math.max(420, w * 0.66)

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
      renderCanvas()
    }
  }

  const renderCanvas = () => {
    if (!layerRef.value || !imgObjRef.value || !stageRef.value) return

    const w = stageRef.value.width()
    // 这里需要传入border配置，暂时使用默认值
    const defaultBorder: BorderConfig = {
      thickness: 60, top: 0, right: 0, bottom: 60, left: 0,
      innerPadding: 0, outerPadding: 0, color: '#ffffff',
      radius: 0, style: 'solid'
    }
    
    const layout = computeFrameLayout(
      { w: imgObjRef.value.width, h: imgObjRef.value.height },
      defaultBorder,
      w
    )

    stageRef.value.size({ width: w, height: Math.max(layout.vh, 420) })

    const { bg } = drawFrame(layerRef.value, layout, defaultBorder.color)
    bg.on('click tap', () => { clearSelection() })

    const imgGroup = createRoundedImageGroup(imgObjRef.value, layout)
    layerRef.value.add(imgGroup)

    // 重新添加所有元素
    nodes.value = []
    items.value.forEach((item, idx) => addItemNode(item, idx))

    layerRef.value.draw()
  }

  const addItemNode = (item: EditorItem, idx: number) => {
    if (!layerRef.value) return

    if (item.type === 'text') {
      const text = new Konva.Text({
        x: item.x,
        y: item.y,
        text: item.text || 'Text',
        fontSize: item.fontSize || 16,
        fontFamily: item.fontFamily || 'Inter',
        fill: item.color || '#000000'
      })
      text.draggable(true)
      text.on('click', () => selectItem(idx, text))
      text.on('dragmove', () => {
        suppressRender.value = true
        const p = text.position()
        items.value[idx].x = p.x
        items.value[idx].y = p.y
      })
      text.on('dragend', () => {
        suppressRender.value = false
        scheduleRender()
      })
      bindTextTransforms(text, idx)
      layerRef.value.add(text)
      nodes.value[idx] = text
    } else if (item.type === 'rect') {
      const rect = new Konva.Rect({
        x: item.x,
        y: item.y,
        width: item.w || 120,
        height: item.h || 24,
        fill: item.color || '#000000'
      })
      rect.draggable(true)
      rect.on('click', () => selectItem(idx, rect))
      rect.on('dragmove', () => {
        suppressRender.value = true
        const p = rect.position()
        items.value[idx].x = p.x
        items.value[idx].y = p.y
      })
      rect.on('dragend', () => {
        suppressRender.value = false
        scheduleRender()
      })
      bindRectTransforms(rect, idx)
      layerRef.value.add(rect)
      nodes.value[idx] = rect
    }
  }

  const selectItem = (idx: number, node: any) => {
    selectedIndex.value = idx
    attach(node)
  }

  const clearSelection = () => {
    selectedIndex.value = null
    clear()
  }

  const addText = (text: string = 'Text', x: number = 40, y: number = 40) => {
    items.value.push({
      type: 'text',
      text,
      x,
      y,
      fontSize: 18,
      color: '#000000',
      fontFamily: 'Inter'
    })
    scheduleRender()
  }

  const addRect = (x: number = 40, y: number = 80) => {
    items.value.push({
      type: 'rect',
      x,
      y,
      w: 160,
      h: 28,
      color: '#000000'
    })
    scheduleRender()
  }

  const removeSelected = () => {
    if (selectedIndex.value === null) return
    items.value.splice(selectedIndex.value, 1)
    clearSelection()
    scheduleRender()
  }

  const updateSelected = (field: string, value: any) => {
    if (selectedIndex.value === null) return
    const item = items.value[selectedIndex.value]
    ;(item as any)[field] = value
    scheduleRender()
  }

  // 监听窗口大小变化
  const handleResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(scheduleRender, 120)
  }

  return {
    stageRef,
    layerRef,
    imageNodeRef,
    items,
    selectedIndex,
    nodes,
    scheduleRender,
    rebuildStage,
    addText,
    addRect,
    removeSelected,
    updateSelected,
    selectItem,
    clearSelection,
    handleResize,
    suppressRender
  }
}