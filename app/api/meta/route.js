/**
 * Meta Marketing API — sin librerías.
 *
 * GET /api/meta?desde=2026-08-01&hasta=2026-08-09
 *   Devuelve una fila por anuncio y por día, con los mismos nombres de campo
 *   que ya usa el importador de CSV de la app, así entra por el mismo lugar.
 */

const APP_TOKEN = process.env.APP_TOKEN || "";
const VERSION = process.env.META_API_VERSION || "v21.0";

function autorizado(req) {
  if (!APP_TOKEN) return true;
  if (req.headers.get("x-app-token") === APP_TOKEN) return true;
  // También por la barra de direcciones, para poder probar desde el navegador.
  try { return new URL(req.url).searchParams.get("token") === APP_TOKEN; }
  catch (e) { return false; }
}

const num = (v) => (isFinite(Number(v)) ? Number(v) : 0);

/**
 * Trae el nombre del ARCHIVO de video de cada anuncio.
 *
 * El nombre del anuncio lo escribe una persona y puede decir cualquier cosa.
 * El del archivo, en cambio, es el que puso la app al subirlo a Drive, y lleva
 * el código adentro. Cruzar por ahí es mucho más confiable.
 */
async function nombresDeVideo(cuenta, token) {
  const mapa = {};
  try {
    const qs = new URLSearchParams({
      fields: "id,name,creative{video_id,effective_object_story_id,object_story_spec}",
      limit: "500",
      access_token: token,
    });
    let url = "https://graph.facebook.com/" + VERSION + "/" + cuenta + "/ads?" + qs.toString();
    const anuncios = [];
    let vueltas = 0;
    while (url && vueltas < 10) {
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      if (j.error) return mapa;
      for (const a of j.data || []) anuncios.push(a);
      url = j.paging && j.paging.next ? j.paging.next : null;
      vueltas++;
    }

    // De cada anuncio sacamos el id del video, esté donde esté.
    const porVideo = {};
    for (const a of anuncios) {
      const c = a.creative || {};
      const spec = c.object_story_spec || {};
      const videoId = c.video_id
        || (spec.video_data && spec.video_data.video_id)
        || null;
      if (videoId) (porVideo[videoId] = porVideo[videoId] || []).push(a.id);
    }

    // Los nombres de los videos se piden de a tandas.
    const ids = Object.keys(porVideo);
    for (let i = 0; i < ids.length; i += 50) {
      const tanda = ids.slice(i, i + 50);
      const r = await fetch("https://graph.facebook.com/" + VERSION + "/?" + new URLSearchParams({
        ids: tanda.join(","), fields: "id,title,source", access_token: token,
      }).toString(), { cache: "no-store" });
      const j = await r.json();
      if (j.error) break;
      for (const videoId of tanda) {
        const v = j[videoId];
        if (!v) continue;
        // 'title' suele traer el nombre del archivo tal como se subió.
        const nombre = v.title || "";
        for (const adId of porVideo[videoId]) mapa[adId] = nombre;
      }
    }
  } catch (e) { /* si falla, seguimos con el nombre del anuncio */ }
  return mapa;
}

function primerValor(arr, tipos) {
  if (!Array.isArray(arr)) return 0;
  for (const tipo of tipos) {
    const hit = arr.find((a) => a.action_type === tipo);
    if (hit) return num(hit.value);
  }
  return 0;
}

export async function GET(req) {
  if (!autorizado(req)) return Response.json({ error: "Token inválido." }, { status: 401 });

  const cuenta = process.env.META_AD_ACCOUNT_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!cuenta || !token) {
    return Response.json({ error: "Falta META_AD_ACCOUNT_ID o META_ACCESS_TOKEN." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const campos = [
    "ad_id", "ad_name", "campaign_name", "adset_name", "date_start",
    "spend", "impressions", "reach", "inline_link_clicks", "clicks",
    "video_play_actions", "video_thruplay_watched_actions",
    "video_p25_watched_actions", "video_p50_watched_actions",
    "video_p75_watched_actions", "video_p100_watched_actions",
    "actions", "action_values",
  ].join(",");

  const params = new URLSearchParams({
    level: "ad",
    fields: campos,
    time_increment: "1",
    limit: "500",
    access_token: token,
  });
  if (desde && hasta) params.set("time_range", JSON.stringify({ since: desde, until: hasta }));
  else params.set("date_preset", searchParams.get("preset") || "last_30d");

  try {
    const mapaVideos = searchParams.get("sinVideos") ? {} : await nombresDeVideo(cuenta, token);

    let url = "https://graph.facebook.com/" + VERSION + "/" + cuenta + "/insights?" + params.toString();
    const filas = [];
    let vueltas = 0;

    while (url && vueltas < 20) {
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      if (j.error) return Response.json({ error: "Meta respondió: " + j.error.message }, { status: 502 });

      for (const d of j.data || []) {
        filas.push({
          adId: d.ad_id,
          adName: d.ad_name,
          // El nombre del archivo es lo que cruza con la entrega.
          videoName: mapaVideos[d.ad_id] || "",
          campana: d.campaign_name,
          conjunto: d.adset_name,
          date: d.date_start,
          spend: num(d.spend),
          impressions: num(d.impressions),
          reach: num(d.reach),
          clicks: num(d.inline_link_clicks || d.clicks),
          // Meta deprecó video_3_sec_watched_actions; video_play_actions es su reemplazo.
          plays3s: primerValor(d.video_play_actions, ["video_view"]),
          thruplays: primerValor(d.video_thruplay_watched_actions, ["video_view"]),
          p25: primerValor(d.video_p25_watched_actions, ["video_view"]),
          p100: primerValor(d.video_p100_watched_actions, ["video_view"]),
          purchases: primerValor(d.actions, ["purchase", "omni_purchase", "offsite_conversion.fb_pixel_purchase"]),
          revenue: primerValor(d.action_values, ["purchase", "omni_purchase", "offsite_conversion.fb_pixel_purchase"]),
          source: "api",
          importedAt: new Date().toISOString(),
        });
      }
      url = j.paging && j.paging.next ? j.paging.next : null;
      vueltas++;
    }

    const conVideo = filas.filter((f) => f.videoName).length;
    return Response.json({ ok: true, total: filas.length, conNombreDeVideo: conVideo, filas });
  } catch (e) {
    return Response.json({ error: "Meta falló: " + e.message }, { status: 500 });
  }
}
