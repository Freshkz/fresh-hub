# FreshKZ Hub

Hub personal de Fresh: proyectos, sitios web, descargas, novedades y guías, con
panel de administración para Fresh y sus colaboradores.

**Stack:** React + Vite + Tailwind (GitHub Pages, PWA) · Supabase (Postgres + Auth + RLS)
· Cloudflare Worker + R2 (archivos pesados).

## Correrlo en local

```bash
npm install
cp .env.example .env.local   # y completá los valores
npm run dev
```

## Estructura

```
src/
├── pages/           páginas públicas + admin/ (el admin se carga con lazy loading)
├── components/      UI reutilizable (cards, modales, admin/)
├── services/        acceso a datos: Supabase, Worker, Discord (nada de fetch en las páginas)
├── hooks/           useAuth (sesión + rol), useSiteSettings, useR2FileDraft
├── constants/       opciones compartidas (tipos y estados de proyecto)
└── utils/           helpers chicos (formato de bytes, URLs seguras)
cloudflare-worker/   Worker de R2 + proxy de GitHub (ver su README)
supabase/            migraciones SQL
```

## Seguridad (resumen)

- **Roles:** viven en `collaborators.role` (`admin` | `editor`). Quien no está en esa
  tabla es visitante: ve el sitio pero no publica. Se administran desde `/admin/collaborators`.
  Nunca se usa `user_metadata` para permisos (el usuario lo puede editar).
- **RLS en todas las tablas:** la base decide qué puede leer/escribir cada uno.
  El frontend solo decide qué botones mostrar.
- **Contenido privado:** la base no devuelve filas privadas a quien no tiene acceso;
  `private_teasers()` manda solo título/imagen para dibujar la card tapada.
- **Secretos:** webhooks de Discord y PIN en `private_settings` (solo admin).
  Tokens de R2/GitHub como secrets del Worker. Nada secreto en variables `VITE_`.

## Base de datos

Las migraciones de `supabase/` se corren a mano en el SQL Editor de Supabase.
Las últimas (y las que definen la seguridad actual), en este orden:

1. `security-roles-migration.sql` — roles y políticas RLS
2. `private-data-migration.sql` — contenido privado y `private_settings`
3. `private-teasers-migration.sql` — cards tapadas
4. `ratings-and-project-types-migration.sql` — votos y tipos de proyecto

Las anteriores son historial de cómo se armó la base; varias de sus políticas ya
fueron reemplazadas por las de arriba.

## Deploy

- **Sitio:** push a `main` → GitHub Actions compila y publica en GitHub Pages
  (variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en el repo).
- **Worker:** `cd cloudflare-worker && npx wrangler deploy`.

## Pendiente / ideas

- Paginación en los listados (hoy se traen completos y se filtran en el navegador;
  hace falta cuando haya cientos de ítems).
- Historial de versiones por descarga y contador de descargas.
- Home pública sin login para mostrar el portfolio.
