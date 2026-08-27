/**
 * Generador del catálogo de íconos de planificación.
 *
 * Produce, para cada ícono:
 *   - public/planning-icons/svg/<id>.svg   → fuente de verdad (pantalla + PDF)
 *   - public/planning-icons/icons-manifest.json → { id, label, tags, svgPath, pngPath }
 *
 * Los PNG @2x (para incrustar en Word/Excel) se rasterizan aparte con
 * `scripts/rasterize-planning-icons.mjs` cuando se implemente el backend/exportadores.
 * Este script es la única fuente que hay que tocar para agregar íconos nuevos.
 *
 * Uso:  node scripts/generate-planning-icons.mjs
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'planning-icons')
const SVG_DIR = join(OUT_DIR, 'svg')

// Color fijo para consistencia pantalla/PDF/Word/Excel sobre fondo claro.
const STROKE = '#1f2937'

/**
 * Cada entrada define el "cuerpo" del SVG (paths con viewBox 0 0 24 24).
 * Trazo currentColor-neutral, sin relleno, para que rasterice limpio a PNG.
 */
const ICONS = [
  { id: 'idea', label: 'Idea / Anticipación', tags: ['idea', 'anticipacion', 'foco', 'bombilla', 'inicio', 'motivacion'],
    body: `<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3Z"/>` },
  { id: 'target', label: 'Objetivo', tags: ['objetivo', 'meta', 'diana', 'proposito', 'logro'],
    body: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>` },
  { id: 'book-open', label: 'Lectura', tags: ['lectura', 'libro', 'leer', 'texto', 'comprension'],
    body: `<path d="M12 6c-2-1.3-4.5-2-7-2v13c2.5 0 5 .7 7 2 2-1.3 4.5-2 7-2V4c-2.5 0-5 .7-7 2Z"/><path d="M12 6v13"/>` },
  { id: 'pencil', label: 'Escritura', tags: ['escritura', 'lapiz', 'escribir', 'redaccion', 'tarea'],
    body: `<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M14 6l4 4"/>` },
  { id: 'users', label: 'Trabajo colaborativo', tags: ['grupo', 'equipo', 'colaboracion', 'usuarios', 'social'],
    body: `<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M17 14.5a6 6 0 0 1 4 5.5"/>` },
  { id: 'clipboard-check', label: 'Evaluación', tags: ['evaluacion', 'revision', 'checklist', 'criterio', 'indicador'],
    body: `<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 13l2 2 4-4"/>` },
  { id: 'calendar', label: 'Calendario', tags: ['calendario', 'fecha', 'semana', 'cronograma', 'planificacion'],
    body: `<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>` },
  { id: 'clock', label: 'Tiempo', tags: ['tiempo', 'reloj', 'duracion', 'hora', 'periodo'],
    body: `<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>` },
  { id: 'gear', label: 'Proceso / Construcción', tags: ['construccion', 'proceso', 'engranaje', 'metodologia', 'estrategia'],
    body: `<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>` },
  { id: 'puzzle', label: 'Juego / Consolidación', tags: ['juego', 'consolidacion', 'puzzle', 'ludico', 'refuerzo'],
    body: `<path d="M9 4h2a1 1 0 0 1 1 1 1.5 1.5 0 0 0 3 0 1 1 0 0 1 1-1h2v4a1 1 0 0 0 1 1 1.5 1.5 0 0 1 0 3 1 1 0 0 0-1 1v4h-4a1 1 0 0 1-1-1 1.5 1.5 0 0 0-3 0 1 1 0 0 1-1 1H5v-4a1 1 0 0 1 1-1 1.5 1.5 0 0 0 0-3 1 1 0 0 1-1-1V4h4Z"/>` },
  { id: 'flask', label: 'Ciencia', tags: ['ciencia', 'experimento', 'laboratorio', 'quimica', 'investigacion'],
    body: `<path d="M9 3v6l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V3"/><path d="M8 3h8M7 15h10"/>` },
  { id: 'calculator', label: 'Matemática', tags: ['matematica', 'calculo', 'numeros', 'calculadora', 'operaciones'],
    body: `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>` },
  { id: 'music-note', label: 'Música', tags: ['musica', 'nota', 'sonido', 'melodia', 'ritmo'],
    body: `<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>` },
  { id: 'palette', label: 'Arte', tags: ['arte', 'pintura', 'creatividad', 'color', 'dibujo'],
    body: `<path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="9.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>` },
  { id: 'video', label: 'Video', tags: ['video', 'reproducir', 'multimedia', 'audiovisual', 'recurso'],
    body: `<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l6-3v10l-6-3"/>` },
  { id: 'image', label: 'Imagen', tags: ['imagen', 'foto', 'ilustracion', 'grafico', 'recurso visual'],
    body: `<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5L5 19"/>` },
  { id: 'box', label: 'Recursos / Materiales', tags: ['recursos', 'materiales', 'caja', 'insumos', 'kit'],
    body: `<path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>` },
  { id: 'globe', label: 'Estudios sociales', tags: ['sociales', 'mundo', 'globo', 'geografia', 'ciudadania'],
    body: `<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13 0 16M12 4c-2.5 2.5-2.5 13 0 16"/>` },
  { id: 'check-badge', label: 'Logro', tags: ['logro', 'meta', 'insignia', 'aprobado', 'destreza'],
    body: `<path d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6L4 15.6l.8-2.6L4 10.4l2.2-1.6.9-2.6 2.7.2L12 3Z"/><path d="M9 12l2 2 4-4"/>` },
  { id: 'chat', label: 'Comunicación', tags: ['comunicacion', 'dialogo', 'mensaje', 'conversacion', 'oral'],
    body: `<path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/>` },
]

function svgFile(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`
}

rmSync(SVG_DIR, { recursive: true, force: true })
mkdirSync(SVG_DIR, { recursive: true })

const manifest = ICONS.map(({ id, label, tags }) => ({
  id,
  label,
  tags,
  svgPath: `/planning-icons/svg/${id}.svg`,
  pngPath: `/planning-icons/png/${id}@2x.png`, // rasterizado en la fase backend/export
}))

for (const icon of ICONS) {
  writeFileSync(join(SVG_DIR, `${icon.id}.svg`), svgFile(icon.body), 'utf8')
}

writeFileSync(
  join(OUT_DIR, 'icons-manifest.json'),
  JSON.stringify({ version: 1, icons: manifest }, null, 2) + '\n',
  'utf8',
)

console.log(`✓ ${ICONS.length} íconos SVG generados en ${SVG_DIR}`)
console.log(`✓ manifest → ${join(OUT_DIR, 'icons-manifest.json')}`)
