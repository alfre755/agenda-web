"use client"
import Link from "next/link";
import { AppButton } from "./AppButton";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10 text-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-90">
          Agenda Web
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#features" className="text-white/90 hover:text-white underline-offset-4">Características</Link>
          <Link href="#pricing" className="text-white/90 hover:text-white underline-offset-4">Precios</Link>
          <Link href="#faq" className="text-white/90 hover:text-white underline-offset-4">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <AppButton btnType="outlineLight" size="sm">Iniciar sesión</AppButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
