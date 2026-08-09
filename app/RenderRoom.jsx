import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ============================================================
   RENDER ROOM · sala de control de producción de creativos
   Negro / rojo. Admin (Lucho) + 4 editores.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.rr, .rr * { box-sizing: border-box; }
.rr {
  --void:#0B0B0C; --panel:#101012; --panel2:#16161A; --raise:#1D1D22;
  --line:#26262B; --line2:#33333A;
  --red:#E5001E; --red-dim:#8C0512; --red-glow:rgba(229,0,30,.16);
  --bone:#EDEAE3; --muted:#7C7C85; --dim:#55555E;
  --flow:#E5001E; --higgs:#8C0512; --heygen:#EDEAE3; --edicion:#4A4A52;
  font-family:'IBM Plex Sans',system-ui,sans-serif;
  background:var(--void); color:var(--bone);
  min-height:100vh; font-size:14px; line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.rr ::selection { background:var(--red); color:#fff; }
.rr h1,.rr h2,.rr h3 { font-family:'Archivo',sans-serif; font-weight:900; letter-spacing:-.02em; margin:0; }
.rr .mono { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; }
.rr button { font-family:inherit; cursor:pointer; }
.rr input,.rr select,.rr textarea { font-family:inherit; }
.rr :focus-visible { outline:2px solid var(--red); outline-offset:2px; }

/* ---- eyebrow / labels ---- */
.eyebrow { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.22em;
  text-transform:uppercase; color:var(--dim); }

/* ---- shell ---- */
.shell { display:flex; min-height:100vh; }
.rail { width:196px; flex:0 0 196px; border-right:1px solid var(--line); background:var(--panel);
  display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }
.brand { padding:20px 18px 16px; border-bottom:1px solid var(--line); }
.brand h1 { font-size:19px; line-height:1; }
.brand h1 em { font-style:normal; color:var(--red); }
.recdot { width:7px; height:7px; border-radius:50%; background:var(--red); display:inline-block;
  margin-right:7px; animation:pulse 2s infinite; vertical-align:middle; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.8)} }
.navlist { padding:10px 8px; flex:1; overflow:auto; }
.navitem { display:flex; align-items:center; gap:10px; width:100%; text-align:left;
  padding:9px 11px; background:none; border:0; color:var(--muted); border-radius:3px;
  font-size:13px; font-weight:500; position:relative; }
.navitem:hover { color:var(--bone); background:var(--panel2); }
.navitem.on { color:var(--bone); background:var(--panel2); }
.navitem.on::before { content:''; position:absolute; left:0; top:6px; bottom:6px; width:2px; background:var(--red); }
.navitem .badge { margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:10px;
  background:var(--red); color:#fff; padding:1px 5px; border-radius:2px; }
.railfoot { padding:12px; border-top:1px solid var(--line); font-size:11px; color:var(--dim); }
.main { flex:1; min-width:0; }
.topbar { display:flex; align-items:center; gap:14px; padding:14px 24px;
  border-bottom:1px solid var(--line); background:var(--panel); position:sticky; top:0; z-index:20; flex-wrap:wrap; }
.page { padding:24px; max-width:1280px; }
.pagehead { margin-bottom:20px; }
.pagehead h2 { font-size:26px; }
.pagehead p { color:var(--muted); margin:5px 0 0; font-size:13px; max-width:60ch; }

/* ---- cards ---- */
.card { background:var(--panel); border:1px solid var(--line); border-radius:4px; }
.card-h { padding:13px 16px; border-bottom:1px solid var(--line); display:flex;
  align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.card-b { padding:16px; }
.grid { display:grid; gap:14px; }

/* ---- stat ---- */
.stat { background:var(--panel); border:1px solid var(--line); border-radius:4px; padding:14px 16px; }
.stat .v { font-family:'IBM Plex Mono',monospace; font-size:27px; font-weight:600;
  letter-spacing:-.02em; line-height:1.1; margin-top:6px; font-variant-numeric:tabular-nums; }
.stat .v.red { color:var(--red); }
.stat .sub { font-size:11px; color:var(--dim); margin-top:4px; font-family:'IBM Plex Mono',monospace; }

/* ---- FILMSTRIP (elemento firma) ---- */
.strip { border:1px solid var(--line); border-radius:3px; background:var(--panel2); position:relative; padding:9px 0; }
.strip::before,.strip::after { content:''; position:absolute; left:0; right:0; height:9px;
  background-image:repeating-linear-gradient(90deg, var(--void) 0 5px, transparent 5px 13px);
  opacity:.85; }
.strip::before { top:0; } .strip::after { bottom:0; }
.strip-in { display:flex; align-items:flex-end; gap:2px; height:78px; padding:0 6px; }
.strip-day { flex:1; display:flex; flex-direction:column; justify-content:flex-end;
  height:100%; gap:1px; position:relative; min-width:4px; }
.strip-seg { width:100%; min-height:2px; border-radius:1px; }
.strip-day:hover .strip-seg { filter:brightness(1.45); }
.strip-goal { position:absolute; left:6px; right:6px; border-top:1px dashed var(--line2); pointer-events:none; }
.strip-axis { display:flex; justify-content:space-between; padding:6px 8px 0;
  font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:var(--dim); }

/* ---- table ---- */
.tbl { width:100%; border-collapse:collapse; font-size:13px; }
.tbl th { text-align:left; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em;
  text-transform:uppercase; color:var(--dim); font-weight:500; padding:9px 12px;
  border-bottom:1px solid var(--line); white-space:nowrap; }
.tbl td { padding:11px 12px; border-bottom:1px solid var(--line); vertical-align:middle; }
.tbl tr:last-child td { border-bottom:0; }
.tbl tbody tr:hover { background:var(--panel2); }
.num { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; text-align:right; }

/* ---- chips ---- */
.chip { display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono',monospace;
  font-size:10px; letter-spacing:.06em; text-transform:uppercase; padding:3px 7px;
  border-radius:2px; border:1px solid var(--line2); color:var(--muted); white-space:nowrap; }
.chip.work { border-color:var(--line2); color:var(--muted); }
.chip.done { border-color:var(--bone); color:var(--bone); }
.chip.wait { border-color:var(--red-dim); color:#E8837F; }
.chip.ok { background:var(--red); border-color:var(--red); color:#fff; }
.chip.bad { border-color:var(--red); color:var(--red);
  background:repeating-linear-gradient(45deg,transparent 0 4px,var(--red-glow) 4px 8px); }
.dot { width:7px; height:7px; border-radius:1px; display:inline-block; flex:0 0 7px; }

/* ---- controls ---- */
.btn { border:1px solid var(--line2); background:var(--panel2); color:var(--bone);
  padding:8px 13px; border-radius:3px; font-size:13px; font-weight:500; transition:.12s; }
.btn:hover { background:var(--raise); border-color:var(--muted); }
.btn.primary { background:var(--red); border-color:var(--red); color:#fff; font-weight:600; }
.btn.primary:hover { background:#FF1030; border-color:#FF1030; }
.btn.ghost { background:none; border-color:transparent; color:var(--muted); }
.btn.ghost:hover { color:var(--bone); background:var(--panel2); }
.btn.sm { padding:5px 9px; font-size:12px; }
.btn.danger { color:var(--red); border-color:var(--red-dim); background:none; }
.btn.danger:hover { background:var(--red-glow); }
.btn:disabled { opacity:.4; cursor:not-allowed; }
.inp, .sel, .ta { width:100%; background:var(--void); border:1px solid var(--line2); color:var(--bone);
  padding:8px 10px; border-radius:3px; font-size:13px; }
.inp:focus,.sel:focus,.ta:focus { border-color:var(--red); outline:none; }
.ta { resize:vertical; min-height:74px; line-height:1.55; }
.sel { appearance:none; background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);
  background-position:calc(100% - 15px) 52%, calc(100% - 10px) 52%; background-size:5px 5px,5px 5px; background-repeat:no-repeat; padding-right:30px; }
.lbl { display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em;
  text-transform:uppercase; color:var(--dim); margin-bottom:6px; }
.err { color:var(--red); font-size:11.5px; margin-top:5px; }
.hint { color:var(--dim); font-size:11.5px; margin-top:5px; }
.seg { display:inline-flex; border:1px solid var(--line2); border-radius:3px; overflow:hidden; }
.seg button { background:var(--panel2); border:0; border-right:1px solid var(--line2); color:var(--muted);
  padding:6px 11px; font-size:12px; }
.seg button:last-child { border-right:0; }
.seg button.on { background:var(--red); color:#fff; font-weight:600; }

/* ---- modal ---- */
.ov { position:fixed; inset:0; background:rgba(0,0,0,.82); z-index:100; display:flex;
  align-items:flex-start; justify-content:center; padding:36px 16px; overflow:auto; }
.modal { background:var(--panel); border:1px solid var(--line2); border-radius:5px;
  width:100%; max-width:600px; box-shadow:0 24px 70px rgba(0,0,0,.7); }
.modal.wide { max-width:940px; }
.modal-h { padding:16px 20px; border-bottom:1px solid var(--line); display:flex;
  align-items:center; justify-content:space-between; }
.modal-b { padding:20px; }
.modal-f { padding:14px 20px; border-top:1px solid var(--line); display:flex; gap:9px; justify-content:flex-end; }

/* ---- gate ---- */
.gate { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  background:radial-gradient(circle at 50% 0%, rgba(229,0,30,.09), transparent 62%), var(--void); }
.gatebox { width:100%; max-width:430px; }
.who { display:flex; align-items:center; gap:12px; width:100%; padding:12px 14px; margin-bottom:7px;
  background:var(--panel); border:1px solid var(--line); border-radius:3px; color:var(--bone); text-align:left; }
.who:hover { border-color:var(--red); background:var(--panel2); }
.who .av { width:34px; height:34px; border-radius:2px; background:var(--panel2); border:1px solid var(--line2);
  display:grid; place-items:center; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--muted); }
.who.admin .av { background:var(--red); border-color:var(--red); color:#fff; }

/* ---- misc ---- */
.empty { text-align:center; padding:44px 20px; color:var(--dim); }
.empty b { display:block; color:var(--bone); font-family:'Archivo',sans-serif; font-weight:800;
  font-size:16px; margin-bottom:6px; }
.bar { height:4px; background:var(--panel2); border-radius:2px; overflow:hidden; }
.barra { height:6px; background:var(--void); border-radius:3px; overflow:hidden; margin-top:10px; }
.barra i { display:block; height:100%; background:var(--red); transition:width .2s; }
.bar i { display:block; height:100%; background:var(--red); }
.note { border-left:2px solid var(--line2); padding:8px 0 8px 12px; margin-bottom:12px; }
.note.me { border-left-color:var(--red); }
.toast { position:fixed; bottom:18px; left:50%; transform:translateX(-50%); z-index:200;
  background:var(--raise); border:1px solid var(--line2); border-left:3px solid var(--red);
  padding:11px 17px; border-radius:3px; font-size:13px; box-shadow:0 10px 34px rgba(0,0,0,.6); }
.split { display:flex; gap:14px; flex-wrap:wrap; align-items:center; }
.rowlink { color:var(--red); text-decoration:none; border-bottom:1px solid transparent; }
.rowlink:hover { border-bottom-color:var(--red); }
.scroll { overflow-x:auto; }
.franja { background:var(--red); color:#fff; padding:10px 24px; font-size:13px; line-height:1.5; }
.franja b { display:block; font-family:'Archivo',sans-serif; font-weight:800; margin-bottom:2px; }
.franja span { opacity:.92; }
.aviso { border-left:3px solid var(--red); background:var(--red-glow); padding:9px 13px;
  border-radius:0 3px 3px 0; font-size:12.5px; margin-bottom:15px; }
.drop { border:1.5px dashed var(--line2); border-radius:4px; padding:26px 18px; text-align:center;
  cursor:pointer; background:var(--panel2); transition:.15s; }
.drop:hover, .drop[data-on="1"] { border-color:var(--red); background:var(--red-glow); }

@media (max-width:820px) {
  .shell { flex-direction:column; }
  .rail { width:100%; flex:none; height:auto; position:static; flex-direction:row; align-items:center;
    overflow-x:auto; border-right:0; border-bottom:1px solid var(--line); }
  .brand { border-bottom:0; border-right:1px solid var(--line); padding:12px 14px; white-space:nowrap; }
  .navlist { display:flex; padding:6px; gap:2px; }
  .navitem { white-space:nowrap; padding:8px 10px; }
  .navitem.on::before { top:auto; bottom:0; left:8px; right:8px; width:auto; height:2px; }
  .railfoot { display:none; }
  .page { padding:16px; }
  .topbar { padding:11px 16px; }
}
@media (prefers-reduced-motion:reduce) { .rr *,.rr *::before { animation:none !important; transition:none !important; } }
`;

/* ============================================================
   NÚCLEO  (idéntico al módulo testeado en core.js)
   ============================================================ */

const PLATFORMS = {
  flow: { id: "flow", label: "Flow", kind: "ia_clip", defaultWeight: 1, color: "var(--flow)", note: "Clips cortos de IA. Muchas regeneraciones por clip usable." },
  higgsfield: { id: "higgsfield", label: "Higgsfield", kind: "ia_clip", defaultWeight: 1, color: "var(--higgs)", note: "Clips cortos de IA. Muchas regeneraciones por clip usable." },
  heygen: { id: "heygen", label: "HeyGen", kind: "avatar_long", defaultWeight: 0.35, color: "var(--heygen)", note: "Render largo en una pasada. Menos esfuerzo por minuto." },
  edicion: { id: "edicion", label: "Edición", kind: "manual", defaultWeight: 0.6, color: "var(--edicion)", note: "Armado, subtítulos, mezcla, versionado." },
};
const PLATFORM_IDS = ["flow", "higgsfield", "heygen", "edicion"];

const DELIVERY_STATES = {
  en_curso: { id: "en_curso", label: "En curso", tone: "work" },
  entregado: { id: "entregado", label: "Entregado", tone: "done" },
  revision: { id: "revision", label: "En revisión", tone: "wait" },
  aprobado: { id: "aprobado", label: "Aprobado", tone: "ok" },
  rechazado: { id: "rechazado", label: "Rehacer", tone: "bad" },
};
const TRANSITIONS = {
  en_curso: { editor: ["entregado"], admin: ["entregado", "rechazado"] },
  entregado: { editor: ["en_curso"], admin: ["revision", "aprobado", "rechazado"] },
  revision: { editor: [], admin: ["aprobado", "rechazado", "entregado"] },
  aprobado: { editor: [], admin: ["revision"] },
  rechazado: { editor: ["en_curso", "entregado"], admin: ["aprobado", "en_curso"] },
};
/** Una entrega aprobada ya se pagó: el editor no puede reescribirle la duración. */
function canEditDelivery(delivery, identity) {
  if (!delivery) return { ok: true, campos: "todo" };
  if (!identity) return { ok: false, campos: "ninguno", motivo: "Sin identidad." };
  if (identity.role === "admin") return { ok: true, campos: "todo" };
  if (delivery.editorId !== identity.editorId) return { ok: false, campos: "ninguno", motivo: "Esta entrega es de otro editor." };
  if (delivery.status === "aprobado" || delivery.status === "revision") {
    return { ok: true, campos: "links",
      motivo: delivery.status === "aprobado"
        ? "Ya está aprobada: solo podés corregir los links."
        : "Está en revisión: solo podés corregir los links." };
  }
  return { ok: true, campos: "todo" };
}
const puedeEditarDuracion = (d, id) => canEditDelivery(d, id).campos === "todo";

/** Valida un rango de fechas antes de calcular nada. */
function validateRange(from, to) {
  const fmt = /^\d{4}-\d{2}-\d{2}$/;
  if (from && !fmt.test(from)) return { ok: false, error: "La fecha inicial no es válida." };
  if (to && !fmt.test(to)) return { ok: false, error: "La fecha final no es válida." };
  if (from && to && from > to) return { ok: false, invertido: true, error: "La fecha inicial es posterior a la final." };
  return { ok: true, dias: from && to ? Math.round((new Date(to + "T12:00:00") - new Date(from + "T12:00:00")) / 86400000) + 1 : null };
}

function canTransition(from, to, role) {
  const rule = TRANSITIONS[from];
  if (!rule) return false;
  return (role === "admin" ? rule.admin : rule.editor).indexOf(to) !== -1;
}

const DEFAULT_CONFIG = {
  editors: [
    { id: "ed1", name: "Editor 1", initials: "E1", pin: "1111", active: true },
    { id: "ed2", name: "Editor 2", initials: "E2", pin: "2222", active: true },
    { id: "ed3", name: "Editor 3", initials: "E3", pin: "3333", active: true },
    { id: "ed4", name: "Editor 4", initials: "E4", pin: "4444", active: true },
  ],
  adminName: "Lucho",
  adminPin: "0000",
  weights: { flow: 1, higgsfield: 1, heygen: 0.35, edicion: 0.6 },
  ratePerMin: 0,
  currency: "USD",
  driveRootUrl: "",
  backendUrl: "",
  dailyGoalMin: 12,
  variantSeconds: 5,
};

const uid = (p) => (p || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function todayISO(d) {
  const x = d ? new Date(d) : new Date();
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function addDays(iso, n) { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return todayISO(d); }
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function parseDuration(input) {
  if (input == null) return null;
  if (typeof input === "number") return isFinite(input) && input >= 0 ? Math.round(input) : null;
  let s = String(input).trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;
  if (s.indexOf(":") !== -1) {
    const parts = s.split(":");
    if (parts.length > 3) return null;
    let total = 0;
    for (let i = 0; i < parts.length; i++) { if (!/^\d+$/.test(parts[i])) return null; total = total * 60 + parseInt(parts[i], 10); }
    return total;
  }
  const hm = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s?)?$/);
  if (hm && (hm[1] || hm[2] || hm[3])) return Math.round(parseInt(hm[1] || "0", 10) * 3600 + parseInt(hm[2] || "0", 10) * 60 + parseFloat(hm[3] || "0"));
  return null;
}
function formatTimecode(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  const p = (n) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? p(h) + ":" + p(m) + ":" + p(ss) : p(m) + ":" + p(ss);
}
const fmtMin = (n) => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
const fmtInt = (n) => (Number(n) || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });
const fmtMoney = (n, c) => (c || "USD") + " " + (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v) => (v == null ? "—" : (v * 100).toFixed(1) + "%");

/** El dinero vive en centavos: sin esto la suma de 300 entregas deriva. */
function roundMoney(n) {
  const v = Number(n);
  if (!isFinite(v)) return 0;
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function weightOf(platform, weights) {
  const w = (weights || {})[platform];
  return typeof w === "number" && isFinite(w) && w >= 0 ? w : (PLATFORMS[platform] ? PLATFORMS[platform].defaultWeight : 1);
}
const COUNTS_FOR_PAY = ["entregado", "revision", "aprobado"];
const countsForPay = (d) => COUNTS_FOR_PAY.indexOf(d.status) !== -1;

/* --- Una pieza es UN video. Cada hook alternativo suma solo
       los segundos de hook que se rehicieron, no un video entero. --- */
const VARIANT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function variantLabel(i) {
  if (i < 26) return VARIANT_LETTERS[i];
  return VARIANT_LETTERS[Math.floor(i / 26) - 1] + VARIANT_LETTERS[i % 26];
}
const variantCount = (d) => (Array.isArray(d.variants) ? d.variants.length : 0);
function countedSeconds(d, variantSeconds) {
  const base = Number(d.seconds) || 0;
  const vs = typeof variantSeconds === "number" && isFinite(variantSeconds) && variantSeconds >= 0
    ? variantSeconds : DEFAULT_CONFIG.variantSeconds;
  return base + variantCount(d) * vs;
}
function fileSeconds(d) {
  return (Number(d.seconds) || 0) + (Array.isArray(d.variants) ? d.variants.reduce((a, v) => a + (Number(v.seconds) || 0), 0) : 0);
}
const rawMinutes = (d, vs) => countedSeconds(d, vs) / 60;
const weightedMinutes = (d, w, vs) => rawMinutes(d, vs) * weightOf(d.platform, w);

/* Cada variante es un anuncio distinto en Meta: se expande para el ranking. */
function expandCreatives(deliveries) {
  const out = [];
  (deliveries || []).forEach((d) => {
    const vs = Array.isArray(d.variants) ? d.variants : [];
    if (!vs.length) { out.push(d); return; }
    out.push({ ...d, code: d.code + "-A", title: d.title + " · hook A", parentId: d.id, id: d.id + ":A", variants: [] });
    vs.forEach((v, i) => {
      out.push({ ...d, id: d.id + ":" + variantLabel(i + 1), parentId: d.id,
        code: d.code + "-" + variantLabel(i + 1),
        title: (v.title || d.title) + " · hook " + variantLabel(i + 1),
        seconds: Number(v.seconds) || d.seconds, driveUrl: v.driveUrl || d.driveUrl, variants: [] });
    });
  });
  return out;
}

/* --- Lectura de nombres de archivo para la carga masiva --- */
const VARIANT_RX = /^(.*?)[\s_\-.]*(?:(?:hook|hk|v|ver|version|var|variante|opt|opcion|option)[\s_\-.]*)?([0-9]{1,2}|[a-hA-H])$/i;
const MARKER_RX = /[\s_\-.](?:hook|hk|v|ver|version|var|variante|opt|opcion|option)[\s_\-.]*[0-9a-hA-H]{1,2}$/i;
function parseFileMeta(filename) {
  const name = String(filename || "");
  const stem = name.replace(/\.[a-z0-9]{2,5}$/i, "");
  const hadMarker = MARKER_RX.test(stem);
  const m = stem.match(VARIANT_RX);
  const gap = m ? stem.slice(m[1].length, stem.length - m[2].length) : "";
  let base = stem, token = null;
  if (m && (hadMarker || (gap.length > 0 && /^[\s_\-.]+$/.test(gap)))) { base = m[1] || stem; token = m[2]; }
  return { fileName: name, stem, base: base.trim() || stem, token, hadMarker,
    order: token == null ? 0 : (/^\d+$/.test(token) ? parseInt(token, 10) : token.toUpperCase().charCodeAt(0) - 64),
    title: (base.trim() || stem).replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim() };
}
function groupFilesByHook(files) {
  const metas = (files || []).map((f) => {
    const meta = parseFileMeta(typeof f === "string" ? f : f.name);
    return { ...meta, seconds: typeof f === "object" && f ? Number(f.seconds) || 0 : 0, file: f };
  });
  const buckets = {}, order = [];
  metas.forEach((m) => {
    const key = norm(m.base) || norm(m.stem);
    if (!buckets[key]) { buckets[key] = []; order.push(key); }
    buckets[key].push(m);
  });
  const groups = [];
  order.forEach((k) => {
    const list = buckets[k];
    if (list.length === 1 && list[0].token != null && !list[0].hadMarker) {
      groups.push({ key: k, base: list[0].stem, title: list[0].stem.replace(/[_\-.]+/g, " ").trim(),
        files: [{ ...list[0], base: list[0].stem, token: null }] });
      return;
    }
    list.sort((a, b) => (a.order - b.order) || a.fileName.localeCompare(b.fileName));
    groups.push({ key: k, base: list[0].base, title: list[0].title, files: list });
  });
  return groups;
}


/* ---------- duración leída del contenedor ----------
   El <video> del navegador solo mide lo que sabe reproducir: falla con
   ProRes, DNxHD, HEVC y Matroska. La duración, en cambio, vive en la
   cabecera del contenedor y se puede leer sin decodificar un solo frame.
   Estas funciones piden rangos de bytes, así que da igual si el archivo
   pesa 4 GB: leen unos cientos de bytes. */

const u32 = (b, o) => ((b[o] << 24) >>> 0) + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3];
const u64 = (b, o) => u32(b, o) * 4294967296 + u32(b, o + 4);
const fourcc = (b, o) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);

/** MP4, MOV, M4V — ISO Base Media File Format: átomo moov → mvhd. */
async function readIsoBmffDuration(readRange, fileSize) {
  let pos = 0, saltos = 0;
  while (pos < fileSize && saltos < 200) {
    saltos++;
    const head = await readRange(pos, Math.min(pos + 16, fileSize));
    if (!head || head.length < 8) return null;
    let size = u32(head, 0), headerSize = 8;
    const type = fourcc(head, 4);
    if (size === 1) {
      if (head.length < 16) return null;
      size = u64(head, 8); headerSize = 16;
    } else if (size === 0) size = fileSize - pos;
    if (size < headerSize) return null;

    if (type === "moov") {
      const fin = Math.min(pos + size, fileSize);
      let c = pos + headerSize, vueltas = 0;
      while (c < fin && vueltas < 200) {
        vueltas++;
        const ch = await readRange(c, Math.min(c + 16, fin));
        if (!ch || ch.length < 8) return null;
        let cs = u32(ch, 0), chs = 8;
        const ct = fourcc(ch, 4);
        if (cs === 1) { cs = u64(ch, 8); chs = 16; }
        else if (cs === 0) cs = fin - c;
        if (ct === "mvhd") {
          const body = await readRange(c + chs, Math.min(c + chs + 32, fin));
          if (!body || body.length < 20) return null;
          if (body[0] === 1) {
            if (body.length < 32) return null;
            const ts = u32(body, 20), dur = u64(body, 24);
            return ts > 0 ? dur / ts : null;
          }
          const ts = u32(body, 12), dur = u32(body, 16);
          return ts > 0 ? dur / ts : null;
        }
        if (cs < 8) return null;
        c += cs;
      }
      return null;
    }
    pos += size;
  }
  return null;
}

/** Lee un entero de longitud variable de EBML. marcador=true conserva el bit guía (para los IDs). */
function readVint(b, o, conMarcador) {
  if (o >= b.length) return null;
  const primero = b[o];
  if (primero === 0) return null;
  let largo = 1, mascara = 0x80;
  while (largo <= 8 && !(primero & mascara)) { mascara >>= 1; largo++; }
  if (largo > 8 || o + largo > b.length) return null;
  let valor = conMarcador ? primero : primero & (mascara - 1);
  let todoUnos = (primero & (mascara - 1)) === mascara - 1;
  for (let i = 1; i < largo; i++) {
    valor = valor * 256 + b[o + i];
    if (b[o + i] !== 0xff) todoUnos = false;
  }
  return { valor, largo, desconocido: !conMarcador && todoUnos };
}

/** WebM y MKV — EBML: Segment → Info → Duration × TimecodeScale. */
async function readMatroskaDuration(readRange, fileSize) {
  const buscar = async (inicio, fin, idBuscado, profundidad) => {
    let pos = inicio, vueltas = 0;
    while (pos < fin && vueltas < 400) {
      vueltas++;
      const cab = await readRange(pos, Math.min(pos + 16, fin));
      if (!cab || cab.length < 2) return null;
      const id = readVint(cab, 0, true);
      if (!id) return null;
      const tam = readVint(cab, id.largo, false);
      if (!tam) return null;
      const cuerpo = pos + id.largo + tam.largo;
      const largoCuerpo = tam.desconocido ? fin - cuerpo : tam.valor;
      if (id.valor === idBuscado) return { inicio: cuerpo, fin: Math.min(cuerpo + largoCuerpo, fin) };
      pos = cuerpo + largoCuerpo;
      if (largoCuerpo <= 0) return null;
    }
    return null;
  };

  const segmento = await buscar(0, fileSize, 0x18538067);
  if (!segmento) return null;
  const info = await buscar(segmento.inicio, segmento.fin, 0x1549a966);
  if (!info) return null;

  let escala = 1000000, duracion = null;
  let pos = info.inicio, vueltas = 0;
  while (pos < info.fin && vueltas < 200) {
    vueltas++;
    const cab = await readRange(pos, Math.min(pos + 16, info.fin));
    if (!cab || cab.length < 2) break;
    const id = readVint(cab, 0, true);
    if (!id) break;
    const tam = readVint(cab, id.largo, false);
    if (!tam) break;
    const cuerpo = pos + id.largo + tam.largo;
    const datos = await readRange(cuerpo, Math.min(cuerpo + tam.valor, info.fin));
    if (id.valor === 0x2ad7b1 && datos && datos.length) {
      let v = 0; for (let i = 0; i < datos.length; i++) v = v * 256 + datos[i];
      if (v > 0) escala = v;
    }
    if (id.valor === 0x4489 && datos) {
      const dv = new DataView(datos.buffer, datos.byteOffset, datos.byteLength);
      if (datos.length === 4) duracion = dv.getFloat32(0);
      else if (datos.length === 8) duracion = dv.getFloat64(0);
    }
    pos = cuerpo + tam.valor;
  }
  return duracion != null ? (duracion * escala) / 1e9 : null;
}

/** Por qué pudo fallar, según la extensión. */
function motivoIlegible(nombre) {
  const ext = String(nombre || "").toLowerCase().split(".").pop();
  if (["avi", "wmv", "flv", "mpg", "mpeg", "ts", "m2ts"].indexOf(ext) !== -1) {
    return "el formato ." + ext + " no guarda la duración donde puedo leerla";
  }
  return "el archivo puede estar incompleto o cortado";
}

/**
 * Duración de un archivo, con dos caminos.
 * Primero el reproductor, que es instantáneo cuando el códec es conocido.
 * Si falla — ProRes, HEVC, DNxHD, MKV — se lee la cabecera del contenedor,
 * que trae la duración sin necesidad de decodificar nada.
 */
async function medirDuracion(file) {
  const porReproductor = await readVideoDuration(file);
  if (porReproductor) return { seconds: porReproductor, via: "reproductor" };

  const leerRango = async (a, b) => {
    const trozo = file.slice(Math.max(0, a), Math.min(file.size, b));
    return new Uint8Array(await trozo.arrayBuffer());
  };
  try {
    const iso = await readIsoBmffDuration(leerRango, file.size);
    if (iso && isFinite(iso) && iso > 0) return { seconds: Math.round(iso), via: "contenedor" };
  } catch (e) { /* seguimos probando */ }
  try {
    const mk = await readMatroskaDuration(leerRango, file.size);
    if (mk && isFinite(mk) && mk > 0) return { seconds: Math.round(mk), via: "contenedor" };
  } catch (e) { /* nada más que probar */ }
  return { seconds: null, via: null, motivo: motivoIlegible(file.name) };
}

/* ============================================================
   SUBIDA A DRIVE
   El servidor abre la sesión con las credenciales del dueño y el
   navegador manda los bytes directo a Google. Si no hay servidor
   (por ejemplo corriendo como artefacto suelto), todo esto queda
   apagado y la app sigue funcionando como antes.
   ============================================================ */

const RR_API = () => (typeof window !== "undefined" && window.RR_API ? window.RR_API : null);
const TAMANO_TROZO = 8 * 1024 * 1024;

function planTrozos(total, tamanoTrozo) {
  const paso = tamanoTrozo || TAMANO_TROZO;
  if (!(total > 0)) return [];
  const out = [];
  for (let inicio = 0; inicio < total; inicio += paso) {
    const fin = Math.min(inicio + paso, total);
    out.push({ inicio, fin, contentRange: "bytes " + inicio + "-" + (fin - 1) + "/" + total });
  }
  return out;
}
function siguienteByte(cabecera) {
  const m = String(cabecera || "").match(/bytes=0-(\d+)/);
  return m ? parseInt(m[1], 10) + 1 : 0;
}
function decidirSiguientePaso(status) {
  if (status === 200 || status === 201) return "terminado";
  if (status === 308) return "continuar";
  if (status === 404) return "sesion_vencida";
  if (status === 401 || status === 403) return "sin_permiso";
  if (status >= 500 || status === 429) return "reintentar";
  return "error";
}
const esperaReintento = (i) => Math.min(1000 * Math.pow(2, Math.max(0, i)), 16000);
const porcentaje = (subido, total) => (total > 0 ? Math.max(0, Math.min(100, Math.round((subido / total) * 100))) : 0);
function mensajeDeSubida(paso, detalle) {
  if (paso === "sesion_vencida") return "La sesión de subida venció. Soltá el archivo de nuevo.";
  if (paso === "sin_permiso") return "Google rechazó la subida. Revisá que la carpeta siga compartida con la app.";
  return "La subida falló" + (detalle ? " (" + detalle + ")." : ".");
}

let _driveEstado = null;
async function driveDisponible() {
  if (_driveEstado !== null) return _driveEstado;
  const api = RR_API();
  if (!api) { _driveEstado = false; return false; }
  try {
    const r = await fetch("/api/drive?estado", { headers: { "x-app-token": api.token } });
    if (!r.ok) { _driveEstado = false; return false; }
    const j = await r.json();
    _driveEstado = !!j.metodo;
  } catch (e) { _driveEstado = false; }
  return _driveEstado;
}

function enviarTramo(sessionUrl, trozo, blob, total, onProgreso) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUrl, true);
    xhr.setRequestHeader("Content-Range", trozo.contentRange);
    xhr.upload.onprogress = (e) => {
      if (onProgreso && e.lengthComputable) onProgreso(trozo.inicio + e.loaded);
    };
    xhr.onload = () => resolve({ status: xhr.status, range: xhr.getResponseHeader("Range"), cuerpo: xhr.responseText });
    xhr.onerror = () => resolve({ status: 0, red: true });
    xhr.ontimeout = () => resolve({ status: 0, red: true });
    xhr.send(blob);
  });
}

/** Sube un archivo y devuelve { driveId, url, nombre, ruta, segundos }. */
async function subirADrive(file, contexto, onProgreso) {
  const api = RR_API();
  if (!api) throw new Error("Esta copia no tiene Drive conectado.");
  const total = file.size;
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

  const inicio = await fetch("/api/drive/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-token": api.token },
    body: JSON.stringify({
      nombre: contexto.nombreFinal || file.name,
      mimeType: file.type || "application/octet-stream", tamano: total,
      briefCode: contexto.briefCode, briefTitulo: contexto.briefTitulo, editorNombre: contexto.editorNombre,
    }),
  });
  let datos = {};
  try { datos = await inicio.json(); } catch (e) { /* sin json */ }
  if (!inicio.ok || !datos.sessionUrl) throw new Error(datos.error || "No pude abrir la subida.");

  const avisar = (subido) => { if (onProgreso) onProgreso(porcentaje(subido, total), subido, total); };
  avisar(0);

  const trozos = planTrozos(total);
  let i = 0, intentos = 0, resultado = null;
  while (i < trozos.length) {
    const trozo = trozos[i];
    const r = await enviarTramo(datos.sessionUrl, trozo, file.slice(trozo.inicio, trozo.fin), total, avisar);
    if (r.red) {
      if (++intentos > 6) throw new Error("Se cortó la conexión y no pude retomar.");
      await dormir(esperaReintento(intentos));
      const sondeo = await fetch(datos.sessionUrl, { method: "PUT", headers: { "Content-Range": "bytes */" + total } });
      const hasta = sondeo.status === 200 || sondeo.status === 201 ? total : siguienteByte(sondeo.headers.get("Range"));
      if (hasta >= total) break;
      const idx = trozos.findIndex((x) => x.fin > hasta);
      i = idx === -1 ? trozos.length : idx;
      avisar(hasta);
      continue;
    }
    const paso = decidirSiguientePaso(r.status);
    if (paso === "continuar") { intentos = 0; i++; avisar(trozo.fin); continue; }
    if (paso === "terminado") { try { resultado = JSON.parse(r.cuerpo); } catch (e) { resultado = null; } avisar(total); break; }
    if (paso === "reintentar") {
      if (++intentos > 6) throw new Error("Google no responde. Probá de nuevo en un rato.");
      await dormir(esperaReintento(intentos));
      continue;
    }
    throw new Error(mensajeDeSubida(paso, r.status));
  }

  const meta = resultado && resultado.videoMediaMetadata;
  return {
    driveId: resultado ? resultado.id : null,
    url: resultado ? resultado.webViewLink : null,
    nombre: resultado ? resultado.name : file.name,
    ruta: datos.ruta,
    segundos: meta && meta.durationMillis ? Math.round(Number(meta.durationMillis) / 1000) : null,
  };
}

/** Vista previa de Drive, que sirve igual para PDF y para video. */
const previewDrive = (driveId) => "https://drive.google.com/file/d/" + driveId + "/preview";

/* --- Duración real del archivo, leída en el navegador --- */
function readVideoDuration(file) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      let done = false;
      const finish = (secs) => { if (done) return; done = true; try { URL.revokeObjectURL(url); } catch (e) { } resolve(secs); };
      const to = setTimeout(() => finish(null), 10000);
      v.onloadedmetadata = () => {
        if (!isFinite(v.duration) || isNaN(v.duration)) {
          v.ontimeupdate = () => { v.ontimeupdate = null; clearTimeout(to);
            finish(isFinite(v.duration) && v.duration > 0 ? Math.round(v.duration) : null); };
          v.currentTime = 1e101;
        } else { clearTimeout(to); finish(v.duration > 0 ? Math.round(v.duration) : null); }
      };
      v.onerror = () => { clearTimeout(to); finish(null); };
      v.src = url;
    } catch (e) { resolve(null); }
  });
}
function inRange(dateISO, from, to) {
  if (!dateISO) return false;
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}
function productionByEditor(deliveries, opts) {
  const o = opts || {}, weights = o.weights || DEFAULT_CONFIG.weights, out = {};
  const ensure = (id) => { if (!out[id]) out[id] = { editorId: id, raw: 0, weighted: 0, clips: 0, variants: 0, pay: 0, byPlatform: {} }; return out[id]; };
  (o.editors || []).forEach((e) => ensure(e.id));
  (deliveries || []).forEach((d) => {
    if (!countsForPay(d) || !inRange(d.date, o.from, o.to)) return;
    if (o.briefId && d.briefId !== o.briefId) return;
    const e = ensure(d.editorId), r = rawMinutes(d, o.variantSeconds), w = r * weightOf(d.platform, weights);
    const nv = variantCount(d);
    e.raw += r; e.weighted += w; e.clips += 1; e.variants += nv;
    if (!e.byPlatform[d.platform]) e.byPlatform[d.platform] = { raw: 0, weighted: 0, clips: 0, variants: 0 };
    const p = e.byPlatform[d.platform]; p.raw += r; p.weighted += w; p.clips += 1; p.variants += nv;
  });
  const rate = Number(o.ratePerMin) || 0;
  Object.keys(out).forEach((k) => { out[k].pay = roundMoney(out[k].weighted * rate); });
  return out;
}
function dailySeries(deliveries, opts) {
  const o = opts || {}, days = o.days || 14, end = o.to || todayISO(), weights = o.weights || DEFAULT_CONFIG.weights;
  const series = [];
  for (let i = days - 1; i >= 0; i--) series.push({ date: addDays(end, -i), raw: 0, weighted: 0, clips: 0, byPlatform: {} });
  const index = {}; series.forEach((s, i) => { index[s.date] = i; });
  (deliveries || []).forEach((d) => {
    if (!countsForPay(d)) return;
    if (o.editorId && d.editorId !== o.editorId) return;
    const i = index[d.date]; if (i === undefined) return;
    const r = rawMinutes(d, o.variantSeconds), w = r * weightOf(d.platform, weights);
    series[i].raw += r; series[i].weighted += w; series[i].clips += 1;
    series[i].byPlatform[d.platform] = (series[i].byPlatform[d.platform] || 0) + w;
  });
  return series;
}
/**
 * Objetivo del período: el diario por editor, por la cantidad de editores
 * que se están viendo, por los días del rango.
 */
function periodGoal(dailyGoalMin, editorsCount, days) {
  const g = Number(dailyGoalMin) || 0;
  return g * Math.max(1, Number(editorsCount) || 1) * Math.max(1, Number(days) || 1);
}

/** Compara lo hecho contra lo pedido y lo dice en castellano. */
function goalStatus(hecho, objetivo) {
  const o = Number(objetivo) || 0;
  if (o <= 0) return { pct: null, label: 'sin objetivo definido', cumplido: null };
  const pct = (Number(hecho) || 0) / o;
  const p = Math.round(pct * 100);
  if (pct >= 1) return { pct, label: p + '% del objetivo · cumplido', cumplido: true };
  return { pct, label: p + '% del objetivo · faltan ' + (Math.round((o - hecho) * 100) / 100) + ' min', cumplido: false };
}

function briefProgress(brief, deliveries) {
  const list = live(deliveries).filter((d) => d.briefId === brief.id);
  const approved = list.filter((d) => d.status === "aprobado").length;
  const delivered = list.filter((d) => d.status === "entregado" || d.status === "revision").length;
  const wip = list.filter((d) => d.status === "en_curso").length;
  const redo = list.filter((d) => d.status === "rechazado").length;
  const target = Number(brief.targetVideos) || 0, done = approved + delivered;
  return { approved, delivered, wip, redo, target, done, total: list.length,
    pct: target > 0 ? clamp(Math.round((done / target) * 100), 0, 100) : (list.length ? 100 : 0),
    complete: target > 0 ? approved >= target : false };
}
function briefState(brief, deliveries) {
  const p = briefProgress(brief, deliveries);
  if (brief.archived) return "archivado";
  if (p.complete) return "completo";
  if (p.total > 0) return "en_curso";
  return "abierto";
}
const slugCode = (s, len) => (norm(s).toUpperCase().slice(0, len || 4) || "XXXX");
function deliveryCode(brief, editor, seq, platform) {
  const b = brief ? (brief.code || slugCode(brief.title, 4)) : "FREE";
  const e = editor ? (editor.initials || slugCode(editor.name, 3)) : "XX";
  const p = (PLATFORMS[platform] ? PLATFORMS[platform].label : platform || "").toUpperCase().slice(0, 4);
  return [b, e, String(seq).padStart(2, "0"), p].join("-");
}
/* La secuencia nunca se recicla: un código borrado puede seguir vivo en Meta. */
function nextSeq(deliveries, briefId, editorId) {
  const propias = (deliveries || []).filter((d) => d.briefId === briefId && d.editorId === editorId);
  let max = 0;
  propias.forEach((d) => {
    const n = Number(d.seq) || 0;
    if (n > max) max = n;
    const m = String(d.code || "").match(/-(\d{2,})-[A-Z]+$/);
    if (m) { const c = parseInt(m[1], 10); if (c > max) max = c; }
  });
  return Math.max(max, propias.length) + 1;
}

/** Asigna secuencia y código contra la lista real del momento de guardar. */
function assignCode(delivery, lista, briefs, config) {
  const brief = (briefs || []).filter((b) => b.id === delivery.briefId)[0] || null;
  const editor = ((config || {}).editors || []).filter((e) => e.id === delivery.editorId)[0] || null;
  const usados = {};
  (lista || []).forEach((d) => { if (d.id !== delivery.id && d.code) usados[d.code] = true; });
  let seq = nextSeq(lista, delivery.briefId, delivery.editorId);
  let code = deliveryCode(brief, editor, seq, delivery.platform);
  let vueltas = 0;
  while (usados[code] && vueltas < 500) { seq += 1; code = deliveryCode(brief, editor, seq, delivery.platform); vueltas++; }
  return { ...delivery, seq, code };
}
function assignCodes(nuevos, lista, briefs, config) {
  let acumulado = (lista || []).slice();
  return (nuevos || []).map((d) => {
    const conCodigo = assignCode(d, acumulado, briefs, config);
    acumulado = acumulado.concat([conCodigo]);
    return conCodigo;
  });
}

/** Qué puede tocar cada rol: el editor no escribe nada que afecte lo que cobra. */
function deliveryFieldPolicy(identity) {
  if (identity && identity.role === "admin") return { duracion: "libre", fecha: "libre", link: "libre" };
  return { duracion: "archivo", fecha: "auto", link: "oculto" };
}

/* ---------- nombre automático del archivo ---------- */
function slugTexto(t, largo) {
  const limpio = String(t == null ? "" : t)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return limpio.slice(0, largo || 28).replace(/-+$/, "");
}
function extensionDe(nombre) {
  const m = String(nombre || "").match(/\.([a-z0-9]{2,5})$/i);
  return m ? "." + m[1].toLowerCase() : ".mp4";
}
/** 2026-08-09_HGRA-MAR-03-FLOW-A_zombi-madrugadas.mp4 */
function nombreArchivo(opts) {
  const o = opts || {};
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(o.date || "") ? o.date : todayISO();
  const codigo = String(o.code || "SIN-CODIGO") + (o.letra ? "-" + o.letra : "");
  const avatar = slugTexto(o.avatar, 28);
  const partes = [fecha, codigo];
  if (avatar) partes.push(avatar);
  return partes.join("_") + extensionDe(o.fileName);
}
function nombresDePieza(delivery, opts) {
  const o = opts || {};
  const base = { date: delivery.date, code: delivery.code, avatar: delivery.avatar };
  const out = [{
    driveId: delivery.driveId || null,
    nombre: nombreArchivo({ ...base, letra: (delivery.variants || []).length ? "A" : "", fileName: delivery.fileName }),
  }];
  (delivery.variants || []).forEach((v, i) => {
    out.push({ driveId: v.driveId || null,
      nombre: nombreArchivo({ ...base, letra: variantLabel(i + 1), fileName: v.fileName }) });
  });
  return out.filter((x) => (o.soloConDrive ? x.driveId : true));
}

/** Le pide al servidor que ponga el nombre definitivo en Drive. */
async function renombrarEnDrive(archivos) {
  const api = RR_API();
  if (!api || !archivos.length) return { ok: false, omitido: true };
  try {
    const r = await fetch("/api/drive/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-app-token": api.token },
      body: JSON.stringify({ archivos }),
    });
    return await r.json();
  } catch (e) { return { ok: false, error: String(e.message || e) }; }
}

function validateDelivery(d, ctx) {
  const errs = {};
  if (!d.title || !String(d.title).trim()) errs.title = "Poné un nombre para el video.";
  if (!d.platform || !PLATFORMS[d.platform]) errs.platform = "Elegí la plataforma.";
  const secs = parseDuration(d.secondsInput != null ? d.secondsInput : d.seconds);
  if (secs == null) errs.seconds = "Duración inválida. Usá 90, 1:30 o 1m30s.";
  else if (secs <= 0) errs.seconds = "La duración tiene que ser mayor a cero.";
  else if (secs > 3600 * 4) errs.seconds = "Más de 4 horas no parece un entregable.";
  if (d.driveUrl && !/^https?:\/\//i.test(String(d.driveUrl).trim())) errs.driveUrl = "El link tiene que empezar con https://";
  if (ctx && ctx.requireFileDuration && d.durationSource !== "file") {
    errs.seconds = "La duración tiene que salir del archivo. Soltá el video para que la lea.";
  }
  if (ctx && ctx.requiereAvatar && !(d.avatar && String(d.avatar).trim())) {
    errs.avatar = "Decí a qué avatar apunta este video.";
  }
  if (!d.date || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errs.date = "Fecha inválida.";
  else if (ctx && ctx.maxDate && d.date > ctx.maxDate) errs.date = "No se puede cargar una entrega a futuro.";
  return { ok: Object.keys(errs).length === 0, errors: errs, seconds: secs };
}
function validateBrief(b) {
  const errs = {};
  if (!b.title || !String(b.title).trim()) errs.title = "El brief necesita un título.";
  if (b.targetVideos != null && b.targetVideos !== "" && !(Number(b.targetVideos) >= 0)) errs.targetVideos = "Cantidad inválida.";
  if (!b.assignedTo || !b.assignedTo.length) errs.assignedTo = "Asigná al menos un editor.";
  return { ok: Object.keys(errs).length === 0, errors: errs };
}

/* --- Adjuntos: el almacenamiento admite ~5 MB por entrada
       y base64 infla un 37%, así que el techo real es 3,5 MB. --- */
const MAX_FILE_BYTES = 3.5 * 1024 * 1024;
function fmtBytes(n) {
  const b = Number(n) || 0;
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}
function validateAttachment(file, kind) {
  if (!file) return { ok: false, error: "No llegó ningún archivo." };
  const tipo = String(file.type || "");
  const libre = /_libre$/.test(String(kind));   // con Drive conectado no hay tope
  const base = String(kind).replace(/_libre$/, "");
  if (base === "pdf" && tipo.indexOf("pdf") === -1) return { ok: false, error: "Ese archivo no es un PDF." };
  if (base === "video" && tipo.indexOf("video") !== 0) return { ok: false, error: "Ese archivo no es un video." };
  if (!file.size) return { ok: false, error: "El archivo está vacío." };
  if (libre) {
    if (file.size > 5 * 1024 * 1024 * 1024) return { ok: false, tooBig: true, error: "El archivo supera los 5 GB." };
    return { ok: true };
  }
  if (file.size > MAX_FILE_BYTES) return { ok: false, tooBig: true,
    error: "Pesa " + fmtBytes(file.size) + " y sin Drive conectado el máximo es " + fmtBytes(MAX_FILE_BYTES) + "." };
  return { ok: true };
}
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("No pude leer el archivo."));
    r.readAsDataURL(file);
  });
}
function dataURLToBlobURL(dataURL) {
  try {
    const [head, b64] = String(dataURL).split(",");
    const mime = (head.match(/:(.*?);/) || [])[1] || "application/octet-stream";
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: mime }));
  } catch (e) { return null; }
}
function adMetrics(row) {
  const imp = Number(row.impressions) || 0, plays3 = Number(row.plays3s) || 0, thru = Number(row.thruplays) || 0;
  const clicks = Number(row.clicks) || 0, spend = Number(row.spend) || 0;
  const purchases = Number(row.purchases) || 0, revenue = Number(row.revenue) || 0;
  const div = (a, b) => (b > 0 ? a / b : null);
  return { impressions: imp, spend, purchases, revenue, clicks, plays3s: plays3, thruplays: thru,
    hookRate: div(plays3, imp), holdRate: div(thru, imp), retention: div(thru, plays3), ctr: div(clicks, imp),
    cpm: imp > 0 ? (spend / imp) * 1000 : null, cpc: div(spend, clicks), cpa: div(spend, purchases), roas: div(revenue, spend) };
}
function aggregateMetrics(rows) {
  const b = { impressions: 0, spend: 0, purchases: 0, revenue: 0, clicks: 0, plays3s: 0, thruplays: 0 };
  (rows || []).forEach((r) => { b.impressions += +r.impressions || 0; b.spend += +r.spend || 0; b.purchases += +r.purchases || 0;
    b.revenue += +r.revenue || 0; b.clicks += +r.clicks || 0; b.plays3s += +r.plays3s || 0; b.thruplays += +r.thruplays || 0; });
  return adMetrics(b);
}
function rankCreatives(deliveries, metaRows, opts) {
  const o = opts || {}, byKey = {};
  (metaRows || []).forEach((r) => {
    [norm(r.deliveryId), norm(r.code), norm(r.adName)].filter(Boolean).forEach((k) => { (byKey[k] = byKey[k] || []).push(r); });
  });
  const used = {};
  const rows = (deliveries || []).map((d) => {
    let matched = [];
    const cands = [norm(d.id), norm(d.code), norm(d.title), norm(d.adName)].filter(Boolean);
    for (let i = 0; i < cands.length; i++) if (byKey[cands[i]]) { matched = byKey[cands[i]]; used[cands[i]] = true; break; }
    if (!matched.length && d.code) {
      const c = norm(d.code);
      Object.keys(byKey).forEach((k) => { if (k.indexOf(c) !== -1) { matched = matched.concat(byKey[k]); used[k] = true; } });
    }
    return { delivery: d, rows: matched, metrics: matched.length ? aggregateMetrics(matched) : null };
  }).filter((r) => (o.onlyWithData ? r.metrics : true));
  const sortKey = o.sortBy || "hookRate";
  rows.sort((a, b) => {
    const av = a.metrics ? a.metrics[sortKey] : null, bv = b.metrics ? b.metrics[sortKey] : null;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return o.asc ? av - bv : bv - av;
  });
  const orphans = (metaRows || []).filter((r) => {
    const keys = [norm(r.deliveryId), norm(r.code), norm(r.adName)].filter(Boolean);
    return !keys.some((k) => used[k] || Object.keys(used).some((u) => k.indexOf(u) !== -1));
  });
  return { rows, orphans };
}
function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",;\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const csvRow = (arr) => (arr || []).map(csvCell).join(",");

function parseCSV(text) {
  const rows = []; let row = [], field = "", i = 0, inQ = false;
  const s = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  while (i < s.length) {
    const c = s[i];
    if (inQ) {
      if (c === '"') { if (s[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === "," || c === ";" || c === "\t") { row.push(field); field = ""; i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}
const META_COLUMN_MAP = [
  { key: "adName", match: ["adname", "nombredelanuncio", "anuncio", "nombreanuncio"] },
  { key: "date", match: ["day", "dia", "fecha", "reportingstarts", "iniciodelinforme", "comienzodelinforme"] },
  { key: "spend", match: ["amountspent", "amountspentusd", "importegastado", "importegastadousd", "gasto"] },
  { key: "impressions", match: ["impressions", "impresiones"] },
  { key: "plays3s", match: ["3secondvideoplays", "videoplays3s", "reproduccionesdevideode3segundos", "reproduccionesdevideode3segundo"] },
  { key: "thruplays", match: ["thruplays", "reproduccionesde15segundos", "thruplay"] },
  { key: "clicks", match: ["linkclicks", "clicsenelenlace", "clicsenelenlaceunicos", "clics"] },
  { key: "purchases", match: ["purchases", "compras", "websitepurchases", "comprasenelsitioweb"] },
  { key: "revenue", match: ["purchasesconversionvalue", "valordeconversiondecompras", "valordeconversion", "websitepurchasesconversionvalue"] },
  { key: "reach", match: ["reach", "alcance"] },
];
function mapMetaHeaders(headers) {
  const map = {}, unknown = [];
  (headers || []).forEach((h, idx) => {
    const n = norm(h); let hit = null;
    for (let i = 0; i < META_COLUMN_MAP.length; i++) if (META_COLUMN_MAP[i].match.indexOf(n) !== -1) { hit = META_COLUMN_MAP[i].key; break; }
    if (!hit) for (let i = 0; i < META_COLUMN_MAP.length; i++) {
      const m = META_COLUMN_MAP[i];
      // El encabezado debe EMPEZAR con la clave conocida; el camino inverso
      // exige un encabezado largo, si no una columna "nombre" se toma por el anuncio.
      if (m.match.some((x) => n.indexOf(x) === 0 || (x.indexOf(n) === 0 && n.length >= 10))) { hit = m.key; break; }
    }
    if (hit && map[hit] === undefined) map[hit] = idx;
    else if (!hit) unknown.push(h);
  });
  return { map, unknown };
}
function toNumber(v) {
  if (v == null) return 0;
  let s = String(v).trim(); if (!s) return 0;
  s = s.replace(/[^\d.,-]/g, "");
  const lastC = s.lastIndexOf(","), lastD = s.lastIndexOf(".");
  if (lastC !== -1 && lastD !== -1) s = lastC > lastD ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (lastC === -1 && (s.match(/\./g) || []).length > 1) { s = s.replace(/\./g, ""); }
  else if (lastC !== -1) { const dec = s.length - lastC - 1; s = dec > 0 && dec <= 2 ? s.replace(",", ".") : s.replace(/,/g, ""); }
  const n = parseFloat(s); return isFinite(n) ? n : 0;
}
function importMetaCSV(text, opts) {
  const o = opts || {}, table = parseCSV(text);
  if (table.length < 2) return { ok: false, error: "El CSV no tiene filas de datos.", rows: [] };
  const { map, unknown } = mapMetaHeaders(table[0]);
  if (map.adName === undefined) return { ok: false, error: "No encontré la columna con el nombre del anuncio.", rows: [], unknown };
  const rows = [];
  for (let i = 1; i < table.length; i++) {
    const r = table[i], get = (k) => (map[k] === undefined ? "" : r[map[k]]);
    const adName = String(get("adName") || "").trim(); if (!adName) continue;
    rows.push({ id: uid("m"), adName, date: String(get("date") || "").trim().slice(0, 10) || o.defaultDate || todayISO(),
      spend: toNumber(get("spend")), impressions: toNumber(get("impressions")), plays3s: toNumber(get("plays3s")),
      thruplays: toNumber(get("thruplays")), clicks: toNumber(get("clicks")), purchases: toNumber(get("purchases")),
      revenue: toNumber(get("revenue")), source: "csv", importedAt: new Date().toISOString() });
  }
  return { ok: rows.length > 0, rows, unknown, error: rows.length ? null : "No se pudo leer ninguna fila con nombre de anuncio." };
}
const metaFingerprint = (r) => norm(r.adName) + "|" + String(r.date || "").slice(0, 10);
function mergeMetaRows(existentes, nuevas) {
  const porHuella = {}, orden = [];
  (existentes || []).forEach((r) => {
    const k = metaFingerprint(r);
    if (!(k in porHuella)) orden.push(k);
    porHuella[k] = r;
  });
  let agregadas = 0, reemplazadas = 0;
  (nuevas || []).forEach((r) => {
    const k = metaFingerprint(r);
    if (k in porHuella) reemplazadas++; else { orden.push(k); agregadas++; }
    porHuella[k] = r;
  });
  return { rows: orden.map((k) => porHuella[k]), agregadas, reemplazadas };
}

/* ---------- respaldo ---------- */
const VERSION_BACKUP = 1;

function armarBackup(estado) {
  const e = estado || {};
  return {
    formato: "render-room-backup", version: VERSION_BACKUP, exportadoEl: new Date().toISOString(),
    config: e.config || null, briefs: e.briefs || [], deliveries: e.deliveries || [], meta: e.meta || [],
  };
}

function validarBackup(json) {
  if (!json || typeof json !== "object") return { ok: false, error: "El archivo no es un respaldo válido." };
  if (json.formato !== "render-room-backup") return { ok: false, error: "Ese archivo no es un respaldo de Render Room." };
  if (Number(json.version) > VERSION_BACKUP) return { ok: false, error: "El respaldo viene de una versión más nueva de la app." };
  for (const k of ["briefs", "deliveries", "meta"]) {
    if (json[k] != null && !Array.isArray(json[k])) return { ok: false, error: "El respaldo está dañado: " + k + " no es una lista." };
  }
  const briefs = json.briefs || [], deliveries = json.deliveries || [], meta = json.meta || [];
  const sinId = deliveries.filter((d) => !d || !d.id).length + briefs.filter((b) => !b || !b.id).length;
  if (sinId > 0) return { ok: false, error: "El respaldo está dañado: hay " + sinId + " registros sin identificador." };
  return { ok: true, resumen: {
    briefs: live(briefs).length, deliveries: live(deliveries).length, meta: meta.length,
    editores: json.config && Array.isArray(json.config.editors) ? json.config.editors.length : 0,
    fecha: json.exportadoEl || null, conConfig: !!json.config } };
}

function aplicarBackup(json, actual, modo) {
  const a = actual || {};
  if (modo === "reemplazar") {
    return { config: json.config || a.config, briefs: json.briefs || [],
      deliveries: json.deliveries || [], meta: json.meta || [] };
  }
  return {
    config: json.config || a.config,
    briefs: mergeById(json.briefs || [], a.briefs || []),
    deliveries: mergeById(json.deliveries || [], a.deliveries || []),
    meta: mergeMetaRows(a.meta || [], json.meta || []).rows,
  };
}

function mergeById(localList, remoteList) {
  const out = {};
  (remoteList || []).forEach((r) => { if (r && r.id) out[r.id] = r; });
  (localList || []).forEach((l) => {
    if (!l || !l.id) return;
    const r = out[l.id];
    if (!r) { out[l.id] = l; return; }
    out[l.id] = (l.updatedAt || "") >= (r.updatedAt || "") ? l : r;
  });
  return Object.keys(out).map((k) => out[k]);
}

/** Lo que se muestra: todo menos las lápidas de lo borrado. */
const live = (list) => (list || []).filter((x) => x && !x._deleted);

/** Lápida mínima: conserva la secuencia para que el código nunca se recicle. */
function tombstone(item) {
  return { id: item.id, _deleted: true, briefId: item.briefId, editorId: item.editorId,
    seq: item.seq, code: item.code, updatedAt: new Date().toISOString() };
}

/* ============================================================
   ALMACENAMIENTO compartido
   ============================================================ */
const KEYS = { config: "rr:config:v1", briefs: "rr:briefs:v1", deliveries: "rr:deliveries:v1", meta: "rr:meta:v1" };
const FILE_KEY = (id) => "rr:file:" + id;
const memStore = {};
const hasStore = () => typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

async function sGet(key, fallback) {
  if (!hasStore()) return memStore[key] !== undefined ? memStore[key] : fallback;
  try {
    const r = await window.storage.get(key, true);
    if (!r || r.value == null) return fallback;
    return typeof r.value === "string" ? JSON.parse(r.value) : r.value;
  } catch (e) { return fallback; }
}
async function sSet(key, value) {
  memStore[key] = value;
  if (!hasStore()) return { ok: false, error: "No hay base de datos conectada.", sinBase: true };
  try { await window.storage.set(key, JSON.stringify(value), true); return { ok: true }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
}

async function sPutFile(id, payload) {
  if (!hasStore()) { memStore[FILE_KEY(id)] = payload; return { ok: true, soloLocal: true }; }
  try { await window.storage.set(FILE_KEY(id), JSON.stringify(payload), true); return { ok: true }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
}

/** Traduce el error de la base a algo accionable. */
function explicarFalloDeGuardado(res, bytes) {
  const crudo = String((res && res.error) || "");
  if (res && res.sinBase) {
    return "No hay base de datos conectada. En Vercel: Storage → Upstash for Redis, conectala al proyecto y redesplegá.";
  }
  if (/413|too large|request size|entity too large|exceeded/i.test(crudo)) {
    return "El archivo de " + fmtBytes(bytes) + " supera lo que acepta la base. " +
      "El plan gratuito de Upstash limita el tamaño de cada envío. Probá con un archivo más liviano, " +
      "o subí los videos pesados a Drive cuando esté conectado.";
  }
  if (/401|token|unauthor/i.test(crudo)) {
    return "La base rechazó la clave. Revisá que APP_TOKEN y NEXT_PUBLIC_APP_TOKEN tengan el mismo valor en Vercel.";
  }
  if (/501|Falta la base/i.test(crudo)) {
    return "La base no está configurada en el servidor. Creá la base en Vercel y redesplegá.";
  }
  return "No pude guardar el archivo. La base respondió: " + (crudo || "sin detalle") + ".";
}
async function sGetFile(id) {
  if (!hasStore()) return memStore[FILE_KEY(id)] || null;
  try {
    const r = await window.storage.get(FILE_KEY(id), true);
    if (!r || r.value == null) return null;
    return typeof r.value === "string" ? JSON.parse(r.value) : r.value;
  } catch (e) { return null; }
}
async function sDelFile(id) {
  delete memStore[FILE_KEY(id)];
  if (!hasStore()) return true;
  try { await window.storage.delete(FILE_KEY(id), true); return true; } catch (e) { return false; }
}

/* ============================================================
   PRIMITIVAS UI
   ============================================================ */
const Chip = ({ tone, children }) => <span className={"chip " + (tone || "")}>{children}</span>;
const StateChip = ({ status }) => {
  const s = DELIVERY_STATES[status] || { label: status, tone: "" };
  return <Chip tone={s.tone}>{s.label}</Chip>;
};
const PlatformTag = ({ id }) => {
  const p = PLATFORMS[id];
  if (!p) return <span className="mono" style={{ fontSize: 11 }}>{id}</span>;
  return <span className="mono" style={{ fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
    <i className="dot" style={{ background: p.color }} />{p.label}
  </span>;
};
function Field({ label, error, hint, children }) {
  return <div style={{ marginBottom: 15 }}>
    {label && <label className="lbl">{label}</label>}
    {children}
    {error && <div className="err">{error}</div>}
    {!error && hint && <div className="hint">{hint}</div>}
  </div>;
}
function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return <div className="ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={"modal" + (wide ? " wide" : "")}>
      <div className="modal-h"><h3 style={{ fontSize: 16 }}>{title}</h3>
        <button className="btn ghost sm" onClick={onClose}>Cerrar</button></div>
      <div className="modal-b">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>;
}
function Confirm({ titulo, cuerpo, confirmar, onSi, onNo, peligro }) {
  return <div className="ov" style={{ zIndex: 140 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onNo(); }}>
    <div className="modal" style={{ maxWidth: 430 }}>
      <div className="modal-h"><h3 style={{ fontSize: 16 }}>{titulo}</h3></div>
      <div className="modal-b" style={{ fontSize: 13.5, color: "var(--muted)" }}>{cuerpo}</div>
      <div className="modal-f">
        <button className="btn" onClick={onNo}>Cancelar</button>
        <button className={peligro ? "btn danger" : "btn primary"} onClick={onSi}>{confirmar}</button>
      </div>
    </div>
  </div>;
}

function Stat({ label, value, sub, red }) {
  return <div className="stat">
    <div className="eyebrow">{label}</div>
    <div className={"v" + (red ? " red" : "")}>{value}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>;
}
function Empty({ title, children }) {
  return <div className="empty"><b>{title}</b>{children}</div>;
}

/* --- FILMSTRIP: el gráfico firma --- */
function Filmstrip({ series, goal }) {
  const max = Math.max(goal || 0, ...series.map((s) => s.weighted), 1);
  return <div>
    <div className="strip">
      {goal > 0 && <div className="strip-goal" style={{ bottom: 9 + (goal / max) * 78 }} />}
      <div className="strip-in">
        {series.map((s) => (
          <div key={s.date} className="strip-day" title={s.date + " · " + fmtMin(s.weighted) + " min pond. · " + s.clips + " entregas"}>
            {PLATFORM_IDS.filter((p) => s.byPlatform[p] > 0).map((p) => (
              <div key={p} className="strip-seg" style={{ background: PLATFORMS[p].color, height: (s.byPlatform[p] / max) * 78 }} />
            ))}
            {s.weighted === 0 && <div style={{ height: 2, background: "var(--line)", borderRadius: 1 }} />}
          </div>
        ))}
      </div>
    </div>
    <div className="strip-axis">
      <span>{series[0] ? series[0].date.slice(5) : ""}</span>
      <span>máx {fmtMin(max)} min</span>
      <span>{series.length ? series[series.length - 1].date.slice(5) : ""}</span>
    </div>
  </div>;
}

/* ============================================================
   PANTALLA: acceso
   ============================================================ */
function Gate({ config, onEnter }) {
  const [who, setWho] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const expected = who.role === "admin" ? config.adminPin : (who.editor.pin || "");
    if (!expected || pin === expected) { onEnter(who); return; }
    setErr("PIN incorrecto."); setPin("");
  };
  return <div className="gate">
    <div className="gatebox">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}><span className="recdot" />Sala de control</div>
        <h1 style={{ fontSize: 34, lineHeight: 1 }}>RENDER<em style={{ color: "var(--red)", fontStyle: "normal" }}>·</em>ROOM</h1>
        <p style={{ color: "var(--muted)", marginTop: 9, fontSize: 13 }}>
          Briefs, entregas y rendimiento de creativos. Elegí quién sos para entrar.
        </p>
      </div>

      {!who ? <>
        <div className="eyebrow" style={{ marginBottom: 9 }}>Dirección</div>
        <button className="who admin" onClick={() => { setWho({ role: "admin", name: config.adminName }); setErr(""); }}>
          <span className="av">{slugCode(config.adminName, 2)}</span>
          <span><b>{config.adminName}</b><span style={{ display: "block", fontSize: 11.5, color: "var(--muted)" }}>Subir briefs, aprobar, ver métricas y pagos</span></span>
        </button>
        <div className="eyebrow" style={{ margin: "18px 0 9px" }}>Editores</div>
        {config.editors.filter((e) => e.active).map((e) => (
          <button key={e.id} className="who" onClick={() => { setWho({ role: "editor", editorId: e.id, editor: e, name: e.name }); setErr(""); }}>
            <span className="av">{e.initials || slugCode(e.name, 2)}</span>
            <span><b>{e.name}</b><span style={{ display: "block", fontSize: 11.5, color: "var(--muted)" }}>Ver briefs asignados y cargar entregas</span></span>
          </button>
        ))}
      </> : <>
        <div className="card"><div className="card-b">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Entrando como</div>
          <div style={{ fontFamily: "Archivo", fontWeight: 800, fontSize: 19, marginBottom: 16 }}>{who.name}</div>
          <Field label="PIN" error={err} hint="Cuatro dígitos. Lo cambiás en Ajustes.">
            <input className="inp mono" type="password" inputMode="numeric" value={pin} autoFocus
              onChange={(e) => { setPin(e.target.value); setErr(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="••••" />
          </Field>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn primary" onClick={submit} style={{ flex: 1 }}>Entrar</button>
            <button className="btn" onClick={() => { setWho(null); setPin(""); setErr(""); }}>Volver</button>
          </div>
        </div></div>
      </>}
    </div>
  </div>;
}

/* ============================================================
   BRIEFS
   ============================================================ */
function AttachRow({ item, onRemove }) {
  return <div className="split" style={{ justifyContent: "space-between", gap: 8, padding: "7px 0", borderTop: "1px solid var(--line)" }}>
    <span className="mono" style={{ fontSize: 11.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {item.name}</span>
    {item.seconds ? <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{formatTimecode(item.seconds)}</span> : null}
    <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{fmtBytes(item.size)}</span>
    <button className="btn sm ghost" onClick={onRemove}>×</button>
  </div>;
}

function BriefEditor({ brief, config, onSave, onClose, onDelete }) {
  const [f, setF] = useState(() => brief || {
    id: uid("b"), code: "", title: "", targetVideos: 5, assignedTo: [],
    instructions: "", notes: [], pdf: null, refs: [], archived: false,
  });
  const [errs, setErrs] = useState({});
  const [pend, setPend] = useState({});      // id -> dataURL sin guardar todavía
  const [borrar, setBorrar] = useState([]);  // ids a eliminar del almacenamiento
  const [cargando, setCargando] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [drive, setDrive] = useState(false);
  const [progreso, setProgreso] = useState(null);
  useEffect(() => { let vivo = true; driveDisponible().then((d) => { if (vivo) setDrive(d); }); return () => { vivo = false; }; }, []);
  const pdfRef = useRef(null);
  const vidRef = useRef(null);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (id) => setF((p) => ({ ...p, assignedTo: p.assignedTo.indexOf(id) === -1 ? p.assignedTo.concat([id]) : p.assignedTo.filter((x) => x !== id) }));

  const contextoDrive = () => ({
    briefCode: f.code || slugCode(f.title, 4),
    briefTitulo: f.title,
    editorNombre: "_material del brief",
  });

  const subirPdf = async (file) => {
    // Con Drive conectado no hay tope de peso: el archivo no pasa por la base.
    const v = validateAttachment(file, drive ? "pdf_libre" : "pdf");
    if (!v.ok) { setErrs((p) => ({ ...p, pdf: v.error })); return; }
    setCargando("pdf"); setErrs((p) => ({ ...p, pdf: null }));
    try {
      if (f.pdf) setBorrar((b) => b.concat([f.pdf.id]));
      if (drive) {
        setProgreso({ que: "pdf", pct: 0 });
        const r = await subirADrive(file, contextoDrive(), (pct) => setProgreso({ que: "pdf", pct }));
        setProgreso(null);
        set("pdf", { id: uid("f"), name: r.nombre || file.name, size: file.size, type: file.type,
          driveId: r.driveId, url: r.url, enDrive: true });
      } else {
        const data = await readAsDataURL(file);
        const id = uid("f");
        setPend((p) => ({ ...p, [id]: { name: file.name, type: file.type, data } }));
        set("pdf", { id, name: file.name, size: file.size, type: file.type });
      }
    } catch (e) { setProgreso(null); setErrs((p) => ({ ...p, pdf: e.message })); }
    setCargando("");
  };

  const subirRefs = async (fileList) => {
    const files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    setCargando("refs"); setErrs((p) => ({ ...p, refs: null }));
    const nuevos = [], rechazados = [];
    for (const file of files) {
      const v = validateAttachment(file, drive ? "video_libre" : "video");
      if (!v.ok) { rechazados.push(file.name + " — " + v.error); continue; }
      try {
        const medida = await medirDuracion(file);
        if (drive) {
          setProgreso({ que: file.name, pct: 0 });
          const r = await subirADrive(file, contextoDrive(), (pct) => setProgreso({ que: file.name, pct }));
          nuevos.push({ id: uid("f"), name: r.nombre || file.name, size: file.size, type: file.type,
            seconds: medida.seconds || r.segundos || 0, driveId: r.driveId, url: r.url, enDrive: true });
        } else {
          const data = await readAsDataURL(file);
          const id = uid("f");
          setPend((p) => ({ ...p, [id]: { name: file.name, type: file.type, data } }));
          nuevos.push({ id, name: file.name, size: file.size, type: file.type, seconds: medida.seconds || 0 });
        }
      } catch (e) { rechazados.push(file.name + " — " + e.message); }
    }
    setProgreso(null);
    if (nuevos.length) setF((p) => ({ ...p, refs: (p.refs || []).concat(nuevos) }));
    if (rechazados.length) setErrs((p) => ({ ...p, refs: rechazados.join(" · ") }));
    setCargando("");
  };

  const quitarRef = (id) => {
    setF((p) => ({ ...p, refs: (p.refs || []).filter((r) => r.id !== id) }));
    if (!pend[id]) setBorrar((b) => b.concat([id]));
  };
  const quitarPdf = () => {
    if (f.pdf && !pend[f.pdf.id]) setBorrar((b) => b.concat([f.pdf.id]));
    set("pdf", null);
  };

  const save = async () => {
    const payload = { ...f, code: (f.code || slugCode(f.title, 4)).toUpperCase().replace(/[^A-Z0-9]/g, "") };
    const v = validateBrief(payload);
    if (!v.ok) { setErrs(v.errors); return; }
    setGuardando(true);
    const ids = Object.keys(pend);
    for (const id of ids) {
      const res = await sPutFile(id, pend[id]);
      if (!res.ok) {
        setGuardando(false);
        const bytes = (f.pdf && f.pdf.id === id ? f.pdf.size : ((f.refs || []).filter((r) => r.id === id)[0] || {}).size) || 0;
        const mensaje = explicarFalloDeGuardado(res, bytes);
        setErrs((p) => ({ ...p, pdf: mensaje, refs: mensaje }));
        return;
      }
    }
    for (const id of borrar) await sDelFile(id);
    setGuardando(false);
    onSave({ ...payload, updatedAt: new Date().toISOString() });
  };

  const refs = f.refs || [];
  return <Modal title={brief ? "Editar brief" : "Nuevo brief"} onClose={onClose} wide
    footer={<>
      {brief && <button className="btn danger" onClick={() => setConfirmar(true)} style={{ marginRight: "auto" }}>Eliminar</button>}
      <button className="btn" onClick={onClose}>Cancelar</button>
      <button className="btn primary" disabled={guardando || !!cargando} onClick={save}>
        {guardando ? "Guardando…" : "Guardar brief"}</button>
    </>}>
    {confirmar && <Confirm peligro titulo="Eliminar este brief" confirmar="Eliminar el brief"
      cuerpo={"Se va el brief" + (f.pdf ? ", su PDF" : "") + ((f.refs || []).length ? " y sus " + f.refs.length + " videos de referencia" : "") +
        ". Las entregas ya cargadas quedan, pero sin brief asociado. No se puede deshacer."}
      onSi={() => onDelete(f.id)} onNo={() => setConfirmar(false)} />}
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
      <div>
        <Field label="Título" error={errs.title}>
          <input className="inp" value={f.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Hígado graso — 5 formatos animados" />
        </Field>
        <Field label="Instrucciones" hint="Lo que no está en el PDF: formatos, duración, qué NO hacer.">
          <textarea className="ta" value={f.instructions} onChange={(e) => set("instructions", e.target.value)}
            placeholder={"Formato 10 (El Quiz) y Formato 3 (Antes/Después).\n90-120s. Hook en los primeros 5s.\nSin persona real."} />
        </Field>

        <Field label="Brief en PDF" error={errs.pdf}
          hint={drive
            ? "Va a tu carpeta de Drive. Los editores lo abren desde acá."
            : "Se guarda en la base, así que hay un tope de " + fmtBytes(MAX_FILE_BYTES) + ". Conectá Drive para sacarlo."}>
          {f.pdf
            ? <AttachRow item={f.pdf} onRemove={quitarPdf} />
            : <div className="drop" onClick={() => pdfRef.current && pdfRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); subirPdf(e.dataTransfer.files && e.dataTransfer.files[0]); }}>
              <div style={{ fontFamily: "Archivo", fontWeight: 800, fontSize: 14 }}>
                {cargando === "pdf" ? (progreso ? "Subiendo… " + progreso.pct + "%" : "Subiendo…") : "Soltá el PDF del brief"}</div>
              {progreso && cargando === "pdf" && <div className="barra"><i style={{ width: progreso.pct + "%" }} /></div>}
            </div>}
          <input ref={pdfRef} type="file" accept="application/pdf" style={{ display: "none" }}
            onChange={(e) => { subirPdf(e.target.files && e.target.files[0]); e.target.value = ""; }} />
        </Field>

        <Field label="Videos a modelar" error={errs.refs}
          hint={drive
            ? "Los ejemplos que querés que copien. Van a Drive, sin tope de peso."
            : "Los ejemplos que querés que copien. Sin Drive conectado el tope es " + fmtBytes(MAX_FILE_BYTES) + " por video."}>
          <div className="drop" onClick={() => vidRef.current && vidRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); subirRefs(e.dataTransfer.files); }}>
            <div style={{ fontFamily: "Archivo", fontWeight: 800, fontSize: 14 }}>
              {cargando === "refs" ? (progreso ? "Subiendo… " + progreso.pct + "%" : "Subiendo…") : "Soltá los videos de ejemplo"}</div>
            {progreso && cargando === "refs" && <div className="barra"><i style={{ width: progreso.pct + "%" }} /></div>}
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              {refs.length ? refs.length + (refs.length === 1 ? " video cargado" : " videos cargados") : "Podés soltar varios juntos"}</div>
          </div>
          <input ref={vidRef} type="file" accept="video/*" multiple style={{ display: "none" }}
            onChange={(e) => { subirRefs(e.target.files); e.target.value = ""; }} />
          {refs.map((r) => <AttachRow key={r.id} item={r} onRemove={() => quitarRef(r.id)} />)}
        </Field>
      </div>

      <div>
        <Field label="Código" hint="Va en el nombre de cada archivo.">
          <input className="inp mono" value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder={slugCode(f.title, 4)} maxLength={6} />
        </Field>
        <Field label="Videos pedidos" error={errs.targetVideos}>
          <input className="inp mono" type="number" min="0" value={f.targetVideos}
            onChange={(e) => set("targetVideos", e.target.value)} />
        </Field>
        <Field label="Editores asignados" error={errs.assignedTo}>
          {config.editors.filter((e) => e.active).map((e) => (
            <button key={e.id} className="btn sm" onClick={() => toggle(e.id)}
              style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 5,
                borderColor: f.assignedTo.indexOf(e.id) !== -1 ? "var(--red)" : "var(--line2)",
                color: f.assignedTo.indexOf(e.id) !== -1 ? "var(--bone)" : "var(--muted)" }}>
              {f.assignedTo.indexOf(e.id) !== -1 ? "■" : "□"}&nbsp;&nbsp;{e.name}
            </button>))}
        </Field>
        {brief && <Field label="Archivo">
          <button className="btn sm" onClick={() => set("archived", !f.archived)}>
            {f.archived ? "Desarchivar" : "Archivar brief"}</button>
        </Field>}
      </div>
    </div>
  </Modal>;
}

function AttachViewer({ item, kind }) {
  const [url, setUrl] = useState(null);
  const [estado, setEstado] = useState("idle");
  const urlRef = useRef(null);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const abrir = async () => {
    if (url) return;
    if (item.driveId) { setUrl(previewDrive(item.driveId)); setEstado("ok"); return; }
    setEstado("cargando");
    const f = await sGetFile(item.id);
    if (!f || !f.data) { setEstado("error"); return; }
    const u = dataURLToBlobURL(f.data);
    if (!u) { setEstado("error"); return; }
    urlRef.current = u; setUrl(u); setEstado("ok");
  };

  if (estado === "error") return <div className="err">
    No encontré este archivo en el almacenamiento. Volvé a subirlo desde el brief.</div>;

  if (!url) return <div className="split" style={{ justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid var(--line)" }}>
    <span className="mono" style={{ fontSize: 12, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {item.name}</span>
    {item.seconds ? <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{formatTimecode(item.seconds)}</span> : null}
    <button className="btn sm" onClick={abrir} disabled={estado === "cargando"}>
      {estado === "cargando" ? "Abriendo…" : kind === "pdf" ? "Ver el PDF" : "Ver el video"}</button>
  </div>;

  return <div style={{ marginTop: 10 }}>
    <div className="split" style={{ justifyContent: "space-between", marginBottom: 6 }}>
      <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{item.name}</span>
      <a className="btn sm ghost" href={item.url || url} target="_blank" rel="noreferrer">Abrir en Drive</a>
    </div>
    {item.driveId
      ? <iframe title={item.name} src={url} allow="autoplay"
        style={{ width: "100%", height: kind === "pdf" ? 460 : 340, border: "1px solid var(--line2)", borderRadius: 3, background: "#000" }} />
      : kind === "pdf"
        ? <iframe title={item.name} src={url} style={{ width: "100%", height: 460, border: "1px solid var(--line2)", borderRadius: 3, background: "#fff" }} />
        : <video controls src={url} style={{ width: "100%", borderRadius: 3, border: "1px solid var(--line2)", background: "#000" }} />}
  </div>;
}

function BriefDetail({ brief, deliveries, config, identity, onClose, onAddNote, onEdit }) {
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("brief");
  const p = briefProgress(brief, deliveries);
  const mine = deliveries.filter((d) => d.briefId === brief.id);
  const notes = brief.notes || [];
  const refs = brief.refs || [];

  return <Modal title={brief.title} onClose={onClose} wide>
    <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
      <div>
        <div className="split" style={{ marginBottom: 14 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--red)" }}>{brief.code}</span>
          <Chip tone={p.complete ? "ok" : "work"}>{briefState(brief, deliveries)}</Chip>
          {identity.role === "admin" && <button className="btn sm ghost" onClick={onEdit}>Editar brief</button>}
        </div>

        <div className="seg" style={{ marginBottom: 14 }}>
          <button className={tab === "brief" ? "on" : ""} onClick={() => setTab("brief")}>Brief</button>
          <button className={tab === "refs" ? "on" : ""} onClick={() => setTab("refs")}>
            A modelar{refs.length ? " (" + refs.length + ")" : ""}</button>
          <button className={tab === "entregas" ? "on" : ""} onClick={() => setTab("entregas")}>
            Entregas{mine.length ? " (" + mine.length + ")" : ""}</button>
        </div>

        {tab === "brief" && <div>
          {brief.instructions && <div style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Instrucciones</div>
            <div style={{ fontSize: 13.5, whiteSpace: "pre-wrap" }}>{brief.instructions}</div></div>}
          {brief.pdf
            ? <AttachViewer item={brief.pdf} kind="pdf" />
            : <div className="hint">Este brief no tiene PDF cargado.</div>}
        </div>}

        {tab === "refs" && <div>
          {refs.length === 0
            ? <div className="hint">No hay videos de ejemplo en este brief.</div>
            : refs.map((r) => <AttachViewer key={r.id} item={r} kind="video" />)}
        </div>}

        {tab === "entregas" && (mine.length === 0
          ? <div className="hint">Todavía no hay videos cargados en este brief.</div>
          : <div className="scroll"><table className="tbl">
            <tbody>{mine.map((d) => (
              <tr key={d.id}>
                <td className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.code}</td>
                <td>{d.title}</td>
                <td><PlatformTag id={d.platform} /></td>
                <td className="num mono">{formatTimecode(d.seconds)}</td>
                <td className="num mono" style={{ color: variantCount(d) ? "var(--bone)" : "var(--dim)" }}>
                  {variantCount(d) ? "+" + variantCount(d) : "—"}</td>
                <td><StateChip status={d.status} /></td>
              </tr>))}</tbody>
          </table></div>)}
      </div>

      <div>
        <div className="stat" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Progreso</div>
          <div className="v">{p.done}<span style={{ color: "var(--dim)", fontSize: 17 }}> / {p.target || "—"}</span></div>
          <div className="bar" style={{ marginTop: 10 }}><i style={{ width: p.pct + "%" }} /></div>
          <div className="sub">{p.approved} aprobados · {p.wip} en curso · {p.redo} a rehacer</div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 9 }}>Notas del brief</div>
        <div style={{ maxHeight: 230, overflow: "auto", marginBottom: 12 }}>
          {notes.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5, marginBottom: 12 }}>
            Sin notas. Usalas para dudas, cambios de rumbo y feedback.</div>}
          {notes.slice().reverse().map((n) => (
            <div key={n.id} className={"note" + (n.author === identity.name ? " me" : "")}>
              <div className="mono" style={{ fontSize: 10, color: "var(--dim)", marginBottom: 3 }}>
                {n.author} · {String(n.at).slice(0, 16).replace("T", " ")}</div>
              <div style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{n.text}</div>
            </div>))}
        </div>
        <textarea className="ta" style={{ minHeight: 62 }} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Escribí una nota para este brief…" />
        <button className="btn primary sm" style={{ marginTop: 8, width: "100%" }}
          disabled={!note.trim()} onClick={() => { onAddNote(brief.id, note.trim()); setNote(""); }}>
          Publicar nota
        </button>
      </div>
    </div>
  </Modal>;
}

function BriefsScreen({ state, identity, actions }) {
  const { briefs, deliveries, config } = state;
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const isAdmin = identity.role === "admin";
  const visible = briefs
    .filter((b) => (isAdmin ? true : b.assignedTo.indexOf(identity.editorId) !== -1))
    .filter((b) => (showArchived ? true : !b.archived))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  return <div className="page">
    <div className="pagehead split" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><h2>Briefs</h2>
        <p>{isAdmin ? "Lo que pediste, quién lo está haciendo y cuánto falta." : "Lo que tenés asignado. Abrí el brief antes de empezar a producir."}</p></div>
      <div className="split">
        <button className="btn sm ghost" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? "Ocultar archivados" : "Ver archivados"}</button>
        {isAdmin && <button className="btn primary" onClick={() => setEditing({})}>Nuevo brief</button>}
      </div>
    </div>

    {visible.length === 0 ? <Empty title={isAdmin ? "Todavía no cargaste ningún brief" : "No tenés briefs asignados"}>
      {isAdmin ? "Creá el primero y asignáselo a los editores." : "Cuando Lucho te asigne uno, aparece acá."}
    </Empty> :
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
        {visible.map((b) => {
          const p = briefProgress(b, deliveries);
          const refs = b.refs || [];
          return <div key={b.id} className="card" style={{ opacity: b.archived ? .55 : 1 }}>
            <div className="card-b">
              <div className="split" style={{ justifyContent: "space-between", marginBottom: 9 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--red)" }}>{b.code}</span>
                {p.complete ? <Chip tone="ok">Completo</Chip> : <Chip tone="work">{p.wip} en curso</Chip>}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6, lineHeight: 1.25 }}>{b.title}</h3>
              <div style={{ fontSize: 12.5, color: "var(--muted)", minHeight: 34, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                {b.instructions ? b.instructions.slice(0, 92) + (b.instructions.length > 92 ? "…" : "") : "Sin instrucciones escritas."}</div>
              <div className="bar"><i style={{ width: p.pct + "%" }} /></div>
              <div className="split mono" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--dim)", marginTop: 7 }}>
                <span>{p.done} / {p.target || "—"} videos</span>
                <span>{b.pdf ? "PDF" : "sin PDF"}{refs.length ? " · " + refs.length + " a modelar" : ""}</span>
              </div>
              <div className="split" style={{ marginTop: 13, gap: 7 }}>
                <button className="btn sm" onClick={() => setDetail(b.id)}>Abrir</button>
              </div>
            </div>
          </div>;
        })}
      </div>}

    {editing && <BriefEditor brief={editing.id ? editing : null} config={config}
      onSave={(b) => { actions.saveBrief(b); setEditing(null); }}
      onDelete={(id) => { actions.deleteBrief(id); setEditing(null); }}
      onClose={() => setEditing(null)} />}
    {detail && (() => {
      const b = briefs.filter((x) => x.id === detail)[0];
      if (!b) return null;
      return <BriefDetail brief={b} deliveries={deliveries} config={config} identity={identity}
        onClose={() => setDetail(null)} onAddNote={actions.addNote}
        onEdit={() => { setDetail(null); setEditing(b); }} />;
    })()}
  </div>;
}

/* ============================================================
   ENTREGAS
   ============================================================ */
function DeliveryEditor({ delivery, state, identity, onSave, onClose, onDelete }) {
  const { briefs, config } = state;
  const deliveries = state.allDeliveries || state.deliveries;
  const isAdmin = identity.role === "admin";
  // El brief de la entrega que se está editando siempre entra en la lista,
  // aunque esté archivado: si no, al guardar quedaría como entrega suelta.
  const myBriefs = briefs
    .filter((b) => !b.archived || (delivery && b.id === delivery.briefId))
    .filter((b) => isAdmin || b.assignedTo.indexOf(identity.editorId) !== -1 || (delivery && b.id === delivery.briefId));
  const [f, setF] = useState(() => delivery ? { ...delivery, secondsInput: String(delivery.seconds) } : {
    id: uid("d"), briefId: myBriefs[0] ? myBriefs[0].id : "", editorId: isAdmin ? (config.editors[0] || {}).id : identity.editorId,
    platform: "flow", secondsInput: "", title: "", driveUrl: "", status: "en_curso", date: todayISO(), notes: "",
  });
  const [errs, setErrs] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const brief = briefs.filter((b) => b.id === f.briefId)[0] || null;
  const editor = config.editors.filter((e) => e.id === f.editorId)[0] || null;
  const seq = delivery ? (delivery.seq || 1) : nextSeq(deliveries, f.briefId, f.editorId);
  const code = deliveryCode(brief, editor, seq, f.platform);
  const parsed = parseDuration(f.secondsInput);
  const variants = f.variants || [];
  const contados = parsed != null ? parsed + variants.length * config.variantSeconds : 0;
  const wmin = (contados / 60) * weightOf(f.platform, config.weights);
  const fileRef = useRef(null);
  const [midiendo, setMidiendo] = useState(false);
  const permiso = canEditDelivery(delivery, identity);
  const bloqueado = permiso.campos !== "todo";
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState(delivery ? delivery.fileName || "" : "");
  const politica = deliveryFieldPolicy(identity);
  const [drive, setDrive] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [progresoHook, setProgresoHook] = useState(null);
  const hookRefs = useRef({});
  useEffect(() => { let vivo = true; driveDisponible().then((d) => { if (vivo) setDrive(d); }); return () => { vivo = false; }; }, []);

  const medirArchivo = async (file) => {
    if (!file) return;
    setMidiendo(true);
    const medida = await medirDuracion(file);
    const secs = medida.seconds;
    setNombreArchivo(file.name);

    if (drive && secs) {
      // El archivo va a la carpeta del editor dentro del brief.
      try {
        setProgreso(0);
        const r = await subirADrive(file, {
          briefCode: brief ? brief.code : "", briefTitulo: brief ? brief.title : "",
          editorNombre: editor ? editor.name : identity.name,
          nombreFinal: nombreArchivo({ date: f.date, code, avatar: f.avatar,
            letra: variants.length ? "A" : "", fileName: file.name }),
        }, (pct) => setProgreso(pct));
        setProgreso(null);
        setF((p) => ({ ...p, driveUrl: r.url || p.driveUrl, driveId: r.driveId, rutaDrive: r.ruta }));
      } catch (e) {
        setProgreso(null);
        setMidiendo(false);
        setErrs((p) => ({ ...p, seconds: "Medí el video pero no pude subirlo: " + e.message }));
        setF((p) => ({ ...p, secondsInput: formatTimecode(secs), durationSource: "file", fileName: file.name,
          title: p.title || parseFileMeta(file.name).title }));
        return;
      }
    }
    setMidiendo(false);
    if (secs) {
      setF((p) => ({ ...p, secondsInput: formatTimecode(secs), durationSource: "file", fileName: file.name,
        title: p.title || parseFileMeta(file.name).title }));
      setErrs((p) => ({ ...p, seconds: null }));
    } else {
      setF((p) => ({ ...p, durationSource: null }));
      setErrs((p) => ({ ...p, seconds: "No pude leer la duración: " + medida.motivo + ". "
        + (politica.duracion === "archivo"
          ? "Exportalo como MP4 o MOV y volvé a soltarlo, o pedile a " + config.adminName + " que la cargue."
          : "Escribila a mano.") }));
    }
  };
  const addVariant = () => setF((p) => ({ ...p, variants: (p.variants || []).concat([
    { id: uid("v"), seconds: 0, title: "", driveUrl: "", driveId: null, fileName: "" }]) }));

  /** Cada hook es un video propio: se mide y se sube igual que la pieza base. */
  const cargarArchivoDeHook = async (i, file) => {
    if (!file) return;
    setProgresoHook({ i, pct: 0, midiendo: true });
    const medida = await medirDuracion(file);
    if (!medida.seconds) {
      setProgresoHook(null);
      setErrs((p) => ({ ...p, variants: "No pude leer la duración de " + file.name + ": " + medida.motivo + "." }));
      return;
    }
    setErrs((p) => ({ ...p, variants: null }));
    setVariant(i, { seconds: medida.seconds, fileName: file.name });

    if (!drive) { setProgresoHook(null); return; }
    try {
      setProgresoHook({ i, pct: 0 });
      const r = await subirADrive(file, {
        briefCode: brief ? brief.code : "", briefTitulo: brief ? brief.title : "",
        editorNombre: editor ? editor.name : identity.name,
        nombreFinal: nombreArchivo({ date: f.date, code, avatar: f.avatar,
          letra: variantLabel(i + 1), fileName: file.name }),
      }, (pct) => setProgresoHook({ i, pct }));
      setVariant(i, { driveUrl: r.url || "", driveId: r.driveId });
    } catch (e) {
      setErrs((p) => ({ ...p, variants: "No pude subir " + file.name + ": " + e.message }));
    }
    setProgresoHook(null);
  };
  const setVariant = (i, patch) => setF((p) => ({ ...p, variants: (p.variants || []).map((v, j) => (j === i ? { ...v, ...patch } : v)) }));
  const delVariant = (i) => setF((p) => ({ ...p, variants: (p.variants || []).filter((_, j) => j !== i) }));

  const save = () => {
    if (!permiso.ok) { setErrs({ title: permiso.motivo }); return; }
    const hooksSinVideo = variants.filter((x) => !x.seconds).length;
    if (hooksSinVideo > 0) {
      setErrs({ variants: hooksSinVideo === 1
        ? "Hay un hook sin video. Cargalo o quitalo de la lista."
        : "Hay " + hooksSinVideo + " hooks sin video. Cargalos o quitalos de la lista." });
      return;
    }
    const v = validateDelivery(f, { maxDate: todayISO(), requiereAvatar: true,
      requireFileDuration: politica.duracion === "archivo" && !delivery });
    if (!v.ok) { setErrs(v.errors); return; }
    // Con la entrega ya aprobada solo viajan los links: el resto queda como estaba.
    if (bloqueado && delivery) {
      onSave({ ...delivery, driveUrl: f.driveUrl, variants: variants.map((nv, i) => ({
        ...(delivery.variants || [])[i], ...nv })), updatedAt: new Date().toISOString() });
      return;
    }
    onSave({ ...f, seconds: v.seconds, variants, seq, code, updatedAt: new Date().toISOString() });
  };
  return <Modal title={delivery ? "Editar entrega" : "Cargar entrega"} onClose={onClose} wide
    footer={<>
      {delivery && (isAdmin || delivery.status === "en_curso") &&
        <button className="btn danger" style={{ marginRight: "auto" }} onClick={() => setConfirmarBorrado(true)}>Eliminar</button>}
      <button className="btn" onClick={onClose}>Cancelar</button>
      <button className="btn primary" onClick={save}>{delivery ? "Guardar cambios" : "Cargar entrega"}</button>
    </>}>
    {confirmarBorrado && <Confirm peligro titulo="Eliminar esta entrega" confirmar="Eliminar la entrega"
      cuerpo={"Se descuentan " + fmtMin((countedSeconds(f, config.variantSeconds) / 60) * weightOf(f.platform, config.weights)) +
        " minutos ponderados de " + (editor ? editor.name : "el editor") + ". El código " + code +
        " queda reservado para que ningún anuncio de Meta quede mal atribuido."}
      onSi={() => onDelete(f.id)} onNo={() => setConfirmarBorrado(false)} />}
    {bloqueado && <div className="aviso">{permiso.motivo}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div>
        <Field label="Brief">
          <select className="sel" value={f.briefId} onChange={(e) => set("briefId", e.target.value)}>
            <option value="">— Sin brief (suelto) —</option>
            {myBriefs.map((b) => <option key={b.id} value={b.id}>{b.code} · {b.title}</option>)}
          </select>
        </Field>
        {isAdmin && <Field label="Editor">
          <select className="sel" value={f.editorId} onChange={(e) => set("editorId", e.target.value)}>
            {config.editors.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Field>}
        <Field label="Nombre del video" error={errs.title} hint="Corto y reconocible: el hook o el formato.">
          <input className="inp" value={f.title} disabled={bloqueado}
            onChange={(e) => set("title", e.target.value)} placeholder="Quiz 5 síntomas — v2" />
        </Field>
        <Field label="Avatar al que apunta" error={errs.avatar}
          hint="A quién le habla este video. Va en el nombre del archivo y sirve para comparar rendimiento por avatar.">
          <input className="inp" value={f.avatar || ""} disabled={bloqueado}
            onChange={(e) => set("avatar", e.target.value)}
            placeholder="El zombi de las madrugadas" />
        </Field>

        <Field label="Plataforma" error={errs.platform}>
          <div className="seg" style={{ display: "flex", width: "100%", opacity: bloqueado ? .5 : 1 }}>
            {PLATFORM_IDS.map((p) => (
              <button key={p} className={f.platform === p ? "on" : ""} style={{ flex: 1 }} disabled={bloqueado}
                onClick={() => set("platform", p)}>{PLATFORMS[p].label}</button>))}
          </div>
          <div className="hint">{PLATFORMS[f.platform] ? PLATFORMS[f.platform].note : ""}</div>
        </Field>
      </div>
      <div>
        <Field label="El archivo de video">
          <div className="drop" data-on={arrastrando ? "1" : "0"}
            onDragOver={(e) => { if (!bloqueado) { e.preventDefault(); setArrastrando(true); } }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => { e.preventDefault(); setArrastrando(false); if (!bloqueado) medirArchivo(e.dataTransfer.files && e.dataTransfer.files[0]); }}
            onClick={() => { if (!bloqueado && fileRef.current) fileRef.current.click(); }}
            style={{ padding: "18px 14px", opacity: bloqueado ? .5 : 1, cursor: bloqueado ? "not-allowed" : "pointer" }}>
            <div style={{ fontFamily: "Archivo", fontWeight: 800, fontSize: 14 }}>
              {progreso != null ? "Subiendo a Drive… " + progreso + "%"
                : midiendo ? "Leyendo el video…"
                  : nombreArchivo ? nombreArchivo : "Soltá el video acá"}</div>
            {!drive && <div style={{ fontSize: 11.5, color: "var(--red)", marginTop: 6, fontFamily: "'IBM Plex Mono',monospace" }}>
              DRIVE SIN CONECTAR — EL ARCHIVO NO SE SUBE
            </div>}
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              {f.driveUrl && f.driveId
                ? "Subido a Drive" + (f.rutaDrive ? " · " + f.rutaDrive : "") + ". Duración leída del archivo."
                : nombreArchivo
                  ? (drive ? "Duración leída del archivo." : "Duración leída. Subilo a Drive con el nombre de abajo.")
                  : (drive ? "Se sube solo a la carpeta de tu brief. La duración la leo del archivo."
                    : "Lo leo para sacarle la duración y el nombre. El archivo se queda en tu máquina.")}
            </div>
            {progreso != null && <div className="barra"><i style={{ width: progreso + "%" }} /></div>}
          </div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }}
            onChange={(e) => { medirArchivo(e.target.files && e.target.files[0]); e.target.value = ""; }} />
        </Field>

        {politica.duracion === "libre"
          ? <Field label="Duración" error={errs.seconds} hint="La completa el archivo. Como administrador podés corregirla: 90, 1:30, 1m30s.">
            <input className="inp mono" value={f.secondsInput} disabled={bloqueado}
              onChange={(e) => set("secondsInput", e.target.value)} placeholder="0:10" />
          </Field>
          : <Field label="Duración" error={errs.seconds} hint="Sale del archivo. Nadie la escribe a mano.">
            <div className="inp mono" style={{ background: "var(--panel2)", color: f.secondsInput ? "var(--bone)" : "var(--dim)" }}>
              {f.secondsInput || "esperando el archivo"}</div>
          </Field>}
        {politica.fecha === "libre"
          ? <Field label="Fecha de entrega" error={errs.date} hint="Como administrador podés fecharla en otro día.">
            <input className="inp mono" type="date" value={f.date} max={todayISO()} disabled={bloqueado}
              onChange={(e) => set("date", e.target.value)} />
          </Field>
          : <Field label="Fecha de entrega" hint="La del momento en que cargás. No se toca.">
            <div className="inp mono" style={{ background: "var(--panel2)" }}>{f.date}</div>
          </Field>}
        {politica.link === "libre" && <Field label="Link en Drive" error={errs.driveUrl}
          hint="Opcional. Si el nombre del archivo coincide con el código, el conector lo completa solo.">
          <input className="inp" value={f.driveUrl} onChange={(e) => set("driveUrl", e.target.value)}
            placeholder="https://drive.google.com/file/d/..." />
        </Field>}
        <Field label="Estado">
          <select className="sel" value={f.status} onChange={(e) => set("status", e.target.value)}>
            {Object.keys(DELIVERY_STATES).map((s) => {
              const allowed = !delivery ? (isAdmin || s === "en_curso" || s === "entregado")
                : (s === delivery.status || canTransition(delivery.status, s, identity.role));
              return <option key={s} value={s} disabled={!allowed}>{DELIVERY_STATES[s].label}{allowed ? "" : " (bloqueado)"}</option>;
            })}
          </select>
          {!isAdmin && <div className="hint">La aprobación la da {config.adminName}.</div>}
        </Field>

        <div className="card" style={{ background: "var(--panel2)" }}><div className="card-b" style={{ padding: 13 }}>
          <div className="eyebrow" style={{ marginBottom: 7 }}>
            {drive ? "Nombre del anuncio en Meta" : "Renombrá el archivo así antes de subirlo a Drive"}</div>
          <div className="mono" style={{ fontSize: 12.5, color: "var(--red)", wordBreak: "break-all", marginBottom: 9 }}>{code}.mp4</div>
          <div className="hint" style={{ marginTop: 0 }}>
            {delivery
              ? "Usá exactamente este nombre en Drive y en el anuncio de Meta. Así la app cruza sola las métricas con el video."
              : "Provisorio: el número final se asigna al guardar, para que dos cargas simultáneas nunca compartan código."}
          </div>
          <div className="split mono" style={{ marginTop: 11, fontSize: 11.5, color: "var(--muted)", gap: 14, flexWrap: "wrap" }}>
            <span>Video {parsed != null ? formatTimecode(parsed) : "—"}</span>
            {variants.length > 0 && <span>+ {variants.length} hooks × {config.variantSeconds}s</span>}
            <span style={{ color: "var(--bone)" }}>Cuentan {formatTimecode(contados)}</span>
            <span style={{ color: "var(--red)" }}>{fmtMin(wmin)} min pond.</span>
          </div>
        </div></div>

        <div style={{ marginTop: 15 }}>
          <div className="split" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="lbl" style={{ marginBottom: 0 }}>Hooks alternativos</span>
            <button className="btn sm" onClick={addVariant}>Agregar hook</button>
          </div>
          {errs.variants && <div className="err" style={{ marginBottom: 8 }}>{errs.variants}</div>}
          {variants.length === 0
            ? <div className="hint" style={{ marginTop: 0 }}>
              Mismo video con otro arranque. Cada hook es su propio archivo y su propio anuncio en Meta,
              pero suma solo {config.variantSeconds} segundos a tus minutos, no un video entero.</div>
            : variants.map((v, i) => {
              const enCurso = progresoHook && progresoHook.i === i;
              const listo = !!v.seconds;
              return <div key={v.id || i} style={{ marginBottom: 8, padding: "9px 11px",
                background: "var(--panel2)", border: "1px solid " + (listo ? "var(--line2)" : "var(--red-dim)"),
                borderRadius: 3 }}>
                <div className="split" style={{ gap: 8, marginBottom: 7 }}>
                  <span className="chip" style={{ minWidth: 62, justifyContent: "center" }}>HOOK {variantLabel(i + 1)}</span>
                  <button className="btn sm" disabled={!!enCurso} style={{ flex: 1, textAlign: "left" }}
                    onClick={() => hookRefs.current[i] && hookRefs.current[i].click()}>
                    {enCurso
                      ? (enCurso.midiendo ? "Leyendo…" : "Subiendo… " + enCurso.pct + "%")
                      : v.fileName
                        ? v.fileName
                        : "Soltá el video de este hook"}
                  </button>
                  <input type="file" accept="video/*" style={{ display: "none" }}
                    ref={(el) => { hookRefs.current[i] = el; }}
                    onChange={(e) => { cargarArchivoDeHook(i, e.target.files && e.target.files[0]); e.target.value = ""; }} />
                  <span className="mono" style={{ fontSize: 11.5, width: 54, textAlign: "right",
                    color: listo ? "var(--bone)" : "var(--dim)" }}>
                    {listo ? formatTimecode(v.seconds) : "—"}</span>
                  <button className="btn sm ghost" onClick={() => delVariant(i)}>×</button>
                </div>
                {enCurso && !enCurso.midiendo && <div className="barra"><i style={{ width: enCurso.pct + "%" }} /></div>}
                <input className="inp" style={{ marginTop: 2 }} value={v.title || ""} placeholder="nota opcional"
                  onChange={(e) => setVariant(i, { title: e.target.value })} />
                {v.driveId && <div className="hint" style={{ marginTop: 5 }}>Subido a Drive.</div>}
                {!listo && <div className="hint" style={{ marginTop: 5, color: "var(--red)" }}>
                  Falta el video de este hook.</div>}
              </div>;
            })}
          {variants.length > 0 && <div className="hint">
            En Meta van como {code}-A, -B{variants.length > 1 ? ", -C" : ""}… así el hook rate se mide por hook.</div>}
        </div>
      </div>
    </div>
  </Modal>;
}


/* ============================================================
   CARGA MASIVA — soltás los archivos, la app mide y agrupa
   ============================================================ */
function BulkUpload({ state, identity, onSave, onClose, notify }) {
  const { briefs, config } = state;
  const deliveries = state.allDeliveries || state.deliveries;
  const isAdmin = identity.role === "admin";
  const myBriefs = briefs.filter((b) => !b.archived).filter((b) => isAdmin || b.assignedTo.indexOf(identity.editorId) !== -1);
  const [groups, setGroups] = useState([]);
  const [reading, setReading] = useState(false);
  const [drag, setDrag] = useState(false);
  const politica = deliveryFieldPolicy(identity);
  const [drive, setDrive] = useState(false);
  const [subiendo, setSubiendo] = useState(null);
  useEffect(() => { let vivo = true; driveDisponible().then((d) => { if (vivo) setDrive(d); }); return () => { vivo = false; }; }, []);
  const [common, setCommon] = useState({
    briefId: myBriefs[0] ? myBriefs[0].id : "",
    editorId: isAdmin ? (config.editors[0] || {}).id : identity.editorId,
    platform: "flow", date: todayISO(), status: "entregado", avatar: "",
  });
  const fileRef = useRef(null);

  const ingest = useCallback(async (fileList) => {
    const files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    setReading(true);
    const medidos = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const medida = await medirDuracion(f);
      // 'handle' es el archivo de verdad: groupFilesByHook envuelve cada
      // entrada, así que sin un nombre propio el File se perdía en el camino.
      medidos.push({ name: f.name, seconds: medida.seconds || 0, size: f.size,
        unread: !medida.seconds, motivo: medida.motivo || null, handle: f });
    }
    const nuevos = groupFilesByHook(medidos).map((g) => ({
      id: uid("g"), title: g.title, files: g.files.map((f) => ({
        id: uid("f"), fileName: f.fileName, seconds: f.seconds, unread: !f.seconds, motivo: f.motivo || null,
      durationSource: f.seconds ? "file" : null, driveUrl: "", driveId: null, title: f.title,
      handle: (f.file && f.file.handle) || f.handle || null,
      })),
    }));
    setGroups((prev) => prev.concat(nuevos));
    setReading(false);
    const nHooks = nuevos.reduce((a, g) => a + Math.max(0, g.files.length - 1), 0);
    notify(nuevos.length + (nuevos.length === 1 ? " pieza detectada" : " piezas detectadas") + (nHooks ? " · " + nHooks + " hooks alternativos" : ""));
  }, [notify]);

  const setGroup = (gi, patch) => setGroups((p) => p.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const setFile = (gi, fi, patch) => setGroups((p) => p.map((g, i) => (i === gi ? { ...g, files: g.files.map((f, j) => (j === fi ? { ...f, ...patch } : f)) } : g)));
  const removeFile = (gi, fi) => setGroups((p) => p.map((g, i) => (i === gi ? { ...g, files: g.files.filter((_, j) => j !== fi) } : g)).filter((g) => g.files.length));
  const splitOut = (gi, fi) => setGroups((p) => {
    const g = p[gi], f = g.files[fi];
    const rest = { ...g, files: g.files.filter((_, j) => j !== fi) };
    const nuevo = { id: uid("g"), title: f.title || f.fileName, files: [f] };
    const out = p.slice(); out.splice(gi, 1, rest, nuevo);
    return out.filter((x) => x.files.length);
  });
  const mergeUp = (gi) => setGroups((p) => {
    if (gi === 0) return p;
    const out = p.slice();
    out[gi - 1] = { ...out[gi - 1], files: out[gi - 1].files.concat(out[gi].files) };
    out.splice(gi, 1);
    return out;
  });

  const brief = briefs.filter((b) => b.id === common.briefId)[0] || null;
  const editor = config.editors.filter((e) => e.id === common.editorId)[0] || null;

  const preview = useMemo(() => {
    let seq = nextSeq(deliveries, common.briefId, common.editorId);
    return groups.map((g) => {
      const base = g.files[0] || { seconds: 0 };
      const extras = g.files.slice(1);
      const d = {
        seconds: base.seconds,
        platform: common.platform,
        variants: extras.map((f) => ({ id: f.id, seconds: f.seconds, title: f.title,
          driveUrl: f.driveUrl, driveId: f.driveId || null, fileName: f.fileName })),
      };
      const code = deliveryCode(brief, editor, seq, common.platform);
      seq += 1;
      return { group: g, code, contados: countedSeconds(d, config.variantSeconds), pond: weightedMinutes(d, config.weights, config.variantSeconds), d };
    });
  }, [groups, common, brief, editor, deliveries, config]);

  const totalPond = preview.reduce((a, x) => a + x.pond, 0);
  const ilegibles = groups.reduce((a, g) => a.concat(g.files.filter((f) => f.unread)), []);

  const guardar = async () => {
    const faltantes = preview.filter((x) => !x.d.seconds);
    if (faltantes.length) {
      notify(politica.duracion === "libre"
        ? "Hay piezas sin duración. Completala antes de cargar."
        : "Hay piezas cuyo archivo no se pudo leer. Quitalas o volvé a exportarlas.");
      return;
    }
    if (!String(common.avatar || "").trim()) {
      notify("Poné a qué avatar apuntan estos videos antes de cargarlos.");
      return;
    }
    // Con Drive conectado, primero suben todos los archivos y recién después
    // se registran las entregas, para no dejar registros sin video.
    if (drive) {
      const briefSel = briefs.filter((b) => b.id === common.briefId)[0] || null;
      const ed = config.editors.filter((e) => e.id === common.editorId)[0] || null;
      const contexto = { briefCode: briefSel ? briefSel.code : "", briefTitulo: briefSel ? briefSel.title : "",
        editorNombre: ed ? ed.name : identity.name };
      const todos = groups.reduce((a, g) => a.concat(g.files), []);
      let hechos = 0;
      for (const g of groups) {
        for (const arch of g.files) {
          if (arch.driveId) { hechos++; continue; }
          if (!arch.handle) {
            setSubiendo(null);
            notify("Perdí el archivo de " + arch.fileName + ". Quitalo de la lista y volvé a soltarlo.");
            return;
          }
          try {
            setSubiendo({ nombre: arch.fileName, pct: 0, hechos, total: todos.length });
            const r = await subirADrive(arch.handle, contexto, (pct) =>
              setSubiendo({ nombre: arch.fileName, pct, hechos, total: todos.length }));
            arch.driveId = r.driveId;
            arch.driveUrl = r.url || "";
          } catch (e) {
            setSubiendo(null);
            notify("Falló la subida de " + arch.fileName + ": " + e.message);
            return;
          }
          hechos++;
        }
      }
      setSubiendo(null);
    }

    const nuevos = preview.map((x, i) => ({
      id: uid("d"), briefId: common.briefId, editorId: common.editorId, platform: common.platform,
      seconds: x.d.seconds, title: x.group.title || x.group.files[0].fileName,
      driveUrl: x.group.files[0].driveUrl || "", driveId: x.group.files[0].driveId || null,
      avatar: String(common.avatar || "").trim(),
      status: common.status, date: common.date,
      seq: nextSeq(deliveries, common.briefId, common.editorId) + i, code: x.code,
      durationSource: x.group.files[0].durationSource || "file",
      fileName: x.group.files[0].fileName,
      variants: x.d.variants, updatedAt: new Date().toISOString(),
    }));
    onSave(nuevos);
  };

  return <Modal title="Cargar varios videos" onClose={onClose} wide
    footer={<>
      <span style={{ marginRight: "auto" }} className="mono" >
        {groups.length ? groups.length + " piezas · " + fmtMin(totalPond) + " min ponderados" : ""}
      </span>
      <button className="btn" onClick={onClose}>Cancelar</button>
      <button className="btn primary" disabled={!groups.length || reading || !!subiendo} onClick={guardar}>
        {subiendo
          ? "Subiendo " + (subiendo.hechos + 1) + " de " + subiendo.total + "… " + subiendo.pct + "%"
          : "Cargar " + (groups.length || "") + " " + (groups.length === 1 ? "pieza" : "piezas")}</button>
    </>}>

    <div className="drop" data-on={drag ? "1" : "0"}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); ingest(e.dataTransfer.files); }}
      onClick={() => fileRef.current && fileRef.current.click()}>
      <div style={{ fontFamily: "Archivo", fontWeight: 800, fontSize: 15, marginBottom: 5 }}>
        {reading ? "Midiendo los videos…" : "Soltá acá todos los videos"}</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
        {drive
          ? "Los leo para sacarles la duración y agrupar los hooks, y después se suben solos a la carpeta de tu brief."
          : "Los leo para sacarles la duración y agrupar los hooks. Los archivos se quedan en tu máquina: a Drive los subís vos."}
        Nombrá los archivos <span className="mono" style={{ color: "var(--bone)" }}>quiz_v1</span>,
        <span className="mono" style={{ color: "var(--bone)" }}> quiz_v2</span> y se agrupan automáticamente.
      </div>
      <input ref={fileRef} type="file" accept="video/*" multiple style={{ display: "none" }}
        onChange={(e) => { ingest(e.target.files); e.target.value = ""; }} />
    </div>

    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", margin: "16px 0" }}>
      <Field label="Brief"><select className="sel" value={common.briefId} onChange={(e) => setCommon({ ...common, briefId: e.target.value })}>
        <option value="">— Sin brief —</option>
        {myBriefs.map((b) => <option key={b.id} value={b.id}>{b.code} · {b.title.slice(0, 22)}</option>)}
      </select></Field>
      {isAdmin && <Field label="Editor"><select className="sel" value={common.editorId} onChange={(e) => setCommon({ ...common, editorId: e.target.value })}>
        {config.editors.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select></Field>}
      <Field label="Avatar al que apunta" hint="Va en el nombre de todos los archivos de esta tanda.">
        <input className="inp" value={common.avatar || ""} placeholder="El zombi de las madrugadas"
          onChange={(e) => setCommon({ ...common, avatar: e.target.value })} />
      </Field>
      <Field label="Plataforma"><select className="sel" value={common.platform} onChange={(e) => setCommon({ ...common, platform: e.target.value })}>
        {PLATFORM_IDS.map((pl) => <option key={pl} value={pl}>{PLATFORMS[pl].label}</option>)}
      </select></Field>
      {politica.fecha === "libre"
        ? <Field label="Fecha"><input className="inp mono" type="date" max={todayISO()} value={common.date}
          onChange={(e) => setCommon({ ...common, date: e.target.value })} /></Field>
        : <Field label="Fecha" hint="La de hoy."><div className="inp mono" style={{ background: "var(--panel2)" }}>{common.date}</div></Field>}
      <Field label="Estado"><select className="sel" value={common.status} onChange={(e) => setCommon({ ...common, status: e.target.value })}>
        <option value="en_curso">En curso</option><option value="entregado">Entregado</option>
      </select></Field>
    </div>

    {subiendo && <div className="aviso" style={{ marginBottom: 12 }}>
      <b style={{ display: "block", marginBottom: 4 }}>
        Subiendo a Drive — archivo {subiendo.hechos + 1} de {subiendo.total}</b>
      <span className="mono" style={{ fontSize: 11.5 }}>{subiendo.nombre}</span>
      <div className="barra"><i style={{ width: subiendo.pct + "%" }} /></div>
    </div>}
    {groups.length === 0 ? <div className="hint" style={{ textAlign: "center" }}>
      Todavía no soltaste ningún archivo.</div> :
      <div>
        {ilegibles.length > 0 && <div className="aviso" style={{ marginBottom: 12 }}>
          <b style={{ display: "block", marginBottom: 5 }}>
            No pude leer la duración de {ilegibles.length} {ilegibles.length === 1 ? "archivo" : "archivos"}</b>
          {ilegibles.slice(0, 4).map((f) => (
            <div key={f.id} className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
              {f.fileName} — {f.motivo || "no pude leer la cabecera"}</div>))}
          {ilegibles.length > 4 && <div className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
            y {ilegibles.length - 4} más</div>}
          <div style={{ marginTop: 7, fontSize: 12.5 }}>
            {politica.duracion === "libre"
              ? "Como administrador podés escribir la duración a mano en cada fila."
              : "Volvé a exportarlos como MP4 o MOV y soltalos de nuevo, o quitalos de la lista."}</div>
        </div>}
        {preview.map((x, gi) => (
          <div key={x.group.id} className="card" style={{ marginBottom: 11, background: "var(--panel2)" }}>
            <div className="card-b" style={{ padding: 13 }}>
              <div className="split" style={{ gap: 9, marginBottom: 9 }}>
                <input className="inp" style={{ flex: 1, minWidth: 160 }} value={x.group.title}
                  onChange={(e) => setGroup(gi, { title: e.target.value })} placeholder="Nombre de la pieza" />
                <span className="mono" style={{ fontSize: 11, color: "var(--red)", whiteSpace: "nowrap" }}>{x.code}</span>
                {gi > 0 && <button className="btn sm ghost" title="Unir con la pieza de arriba" onClick={() => mergeUp(gi)}>↑ unir</button>}
              </div>
              {x.group.files.map((f, fi) => (
                <div key={f.id} className="split" style={{ gap: 8, padding: "6px 0", borderTop: fi ? "1px solid var(--line)" : "none" }}>
                  <span className="chip" style={{ minWidth: 74, justifyContent: "center" }}>
                    {fi === 0 ? "VIDEO" : "HOOK " + variantLabel(fi)}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)", flex: 1, minWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {f.fileName}</span>
                  {politica.duracion === "libre"
                    ? <input className="inp mono" style={{ width: 86 }} value={f.seconds ? formatTimecode(f.seconds) : ""}
                      placeholder="0:00" onChange={(e) => { const v = parseDuration(e.target.value); setFile(gi, fi, { seconds: v == null ? 0 : v, unread: false, durationSource: "manual" }); }} />
                    : <span className="mono" style={{ width: 86, textAlign: "right", fontSize: 12,
                      color: f.seconds ? "var(--bone)" : "var(--red)" }}>
                      {f.seconds ? formatTimecode(f.seconds) : "ilegible"}</span>}
                  {politica.link === "libre" && <input className="inp" style={{ width: 150 }} value={f.driveUrl}
                    placeholder="link de Drive" onChange={(e) => setFile(gi, fi, { driveUrl: e.target.value })} />}
                  {x.group.files.length > 1 && fi > 0 &&
                    <button className="btn sm ghost" title="Separar como pieza propia" onClick={() => splitOut(gi, fi)}>↓</button>}
                  <button className="btn sm ghost" title="Quitar" onClick={() => removeFile(gi, fi)}>×</button>
                </div>))}
              <div className="split mono" style={{ marginTop: 9, paddingTop: 9, borderTop: "1px solid var(--line)", fontSize: 11.5, color: "var(--muted)", gap: 15 }}>
                <span>Video {formatTimecode(x.d.seconds)}</span>
                {x.d.variants.length > 0 && <span>+ {x.d.variants.length} hooks × {config.variantSeconds}s</span>}
                <span style={{ color: "var(--bone)" }}>Cuentan {formatTimecode(x.contados)}</span>
                <span style={{ color: "var(--red)" }}>{fmtMin(x.pond)} min pond.</span>
              </div>
            </div>
          </div>))}
        <div className="hint">
          Cada hook alternativo suma {config.variantSeconds} segundos, no un video entero. En Meta cada uno va como anuncio
          aparte con su letra al final del código, así el hook rate se mide por hook.
        </div>
      </div>}
  </Modal>;
}

function DeliveriesScreen({ state, identity, actions }) {
  const { deliveries, briefs, config } = state;
  const isAdmin = identity.role === "admin";
  const [editing, setEditing] = useState(null);
  const [bulk, setBulk] = useState(false);
  const [fEditor, setFEditor] = useState(isAdmin ? "all" : identity.editorId);
  const [fBrief, setFBrief] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [q, setQ] = useState("");

  const rows = deliveries
    .filter((d) => (isAdmin ? (fEditor === "all" || d.editorId === fEditor) : d.editorId === identity.editorId))
    .filter((d) => fBrief === "all" || d.briefId === fBrief)
    .filter((d) => fStatus === "all" || d.status === fStatus)
    .filter((d) => !q || norm(d.title + " " + d.code).indexOf(norm(q)) !== -1)
    .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));

  const nameOf = (id) => { const e = config.editors.filter((x) => x.id === id)[0]; return e ? e.name : "—"; };
  const briefOf = (id) => { const b = briefs.filter((x) => x.id === id)[0]; return b ? b.code : "—"; };

  return <div className="page">
    <div className="pagehead split" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><h2>Entregas</h2>
        <p>{isAdmin ? "Todo lo que entró, con su estado. Aprobá o mandá a rehacer desde acá." : "Cargá cada video cuando lo termines. Lo que no cargás, no cuenta para tus minutos."}</p></div>
      <div className="split">
        <button className="btn" onClick={() => setEditing({})}>Cargar una</button>
        <button className="btn primary" onClick={() => setBulk(true)}>Cargar varios videos</button>
      </div>
    </div>

    <div className="split" style={{ marginBottom: 14 }}>
      <input className="inp" style={{ maxWidth: 230 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o código…" />
      {isAdmin && <select className="sel" style={{ maxWidth: 165 }} value={fEditor} onChange={(e) => setFEditor(e.target.value)}>
        <option value="all">Todos los editores</option>
        {config.editors.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>}
      <select className="sel" style={{ maxWidth: 195 }} value={fBrief} onChange={(e) => setFBrief(e.target.value)}>
        <option value="all">Todos los briefs</option>
        {briefs.map((b) => <option key={b.id} value={b.id}>{b.code} · {b.title.slice(0, 26)}</option>)}
      </select>
      <select className="sel" style={{ maxWidth: 160 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
        <option value="all">Todos los estados</option>
        {Object.keys(DELIVERY_STATES).map((s) => <option key={s} value={s}>{DELIVERY_STATES[s].label}</option>)}
      </select>
      <span className="mono" style={{ fontSize: 11.5, color: "var(--dim)", marginLeft: "auto" }}>{rows.length} entregas</span>
    </div>

    <div className="card scroll">
      {rows.length === 0 ? <Empty title="No hay entregas con esos filtros">Probá limpiar los filtros o cargá la primera.</Empty> :
        <table className="tbl">
          <thead><tr>
            <th>Fecha</th><th>Código</th><th>Video</th>{isAdmin && <th>Editor</th>}<th>Brief</th>
            <th>Plataforma</th><th className="num">Duración</th><th className="num">Hooks</th><th className="num">Min pond.</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody>{rows.map((d) => (
            <tr key={d.id}>
              <td className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.date.slice(5)}</td>
              <td className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{d.code}</td>
              <td>
                {d.driveUrl ? <a className="rowlink" href={d.driveUrl} target="_blank" rel="noreferrer">{d.title}</a> : d.title}
                {d.avatar && <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>{d.avatar}</div>}
              </td>
              {isAdmin && <td style={{ fontSize: 12.5 }}>{nameOf(d.editorId)}</td>}
              <td className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{briefOf(d.briefId)}</td>
              <td><PlatformTag id={d.platform} /></td>
              <td className="num mono">{formatTimecode(d.seconds)}</td>
              <td className="num mono" style={{ color: variantCount(d) ? "var(--bone)" : "var(--dim)" }}>
                {variantCount(d) ? "+" + variantCount(d) : "—"}</td>
              <td className="num mono" style={{ color: countsForPay(d) ? "var(--bone)" : "var(--dim)" }}>
                {countsForPay(d) ? fmtMin(weightedMinutes(d, config.weights, config.variantSeconds)) : "—"}</td>
              <td><StateChip status={d.status} /></td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                {isAdmin && d.status === "entregado" && <>
                  <button className="btn sm primary" onClick={() => actions.setStatus(d.id, "aprobado")}>Aprobar</button>{" "}
                  <button className="btn sm danger" onClick={() => actions.setStatus(d.id, "rechazado")}>Rehacer</button>{" "}
                </>}
                {!isAdmin && d.status === "en_curso" && <>
                  <button className="btn sm primary" onClick={() => actions.setStatus(d.id, "entregado")}>Entregar</button>{" "}
                </>}
                <button className="btn sm ghost" onClick={() => setEditing(d)}>Editar</button>
              </td>
            </tr>))}</tbody>
        </table>}
    </div>

    {editing && <DeliveryEditor delivery={editing.id ? editing : null} state={state} identity={identity}
      onSave={(d) => { actions.saveDelivery(d); setEditing(null); }}
      onDelete={(id) => { actions.deleteDelivery(id); setEditing(null); }}
      onClose={() => setEditing(null)} />}
    {bulk && <BulkUpload state={state} identity={identity} notify={actions.notify}
      onSave={(list) => { actions.saveDeliveries(list); setBulk(false); }}
      onClose={() => setBulk(false)} />}
  </div>;
}

/* ============================================================
   PRODUCCIÓN
   ============================================================ */
function RangePicker({ range, setRange }) {
  const presets = [["7d", 7], ["14d", 14], ["30d", 30], ["90d", 90]];
  const chequeo = validateRange(range.from, range.to);
  return <div>
  <div className="split" style={{ gap: 8 }}>
    <div className="seg">
      {presets.map(([l, n]) => (
        <button key={l} className={range.days === n && !range.custom ? "on" : ""}
          onClick={() => setRange({ days: n, from: addDays(todayISO(), -(n - 1)), to: todayISO(), custom: false })}>{l}</button>
      ))}
    </div>
    <input className="inp mono" style={{ width: 150 }} type="date" value={range.from}
      onChange={(e) => setRange({ ...range, from: e.target.value, custom: true })} />
    <span style={{ color: "var(--dim)" }}>→</span>
    <input className="inp mono" style={{ width: 150 }} type="date" value={range.to}
      min={range.from || undefined}
      onChange={(e) => setRange({ ...range, to: e.target.value, custom: true })} />
  </div>
  {!chequeo.ok && <div className="err">{chequeo.error} Invertí las dos fechas para ver datos.</div>}
  </div>;
}

function ProductionScreen({ state, identity, notify }) {
  const { deliveries, config } = state;
  const isAdmin = identity.role === "admin";
  const [range, setRange] = useState({ days: 30, from: addDays(todayISO(), -29), to: todayISO(), custom: false });
  const chequeoRango = validateRange(range.from, range.to);
  const days = chequeoRango.ok && chequeoRango.dias ? chequeoRango.dias : 1;

  const editors = isAdmin ? config.editors : config.editors.filter((e) => e.id === identity.editorId);
  const prod = useMemo(() => productionByEditor(deliveries, {
    editors, weights: config.weights, from: range.from, to: range.to,
    ratePerMin: config.ratePerMin, variantSeconds: config.variantSeconds,
  }), [deliveries, editors, config, range]);

  const objetivoDiario = (Number(config.dailyGoalMin) || 0) * editors.length;
  const totals = editors.reduce((a, e) => {
    const p = prod[e.id] || { raw: 0, weighted: 0, clips: 0, pay: 0, variants: 0 };
    return { raw: a.raw + p.raw, weighted: a.weighted + p.weighted, clips: a.clips + p.clips,
      pay: a.pay + p.pay, variants: a.variants + (p.variants || 0) };
  }, { raw: 0, weighted: 0, clips: 0, pay: 0, variants: 0 });

  const objetivoPeriodo = periodGoal(config.dailyGoalMin, editors.length, days);
  const estadoObjetivo = goalStatus(totals.weighted, objetivoPeriodo);

  const exportCSV = () => {
    const head = ["editor", "plataforma", "piezas", "hooks_extra", "min_contados", "min_ponderados", "peso", "pago"];
    const lines = [csvRow(head)];
    editors.forEach((e) => {
      const p = prod[e.id]; if (!p) return;
      PLATFORM_IDS.forEach((pl) => {
        const b = p.byPlatform[pl]; if (!b) return;
        lines.push(csvRow([e.name, PLATFORMS[pl].label, b.clips, b.variants || 0, fmtMin(b.raw), fmtMin(b.weighted),
          weightOf(pl, config.weights), fmtMin(b.weighted * (config.ratePerMin || 0))]));
      });
      lines.push(csvRow([e.name, "TOTAL", p.clips, p.variants || 0, fmtMin(p.raw), fmtMin(p.weighted), "", fmtMin(p.pay)]));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "produccion_" + range.from + "_" + range.to + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    notify("Descargando el CSV de producción.");
  };

  return <div className="page">
    <div className="pagehead"><h2>Producción</h2>
      <p>Minutos entregados por editor y por plataforma. El <b style={{ color: "var(--bone)" }}>minuto ponderado</b> es
        el que cuenta para incentivos: un minuto de HeyGen no cuesta lo mismo que un minuto armado con clips de 10 segundos.
        Una pieza con varios hooks sigue siendo un video: cada hook extra suma {config.variantSeconds} segundos.</p></div>

    <div className="split" style={{ marginBottom: 16, justifyContent: "space-between" }}>
      <RangePicker range={range} setRange={setRange} />
      <button className="btn sm" onClick={exportCSV}>Exportar CSV</button>
    </div>

    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", marginBottom: 18 }}>
      <Stat label="Min ponderados" value={fmtMin(totals.weighted)} red sub={days + " días · lo que se paga"} />
      <Stat label="Min brutos" value={fmtMin(totals.raw)} sub="duración real de los archivos" />
      <Stat label="Piezas" value={fmtInt(totals.clips)} sub={totals.variants + " hooks alternativos"} />
      <Stat label="Promedio diario" value={fmtMin(totals.weighted / days)}
        sub={estadoObjetivo.label + " · " + fmtMin(objetivoDiario) + " min/día"
          + (editors.length > 1 ? " (" + fmtMin(config.dailyGoalMin) + " × " + editors.length + " editores)" : "")} />
      {config.ratePerMin > 0 && <Stat label="A pagar" value={fmtMoney(totals.pay, config.currency)} red
        sub={fmtMoney(config.ratePerMin, config.currency) + " por min ponderado"} />}
    </div>

    <div className="grid" style={{ gridTemplateColumns: editors.length > 1 ? "repeat(auto-fit,minmax(390px,1fr))" : "1fr" }}>
      {editors.map((e) => {
        const p = prod[e.id] || { raw: 0, weighted: 0, clips: 0, pay: 0, byPlatform: {} };
        const serie = dailySeries(deliveries, { editorId: e.id, days: Math.min(days, 60), to: range.to, weights: config.weights, variantSeconds: config.variantSeconds });
        return <div key={e.id} className="card">
          <div className="card-h">
            <div className="split">
              <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{e.initials}</span>
              <h3 style={{ fontSize: 15 }}>{e.name}</h3>
            </div>
            <div className="mono" style={{ fontSize: 17, color: "var(--red)" }}>{fmtMin(p.weighted)}<span style={{ fontSize: 11, color: "var(--dim)" }}> min pond.</span></div>
          </div>
          <div className="card-b">
            <Filmstrip series={serie} goal={config.dailyGoalMin} />
            <table className="tbl" style={{ marginTop: 14 }}>
              <thead><tr><th>Plataforma</th><th className="num">Piezas</th><th className="num">Hooks</th><th className="num">Contados</th><th className="num">Peso</th><th className="num">Ponderados</th></tr></thead>
              <tbody>
                {PLATFORM_IDS.map((pl) => {
                  const b = p.byPlatform[pl];
                  if (!b) return null;
                  return <tr key={pl}>
                    <td><PlatformTag id={pl} /></td>
                    <td className="num mono">{b.clips}</td>
                    <td className="num mono" style={{ color: b.variants ? "var(--bone)" : "var(--dim)" }}>{b.variants ? "+" + b.variants : "—"}</td>
                    <td className="num mono" style={{ color: "var(--muted)" }}>{fmtMin(b.raw)}</td>
                    <td className="num mono" style={{ color: "var(--dim)" }}>×{weightOf(pl, config.weights)}</td>
                    <td className="num mono">{fmtMin(b.weighted)}</td>
                  </tr>;
                })}
                {p.clips === 0 && <tr><td colSpan={6} style={{ color: "var(--dim)", fontSize: 12.5 }}>Sin entregas en este rango.</td></tr>}
              </tbody>
            </table>
            {config.ratePerMin > 0 && p.clips > 0 && <div className="split" style={{ justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <span className="eyebrow">A pagar en el período</span>
              <span className="mono" style={{ fontSize: 15 }}>{fmtMoney(p.pay, config.currency)}</span>
            </div>}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ============================================================
   RENDIMIENTO (Meta)
   ============================================================ */
function MetaImport({ onClose, onImport }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const run = (t) => {
    const r = importMetaCSV(t);
    setPreview(r);
  };
  return <Modal title="Importar métricas de Meta" onClose={onClose} wide
    footer={<>
      <button className="btn" onClick={onClose}>Cancelar</button>
      <button className="btn primary" disabled={!preview || !preview.ok} onClick={() => onImport(preview.rows)}>
        Importar {preview && preview.ok ? preview.rows.length + " filas" : ""}</button>
    </>}>
    <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 0 }}>
      En el Administrador de anuncios: vista por <b style={{ color: "var(--bone)" }}>anuncio</b>, agregá las columnas
      impresiones, reproducciones de 3 segundos, ThruPlays, clics en el enlace, compras, valor de conversión e importe gastado.
      Exportá a CSV y soltá el archivo acá. Cruza los datos con tus videos usando el código del nombre del anuncio.
    </p>
    <div className="split" style={{ marginBottom: 12 }}>
      <button className="btn sm" onClick={() => fileRef.current && fileRef.current.click()}>Elegir archivo CSV</button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files && e.target.files[0]; if (!file) return;
          const rd = new FileReader();
          rd.onload = () => { setText(String(rd.result)); run(String(rd.result)); };
          rd.readAsText(file);
        }} />
      <span className="hint" style={{ marginTop: 0 }}>o pegá el contenido abajo</span>
    </div>
    <textarea className="ta mono" style={{ minHeight: 130, fontSize: 11.5 }} value={text}
      onChange={(e) => { setText(e.target.value); run(e.target.value); }}
      placeholder="Nombre del anuncio,Día,Importe gastado (USD),Impresiones,…" />
    {preview && !preview.ok && <div className="err">{preview.error}</div>}
    {preview && preview.ok && <div style={{ marginTop: 14 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Vista previa — {preview.rows.length} filas</div>
      <div className="scroll"><table className="tbl">
        <thead><tr><th>Anuncio</th><th>Fecha</th><th className="num">Gasto</th><th className="num">Impr.</th>
          <th className="num">3s</th><th className="num">Hook</th></tr></thead>
        <tbody>{preview.rows.slice(0, 6).map((r) => {
          const m = adMetrics(r);
          return <tr key={r.id}>
            <td className="mono" style={{ fontSize: 11 }}>{r.adName.slice(0, 42)}</td>
            <td className="mono" style={{ fontSize: 11 }}>{r.date}</td>
            <td className="num mono">{fmtMin(r.spend)}</td>
            <td className="num mono">{fmtInt(r.impressions)}</td>
            <td className="num mono">{fmtInt(r.plays3s)}</td>
            <td className="num mono" style={{ color: "var(--red)" }}>{pct(m.hookRate)}</td>
          </tr>;
        })}</tbody>
      </table></div>
      {preview.unknown && preview.unknown.length > 0 &&
        <div className="hint">Columnas que ignoré: {preview.unknown.slice(0, 6).join(", ")}</div>}
    </div>}
  </Modal>;
}

function PerformanceScreen({ state, identity, actions, notify }) {
  const { deliveries, meta, config, briefs } = state;
  const isAdmin = identity.role === "admin";
  const [imp, setImp] = useState(false);
  const [sortBy, setSortBy] = useState("hookRate");
  const [fEditor, setFEditor] = useState(isAdmin ? "all" : identity.editorId);

  const scope = useMemo(() => expandCreatives(
    deliveries.filter((d) => (fEditor === "all" ? true : d.editorId === fEditor))), [deliveries, fEditor]);
  const { rows, orphans } = useMemo(() => rankCreatives(scope, meta, { sortBy, onlyWithData: true }), [scope, meta, sortBy]);
  const totals = useMemo(() => aggregateMetrics(meta), [meta]);

  const byEditor = useMemo(() => {
    const out = {};
    config.editors.forEach((e) => { out[e.id] = { editor: e, rows: [] }; });
    rankCreatives(expandCreatives(deliveries), meta, { onlyWithData: true }).rows.forEach((r) => {
      const b = out[r.delivery.editorId]; if (b) b.rows = b.rows.concat(r.rows);
    });
    Object.keys(out).forEach((k) => { out[k].m = out[k].rows.length ? aggregateMetrics(out[k].rows) : null; });
    return out;
  }, [deliveries, meta, config.editors]);

  const nameOf = (id) => { const e = config.editors.filter((x) => x.id === id)[0]; return e ? e.name : "—"; };
  const SORTS = [["hookRate", "Hook rate"], ["holdRate", "Hold rate"], ["ctr", "CTR"], ["roas", "ROAS"], ["cpa", "CPA"], ["spend", "Gasto"]];

  return <div className="page">
    <div className="pagehead split" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><h2>Rendimiento</h2>
        <p>Qué video funcionó y cuál no. El <b style={{ color: "var(--bone)" }}>hook rate</b> es reproducciones de 3 segundos sobre
          impresiones: mide si el primer segundo frena el scroll. El <b style={{ color: "var(--bone)" }}>hold rate</b> son ThruPlays
          sobre impresiones: mide si el video sostiene. Cada hook de una misma pieza se mide por separado, con su letra al final del código.</p></div>
      {isAdmin && <button className="btn primary" onClick={() => setImp(true)}>Importar CSV de Meta</button>}
    </div>

    {meta.length === 0 ? <Empty title="Todavía no hay métricas cargadas">
      {isAdmin ? "Exportá el reporte por anuncio desde el Administrador de anuncios e importalo. Se cruza solo con tus videos por el código del nombre."
        : "Cuando Lucho importe los datos de Meta, vas a ver acá cómo rindió cada video tuyo."}
    </Empty> : <>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginBottom: 18 }}>
        <Stat label="Hook rate" value={pct(totals.hookRate)} red sub="3s / impresiones" />
        <Stat label="Hold rate" value={pct(totals.holdRate)} sub="thruplays / impresiones" />
        <Stat label="CTR" value={pct(totals.ctr)} sub="clics en el enlace" />
        <Stat label="Gasto" value={fmtMoney(totals.spend, config.currency)} sub={fmtInt(totals.impressions) + " impresiones"} />
        <Stat label="ROAS" value={totals.roas == null ? "—" : totals.roas.toFixed(2) + "×"} sub={fmtInt(totals.purchases) + " compras"} />
      </div>

      {isAdmin && <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3 style={{ fontSize: 14 }}>Por editor</h3>
          <span className="hint" style={{ marginTop: 0 }}>Quién produce los creativos que retienen</span></div>
        <div className="scroll"><table className="tbl">
          <thead><tr><th>Editor</th><th className="num">Videos con data</th><th className="num">Hook</th>
            <th className="num">Hold</th><th className="num">CTR</th><th className="num">Gasto</th><th className="num">ROAS</th></tr></thead>
          <tbody>{config.editors.map((e) => {
            const b = byEditor[e.id];
            return <tr key={e.id}>
              <td>{e.name}</td>
              <td className="num mono">{b && b.rows.length ? b.rows.length : "—"}</td>
              <td className="num mono" style={{ color: "var(--red)" }}>{b && b.m ? pct(b.m.hookRate) : "—"}</td>
              <td className="num mono">{b && b.m ? pct(b.m.holdRate) : "—"}</td>
              <td className="num mono">{b && b.m ? pct(b.m.ctr) : "—"}</td>
              <td className="num mono">{b && b.m ? fmtMin(b.m.spend) : "—"}</td>
              <td className="num mono">{b && b.m && b.m.roas != null ? b.m.roas.toFixed(2) + "×" : "—"}</td>
            </tr>;
          })}</tbody>
        </table></div>
      </div>}

      <div className="card">
        <div className="card-h">
          <h3 style={{ fontSize: 14 }}>Ranking de creativos</h3>
          <div className="split">
            {isAdmin && <select className="sel" style={{ width: 160 }} value={fEditor} onChange={(e) => setFEditor(e.target.value)}>
              <option value="all">Todos los editores</option>
              {config.editors.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>}
            <select className="sel" style={{ width: 150 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORTS.map(([k, l]) => <option key={k} value={k}>Ordenar por {l}</option>)}
            </select>
          </div>
        </div>
        <div className="scroll">
          {rows.length === 0 ? <Empty title="Ningún video cruzó con las métricas">
            Revisá que el nombre del anuncio en Meta contenga el código del video (por ejemplo HGRA-MAR-03-FLOW-A).
          </Empty> :
            <table className="tbl">
              <thead><tr>
                <th>#</th><th>Video</th>{isAdmin && <th>Editor</th>}<th>Plataforma</th>
                <th className="num">Hook</th><th className="num">Hold</th><th className="num">CTR</th>
                <th className="num">CPM</th><th className="num">Gasto</th><th className="num">CPA</th><th className="num">ROAS</th>
              </tr></thead>
              <tbody>{rows.map((r, i) => {
                const m = r.metrics, d = r.delivery;
                const top = i < 3;
                return <tr key={d.id}>
                  <td className="mono" style={{ color: top ? "var(--red)" : "var(--dim)", fontSize: 11.5 }}>{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{d.driveUrl ? <a className="rowlink" href={d.driveUrl} target="_blank" rel="noreferrer">{d.title}</a> : d.title}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>{d.code}</div>
                  </td>
                  {isAdmin && <td style={{ fontSize: 12.5 }}>{nameOf(d.editorId)}</td>}
                  <td><PlatformTag id={d.platform} /></td>
                  <td className="num mono" style={{ color: "var(--red)" }}>{pct(m.hookRate)}</td>
                  <td className="num mono">{pct(m.holdRate)}</td>
                  <td className="num mono">{pct(m.ctr)}</td>
                  <td className="num mono">{m.cpm == null ? "—" : fmtMin(m.cpm)}</td>
                  <td className="num mono">{fmtMin(m.spend)}</td>
                  <td className="num mono">{m.cpa == null ? "—" : fmtMin(m.cpa)}</td>
                  <td className="num mono">{m.roas == null ? "—" : m.roas.toFixed(2) + "×"}</td>
                </tr>;
              })}</tbody>
            </table>}
        </div>
        {orphans.length > 0 && <div className="card-b" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{orphans.length} anuncios sin video asociado</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--dim)", lineHeight: 1.8 }}>
            {orphans.slice(0, 8).map((o) => o.adName).join(" · ")}{orphans.length > 8 ? " …" : ""}</div>
          <div className="hint">Renombrá el anuncio en Meta con el código del video, o editá el video y poné ese nombre exacto.</div>
        </div>}
      </div>
    </>}

    {imp && <MetaImport onClose={() => setImp(false)}
      onImport={(r) => { actions.addMeta(r); setImp(false); notify(r.length + " filas importadas."); }} />}
  </div>;
}

/* ============================================================
   PANEL
   ============================================================ */
function Dashboard({ state, identity, go }) {
  const { deliveries, briefs, config, meta } = state;
  const isAdmin = identity.role === "admin";
  const from = addDays(todayISO(), -13);
  const editors = isAdmin ? config.editors : config.editors.filter((e) => e.id === identity.editorId);
  const prod = productionByEditor(deliveries, { editors, weights: config.weights, from, to: todayISO(), ratePerMin: config.ratePerMin, variantSeconds: config.variantSeconds });
  const mine = isAdmin ? deliveries : deliveries.filter((d) => d.editorId === identity.editorId);
  const today = mine.filter((d) => d.date === todayISO() && countsForPay(d));
  const todayW = today.reduce((a, d) => a + weightedMinutes(d, config.weights, config.variantSeconds), 0);
  const serie = dailySeries(mine, { days: 14, to: todayISO(), weights: config.weights, variantSeconds: config.variantSeconds });
  const totalW = editors.reduce((a, e) => a + ((prod[e.id] || {}).weighted || 0), 0);
  const pending = deliveries.filter((d) => d.status === "entregado");
  const myOpenBriefs = briefs.filter((b) => !b.archived).filter((b) => isAdmin || b.assignedTo.indexOf(identity.editorId) !== -1);
  const rank = meta.length ? rankCreatives(expandCreatives(mine), meta, { sortBy: "hookRate", onlyWithData: true }).rows.slice(0, 5) : [];
  // En la vista del equipo el objetivo es el de todos, no el de uno.
  const metaDiaria = (Number(config.dailyGoalMin) || 0) * (isAdmin ? Math.max(1, config.editors.filter((e) => e.active).length) : 1);
  const estadoHoy = goalStatus(todayW, metaDiaria);

  return <div className="page">
    <div className="pagehead">
      <h2>{isAdmin ? "Sala de control" : "Hola, " + identity.name.split(" ")[0]}</h2>
      <p>{isAdmin ? "Estado de la producción de los últimos 14 días." : "Tu producción de los últimos 14 días y lo que tenés pendiente."}</p>
    </div>

    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", marginBottom: 18 }}>
      <Stat label="Hoy" value={fmtMin(todayW)} red sub={today.length + " piezas · " + estadoHoy.label} />
      <Stat label="14 días" value={fmtMin(totalW)} sub="minutos ponderados" />
      <Stat label="Briefs activos" value={fmtInt(myOpenBriefs.length)} sub={isAdmin ? "en toda la operación" : "asignados a vos"} />
      {isAdmin ? <Stat label="Esperando revisión" value={fmtInt(pending.length)} sub="entregas para aprobar" />
        : <Stat label="A rehacer" value={fmtInt(mine.filter((d) => d.status === "rechazado").length)} sub="volvieron con correcciones" />}
      {isAdmin && meta.length > 0 && <Stat label="Hook rate global" value={pct(aggregateMetrics(meta).hookRate)} sub="3s / impresiones" />}
    </div>

    <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", alignItems: "start" }}>
      <div className="card">
        <div className="card-h">
          <h3 style={{ fontSize: 14 }}>{isAdmin ? "Producción del equipo" : "Tu producción"}</h3>
          <div className="split mono" style={{ fontSize: 10, color: "var(--dim)", gap: 11 }}>
            {PLATFORM_IDS.map((p) => <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <i className="dot" style={{ background: PLATFORMS[p].color }} />{PLATFORMS[p].label}</span>)}
          </div>
        </div>
        <div className="card-b"><Filmstrip series={serie} goal={metaDiaria} /></div>
        {isAdmin && <div className="scroll" style={{ borderTop: "1px solid var(--line)" }}>
          <table className="tbl">
            <thead><tr><th>Editor</th><th className="num">Piezas</th><th className="num">Hooks</th><th className="num">Contados</th><th className="num">Ponderados</th>
              {config.ratePerMin > 0 && <th className="num">A pagar</th>}</tr></thead>
            <tbody>{config.editors.slice().sort((a, b) => ((prod[b.id] || {}).weighted || 0) - ((prod[a.id] || {}).weighted || 0)).map((e) => {
              const p = prod[e.id] || { clips: 0, raw: 0, weighted: 0, pay: 0, variants: 0 };
              return <tr key={e.id}>
                <td>{e.name}</td>
                <td className="num mono">{p.clips}</td>
                <td className="num mono" style={{ color: p.variants ? "var(--bone)" : "var(--dim)" }}>{p.variants ? "+" + p.variants : "—"}</td>
                <td className="num mono" style={{ color: "var(--muted)" }}>{fmtMin(p.raw)}</td>
                <td className="num mono" style={{ color: "var(--red)" }}>{fmtMin(p.weighted)}</td>
                {config.ratePerMin > 0 && <td className="num mono">{fmtMoney(p.pay, config.currency)}</td>}
              </tr>;
            })}</tbody>
          </table>
        </div>}
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-h"><h3 style={{ fontSize: 14 }}>{isAdmin ? "Para revisar" : "Tus briefs"}</h3>
            <button className="btn ghost sm" onClick={() => go(isAdmin ? "deliveries" : "briefs")}>Ver todo</button></div>
          <div className="card-b" style={{ paddingTop: 8 }}>
            {isAdmin ? (pending.length === 0
              ? <div style={{ color: "var(--dim)", fontSize: 13 }}>Nada esperando aprobación.</div>
              : pending.slice(0, 6).map((d) => (
                <div key={d.id} className="split" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                  <div><div style={{ fontSize: 13 }}>{d.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>{d.code}</div></div>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatTimecode(d.seconds)}</span>
                </div>)))
              : (myOpenBriefs.length === 0
                ? <div style={{ color: "var(--dim)", fontSize: 13 }}>No tenés briefs asignados.</div>
                : myOpenBriefs.slice(0, 6).map((b) => {
                  const p = briefProgress(b, deliveries);
                  return <div key={b.id} style={{ padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                    <div className="split" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{b.title.slice(0, 34)}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{p.done}/{p.target || "—"}</span>
                    </div>
                    <div className="bar"><i style={{ width: p.pct + "%" }} /></div>
                  </div>;
                }))}
          </div>
        </div>

        {rank.length > 0 && <div className="card">
          <div className="card-h"><h3 style={{ fontSize: 14 }}>Los que mejor frenan el scroll</h3>
            <button className="btn ghost sm" onClick={() => go("performance")}>Ver todo</button></div>
          <div className="card-b" style={{ paddingTop: 8 }}>
            {rank.map((r, i) => (
              <div key={r.delivery.id} className="split" style={{ justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="split" style={{ gap: 9 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 13 }}>{r.delivery.title.slice(0, 26)}</span>
                </div>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--red)" }}>{pct(r.metrics.hookRate)}</span>
              </div>))}
          </div>
        </div>}
      </div>
    </div>
  </div>;
}

/* ============================================================
   AJUSTES
   ============================================================ */
function SettingsScreen({ state, actions, notify, identity, onDirty }) {
  const { config, deliveries, briefs, meta } = state;
  const [c, setC] = useState(config);
  const [dirty, setDirty] = useState(false);
  const [confirmarWipe, setConfirmarWipe] = useState(false);
  const [estadoDrive, setEstadoDrive] = useState(null);
  const [backupPendiente, setBackupPendiente] = useState(null);
  const [errorBackup, setErrorBackup] = useState(null);
  const backupRef = useRef(null);
  useEffect(() => {
    let vivo = true;
    const api = RR_API();
    if (!api) { setEstadoDrive({ metodo: null }); return; }
    fetch("/api/drive?estado", { headers: { "x-app-token": api.token } })
      .then((r) => r.json())
      .then((j) => { if (vivo) setEstadoDrive(j); })
      .catch(() => { if (vivo) setEstadoDrive({ metodo: null }); });
    return () => { vivo = false; };
  }, []);
  useEffect(() => { setC(config); setDirty(false); }, [config]);
  useEffect(() => { if (onDirty) onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => { if (onDirty) onDirty(false); }, [onDirty]);
  const set = (k, v) => { setC((p) => ({ ...p, [k]: v })); setDirty(true); };
  const setEditor = (i, k, v) => {
    const eds = c.editors.slice();
    eds[i] = { ...eds[i], [k]: v };
    set("editors", eds);
  };
  const save = () => {
    const clean = { ...c, ratePerMin: Number(c.ratePerMin) || 0, dailyGoalMin: Number(c.dailyGoalMin) || 0,
      variantSeconds: Math.max(0, Number(c.variantSeconds) || 0),
      weights: PLATFORM_IDS.reduce((a, p) => { a[p] = Number(c.weights[p]); if (!isFinite(a[p]) || a[p] < 0) a[p] = PLATFORMS[p].defaultWeight; return a; }, {}) };
    actions.saveConfig(clean); setDirty(false); notify("Ajustes guardados.");
  };
  const exportAll = () => {
    const blob = new Blob([JSON.stringify(armarBackup({ config, briefs, deliveries, meta }), null, 2)],
      { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "render_room_backup_" + todayISO() + ".json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    notify("Backup descargado.");
  };

  const elegirBackup = (file) => {
    if (!file) return;
    const lector = new FileReader();
    lector.onload = () => {
      let json = null;
      try { json = JSON.parse(String(lector.result)); }
      catch (e) { setErrorBackup("El archivo no es un JSON válido."); return; }
      const v = validarBackup(json);
      if (!v.ok) { setErrorBackup(v.error); return; }
      setErrorBackup(null);
      setBackupPendiente({ json, resumen: v.resumen });
    };
    lector.onerror = () => setErrorBackup("No pude leer el archivo.");
    lector.readAsText(file);
  };

  if (identity.role !== "admin") return <div className="page">
    <div className="pagehead"><h2>Ajustes</h2><p>Solo {config.adminName} puede cambiar pesos, tarifas y editores.</p></div>
    <Empty title="Sin acceso">Si necesitás cambiar tu PIN, pediselo a {config.adminName}.</Empty>
  </div>;

  return <div className="page">
    {backupPendiente && <Confirm titulo="Restaurar este respaldo" confirmar="Fusionar con lo actual"
      cuerpo={<>
        <div style={{ marginBottom: 10 }}>
          Del {String(backupPendiente.resumen.fecha || "").slice(0, 10) || "sin fecha"} ·{" "}
          {backupPendiente.resumen.briefs} briefs · {backupPendiente.resumen.deliveries} entregas ·{" "}
          {backupPendiente.resumen.meta} filas de Meta
          {backupPendiente.resumen.conConfig ? " · " + backupPendiente.resumen.editores + " editores" : ""}
        </div>
        <div>
          <b style={{ color: "var(--bone)" }}>Fusionar</b> suma lo del respaldo a lo que ya hay, y ante un mismo
          registro se queda con el más nuevo. Es lo que querés casi siempre.
        </div>
        <button className="btn sm danger" style={{ marginTop: 12 }}
          onClick={() => { actions.restaurar(backupPendiente.json, "reemplazar"); setBackupPendiente(null); }}>
          O reemplazar todo por el respaldo
        </button>
      </>}
      onSi={() => { actions.restaurar(backupPendiente.json, "fusionar"); setBackupPendiente(null); }}
      onNo={() => setBackupPendiente(null)} />}
    {confirmarWipe && <Confirm peligro titulo="Borrar todos los datos" confirmar="Borrar todo"
      cuerpo={"Se borran " + briefs.length + " briefs, " + deliveries.length + " entregas, " + meta.length +
        " filas de Meta y todos los PDF y videos guardados, para todo el equipo. No se puede deshacer. Descargá el backup antes."}
      onSi={() => { actions.wipe(); notify("Datos borrados."); setConfirmarWipe(false); }}
      onNo={() => setConfirmarWipe(false)} />}
    <div className="pagehead split" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><h2>Ajustes</h2><p>Editores, pesos por plataforma y cómo se paga el minuto.</p></div>
      <button className="btn primary" disabled={!dirty} onClick={save}>{dirty ? "Guardar cambios" : "Todo guardado"}</button>
    </div>

    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))" }}>
      <div className="card">
        <div className="card-h"><h3 style={{ fontSize: 14 }}>Peso por plataforma</h3></div>
        <div className="card-b">
          <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 0 }}>
            Cuánto vale un minuto de cada plataforma cuando se cuenta la producción. Un minuto de HeyGen sale de una sola pasada;
            un minuto armado con clips de 10 segundos son seis generaciones y varias regeneraciones. El peso corrige eso.
          </p>
          {PLATFORM_IDS.map((p) => (
            <div key={p} className="split" style={{ justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
              <div><PlatformTag id={p} /><div className="hint" style={{ marginTop: 3 }}>{PLATFORMS[p].note}</div></div>
              <input className="inp mono" style={{ width: 84, textAlign: "right" }} type="number" step="0.05" min="0"
                value={c.weights[p]} onChange={(e) => { const w = { ...c.weights, [p]: e.target.value }; set("weights", w); }} />
            </div>))}
          <div className="hint">Ejemplo con los valores actuales: 10 minutos de HeyGen = {fmtMin(10 * (Number(c.weights.heygen) || 0))} min ponderados.
            36 clips de Flow de 10s = {fmtMin(6 * (Number(c.weights.flow) || 0))} min ponderados.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3 style={{ fontSize: 14 }}>Pago e incentivos</h3></div>
        <div className="card-b">
          <Field label="Pago por minuto ponderado" hint="Dejalo en 0 si todavía no querés mostrar plata.">
            <div className="split">
              <input className="inp mono" style={{ width: 130 }} type="number" step="0.1" min="0"
                value={c.ratePerMin} onChange={(e) => set("ratePerMin", e.target.value)} />
              <select className="sel" style={{ width: 110 }} value={c.currency} onChange={(e) => set("currency", e.target.value)}>
                <option>USD</option><option>ARS</option><option>MXN</option><option>EUR</option>
              </select>
            </div>
          </Field>
          <Field label="Segundos por hook alternativo" hint="Lo que suma cada variante de hook de una misma pieza. La pieza es un video; el hook es un retoque.">
            <input className="inp mono" style={{ width: 130 }} type="number" step="1" min="0"
              value={c.variantSeconds} onChange={(e) => set("variantSeconds", e.target.value)} />
          </Field>
          <Field label="Objetivo diario por editor (min ponderados)" hint="Es la línea punteada del gráfico.">
            <input className="inp mono" style={{ width: 130 }} type="number" step="1" min="0"
              value={c.dailyGoalMin} onChange={(e) => set("dailyGoalMin", e.target.value)} />
          </Field>
          <Field label="Tu PIN">
            <input className="inp mono" style={{ width: 130 }} value={c.adminPin} maxLength={8}
              onChange={(e) => set("adminPin", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3 style={{ fontSize: 14 }}>Editores</h3>
          <button className="btn sm" onClick={() => set("editors", c.editors.concat([{ id: uid("ed"), name: "Nuevo editor", initials: "NE", pin: "0000", active: true }]))}>Agregar</button></div>
        <div className="card-b">
          {c.editors.map((e, i) => (
            <div key={e.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              <div className="split" style={{ gap: 8 }}>
                <input className="inp" style={{ flex: 1, minWidth: 120 }} value={e.name} onChange={(ev) => setEditor(i, "name", ev.target.value)} />
                <input className="inp mono" style={{ width: 68 }} maxLength={4} value={e.initials}
                  onChange={(ev) => setEditor(i, "initials", ev.target.value.toUpperCase())} title="Iniciales para el código" />
                <input className="inp mono" style={{ width: 76 }} maxLength={8} value={e.pin}
                  onChange={(ev) => setEditor(i, "pin", ev.target.value)} title="PIN" />
                <button className="btn sm" onClick={() => setEditor(i, "active", !e.active)}
                  style={{ color: e.active ? "var(--bone)" : "var(--dim)" }}>{e.active ? "Activo" : "Inactivo"}</button>
              </div>
            </div>))}
          <div className="hint">Desactivar un editor lo saca de la pantalla de acceso pero conserva su historial.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3 style={{ fontSize: 14 }}>Drive y Meta</h3></div>
        <div className="card-b">
          <Field label="Carpeta raíz de Drive" hint="El link que abre el botón Drive en la barra superior.">
            <input className="inp" value={c.driveRootUrl} onChange={(e) => set("driveRootUrl", e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..." />
          </Field>
          <div style={{ marginBottom: 15 }}>
            <label className="lbl">Conexión con Drive</label>
            {estadoDrive === null
              ? <div className="hint" style={{ marginTop: 0 }}>Consultando…</div>
              : estadoDrive.metodo
                ? <div>
                  <div className="split" style={{ gap: 8, marginBottom: 6 }}>
                    <Chip tone="ok">Conectado</Chip>
                    <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{estadoDrive.metodo}</span>
                  </div>
                  {estadoDrive.carpetaRaiz === "FALTA" && <div className="err">
                    Falta GOOGLE_DRIVE_ROOT_FOLDER_ID: sin esa variable no sé en qué carpeta guardar.</div>}
                  <a className="btn sm" href={"/api/google/auth?token=" + encodeURIComponent(RR_API() ? RR_API().token : "")}>
                    Volver a autorizar</a>
                </div>
                : RR_API()
                  ? <div>
                    <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                      Todavía no autorizaste Google. Apretá el botón, aceptá con la cuenta dueña de la carpeta,
                      y el permiso queda guardado solo.</div>
                    <a className="btn primary sm" href={"/api/google/auth?token=" + encodeURIComponent(RR_API() ? RR_API().token : "")}>
                      Conectar Drive</a>
                  </div>
                  : <div className="hint" style={{ marginTop: 0 }}>
                    Esta copia no tiene servidor detrás, así que no hay Drive para conectar.</div>}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 4 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Datos</div>
            <div className="split">
              <button className="btn sm" onClick={exportAll}>Descargar backup</button>
              <button className="btn sm" onClick={() => backupRef.current && backupRef.current.click()}>Restaurar backup</button>
              <button className="btn sm danger" onClick={() => setConfirmarWipe(true)}>Borrar todo</button>
              <input ref={backupRef} type="file" accept="application/json,.json" style={{ display: "none" }}
                onChange={(e) => { elegirBackup(e.target.files && e.target.files[0]); e.target.value = ""; }} />
            </div>
            {errorBackup && <div className="err">{errorBackup}</div>}
            <div className="hint">{briefs.length} briefs · {deliveries.length} entregas · {meta.length} filas de Meta</div>
            <div className="hint">
              Los videos y los PDF viven en Drive, así que no entran en este archivo: el respaldo guarda los
              registros, los briefs, las métricas y la configuración.</div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [briefs, setBriefs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [meta, setMeta] = useState([]);
  const [identity, setIdentity] = useState(null);
  const [tab, setTab] = useState("dash");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [ajustesSucios, setAjustesSucios] = useState(false);
  const [falloGuardado, setFalloGuardado] = useState(null);
  const [drive, setDrive] = useState(null);
  useEffect(() => { let vivo = true; driveDisponible().then((d) => { if (vivo) setDrive(d); }); return () => { vivo = false; }; }, []);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [sync, setSync] = useState(hasStore() ? "ok" : "local");
  const toastTimer = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  const load = useCallback(async () => {
    const [cfg, b, d, m] = await Promise.all([
      sGet(KEYS.config, null), sGet(KEYS.briefs, []), sGet(KEYS.deliveries, []), sGet(KEYS.meta, []),
    ]);
    if (cfg) setConfig({ ...DEFAULT_CONFIG, ...cfg, weights: { ...DEFAULT_CONFIG.weights, ...(cfg.weights || {}) } });
    setBriefs(Array.isArray(b) ? b : []);
    setDeliveries(Array.isArray(d) ? d : []);
    setMeta(Array.isArray(m) ? m : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!hasStore()) return;
    const t = setInterval(() => { if (!document.hidden) load(); }, 45000);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  /* --- escrituras con merge para no pisar a otro editor --- */
  const commitList = useCallback(async (key, setter, updater) => {
    const remote = await sGet(key, []);
    const merged = mergeById(updater(Array.isArray(remote) ? remote : []), Array.isArray(remote) ? remote : []);
    setter(merged);
    const res = await sSet(key, merged);
    if (!hasStore()) setSync("local");
    else if (res.ok) { setSync("ok"); setFalloGuardado(null); }
    else { setSync("err"); setFalloGuardado(explicarFalloDeGuardado(res, 0)); }
  }, []);

  const actions = useMemo(() => ({
    saveBrief: (b) => commitList(KEYS.briefs, setBriefs, (list) => {
      const i = list.findIndex((x) => x.id === b.id);
      const next = list.slice();
      if (i === -1) next.push({ ...b, notes: b.notes || [], refs: b.refs || [], createdAt: new Date().toISOString() });
      else next[i] = { ...list[i], ...b };
      return next;
    }).then(() => notify("Brief guardado.")),
    deleteBrief: async (id) => {
      const b = briefs.filter((x) => x.id === id)[0];
      if (b) {
        if (b.pdf && !b.pdf.enDrive) await sDelFile(b.pdf.id);
        for (const r of b.refs || []) if (!r.enDrive) await sDelFile(r.id);
      }
      await commitList(KEYS.briefs, setBriefs, (list) =>
        list.map((x) => (x.id === id ? { id: x.id, _deleted: true, updatedAt: new Date().toISOString() } : x)));
      notify("Brief eliminado.");
    },
    addNote: (briefId, text) => commitList(KEYS.briefs, setBriefs, (list) =>
      list.map((b) => (b.id === briefId
        ? { ...b, notes: (b.notes || []).concat([{ id: uid("n"), author: identity ? identity.name : "—", text, at: new Date().toISOString() }]), updatedAt: new Date().toISOString() }
        : b))
    ).then(() => notify("Nota publicada.")),
    notify,
    saveDeliveries: (nuevos) => {
      let selladas = [];
      return commitList(KEYS.deliveries, setDeliveries, (list) => {
        selladas = assignCodes(nuevos, list, briefs, config);
        return list.concat(selladas);
      }).then(async () => {
        notify(nuevos.length + (nuevos.length === 1 ? " pieza cargada." : " piezas cargadas."));
        const archivos = selladas.reduce((a, d) => a.concat(nombresDePieza(d, { soloConDrive: true })), []);
        if (archivos.length) await renombrarEnDrive(archivos);
      });
    },
    saveDelivery: (d) => {
      let sellada = null;
      return commitList(KEYS.deliveries, setDeliveries, (list) => {
        const i = list.findIndex((x) => x.id === d.id);
        const next = list.slice();
        if (i === -1) {
          // El código se sella acá, contra la lista recién leída del servidor.
          sellada = { ...assignCode(d, list, briefs, config), createdAt: new Date().toISOString() };
          next.push(sellada);
        } else { sellada = { ...list[i], ...d }; next[i] = sellada; }
        return next;
      }).then(async () => {
        notify("Entrega guardada.");
        // Recién ahora se conoce el número definitivo: ponemos el nombre real.
        if (sellada) {
          const archivos = nombresDePieza(sellada, { soloConDrive: true });
          if (archivos.length) await renombrarEnDrive(archivos);
        }
      });
    },
    deleteDelivery: (id) => commitList(KEYS.deliveries, setDeliveries, (list) =>
      list.map((x) => (x.id === id ? tombstone(x) : x))
    ).then(() => notify("Entrega eliminada.")),
    setStatus: (id, status) => commitList(KEYS.deliveries, setDeliveries, (list) =>
      list.map((x) => (x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x))
    ).then(() => notify("Estado actualizado: " + DELIVERY_STATES[status].label + ".")),
    addMeta: async (rows) => {
      const remote = await sGet(KEYS.meta, []);
      const base = Array.isArray(remote) ? remote : [];
      const res = mergeMetaRows(base, rows.map((r) => ({ ...r, updatedAt: new Date().toISOString() })));
      setMeta(res.rows);
      const guardado = await sSet(KEYS.meta, res.rows);
      setSync(hasStore() ? (guardado.ok ? "ok" : "err") : "local");
      if (!guardado.ok) setFalloGuardado(explicarFalloDeGuardado(guardado, 0));
      notify(res.agregadas + " filas nuevas" + (res.reemplazadas ? " · " + res.reemplazadas + " actualizadas" : "") + ".");
    },
    saveConfig: async (c) => {
      setConfig(c);
      const res = await sSet(KEYS.config, c);
      setSync(hasStore() ? (res.ok ? "ok" : "err") : "local");
      if (!res.ok) setFalloGuardado(explicarFalloDeGuardado(res, 0));
    },
    restaurar: async (json, modo) => {
      const r = aplicarBackup(json, { config, briefs, deliveries, meta }, modo);
      setConfig(r.config); setBriefs(r.briefs); setDeliveries(r.deliveries); setMeta(r.meta);
      const res = await Promise.all([
        sSet(KEYS.config, r.config), sSet(KEYS.briefs, r.briefs),
        sSet(KEYS.deliveries, r.deliveries), sSet(KEYS.meta, r.meta),
      ]);
      const falla = res.filter((x) => !x.ok)[0];
      if (falla) { setSync("err"); setFalloGuardado(explicarFalloDeGuardado(falla, 0)); notify("Restauré, pero algo no se guardó."); }
      else notify(modo === "reemplazar" ? "Datos reemplazados por el respaldo." : "Respaldo fusionado.");
    },
    wipe: async () => {
      for (const b of briefs) {
        if (b.pdf) await sDelFile(b.pdf.id);
        for (const r of b.refs || []) await sDelFile(r.id);
      }
      setBriefs([]); setDeliveries([]); setMeta([]);
      await Promise.all([sSet(KEYS.briefs, []), sSet(KEYS.deliveries, []), sSet(KEYS.meta, [])]);
    },
  }), [commitList, identity, notify, briefs, config]);

  // Las pantallas ven solo lo vivo; allDeliveries conserva las lápidas
  // para que nextSeq nunca repita un código que ya viajó a Meta.
  const state = { config, briefs: live(briefs), deliveries: live(deliveries), allDeliveries: deliveries, meta };

  if (loading) return <div className="rr"><style>{CSS}</style>
    <div className="gate"><div className="eyebrow"><span className="recdot" />Cargando sala…</div></div></div>;

  if (!identity) return <div className="rr"><style>{CSS}</style>
    <Gate config={config} onEnter={(w) => { setIdentity(w); setTab("dash"); }} /></div>;

  const isAdmin = identity.role === "admin";
  const pendingCount = deliveries.filter((d) => d.status === "entregado").length;
  const myRedo = deliveries.filter((d) => d.editorId === identity.editorId && d.status === "rechazado").length;
  const NAV = [
    { id: "dash", label: "Panel" },
    { id: "briefs", label: "Briefs" },
    { id: "deliveries", label: "Entregas", badge: isAdmin ? (pendingCount || null) : (myRedo || null) },
    { id: "production", label: "Producción" },
    { id: "performance", label: "Rendimiento" },
    { id: "settings", label: "Ajustes" },
  ];

  return <div className="rr">
    <style>{CSS}</style>
    <div className="shell">
      <nav className="rail">
        <div className="brand">
          <div className="eyebrow" style={{ marginBottom: 5 }}><span className="recdot" />{isAdmin ? "Dirección" : "Editor"}</div>
          <h1>RENDER<em>·</em>ROOM</h1>
        </div>
        <div className="navlist">
          {NAV.map((n) => (
            <button key={n.id} className={"navitem" + (tab === n.id ? " on" : "")} onClick={() => setTab(n.id)}>
              {n.label}{n.badge ? <span className="badge">{n.badge}</span> : null}
            </button>))}
        </div>
        <div className="railfoot">
          <div style={{ color: "var(--bone)", marginBottom: 3 }}>{identity.name}</div>
          <div className="mono" style={{ fontSize: 10 }}>
            {sync === "ok" ? "Sincronizado con el equipo" : sync === "local" ? "Modo local (sin sincronizar)" : "Error al guardar"}
          </div>
        </div>
      </nav>

      <div className="main">
        {(sync !== "ok" || falloGuardado) && <div className="franja">
          <b>{sync === "local" ? "Los datos no se están guardando" : "Falló el último guardado"}</b>
          <span>{falloGuardado || (sync === "local"
            ? "Esta copia no tiene base de datos conectada: lo que cargues se pierde al recargar la página, y los demás no lo ven."
            : "Revisá la conexión y volvé a intentar.")}</span>
        </div>}
        <div className="topbar">
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{todayISO()}</span>
          <span className="chip" title={drive
            ? "Los archivos se suben a tu carpeta de Drive."
            : "Sin Drive: los editores cargan el registro pero el archivo lo suben ellos por su cuenta."}
            style={{ borderColor: drive ? "var(--red)" : "var(--line2)", color: drive ? "var(--red)" : "var(--dim)" }}>
            <i className="dot" style={{ background: drive ? "var(--red)" : "var(--dim)" }} />
            {drive === null ? "Drive…" : drive ? "Drive conectado" : "Drive sin conectar"}
          </span>
          <div style={{ marginLeft: "auto" }} className="split">
            {config.driveRootUrl && <a className="btn sm" href={config.driveRootUrl} target="_blank" rel="noreferrer">Abrir Drive</a>}
            <button className="btn sm ghost" onClick={() => { load(); notify("Actualizado."); }}>Actualizar</button>
            <button className="btn sm" onClick={() => (ajustesSucios ? setConfirmarSalida(true) : setIdentity(null))}>Salir</button>
          </div>
        </div>

        {tab === "dash" && <Dashboard state={state} identity={identity} go={setTab} />}
        {tab === "briefs" && <BriefsScreen state={state} identity={identity} actions={actions} />}
        {tab === "deliveries" && <DeliveriesScreen state={state} identity={identity} actions={actions} />}
        {tab === "production" && <ProductionScreen state={state} identity={identity} notify={notify} />}
        {tab === "performance" && <PerformanceScreen state={state} identity={identity} actions={actions} notify={notify} />}
        {tab === "settings" && <SettingsScreen state={state} actions={actions} notify={notify} identity={identity} onDirty={setAjustesSucios} />}
      </div>
    </div>
    {confirmarSalida && <Confirm titulo="Tenés cambios sin guardar" confirmar="Salir igual"
      cuerpo="Los ajustes que editaste no se guardaron. Si salís ahora se pierden."
      onSi={() => { setAjustesSucios(false); setConfirmarSalida(false); setIdentity(null); }}
      onNo={() => setConfirmarSalida(false)} />}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
