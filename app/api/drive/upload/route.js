/**
 * POST /api/drive/upload
 *
 * Abre una sesión de subida reanudable en TU Drive, con TUS credenciales.
 * El editor no necesita cuenta de Google: manda el archivo a la dirección
 * que devuelve esta ruta y los bytes viajan directo a Google.
 *
 * Cuerpo:
 *   { nombre, mimeType, tamano, briefCode, briefTitulo, editorNombre }
 *
 * Devuelve:
 *   { sessionUrl, carpetaId, ruta }
 */

import { accessToken } from "../../../../lib/google-auth";
import { rutaDeCarpetas, consultaCarpeta, nombreCarpetaSegura } from "../../../../lib/drive-upload";

export const runtime = "nodejs";

const APP_TOKEN = process.env.APP_TOKEN || "";
const RAIZ = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "";
const ALCANCE = "https://www.googleapis.com/auth/drive";
const MAX_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB por archivo

function autorizado(req) {
  if (!APP_TOKEN) return true;
  if (req.headers.get("x-app-token") === APP_TOKEN) return true;
  // También por la barra de direcciones, para poder probar desde el navegador.
  try { return new URL(req.url).searchParams.get("token") === APP_TOKEN; }
  catch (e) { return false; }
}

/** Busca la carpeta por nombre dentro del padre; si no está, la crea. */
async function asegurarCarpeta(token, nombre, parentId) {
  const qs = new URLSearchParams({
    q: consultaCarpeta(nombre, parentId),
    fields: "files(id,name)",
    pageSize: "1",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const r = await fetch("https://www.googleapis.com/drive/v3/files?" + qs.toString(), {
    headers: { Authorization: "Bearer " + token },
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  if (j.files && j.files[0]) return j.files[0].id;

  const c = await fetch("https://www.googleapis.com/drive/v3/files?fields=id&supportsAllDrives=true", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nombre,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  const cj = await c.json();
  if (cj.error) throw new Error(cj.error.message);
  return cj.id;
}

export async function POST(req) {
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });
  if (!RAIZ) {
    return Response.json(
      { error: "Falta GOOGLE_DRIVE_ROOT_FOLDER_ID: es el id de la carpeta donde se guarda todo." },
      { status: 500 }
    );
  }

  let cuerpo;
  try { cuerpo = await req.json(); }
  catch (e) { return Response.json({ error: "Cuerpo inválido." }, { status: 400 }); }

  const { nombre, mimeType, tamano, briefCode, briefTitulo, editorNombre } = cuerpo || {};
  if (!nombre) return Response.json({ error: "Falta el nombre del archivo." }, { status: 400 });
  if (!(Number(tamano) > 0)) return Response.json({ error: "Falta el tamaño del archivo." }, { status: 400 });
  if (Number(tamano) > MAX_BYTES) {
    return Response.json({ error: "El archivo supera los 5 GB." }, { status: 413 });
  }

  try {
    const token = await accessToken(ALCANCE);

    // Carpeta del brief, y adentro la del editor. Se crean si no existen.
    const [carpetaBrief, carpetaEditor] = rutaDeCarpetas(
      { code: briefCode, title: briefTitulo },
      { name: editorNombre }
    );
    const idBrief = await asegurarCarpeta(token, carpetaBrief, RAIZ);
    const idEditor = await asegurarCarpeta(token, carpetaEditor, idBrief);

    const inicio = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,webViewLink,videoMediaMetadata",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": mimeType || "video/mp4",
          "X-Upload-Content-Length": String(tamano),
          // Necesario para que Google habilite CORS en la sesión y el
          // navegador pueda subir directo.
          Origin: req.headers.get("origin") || "",
        },
        body: JSON.stringify({
          name: nombreCarpetaSegura(nombre, "video"),
          parents: [idEditor],
        }),
      }
    );

    if (!inicio.ok) {
      let detalle = inicio.status;
      try { detalle = (await inicio.json()).error.message; } catch (e) { /* sin json */ }
      return Response.json({ error: "Google rechazó la sesión: " + detalle }, { status: 502 });
    }

    const sessionUrl = inicio.headers.get("location") || inicio.headers.get("Location");
    if (!sessionUrl) {
      return Response.json({ error: "Google no devolvió la dirección de subida." }, { status: 502 });
    }

    return Response.json({
      ok: true,
      sessionUrl,
      carpetaId: idEditor,
      ruta: carpetaBrief + "/" + carpetaEditor,
    });
  } catch (e) {
    const msg = String(e.message || e);
    if (/storage quota|storageQuotaExceeded/i.test(msg)) {
      return Response.json(
        {
          error:
            "Una cuenta de servicio no tiene espacio propio en Drive. Para subir archivos usá el camino " +
            "de OAuth con tu cuenta, o mové la carpeta a una unidad compartida.",
        },
        { status: 500 }
      );
    }
    return Response.json({ error: "No pude abrir la subida: " + msg }, { status: 500 });
  }
}
