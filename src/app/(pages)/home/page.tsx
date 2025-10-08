"use client"
import { CalendarClock, PanelsTopLeft,ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AppButton } from "@/components/AppButton";
import { FeatureCard } from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="absolute inset-0 -z-10">
        <Image
          src="/imagenes/fondo-agenda-web.png"
          alt="Profesionales colaborando en una reunión"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>
      <main className="pt-24">
        <section className="mx-auto max-w-6xl px-4 py-28 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Organiza eventos con eficiencia y claridad
          </h1>
          <p className="mt-4 text-base md:text-lg max-w-3xl mx-auto text-white/90">
            Agenda Web centraliza la programación, gestión y seguimiento de tus eventos en una plataforma moderna y segura.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/auth">
              <AppButton btnType="outlineLight" size="lg">Iniciar sesión</AppButton>
            </Link>
            <Link href="#contacto">
              <AppButton btnType="outlineLight" size="lg">Contacto</AppButton>
            </Link>
          </div>
        </section>
        <section id="features" className="mx-auto max-w-6xl px-4 pb-24 grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={CalendarClock}
            title="Gestión integral"
            description="Planifica y coordina eventos en un flujo único: creación, edición, recordatorios y seguimiento con estados. Controla visibilidad por equipos u organización."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Autenticación segura"
            description="Autenticación con better-auth y sesiones protegidas. Roles y permisos para mantener la información segura y accesible solo a quien corresponde."
          />
          <FeatureCard
            icon={PanelsTopLeft}
            title="UI consistente"
            description="Interfaz moderna con shadcn/ui, accesible y responsiva. Componentes reutilizables que aceleran el desarrollo y mantienen coherencia visual."
          />
        </section>
        <section id="contacto" className="mx-auto max-w-3xl px-4 pb-24 text-center text-white/90">
          <h2 className="text-2xl font-semibold">Contacto</h2>
          <p className="mt-2">Escríbenos para demos o soporte: contacto@agendaweb.local</p>
        </section>
      </main>
    </div>
  );
}
