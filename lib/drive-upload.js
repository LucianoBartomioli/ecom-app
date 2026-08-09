/**
 * Subida a Drive con las credenciales del dueño de la cuenta.
 *
 * El editor no necesita cuenta de Google: el servidor se autentica como vos
 * y abre una "sesión reanudable". El navegador manda los bytes DIRECTO a
 * Google usando esa sesión, sin pasar por el servidor — que es obligatorio,
 * porque una función de Vercel no puede recibir un archivo de 200 MB ni
 * quedarse diez minutos esperando.
 *
 * Este archivo tiene solo las partes puras, para poder testearlas.
 */

/** Nombre de carpeta seguro para Drive. */
export function nombreCarpetaSegura(texto, respaldo) {
  const limpio = String(texto == null ? "" : texto)
    .replace(/[\\/\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return limpio || respaldo || "sin nombre";
}

/** La ruta donde tiene que caer cada entrega: brief y después editor. */
export function rutaDeCarpetas(brief, editor) {
  const carpetaBrief = brief && (brief.code || brief.title)
    ? nombreCarpetaSegura((brief.code ? brief.code + " — " : "") + (brief.title || ""), "brief")
    : "Sin brief";
  const carpetaEditor = nombreCarpetaSegura(editor && editor.name, "sin editor");
  return [carpetaBrief, carpetaEditor];
}

/** Consulta de Drive para encontrar una carpeta hija por nombre exacto. */
export function consultaCarpeta(nombre, parentId) {
  const escapado = String(nombre).replace(/'/g, "\\'");
  return "name = '" + escapado + "' and '" + parentId +
    "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
}

export const TAMANO_TROZO = 8 * 1024 * 1024; // múltiplo de 256 KB, como pide Google

/** Divide el archivo en tramos para poder reanudar si se corta la conexión. */
export function planTrozos(tamanoTotal, tamanoTrozo) {
  const paso = tamanoTrozo || TAMANO_TROZO;
  if (!(tamanoTotal > 0)) return [];
  const trozos = [];
  for (let inicio = 0; inicio < tamanoTotal; inicio += paso) {
    const fin = Math.min(inicio + paso, tamanoTotal);
    trozos.push({ inicio, fin, contentRange: "bytes " + inicio + "-" + (fin - 1) + "/" + tamanoTotal });
  }
  return trozos;
}

/**
 * Google contesta cuánto recibió con una cabecera Range: "bytes=0-1048575".
 * Devuelve desde qué byte hay que seguir.
 */
export function siguienteByte(cabeceraRange) {
  if (!cabeceraRange) return 0;
  const m = String(cabeceraRange).match(/bytes=0-(\d+)/);
  return m ? parseInt(m[1], 10) + 1 : 0;
}

/** Traduce el estado HTTP de un tramo a una decisión. */
export function decidirSiguientePaso(status) {
  if (status === 200 || status === 201) return "terminado";
  if (status === 308) return "continuar";
  if (status === 404) return "sesion_vencida";
  if (status === 401 || status === 403) return "sin_permiso";
  if (status >= 500 || status === 429) return "reintentar";
  return "error";
}

/** Espera creciente entre reintentos, con un tope. */
export function esperaReintento(intento) {
  return Math.min(1000 * Math.pow(2, Math.max(0, intento)), 16000);
}

/** Mensaje claro según lo que pasó. */
export function mensajeDeError(paso, detalle) {
  switch (paso) {
    case "sesion_vencida":
      return "La sesión de subida venció. Volvé a soltar el archivo.";
    case "sin_permiso":
      return "Google rechazó la subida por permisos. Revisá que la carpeta siga compartida con la app.";
    case "error":
      return "La subida falló" + (detalle ? ": " + detalle : ".");
    default:
      return "No se pudo completar la subida.";
  }
}

/** Progreso en porcentaje, sin pasarse ni dividir por cero. */
export function porcentaje(subido, total) {
  if (!(total > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round((subido / total) * 100)));
}
