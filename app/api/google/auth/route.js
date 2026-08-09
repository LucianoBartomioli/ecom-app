/**
 * GET /api/google/auth?token=APP_TOKEN
 * Manda al usuario a la pantalla de permisos de Google.
 */

import { urlDeConsentimiento, urlDeVuelta, pagina } from "../../../../lib/google-oauth-web";

export const runtime = "nodejs";
const APP_TOKEN = process.env.APP_TOKEN || "";

function autorizado(req) {
  if (!APP_TOKEN) return true;
  if (req.headers.get("x-app-token") === APP_TOKEN) return true;
  try { return new URL(req.url).searchParams.get("token") === APP_TOKEN; }
  catch (e) { return false; }
}

export async function GET(req) {
  const html = (t, c, ok) =>
    new Response(pagina(t, c, ok), { headers: { "Content-Type": "text/html; charset=utf-8" } });

  if (!autorizado(req)) {
    return html("Clave incorrecta", "Agregale <code>?token=</code> con el valor de APP_TOKEN.", false);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return html("Falta el cliente de Google",
      "Cargá <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code> en Vercel y redesplegá.", false);
  }

  const origen = new URL(req.url).origin;
  return Response.redirect(urlDeConsentimiento(clientId, origen), 302);
}
