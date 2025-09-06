"use client"
import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Agenda Web
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#features" className="hover:underline underline-offset-4">Características</Link>
          <Link href="#pricing" className="hover:underline underline-offset-4">Precios</Link>
          <Link href="#faq" className="hover:underline underline-offset-4">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <Button size="sm">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
