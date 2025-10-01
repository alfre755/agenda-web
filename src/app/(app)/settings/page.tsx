"use client";
import { useState } from "react";
import { toast } from "sonner";

import { AppButton } from "@/components/AppButton";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/hooks/use-users";

export default function SettingsPage() {
  const { currentUser, updateUser, changeEmail, changePassword } = useUsers();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [image, setImage] = useState(currentUser?.image ?? "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Perfil</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted-foreground">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Imagen (URL)</label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
        </div>
        <AppButton
          btnType="primary"
          type="button"
          disabled={savingProfile}
          onClick={async () => {
            try {
              setSavingProfile(true);
              const res = await updateUser({ name, image });
              if ((res as any)?.error) throw new Error((res as any).error.message);
              toast.success("Perfil actualizado");
            } catch (err: any) {
              toast.error(err?.message ?? "No se pudo actualizar");
            } finally {
              setSavingProfile(false);
            }
          }}
        >
          Guardar cambios
        </AppButton>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Cambiar email</h2>
        <div className="max-w-md">
          <label className="text-sm text-muted-foreground">Nuevo email</label>
          <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </div>
        <AppButton
          btnType="secondary"
          type="button"
          disabled={savingEmail}
          onClick={async () => {
            try {
              setSavingEmail(true);
              const res = await changeEmail({ newEmail, callbackURL: "/dashboard" });
              if ((res as any)?.error) throw new Error((res as any).error.message);
              toast.info("Revisa tu email para confirmar el cambio");
            } catch (err: any) {
              toast.error(err?.message ?? "No se pudo iniciar el cambio de email");
            } finally {
              setSavingEmail(false);
            }
          }}
        >
          Enviar verificación
        </AppButton>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Cambiar contraseña</h2>
        <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
          <div>
            <label className="text-sm text-muted-foreground">Contraseña actual</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Nueva contraseña</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
        <AppButton
          btnType="secondary"
          type="button"
          disabled={savingPassword}
          onClick={async () => {
            try {
              setSavingPassword(true);
              const res = await changePassword({ newPassword, currentPassword, revokeOtherSessions: true });
              if ((res as any)?.error) throw new Error((res as any).error.message);
              toast.success("Contraseña actualizada");
              setCurrentPassword("");
              setNewPassword("");
            } catch (err: any) {
              toast.error(err?.message ?? "No se pudo cambiar la contraseña");
            } finally {
              setSavingPassword(false);
            }
          }}
        >
          Cambiar contraseña
        </AppButton>
      </section>
    </div>
  );
}
