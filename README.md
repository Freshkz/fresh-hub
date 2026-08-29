# FreshKZ Hub

## Cómo correrlo
```bash
npm install
npm run dev
```

Ya incluye .env.local con las credenciales de Supabase (URL + anon key pública).

Si vas a usar uploads reales para descargas, crea un bucket público llamado `downloads` en Supabase Storage y opcionalmente define estas variables en `.env.local`:

```bash
VITE_DOWNLOADS_BUCKET=downloads
VITE_DOWNLOADS_FOLDER=downloads
```

Con esto, el admin puede subir archivos directamente desde la pantalla de Downloads y generar la URL pública automática. Si después migrás a Cloudflare R2, solo hace falta apuntar el bucket y la lógica de subida se mantiene igual.

## Qué incluye esta versión
- Home, Projects, Downloads, News — leyendo en vivo desde Supabase (ya no hay mocks)
- Admin (/admin) con login real vía Supabase Auth
- CRUD completo (crear, editar, eliminar) para: Projects, Downloads, News, Social Links
- Dashboard con accesos rápidos a cada sección

## Falta para la próxima etapa
- Subida de archivos a Cloudflare R2 (hoy el campo "URL de descarga" es manual)
- Integración con GitHub releases → Novedades automáticas + control de duplicados
- Mostrar Social Links y Discord widget en la Home (ya están en la base de datos, falta el componente visual)
- Buscador global, filtros por categoría, dark/light mode, SEO
