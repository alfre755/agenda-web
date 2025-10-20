"use client"
import { Menu } from "lucide-react";
import { useState } from "react";

import { AppButton } from "@/components/AppButton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { Sidebar } from "./Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <AppButton btnType="secondary" type="button" aria-label="Abrir menú" className="p-2">
            <Menu className="h-5 w-5" />
          </AppButton>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
            <SheetDescription>
              Menú de navegación principal de la aplicación
            </SheetDescription>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}
