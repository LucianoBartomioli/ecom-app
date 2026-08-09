/**
 * Sube un archivo a Drive desde el navegador, usando la sesión que abrió
 * el servidor con las credenciales del dueño de la cuenta.
 *
 * Los bytes van directo del navegador a Google: el servidor no los toca.
 * Si la conexión se corta, retoma desde donde había quedado.
 */

import { planTrozos, siguienteByte, decidirSiguientePaso, esperaReintento, mensajeDeError, porcentaje } from "./drive-upload";

const TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN || "";
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Manda un tramo con XHR, que es lo único que reporta progreso de subida. */
function enviarTramo(sessionUrl, trozo, blob, total, onProgreso) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUrl, true);
    xhr.setRequestHeader("Content-Range", trozo.contentRange);
    xhr.upload.onprogress = (e) => {
      if (onProgreso && e.lengthComputable) onProgreso(trozo.inicio + e.loaded, total);
    };
    xhr.onload = () => resolve({ status: xhr.status, range: xhr.getResponseHeader("Range"), cuerpo: xhr.responseText });
    xhr.onerror = () => resolve({ status: 0, red: true });
    xhr.ontimeout = () => resolve({ status: 0, red: true });
    xhr.send(blob);
  });
}

/** Le pregunta a Google cuánto recibió, para retomar. */
async function consultarAvance(sessionUrl, total) {
  const r = await fetch(sessionUrl, {
    method: "PUT",
    headers: { "Content-Range": "bytes */" + total },
  });
  if (r.status === 200 || r.status === 201) return total;
  return siguienteByte(r.headers.get("Range"));
}

/**
 * @param file        el archivo elegido por el editor
 * @param contexto    { briefCode, briefTitulo, editorNombre }
 * @param onProgreso  (porcentaje, subido, total) => void
 */
export async function subirADrive(file, contexto, onProgreso) {
  const total = file.size;

  const inicio = await fetch("/api/drive/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-token": TOKEN },
    body: JSON.stringify({
      nombre: file.name,
      mimeType: file.type || "video/mp4",
      tamano: total,
      briefCode: contexto.briefCode,
      briefTitulo: contexto.briefTitulo,
      editorNombre: contexto.editorNombre,
    }),
  });
  const datos = await inicio.json();
  if (!inicio.ok || !datos.sessionUrl) throw new Error(datos.error || "No pude abrir la subida.");

  const avisar = (subido) => { if (onProgreso) onProgreso(porcentaje(subido, total), subido, total); };
  avisar(0);

  const trozos = planTrozos(total);
  let i = 0, intentos = 0, resultado = null;

  while (i < trozos.length) {
    const trozo = trozos[i];
    const blob = file.slice(trozo.inicio, trozo.fin);
    const r = await enviarTramo(datos.sessionUrl, trozo, blob, total, (subido) => avisar(subido));

    if (r.red) {
      // Se cayó la conexión: preguntamos hasta dónde llegó y seguimos.
      if (++intentos > 6) throw new Error("Se cortó la conexión y no pude retomar.");
      await dormir(esperaReintento(intentos));
      const hasta = await consultarAvance(datos.sessionUrl, total);
      if (hasta >= total) { resultado = null; i = trozos.length; break; }
      i = trozos.findIndex((x) => x.fin > hasta);
      if (i === -1) i = trozos.length;
      avisar(hasta);
      continue;
    }

    const paso = decidirSiguientePaso(r.status);
    if (paso === "continuar") { intentos = 0; i++; avisar(trozo.fin); continue; }
    if (paso === "terminado") {
      try { resultado = JSON.parse(r.cuerpo); } catch (e) { resultado = null; }
      avisar(total);
      break;
    }
    if (paso === "reintentar") {
      if (++intentos > 6) throw new Error("Google no responde. Probá de nuevo en un rato.");
      await dormir(esperaReintento(intentos));
      continue;
    }
    throw new Error(mensajeDeError(paso, r.status));
  }

  return {
    driveId: resultado ? resultado.id : null,
    url: resultado ? resultado.webViewLink : null,
    nombre: resultado ? resultado.name : file.name,
    ruta: datos.ruta,
    segundos: resultado && resultado.videoMediaMetadata && resultado.videoMediaMetadata.durationMillis
      ? Math.round(Number(resultado.videoMediaMetadata.durationMillis) / 1000)
      : null,
  };
}

/** Detecta si el despliegue tiene Drive configurado. */
export async function hayDriveConectado() {
  try {
    const r = await fetch("/api/drive?estado", { headers: { "x-app-token": TOKEN } });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.metodo;
  } catch (e) { return false; }
}
