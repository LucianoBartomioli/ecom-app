/**
 * Almacenamiento compartido.
 * Reemplaza el window.storage del entorno original por una base real,
 * para que los cuatro editores y vos vean exactamente los mismos datos.
 *
 * Usa la API REST de Vercel KV (Upstash) con fetch, sin dependencias.
 */

export const runtime = "edge";

const URL_KV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN_KV = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const APP_TOKEN = process.env.APP_TOKEN || "";

const sinBase = () =>
  Response.json(
    { error: "Falta configurar la base de datos. Creá un KV en Vercel y volvé a desplegar." },
    { status: 501 }
  );

function autorizado(req) {
  if (!APP_TOKEN) return true;
  return req.headers.get("x-app-token") === APP_TOKEN;
}

async function comando(...args) {
  const r = await fetch(URL_KV, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN_KV, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("La base respondió " + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export async function GET(req) {
  if (!URL_KV) return sinBase();
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });

  const { searchParams } = new globalThis.URL(req.url);
  const prefijo = searchParams.get("prefix");
  const key = searchParams.get("key");

  try {
    if (prefijo != null) {
      const claves = await comando("KEYS", prefijo + "*");
      return Response.json({ keys: claves || [], prefix: prefijo, shared: true });
    }
    if (!key) return Response.json({ error: "Falta la clave." }, { status: 400 });
    const value = await comando("GET", key);
    if (value == null) return Response.json({ error: "No existe." }, { status: 404 });
    return Response.json({ key, value, shared: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!URL_KV) return sinBase();
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });

  try {
    const { key, value } = await req.json();
    if (!key) return Response.json({ error: "Falta la clave." }, { status: 400 });
    if (typeof value !== "string") return Response.json({ error: "El valor tiene que ser texto." }, { status: 400 });
    if (value.length > 20 * 1024 * 1024) {
      return Response.json({ error: "El archivo supera los 20 MB." }, { status: 413 });
    }
    await comando("SET", key, value);
    return Response.json({ key, value, shared: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!URL_KV) return sinBase();
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });

  const { searchParams } = new globalThis.URL(req.url);
  const key = searchParams.get("key");
  if (!key) return Response.json({ error: "Falta la clave." }, { status: 400 });
  try {
    await comando("DEL", key);
    return Response.json({ key, deleted: true, shared: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
