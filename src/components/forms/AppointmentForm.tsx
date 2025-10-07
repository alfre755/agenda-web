"use client";

import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useZodForm } from "@/hooks/use-zod-form";

const schema = z.object({
  clientRut: z.string().min(1, "El RUT del cliente es requerido"),
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  observation: z.string().optional(),
  status: z.enum(["in-progress", "completed", "cancelled"]),
});

type Schema = z.infer<typeof schema>;

export function AppointmentForm({
  defaultValues,
  onSubmit,
  disabled,
  submitText = "Crear Appointment",
}: {
  defaultValues?: Partial<Schema>;
  onSubmit?: (data: Schema) => void | Promise<void>;
  disabled?: boolean;
  submitText?: string;
}) {
  const form = useZodForm({
    schema,
    defaultValues: {
      clientRut: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      observation: "",
      status: "in-progress" as const,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ?? (() => {}))} className="space-y-4">
        <FormField
          control={form.control}
          name="clientRut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT del Cliente *</FormLabel>
              <FormControl>
                <Input placeholder="12.345.678-9" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Cliente *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo del cliente" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email del Cliente</FormLabel>
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
          name="clientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono del Cliente</FormLabel>
              <FormControl>
                <Input placeholder="+1 234 567 8900" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas adicionales sobre el appointment..."
                  className="resize-none"
                  {...field} 
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AppButton 
          btnType="primary" 
          type="submit" 
          className="w-full sm:w-auto" 
          disabled={disabled}
        >
          {submitText}
        </AppButton>
      </form>
    </Form>
  );
}
