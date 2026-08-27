// Mock dataset for the Tasks module. NOT imported directly by components —
// access is funneled through `useTasksMock()` so swapping to the real API
// touches a single file.
import type { Assignee, Project, Tag, Task, Team } from '../types'

const assignees: Assignee[] = [
    { id: 'u1', name: 'María Fernández', color: 'sky' },
    { id: 'u2', name: 'Carlos Ramírez', color: 'violet' },
    { id: 'u3', name: 'Lucía Torres', color: 'rose' },
    { id: 'u4', name: 'Diego Salazar', color: 'amber' },
    { id: 'u5', name: 'Ana Beltrán', color: 'emerald' },
    { id: 'u6', name: 'Jorge Medina', color: 'indigo' },
]

const byId = (id: string) => assignees.find((a) => a.id === id)!

const tags: Record<string, Tag> = {
    backend: { id: 't1', label: 'Backend', color: 'violet' },
    frontend: { id: 't2', label: 'Frontend', color: 'sky' },
    qa: { id: 't3', label: 'QA', color: 'amber' },
    ux: { id: 't4', label: 'UX', color: 'rose' },
    datos: { id: 't5', label: 'Datos', color: 'emerald' },
    docs: { id: 't6', label: 'Docs', color: 'slate' },
    infra: { id: 't7', label: 'Infra', color: 'indigo' },
}

// Sections double as Kanban columns and List groups.
const sections = [
    { id: 's1', name: 'Planificación', color: 'slate' as const, order: 0 },
    { id: 's2', name: 'En progreso', color: 'sky' as const, order: 1 },
    { id: 's3', name: 'En revisión / QA', color: 'amber' as const, order: 2 },
    { id: 's4', name: 'Completado', color: 'emerald' as const, order: 3 },
]

// Helper to keep the task literals compact.
function sub(id: string, title: string, completed = false) {
    return { id, title, completed }
}

const tasks: Task[] = [
    // ── Planificación ─────────────────────────────────────────────
    {
        id: 'k1',
        sectionId: 's1',
        title: 'Levantamiento de requisitos con Registro Académico',
        description:
            'Entrevistas con las áreas de Registro y Admisiones para consolidar el catálogo de requisitos funcionales del SGA.',
        completed: false,
        priority: 'high',
        startDate: '2026-08-19',
        dueDate: '2026-08-28',
        assignees: [byId('u1'), byId('u5')],
        tags: [tags.docs, tags.datos],
        subtasks: [
            sub('k1s1', 'Guion de entrevistas', true),
            sub('k1s2', 'Sesión con Registro Académico'),
            sub('k1s3', 'Consolidar matriz de requisitos'),
        ],
        dependsOn: [],
        comments: [
            {
                id: 'c1',
                author: byId('u5'),
                body: 'Adjunté el acta de la reunión inicial en la carpeta compartida.',
                createdAt: '2026-08-15T14:20:00',
            },
        ],
        location: 'Sede Central · Oficina de Registro Académico',
        order: 0,
    },
    {
        id: 'k2',
        sectionId: 's1',
        title: 'Diseño del modelo de datos de matrícula',
        description: 'Modelo entidad-relación para inscripción, pagos y récord académico.',
        completed: false,
        priority: 'high',
        startDate: '2026-08-25',
        dueDate: '2026-09-05',
        assignees: [byId('u2')],
        tags: [tags.datos, tags.backend],
        subtasks: [
            sub('k2s1', 'Diagrama ER preliminar'),
            sub('k2s2', 'Revisión con DBA'),
        ],
        dependsOn: ['k1'],
        comments: [],
        order: 1,
    },
    {
        id: 'k3',
        sectionId: 's1',
        title: 'Definir arquitectura de despliegue',
        description: 'Elegir entre monolito modular o microservicios y definir entornos.',
        completed: false,
        priority: 'normal',
        startDate: '2026-08-24',
        dueDate: '2026-09-02',
        assignees: [byId('u6')],
        tags: [tags.infra],
        subtasks: [],
        dependsOn: [],
        comments: [],
        order: 2,
    },
    {
        id: 'k4',
        sectionId: 's1',
        title: 'Wireframes del portal del estudiante',
        description: 'Bocetos de baja fidelidad para inscripción, horario y pagos.',
        completed: false,
        priority: 'normal',
        startDate: '2026-08-20',
        dueDate: '2026-08-30',
        assignees: [byId('u3')],
        tags: [tags.ux, tags.frontend],
        subtasks: [
            sub('k4s1', 'Flujo de inscripción'),
            sub('k4s2', 'Flujo de pago en línea'),
            sub('k4s3', 'Consulta de horario'),
        ],
        dependsOn: ['k1'],
        comments: [],
        order: 3,
    },

    // ── En progreso ───────────────────────────────────────────────
    {
        id: 'k5',
        sectionId: 's2',
        title: 'Módulo de inscripción en línea',
        description: 'API + pantallas para que el estudiante seleccione y confirme materias.',
        completed: false,
        priority: 'high',
        startDate: '2026-08-10',
        dueDate: '2026-08-17',
        assignees: [byId('u2'), byId('u3')],
        tags: [tags.backend, tags.frontend],
        subtasks: [
            sub('k5s1', 'Endpoint de oferta académica', true),
            sub('k5s2', 'Validación de prerrequisitos'),
            sub('k5s3', 'Pantalla de selección de materias', true),
            sub('k5s4', 'Confirmación y comprobante'),
        ],
        dependsOn: ['k2'],
        comments: [
            {
                id: 'c2',
                author: byId('u2'),
                body: 'La validación de cupos se está tomando más de lo previsto.',
                createdAt: '2026-08-16T09:10:00',
            },
            {
                id: 'c3',
                author: byId('u3'),
                body: 'Ya tengo la pantalla de selección lista para revisión.',
                createdAt: '2026-08-17T11:45:00',
            },
        ],
        order: 0,
    },
    {
        id: 'k6',
        sectionId: 's2',
        title: 'Integración con pasarela de pagos',
        description: 'Conectar el pago de matrícula con la pasarela institucional (PSE / tarjeta).',
        completed: false,
        priority: 'high',
        startDate: '2026-08-12',
        dueDate: '2026-08-15',
        assignees: [byId('u6')],
        tags: [tags.backend, tags.infra],
        subtasks: [
            sub('k6s1', 'Registro de credenciales sandbox', true),
            sub('k6s2', 'Webhook de confirmación'),
        ],
        dependsOn: ['k5'],
        comments: [],
        order: 1,
    },
    {
        id: 'k7',
        sectionId: 's2',
        title: 'Panel de horarios del estudiante',
        description: 'Vista semanal con las materias inscritas y aulas asignadas.',
        completed: false,
        priority: 'normal',
        startDate: '2026-08-14',
        dueDate: '2026-08-24',
        assignees: [byId('u3')],
        tags: [tags.frontend, tags.ux],
        subtasks: [
            sub('k7s1', 'Grilla semanal'),
            sub('k7s2', 'Exportar a PDF'),
        ],
        dependsOn: ['k5'],
        comments: [],
        order: 2,
    },
    {
        id: 'k8',
        sectionId: 's2',
        title: 'Migración de datos históricos de estudiantes',
        description: 'ETL desde el sistema legado hacia el nuevo modelo de datos.',
        completed: false,
        priority: 'normal',
        startDate: '2026-08-11',
        dueDate: '2026-08-29',
        assignees: [byId('u5'), byId('u2')],
        tags: [tags.datos],
        subtasks: [
            sub('k8s1', 'Mapa de campos legado → SGA', true),
            sub('k8s2', 'Script de extracción'),
            sub('k8s3', 'Validación de integridad'),
        ],
        dependsOn: ['k2'],
        comments: [],
        order: 3,
    },
    {
        id: 'k9',
        sectionId: 's2',
        title: 'Sistema de notificaciones por correo',
        description: 'Avisos de inscripción confirmada, pago recibido y recordatorios.',
        completed: false,
        priority: 'low',
        startDate: '2026-08-18',
        dueDate: '2026-09-01',
        assignees: [byId('u4')],
        tags: [tags.backend],
        subtasks: [],
        dependsOn: [],
        comments: [],
        order: 4,
    },

    // ── En revisión / QA ──────────────────────────────────────────
    {
        id: 'k10',
        sectionId: 's3',
        title: 'Pruebas de carga del portal de estudiantes',
        description: 'Simular 5.000 inscripciones concurrentes en el pico de matrícula.',
        completed: false,
        priority: 'high',
        startDate: '2026-08-13',
        dueDate: '2026-08-20',
        assignees: [byId('u4')],
        tags: [tags.qa, tags.infra],
        subtasks: [
            sub('k10s1', 'Escenario de carga en k6', true),
            sub('k10s2', 'Informe de latencias'),
        ],
        dependsOn: ['k5'],
        comments: [
            {
                id: 'c4',
                author: byId('u4'),
                body: 'A 3.000 usuarios la latencia sube; revisar índices de la BD.',
                createdAt: '2026-08-16T16:30:00',
            },
        ],
        order: 0,
    },
    {
        id: 'k11',
        sectionId: 's3',
        title: 'Auditoría de accesibilidad del portal',
        description: 'Revisión WCAG AA de contraste, foco y navegación por teclado.',
        completed: false,
        priority: 'normal',
        startDate: '2026-08-15',
        dueDate: '2026-08-22',
        assignees: [byId('u3'), byId('u1')],
        tags: [tags.qa, tags.ux],
        subtasks: [
            sub('k11s1', 'Contraste de color'),
            sub('k11s2', 'Navegación por teclado', true),
        ],
        dependsOn: ['k7'],
        comments: [],
        order: 1,
    },
    {
        id: 'k12',
        sectionId: 's3',
        title: 'Revisión de seguridad del módulo de pagos',
        description: 'Pentest básico y revisión de manejo de credenciales.',
        completed: false,
        priority: 'high',
        startDate: '2026-08-16',
        dueDate: '2026-08-25',
        assignees: [byId('u6')],
        tags: [tags.qa, tags.backend],
        subtasks: [],
        dependsOn: ['k6'],
        comments: [],
        order: 2,
    },

    // ── Completado ────────────────────────────────────────────────
    {
        id: 'k13',
        sectionId: 's4',
        title: 'Configuración del repositorio y CI/CD',
        description: 'Monorepo, linters, pipeline de build y despliegue a staging.',
        completed: true,
        priority: 'normal',
        startDate: '2026-08-01',
        dueDate: '2026-08-06',
        assignees: [byId('u6')],
        tags: [tags.infra],
        subtasks: [
            sub('k13s1', 'Pipeline de build', true),
            sub('k13s2', 'Despliegue a staging', true),
        ],
        dependsOn: [],
        comments: [],
        order: 0,
    },
    {
        id: 'k14',
        sectionId: 's4',
        title: 'Sistema de diseño y componentes base',
        description: 'Botones, inputs, modales y tokens de color reutilizables.',
        completed: true,
        priority: 'normal',
        startDate: '2026-08-03',
        dueDate: '2026-08-10',
        assignees: [byId('u1'), byId('u3')],
        tags: [tags.frontend, tags.ux],
        subtasks: [
            sub('k14s1', 'Paleta y tokens', true),
            sub('k14s2', 'Catálogo en playground', true),
        ],
        dependsOn: [],
        comments: [],
        order: 1,
    },
    {
        id: 'k15',
        sectionId: 's4',
        title: 'Autenticación y control de acceso (RBAC)',
        description: 'Login, sesión y roles admin / coordinador / estudiante.',
        completed: true,
        priority: 'high',
        startDate: '2026-08-04',
        dueDate: '2026-08-12',
        assignees: [byId('u2')],
        tags: [tags.backend],
        subtasks: [
            sub('k15s1', 'Flujo de login', true),
            sub('k15s2', 'Matriz de roles', true),
        ],
        dependsOn: [],
        comments: [],
        order: 2,
    },
    {
        id: 'k16',
        sectionId: 's4',
        title: 'Documento de alcance del proyecto',
        description: 'Alcance, cronograma general y criterios de aceptación aprobados.',
        completed: true,
        priority: 'low',
        startDate: '2026-07-28',
        dueDate: '2026-08-02',
        assignees: [byId('u5')],
        tags: [tags.docs],
        subtasks: [],
        dependsOn: [],
        comments: [],
        order: 3,
    },
    {
        id: 'k17',
        sectionId: 's4',
        title: 'Aprovisionamiento de entornos cloud',
        description: 'Entornos de desarrollo, staging y producción con IaC.',
        completed: true,
        priority: 'normal',
        startDate: '2026-08-05',
        dueDate: '2026-08-11',
        assignees: [byId('u6'), byId('u4')],
        tags: [tags.infra, tags.datos],
        subtasks: [sub('k17s1', 'Plantillas de infraestructura', true)],
        dependsOn: ['k13'],
        comments: [],
        order: 4,
    },
]

/** Reusable label catalog shared by the projects (custom tags live here). */
const tagCatalog: Tag[] = Object.values(tags)

export const mockProject: Project = {
    id: 'sga-2026',
    name: 'Implementación SGA 2026',
    description: 'Sistema de Gestión Académica — implantación institucional 2026.',
    teamId: 'team-acad',
    sections,
    tasks,
    assignees,
    tags: tagCatalog,
}

// ── Proyecto 2: Portal de Egresados ───────────────────────────────
const egresadosSections = [
    { id: 'p2s1', name: 'Planificación', color: 'slate' as const, order: 0 },
    { id: 'p2s2', name: 'En progreso', color: 'sky' as const, order: 1 },
    { id: 'p2s3', name: 'Completado', color: 'emerald' as const, order: 2 },
]

const egresadosTasks: Task[] = [
    {
        id: 'p2k1', sectionId: 'p2s1', title: 'Definir modelo de perfil del egresado',
        description: 'Campos, privacidad y verificación del perfil profesional.',
        completed: false, priority: 'high', startDate: '2026-08-20', dueDate: '2026-08-29',
        assignees: [byId('u1')], tags: [tags.datos, tags.docs],
        subtasks: [sub('p2k1s1', 'Inventario de campos'), sub('p2k1s2', 'Política de privacidad')],
        dependsOn: [], comments: [], order: 0,
    },
    {
        id: 'p2k2', sectionId: 'p2s1', title: 'Bolsa de empleo — requisitos',
        description: 'Reglas de publicación de vacantes y postulación.',
        completed: false, priority: 'normal', startDate: '2026-08-22', dueDate: '2026-09-03',
        assignees: [byId('u5')], tags: [tags.docs],
        subtasks: [], dependsOn: [], comments: [], order: 1,
    },
    {
        id: 'p2k3', sectionId: 'p2s2', title: 'Registro y verificación de egresados',
        description: 'Alta de cuenta con validación contra el histórico académico.',
        completed: false, priority: 'high', startDate: '2026-08-12', dueDate: '2026-08-21',
        assignees: [byId('u2'), byId('u3')], tags: [tags.backend, tags.frontend],
        subtasks: [sub('p2k3s1', 'Formulario de registro', true), sub('p2k3s2', 'Cruce con SGA')],
        dependsOn: ['p2k1'], comments: [], order: 0,
    },
    {
        id: 'p2k4', sectionId: 'p2s2', title: 'Directorio público de egresados',
        description: 'Listado buscable con filtros por carrera y año.',
        completed: false, priority: 'normal', startDate: '2026-08-16', dueDate: '2026-08-27',
        assignees: [byId('u3')], tags: [tags.frontend, tags.ux],
        subtasks: [], dependsOn: ['p2k3'], comments: [], order: 1,
    },
    {
        id: 'p2k5', sectionId: 'p2s3', title: 'Landing informativa del portal',
        description: 'Página de bienvenida con secciones institucionales.',
        completed: true, priority: 'low', startDate: '2026-08-04', dueDate: '2026-08-09',
        assignees: [byId('u3')], tags: [tags.frontend],
        subtasks: [sub('p2k5s1', 'Diseño', true), sub('p2k5s2', 'Maquetado', true)],
        dependsOn: [], comments: [], order: 0,
    },
    {
        id: 'p2k6', sectionId: 'p2s3', title: 'Infraestructura y dominio',
        description: 'Aprovisionamiento y certificado SSL del subdominio.',
        completed: true, priority: 'normal', startDate: '2026-08-02', dueDate: '2026-08-06',
        assignees: [byId('u6')], tags: [tags.infra],
        subtasks: [], dependsOn: [], comments: [], order: 1,
    },
]

const egresadosProject: Project = {
    id: 'egresados-2026',
    name: 'Portal de Egresados',
    description: 'Portal institucional para egresados: perfil, directorio y bolsa de empleo.',
    teamId: 'team-acad',
    sections: egresadosSections,
    tasks: egresadosTasks,
    assignees,
    tags: tagCatalog,
}

// ── Proyecto 3: App Móvil de Bienestar ────────────────────────────
const bienestarSections = [
    { id: 'p3s1', name: 'Backlog', color: 'violet' as const, order: 0 },
    { id: 'p3s2', name: 'En progreso', color: 'sky' as const, order: 1 },
    { id: 'p3s3', name: 'QA', color: 'amber' as const, order: 2 },
    { id: 'p3s4', name: 'Listo', color: 'emerald' as const, order: 3 },
]

const bienestarTasks: Task[] = [
    {
        id: 'p3k1', sectionId: 'p3s1', title: 'Agenda de citas de bienestar',
        description: 'Reserva de citas con psicología y medicina general.',
        completed: false, priority: 'high', startDate: '2026-08-25', dueDate: '2026-09-08',
        assignees: [byId('u4')], tags: [tags.frontend, tags.backend],
        subtasks: [sub('p3k1s1', 'Calendario de disponibilidad')], dependsOn: [], comments: [],
        location: 'Centro de Bienestar · Consultorio 2', order: 0,
    },
    {
        id: 'p3k2', sectionId: 'p3s1', title: 'Notificaciones push de recordatorio',
        description: 'Recordatorios de citas y campañas de salud.',
        completed: false, priority: 'low', startDate: '2026-08-28', dueDate: '2026-09-10',
        assignees: [byId('u6')], tags: [tags.infra],
        subtasks: [], dependsOn: ['p3k1'], comments: [], order: 1,
    },
    {
        id: 'p3k3', sectionId: 'p3s2', title: 'Onboarding y autenticación móvil',
        description: 'Inicio de sesión con la cuenta institucional.',
        completed: false, priority: 'high', startDate: '2026-08-14', dueDate: '2026-08-23',
        assignees: [byId('u2')], tags: [tags.backend, tags.ux],
        subtasks: [sub('p3k3s1', 'Login', true), sub('p3k3s2', 'Recuperar contraseña')],
        dependsOn: [], comments: [], order: 0,
    },
    {
        id: 'p3k4', sectionId: 'p3s3', title: 'Pruebas en dispositivos iOS/Android',
        description: 'Matriz de compatibilidad y rendimiento.',
        completed: false, priority: 'normal', startDate: '2026-08-18', dueDate: '2026-08-26',
        assignees: [byId('u4'), byId('u3')], tags: [tags.qa],
        subtasks: [], dependsOn: ['p3k3'], comments: [], order: 0,
    },
    {
        id: 'p3k5', sectionId: 'p3s4', title: 'Identidad visual de la app',
        description: 'Paleta, iconografía y guía de estilo móvil.',
        completed: true, priority: 'normal', startDate: '2026-08-01', dueDate: '2026-08-07',
        assignees: [byId('u1')], tags: [tags.ux],
        subtasks: [sub('p3k5s1', 'Guía de estilo', true)], dependsOn: [], comments: [], order: 0,
    },
]

const bienestarProject: Project = {
    id: 'bienestar-2026',
    name: 'App Móvil de Bienestar',
    description: 'Aplicación móvil de bienestar universitario: citas, recordatorios y campañas.',
    teamId: 'team-bienestar',
    sections: bienestarSections,
    tasks: bienestarTasks,
    assignees,
    tags: tagCatalog,
}

/** Todos los proyectos del espacio de trabajo, para el navegador lateral. */
export const mockProjects: Project[] = [mockProject, egresadosProject, bienestarProject]

/** People in the workspace, available to add to teams and projects. */
export const mockMembers: Assignee[] = assignees

/** Teams group people and their projects (ClickUp-style spaces). */
export const mockTeams: Team[] = [
    { id: 'team-acad', name: 'Plataforma Académica', color: 'violet', memberIds: ['u1', 'u2', 'u3', 'u6'] },
    { id: 'team-bienestar', name: 'Bienestar Universitario', color: 'emerald', memberIds: ['u4', 'u5'] },
]
