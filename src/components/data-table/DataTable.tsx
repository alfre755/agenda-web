"use client"
import { MoreVertical } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { AppButton } from "@/components/AppButton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  total?: number;
  limit: number;
  offset: number;
  search?: string;
  onSearchChange?: (value: string) => void;
  onLimitChange?: (value: number) => void;
  onOffsetChange?: (value: number) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (sortBy: string, direction: "asc" | "desc") => void;
  emptyText?: string;
  onViewRow?: (row: T) => void;
  onEditRow?: (row: T) => void;
  onDeleteRow?: (row: T) => void;
  actionsHeader?: string;
  useBuiltInDeleteConfirm?: boolean;
  showViewAction?: boolean;
  showEditAction?: boolean;
  showDeleteAction?: boolean;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  isLoading,
  total,
  limit,
  offset,
  search,
  onSearchChange,
  onLimitChange,
  onOffsetChange,
  sortBy,
  sortDirection,
  onSortChange,
  emptyText = "Sin resultados",
  onViewRow,
  onEditRow,
  onDeleteRow,
  actionsHeader = "Settings",
  useBuiltInDeleteConfirm = true,
  showViewAction = true,
  showEditAction = true,
  showDeleteAction = true,
}: DataTableProps<T>) {
  const canPrev = offset > 0;
  const canNext = total != null ? offset + limit < total : rows.length >= limit;
  const showActions = true;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!rowToDelete) return setConfirmOpen(false);
    try {
      setIsDeleting(true);
      if (onDeleteRow) {
        await onDeleteRow(rowToDelete);
        toast.success("Eliminado correctamente");
      } else {
        toast.info("Eliminar no implementado");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo eliminar");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setRowToDelete(null);
    }
  }

  const renderedHeader = useMemo(() => (
    <tr>
      <th className="text-left px-3 py-2 w-[36px]">#</th>
      {columns.map((c) => (
        <th
          key={String(c.key)}
          className="text-left px-3 py-2"
          style={c.width ? { width: c.width } : undefined}
        >
          {c.sortable ? (
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => {
                const nextDir = sortBy === c.key ? (sortDirection === "asc" ? "desc" : "asc") : "asc";
                onSortChange?.(String(c.key), nextDir);
              }}
            >
              {c.header} {sortBy === c.key ? (sortDirection === "asc" ? "▲" : "▼") : null}
            </button>
          ) : (
            c.header
          )}
        </th>
      ))}
      {showActions ? (
        <th className="text-left px-3 py-2 w-[1%] whitespace-nowrap">{actionsHeader}</th>
      ) : null}
    </tr>
  ), [columns, onSortChange, sortBy, sortDirection]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        {onSearchChange ? (
          <Input placeholder="Buscar..." value={search ?? ""} onChange={(e) => onSearchChange(e.target.value)} className="w-full sm:max-w-xs" />
        ) : null}
        <div className="sm:ml-auto flex items-center gap-2">
          {onLimitChange ? (
            <select
              className="h-9 rounded border px-2 text-sm bg-background w-full sm:w-auto"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / página</option>
              ))}
            </select>
          ) : null}
          {onOffsetChange ? (
            <>
              <AppButton btnType="secondary" type="button" disabled={!canPrev || isLoading} onClick={() => onOffsetChange(Math.max(0, offset - limit))}>
                Anterior
              </AppButton>
              <AppButton btnType="secondary" type="button" disabled={!canNext || isLoading} onClick={() => onOffsetChange(offset + limit)}>
                Siguiente
              </AppButton>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile stacked list */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="rounded border p-3 text-sm">Cargando...</div>
        ) : rows.length === 0 ? (
          <div className="rounded border p-3 text-sm">{emptyText}</div>
        ) : (
          rows.map((row, idx) => (
            <div key={row.id ?? idx} className="rounded border p-3 text-sm">
              <div className="mb-2 text-xs text-muted-foreground">#{idx + 1 + offset}</div>
              <div className="space-y-2">
                {columns.map((c) => (
                  <div key={String(c.key)} className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">{c.header}</span>
                    <span className="text-right">
                      {c.render ? c.render(row) : String(row[c.key as keyof typeof row] ?? "—")}
                    </span>
                  </div>
                ))}
                {showActions ? (
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <AppButton btnType="ghost" type="button" aria-label="Abrir acciones" className="px-2">
                          <MoreVertical className="h-4 w-4" />
                        </AppButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {showViewAction && (
                          <DropdownMenuItem onClick={() => (onViewRow ? onViewRow(row) : toast.info("Ver no implementado"))}>Ver</DropdownMenuItem>
                        )}
                        {showEditAction && (
                          <DropdownMenuItem onClick={() => (onEditRow ? onEditRow(row) : toast.info("Editar no implementado"))}>Editar</DropdownMenuItem>
                        )}
                        {showDeleteAction && (
                          <DropdownMenuItem onClick={() => {
                          if (useBuiltInDeleteConfirm) { setRowToDelete(row); setConfirmOpen(true); }
                          else { onDeleteRow?.(row); }
                        }}>Eliminar</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              {renderedHeader}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-3 py-4" colSpan={columns.length + 1}>Cargando...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4" colSpan={columns.length + 1}>{emptyText}</td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id ?? idx} className="border-t">
                    <td className="px-3 py-2 align-middle">{idx + 1 + offset}</td>
                    {columns.map((c) => (
                      <td key={String(c.key)} className="px-3 py-2 align-middle">
                        {c.render ? c.render(row) : String(row[c.key as keyof typeof row] ?? "—")}
                      </td>
                    ))}
                    {showActions ? (
                      <td className="px-3 py-2 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <AppButton btnType="ghost" type="button" aria-label="Abrir acciones" className="px-2">
                              <MoreVertical className="h-4 w-4" />
                            </AppButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => (onViewRow ? onViewRow(row) : toast.info("Ver no implementado"))}>Ver</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => (onEditRow ? onEditRow(row) : toast.info("Editar no implementado"))}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              if (useBuiltInDeleteConfirm) { setRowToDelete(row); setConfirmOpen(true); }
                              else { onDeleteRow?.(row); }
                            }}>Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {useBuiltInDeleteConfirm && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="¿Eliminar registro?"
          description="Esta acción no se puede deshacer. El registro será eliminado permanentemente."
          confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

//
