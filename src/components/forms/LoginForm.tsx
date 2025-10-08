"use client"
import { z } from "zod";

import { AppButton } from "@/components/AppButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hooks/use-zod-form";

const schema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

type Schema = z.infer<typeof schema>;

export function LoginForm({ onSubmit, disabled }: { onSubmit?: (data: Schema) => void; disabled?: boolean }) {
  const form = useZodForm({ schema, defaultValues: { email: "", password: "" } });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ?? (() => {}))} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="tucorreo@ejemplo.com" type="email" disabled={disabled} {...field} />
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
                <Input placeholder="••••••••" type="password" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AppButton btnType="primary" type="submit" className="w-full" disabled={disabled}>Iniciar sesión</AppButton>
      </form>
    </Form>
  );
}
