import type { ReactNode } from 'react'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import type {
    ButtonSize,
    ButtonVariant,
} from '../../components/ui/buttons/ButtonComponent'
import { ArrowRightIcon, ChartIcon, CheckIcon, PlusIcon, SearchIcon, SettingsIcon, TrashBinIcon } from '../../icons/icons'
import { sileo } from 'sileo'
import { CatalogHeader, CatalogSection } from './components/CatalogLayout'

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
        icon: <TrashBinIcon />,
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

export default function ButtonCatalog() {
    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <CatalogHeader
                title="Catalogo de botones"
                description="Guia visual para usar botones reutilizables del panel con variantes, tamanos, estados e iconos a la izquierda o derecha."
            />

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
                        <ButtonComponent leftIcon={<PlusIcon />} onClick={() => sileo.info({ title: 'Toast de ejemplo', description: 'El servidor respondió con un error' })}>
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
                        <ButtonComponent variant="danger" leftIcon={<TrashBinIcon />}>
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
                            <TrashBinIcon />
                        </ButtonComponent>
                    </div>
                </CatalogSection>
            </section>
        </main>
    )
}
