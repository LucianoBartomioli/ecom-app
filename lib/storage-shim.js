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
    let detalle = String(r.status);
    try {
      const j = await r.json();
      // El servidor manda "error" y a veces "queHacer" con la instrucción concreta.
      detalle = [j.error, j.queHacer].filter(Boolean).join(" ") || detalle;
    } catch (e) { /* respuesta sin json */ }
    // El código del estado ayuda a distinguir tamaño de permisos.
    throw new Error(r.status + " · " + detalle);
  }
  return r.json();
}

export function instalarStorage() {
  if (typeof window === "undefined") return;
  // Le avisa a la app que hay servidor detrás, y con qué clave hablarle.
  window.RR_API = { token: TOKEN };
  if (window.storage) return;
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
