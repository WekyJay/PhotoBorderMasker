import Konva from 'konva'

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
  style: 'solid'|'dashed'|'dotted'
}

export const computeFrameLayout = (img: { w:number; h:number }, border: BorderConfig, containerW: number) => {
  const outer = border.outerPadding
  const inner = border.innerPadding
  const top = border.top ?? border.thickness
  const right = border.right ?? border.thickness
  const bottom = border.bottom ?? border.thickness
  const left = border.left ?? border.thickness
  const bw = Math.min(containerW - 40, img.w + inner*2 + left + right)
  const scale = (bw - inner*2 - left - right) / img.w
  const vh = Math.round(img.h * scale + inner*2 + top + bottom + outer*2)
  const fx = Math.round((containerW - bw)/2)
  const fy = Math.round(outer)
  const iwScaled = Math.round(img.w*scale)
  const ihScaled = Math.round(img.h*scale)
  const rMax = Math.min(border.radius, Math.floor(Math.min(iwScaled, ihScaled)/2))
  const sx = Math.round(fx + left + inner)
  const sy = Math.round(fy + top + inner)
  return { outer, inner, top, right, bottom, left, bw, scale, vh, fx, fy, iwScaled, ihScaled, rMax, sx, sy }
}

export const drawFrame = (layer: Konva.Layer, layout: ReturnType<typeof computeFrameLayout>, color: string) => {
  const { fx, fy, bw, outer, ihScaled, inner, top, bottom } = layout
  const bg = new Konva.Rect({ x: fx - outer, y: 0, width: Math.round(bw + outer*2), height: Math.round(ihScaled + inner*2 + top + bottom + outer*2), fill: color })
  layer.add(bg)
  const mat = new Konva.Rect({ x: fx, y: fy, width: Math.round(bw), height: Math.round(ihScaled + inner*2 + top + bottom), fill: color })
  layer.add(mat)
  return { bg, mat }
}

export const createRoundedImageGroup = (image: HTMLImageElement, layout: ReturnType<typeof computeFrameLayout>) => {
  const { iwScaled, ihScaled, rMax, sx, sy } = layout
  const imgGroup = new Konva.Group({ x: sx, y: sy })
  imgGroup.clipFunc((ctx) => {
    const w = iwScaled; const h = ihScaled; const r = rMax
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(w - r, 0)
    ctx.quadraticCurveTo(w, 0, w, r)
    ctx.lineTo(w, h - r)
    ctx.quadraticCurveTo(w, h, w - r, h)
    ctx.lineTo(r, h)
    ctx.quadraticCurveTo(0, h, 0, h - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
  })
  const img = new Konva.Image({ image, x: 0, y: 0, width: iwScaled, height: ihScaled })
  imgGroup.add(img)
  return imgGroup
}
