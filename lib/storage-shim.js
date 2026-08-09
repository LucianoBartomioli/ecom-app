/**
 * Instala window.storage con el mismo contrato que usa la app,
 * pero apuntando a /api/storage en vez del entorno original.
 * Así el componente no necesita ni una línea de cambio.
 */
const TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN || "";

async function pedir(url, opciones) {
  const o = opciones || {};
  const r = await fetch(url, {
    ...o,
    headers: { ...(o.headers || {}), "Content-Type": "application/json", "x-app-token": TOKEN },
  });
  if (r.status === 404) return null;
  if (!r.ok) {
    let detalle = r.status;
    try { detalle = (await r.json()).error || detalle; } catch (e) { /* respuesta sin json */ }
    throw new Error(String(detalle));
  }
  return r.json();
}

export function instalarStorage() {
  if (typeof window === "undefined" || window.storage) return;
  window.storage = {
    async get(key) {
      const r = await pedir("/api/storage?key=" + encodeURIComponent(key));
      if (!r) throw new Error("No existe la clave " + key);
      return r;
    },
    async set(key, value) {
      return pedir("/api/storage", { method: "POST", body: JSON.stringify({ key, value }) });
    },
    async delete(key) {
      return pedir("/api/storage?key=" + encodeURIComponent(key), { method: "DELETE" });
    },
    async list(prefix) {
      return pedir("/api/storage?prefix=" + encodeURIComponent(prefix || ""));
    },
  };
}
