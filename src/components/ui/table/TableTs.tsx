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
import type { SVGProps } from 'react';
import React, { useState } from 'react';
import ButtonComponent from '../buttons/ButtonComponent';
import InputComponent from '../../ui/inputs/InputComponent';

type TableIconProps = SVGProps<SVGSVGElement>;

const statusStyles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
    inactive: 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300',
    cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300',
    completed: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300',
};

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function ChevronDownIcon({ className, ...props }: TableIconProps) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function EditIcon({ className, ...props }: TableIconProps) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M11.5 4.5 15 8m-9.5 7.5 3.3-.6 7.6-7.6a2.48 2.48 0 0 0-3.5-3.5L5.3 11.4l-.8 4.1Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PlusAddIcon({ className, ...props }: TableIconProps) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TrashBinIcon({ className, ...props }: TableIconProps) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}


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
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-180' : ''
                                }`}
                        />
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
            <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-sm text-(--color-text-muted)">
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
                            leftIcon={<PlusAddIcon className="size-5" />}
                            onClick={onClickBtn}
                            className="w-full sm:w-auto text-xs lg:shrink-0"
                        >
                            <span className="hidden sm:inline">{btnMessage || "Agregar"}</span>
                        </ButtonComponent>
                    )
                }
                <div className="w-full sm:flex-1 sm:max-w-[200px] lg:max-w-[300px]">
                    <InputComponent
                        inpPlaceHolder='Buscar...'
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        showSearchIcon
                        iconPosition="left"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) shadow-sm">
                <table className="min-w-full">
                    <thead className="border-y border-(--color-border) bg-(--color-bg-soft)">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            'px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-(--color-text-muted) sm:px-6',
                                            enableSorting && header.column.getCanSort()
                                                ? 'cursor-pointer select-none hover:bg-brand-soft'
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
                                                <div className="flex flex-col flex-shrink-0">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronDownIcon className="w-4 h-4 text-brand rotate-180 transition-transform duration-200" />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDownIcon className="w-4 h-4 text-brand transition-transform duration-200" />
                                                    ) : (
                                                        <ChevronDownIcon className="w-4 h-4 text-(--color-text-muted) transition-transform duration-200" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-(--color-border) text-sm text-(--color-text)">
                        {table.getRowModel().rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={finalColumns.length}
                                    className="px-6 py-10 text-center text-sm text-(--color-text-muted)"
                                >
                                    {emptyMessage || 'No hay datos para mostrar.'}
                                </td>
                            </tr>
                        )}

                        {table.getRowModel().rows.map((row, i) => (
                            <React.Fragment key={row.id}>
                                <tr className={cn(
                                    'transition-colors hover:bg-(--color-bg-soft)',
                                    i % 2 === 0 ? 'bg-(--color-surface)' : 'bg-(--color-bg-soft)/35',
                                )}
                                    {...(enableExpanding && {
                                        style: { cursor: 'pointer' }
                                    })}
                                >

                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-3.5 whitespace-nowrap"
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
                                        <td colSpan={row.getVisibleCells().length} className="bg-(--color-bg-soft) p-4">
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
                        >
                            {'<<'}
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            {'<'}
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            {'>'}
                        </ButtonComponent>
                        <ButtonComponent
                            size="sm"
                            variant="outline"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            {'>>'}
                        </ButtonComponent>
                    </div>
                    <span className="text-sm text-(--color-text-muted)">
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
                    <EditIcon className="h-5 w-5 text-sky-600 dark:text-sky-300" />
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
                <TrashBinIcon className="h-5 w-5 text-rose-600 dark:text-rose-300" />
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
                <PlusAddIcon className="h-5 w-5 text-green-600 dark:text-green-300" />
            </ButtonComponent>
        )}
    </div>
);


export const StatusBadge = ({ value }: { value: string }) => {
    const normalizedValue = value.toLowerCase();

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                statusStyles[normalizedValue] ??
                'bg-(--color-bg-soft) text-(--color-text-muted) ring-1 ring-(--color-border)'
            )}
        >
            {value}
        </span>
    );
};
