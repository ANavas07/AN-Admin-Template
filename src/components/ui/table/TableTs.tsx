import {
    type ColumnDef,
    type ExpandedState,
    flexRender,
    getExpandedRowModel,
    getFilteredRowModel,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type TableState,
    useReactTable,
} from '@tanstack/react-table';
import React, { useState } from 'react';
import ButtonComponent from '../buttons/ButtonComponent';
import InputComponent from '../inputs/InputComponent';
import { ChevronIcon, EditIcon, PlusIcon, TrashBinIcon} from '../../../icons/icons';
import { cn } from '../../../utils/cn';
import Badge from '../badge/Badge';
import type { Tone } from '../tone';

/** Tone of the well-known status values rendered by StatusBadge. Unknown values stay neutral. */
const statusTones: Record<string, Tone> = {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning',
    cancelled: 'danger',
    completed: 'info',
};

interface ReusableTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    pageSize?: number;
    loading?: boolean;
    emptyMessage?: string;
    existBtn: boolean;
    btnMessage?: string;
    onClickBtn?: () => void;
    enableExpanding?: boolean;
    renderExpandedRowModel?: (original: T) => React.ReactNode;
}

type ActionCellProps = {
    onEdit?: () => void;
    onDelete?: () => void;
    onAdditional?: () => void;
}

export default function TableTS<T>({ data, columns, loading, enableFiltering,
    enablePagination, enableSorting, pageSize, existBtn, btnMessage, onClickBtn,
    enableExpanding, renderExpandedRowModel, emptyMessage }: ReusableTableProps<T>) {

    //to order i need to set a state.
    const [sorting, setSorting] = useState<SortingState>([]);
    //to filter i need to set a state
    const [filter, setFilter] = useState<string>("");
    const [expanded, setExpanded] = useState<ExpandedState>({});

    // Agregar columna de expand automáticamente si está habilitado
    const finalColumns = React.useMemo(() => {
        if (enableExpanding) {
            const expandColumn: ColumnDef<T> = {
                id: 'expand',
                header: '',
                cell: ({ row }) => (
                    <button
                        onClick={() => {
                            row.toggleExpanded();
                        }}
                        className="rounded-sm p-1 text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg"
                    >
                        <ChevronIcon className={`w-4 h-4 transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-180' : '' }`}/>
                    </button>
                ),
                size: 50,
                enableSorting: false,
            };
            return [expandColumn, ...columns];
        }
        return columns;
    }, [columns, enableExpanding]);

    const tableState = React.useMemo<Partial<TableState>>(() => {
        const state: Partial<TableState> = {};

        if (enableSorting) {
            state.sorting = sorting;
        }

        if (enableFiltering) {
            state.globalFilter = filter;
        }

        if (enableExpanding) {
            state.expanded = expanded;
        }

        return state;
    }, [sorting, filter, expanded, enableSorting, enableFiltering, enableExpanding]);

    // TanStack Table exposes function-heavy APIs; this is the supported hook boundary.
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns: finalColumns, //Usar columnas finales
        getCoreRowModel: getCoreRowModel(),
        state: tableState, //Estado unificado

        //Configuración condicional
        ...(enablePagination && {
            getPaginationRowModel: getPaginationRowModel(),
            initialState: {
                pagination: {
                    pageSize: pageSize || 10,
                    pageIndex: 0
                }
            }
        }),

        ...(enableSorting && {
            getSortedRowModel: getSortedRowModel(),
            onSortingChange: setSorting,
            enableSorting: true,
        }),

        ...(enableFiltering && {
            getFilteredRowModel: getFilteredRowModel(),
            onGlobalFilterChange: setFilter,
            enableGlobalFilter: true,
        }),

        ...(enableExpanding && {
            getExpandedRowModel: getExpandedRowModel(),
            onExpandedChange: setExpanded,
            enableExpanding: true,
        })
    });

    if (loading) {
        return (
            <div className="card p-4 text-sm text-fg-muted">
                Loading...
            </div>
        );
    }

    return (
        <div>
            <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:gap-4'>
                {
                    existBtn && (
                        <ButtonComponent
                            size="sm"
                            variant="primary"
                            leftIcon={<PlusIcon className="size-5" />}
                            onClick={onClickBtn}
                            className="w-full sm:w-auto text-xs lg:shrink-0"
                        >
                            <span className="hidden sm:inline">{btnMessage || "Agregar"}</span>
                        </ButtonComponent>
                    )
                }
                <div className="w-full sm:flex-1 sm:max-w-50 lg:max-w-75">
                    <InputComponent
                        inpPlaceHolder='Buscar...'
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        showSearchIcon
                        iconPosition="left"
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full">
                    <thead className="surface-header">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            'px-4 py-2.5 text-start text-2xs font-semibold uppercase tracking-caps text-fg-muted sm:px-5',
                                            enableSorting && header.column.getCanSort()
                                                ? 'cursor-pointer select-none transition-colors hover:bg-canvas-subtle hover:text-fg'
                                                : ''
                                        )}
                                        onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                                    >
                                        <div className="flex items-center gap-2">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            {enableSorting && header.column.getCanSort() && (
                                                <div className="flex flex-col shrink-0">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronIcon className="w-4 h-4 text-brand rotate-180 transition-transform duration-200" />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronIcon className="w-4 h-4 text-brand transition-transform duration-200" />
                                                    ) : (
                                                        <ChevronIcon className="w-4 h-4 text-fg-muted transition-transform duration-200" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-line text-sm text-fg">
                        {table.getRowModel().rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={finalColumns.length}
                                    className="px-6 py-10 text-center text-sm text-fg-muted"
                                >
                                    {emptyMessage || 'No hay datos para mostrar.'}
                                </td>
                            </tr>
                        )}

                        {table.getRowModel().rows.map((row) => (
                            <React.Fragment key={row.id}>
                                <tr className="transition-colors hover:bg-canvas-subtle/60"
                                    {...(enableExpanding && {
                                        style: { cursor: 'pointer' }
                                    })}
                                >

                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="whitespace-nowrap px-4 py-3 sm:px-5"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/*Fila expandida solo si está habilitado y expandido */}
                                {enableExpanding && row.getIsExpanded() && renderExpandedRowModel && (
                                    <tr>
                                        <td colSpan={row.getVisibleCells().length} className="bg-canvas-subtle p-4">
                                            {renderExpandedRowModel(row.original)}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>

                </table>
            </div>
            {/* Pagination */}
            {enablePagination && (
                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Primera página"
                        >
                            «
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Página anterior"
                        >
                            ‹
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Página siguiente"
                        >
                            ›
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            aria-label="Última página"
                        >
                            »
                        </ButtonComponent>
                    </div>
                    <span className="text-sm text-fg-muted">
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </span>
                </div>
            )}

        </div>
    )
};

export const ActionCell = ({ onEdit, onDelete, onAdditional }: ActionCellProps) => (
    <div className='flex justify-start gap-2'>
        {
            onEdit && (
                <ButtonComponent
                    size="icon"
                    variant="ghost"
                    onClick={onEdit}
                    aria-label="Editar"
                    title="Editar"
                >
                    <EditIcon className="size-4.5 text-fg-muted" />
                </ButtonComponent>
            )
        }

        {onDelete && (
            <ButtonComponent
                size="icon"
                variant="ghost"
                onClick={onDelete}
                aria-label="Eliminar"
                title="Eliminar"
            >
                <TrashBinIcon className="size-4.5 text-danger" />
            </ButtonComponent>
        )}

        {onAdditional && (
            <ButtonComponent
                size="icon"
                variant="ghost"
                onClick={onAdditional}
                aria-label="Agregar"
                title="Agregar"
            >
                <PlusIcon className="size-4.5 text-brand" />
            </ButtonComponent>
        )}
    </div>
);


export const StatusBadge = ({ value }: { value: string }) => {
    const normalizedValue = value.toLowerCase();

    return (
        <Badge tone={statusTones[normalizedValue] ?? 'neutral'} dot>
            {value}
        </Badge>
    );
};
