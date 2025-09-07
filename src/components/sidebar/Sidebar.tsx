"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Settings, Users, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { AppButton } from "@/components/AppButton";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: CalendarIcon },
  { href: "/organizations", label: "Organizaciones", icon: Building2 },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/calendar", label: "Calendario", icon: CalendarIcon },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("border-r h-[calc(100vh-56px)] sticky top-[56px] bg-background transition-[width] duration-200", collapsed ? "w-16" : "w-64")}> 
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
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
      <nav className="py-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link href={href} className={cn(
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
    </aside>
  );
}
