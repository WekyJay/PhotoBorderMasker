import Konva from 'konva'

export const offsetFromAngle = (distance: number, angleDeg: number) => {
  const rad = (angleDeg % 360) * Math.PI / 180
  const x = Math.round(distance * Math.cos(rad))
  const y = Math.round(distance * Math.sin(rad))
  return { x, y }
}

export const addBlurBackgroundCover = (layer: Konva.Layer, image: HTMLImageElement, rect: { x:number; y:number; w:number; h:number }, options: { radius:number }) => {
  if (!image) return
  const coverScale = Math.max(rect.w / image.width, rect.h / image.height)
  const bgW = Math.round(image.width * coverScale)
  const bgH = Math.round(image.height * coverScale)
  const bgX = Math.round(rect.x + (rect.w - bgW) / 2)
  const bgY = Math.round(rect.y + (rect.h - bgH) / 2)
  const bgImg = new Konva.Image({ image, x: bgX, y: bgY, width: bgW, height: bgH, opacity: 1, listening: false })
  bgImg.cache()
  bgImg.filters([Konva.Filters.Blur])
  ;(bgImg as any).blurRadius(options.radius)
  layer.add(bgImg)
}

export const createShadowedImage = (image: HTMLImageElement, cfg: { x:number; y:number; w:number; h:number }, fx: { enable:boolean; preset:'soft-shadow'|'deep-shadow'|'inner-shadow'|'glow-effect'|'multi-shadow'|'custom'; distance:number; angle:number; custom:{ x?:number; y?:number; blur:number } }) => {
  const off = offsetFromAngle(fx.distance, fx.angle)
  const blur = fx.preset==='soft-shadow' ? 8 : fx.preset==='deep-shadow' ? 16 : fx.preset==='multi-shadow' ? 10 : fx.custom.blur
  const color = fx.preset==='glow-effect' ? 'white' : 'black'
  const offset = fx.preset==='glow-effect' ? { x:0, y:0 } : { x: fx.custom.x ?? off.x, y: fx.custom.y ?? off.y }
  const opacity = fx.preset==='soft-shadow'?0.6: fx.preset==='deep-shadow'?0.75: fx.preset==='glow-effect'?0.9: fx.preset==='multi-shadow'?0.7: 0.9
  return new Konva.Image({ image, x: cfg.x, y: cfg.y, width: cfg.w, height: cfg.h, shadowColor: color, shadowBlur: blur, shadowOffset: { x: fx.enable ? offset.x : 0, y: fx.enable ? offset.y : 0 }, shadowOpacity: fx.enable ? opacity : 0 })
}
