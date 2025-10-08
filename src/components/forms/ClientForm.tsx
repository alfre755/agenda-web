"use client";

import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hooks/use-zod-form";
import { formatRut } from "@/lib/utils";

const schema = z.object({
  rut: z.string()
    .min(1, "El RUT es requerido")
    .refine((rut) => {
      const formattedRut = formatRut(rut);
      return formattedRut !== null;
    }, "RUT inválido. Ingrese un RUT válido (ej: 12.345.678-9)"),
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  disabled,
  submitText = "Crear Cliente",
}: {
  defaultValues?: Partial<Schema>;
  onSubmit?: (data: Schema) => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  submitText?: string;
}) {
  const form = useZodForm({
    schema,
    defaultValues: {
      rut: "",
      name: "",
      email: "",
      phone: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ?? (() => {}))} className="space-y-4">
        <FormField
          control={form.control}
          name="rut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="12.345.678-9" 
                  {...field} 
                  disabled={disabled}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Formatear automáticamente mientras el usuario escribe
                    const formattedRut = formatRut(value);
                    if (formattedRut) {
                      field.onChange(formattedRut);
                    } else {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo del cliente" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="cliente@ejemplo.com" 
                  {...field} 
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+56 9 1234 5678" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <AppButton 
              btnType="secondary" 
              type="button" 
              onClick={onCancel}
              disabled={disabled}
            >
              Cancelar
            </AppButton>
          )}
          <AppButton 
            btnType="primary" 
            type="submit" 
            disabled={disabled}
          >
            {submitText}
          </AppButton>
        </div>
      </form>
    </Form>
  );
}
