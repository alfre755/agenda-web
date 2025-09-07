"use client"
import { LoginForm } from "@/components/forms/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground mb-6">Accede con tus credenciales</p>
        <LoginForm
          disabled={isSubmitting}
          onSubmit={async (data) => {
            try {
              setIsSubmitting(true);
              const res = await signInWithEmail({ email: data.email, password: data.password, callbackURL: "/dashboard" });
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
      </div>
    </div>
  );
}
