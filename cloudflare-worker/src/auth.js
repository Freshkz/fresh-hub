// Identifica a quién hace la request usando el token de sesión de Supabase.
//
// El rol NUNCA viene del cliente (antes llegaba como ?role=admin y el Worker le
// creía). Se le pregunta a Supabase con el mismo token del usuario:
// - /auth/v1/user valida el token y devuelve el id del usuario.
// - rpc/current_app_role devuelve el rol real (misma función que usa la RLS,
//   ver supabase/security-roles-migration.sql).

export const EDITOR_ROLES = ["admin", "editor"];

export async function getCaller(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;

  const headers = { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  const [userRes, roleRes] = await Promise.all([
    fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers }),
    fetch(`${env.SUPABASE_URL}/rest/v1/rpc/current_app_role`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: "{}",
    }),
  ]);
  if (!userRes.ok || !roleRes.ok) return null;

  const user = await userRes.json();
  const role = await roleRes.json();
  if (!user?.id) return null;

  return { id: user.id, email: user.email, role };
}
