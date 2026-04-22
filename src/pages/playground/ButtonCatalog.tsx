import type { ReactNode } from 'react'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import type {
    ButtonSize,
    ButtonVariant,
} from '../../components/ui/buttons/ButtonComponent'
import { PlusIcon, SettingsIcon } from '../../icons/icons'

type CatalogSectionProps = {
    title: string
    description: string
    children: ReactNode
}

type VariantExample = {
    label: string
    variant: ButtonVariant
    icon: ReactNode
}

type SizeExample = {
    label: string
    size: Exclude<ButtonSize, 'icon'>
}

const variantExamples: VariantExample[] = [
    {
        label: 'Principal',
        variant: 'primary',
        icon: <PlusIcon />,
    },
    {
        label: 'Secundario',
        variant: 'secondary',
        icon: <ChartIcon />,
    },
    {
        label: 'Contorno',
        variant: 'outline',
        icon: <SearchIcon />,
    },
    {
        label: 'Ligero',
        variant: 'ghost',
        icon: <SettingsIcon />,
    },
    {
        label: 'Exitoso',
        variant: 'success',
        icon: <CheckIcon />,
    },
    {
        label: 'Peligro',
        variant: 'danger',
        icon: <TrashIcon />,
    },
]

const sizeExamples: SizeExample[] = [
    {
        label: 'Pequeno',
        size: 'sm',
    },
    {
        label: 'Mediano',
        size: 'md',
    },
    {
        label: 'Grande',
        size: 'lg',
    },
]

function CatalogSection({ title, description, children }: CatalogSectionProps) {
    return (
        <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-(--color-text)">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-(--color-text-muted)">
                    {description}
                </p>
            </div>
            {children}
        </article>
    )
}

function IconWrapper({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex size-5 items-center justify-center">
            {children}
        </span>
    )
}

function ArrowRightIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                    d="M4 10h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </IconWrapper>
    )
}

function SearchIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                    d="m14 14 3 3M8.5 15a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </IconWrapper>
    )
}


function CheckIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                    d="m4 10.5 4 4L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </IconWrapper>
    )
}

function TrashIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                    d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </IconWrapper>
    )
}

function ChartIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                    d="M4 16V9M10 16V4M16 16v-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </IconWrapper>
    )
}

export default function ButtonCatalog() {
    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm sm:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-highlight-soft blur-3xl" />

                <div className="relative max-w-3xl">
                    <p className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                        UI Catalog
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-(--color-text) sm:text-4xl">
                        Catalogo de botones
                    </h1>
                    <p className="mt-3 text-sm text-(--color-text-muted) sm:text-base">
                        Guia visual para usar botones reutilizables del panel con
                        variantes, tamanos, estados e iconos a la izquierda o derecha.
                    </p>
                </div>
            </section>

            <section className="mt-8 grid gap-5 xl:grid-cols-2">
                <CatalogSection
                    title="Variantes"
                    description="Usa cada variante segun la jerarquia de la accion."
                >
                    <div className="flex flex-wrap gap-3">
                        {variantExamples.map((example) => (
                            <ButtonComponent
                                key={example.variant}
                                variant={example.variant}
                                leftIcon={example.icon}
                            >
                                {example.label}
                            </ButtonComponent>
                        ))}
                    </div>
                </CatalogSection>

                <CatalogSection
                    title="Iconos por posicion"
                    description="Puedes colocar iconos a la izquierda o derecha sin cambiar el layout."
                >
                    <div className="flex flex-wrap gap-3">
                        <ButtonComponent leftIcon={<PlusIcon />}>
                            Crear torneo
                        </ButtonComponent>
                        <ButtonComponent variant="secondary" rightIcon={<ArrowRightIcon />}>
                            Ver reportes
                        </ButtonComponent>
                        <ButtonComponent
                            variant="outline"
                            icon={<SearchIcon />}
                            iconPosition="left"
                        >
                            Buscar modulo
                        </ButtonComponent>
                        <ButtonComponent
                            variant="ghost"
                            icon={<SettingsIcon />}
                            iconPosition="right"
                        >
                            Configurar
                        </ButtonComponent>
                    </div>
                </CatalogSection>

                <CatalogSection
                    title="Tamanos"
                    description="Mantiene altura, padding y tipografia consistentes."
                >
                    <div className="flex flex-wrap items-center gap-3">
                        {sizeExamples.map((example) => (
                            <ButtonComponent
                                key={example.size}
                                size={example.size}
                                variant="outline"
                                leftIcon={<CheckIcon />}
                            >
                                {example.label}
                            </ButtonComponent>
                        ))}
                    </div>
                </CatalogSection>

                <CatalogSection
                    title="Estados"
                    description="Estados listos para formularios, acciones asincronas y permisos restringidos."
                >
                    <div className="flex flex-wrap gap-3">
                        <ButtonComponent isLoading loadingText="Guardando...">
                            Guardar
                        </ButtonComponent>
                        <ButtonComponent disabled variant="secondary" rightIcon={<ArrowRightIcon />}>
                            Accion bloqueada
                        </ButtonComponent>
                        <ButtonComponent variant="danger" leftIcon={<TrashIcon />}>
                            Eliminar registro
                        </ButtonComponent>
                    </div>
                </CatalogSection>

                <CatalogSection
                    title="Ancho completo"
                    description="Util para formularios, modales y acciones principales en mobile."
                >
                    <div className="grid gap-3">
                        <ButtonComponent fullWidth leftIcon={<PlusIcon />}>
                            Crear nuevo campeonato
                        </ButtonComponent>
                        <ButtonComponent fullWidth variant="outline" rightIcon={<ArrowRightIcon />}>
                            Continuar configuracion
                        </ButtonComponent>
                    </div>
                </CatalogSection>

                <CatalogSection
                    title="Solo icono"
                    description="Usa aria-label cuando el boton no tenga texto visible."
                >
                    <div className="flex flex-wrap gap-3">
                        <ButtonComponent
                            size="icon"
                            aria-label="Crear"
                            title="Crear"
                        >
                            <PlusIcon />
                        </ButtonComponent>
                        <ButtonComponent
                            size="icon"
                            variant="outline"
                            aria-label="Buscar"
                            title="Buscar"
                        >
                            <SearchIcon />
                        </ButtonComponent>
                        <ButtonComponent
                            size="icon"
                            variant="ghost"
                            aria-label="Configurar"
                            title="Configurar"
                        >
                            <SettingsIcon />
                        </ButtonComponent>
                        <ButtonComponent
                            size="icon"
                            variant="danger"
                            aria-label="Eliminar"
                            title="Eliminar"
                        >
                            <TrashIcon />
                        </ButtonComponent>
                    </div>
                </CatalogSection>
            </section>
        </main>
    )
}
