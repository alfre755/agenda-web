"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppButton } from "@/components/AppButton";
import { type Column,DataTable } from "@/components/data-table/DataTable";
import { EntityFormDialog } from "@/components/entity/EntityFormDialog";
import { EntityViewDialog } from "@/components/entity/EntityViewDialog";
import { UserForm } from "@/components/forms/UserForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/use-admin";
import { useUsers } from "@/hooks/use-users";

export default function UsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<string | undefined>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchField, setSearchField] = useState<"email" | "name">("name");
  const [searchOperator, setSearchOperator] = useState<"contains" | "starts_with" | "ends_with">("contains");
  const [filterField, setFilterField] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [filterOperator, setFilterOperator] = useState<"eq" | "ne" | "lt" | "lte" | "gt" | "gte">("eq");
  const [openCreate, setOpenCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { createUser, removeUser, listUsers } = useAdmin();
  const { updateUser, userId: currentUserId } = useUsers();
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await listUsers({
        query: {
          searchValue: search || undefined,
          searchField,
          searchOperator,
          limit,
          offset,
          sortBy,
          sortDirection,
          filterField: filterField || undefined,
          filterValue: filterValue || undefined,
          filterOperator,
        },
      });
      if (error) throw new Error(error.message);
      if (Array.isArray(data)) {
        setRows(data);
        setTotal(undefined);
      } else if (data && Array.isArray((data as any).users)) {
        const d: any = data as any;
        setRows(d.users);
        setTotal(typeof d.total === "number" ? d.total : undefined);
      } else {
        setRows([]);
        setTotal(undefined);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [search, limit, offset, sortBy, sortDirection]);

  useEffect(() => {
    setOffset(0);
  }, [search]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: Column<any>[] = [
    { key: "name", header: "Nombre", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Rol" },
    {
      key: "createdAt",
      header: "Creado",
      render: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <AppButton btnType="primary" type="button">Agregar usuario</AppButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar usuario</DialogTitle>
              <DialogDescription>
                Complete la información para crear un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <UserForm
              submitText={isSaving ? "Guardando..." : "Guardar"}
              disabled={isSaving}
              onSubmit={async (data) => {
                try {
                  setIsSaving(true);
                  if (!data.password) throw new Error("La contraseña es requerida");
                  const { data: res, error } = await createUser({ name: data.name, email: data.email, password: data.password, role: data.role });
                  if (error) throw new Error(error.message);
                  toast.success("Usuario creado");
                  setOpenCreate(false);
                  fetchUsers();
                } catch (err: any) {
                  toast.error(err?.message ?? "No se pudo crear");
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Campo</label>
          <select
            className="h-9 rounded border px-2 text-sm bg-background"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
          >
            <option value="name">Nombre</option>
            <option value="email">Email</option>
          </select>
          <select
            className="h-9 rounded border px-2 text-sm bg-background"
            value={searchOperator}
            onChange={(e) => setSearchOperator(e.target.value as any)}
          >
            <option value="contains">Contiene</option>
            <option value="starts_with">Empieza con</option>
            <option value="ends_with">Termina con</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Filtro</label>
          <Input placeholder="Campo (ej: email)" value={filterField} onChange={(e) => setFilterField(e.target.value)} className="w-40" />
          <select
            className="h-9 rounded border px-2 text-sm bg-background"
            value={filterOperator}
            onChange={(e) => setFilterOperator(e.target.value as any)}
          >
            <option value="eq">=</option>
            <option value="ne">≠</option>
            <option value="lt">&lt;</option>
            <option value="lte">≤</option>
            <option value="gt">&gt;</option>
            <option value="gte">≥</option>
          </select>
          <Input placeholder="Valor" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="w-48" />
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        total={total}
        limit={limit}
        offset={offset}
        search={search}
        onSearchChange={setSearch}
        onLimitChange={setLimit}
        onOffsetChange={setOffset}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(s, d) => {
          setSortBy(s);
          setSortDirection(d);
        }}
        onViewRow={(row) => setViewing(row)}
        onEditRow={(row) => setEditing(row)}
        onDeleteRow={async (row) => {
          try {
            const res = await removeUser({ userId: row.id });
            if (res?.error) throw new Error(res.error.message);
            toast.success("Usuario eliminado");
            fetchUsers();
          } catch (err: any) {
            toast.error(err?.message ?? "No se pudo eliminar");
          }
        }}
      />

      <EntityViewDialog
        open={Boolean(viewing)}
        onOpenChange={(o) => !o && setViewing(null)}
        title="Detalle de usuario"
        data={viewing}
      />

      <EntityFormDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Editar usuario"
      >
        {editing && (
          <UserForm
            defaultValues={{
              name: editing.name ?? "",
              email: editing.email ?? "",
              role: editing.role ?? "",
            }}
            submitText={isSaving ? "Guardando..." : "Guardar cambios"}
            disabled={isSaving}
            mode="admin-edit"
            onSubmit={async (data) => {
              try {
                setIsSaving(true);
                // Admin actions: set role and/or set password
                const { setRole, setUserPassword } = useAdmin();
                if (data.role && data.role !== editing.role) {
                  const r = await setRole({ userId: editing.id, role: data.role });
                  if ((r as any)?.error) throw new Error((r as any).error.message);
                }
                if (data.password) {
                  const r2 = await setUserPassword({ userId: editing.id, newPassword: data.password });
                  if ((r2 as any)?.error) throw new Error((r2 as any).error.message);
                }
                toast.success("Usuario actualizado");
                setEditing(null);
                fetchUsers();
              } catch (err: any) {
                toast.error(err?.message ?? "No se pudo actualizar");
              } finally {
                setIsSaving(false);
              }
            }}
          />
        )}
      </EntityFormDialog>

      {typeof total === "number" && (
        <div className="text-sm text-muted-foreground">
          Página {Math.floor(offset / limit) + 1} de {Math.max(1, Math.ceil(total / limit))}
        </div>
      )}
    </div>
  );
}

// acciones de fila se manejan por DataTable via props
