/** Constantes compartidas del módulo de Planificación. */

/** Paleta de bandas del formato Ministerio (hex concretos → viajan a todos los exportadores). */
export const BAND = {
  /** Azul de encabezados/títulos del formato oficial. */
  headerBlue: '#c9d7ef',
  /** Azul más suave para sub-encabezados y etiquetas de datos. */
  subHeaderBlue: '#dbe5f5',
  /** Blanco para celdas de captura. */
  white: '#ffffff',
} as const

/** Restricciones de subida de imágenes propias (celdas `image` con allowUpload). */
export const UPLOAD = {
  /** Tipos MIME aceptados. */
  acceptedTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'] as string[],
  accept: '.png,.jpg,.jpeg,.svg,.webp',
  /** Tamaño máximo por archivo (bytes). */
  maxBytes: 2 * 1024 * 1024, // 2 MB
} as const

/** Ruta del manifest de íconos (hoy estático; mañana GET /icons del backend). */
export const ICONS_MANIFEST_URL = '/planning-icons/icons-manifest.json'

/**
 * Ámbito de propiedad actual (institución/usuario). En el mock se usa para
 * validar que una celda `image` solo acepte assets subidos por este ámbito.
 * Cuando llegue el backend, sale del token/sesión.
 */
export const CURRENT_OWNER_ID = 'ue-alberto-guerra'
