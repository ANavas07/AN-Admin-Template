import { useMemo, useState } from 'react'
import ButtonComponent from '../../components/ui/buttons/ButtonComponent'
import DataList from '../../components/ui/inputs/DataList'
import InputComponent from '../../components/ui/inputs/InputComponent'

type TournamentOption = {
    id: string
    name: string
    category: string
}

const tournamentOptions: TournamentOption[] = [
    {
        id: 'champions-2026',
        name: 'Champions Cup 2026',
        category: 'Futbol / Senior',
    },
    {
        id: 'juvenil-norte',
        name: 'Liga Juvenil Norte',
        category: 'Futbol / Sub 18',
    },
    {
        id: 'basket-open',
        name: 'Basket Open',
        category: 'Baloncesto / Libre',
    },
    {
        id: 'intercolegial',
        name: 'Intercolegial Primavera',
        category: 'Multideporte / Escolar',
    },
]

function Block({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-text)">{title}</h3>
            <p className="mt-1 text-sm text-(--color-text-muted)">{description}</p>
            <div className="mt-4">{children}</div>
        </article>
    )
}

export default function InputCatalogPlayground() {
    const [searchValue, setSearchValue] = useState('')
    const [emailValue, setEmailValue] = useState('')
    const [nameValue, setNameValue] = useState('')
    const [quickValue, setQuickValue] = useState('')
    const [tournamentValue, setTournamentValue] = useState('')
    const [requiredTournamentValue, setRequiredTournamentValue] = useState('')

    const emailError = useMemo(() => {
        if (!emailValue) return ''
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
        return isValid ? '' : 'Ingresa un correo valido'
    }, [emailValue])

    return (
        <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <section className="relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm sm:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-highlight-soft blur-3xl" />

                <div className="relative">
                    <p className="inline-flex rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">
                        Playground
                    </p>
                    <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                        Catalogo de Componentes
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-(--color-text-muted) sm:text-base">
                        Ejemplos por caso real: busqueda, formulario, estados y tamanos.
                    </p>
                </div>
            </section>

            <h1 className='font-bold text-3xl sm:text-4xl mt-2' >Botones</h1>
            <section className="mt-8 grid gap-4 lg:grid-cols-2">
                <Block
                    title="Botones reutilizables"
                    description="Variantes principales con iconos a la izquierda o derecha."
                >
                    <div className="flex flex-wrap gap-3">
                        <ButtonComponent leftIcon="＋">
                            Crear torneo
                        </ButtonComponent>
                        <ButtonComponent variant="secondary" rightIcon="→">
                            Ver reportes
                        </ButtonComponent>
                        <ButtonComponent variant="outline" leftIcon="🔎">
                            Buscar
                        </ButtonComponent>
                        <ButtonComponent variant="ghost" rightIcon="⚙️">
                            Configurar
                        </ButtonComponent>
                        <ButtonComponent variant="danger" leftIcon="🗑️">
                            Eliminar
                        </ButtonComponent>
                    </div>
                </Block>

                <Block
                    title="Estados y tamanos"
                    description="Soporta ancho completo, loading, disabled y boton solo icono."
                >
                    <div className="space-y-3">
                        <ButtonComponent size="sm" variant="outline" leftIcon="✓">
                            Guardar cambios
                        </ButtonComponent>
                        <ButtonComponent
                            fullWidth
                            isLoading
                            loadingText="Procesando..."
                        >
                            Procesar inscripcion
                        </ButtonComponent>
                        <ButtonComponent disabled variant="secondary" rightIcon="→">
                            Accion bloqueada
                        </ButtonComponent>
                        <ButtonComponent size="icon" variant="ghost" aria-label="Abrir filtros">
                            ⚙️
                        </ButtonComponent>
                    </div>
                </Block>
            </section>

            <h1 className='font-bold text-3xl sm:text-4xl mt-2' >Inputs</h1>
            <section className="mt-8 grid gap-4 lg:grid-cols-2">

                <Block
                    title="Busqueda principal"
                    description="Input de busqueda con icono y estilo search para tablas o listados."
                >
                    <InputComponent
                        label="Buscar modulos"
                        placeholder="Ej. calendario, reportes, soporte"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        variant="search"
                        showSearchIcon
                        hint="Busca por nombre o descripcion."
                    />
                </Block>

                <Block
                    title="Formulario con validacion"
                    description="Input de formulario con mensaje de error."
                >
                    <InputComponent
                        label="Correo institucional"
                        type="email"
                        name="email"
                        placeholder="usuario@empresa.com"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        requiredMark
                        error={emailError || undefined}
                        hint={emailError ? undefined : 'Usa el correo con el que ingresas al sistema.'}
                    />
                </Block>

                <Block
                    title="Input redondeado"
                    description="Estilo pill para filtros rapidos o chips de busqueda."
                >
                    <InputComponent
                        label="Filtro rapido"
                        placeholder="Ej. torneo juvenil"
                        value={quickValue}
                        onChange={(e) => setQuickValue(e.target.value)}
                        variant="rounded"
                        showSearchIcon
                        iconPosition="left"
                    />
                </Block>

                <Block
                    title="Tamanos y estado"
                    description="Ejemplo de tamanos consistentes y estado disabled."
                >
                    <div className="space-y-3">
                        <InputComponent
                            label="Tamano pequeno"
                            placeholder="Input sm"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            size="sm"
                            fullWidth
                        />

                        <InputComponent
                            label="Tamano grande"
                            placeholder="Input lg"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            size="lg"
                            fullWidth
                        />

                        <InputComponent
                            label="Solo lectura visual"
                            value="No editable"
                            onChange={() => undefined}
                            disabled
                            fullWidth
                        />
                    </div>
                </Block>

                <Block
                    title="DataList dinamico"
                    description="Busqueda con seleccion por clave, detalle secundario y boton para limpiar."
                >
                    <div className="space-y-3">
                        <DataList<TournamentOption>
                            id="tournament"
                            label="Torneo"
                            placeholder="Busca un torneo"
                            options={tournamentOptions}
                            value={tournamentValue}
                            opKey="id"
                            opValue="name"
                            optionP="category"
                            hint="Guarda el id del torneo seleccionado, no el texto visible."
                            onSelect={(event) => setTournamentValue(event.target.value)}
                        />

                        <div className="rounded-lg border border-(--color-border) bg-(--color-bg-soft) px-3 py-2 text-xs text-(--color-text-muted)">
                            Valor seleccionado:{' '}
                            <span className="font-semibold text-(--color-text)">
                                {tournamentValue || 'ninguno'}
                            </span>
                        </div>
                    </div>
                </Block>

                <Block
                    title="DataList con validacion"
                    description="Estado requerido, mensaje de error y estado deshabilitado."
                >
                    <div className="space-y-4">
                        <DataList<TournamentOption>
                            id="required-tournament"
                            label="Campeonato principal"
                            placeholder="Selecciona campeonato"
                            options={tournamentOptions}
                            value={requiredTournamentValue}
                            opKey="id"
                            opValue="name"
                            optionP="category"
                            requiredMark
                            error={
                                requiredTournamentValue
                                    ? undefined
                                    : 'Selecciona un campeonato para continuar.'
                            }
                            onSelect={(event) => setRequiredTournamentValue(event.target.value)}
                        />

                        <DataList<TournamentOption>
                            id="disabled-tournament"
                            label="Torneo bloqueado"
                            placeholder="No disponible"
                            options={tournamentOptions}
                            value="champions-2026"
                            opKey="id"
                            opValue="name"
                            optionP="category"
                            disabled
                            onSelect={() => undefined}
                        />
                    </div>
                </Block>
            </section>
        </main>
    )
}
