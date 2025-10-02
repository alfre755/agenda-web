"use client";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import BackendProvider from "@/hooks/use-backend-context";
import { ToastProvider } from "@/hooks/use-toast";

export default function AppPlatformLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUsers();
  const { signOut } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <ToastProvider>
      <BackendProvider>
        <div className="min-h-[calc(100vh-56px)] grid grid-cols-1 sm:grid-cols-[auto_1fr]">
      <div className="border-b sm:hidden px-4 py-2 flex items-center gap-2">
        <MobileSidebar />
        <span className="font-semibold text-sm">Agenda Centralizada</span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.image ?? undefined} alt={currentUser?.name ?? currentUser?.email ?? ""} />
                  <AvatarFallback>{(currentUser?.name || currentUser?.email || "?").slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => location.assign("/settings")}>Ajustes de perfil</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmLogoutOpen(true)}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="hidden sm:block"><Sidebar /></div>
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="hidden sm:flex items-center justify-end gap-3 mb-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.image ?? undefined} alt={currentUser?.name ?? currentUser?.email ?? ""} />
                  <AvatarFallback>{(currentUser?.name || currentUser?.email || "?").slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser?.name || "Cuenta"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => location.assign("/settings")}>Ajustes de perfil</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmLogoutOpen(true)}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-full">{children}</div>
      </main>
      <ConfirmDialog
        open={confirmLogoutOpen}
        onOpenChange={setConfirmLogoutOpen}
        title="¿Cerrar sesión?"
        description="Se cerrará tu sesión actual."
        confirmText={loggingOut ? "Saliendo..." : "Cerrar sesión"}
        isLoading={loggingOut}
        onConfirm={async () => {
          try {
            setLoggingOut(true);
            await signOut();
          } catch (_) {
          } finally {
            setLoggingOut(false);
            setConfirmLogoutOpen(false);
            location.assign("/home");
          }
        }}
      />
        </div>
      </BackendProvider>
    </ToastProvider>
  );
}
