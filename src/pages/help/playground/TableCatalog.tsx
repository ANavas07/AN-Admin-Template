import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import TableTS, { ActionCell, StatusBadge } from '../../../components/ui/table/TableTs'
import { CatalogHeader, CatalogSection } from './components/CatalogLayout'

type Tournament = {
	id: string
	name: string
	status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'completed'
	participants: number
	date: string
	organizer: string
}

type User = {
	id: string
	name: string
	email: string
	role: string
	joinDate: string
	status: 'active' | 'inactive' | 'pending'
}

type Event = {
	id: string
	title: string
	description: string
	date: string
	category: string
}

export default function TableCatalog() {
	// Datos de ejemplo para torneos
	const tournaments: Tournament[] = useMemo(() => [
		{
			id: '1',
			name: 'Torneo Nacional 2024',
			status: 'active',
			participants: 156,
			date: '2024-04-15',
			organizer: 'Juan García',
		},
		{
			id: '2',
			name: 'Liga Metropolitana',
			status: 'completed',
			participants: 89,
			date: '2024-03-10',
			organizer: 'María López',
		},
		{
			id: '3',
			name: 'Campeonato Regional',
			status: 'pending',
			participants: 234,
			date: '2024-05-20',
			organizer: 'Carlos Ruiz',
		},
		{
			id: '4',
			name: 'Torneo Juvenil',
			status: 'active',
			participants: 67,
			date: '2024-04-25',
			organizer: 'Ana Martínez',
		},
		{
			id: '5',
			name: 'Eliminatorias Nacionales',
			status: 'cancelled',
			participants: 0,
			date: '2024-02-14',
			organizer: 'Diego Fernández',
		},
	], [])

	// Datos de ejemplo para usuarios
	const users: User[] = useMemo(() => [
		{
			id: '1',
			name: 'Juan García',
			email: 'juan@tournaments.com',
			role: 'Admin',
			joinDate: '2024-01-15',
			status: 'active',
		},
		{
			id: '2',
			name: 'María López',
			email: 'maria@tournaments.com',
			role: 'Organizador',
			joinDate: '2024-02-03',
			status: 'active',
		},
		{
			id: '3',
			name: 'Carlos Ruiz',
			email: 'carlos@tournaments.com',
			role: 'Juez',
			joinDate: '2024-02-10',
			status: 'pending',
		},
		{
			id: '4',
			name: 'Ana Martínez',
			email: 'ana@tournaments.com',
			role: 'Participante',
			joinDate: '2024-03-05',
			status: 'inactive',
		},
	], [])

	// Datos para tabla expandible
	const events: Event[] = useMemo(() => [
		{
			id: '1',
			title: 'Torneo Nacional 2024',
			description: 'Evento principal del año con participación nacional',
			date: '2024-04-15',
			category: 'Nacional',
		},
		{
			id: '2',
			title: 'Liga Metropolitana',
			description: 'Competencia regional para equipos locales',
			date: '2024-03-10',
			category: 'Regional',
		},
	], [])

	// Columnas para torneos
	const tournamentColumns: ColumnDef<Tournament>[] = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Nombre del Torneo',
				cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
			},
			{
				accessorKey: 'status',
				header: 'Estado',
				cell: (info) => <StatusBadge value={info.getValue() as string} />,
			},
			{
				accessorKey: 'participants',
				header: 'Participantes',
				cell: (info) => <span>{info.getValue() as number}</span>,
			},
			{
				accessorKey: 'date',
				header: 'Fecha',
				cell: (info) => {
					const date = new Date(info.getValue() as string)
					return date.toLocaleDateString('es-CO')
				},
			},
			{
				accessorKey: 'organizer',
				header: 'Organizador',
			},
		],
		[]
	)

	// Columnas para usuarios
	const userColumns: ColumnDef<User>[] = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Nombre',
				cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
			},
			{
				accessorKey: 'email',
				header: 'Correo',
				cell: (info) => <span className="text-sm">{info.getValue() as string}</span>,
			},
			{
				accessorKey: 'role',
				header: 'Rol',
			},
			{
				accessorKey: 'status',
				header: 'Estado',
				cell: (info) => <StatusBadge value={info.getValue() as string} />,
			},
			{
				accessorKey: 'joinDate',
				header: 'Fecha de Ingreso',
				cell: (info) => {
					const date = new Date(info.getValue() as string)
					return date.toLocaleDateString('es-CO')
				},
			},
			{
				id: 'actions',
				header: 'Acciones',
				cell: () => (
					<ActionCell
						onEdit={() => alert('Editar usuario')}
						onDelete={() => alert('Eliminar usuario')}
					/>
				),
			},
		],
		[]
	)

	// Columnas para eventos expandibles
	const eventColumns: ColumnDef<Event>[] = useMemo(
		() => [
			{
				accessorKey: 'title',
				header: 'Título',
				cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
			},
			{
				accessorKey: 'date',
				header: 'Fecha',
				cell: (info) => {
					const date = new Date(info.getValue() as string)
					return date.toLocaleDateString('es-CO')
				},
			},
			{
				accessorKey: 'category',
				header: 'Categoría',
			},
		],
		[]
	)

	return (
		<main className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
			<CatalogHeader
			    title="Catalogo de Tablas"
			    description="Ejemplos de tablas con diferentes configuraciones: ordenamiento, búsqueda, paginación, estados y acciones."
			/>

			<section className="mt-8 space-y-6">
				<CatalogSection
					title="Tabla Básica con Ordenamiento"
					description="Tabla de torneos con capacidad de ordenar columnas. Ideal para listados simples."
				>
					<TableTS
						data={tournaments}
						columns={tournamentColumns}
						enableSorting
						existBtn={false}
						emptyMessage="No hay torneos disponibles"
					/>
				</CatalogSection>

				<CatalogSection
					title="Tabla con Búsqueda y Paginación"
					description="Tabla de usuarios con búsqueda global, paginación y acciones por fila."
				>
					<TableTS
						data={users}
						columns={userColumns}
						enableFiltering
						enablePagination
						pageSize={5}
						existBtn={true}
						btnMessage="Agregar usuario"
						onClickBtn={() => alert('Agregar nuevo usuario')}
						emptyMessage="No hay usuarios disponibles"
					/>
				</CatalogSection>

				<CatalogSection
					title="Tabla Expandible"
					description="Tabla con filas expandibles para ver información adicional. Útil para detalles sin recargar."
				>
					<TableTS
						data={events}
						columns={eventColumns}
						enableExpanding
						existBtn={false}
						renderExpandedRowModel={(event) => (
							<div className="space-y-2">
								<div>
									<p className="text-xs font-semibold text-fg-muted uppercase">
										Descripción
									</p>
									<p className="mt-1 text-sm text-fg">
										{event.description}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-xs font-semibold text-fg-muted uppercase">
											Categoría
										</p>
										<p className="mt-1 text-sm text-fg">
											{event.category}
										</p>
									</div>
									<div>
										<p className="text-xs font-semibold text-fg-muted uppercase">
											ID Evento
										</p>
										<p className="mt-1 text-sm text-fg">
											{event.id}
										</p>
									</div>
								</div>
							</div>
						)}
						emptyMessage="No hay eventos disponibles"
					/>
				</CatalogSection>

				<CatalogSection
					title="Tabla Completa"
					description="Tabla con todas las características habilitadas: ordenamiento, búsqueda, paginación y acciones."
				>
					<TableTS
						data={users}
						columns={userColumns}
						enableSorting
						enableFiltering
						enablePagination
						pageSize={3}
						existBtn={true}
						btnMessage="Nuevo usuario"
						onClickBtn={() => alert('Abrir formulario de nuevo usuario')}
						emptyMessage="No hay usuarios para mostrar"
					/>
				</CatalogSection>
			</section>
		</main>
	)
}
