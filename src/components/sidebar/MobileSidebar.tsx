"use client"
import { Menu } from "lucide-react";
import { useState } from "react";

import { AppButton } from "@/components/AppButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}
