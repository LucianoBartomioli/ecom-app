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

    return Response.json({ ok: true, total: filas.length, filas });
  } catch (e) {
    return Response.json({ error: "Meta falló: " + e.message }, { status: 500 });
  }
}
