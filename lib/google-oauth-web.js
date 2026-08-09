/**
 * Autorización de Google desde la propia app, sin terminal.
 * Partes puras, para poder testearlas.
 */

export const ALCANCE_DRIVE = "https://www.googleapis.com/auth/drive";

/** La dirección de vuelta tiene que coincidir EXACTO con la del cliente OAuth. */
export function urlDeVuelta(origen) {
  return String(origen || "").replace(/\/+$/, "") + "/api/google/callback";
}

export function urlDeConsentimiento(clientId, origen, estado) {
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: urlDeVuelta(origen),
    response_type: "code",
    scope: ALCANCE_DRIVE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  if (estado) p.set("state", estado);
  return "https://accounts.google.com/o/oauth2/v2/auth?" + p.toString();
}

/** Lee lo que Google manda de vuelta. */
export function leerVuelta(url) {
  const u = new URL(url, "http://localhost");
  const error = u.searchParams.get("error");
  if (error) return { error };
  const code = u.searchParams.get("code");
  return code ? { code, state: u.searchParams.get("state") } : { error: null, code: null };
}

/** Traduce los errores de Google a algo accionable. */
export function explicarErrorGoogle(codigo, detalle) {
  const texto = String(detalle || codigo || "");
  if (/redirect_uri_mismatch/i.test(texto)) {
    return "La dirección de vuelta no coincide. En la consola de Google, tu cliente OAuth tiene que ser de tipo " +
      "Aplicación web y tener registrada exactamente la URL que muestra esta página.";
  }
  if (/access_denied/i.test(texto)) {
    return "Cancelaste el permiso, o tu cuenta no figura como usuario de prueba en la pantalla de consentimiento.";
  }
  if (/invalid_client/i.test(texto)) {
    return "El client_id o el client_secret no coinciden con los cargados en Vercel.";
  }
  if (/unauthorized_client/i.test(texto)) {
    return "El cliente OAuth no está habilitado para este flujo. Revisá que sea de tipo Aplicación web.";
  }
  return "Google respondió: " + texto;
}

/** Página simple para mostrarle el resultado al usuario. */
export function pagina(titulo, cuerpo, ok) {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<body style="background:#0B0B0C;color:#EDEAE3;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px">
<div style="max-width:520px">
<div style="font-family:monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${ok ? "#E5001E" : "#7C7C85"};margin-bottom:10px">Render Room</div>
<h1 style="font-size:22px;margin:0 0 12px">${titulo}</h1>
<div style="color:#8A8A93;font-size:14px;line-height:1.65">${cuerpo}</div>
</div></body>`;
}
