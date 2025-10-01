"use client"
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { LoginForm } from "@/components/forms/LoginForm";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const { signInWithEmail } = useAuth();
  const { sendVerificationEmail, requestPasswordReset } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground mb-6">Accede con tus credenciales</p>
        {params.get("error") === "email_not_verified" && (
          <div className="mb-4 text-sm text-amber-600">Debes verificar tu email antes de continuar. Puedes reenviar el enlace abajo.</div>
        )}
        <LoginForm
          disabled={isSubmitting}
          onSubmit={async (data) => {
            try {
              setIsSubmitting(true);
              const res = await signInWithEmail({ email: data.email, password: data.password, callbackURL: "/dashboard" });
              if ((res as any)?.error) {
                const status = (res as any)?.error?.status;
                if (status === 403) {
                  router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
                  return;
                }
                toast.error((res as any)?.error?.message ?? "No se pudo iniciar sesión");
                return;
              }
              toast.success("Sesión iniciada");
              router.push("/dashboard");
              return res;
            } catch (err: any) {
              const message = err?.message || "No se pudo iniciar sesión";
              toast.error(message);
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            className="text-sm text-primary underline text-left"
            onClick={async () => {
              try {
                const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || "";
                if (!email) return toast.error("Ingresa tu email primero");
                await sendVerificationEmail({ email, callbackURL: "/auth" });
                toast.success("Enlace de verificación enviado");
              } catch (e: any) {
                toast.error(e?.message ?? "No se pudo enviar verificación");
              }
            }}
          >
            Reenviar verificación de email
          </button>
          <button
            type="button"
            className="text-sm text-primary underline text-left"
            onClick={async () => {
              try {
                const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || "";
                if (!email) return toast.error("Ingresa tu email primero");
                await requestPasswordReset({ email, redirectTo: "/reset-password" });
                toast.success("Enlace para restablecer enviado");
              } catch (e: any) {
                toast.error(e?.message ?? "No se pudo solicitar restablecimiento");
              }
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}
