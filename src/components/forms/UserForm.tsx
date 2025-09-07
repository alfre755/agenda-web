"use client"
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/AppButton";

const schema = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().optional(),
  role: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export function UserForm({
  defaultValues,
  onSubmit,
  disabled,
  submitText = "Guardar",
}: {
  defaultValues?: Partial<Schema>;
  onSubmit?: (data: Schema) => void | Promise<void>;
  disabled?: boolean;
  submitText?: string;
}) {
  const form = useZodForm({ schema, defaultValues: { name: "", email: "", password: "", role: "", ...defaultValues } });

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
                <Input placeholder="Juan Pérez" {...field} disabled={disabled} />
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
                <Input type="email" placeholder="correo@ejemplo.com" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Opcional" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                <Input placeholder="admin | user" {...field} disabled={disabled} />
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
