/**
 * Autenticación con Google, por dos caminos.
 *
 * 1. CUENTA DE SERVICIO (recomendado)
 *    Una identidad que pertenece al servidor, no a una persona. No hay
 *    navegador, no hay consentimiento, no hay token que venza a los 7 días.
 *    Se le comparte la carpeta de Drive como si fuera un compañero de trabajo.
 *    Variable: GOOGLE_SERVICE_ACCOUNT_JSON
 *
 * 2. OAUTH CON REFRESH TOKEN (alternativa)
 *    El método de siempre. Requiere el paso del navegador una vez, y si la
 *    app quedó en modo Testing, rehacerlo cada 7 días.
 *    Variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *
 * Si están las dos, gana la cuenta de servicio.
 */

import crypto from "crypto";

const base64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Acepta el JSON pegado tal cual o codificado en base64. */
export function leerCuentaDeServicio(bruto) {
  if (!bruto || !String(bruto).trim()) return null;
  let texto = String(bruto).trim();
  if (texto[0] !== "{") {
    try { texto = Buffer.from(texto, "base64").toString("utf8"); } catch (e) { return null; }
  }
  let json;
  try { json = JSON.parse(texto); } catch (e) { return null; }
  if (!json.client_email || !json.private_key) return null;
  return {
    email: json.client_email,
    clave: String(json.private_key).replace(/\\n/g, "\n"),
    tokenUri: json.token_uri || "https://oauth2.googleapis.com/token",
  };
}

/** Arma el JWT firmado que Google canjea por un access token. */
export function construirJWT(cuenta, alcance, ahora) {
  const iat = Math.floor((ahora || Date.now()) / 1000);
  const cabecera = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const cuerpo = base64url(JSON.stringify({
    iss: cuenta.email,
    scope: alcance,
    aud: cuenta.tokenUri,
    iat,
    exp: iat + 3600,
  }));
  const aFirmar = cabecera + "." + cuerpo;
  const firma = crypto.createSign("RSA-SHA256").update(aFirmar).sign(cuenta.clave);
  return aFirmar + "." + base64url(firma);
}

async function tokenPorCuentaDeServicio(cuenta, alcance) {
  const r = await fetch(cuenta.tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: construirJWT(cuenta, alcance),
    }),
  });
  const j = await r.json();
  if (!j.access_token) {
    throw new Error("La cuenta de servicio no fue aceptada: " + (j.error_description || j.error || "sin detalle"));
  }
  return j.access_token;
}

async function tokenPorRefresh() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
  });
  const j = await r.json();
  if (!j.access_token) {
    const detalle = j.error_description || j.error || "sin detalle";
    if (/invalid_grant/i.test(String(j.error))) {
      throw new Error(
        "El refresh token dejó de servir. Suele pasar cuando la app quedó en modo Testing, " +
        "donde Google los vence a los 7 días. Pasá la app a producción o usá una cuenta de servicio."
      );
    }
    throw new Error("Google no dio el token: " + detalle);
  }
  return j.access_token;
}

/** Devuelve un access token por el camino que esté configurado. */
export async function accessToken(alcance) {
  const cuenta = leerCuentaDeServicio(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  if (cuenta) return tokenPorCuentaDeServicio(cuenta, alcance || "https://www.googleapis.com/auth/drive");
  if (process.env.GOOGLE_REFRESH_TOKEN) return tokenPorRefresh();
  throw new Error(
    "Falta configurar Google. Cargá GOOGLE_SERVICE_ACCOUNT_JSON, o bien " +
    "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN."
  );
}

/** Para mostrar en pantalla qué camino quedó activo. */
export function metodoConfigurado() {
  if (leerCuentaDeServicio(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)) return "cuenta_de_servicio";
  if (process.env.GOOGLE_REFRESH_TOKEN) return "oauth";
  return null;
}
