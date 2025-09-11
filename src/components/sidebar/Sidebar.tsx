"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Users, Building2, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { AppButton } from "@/components/AppButton";
// ThemeToggle solo en top bar
import { authClient } from "@/lib/auth-client";
import { useUsers } from "@/hooks/use-users";
// Perfil/Dropdown solo en top bar

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: CalendarIcon },
  { href: "/organizations", label: "Organizaciones", icon: Building2 },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/calendar", label: "Calendario", icon: CalendarIcon },
  { href: "/scheduling", label: "Agendamiento", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, hasRole } = useUsers();

  return (
    <aside className={cn("border-r h-[calc(100vh-56px)] sticky top-[56px] bg-background transition-[width] duration-200", collapsed ? "w-16" : "w-72")}> 
      <div className="p-2 border-b flex items-center gap-2">
        <AppButton
          btnType="secondary"
          type="button"
          className="p-2"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </AppButton>
        <span className={cn("font-semibold text-sm", collapsed && "sr-only")}>Agenda Centralizada</span>
        <div className="ml-auto" />
      </div>
      <nav className="py-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            // Role-based visibility: superadmin/admin all modules; user limited
            const isSuperAdmin = hasRole("superadmin");
            const isAdmin = hasRole("admin");
            const isUser = hasRole("user") && !isAdmin && !isSuperAdmin;

            if (isUser) {
              const allowed = href === "/dashboard" || href === "/calendar" || href === "/scheduling" || href === "/settings";
              if (!allowed) return null;
            }
            // Simple resource-permission mapping for visibility
            const required = (
              href === "/users" ? { user: ["list"] } :
              href === "/organizations" ? { organization: ["list"] } :
              href === "/calendar" ? { calendar: ["list"] } :
              undefined
            );
            // If a mapping exists, check permission on client plugin
            if (required && !authClient.admin.checkRolePermission({ permissions: required, role: (typeof window !== "undefined" ? undefined : undefined) as any })) {
              // We can't synchronously know user role here; prefer to show and guard server-side or fetch role from session.
            }
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link href={href} prefetch={false} className={cn(
                  "mx-2 flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                  <span className={cn(collapsed && "sr-only")}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Área inferior limpia */}
    </aside>
  );
}
