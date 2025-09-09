"use client"
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/AppButton";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const { sendVerificationEmail } = useAuth();
  const params = useSearchParams();
  const initialEmail = params.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Verificar email</h1>
        <p className="text-sm text-muted-foreground">Te hemos enviado un enlace de verificación. Si no lo recibiste, ingresa tu email y reenvíalo.</p>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <AppButton
            btnType="primary"
            type="button"
            disabled={sending || !email}
            onClick={async () => {
              try {
                setSending(true);
                await sendVerificationEmail({ email, callbackURL: "/auth" });
                toast.success("Enlace de verificación enviado");
              } catch (e: any) {
                toast.error(e?.message ?? "No se pudo enviar verificación");
              } finally {
                setSending(false);
              }
            }}
          >
            {sending ? "Enviando..." : "Reenviar verificación"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
