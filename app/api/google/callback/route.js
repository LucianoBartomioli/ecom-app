/**
 * GET /api/google/callback
 * Google vuelve acá con el código. Lo cambiamos por el refresh token
 * y lo guardamos en la base: nunca hace falta copiarlo a mano.
 */

import { leerVuelta, urlDeVuelta, explicarErrorGoogle, pagina } from "../../../../lib/google-oauth-web";
import { guardarRefresh, baseConfigurada } from "../../../../lib/kv";

export const runtime = "nodejs";

const html = (t, c, ok) =>
  new Response(pagina(t, c, ok), { headers: { "Content-Type": "text/html; charset=utf-8" } });

export async function GET(req) {
  const vuelta = leerVuelta(req.url);

  if (vuelta.error) {
    return html("No se pudo autorizar", explicarErrorGoogle(vuelta.error), false);
  }
  if (!vuelta.code) {
    return html("Falta el código",
      "Entrá por <code>/api/google/auth</code> en vez de abrir esta dirección directamente.", false);
  }

  const origen = new URL(req.url).origin;

  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: vuelta.code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: urlDeVuelta(origen),
        grant_type: "authorization_code",
      }),
    });
    const j = await r.json();

    if (j.error) {
      return html("Google rechazó el canje", explicarErrorGoogle(j.error, j.error_description), false);
    }
    if (!j.refresh_token) {
      return html("Google no mandó el token de larga duración",
        "Suele pasar cuando ya habías autorizado esta app antes. Entrá a " +
        "<a style='color:#E5001E' href='https://myaccount.google.com/permissions' target='_blank' rel='noreferrer'>" +
        "myaccount.google.com/permissions</a>, quitale el acceso y volvé a intentar.", false);
    }

    if (!baseConfigurada()) {
      return html("Autorizaste, pero no hay dónde guardarlo",
        "Conectá la base (Upstash) en Vercel y repetí el paso. " +
        "Mientras tanto, este es el token: <code style='word-break:break-all;color:#EDEAE3'>" +
        j.refresh_token + "</code>", false);
    }

    await guardarRefresh(j.refresh_token);
    return html("Drive quedó conectado",
      "El permiso se guardó solo: no tenés que copiar nada. " +
      "Volvé a la app y en la barra de arriba vas a ver <b style='color:#EDEAE3'>Drive conectado</b>. " +
      "Ya podés cerrar esta pestaña.", true);
  } catch (e) {
    return html("Falló la conexión", String(e.message || e), false);
  }
}
