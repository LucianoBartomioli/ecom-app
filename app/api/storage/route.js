/**
 * Almacenamiento compartido.
 * Reemplaza el window.storage del entorno original por una base real,
 * para que los cuatro editores y vos vean exactamente los mismos datos.
 *
 * Usa la API REST de Vercel KV (Upstash) con fetch, sin dependencias.
 */

export const runtime = "edge";

/**
 * Acepta los tres nombres posibles según cómo hayas creado la base:
 *  - KV_REST_API_*        lo que inyecta la integración de Upstash en Vercel
 *  - UPSTASH_REDIS_REST_* lo que ves en el panel de Upstash
 *  - STORAGE_REST_*       para cargarlas a mano si tu proveedor usa otros nombres
 */
const FUENTES = [
  ["KV_REST_API_URL", "KV_REST_API_TOKEN", "integración de Upstash en Vercel"],
  ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "panel de Upstash"],
  ["STORAGE_REST_URL", "STORAGE_REST_TOKEN", "variables cargadas a mano"],
];

function detectarBase() {
  for (const [claveUrl, claveToken, origen] of FUENTES) {
    const url = process.env[claveUrl];
    const token = process.env[claveToken];
    if (url && token) return { url, token, origen, variables: claveUrl + " / " + claveToken };
  }
  return null;
}

const BASE = detectarBase();
const URL_KV = BASE ? BASE.url : "";
const TOKEN_KV = BASE ? BASE.token : "";
const APP_TOKEN = process.env.APP_TOKEN || "";

const sinBase = () =>
  Response.json(
    {
      error: "Falta la base de datos.",
      queHacer:
        "En Vercel: Storage → Marketplace → Upstash → creá una base Redis y conectala al proyecto. " +
        "Inyecta KV_REST_API_URL y KV_REST_API_TOKEN solas. Después redesplegá. " +
        "Si tu proveedor usa otros nombres, cargá a mano STORAGE_REST_URL y STORAGE_REST_TOKEN.",
      buscadas: FUENTES.map((f) => f[0] + " / " + f[1]),
    },
    { status: 501 }
  );

function autorizado(req) {
  if (!APP_TOKEN) return true;
  if (req.headers.get("x-app-token") === APP_TOKEN) return true;
  // También por la barra de direcciones, para poder probar desde el navegador.
  try { return new URL(req.url).searchParams.get("token") === APP_TOKEN; }
  catch (e) { return false; }
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
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });
  if (!URL_KV && new globalThis.URL(req.url).searchParams.get("estado") == null) return sinBase();

  const { searchParams } = new globalThis.URL(req.url);

  // Diagnóstico: /api/storage?estado&token=TU_CLAVE
  if (searchParams.get("estado") != null) {
    if (!BASE) return sinBase();
    try {
      const prueba = "rr:diagnostico:" + Date.now();
      await comando("SET", prueba, "ok");
      const leido = await comando("GET", prueba);
      await comando("DEL", prueba);
      return Response.json({
        ok: leido === "ok",
        base: BASE.origen,
        variables: BASE.variables,
        escrituraYLectura: leido === "ok" ? "funcionan" : "la base respondió algo raro",
      });
    } catch (e) {
      return Response.json({ ok: false, base: BASE.origen, error: e.message }, { status: 500 });
    }
  }

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
    // Upstash rechaza los envíos grandes, y en el plan gratuito el margen es
    // chico. Avisamos antes de que la base tire un error críptico.
    if (value.length > 900 * 1024) {
      return Response.json(
        {
          error: "El archivo pesa " + Math.round(value.length / 1024) + " KB y la base acepta hasta 900 KB por envío.",
          queHacer: "Usá un archivo más liviano, o subí los videos pesados a Drive.",
        },
        { status: 413 }
      );
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
