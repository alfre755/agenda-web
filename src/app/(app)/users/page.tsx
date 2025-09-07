"use client";
import { useCallback, useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { AppButton } from "@/components/AppButton";
import { useAdmin } from "@/hooks/use-admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/UserForm";

export default function UsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<string | undefined>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [openCreate, setOpenCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { createUser, deleteUser } = useAdmin();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.admin.listUsers({
        query: {
          searchValue: search || undefined,
          searchField: "name",
          searchOperator: "contains",
          limit,
          offset,
          sortBy,
          sortDirection,
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
            </DialogHeader>
            <UserForm
              submitText={isSaving ? "Guardando..." : "Guardar"}
              disabled={isSaving}
              onSubmit={async (data) => {
                try {
                  setIsSaving(true);
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
        onViewRow={(row) => toast.info(`Ver: ${row?.email ?? row?.id}`)}
        onEditRow={(row) => toast.info(`Editar: ${row?.email ?? row?.id}`)}
        onDeleteRow={async (row) => {
          try {
            // Si la API de admin soporta deleteUser
            // @ts-expect-error segun version
            const res = await deleteUser?.(row.id);
            if (res?.error) throw new Error(res.error.message);
            toast.success("Usuario eliminado");
            fetchUsers();
          } catch (err: any) {
            toast.error(err?.message ?? "No se pudo eliminar");
          }
        }}
      />
    </div>
  );
}

// acciones de fila se manejan por DataTable via props
