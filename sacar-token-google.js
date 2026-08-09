#!/usr/bin/env node
/**
 * Saca el REFRESH TOKEN de Google Drive. Se corre una sola vez.
 *
 * No necesita instalar nada: solo Node 18 o superior.
 *
 *   1. Poné este archivo en la misma carpeta que el JSON que descargaste
 *      de la consola de Google (el que se llama client_secret_....json).
 *   2. node sacar-token-google.js
 *   3. Se abre una URL en la consola. Abrila, entrá con la cuenta DUEÑA
 *      de la carpeta de Drive y aceptá.
 *   4. El script imprime el refresh token.
 *
 * Usa el flujo de loopback (http://localhost:PUERTO), que es el que
 * corresponde a un cliente de tipo "Aplicación de escritorio".
 * El método viejo urn:ietf:wg:oauth:2.0:oob ya no funciona.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PUERTO = 53682;
const ALCANCE = "https://www.googleapis.com/auth/drive";

/* ---------- lectura de credenciales ---------- */

function buscarArchivoCredenciales(carpeta) {
  const archivos = fs.readdirSync(carpeta);
  return archivos.filter((f) => /^client_secret.*\.json$/i.test(f)).sort()[0] || null;
}

// Precargado con el cliente creado el 9/8/2026, por si el JSON no está al lado.
const RESPALDO = {
  client_id: "675488516040-890grk23oo1m21kvvjopfad9554iudlf.apps.googleusercontent.com",
  client_secret: "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",
};

function leerCredenciales(carpeta) {
  const nombre = buscarArchivoCredenciales(carpeta);
  if (!nombre) {
    return {
      archivo: "(valores precargados en el script)",
      clientId: RESPALDO.client_id,
      clientSecret: RESPALDO.client_secret,
      tokenUri: "https://oauth2.googleapis.com/token",
      authUri: "https://accounts.google.com/o/oauth2/auth",
      tipo: "escritorio",
    };
  }
  const json = JSON.parse(fs.readFileSync(path.join(carpeta, nombre), "utf8"));
  const c = json.installed || json.web;
  if (!c || !c.client_id || !c.client_secret) return null;
  return {
    archivo: nombre,
    clientId: c.client_id,
    clientSecret: c.client_secret,
    tokenUri: c.token_uri || "https://oauth2.googleapis.com/token",
    authUri: c.auth_uri || "https://accounts.google.com/o/oauth2/auth",
    tipo: json.installed ? "escritorio" : "web",
  };
}

/* ---------- armado de la URL de consentimiento ---------- */

function urlDeConsentimiento(cred, redirectUri) {
  const p = new URLSearchParams({
    client_id: cred.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ALCANCE,
    access_type: "offline",
    prompt: "consent",
  });
  return cred.authUri + "?" + p.toString();
}

/** Saca el código (o el error) de la URL con la que Google vuelve. */
function leerRespuesta(urlPedido) {
  const u = new URL(urlPedido, "http://localhost");
  const error = u.searchParams.get("error");
  if (error) return { error };
  const code = u.searchParams.get("code");
  return code ? { code } : { error: null, code: null };
}

/* ---------- intercambio por el token ---------- */

async function canjearCodigo(cred, code, redirectUri) {
  const r = await fetch(cred.tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cred.clientId,
      client_secret: cred.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error_description || j.error);
  if (!j.refresh_token) {
    throw new Error(
      "Google no devolvió refresh token. Suele pasar cuando ya autorizaste antes: " +
      "entrá a myaccount.google.com/permissions, quitale el acceso a esta app y volvé a correr el script."
    );
  }
  return j;
}

const PAGINA = (titulo, cuerpo) =>
  "<!doctype html><meta charset='utf-8'><body style=\"background:#0B0B0C;color:#EDEAE3;" +
  "font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0\">" +
  "<div style='text-align:center;max-width:420px;padding:24px'>" +
  "<h1 style='font-size:20px;margin:0 0 10px'>" + titulo + "</h1>" +
  "<p style='color:#8A8A93;font-size:14px;line-height:1.6'>" + cuerpo + "</p></div>";

/* ---------- programa ---------- */

async function principal() {
  const cred = leerCredenciales(process.cwd());
  if (!cred) {
    console.error("\n  No encontré el archivo de credenciales.");
    console.error("  Poné el client_secret_....json que bajaste de Google en esta misma carpeta.\n");
    process.exit(1);
  }

  const redirectUri = "http://localhost:" + PUERTO;
  console.log("\n  Credenciales leídas de: " + cred.archivo);
  console.log("  Tipo de cliente: " + cred.tipo);
  if (cred.tipo !== "escritorio") {
    console.log("\n  Ojo: este cliente es de tipo web. Para que funcione, agregá");
    console.log("  " + redirectUri + " como URI de redireccionamiento autorizado.");
  }
  console.log("\n  Abrí esta URL en el navegador y aceptá con la cuenta dueña de la carpeta:\n");
  console.log("  " + urlDeConsentimiento(cred, redirectUri) + "\n");
  console.log("  Esperando la respuesta de Google…\n");

  const servidor = http.createServer(async (req, res) => {
    if (req.url === "/favicon.ico") { res.writeHead(404); res.end(); return; }
    const resultado = leerRespuesta(req.url);

    if (resultado.error) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(PAGINA("No se pudo autorizar", "Google devolvió: " + resultado.error + ". Podés cerrar esta pestaña."));
      console.error("  Google devolvió un error: " + resultado.error + "\n");
      servidor.close();
      process.exit(1);
    }
    if (!resultado.code) { res.writeHead(204); res.end(); return; }

    try {
      const tokens = await canjearCodigo(cred, resultado.code, redirectUri);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(PAGINA("Listo", "El token quedó impreso en la consola. Ya podés cerrar esta pestaña."));

      console.log("  ════════════════════════════════════════════════════");
      console.log("  GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token);
      console.log("  ════════════════════════════════════════════════════\n");
      console.log("  Pegalo en Vercel, en Settings → Environment Variables.");
      console.log("  No lo mandes por chat ni por WhatsApp: con eso solo se entra a tu Drive.\n");
      servidor.close();
      process.exit(0);
    } catch (e) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(PAGINA("Falló el canje", e.message));
      console.error("\n  " + e.message + "\n");
      servidor.close();
      process.exit(1);
    }
  });

  servidor.listen(PUERTO, () => { });
  servidor.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error("  El puerto " + PUERTO + " está ocupado. Cerrá lo que lo esté usando y probá de nuevo.\n");
    } else console.error("  " + e.message + "\n");
    process.exit(1);
  });
}

if (require.main === module) principal();

module.exports = { buscarArchivoCredenciales, leerCredenciales, urlDeConsentimiento, leerRespuesta, ALCANCE, PUERTO };
