export const computeDominantColor = (img: HTMLImageElement): string => {
  const c = document.createElement('canvas')
  const s = Math.max(1, Math.min(64, Math.round(Math.max(img.width, img.height)/16)))
  c.width = s; c.height = s
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, s, s)
  const d = ctx.getImageData(0, 0, s, s).data
  let r=0,g=0,b=0,n=0
  for (let i=0;i<d.length;i+=4){ r+=d[i]; g+=d[i+1]; b+=d[i+2]; n++ }
  r=Math.round(r/n); g=Math.round(g/n); b=Math.round(b/n)
  return `rgb(${r},${g},${b})`
}
