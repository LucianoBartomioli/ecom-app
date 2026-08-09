/**
 * POST /api/drive/rename   { archivos: [{ driveId, nombre }] }
 *
 * Renombra en Drive. Se usa después de guardar la entrega, cuando ya se
 * conoce el número de secuencia definitivo, para que el nombre del archivo
 * y el código que va al anuncio de Meta digan exactamente lo mismo.
 */

import { accessToken } from "../../../../lib/google-auth";

export const runtime = "nodejs";

const APP_TOKEN = process.env.APP_TOKEN || "";
const ALCANCE = "https://www.googleapis.com/auth/drive";

function autorizado(req) {
  if (!APP_TOKEN) return true;
  if (req.headers.get("x-app-token") === APP_TOKEN) return true;
  try { return new URL(req.url).searchParams.get("token") === APP_TOKEN; }
  catch (e) { return false; }
}

export async function POST(req) {
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });

  let cuerpo;
  try { cuerpo = await req.json(); }
  catch (e) { return Response.json({ error: "Cuerpo inválido." }, { status: 400 }); }

  const archivos = Array.isArray(cuerpo && cuerpo.archivos) ? cuerpo.archivos : [];
  if (!archivos.length) return Response.json({ error: "No llegó ningún archivo." }, { status: 400 });
  if (archivos.length > 60) return Response.json({ error: "Demasiados archivos de una vez." }, { status: 400 });

  try {
    const token = await accessToken(ALCANCE);
    const resultados = [];

    for (const a of archivos) {
      if (!a || !a.driveId || !a.nombre) { resultados.push({ ok: false, motivo: "faltan datos" }); continue; }
      const r = await fetch(
        "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(a.driveId) +
        "?fields=id,name,webViewLink&supportsAllDrives=true",
        {
          method: "PATCH",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ name: String(a.nombre).slice(0, 200) }),
        }
      );
      const j = await r.json();
      if (j.error) resultados.push({ ok: false, driveId: a.driveId, motivo: j.error.message });
      else resultados.push({ ok: true, driveId: j.id, nombre: j.name, url: j.webViewLink });
    }

    const fallidos = resultados.filter((x) => !x.ok).length;
    return Response.json({ ok: fallidos === 0, total: resultados.length, fallidos, resultados });
  } catch (e) {
    return Response.json({ error: "No pude renombrar: " + String(e.message || e) }, { status: 500 });
  }
}
