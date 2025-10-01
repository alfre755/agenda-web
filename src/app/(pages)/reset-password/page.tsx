"use client"
import { useRouter,useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppButton } from "@/components/AppButton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Restablecer contraseña</h1>
        {!token && <p className="text-sm text-rose-600">Token inválido o ausente.</p>}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Nueva contraseña</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirmar contraseña</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <AppButton
            btnType="primary"
            type="button"
            disabled={loading || !token || newPassword.length < 6 || newPassword !== confirmPassword}
            onClick={async () => {
              try {
                setLoading(true);
                const { error } = await resetPassword({ newPassword, token });
                if (error) throw new Error(error.message);
                toast.success("Contraseña actualizada");
                router.push("/auth");
              } catch (e: any) {
                toast.error(e?.message ?? "No se pudo actualizar la contraseña");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
