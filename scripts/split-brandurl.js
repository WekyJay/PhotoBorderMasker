import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function sanitizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || null
}

function nextAvailableName(dir, base, ext) {
  let candidate = `${base}${ext}`
  let i = 2
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${base}-${i}${ext}`
    i += 1
  }
  return candidate
}

async function main() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const inputPath = path.resolve(__dirname, '../src/assets/brand-logos/brandurl')
  const outputDir = path.resolve(__dirname, '../src/assets/brand-logos')

  if (!fs.existsSync(inputPath)) {
    console.error('brandurl 文件不存在:', inputPath)
    process.exit(1)
  }

  const raw = fs.readFileSync(inputPath, 'utf-8')
  const size = Buffer.byteLength(raw, 'utf-8')
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) {
    console.error('brandurl 内容为空')
    console.error('读取路径:', inputPath)
    console.error('字节大小:', size)
    process.exit(1)
  }

  let index = 1
  let created = 0
  for (const line of lines) {
    let svg = null
    let brandFromUrl = null
    const trimmed = line.replace(/^'+|'+$/g, '')
    if (/^data:image\/svg\+xml,/i.test(trimmed)) {
      const commaIdx = trimmed.indexOf(',')
      if (commaIdx === -1) continue
      const encoded = trimmed.slice(commaIdx + 1)
      try { svg = decodeURIComponent(encoded) } catch { continue }
    } else if (/^https?:\/\//i.test(trimmed)) {
      try {
        const res = await fetch(trimmed)
        if (!res.ok) continue
        svg = await res.text()
        try {
          const u = new URL(trimmed)
          const base = path.basename(u.pathname)
          const name = base.replace(/\.svg$/i, '')
          brandFromUrl = sanitizeName(name)
        } catch {}
      } catch { continue }
    } else { continue }

    const s = String(svg || '').trim()
    if (!s.startsWith('<svg')) continue

    let brand = null
    const titleMatch = s.match(/<title>([^<]+)<\/title>/i)
    if (titleMatch) brand = sanitizeName(titleMatch[1])
    if (!brand && brandFromUrl) brand = brandFromUrl
    if (!brand) {
      const guessKeys = ['canon','nikon','sony','fujifilm','apple','samsung','huawei','xiaomi','dji','gopro','motorola','leica','pentax','olympus','panasonic']
      const lower = s.toLowerCase()
      const hit = guessKeys.find(k => lower.includes(k))
      if (hit) brand = hit
    }

    const baseName = brand ? brand : String(index)
    const fileName = nextAvailableName(outputDir, baseName, '.svg')
    fs.writeFileSync(path.join(outputDir, fileName), s, 'utf-8')
    created += 1
    index += 1
  }

  console.log(`已生成 ${created} 个 SVG 文件到: ${outputDir}`)
}

await main()

