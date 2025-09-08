"use client"
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/AppButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { APP_ROLES } from "@/lib/constants";

const schemaCreate = z
  .object({
    name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Mínimo 6 caracteres" }),
    role: z.string().optional(),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const schemaAdminEdit = z
  .object({
    name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    role: z.string().optional(),
  })
  .refine((vals) => {
    const p = vals.password ?? "";
    const c = vals.confirmPassword ?? "";
    if (!p && !c) return true; // sin cambio de contraseña
    return p.length >= 6 && p === c;
  }, {
    message: "Las contraseñas no coinciden o son inválidas",
    path: ["confirmPassword"],
  });

type Schema = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
};

export function UserForm({
  defaultValues,
  onSubmit,
  disabled,
  submitText = "Guardar",
  roles = [...APP_ROLES],
  mode = "create",
}: {
  defaultValues?: Partial<Schema>;
  onSubmit?: (data: Schema) => void | Promise<void>;
  disabled?: boolean;
  submitText?: string;
  roles?: string[];
  mode?: "create" | "admin-edit";
}) {
  const activeSchema = mode === "admin-edit" ? (schemaAdminEdit as any) : (schemaCreate as any);
  const form = useZodForm({ schema: activeSchema, defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "", ...defaultValues } as any });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordsMatch = useMemo(() => {
    if (mode === "admin-edit") {
      if (!password && !confirmPassword) return true;
    }
    return Boolean(password) && password === confirmPassword;
  }, [password, confirmPassword, mode]);

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
                <Input placeholder="Juan Pérez" {...field} disabled={disabled || mode === "admin-edit"} />
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
                <Input type="email" placeholder="correo@ejemplo.com" {...field} disabled={disabled || mode === "admin-edit"} />
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
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={disabled} />
                  <AppButton
                    btnType="ghost"
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </AppButton>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showConfirm ? "text" : "password"} placeholder="••••••••" {...field} disabled={disabled} />
                  <AppButton
                    btnType="ghost"
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </AppButton>
                </div>
              </FormControl>
              <div className="text-xs mt-1 flex items-center gap-1">
                {passwordsMatch ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Las contraseñas coinciden</span>
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-rose-600">Las contraseñas no coinciden</span>
                  </>
                )}
              </div>
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
              <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <AppButton btnType="primary" type="submit" className="w-full sm:w-auto" disabled={disabled || !passwordsMatch}>{submitText}</AppButton>
      </form>
    </Form>
  );
}
