"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppButton } from "@/components/AppButton";
import { type Column,DataTable } from "@/components/data-table/DataTable";
import { EntityFormDialog } from "@/components/entity/EntityFormDialog";
import { EntityViewDialog } from "@/components/entity/EntityViewDialog";
import { OrganizationForm } from "@/components/forms/OrganizationForm";
import { useOrganizations } from "@/hooks/use-organizations";
import { useUsers } from "@/hooks/use-users";


export default function OrganizationsPage() {
  const { createOrganization, updateOrganization, removeOrganization, listOrganizations } = useOrganizations();
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
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const { hasRole } = useUsers();
  const isSuperAdmin = hasRole("superadmin");

  const fetchOrgs = useCallback(async () => {
    try {
      setIsLoading(true);
        const d = await listOrganizations({
          query: {
            searchValue: search || undefined,
            limit,
            offset,
            sortBy,
            sortDirection,
          },
        });
      if (d.error) {
        throw new Error(d.error.message);
      }
      
      const responseData = d.data as any;
      setRows(Array.isArray(responseData) ? responseData : responseData?.organizations ?? []);
      setTotal(typeof responseData?.total === "number" ? responseData.total : undefined);
    } catch (err: any) {
      toast.error(err?.message ?? "Error al cargar organizaciones");
    } finally {
      setIsLoading(false);
    }
  }, [search, limit, offset, sortBy, sortDirection]);

  useEffect(() => { setOffset(0); }, [search]);
  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const columns: Column<any>[] = [
    { key: "name", header: "Nombre", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "logo", header: "Logo", render: (r) => r.logo ? <a href={r.logo} className="text-primary underline" target="_blank" rel="noreferrer">Logo</a> : "—" },
    { key: "createdAt", header: "Creado", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Organizaciones</h1>
        {isSuperAdmin && (
        <EntityFormDialog open={openCreate} onOpenChange={setOpenCreate} title="Crear organización">
          <OrganizationForm
            submitText={isSaving ? "Creando..." : "Crear"}
            disabled={isSaving}
            onSubmit={async (data) => {
              try {
                setIsSaving(true);
                const payload: any = { name: data.name, slug: data.slug };
                if (data.logo && data.logo.trim() !== "") payload.logo = data.logo;
                if (!isSuperAdmin) throw new Error("No autorizado para crear organizaciones.");
                const { error } = await createOrganization(payload);
                if (error) throw new Error(error.message);
                toast.success("Organización creada");
                setOpenCreate(false);
                fetchOrgs();
              } catch (err: any) {
                toast.error(err?.message ?? "No se pudo crear");
              } finally {
                setIsSaving(false);
              }
            }}
          />
        </EntityFormDialog>
        )}
        {isSuperAdmin && (
          <AppButton btnType="primary" type="button" onClick={() => setOpenCreate(true)}>Agregar organización</AppButton>
        )}
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
        onSortChange={(s, d) => { setSortBy(s); setSortDirection(d); }}
        onViewRow={(row) => setViewing(row)}
        onEditRow={(row) => setEditing(row)}
        onDeleteRow={async (row) => {
          try {
            if (!isSuperAdmin) throw new Error("No autorizado para eliminar organizaciones.");
            const { error } = await removeOrganization(row.id);
            if (error) throw new Error(error.message);
            toast.success("Organización eliminada");
            fetchOrgs();
          } catch (err: any) {
            toast.error(err?.message ?? "No se pudo eliminar");
          }
        }}
        // Ocultar acciones según rol: solo superadmin puede borrar orgs
        showDeleteAction={isSuperAdmin}
      />

      <EntityViewDialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)} title="Detalle de organización" data={viewing} />

      <EntityFormDialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)} title="Editar organización">
        {editing && (
          <OrganizationForm
            mode="admin-edit"
            defaultValues={{ name: editing.name ?? "", slug: editing.slug ?? "", logo: editing.logo ?? "" }}
            submitText={isSaving ? "Guardando..." : "Guardar cambios"}
            disabled={isSaving}
            onSubmit={async (data) => {
              try {
                setIsSaving(true);
                const updates: any = { name: data.name, slug: data.slug };
                if (data.logo && data.logo.trim() !== "") updates.logo = data.logo; // omitir si vacío
                const { error } = await updateOrganization(editing.id, updates);
                if (error) throw new Error(error.message);
                toast.success("Organización actualizada");
                setEditing(null);
                fetchOrgs();
              } catch (err: any) {
                toast.error(err?.message ?? "No se pudo actualizar");
              } finally {
                setIsSaving(false);
              }
            }}
          />
        )}
      </EntityFormDialog>
    </div>
  );
}
