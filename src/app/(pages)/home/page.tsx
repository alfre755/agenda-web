"use client"
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="pt-24">
        <section className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Agenda Web — Home
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
            Programa y gestiona tus eventos con una experiencia moderna impulsada por shadcn/ui.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/auth">
              <Button size="lg">Iniciar sesión</Button>
            </Link>
            <a href="#features" className="text-sm md:text-base underline underline-offset-4">Saber más</a>
          </div>
        </section>
      </main>
    </div>
  );
}
