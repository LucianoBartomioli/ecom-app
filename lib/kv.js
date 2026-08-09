/**
 * Acceso a la base, compartido por las rutas del servidor.
 * Mismo criterio de detección que /api/storage.
 */

const FUENTES = [
  ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
  ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  ["STORAGE_REST_URL", "STORAGE_REST_TOKEN"],
];

export function baseConfigurada() {
  for (const [u, t] of FUENTES) {
    if (process.env[u] && process.env[t]) return { url: process.env[u], token: process.env[t] };
  }
  return null;
}

export async function comandoKV(...args) {
  const base = baseConfigurada();
  if (!base) throw new Error("No hay base de datos configurada.");
  const r = await fetch(base.url, {
    method: "POST",
    headers: { Authorization: "Bearer " + base.token, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("La base respondió " + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export const CLAVE_REFRESH = "rr:google:refresh_token";

export async function leerRefreshGuardado() {
  if (!baseConfigurada()) return null;
  try { return (await comandoKV("GET", CLAVE_REFRESH)) || null; }
  catch (e) { return null; }
}

export async function guardarRefresh(token) {
  await comandoKV("SET", CLAVE_REFRESH, token);
}

export async function borrarRefresh() {
  if (!baseConfigurada()) return;
  try { await comandoKV("DEL", CLAVE_REFRESH); } catch (e) { /* nada que borrar */ }
}
