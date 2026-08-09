/**
 * Google Drive — sin librerías, solo fetch contra la API REST.
 *
 * GET /api/drive?folderId=XXX
 *   Devuelve los videos de la carpeta con su duración real (Drive ya la guarda),
 *   quién los subió y en qué subcarpeta están. Esos dos últimos datos son los
 *   que permiten adjudicar cada video a su editor sin depender del nombre.
 *
 * POST /api/drive  { nombre, parentId }
 *   Crea una carpeta y devuelve su id y su link.
 */

import { accessToken, metodoConfigurado } from "../../../lib/google-auth";

// La firma del JWT necesita crypto de Node, así que esta ruta no va en edge.
export const runtime = "nodejs";

const APP_TOKEN = process.env.APP_TOKEN || "";
const ALCANCE = "https://www.googleapis.com/auth/drive";

function autorizado(req) {
  if (!APP_TOKEN) return true;
  if (req.headers.get("x-app-token") === APP_TOKEN) return true;
  // También por la barra de direcciones, para poder probar desde el navegador.
  try { return new URL(req.url).searchParams.get("token") === APP_TOKEN; }
  catch (e) { return false; }
}

const CAMPOS =
  "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink," +
  "videoMediaMetadata(durationMillis,width,height),owners(displayName,emailAddress)," +
  "lastModifyingUser(displayName,emailAddress),parents)";

export async function GET(req) {
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  if (searchParams.get("estado") != null) {
    const metodo = await metodoConfigurado();
    return Response.json({
      ok: true, metodo,
      carpetaRaiz: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
        ? String(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID).trim()
        : 'FALTA',
      carpetaRaizLimpia: String(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '').trim() === String(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || ''),
      conectar: metodo ? null : new URL(req.url).origin + '/api/google/auth?token=TU_APP_TOKEN',
    });
  }
  const folderId = searchParams.get("folderId");
  const recursivo = searchParams.get("recursivo") !== "0";
  if (!folderId) return Response.json({ error: "Falta folderId." }, { status: 400 });

  try {
    const token = await accessToken(ALCANCE);
    const archivos = [];

    async function leer(id, ruta, nivel) {
      if (nivel > 4) return;
      let pageToken = "";
      do {
        const qs = new URLSearchParams({
          q: "'" + id + "' in parents and trashed = false",
          fields: CAMPOS,
          pageSize: "200",
          supportsAllDrives: "true",
          includeItemsFromAllDrives: "true",
        });
        if (pageToken) qs.set("pageToken", pageToken);
        const r = await fetch("https://www.googleapis.com/drive/v3/files?" + qs.toString(), {
          headers: { Authorization: "Bearer " + token },
        });
        const j = await r.json();
        if (j.error) throw new Error(j.error.message);

        for (const f of j.files || []) {
          if (f.mimeType === "application/vnd.google-apps.folder") {
            if (recursivo) await leer(f.id, ruta ? ruta + "/" + f.name : f.name, nivel + 1);
            continue;
          }
          if (!/^video\//.test(f.mimeType || "")) continue;
          const ms = f.videoMediaMetadata && f.videoMediaMetadata.durationMillis;
          archivos.push({
            driveId: f.id,
            nombre: f.name,
            carpeta: ruta,
            url: f.webViewLink,
            segundos: ms ? Math.round(Number(ms) / 1000) : null,
            bytes: f.size ? Number(f.size) : null,
            subidoPor: f.owners && f.owners[0] ? f.owners[0].emailAddress : null,
            subidoPorNombre: f.owners && f.owners[0] ? f.owners[0].displayName : null,
            modificadoPor: f.lastModifyingUser ? f.lastModifyingUser.emailAddress : null,
            creado: f.createdTime,
          });
        }
        pageToken = j.nextPageToken || "";
      } while (pageToken);
    }

    await leer(folderId, "", 0);
    return Response.json({ ok: true, total: archivos.length, archivos });
  } catch (e) {
    return Response.json({ error: "Drive falló: " + e.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });
  try {
    const { nombre, parentId } = await req.json();
    if (!nombre) return Response.json({ error: "Falta el nombre." }, { status: 400 });
    const token = await accessToken(ALCANCE);
    const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink&supportsAllDrives=true", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nombre,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      }),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error.message);
    return Response.json({ ok: true, carpeta: j });
  } catch (e) {
    return Response.json({ error: "No pude crear la carpeta: " + e.message }, { status: 500 });
  }
}
