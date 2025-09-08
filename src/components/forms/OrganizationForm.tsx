"use client"
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/AppButton";

const schemaCreate = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
  slug: z.string().min(2, { message: "Mínimo 2 caracteres" }),
  // Permite vacío o URL válida
  logo: z.union([z.string().url(), z.literal("")]).optional(),
});

const schemaAdminEdit = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
  slug: z.string().min(2).optional(),
  logo: z.union([z.string().url(), z.literal("")]).optional(),
});

type Schema = z.infer<typeof schemaCreate> & Partial<z.infer<typeof schemaAdminEdit>>;

export function OrganizationForm({
  defaultValues,
  onSubmit,
  disabled,
  submitText = "Guardar",
  mode = "create",
}: {
  defaultValues?: Partial<Schema>;
  onSubmit?: (data: Schema) => void | Promise<void>;
  disabled?: boolean;
  submitText?: string;
  mode?: "create" | "admin-edit";
}) {
  const activeSchema = mode === "admin-edit" ? (schemaAdminEdit as any) : (schemaCreate as any);
  const form = useZodForm({ schema: activeSchema, defaultValues: { name: "", slug: "", logo: "", ...defaultValues } as any });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ?? (() => {}))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Mi organización" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="mi-organizacion" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo (URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AppButton btnType="primary" type="submit" className="w-full sm:w-auto" disabled={disabled}>{submitText}</AppButton>
      </form>
    </Form>
  );
}
