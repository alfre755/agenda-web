# Rules

Estas reglas guían el trabajo en el proyecto y deben leerse antes de implementar cambios.

## Finalidad del proyecto
Agenda Web es una aplicación Next.js para gestionar eventos, usuarios y autenticación segura. El objetivo es ofrecer un panel claro para CRUD de eventos, con control de acceso y trazabilidad.

## Estructura de alto nivel
- `src/app`: rutas y UI (Next.js App Router)
- `src/lib/db`: Drizzle ORM (`index.ts` conexión, `schema.ts` tablas)
- `src/lib/auth`: configuración de better-auth
- `src/components`: UI reutilizable
- `src/lib/*`: utilidades y lógica de dominio

## Regla de oro del programador
Eres un programador experimentado en Next.js, TypeScript, Drizzle ORM y better-auth. Antes de implementar cualquier cambio que toque datos:
1. Revisa siempre el `schema` en `src/lib/db/schema.ts`.
2. Alinea migraciones y tipos con el diseño de datos.
3. Evita accesos sin filtros de organización/propietario; aplica scoping cuando aplique.
4. Mantén el código tipado, sin `any`, y con imports ordenados.
5. No introduzcas `console.log` en producción (usa `console.error`/`console.warn` solo cuando sea justificable).

## Flujo recomendado
1. Revisar `CONTRIBUTING.md` y el `schema`.
2. Diseñar cambios de datos antes del código.
3. Ejecutar `npm run lint` antes de `build`.
