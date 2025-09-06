"use client"
import { LoginForm } from "@/components/forms/LoginForm";
import { toast } from "sonner";

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground mb-6">Accede con tus credenciales</p>
        <LoginForm
          onSubmit={async (data) => {
            toast.info("Integrar better-auth: iniciar sesión", { description: data.email });
            // TODO: Reemplazar por método oficial de better-auth (credentials / provider)
            // Ejemplo (ilustrativo): await authClient.signIn({ email: data.email, password: data.password })
          }}
        />
      </div>
    </div>
  );
}
