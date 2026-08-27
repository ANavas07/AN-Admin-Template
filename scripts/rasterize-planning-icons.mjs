/**
 * Rasteriza cada SVG del catálogo a PNG @2x con fondo transparente.
 * Se usa en la FASE BACKEND/EXPORTADORES: los PNG son los que se incrustan
 * en Word (docx ImageRun) y Excel (ExcelJS addImage). En pantalla y PDF se
 * sigue usando el SVG (fuente de verdad), así que el frontend NO depende de esto.
 *
 * Requiere `sharp`  →  pnpm add -D sharp
 * Uso:  node scripts/rasterize-planning-icons.mjs [--size 48]
 *
 * `size` es el tamaño lógico base en px; el PNG se emite a 2x (retina).
 * El tamaño real de incrustación lo define `cell.size` del TemplateDefinition;
 * aquí solo garantizamos densidad suficiente para que no pixele.
 */
import { readFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'planning-icons')
const SVG_DIR = join(OUT_DIR, 'svg')
const PNG_DIR = join(OUT_DIR, 'png')

const sizeArg = process.argv.indexOf('--size')
const baseSize = sizeArg !== -1 ? Number(process.argv[sizeArg + 1]) : 48
const px = baseSize * 2 // @2x

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('✗ Falta la dependencia "sharp". Instálala con:  pnpm add -D sharp')
  process.exit(1)
}

rmSync(PNG_DIR, { recursive: true, force: true })
mkdirSync(PNG_DIR, { recursive: true })

const svgs = readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg'))
for (const file of svgs) {
  const id = basename(file, '.svg')
  const svg = readFileSync(join(SVG_DIR, file))
  await sharp(svg, { density: 384 })
    .resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(PNG_DIR, `${id}@2x.png`))
}

console.log(`✓ ${svgs.length} PNG @2x (${px}px, fondo transparente) → ${PNG_DIR}`)
