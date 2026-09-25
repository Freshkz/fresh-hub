# FreshKZ Worker

Worker de Cloudflare que maneja los archivos de R2 y el proxy de commits de GitHub.

| Ruta | Quién | Qué hace |
|---|---|---|
| `GET /files/<key>` | Público | Descarga (soporta reanudar con `Range`) |
| `GET /presign?filename=` | Editor / Admin | URL firmada para subir directo a R2 |
| `DELETE /files/<key>` | Admin: cualquiera. Editor: solo sus archivos | Borra de R2 |
| `GET /github-commits` | Admin | Commits de los repos de `GITHUB_ALLOWED_REPOS` |
| `GET /orphans` | Admin | Lista archivos de R2 que ninguna descarga ni guía usa (no borra nada) |

Las rutas protegidas exigen `Authorization: Bearer <access_token de Supabase>`.
El Worker valida el token y obtiene el rol con `current_app_role()` (ver
`supabase/security-roles-migration.sql`); nunca confía en un rol que mande el navegador.

## Estructura

```
src/
├── index.js    router
├── auth.js     quién llama y con qué rol (vía Supabase)
├── files.js    presign / descarga / borrado en R2
├── github.js   proxy de commits
└── http.js     CORS + respuestas JSON
```

## Configuración

- **Variables públicas**: en `wrangler.toml` (`[vars]`): `SUPABASE_URL`, `ALLOWED_ORIGINS`, `GITHUB_ALLOWED_REPOS`.
- **Secrets** (nunca en git), se cargan una vez con `npx wrangler secret put NOMBRE`:
  `SUPABASE_ANON_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `GITHUB_TOKEN`.

## Deploy

```bash
npm install
npx wrangler deploy
```
