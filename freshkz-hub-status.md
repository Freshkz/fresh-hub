# FreshKZ Hub — Estado del proyecto (29/08/2026)

## Stack actual
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Lucide React + React Router
- **Backend/DB**: Supabase (Postgres + Auth), con Row Level Security activo
- **Storage de archivos pesados**: todavía no conectado (planeado: Cloudflare R2)
- **Deploy**: todavía no publicado (planeado: GitHub Pages para el frontend)

## Estructura de carpetas
```
src/
├── components/
│   ├── layout/       Navbar, Footer, ProtectedRoute
│   ├── home/          Hero
│   ├── projects/     ProjectCard
│   ├── downloads/  DownloadCard
│   ├── news/           NewsItem
│   ├── social/         SocialLink, SocialGrid
│   └── ui/               Badge
├── pages/
│   ├── Home/  Downloads/  Projects/  News/
│   └── admin/
│       Login, Dashboard, ProjectsAdmin, DownloadsAdmin, NewsAdmin, SocialsAdmin
├── services/       supabaseClient.js, projects.js, downloads.js, news.js, socials.js
├── hooks/            useAuth.js
└── App.jsx           rutas
```

## Qué está funcionando
- **Páginas públicas** (Home, Projects, Downloads, News): leen datos en vivo desde Supabase
- **Autenticación admin real** vía Supabase Auth (login con email/password, sesión persistente)
- **Rutas protegidas** (`/admin/*` redirige a login si no hay sesión)
- **CRUD completo** (crear, editar, eliminar) para 4 entidades: Projects, Downloads, News, Social Links
- **Redes sociales dinámicas**: se cargan desde la DB y se resuelve el ícono real de lucide-react a partir de un nombre de texto guardado en la base
- Base de datos con 5 tablas relacionadas (projects, downloads, news, social_links, settings), RLS configurado (lectura pública, escritura solo autenticado)

## Qué falta (funcionalidad de la spec original no implementada)
1. **Cloudflare R2**: subida real de archivos pesados. Hoy el campo "URL de descarga" en Downloads es un link manual que hay que pegar a mano (ej. a Drive/Mega).
2. **Integración GitHub releases → Novedades automáticas**, con deduplicación por `source`/`source_id` (la columna ya existe en la tabla `news`, pero no hay ningún proceso que la use todavía).
3. **Versiones múltiples por descarga** (tabla `releases` con historial de versiones — hoy `downloads` solo guarda una versión "actual", no un historial).
4. **Changelog visual** por versión (el campo `changelog text[]` existe en la tabla pero ningún componente lo muestra).
5. **Discord widget** con info pública del servidor.
6. **Buscador global** (proyectos + descargas + novedades).
7. **Filtros por categoría** en Downloads/Projects/News.
8. **Modo Light / System** (hoy solo hay dark, hardcodeado).
9. **SEO**: title/meta description/Open Graph/favicon/sitemap.
10. **Panel Admin → Settings** (nombre, avatar, colores, SEO) — no existe todavía, aunque la tabla `settings` ya está creada.
11. **Páginas de detalle** (por ahora Projects/Downloads/News solo muestran cards en grilla, no hay una vista individual por ítem con más información).
12. **Estadísticas reales** en el dashboard admin (hoy solo hay links, no cuenta cuántos hay de cada cosa).
13. **Deploy**: nada está publicado todavía, sigue corriendo solo en local (`npm run dev`).

## Cosas para hacerlo más prolijo / eficiente (deuda técnica)
1. **`SocialLink.jsx` importa toda la librería de íconos** (`import * as Icons from "lucide-react"`), lo que infló el bundle final de ~360KB a ~1.2MB. Se debería reemplazar por un diccionario explícito con solo los íconos que se usan (import nombrado, no `import *`).
2. **No hay manejo de loading/error consistente**: cada página pública (Home, Projects, Downloads, News) hace su propio `.catch(() => {})` silencioso — si Supabase falla, el usuario no ve ningún mensaje, solo queda vacío. Convendría un hook compartido tipo `useSupabaseQuery` que centralice loading/error.
3. **Código de los admin (ProjectsAdmin, DownloadsAdmin, NewsAdmin, SocialsAdmin) está muy duplicado**: los cuatro archivos repiten casi la misma lógica de formulario + lista + loading + error. Se podría extraer a un componente genérico `AdminCrudPage` reutilizable, pasándole la config de campos por props.
4. **No hay code-splitting**: todo el bundle se manda en un solo archivo JS grande. Con `react-router` ya instalado, conviene usar `React.lazy()` para cargar las páginas de `/admin/*` solo cuando se visitan (el visitante público no necesita descargar ese código).
5. **Los datos de settings (nombre, colores, avatar) siguen hardcodeados** en vez de leerse de la tabla `settings` que ya existe en la DB — cuando se arme la página de Admin Settings, hay que además consumir esos valores en Navbar/Footer/Hero en vez de tener el texto fijo en el JSX.
6. **`.env.local` con las credenciales de Supabase**: confirmar que está en `.gitignore` antes de subir el proyecto a GitHub (Vite lo suele traer por defecto, pero vale la pena verificarlo a mano).
7. **La secret key de Supabase fue expuesta una vez en el chat de desarrollo** — ya se recomendó regenerarla; confirmar que se hizo antes de seguir.

## Prioridad sugerida para seguir
1. Cloudflare R2 (para que Downloads sea real, no un link pegado a mano)
2. Panel Admin → Settings (para dejar de hardcodear nombre/colores)
3. Deploy a GitHub Pages (para poder mostrarlo, aunque esté incompleto)
4. Recién después: GitHub releases automáticas, buscador, filtros, SEO, versiones múltiples
