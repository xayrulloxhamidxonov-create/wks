"use strict";

/* ============================================================
   2-amaliy. Qizdirgichning sirtqi yuklamasi
   ============================================================ */

const HEAT_V2 = [
  { p: 6.5, t: 800, d: 2.5, L: 38, mat: "X20H80", ap: 0.85 },
  { p: 9.0, t: 950, d: 3.0, L: 42, mat: "X20H80", ap: 0.75 },
  { p: 14.0, t: 1100, d: 4.0, L: 55, mat: "X23Y5T", ap: 0.60 },
  { p: 5.5, t: 750, d: 2.2, L: 35, mat: "X15H60", ap: 0.88 },
  { p: 16.0, t: 1200, d: 4.5, L: 60, mat: "X23Y5T", ap: 0.50 },
  { p: 11.0, t: 900, d: 3.2, L: 48, mat: "X20H80", ap: 0.70 },
  { p: 18.0, t: 1250, d: 5.0, L: 65, mat: "X27Y5T", ap: 0.45 },
  { p: 7.0, t: 850, d: 2.8, L: 40, mat: "X15H60", ap: 0.80 },
  { p: 12.0, t: 1000, d: 3.5, L: 50, mat: "X20H80", ap: 0.65 },
  { p: 20.0, t: 1150, d: 4.8, L: 70, mat: "X27Y5T", ap: 0.55 }
];
const V2_MATS = {
  X20H80: { short: "X20H80", fam: "nix" },
  X15H60: { short: "X15H60", fam: "nix" },
  X23Y5T: { short: "X23Y5T", fam: "fech" },
  X27Y5T: { short: "X27Y5T", fam: "fech" }
};
const V2_T = [700, 850, 900, 1000, 1150, 1250];
const V2_W0 = {
  nix: [3.2, 2.5, 2.2, 1.8, 1.1, null],
  fech: [3.5, 2.8, 2.5, 2.1, 1.4, 1.0]
};

function v2w0(mat, t) {
  const arr = V2_W0[V2_MATS[mat] ? V2_MATS[mat].fam : "nix"];
  if (t <= V2_T[0]) return arr[0];
  for (let i = 1; i < V2_T.length; i++) {
    if (t <= V2_T[i]) {
      if (arr[i] == null || arr[i - 1] == null) return null;
      const k = (t - V2_T[i - 1]) / (V2_T[i] - V2_T[i - 1]);
      return arr[i - 1] + (arr[i] - arr[i - 1]) * k;
    }
  }
  return arr[arr.length - 1];
}

function v2Calc(s) {
  const mat = V2_MATS[s.mat] || V2_MATS.X20H80;
  const p = +s.p, t = +s.t, d = +s.d, L = +s.L, ap = +s.ap, mu = +s.mu;
  const Fn = Math.PI * (d / 10) * (L * 100);
  const w = p * 1000 / Fn;
  const w0 = v2w0(s.mat, t);
  const wR = w0 == null ? null : w0 * ap * mu;
  const dt = 30 + 50 * clamp(w / 4, 0, 1);
  return { mat, Fn, w, w0, wR, dt, tn: t + dt, needD: wR ? d * w / wR : null };
}

function v2Coil(ctx, x, y, h, color, time, amp) {
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const yy = y + h * i / 48;
    const xx = x + Math.sin(i * 0.95 + (time || 0) * 2.2) * amp;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawHeat2(ctx, s, time) {
  const r = v2Calc(s);
  const tt = time || 0;
  const ac = "#f5b84b";
  const hot = heatColor(r.tn);
  heatShell(ctx, "Sirtqi yuklamani hisoblash", "NamDTU · 2026 · 2-amaliy");

  heatPillRow(ctx, ["P = " + fmt(s.p, 1) + " kW", "t = " + fmt(s.t, 0) + " °C", "d = " + fmt(s.d, 1) + " mm", "L = " + fmt(s.L, 0) + " m"], 80, ac);
  heatPillRow(ctx, ["F_n = " + fmt(r.Fn, 0) + " cm²", "w = " + fmt(r.w, 2) + " W/cm²", "α_p = " + fmt(s.ap, 2)], 112, ac);

  const fx = 40, fy = 160, fw = 440, fh = 268;
  panel(ctx, fx, fy, fw, fh, ac);

  rr(ctx, fx + 14, fy + 14, fw - 28, fh - 28, 12);
  ctx.fillStyle = "#0d1923";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .38);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  heatBrick(ctx, fx + 24, fy + 24, fw - 48, 20, "#c98d5a");
  heatBrick(ctx, fx + 24, fy + fh - 44, fw - 48, 20, "#c98d5a");
  heatBrick(ctx, fx + 24, fy + 24, 20, fh - 48, "#c98d5a");
  heatBrick(ctx, fx + fw - 44, fy + 24, 20, fh - 48, "#c98d5a");

  const ch = { x: fx + 58, y: fy + 58, w: fw - 116, h: fh - 116 };
  ctx.fillStyle = "#08111a";
  ctx.fillRect(ch.x, ch.y, ch.w, ch.h);

  const pulse = .8 + .2 * Math.sin(tt * 3.1);
  v2Coil(ctx, ch.x + 26, ch.y + 18, ch.h - 36, heatA("#ff9a55", .9), tt, 7);
  v2Coil(ctx, ch.x + ch.w - 26, ch.y + 18, ch.h - 36, heatA("#ff9a55", .9), tt, -7);

  const wy = ch.y + 34, wh = ch.h - 68, wx = fx + fw / 2 - 34;
  heatGlow(ctx, fx + fw / 2, ch.y + ch.h / 2, 120, "#ff9a55");
  heatSteel(ctx, wx, wy, 68, wh, hot);
  text(ctx, "zagotovka", wx + 34, ch.y + ch.h - 4, { size: 9, align: "center", color: "rgba(200,220,235,.6)" });

  ctx.strokeStyle = heatA("#ffd27a", .55 * pulse);
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 7; i++) {
    const yy = ch.y + 28 + i * (ch.h - 56) / 6;
    arrow(ctx, ch.x + 40, yy, wx - 8, yy, heatA("#ffd27a", .35 * pulse), 1.4, 5);
    arrow(ctx, ch.x + ch.w - 40, yy, wx + 76, yy, heatA("#ffd27a", .35 * pulse), 1.4, 5);
  }

  const ux = wx + 20, uy = ch.y + ch.h / 2 - 12;
  ctx.strokeStyle = "#9ff0e7";
  ctx.lineWidth = 1.3;
  ctx.strokeRect(ux, uy, 28, 24);
  text(ctx, "1 sm²", ux + 32, uy + 16, { size: 9, color: "#9ff0e7" });

  text(ctx, "ERKIN JOYLASHGAN SPIRAL", fx + 24, fy + fh - 16, { size: 8.5, weight: 750, color: heatA(ac, .7) });

  const px = 512, pw = 418;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "YUKLAMALARNI TAQQOSLASH", ac);

  const maxW = Math.max(r.w, r.wR || 0, .1) * 1.16;
  const barW = 224;
  const rows = [
    ["Haqiqiy, w", r.w, r.w <= (r.wR || 0) ? "#5ee08a" : "#ff7a6b", fy + 52],
    ["Ruxsat, w_ruxsat", r.wR || 0, "#8fd3ff", fy + 102]
  ];
  rows.forEach(row => {
    text(ctx, row[0], px + 18, row[3] + 11, { size: 9.5, color: "rgba(190,215,230,.72)" });
    heatBar(ctx, px + 18, row[3] + 18, barW, 12, row[1] / maxW, row[2]);
    text(ctx, fmt(row[1], 2), px + 18 + barW + 12, row[3] + 29, { size: 11.5, mono: true, weight: 650, color: row[2] });
  });

  const ok = r.wR != null && r.w <= r.wR;
  const statusY = fy + 168;
  rr(ctx, px + 18, statusY, pw - 36, 44, 9);
  ctx.fillStyle = ok ? "rgba(94,224,138,.08)" : "rgba(255,110,90,.09)";
  ctx.fill();
  ctx.strokeStyle = ok ? "rgba(94,224,138,.32)" : "rgba(255,110,90,.38)";
  ctx.stroke();
  text(ctx, ok ? "YUKLAMA RUXSAT ETILGAN" : "YUKLAMA OSHIB KETGAN", px + 30, statusY + 18, {
    size: 10, weight: 800, color: ok ? "#a9f0c0" : "#ffb3a6"
  });
  text(ctx, r.wR == null ? "w0 jadvalda yo‘q — material mos emas" : "w / w_ruxsat = " + fmt(r.w / r.wR, 2) + " · Δt = " + fmt(r.dt, 0) + " °C",
    px + 30, statusY + 34, { size: 9.5, color: "rgba(200,220,235,.7)" });

  heatRow(ctx, px + 18, fy + 236, "Qizdirgich sirti, t_n", fmt(r.tn, 0) + " °C", hot);
  heatRow(ctx, px + 150, fy + 236, "Pech muhiti, t", fmt(s.t, 0) + " °C", "#e9f4fb");
  heatRow(ctx, px + 282, fy + 236, "w_0 (jadval)", r.w0 == null ? "—" : fmt(r.w0, 2), "#f6dfb4");

  text(ctx, "F_n = π·d·L   ·   w = P·1000 / F_n   ·   w_ruxsat = w_0·α_p·μ", 30, 518, { size: 10.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-2",
  subject: "quymakorlik",
  name: "2-ish · Sirtqi yuklama",
  labLabel: "2-ish · Sirtqi yuklama",
  kicker: "Quymakorlik · qizdirish qurilmalari",
  title: "Qizdirgich sirtiga qanday yuklama tushadi?",
  goal: "Maqsad: qizdirgich simining sirt yuzasi <b>F_n</b>, haqiqiy solishtirma quvvat <b>w</b> va ruxsat etilgan <b>w_ruxsat</b> qiymatlarini hisoblab, qizdirgichning ishonchliligini baholash.",
  accent: "#f5b84b",
  equipment: ["Mufelli elektr pech", "Nixrom / FeChral sim", "Shtangensirkul", "Ommetr", "Termojuft", "Lupa"],
  bigLabel: "haqiqiy sirt yuki",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 1-jadval. w_0 harorat bo‘yicha jadvaldan interpolyatsiya qilinadi; μ = 0,90. w ≤ w_ruxsat sharti bajarilishi shart.",
  controls: [
    heatVarSelect(HEAT_V2, v => fmt(v.p, 1) + " kW · " + fmt(v.t, 0) + " °C · Ø" + fmt(v.d, 1) + " mm"),
    { id: "p", label: "Pech quvvati, P", type: "range", min: 3, max: 25, step: .5, value: 10, unit: "kW", dec: 1 },
    { id: "t", label: "Ishchi harorat, t", type: "range", min: 600, max: 1300, step: 25, value: 900, unit: "°C", dec: 0 },
    { id: "d", label: "Sim diametri, d", type: "range", min: 1.5, max: 6, step: .1, value: 3, unit: "mm", dec: 1 },
    { id: "L", label: "Sim uzunligi, L", type: "range", min: 20, max: 80, step: 1, value: 45, unit: "m", dec: 0 },
    { id: "mat", label: "Qizdirgich materiali", type: "select", value: "X20H80", options: [
      { value: "X20H80", label: "X20H80 — Nixrom" },
      { value: "X15H60", label: "X15H60 — Nixrom" },
      { value: "X23Y5T", label: "X23Y5T — FeChral" },
      { value: "X27Y5T", label: "X27Y5T — FeChral" }
    ] },
    { id: "ap", label: "Joylashuv koeffitsiyenti, α_p", type: "range", min: .35, max: .95, step: .01, value: .75, dec: 2 },
    { id: "mu", label: "Nurlatish koeffitsiyenti, μ", type: "range", min: .85, max: .95, step: .01, value: .90, dec: 2 }
  ],
  state: { variant: 1, p: 10, t: 900, d: 3, L: 45, mat: "X20H80", ap: .75, mu: .90 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V2, { p: "p", t: "t", d: "d", L: "L", mat: "mat", ap: "ap" });
  },
  compute(s) {
    const r = v2Calc(s);
    const ok = r.wR != null && r.w <= r.wR;
    const verdict = r.wR == null
      ? "⚠ " + r.mat.short + " uchun " + fmt(s.t, 0) + " °C da ruxsat etilgan w_0 jadvalda yo‘q — material almashtirilishi kerak."
      : ok
        ? "w ≤ w_ruxsat — yuklama ruxsat etilgan chegarada, qizdirgich ishonchli ishlaydi."
        : "w > w_ruxsat — qizdirgich haddan tashqari qizib, tez ishdan chiqadi. Sim diametrini kamida Ø" + fmt(r.needD, 1) + " mm gacha oshirish kerak.";
    return {
      big: fmt(r.w, 2) + " W/cm²",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Quvvat, P", fmt(s.p, 1), "kW"],
        ["Ishchi harorat, t", fmt(s.t, 0), "°C"],
        ["Sim diametri, d", fmt(s.d, 1), "mm"],
        ["Sim uzunligi, L", fmt(s.L, 0), "m"],
        ["Material", r.mat.short, ""],
        ["Sirt yuzasi, F_n", fmt(r.Fn, 2), "cm²", true],
        ["Haqiqiy yuk, w", fmt(r.w, 2), "W/cm²", true],
        ["Jadval bo‘yicha, w_0", r.w0 == null ? "—" : fmt(r.w0, 2), "W/cm²"],
        ["Ruxsat etilgan, w_ruxsat", r.wR == null ? "—" : fmt(r.wR, 3), "W/cm²", true],
        ["w / w_ruxsat", r.wR == null ? "—" : fmt(r.w / r.wR, 2), ""],
        ["Sirt harorati, t_n", fmt(r.tn, 1), "°C"],
        ["Haroratlar farqi, Δt", fmt(r.dt, 1), "°C"]
      ],
      calc:
        "Berilgan: P = " + fmt(s.p, 1) + " kW, t = " + fmt(s.t, 0) + " °C, d = " + fmt(s.d, 1) + " mm, L = " + fmt(s.L, 0) + " m\n" +
        "α_p = " + fmt(s.ap, 2) + ", μ = " + fmt(s.mu, 2) + ", material " + r.mat.short + "\n\n" +
        "1) F_n = π·d·L = 3,1416·" + fmt(+s.d / 10, 2) + "·" + fmt(+s.L * 100, 0) + " = " + fmt(r.Fn, 2) + " cm²\n\n" +
        "2) w = P·1000 / F_n = " + fmt(+s.p * 1000, 0) + " / " + fmt(r.Fn, 2) + " = " + fmt(r.w, 2) + " W/cm²\n\n" +
        "3) w_0 (" + fmt(s.t, 0) + " °C) = " + (r.w0 == null ? "jadvalda yo‘q" : fmt(r.w0, 2) + " W/cm²") + "\n" +
        "   w_ruxsat = w_0·α_p·μ = " + (r.wR == null ? "—" : fmt(r.w0, 2) + "·" + fmt(s.ap, 2) + "·" + fmt(s.mu, 2) + " = " + fmt(r.wR, 3)) + " W/cm²\n\n" +
        "4) Δt = 30 + 50·(w/4) = " + fmt(r.dt, 1) + " °C\n" +
        "   t_n = t + Δt = " + fmt(s.t, 0) + " + " + fmt(r.dt, 1) + " = " + fmt(r.tn, 1) + " °C\n\n" + verdict,
      conclusion:
        "№" + s.variant + " variant: F_n = " + fmt(r.Fn, 0) + " cm², w = " + fmt(r.w, 2) + " W/cm², w_ruxsat = " +
        (r.wR == null ? "—" : fmt(r.wR, 2)) + " W/cm². " + verdict +
        (r.needD ? " Kerakli minimal diametr: Ø" + fmt(r.needD, 1) + " mm." : "")
    };
  },
  steps: [
    "Variantdagi P, t, d, L, material va α_p qiymatlarini yozib oling.",
    "F_n = π·d·L formulasida d ni sm, L ni sm ga o‘tkazib sirt yuzasini hisoblang.",
    "w = P·1000/F_n orqali haqiqiy solishtirma yuklamani toping.",
    "1-jadvaldan w_0 ni aniqlang va w_ruxsat = w_0·α_p·μ ni hisoblang.",
    "w va w_ruxsat ni taqqoslab, qizdirgich ishonchliligi bo‘yicha xulosa yozing.",
    "Zarur bo‘lsa, sim diametrini w ≤ w_ruxsat sharti bajarilgunga qadar oshiring.",
    "Natijalarni jadvalga yozing va hisobotni yuklab oling."
  ],
  questions: [
    "Sirtqi yuklama w qanday birlikda o‘lchanadi va u nimani ifodalaydi?",
    "Harorat oshishi bilan w_0 nega kamayadi?",
    "Yopiq ariqchada α_p nega erkin osilgandan kichik?",
    "w > w_ruxsat bo‘lsa qanday salbiy oqibat yuz beradi?",
    "Sim diametri ikki barobar oshirilsa, w qanday o‘zgaradi?",
    "FeChral qotishmasining nixromga nisbatan afzalligi nimada?"
  ],
  draw: drawHeat2
});

/* ============================================================
   3-amaliy. Induksion pech
   ============================================================ */

const HEAT_V3 = [
  { mat: "st3", m: 20, t2: 1200, min: 6, f: 2500, eiss: .75, eel: .70 },
  { mat: "cu", m: 12, t2: 850, min: 4, f: 8000, eiss: .80, eel: .65 },
  { mat: "al", m: 8, t2: 600, min: 3, f: 10000, eiss: .82, eel: .60 },
  { mat: "ss", m: 25, t2: 1100, min: 8, f: 1000, eiss: .72, eel: .72 },
  { mat: "ch", m: 35, t2: 1250, min: 10, f: 500, eiss: .70, eel: .75 },
  { mat: "br", m: 18, t2: 900, min: 5, f: 4000, eiss: .78, eel: .68 },
  { mat: "s45", m: 15, t2: 1000, min: 5, f: 2500, eiss: .76, eel: .71 },
  { mat: "ti", m: 10, t2: 950, min: 4, f: 8000, eiss: .70, eel: .65 },
  { mat: "s60", m: 30, t2: 1150, min: 7, f: 1000, eiss: .74, eel: .73 },
  { mat: "bronza", m: 14, t2: 800, min: 4, f: 4000, eiss: .80, eel: .66 }
];
const V3_MATS = {
  st3: { name: "Po‘lat St3", c: 680, rho: 0.20e-6 },
  cu: { name: "Mis M1", c: 390, rho: 0.0175e-6 },
  al: { name: "Alyuminiy", c: 900, rho: 0.028e-6 },
  ss: { name: "Zanglamas po‘lat", c: 500, rho: 0.75e-6 },
  ch: { name: "Cho‘yan SCh20", c: 540, rho: 0.60e-6 },
  br: { name: "Latun L63", c: 380, rho: 0.07e-6 },
  s45: { name: "Po‘lat 45", c: 680, rho: 0.22e-6 },
  ti: { name: "Titan qotishmasi", c: 550, rho: 1.70e-6 },
  s60: { name: "Po‘lat 60SG", c: 680, rho: 0.25e-6 },
  bronza: { name: "Bronza", c: 380, rho: 0.10e-6 }
};

function v3Calc(s) {
  const mat = V3_MATS[s.mat] || V3_MATS.st3;
  const m = +s.m, t1 = 20, t2 = +s.t2, sec = +s.min * 60, f = +s.f;
  const Q = m * mat.c * (t2 - t1);
  const Pf = Q / sec / 1000;
  const Pt = Pf / (+s.eiss * +s.eel);
  const delta = 503 * Math.sqrt(mat.rho / (1 * f)) * 1000;
  return { mat, t1, t2, sec, Q, Pf, Pt, delta, eta: +s.eiss * +s.eel };
}

function drawHeat3(ctx, s, time) {
  const r = v3Calc(s);
  const tt = time || 0;
  const ac = "#ff9f6b";
  heatShell(ctx, "Induksion pechni hisoblash", "NamDTU · 2026 · 3-amaliy");

  heatPillRow(ctx, [r.mat.name, "m = " + fmt(s.m, 0) + " kg", "20 → " + fmt(s.t2, 0) + " °C", "t = " + fmt(s.min, 0) + " min"], 80, ac);
  heatPillRow(ctx, ["f = " + fmt(s.f, 0) + " Hz", "η_iss = " + fmt(s.eiss, 2), "η_el = " + fmt(s.eel, 2), "δ = " + fmt(r.delta, 1) + " mm"], 112, ac);

  const fx = 40, fy = 160, fw = 400, fh = 270;
  panel(ctx, fx, fy, fw, fh, ac);

  const cx = fx + fw / 2, cy = fy + fh / 2;
  heatGlow(ctx, cx, cy, 150, "#ff9a55");

  const cylW = 120, cylH = 190;
  heatSteel(ctx, cx - cylW / 2, cy - cylH / 2, cylW, cylH, heatColor(+s.t2));

  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - cylW / 2, cy - cylH / 2, cylW, cylH);
  ctx.clip();
  const skin = clamp(r.delta / 15, .08, .5);
  const g = ctx.createLinearGradient(cx - cylW / 2, 0, cx + cylW / 2, 0);
  g.addColorStop(0, heatA("#ffe6a3", .85));
  g.addColorStop(skin, heatA("#ff8a4d", .15));
  g.addColorStop(1 - skin, heatA("#ff8a4d", .15));
  g.addColorStop(1, heatA("#ffe6a3", .85));
  ctx.fillStyle = g;
  ctx.fillRect(cx - cylW / 2, cy - cylH / 2, cylW, cylH);
  ctx.restore();

  for (let i = 0; i < 7; i++) {
    const yy = cy - cylH / 2 + 18 + i * (cylH - 36) / 6;
    const ry = 14 + 8 * Math.sin(tt * 1.6 + i * .5);
    ctx.beginPath();
    ctx.ellipse(cx, yy, cylW / 2 + 18 + ry, 9, 0, 0, TAU);
    ctx.strokeStyle = heatA("#ffb27a", .55);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, yy, cylW / 2 + 18 + ry, 9, 0, 0, TAU);
    ctx.strokeStyle = heatA("#ffe1b0", .28);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, cylW / 2 + 40 + i * 22, cylH / 2 + 12 + i * 14, 0, 0, TAU);
    ctx.setLineDash([4, 7]);
    ctx.strokeStyle = heatA("#8fd3ff", .18);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  text(ctx, "induktor (mis quvur)", cx, fy + 24, { size: 9.5, align: "center", color: "#f0b48a" });
  text(ctx, "δ = " + fmt(r.delta, 1) + " mm", cx + cylW / 2 + 12, cy + cylH / 2 + 20, { size: 9.5, color: "#ffe0b5" });

  const px = 466, pw = 464;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "QUVVAT BALANSI", ac);

  const maxP = Math.max(r.Pt, 1);
  [["Issiqlik quvvati, P_f", r.Pf, "#ff9f6b", fy + 48], ["To‘liq quvvat, P_t", r.Pt, "#f5b84b", fy + 98]].forEach(row => {
    text(ctx, row[0], px + 18, row[3] + 11, { size: 9.5, color: "rgba(190,215,230,.72)" });
    heatBar(ctx, px + 18, row[3] + 18, 300, 12, row[1] / maxP, row[2]);
    text(ctx, fmt(row[1], 2) + " kW", px + 330, row[3] + 29, { size: 11.5, mono: true, weight: 650, color: row[2] });
  });

  heatSpark(ctx, px + 18, fy + 140, 210, 68, [1, .78, .6, .46, .36].map(v => v), "#8fd3ff", true);
  text(ctx, "δ ~ 1/√f", px + 24, fy + 156, { size: 10, mono: true, color: "#b9e2ff" });
  text(ctx, "chastota ortishi bilan", px + 18, fy + 226, { size: 9, color: "rgba(180,210,230,.6)" });
  text(ctx, "tok sirtga siqiladi", px + 18, fy + 240, { size: 9, color: "rgba(180,210,230,.6)" });

  heatGauge(ctx, px + 330, fy + 186, 46, r.Pt / (maxP * 1.15), "#f5b84b", fmt(r.Pt, 0), "kW · to‘liq");
  text(ctx, "η = " + fmt(r.eta, 3), px + 330, fy + 252, { size: 9.5, align: "center", color: "rgba(200,220,235,.7)" });

  text(ctx, "δ = 503·√(ρ/(μ_r·f))   ·   Q = m·c·ΔT   ·   P_f = Q/t   ·   P_t = P_f/(η_iss·η_el)", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-3",
  subject: "quymakorlik",
  name: "3-ish · Induksion pech",
  labLabel: "3-ish · Induksion pech",
  kicker: "Quymakorlik · qizdirish qurilmalari",
  title: "Induksion pech qancha quvvat talab qiladi?",
  goal: "Maqsad: metall massasi, harorati va qizdirish vaqtidan foydalanib foydali issiqlik <b>Q</b>, quvvat <b>P_f</b>, to‘liq quvvat <b>P_t</b> va tokning penetratsiya chuqurligi <b>δ</b> ni hisoblash.",
  accent: "#ff9f6b",
  equipment: ["Induksion pech", "Mis induktor", "Yuqori chastotali generator", "Suv sovitish tizimi", "Sekundomer", "Termojuft"],
  bigLabel: "to‘liq elektr quvvati",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 3-jadval. c va ρ — material jadvalidan; Kyuri nuqtasidan yuqori haroratda μ_r = 1 qabul qilingan. δ formulada m da, natija mm da beriladi.",
  controls: [
    heatVarSelect(HEAT_V3, v => V3_MATS[v.mat].name + " · " + fmt(v.m, 0) + " kg · " + fmt(v.f, 0) + " Hz"),
    { id: "mat", label: "Metall materiali", type: "select", value: "s45", options: Object.keys(V3_MATS).map(k => ({ value: k, label: V3_MATS[k].name })) },
    { id: "m", label: "Metall massasi, m", type: "range", min: 5, max: 40, step: 1, value: 15, unit: "kg", dec: 0 },
    { id: "t2", label: "Yakuniy harorat, T₂", type: "range", min: 500, max: 1300, step: 25, value: 1000, unit: "°C", dec: 0 },
    { id: "min", label: "Qizdirish vaqti, t", type: "range", min: 2, max: 12, step: .5, value: 5, unit: "min", dec: 1 },
    { id: "f", label: "Tok chastotasi, f", type: "select", value: "2500", options: [
      { value: "500", label: "500 Hz — yirik zagotovka" },
      { value: "1000", label: "1 000 Hz" },
      { value: "2500", label: "2 500 Hz" },
      { value: "4000", label: "4 000 Hz" },
      { value: "8000", label: "8 000 Hz" },
      { value: "10000", label: "10 000 Hz — kichik detal" }
    ] },
    { id: "eiss", label: "Issiqlik FIK, η_iss", type: "range", min: .65, max: .85, step: .01, value: .76, dec: 2 },
    { id: "eel", label: "Elektr FIK, η_el", type: "range", min: .55, max: .80, step: .01, value: .71, dec: 2 }
  ],
  state: { variant: 1, mat: "s45", m: 15, t2: 1000, min: 5, f: 2500, eiss: .76, eel: .71 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V3, { mat: "mat", m: "m", t2: "t2", min: "min", f: "f", eiss: "eiss", eel: "eel" });
  },
  compute(s) {
    const r = v3Calc(s);
    return {
      big: fmt(r.Pt, 2) + " kW",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Material", r.mat.name, ""],
        ["Massasi, m", fmt(s.m, 0), "kg"],
        ["Harorat, T₁ → T₂", "20 → " + fmt(s.t2, 0), "°C"],
        ["Qizdirish vaqti, t", fmt(s.min, 1), "min"],
        ["Chastota, f", fmt(s.f, 0), "Hz"],
        ["Solishtirma issiqlik, c", fmt(r.mat.c, 0), "J/(kg·°C)"],
        ["Foydali issiqlik, Q", fmt(r.Q / 1e6, 2), "MJ", true],
        ["Foydali quvvat, P_f", fmt(r.Pf, 2), "kW", true],
        ["Issiqlik FIK, η_iss", fmt(s.eiss, 2), ""],
        ["Elektr FIK, η_el", fmt(s.eel, 2), ""],
        ["Umumiy FIK, η", fmt(r.eta, 3), ""],
        ["To‘liq quvvat, P_t", fmt(r.Pt, 2), "kW", true],
        ["Penetratsiya chuqurligi, δ", fmt(r.delta, 2), "mm", true]
      ],
      calc:
        "Berilgan: m = " + fmt(s.m, 0) + " kg, T₁ = 20 °C, T₂ = " + fmt(s.t2, 0) + " °C, t = " + fmt(s.min, 1) + " min = " + fmt(r.sec, 0) + " s\n" +
        "c = " + fmt(r.mat.c, 0) + " J/(kg·°C), ρ = " + fmt(r.mat.rho * 1e6, 3) + "·10⁻⁶ Ω·m, μ_r = 1, f = " + fmt(s.f, 0) + " Hz\n\n" +
        "1) Q = m·c·(T₂ − T₁) = " + fmt(s.m, 0) + "·" + fmt(r.mat.c, 0) + "·" + fmt(+s.t2 - 20, 0) + " = " + fmt(r.Q, 0) + " J = " + fmt(r.Q / 1e6, 2) + " MJ\n\n" +
        "2) P_f = Q/t = " + fmt(r.Q, 0) + " / " + fmt(r.sec, 0) + " = " + fmt(r.Pf * 1000, 0) + " W = " + fmt(r.Pf, 2) + " kW\n\n" +
        "3) P_t = P_f/(η_iss·η_el) = " + fmt(r.Pf, 2) + " / (" + fmt(s.eiss, 2) + "·" + fmt(s.eel, 2) + ") = " + fmt(r.Pt, 2) + " kW\n\n" +
        "4) δ = 503·√(ρ/(μ_r·f))\n" +
        "     = 503·√(" + fmt(r.mat.rho, 6) + "/(1·" + fmt(s.f, 0) + ")) = " + fmt(r.delta / 1000, 4) + " m = " + fmt(r.delta, 2) + " mm",
      conclusion:
        "№" + s.variant + " variant: " + r.mat.name + "dan " + fmt(s.m, 0) + " kg metallni " + fmt(s.t2, 0) + " °C gacha " +
        fmt(s.min, 1) + " daqiqada qizdirish uchun Q = " + fmt(r.Q / 1e6, 2) + " MJ issiqlik va P_t = " + fmt(r.Pt, 2) +
        " kW to‘liq quvvat talab etiladi. f = " + fmt(s.f, 0) + " Hz da δ = " + fmt(r.delta, 2) + " mm."
    };
  },
  steps: [
    "Variantdagi material, massa, harorat, vaqt va chastotani yozib oling.",
    "Material uchun c va ρ qiymatlarini jadvaldan aniqlang.",
    "Q = m·c·(T₂ − T₁) foydali issiqlik miqdorini hisoblang.",
    "P_f = Q/t foydali quvvatni toping (t — sekundda).",
    "P_t = P_f/(η_iss·η_el) to‘liq quvvatni hisoblang.",
    "δ = 503·√(ρ/(μ_r·f)) penetratsiya chuqurligini toping.",
    "Natijalarni tahlil qilib, chastota va quvvat bo‘yicha xulosa yozing."
  ],
  questions: [
    "Induksion qizdirish qaysi fizik hodisaga asoslangan?",
    "Skin-effekt nima va δ chastotaga qanday bog‘liq?",
    "Nima uchun induktor mis quvurdan tayyorlanadi?",
    "Kyuri nuqtasidan yuqori haroratda μ_r qanday o‘zgaradi?",
    "η_iss va η_el kamayishi P_t ga qanday ta’sir qiladi?",
    "Yirik va kichik detallar uchun chastota qanday tanlanadi?"
  ],
  draw: drawHeat3
});

/* ============================================================
   4-amaliy. Yumshatish pechi
   ============================================================ */

const HEAT_V4 = [
  { p: 1800, t2: 800, c: .65, k: 1.35 },
  { p: 2200, t2: 850, c: .67, k: 1.38 },
  { p: 2000, t2: 900, c: .70, k: 1.40 },
  { p: 1500, t2: 780, c: .64, k: 1.32 },
  { p: 3000, t2: 870, c: .68, k: 1.42 },
  { p: 2500, t2: 830, c: .66, k: 1.36 },
  { p: 2800, t2: 890, c: .69, k: 1.40 },
  { p: 1900, t2: 820, c: .65, k: 1.34 },
  { p: 3200, t2: 920, c: .71, k: 1.45 },
  { p: 2400, t2: 860, c: .67, k: 1.37 }
];
const V4_QN = 35500, V4_ETA = .85;

function v4Calc(s) {
  const Qf = +s.p * +s.c * (+s.t2 - 20);
  const Qt = Qf * +s.k;
  const B = Qt / (V4_QN * V4_ETA);
  return { Qf, Qt, loss: Qt - Qf, B };
}

function drawHeat4(ctx, s, time) {
  const r = v4Calc(s);
  const tt = time || 0;
  const ac = "#ffb26b";
  heatShell(ctx, "Yumshatish pechini hisoblash", "NamDTU · 2026 · 4-amaliy");

  heatPillRow(ctx, ["P = " + fmt(s.p, 0) + " kg/soat", "T₂ = " + fmt(s.t2, 0) + " °C", "c = " + fmt(s.c, 2), "k = " + fmt(s.k, 2)], 80, ac);
  heatPillRow(ctx, ["Q_f = " + fmt(r.Qf / 1000, 0) + " MJ/soat", "Q_umum = " + fmt(r.Qt / 1000, 0) + " MJ/soat", "B = " + fmt(r.B, 2) + " m³/soat"], 112, ac);

  const fx = 40, fy = 160, fw = 440, fh = 272;
  panel(ctx, fx, fy, fw, fh, ac);

  rr(ctx, fx + 16, fy + 26, fw - 32, fh - 54, 10);
  ctx.fillStyle = "#101c26";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .4);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  heatBrick(ctx, fx + 26, fy + 36, fw - 52, 18, "#c98d5a");
  heatBrick(ctx, fx + 26, fy + fh - 56, fw - 52, 18, "#c98d5a");

  const chx = fx + 42, chy = fy + 64, chw = fw - 120, chh = fh - 132;
  ctx.fillStyle = "#08111a";
  ctx.fillRect(chx, chy, chw, chh);
  heatGlow(ctx, chx + chw / 2, chy + chh / 2, 130, "#ff9a55");

  const hot = heatColor(+s.t2);
  for (let i = 0; i < 4; i++) {
    heatSteel(ctx, chx + 22 + i * 46, chy + 30, 34, chh - 60, hot);
  }
  text(ctx, "po‘lat detallar", chx + chw / 2, chy + chh + 18, { size: 9, align: "center", color: "rgba(200,220,235,.65)" });

  for (let i = 0; i < 5; i++) heatFlame(ctx, chx + 30 + i * 60, chy + chh + 6, 16, tt + i, "#ff9a55");
  heatFlow(ctx, chx + 20, chy + chh + 14, chx + chw - 20, chy + chh + 14, heatA("#ffb27a", .5), tt, 22);

  const gx = fx + fw - 54;
  rr(ctx, gx, fy + 52, 26, fh - 108, 8);
  ctx.fillStyle = "#18242f";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .35);
  ctx.stroke();
  text(ctx, "gaz", gx + 13, fy + fh - 44, { size: 8.5, align: "center", color: "rgba(200,220,235,.65)" });

  const px = 506, pw = 424;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "HARORAT–VAQT REJIMI", ac);

  const gx0 = px + 24, gy0 = fy + 52, gw = 220, gh = 104;
  heatGrid(ctx, gx0, gy0, gw, gh);
  const Tn = +s.t2;
  const pts = [
    [0, .04], [.16, .1], [.34, Tn / 1000], [.42, Tn / 1000],
    [.58, Tn / 1000], [.78, Tn * .55 / 1000], [1, .06]
  ];
  heatSpark(ctx, gx0, gy0, gw, gh, pts.map(p => clamp(p[1], 0, 1)), "#ffb26b", true);
  text(ctx, "T₂ = " + fmt(Tn, 0) + " °C", gx0 + gw - 4, gy0 + 12, { size: 9, align: "right", mono: true, color: "#ffd0a0" });
  text(ctx, "qizdirish", gx0 + gw * .28, gy0 + gh + 14, { size: 8.5, align: "center", color: "rgba(190,215,230,.6)" });
  text(ctx, "ushlash", gx0 + gw * .5, gy0 + gh + 14, { size: 8.5, align: "center", color: "rgba(190,215,230,.6)" });
  text(ctx, "sovitish", gx0 + gw * .86, gy0 + gh + 14, { size: 8.5, align: "center", color: "rgba(190,215,230,.6)" });

  heatRow(ctx, px + 264, fy + 64, "Foydali issiqlik", fmt(r.Qf / 1000, 0) + " MJ/soat", "#ffcf9a");
  heatRow(ctx, px + 264, fy + 108, "Yo‘qotishlar", fmt(r.loss / 1000, 0) + " MJ/soat", "#ff9f6b");
  heatRow(ctx, px + 264, fy + 152, "Gaz sarfi, B", fmt(r.B, 2) + " m³/soat", "#f5b84b");

  const tot = Math.max(r.Qt, 1);
  heatBar(ctx, px + 18, fy + 204, pw - 36, 14, r.Qf / tot, "#ffcf9a");
  text(ctx, "foydali " + fmt(r.Qf / r.Qt * 100, 1) + "%", px + 20, fy + 232, { size: 9.5, color: "#ffcf9a" });
  text(ctx, "yo‘qotish " + fmt(r.loss / r.Qt * 100, 1) + "%", px + pw - 20, fy + 232, { size: 9.5, align: "right", color: "#ff9f6b" });

  text(ctx, "Q_n^p = 35 500 kJ/m³ · η = 0,85 · yo‘qotish koeffitsiyenti k", px + 18, fy + 256, { size: 9, color: "rgba(190,215,230,.55)" });

  text(ctx, "Q_f = P·c·(T₂−20)   ·   Q_umum = Q_f·k   ·   B = Q_umum/(Q_n^p·η)", 30, 518, { size: 10, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-4",
  subject: "quymakorlik",
  name: "4-ish · Yumshatish pechi",
  labLabel: "4-ish · Yumshatish pechi",
  kicker: "Quymakorlik · termik pechlar",
  title: "Yumshatish pechi qancha gaz sarflaydi?",
  goal: "Maqsad: pech mahsuldorligi va harorat rejimidan foydalanib foydali issiqlik <b>Q_f</b>, umumiy issiqlik <b>Q_umum</b> va tabiiy gaz sarfi <b>B</b> ni hisoblash.",
  accent: "#ffb26b",
  equipment: ["Kamera tipli yumshatish pechi", "Tabiiy gaz gorelkasi", "Gaz hisoblagichi", "Termojuft", "Sekundomer"],
  bigLabel: "gaz sarfi",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 4-jadval. Q_n^p = 35 500 kJ/m³, η = 0,85. Yo‘qotish koeffitsiyenti k variantda berilgan.",
  controls: [
    heatVarSelect(HEAT_V4, v => fmt(v.p, 0) + " kg/soat · " + fmt(v.t2, 0) + " °C · k = " + fmt(v.k, 2)),
    { id: "p", label: "Mahsuldorlik, P", type: "range", min: 1000, max: 3500, step: 100, value: 2500, unit: "kg/soat", dec: 0 },
    { id: "t2", label: "Qizdirish harorati, T₂", type: "range", min: 700, max: 950, step: 10, value: 850, unit: "°C", dec: 0 },
    { id: "c", label: "Issiqlik sig‘imi, c", type: "range", min: .60, max: .75, step: .01, value: .68, unit: "kJ/(kg·°C)", dec: 2 },
    { id: "k", label: "Yo‘qotish koeffitsiyenti, k", type: "range", min: 1.25, max: 1.50, step: .01, value: 1.40, dec: 2 }
  ],
  state: { variant: 1, p: 2500, t2: 850, c: .68, k: 1.40 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V4, { p: "p", t2: "t2", c: "c", k: "k" });
  },
  compute(s) {
    const r = v4Calc(s);
    return {
      big: fmt(r.B, 2) + " m³/soat",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Mahsuldorlik, P", fmt(s.p, 0), "kg/soat"],
        ["Harorat, T₂", fmt(s.t2, 0), "°C"],
        ["Issiqlik sig‘imi, c", fmt(s.c, 2), "kJ/(kg·°C)"],
        ["Yo‘qotish koeffitsiyenti, k", fmt(s.k, 2), ""],
        ["Foydali issiqlik, Q_f", fmt(r.Qf, 0), "kJ/soat", true],
        ["Foydali quvvat", fmt(r.Qf / 3600, 1), "kW"],
        ["Umumiy issiqlik, Q_umum", fmt(r.Qt, 0), "kJ/soat", true],
        ["Yo‘qotishlar", fmt(r.loss, 0), "kJ/soat"],
        ["Gaz sarfi, B", fmt(r.B, 2), "m³/soat", true]
      ],
      calc:
        "Berilgan: P = " + fmt(s.p, 0) + " kg/soat, T₂ = " + fmt(s.t2, 0) + " °C, c = " + fmt(s.c, 2) + " kJ/(kg·°C), k = " + fmt(s.k, 2) + "\n" +
        "Q_n^p = 35 500 kJ/m³, η = 0,85\n\n" +
        "1) Q_f = P·c·(T₂ − 20) = " + fmt(s.p, 0) + "·" + fmt(s.c, 2) + "·" + fmt(+s.t2 - 20, 0) + " = " + fmt(r.Qf, 0) + " kJ/soat\n" +
        "   Q_f = " + fmt(r.Qf / 3600, 1) + " kW\n\n" +
        "2) Q_umum = Q_f·k = " + fmt(r.Qf, 0) + "·" + fmt(s.k, 2) + " = " + fmt(r.Qt, 0) + " kJ/soat\n" +
        "   Yo‘qotishlar = Q_umum − Q_f = " + fmt(r.loss, 0) + " kJ/soat\n\n" +
        "3) B = Q_umum/(Q_n^p·η) = " + fmt(r.Qt, 0) + " / (35 500·0,85) = " + fmt(r.B, 2) + " m³/soat",
      conclusion:
        "№" + s.variant + " variant: P = " + fmt(s.p, 0) + " kg/soat mahsuldorlikda po‘latni " + fmt(s.t2, 0) +
        " °C gacha yumshatish uchun Q_f = " + fmt(r.Qf, 0) + " kJ/soat foydali issiqlik, Q_umum = " + fmt(r.Qt, 0) +
        " kJ/soat umumiy issiqlik sarflanadi. Gaz sarfi B = " + fmt(r.B, 2) + " m³/soat."
    };
  },
  steps: [
    "Variantdagi P, T₂, c va k qiymatlarini yozib oling.",
    "Q_f = P·c·(T₂ − 20) foydali issiqlikni hisoblang.",
    "Q_umum = Q_f·k orqali yo‘qotishlarni qo‘shib umumiy issiqlikni toping.",
    "B = Q_umum/(Q_n^p·η) gaz sarfini hisoblang.",
    "Harorat–vaqt grafigida qizdirish, ushlash va sovitish bosqichlarini belgilang.",
    "Natijani tahlil qilib, energiya tejash bo‘yicha xulosa yozing."
  ],
  questions: [
    "Yumshatish jarayonining maqsadi nima?",
    "Q_f formulasi qanday kattaliklardan iborat?",
    "Issiqlik yo‘qotishlarining eng katta qismi qayerga to‘g‘ri keladi?",
    "η oshsa gaz sarfi qanday o‘zgaradi?",
    "Nima uchun yumshatishda sekin sovitish qo‘llaniladi?",
    "Mufelli pechning afzalligi nimada?"
  ],
  draw: drawHeat4
});

/* ============================================================
   5-amaliy. Haroratni o‘lchash — termojuftlik
   ============================================================ */

const HEAT_V5 = [
  { t: 950, t0: 25, type: "K", gamma: .5, D: 1200 },
  { t: 1250, t0: 20, type: "S", gamma: .2, D: 1600 },
  { t: 1450, t0: 30, type: "B", gamma: .5, D: 1800 },
  { t: 600, t0: 20, type: "N", gamma: 1, D: 1000 },
  { t: 1100, t0: 25, type: "K", gamma: .5, D: 1300 },
  { t: 1300, t0: 18, type: "S", gamma: .25, D: 1600 },
  { t: 1550, t0: 25, type: "B", gamma: .5, D: 1800 },
  { t: 850, t0: 22, type: "K", gamma: .5, D: 1100 },
  { t: 1000, t0: 20, type: "N", gamma: .5, D: 1200 },
  { t: 1200, t0: 24, type: "S", gamma: .2, D: 1400 }
];
const V5_TYPES = {
  K: { name: "K — Xromel-Alumel", k: .041, lo: 0, hi: 1100, color: "#8fd3ff" },
  S: { name: "S — Pt-PtRh10", k: .010, lo: 0, hi: 1300, color: "#f5b84b" },
  B: { name: "B — PtRh30-PtRh6", k: .008, lo: 600, hi: 1700, color: "#ff9f6b" },
  N: { name: "N — Nixrosil-Nisil", k: .039, lo: 0, hi: 1250, color: "#5ee08a" }
};

function v5Calc(s) {
  const ty = V5_TYPES[s.type] || V5_TYPES.K;
  const dT = +s.t - +s.t0;
  const E = ty.k * dT;
  const err = +s.gamma * +s.D / 100;
  return { ty, dT, E, err, ok: +s.t >= ty.lo && +s.t <= ty.hi, rel: err / Math.max(+s.t, 1) * 100 };
}

function drawHeat5(ctx, s, time) {
  const r = v5Calc(s);
  const tt = time || 0;
  const ac = "#8fd3ff";
  heatShell(ctx, "Termojuftlikni tanlash", "NamDTU · 2026 · 5-amaliy");

  heatPillRow(ctx, ["T = " + fmt(s.t, 0) + " °C", "T₀ = " + fmt(s.t0, 0) + " °C", r.ty.name, "γ = " + fmt(s.gamma, 2) + " · D = " + fmt(s.D, 0) + " °C"], 80, ac);
  heatPillRow(ctx, ["E = " + fmt(r.E, 2) + " mV", "ΔT_max = ±" + fmt(r.err, 1) + " °C", r.ok ? "diapazon mos" : "diapazon mos emas"], 112, ac);

  const fx = 40, fy = 160, fw = 440, fh = 272;
  panel(ctx, fx, fy, fw, fh, ac);

  const chx = fx + 24, chy = fy + 42, chw = 220, chh = 170;
  rr(ctx, chx, chy, chw, chh, 8);
  ctx.fillStyle = "#101c26";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .38);
  ctx.stroke();
  heatGlow(ctx, chx + chw / 2, chy + chh / 2, 100, "#ff9a55");
  text(ctx, "PECH KAMERASI", chx + 10, chy - 10, { size: 8.5, weight: 750, color: heatA(ac, .7) });
  text(ctx, "T = " + fmt(s.t, 0) + " °C", chx + chw / 2, chy + 24, { size: 11, align: "center", mono: true, color: "#ffd0a0" });

  const prX = chx + chw - 66, prY = chy + 50;
  rr(ctx, prX, prY, 14, 108, 5);
  ctx.fillStyle = "#c9d4de";
  ctx.fill();
  rr(ctx, prX + 3, prY + 6, 8, 96, 4);
  ctx.fillStyle = "#7d8b98";
  ctx.fill();
  text(ctx, "g‘ilof", prX + 26, prY + 60, { size: 8.5, color: "rgba(200,220,235,.65)" });

  ctx.beginPath();
  ctx.moveTo(prX + 7, prY);
  ctx.lineTo(prX + 7, chy - 18);
  ctx.strokeStyle = "#ffd27a";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(prX + 7, prY, 4, 0, TAU);
  ctx.fillStyle = "#ffe6a3";
  ctx.fill();
  text(ctx, "issiq uch", prX - 4, prY - 13, { size: 8.5, align: "right", color: "#ffe0b5" });

  ctx.beginPath();
  ctx.moveTo(prX + 7, chy - 18);
  ctx.lineTo(prX + 60, chy - 18);
  ctx.lineTo(prX + 60, chy + 16);
  ctx.lineTo(fx + fw - 120, chy + 16);
  ctx.strokeStyle = "#9fb0c0";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  text(ctx, "sovuq uch " + fmt(s.t0, 0) + " °C", prX + 62, chy + 8, { size: 8.5, color: "rgba(200,220,235,.7)" });

  const mx = fx + fw - 118, my = fy + 54, mw = 86, mh = 76;
  rr(ctx, mx, my, mw, mh, 8);
  ctx.fillStyle = "#0c1a24";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .45);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  text(ctx, fmt(r.E, 2), mx + mw / 2, my + 34, { size: 19, align: "center", mono: true, weight: 750, color: "#cbeaff" });
  text(ctx, "mV", mx + mw / 2, my + 52, { size: 9, align: "center", color: "rgba(190,220,240,.6)" });
  text(ctx, "MILLIVOLTMETR", mx + mw / 2, my - 8, { size: 8.5, align: "center", weight: 750, color: heatA(ac, .7) });

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(chx + 36 + i * 14, chy + chh - 26, 3 + Math.sin(tt * 4 + i) * 1.2, 0, TAU);
    ctx.fillStyle = heatA("#ffb27a", .5);
    ctx.fill();
  }

  const px = 506, pw = 424;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "DATCHIK ISH DIAPAZONI", ac);

  const bx = px + 24, bw = pw - 48;
  const trX = bx + 18, trW = bw - 18;
  Object.keys(V5_TYPES).forEach((key, i) => {
    const ty = V5_TYPES[key];
    const y = fy + 48 + i * 38;
    const x1 = trX + trW * ty.lo / 1800;
    const x2 = trX + trW * ty.hi / 1800;
    text(ctx, key, bx - 2, y + 12, { size: 10, mono: true, weight: 750, color: ty.color });
    rr(ctx, trX, y + 2, trW, 12, 6);
    ctx.fillStyle = "rgba(255,255,255,.045)";
    ctx.fill();
    rr(ctx, x1, y + 2, Math.max(6, x2 - x1), 12, 6);
    ctx.fillStyle = heatA(ty.color, .55);
    ctx.fill();
    text(ctx, fmt(ty.lo, 0) + "–" + fmt(ty.hi, 0) + " °C", bx + 22, y + 28, { size: 8.5, color: "rgba(190,215,230,.6)" });
  });

  const markX = trX + trW * clamp(+s.t / 1800, 0, 1);
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(markX, fy + 46);
  ctx.lineTo(markX, fy + 200);
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(markX, fy + 44);
  ctx.lineTo(markX - 4, fy + 36);
  ctx.lineTo(markX + 4, fy + 36);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  text(ctx, fmt(s.t, 0) + " °C", markX, fy + 208, { size: 9, align: "center", mono: true, color: "#ffffff" });

  heatRow(ctx, px + 18, fy + 236, "Xatolik, ±ΔT", fmt(r.err, 1) + " °C", "#ffd0a0");
  heatRow(ctx, px + 150, fy + 236, "Nisbiy xatolik", fmt(r.rel, 2) + " %", "#cbeaff");
  heatRow(ctx, px + 282, fy + 236, "k, mV/°C", fmt(r.ty.k, 3), "#f6dfb4");

  text(ctx, "E = k·(T − T₀)   ·   ΔT_max = γ·D/100", 30, 518, { size: 10, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-5",
  subject: "quymakorlik",
  name: "5-ish · Termojuftlik",
  labLabel: "5-ish · Termojuftlik",
  kicker: "Quymakorlik · haroratni o‘lchash",
  title: "Qaysi termojuftlik pechga mos keladi?",
  goal: "Maqsad: pech harorati va datchik turiga ko‘ra termo-EYUK <b>E</b>, ruxsat etilgan xatolik <b>ΔT_max</b> ni hisoblash va datchikning ish diapazoniga mosligini baholash.",
  accent: "#8fd3ff",
  equipment: ["K / S / B / N termojuftliklar", "Millivoltmetr", "Kom-pensatsion simlar", "Keramik g‘ilof", "Sovuq uch termometri"],
  bigLabel: "termo-EYUK",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 5-jadval. E = k·(T − T₀) soddalashtirilgan chiziqli bog‘lanish bo‘yicha; k — datchik turi jadvalidan. ΔT_max = γ·D/100.",
  controls: [
    heatVarSelect(HEAT_V5, v => fmt(v.t, 0) + " °C · " + v.type + "-turi · γ = " + fmt(v.gamma, 2)),
    { id: "t", label: "Pech harorati, T", type: "range", min: 400, max: 1700, step: 25, value: 950, unit: "°C", dec: 0 },
    { id: "t0", label: "Sovuq uch harorati, T₀", type: "range", min: 0, max: 50, step: 1, value: 25, unit: "°C", dec: 0 },
    { id: "type", label: "Datchik turi", type: "select", value: "K", options: Object.keys(V5_TYPES).map(k => ({ value: k, label: V5_TYPES[k].name })) },
    { id: "gamma", label: "Aniqlik sinfi, γ", type: "select", value: "0.5", options: [
      { value: "0.2", label: "0,2" },
      { value: "0.25", label: "0,25" },
      { value: "0.5", label: "0,5" },
      { value: "1", label: "1,0" }
    ] },
    { id: "D", label: "Shkala diapazoni, D", type: "range", min: 800, max: 1800, step: 100, value: 1200, unit: "°C", dec: 0 }
  ],
  state: { variant: 1, t: 950, t0: 25, type: "K", gamma: .5, D: 1200 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V5, { t: "t", t0: "t0", type: "type", gamma: "gamma", D: "D" });
  },
  compute(s) {
    const r = v5Calc(s);
    return {
      big: fmt(r.E, 2) + " mV",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Datchik turi", r.ty.name, ""],
        ["Pech harorati, T", fmt(s.t, 0), "°C"],
        ["Sovuq uch, T₀", fmt(s.t0, 0), "°C"],
        ["Haroratlar farqi, ΔT", fmt(r.dT, 0), "°C"],
        ["k koeffitsiyenti", fmt(r.ty.k, 3), "mV/°C"],
        ["Termo-EYUK, E", fmt(r.E, 3), "mV", true],
        ["Aniqlik sinfi, γ", fmt(s.gamma, 2), ""],
        ["Shkala, D", fmt(s.D, 0), "°C"],
        ["Ruxsat etilgan xatolik", "±" + fmt(r.err, 2), "°C", true],
        ["Nisbiy xatolik", fmt(r.rel, 2), "%"],
        ["Ish diapazoni", fmt(r.ty.lo, 0) + "–" + fmt(r.ty.hi, 0), "°C"],
        ["Moslik", r.ok ? "mos" : "mos emas", "", true]
      ],
      calc:
        "Berilgan: T = " + fmt(s.t, 0) + " °C, T₀ = " + fmt(s.t0, 0) + " °C, " + r.ty.name + "\n" +
        "k = " + fmt(r.ty.k, 3) + " mV/°C, γ = " + fmt(s.gamma, 2) + "%, D = " + fmt(s.D, 0) + " °C\n\n" +
        "1) ΔT = T − T₀ = " + fmt(s.t, 0) + " − " + fmt(s.t0, 0) + " = " + fmt(r.dT, 0) + " °C\n\n" +
        "2) E = k·ΔT = " + fmt(r.ty.k, 3) + "·" + fmt(r.dT, 0) + " = " + fmt(r.E, 2) + " mV\n\n" +
        "3) ΔT_max = γ·D/100 = " + fmt(s.gamma, 2) + "·" + fmt(s.D, 0) + "/100 = ±" + fmt(r.err, 2) + " °C\n\n" +
        "4) Datchik diapazoni: " + fmt(r.ty.lo, 0) + "–" + fmt(r.ty.hi, 0) + " °C. " +
        (r.ok ? "T = " + fmt(s.t, 0) + " °C diapazonga mos keladi." : "⚠ T = " + fmt(s.t, 0) + " °C diapazondan tashqarida!"),
      conclusion:
        "№" + s.variant + " variant: " + r.ty.name + " datchigi T = " + fmt(s.t, 0) + " °C da E = " + fmt(r.E, 2) +
        " mV beradi. γ = " + fmt(s.gamma, 2) + " va D = " + fmt(s.D, 0) + " °C da ruxsat etilgan xatolik ±" + fmt(r.err, 1) +
        " °C. Datchik " + (r.ok ? "berilgan harorat diapazoniga mos keladi." : "berilgan harorat uchun mos emas — boshqa tur tanlash kerak.")
    };
  },
  steps: [
    "Variantdagi T, T₀, datchik turi, γ va D qiymatlarini yozib oling.",
    "Tanlangan datchik uchun k va ish diapazonini jadvaldan aniqlang.",
    "ΔT = T − T₀ haroratlar farqini hisoblang.",
    "E = k·ΔT termo-EYUK ni toping.",
    "ΔT_max = γ·D/100 ruxsat etilgan xatolikni hisoblang.",
    "Datchik diapazonini pech harorati bilan taqqoslab xulosa yozing."
  ],
  questions: [
    "Termojuftlik qaysi fizik effektga asoslangan?",
    "Sovuq uch harorati oshsa ko‘rsatkich qanday o‘zgaradi?",
    "Aniqlik sinfi γ nimani bildiradi?",
    "1300 °C gacha qaysi datchik turi qo‘llaniladi?",
    "1650 °C ni o‘lchash uchun qaysi datchik mos?",
    "Nima uchun kompensatsion simlar ishlatiladi?"
  ],
  draw: drawHeat5
});

/* ============================================================
   6-amaliy. Kamerali pech
   ============================================================ */

const HEAT_V6 = [
  { m: 1200, t1: 20, t2: 1100, h: 2.0, eta: 38 },
  { m: 1800, t1: 15, t2: 1200, h: 3.0, eta: 42 },
  { m: 2500, t1: 20, t2: 1150, h: 3.5, eta: 45 },
  { m: 800, t1: 25, t2: 900, h: 1.5, eta: 35 },
  { m: 2000, t1: 20, t2: 1250, h: 3.0, eta: 40 },
  { m: 1500, t1: 18, t2: 1050, h: 2.2, eta: 39 },
  { m: 3000, t1: 20, t2: 1200, h: 4.0, eta: 44 },
  { m: 1000, t1: 22, t2: 950, h: 1.8, eta: 36 },
  { m: 1600, t1: 20, t2: 1100, h: 2.5, eta: 41 },
  { m: 2200, t1: 25, t2: 1150, h: 3.2, eta: 43 }
];

function v6Calc(s) {
  const Qf = +s.m * .68 * (+s.t2 - +s.t1);
  const Qt = Qf / (+s.eta / 100);
  return { Qf, Qt, loss: Qt - Qf, P: Qt / (3600 * +s.h) };
}

function drawHeat6(ctx, s, time) {
  const r = v6Calc(s);
  const tt = time || 0;
  const ac = "#f5b84b";
  heatShell(ctx, "Kamerali pechni hisoblash", "NamDTU · 2026 · 6-amaliy");

  heatPillRow(ctx, ["m = " + fmt(s.m, 0) + " kg", fmt(s.t1, 0) + " → " + fmt(s.t2, 0) + " °C", "τ = " + fmt(s.h, 1) + " soat", "η = " + fmt(s.eta, 0) + "%"], 80, ac);
  heatPillRow(ctx, ["Q_f = " + fmt(r.Qf / 1000, 0) + " MJ", "Q_jami = " + fmt(r.Qt / 1000, 0) + " MJ", "P = " + fmt(r.P, 1) + " kW"], 112, ac);

  const fx = 40, fy = 160, fw = 440, fh = 272;
  panel(ctx, fx, fy, fw, fh, ac);

  rr(ctx, fx + 22, fy + 30, fw - 70, fh - 60, 10);
  ctx.fillStyle = "#101c26";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .42);
  ctx.lineWidth = 2;
  ctx.stroke();

  heatBrick(ctx, fx + 30, fy + 38, fw - 86, fh - 76, "#c98d5a");
  const chx = fx + 56, chy = fy + 64, chw = fw - 146, chh = fh - 128;
  ctx.fillStyle = "#071019";
  ctx.fillRect(chx, chy, chw, chh);
  heatGlow(ctx, chx + chw / 2, chy + chh / 2, 130, "#ff9a55");

  const hot = heatColor(+s.t2);
  for (let r0 = 0; r0 < 3; r0++) {
    for (let c0 = 0; c0 < 2; c0++) {
      heatSteel(ctx, chx + 20 + c0 * 54, chy + chh - 34 - r0 * 26, 44, 18, hot);
    }
  }
  text(ctx, "zagotovkalar", chx + 58, chy + 18, { size: 9, align: "center", color: "rgba(205,225,240,.7)" });

  for (let i = 0; i < 8; i++) {
    const yy = chy + 16 + i * (chh - 32) / 7;
    arrow(ctx, chx - 14, yy, chx + 8, yy, heatA("#ffd27a", .34), 1.6, 6);
    arrow(ctx, chx + chw + 14, yy, chx + chw - 8, yy, heatA("#ffd27a", .34), 1.6, 6);
  }
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(chx + 30 + i * 38, chy + chh - 8, 2 + Math.sin(tt * 3 + i) * 1, 0, TAU);
    ctx.fillStyle = heatA("#ffb27a", .55);
    ctx.fill();
  }

  const dx = fx + fw - 54;
  rr(ctx, dx, fy + 44, 22, fh - 88, 6);
  ctx.fillStyle = "#1b2733";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .4);
  ctx.stroke();
  text(ctx, "eshik", dx + 11, fy + fh - 36, { size: 8, align: "center", color: "rgba(200,220,235,.7)" });
  text(ctx, "nurlanish", chx + chw / 2, fy + fh - 10, { size: 8.5, align: "center", color: heatA(ac, .65) });

  const px = 506, pw = 424;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "ISSIQLIK BALANSI", ac);

  const tot = Math.max(r.Qt, 1);
  const barX = px + 18, barY = fy + 54, barW = pw - 36;
  heatBar(ctx, barX, barY, barW, 18, r.Qf / tot, "#ffcf9a");
  rr(ctx, barX + barW * (r.Qf / tot), barY, barW * (1 - r.Qf / tot), 18, 4);
  ctx.fillStyle = "rgba(255,110,90,.55)";
  ctx.fill();
  text(ctx, "foydali " + fmt(r.Qf / tot * 100, 1) + "%", barX, barY + 34, { size: 9.5, color: "#ffcf9a" });
  text(ctx, "yo‘qotish " + fmt(100 - r.Qf / tot * 100, 1) + "%", barX + barW, barY + 34, { size: 9.5, align: "right", color: "#ffb3a6" });

  const items = [
    ["Q_f — metall", fmt(r.Qf / 1000, 0) + " MJ", "#ffcf9a"],
    ["Q_yo‘qot — devor, darcha, gaz", fmt(r.loss / 1000, 0) + " MJ", "#ff9f6b"],
    ["Q_jami", fmt(r.Qt / 1000, 0) + " MJ", "#f5b84b"]
  ];
  items.forEach((it, i) => heatRow(ctx, px + 18, fy + 108 + i * 38, it[0], it[1], it[2]));

  heatGauge(ctx, px + 330, fy + 150, 44, r.P / 600, "#f5b84b", fmt(r.P, 0), "kW · quvvat");
  text(ctx, "P = Q_jami/(3600·τ)", px + 330, fy + 216, { size: 9, align: "center", mono: true, color: "rgba(190,215,230,.62)" });

  text(ctx, "Kamerali pech — davriy rejim · η = Q_f/Q_jami · P = Q_jami/(3600·τ)", 30, 518, { size: 10, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-6",
  subject: "quymakorlik",
  name: "6-ish · Kamerali pech",
  labLabel: "6-ish · Kamerali pech",
  kicker: "Quymakorlik · termik pechlar",
  title: "Kamerali pechning quvvati qanday topiladi?",
  goal: "Maqsad: metall massasi, harorat rejimi va pech FIKidan foydalanib foydali issiqlik <b>Q_f</b>, jami issiqlik <b>Q_jami</b> va o‘rtacha quvvat <b>P</b> ni hisoblash.",
  accent: "#f5b84b",
  equipment: ["Statsionar kamerali pech", "Futerovka namunalari", "Termojuftlar", "Eshik mexanizmi", "Sekundomer"],
  bigLabel: "o‘rtacha quvvat",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 6-jadval. c = 0,68 kJ/(kg·°C). η = Q_f/Q_jami. P = Q_jami/(3600·τ).",
  controls: [
    heatVarSelect(HEAT_V6, v => fmt(v.m, 0) + " kg · " + fmt(v.t2, 0) + " °C · η = " + fmt(v.eta, 0) + "%"),
    { id: "m", label: "Metall massasi, m", type: "range", min: 500, max: 3500, step: 100, value: 1500, unit: "kg", dec: 0 },
    { id: "t1", label: "Boshlang‘ich harorat, T₁", type: "range", min: 0, max: 40, step: 1, value: 20, unit: "°C", dec: 0 },
    { id: "t2", label: "Yakuniy harorat, T₂", type: "range", min: 800, max: 1300, step: 25, value: 1150, unit: "°C", dec: 0 },
    { id: "h", label: "Qizdirish vaqti, τ", type: "range", min: 1, max: 5, step: .1, value: 2.5, unit: "soat", dec: 1 },
    { id: "eta", label: "Pech FIK, η", type: "range", min: 30, max: 50, step: 1, value: 40, unit: "%", dec: 0 }
  ],
  state: { variant: 1, m: 1500, t1: 20, t2: 1150, h: 2.5, eta: 40 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V6, { m: "m", t1: "t1", t2: "t2", h: "h", eta: "eta" });
  },
  compute(s) {
    const r = v6Calc(s);
    return {
      big: fmt(r.P, 1) + " kW",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Metall massasi, m", fmt(s.m, 0), "kg"],
        ["Harorat, T₁ → T₂", fmt(s.t1, 0) + " → " + fmt(s.t2, 0), "°C"],
        ["Qizdirish vaqti, τ", fmt(s.h, 1), "soat"],
        ["Pech FIK, η", fmt(s.eta, 0), "%"],
        ["Solishtirma issiqlik, c", "0,68", "kJ/(kg·°C)"],
        ["Foydali issiqlik, Q_f", fmt(r.Qf, 0), "kJ", true],
        ["Q_f", fmt(r.Qf / 1000, 1), "MJ"],
        ["Jami issiqlik, Q_jami", fmt(r.Qt, 0), "kJ", true],
        ["Q_jami", fmt(r.Qt / 1000, 1), "MJ"],
        ["Yo‘qotishlar", fmt(r.loss, 0), "kJ"],
        ["O‘rtacha quvvat, P", fmt(r.P, 2), "kW", true]
      ],
      calc:
        "Berilgan: m = " + fmt(s.m, 0) + " kg, T₁ = " + fmt(s.t1, 0) + " °C, T₂ = " + fmt(s.t2, 0) + " °C, τ = " + fmt(s.h, 1) + " soat, η = " + fmt(s.eta, 0) + "%\n" +
        "c = 0,68 kJ/(kg·°C)\n\n" +
        "1) Q_f = m·c·(T₂ − T₁) = " + fmt(s.m, 0) + "·0,68·" + fmt(+s.t2 - +s.t1, 0) + " = " + fmt(r.Qf, 0) + " kJ = " + fmt(r.Qf / 1000, 1) + " MJ\n\n" +
        "2) Q_jami = Q_f/η = " + fmt(r.Qf, 0) + " / " + fmt(+s.eta / 100, 2) + " = " + fmt(r.Qt, 0) + " kJ = " + fmt(r.Qt / 1000, 1) + " MJ\n\n" +
        "3) P = Q_jami/(3600·τ) = " + fmt(r.Qt, 0) + " / (3600·" + fmt(s.h, 1) + ") = " + fmt(r.P, 2) + " kW",
      conclusion:
        "№" + s.variant + " variant: " + fmt(s.m, 0) + " kg po‘latni " + fmt(s.t1, 0) + " °C dan " + fmt(s.t2, 0) +
        " °C gacha qizdirish uchun Q_f = " + fmt(r.Qf / 1000, 1) + " MJ foydali issiqlik kerak. η = " + fmt(s.eta, 0) +
        "% bo‘lganda jami sarf Q_jami = " + fmt(r.Qt / 1000, 1) + " MJ, o‘rtacha quvvat P = " + fmt(r.P, 1) + " kW."
    };
  },
  steps: [
    "Variantdagi m, T₁, T₂, τ va η qiymatlarini yozib oling.",
    "Q_f = m·c·(T₂ − T₁) foydali issiqlikni hisoblang.",
    "Q_jami = Q_f/η jami issiqlikni toping.",
    "Yo‘qotishlarni Q_jami − Q_f ayirmasi sifatida aniqlang.",
    "P = Q_jami/(3600·τ) o‘rtacha quvvatni hisoblang.",
    "Natijalarni issiqlik balansi diagrammasi bilan taqqoslab xulosa yozing."
  ],
  questions: [
    "Kamerali pechlar qanday rejimda ishlaydi?",
    "Vykatnoy tubli pechning afzalligi nimada?",
    "Futerovka qanday vazifani bajaradi?",
    "1000 °C dan yuqori haroratda issiqlik qanday uzatiladi?",
    "η = Q_f/Q_jami nimani bildiradi?",
    "Eshik ochiq qolganda qaysi yo‘qotish ortadi?"
  ],
  draw: drawHeat6
});

/* ============================================================
   7-amaliy. Shaxtali pech
   ============================================================ */

const HEAT_V7 = [
  { mat: "Po‘lat 45 (val)", m: 450, t1: 20, t2: 850, h: 2.0, eta: .65 },
  { mat: "Po‘lat 40X (shesternya)", m: 600, t1: 20, t2: 860, h: 2.5, eta: .60 },
  { mat: "Po‘lat 60SG (prujina)", m: 300, t1: 20, t2: 900, h: 1.5, eta: .70 },
  { mat: "Po‘lat 20X (sementatsiya)", m: 500, t1: 20, t2: 920, h: 4.0, eta: .58 },
  { mat: "Legirlangan po‘lat", m: 800, t1: 20, t2: 880, h: 3.0, eta: .62 },
  { mat: "Instrumental po‘lat U10", m: 350, t1: 20, t2: 800, h: 2.0, eta: .68 },
  { mat: "Po‘lat 38X2MYUA (nitrid)", m: 400, t1: 20, t2: 560, h: 5.0, eta: .72 },
  { mat: "Titan qotishmasi VT6", m: 250, t1: 20, t2: 950, h: 2.5, eta: .65 },
  { mat: "Kulrang cho‘yan SSh20", m: 700, t1: 20, t2: 750, h: 3.0, eta: .60 },
  { mat: "Po‘lat 12X18H10T", m: 550, t1: 20, t2: 1050, h: 3.5, eta: .55 }
];

function v7Calc(s) {
  const Qf = +s.m * .68 * (+s.t2 - +s.t1);
  const Ql = Qf * (+s.qloss / 100);
  return { Qf, Ql, P: (Qf + Ql) / (3600 * +s.h * +s.eta), B: +s.m / +s.h };
}

function drawHeat7(ctx, s, time) {
  const r = v7Calc(s);
  const tt = time || 0;
  const ac = "#f5b84b";
  heatShell(ctx, "Shaxtali pechni hisoblash", "NamDTU · 2026 · 7-amaliy");

  heatPillRow(ctx, [s.mat, "m = " + fmt(s.m, 0) + " kg", fmt(s.t1, 0) + " → " + fmt(s.t2, 0) + " °C", "t = " + fmt(s.h, 1) + " soat"], 80, ac);
  heatPillRow(ctx, ["Q_f = " + fmt(r.Qf / 1000, 1) + " MJ", "P = " + fmt(r.P, 1) + " kW", "B = " + fmt(r.B, 0) + " kg/soat"], 112, ac);

  const fx = 40, fy = 150, fw = 300, fh = 300;
  panel(ctx, fx, fy, fw, fh, ac);

  const sx = fx + 28, sy = fy + 44, sw = 180, sh = 206;
  rr(ctx, sx, sy, sw, sh, 10);
  ctx.fillStyle = "#101c26";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .45);
  ctx.lineWidth = 2;
  ctx.stroke();
  heatBrick(ctx, sx + 12, sy + 12, 18, sh - 24, "#c98d5a");
  heatBrick(ctx, sx + sw - 30, sy + 12, 18, sh - 24, "#c98d5a");
  const inner = { x: sx + 32, y: sy + 12, w: sw - 64, h: sh - 24 };
  ctx.fillStyle = "#071019";
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  heatGlow(ctx, inner.x + inner.w / 2, inner.y + inner.h / 2, 110, "#ff9a55");

  const hot = heatColor(+s.t2);
  for (let i = 0; i < 5; i++) {
    const px0 = inner.x + 8 + i * (inner.w - 16) / 4;
    heatSteel(ctx, px0 - 3, inner.y + 18, 6, inner.h - 40, hot);
  }
  text(ctx, "osilgan detallar", inner.x + inner.w / 2, inner.y + inner.h + 16, { size: 8.5, align: "center", color: "rgba(200,220,235,.65)" });

  const lidY = sy - 14;
  rr(ctx, sx - 8, lidY, sw + 16, 16, 6);
  ctx.fillStyle = "#22303d";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .45);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx + sw / 2, lidY + 8, 13, 0, TAU);
  ctx.fillStyle = "#16232e";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .5);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 3; i++) {
    const a = tt * 5 + i * TAU / 3;
    const xx = sx + sw / 2 + Math.cos(a) * 9;
    const yy = lidY + 8 + Math.sin(a) * 9;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.strokeStyle = "#9fb0c0";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  text(ctx, "ventilyator", sx + sw / 2 + 26, lidY + 4, { size: 8, color: "rgba(200,220,235,.6)" });

  for (let i = 0; i < 5; i++) {
    const yy = inner.y + 20 + i * 26;
    heatFlow(ctx, inner.x + 6, yy, inner.x + inner.w - 6, yy, heatA("#ffb27a", .26), tt + i * .3, 18);
  }

  const px = 366, pw = 564;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "CHUQURLIK BO‘YICHA HARORAT", ac);

  const gx0 = px + 26, gy0 = fy + 50, gw = 240, gh = 104;
  heatGrid(ctx, gx0, gy0, gw, gh);
  const prof = [];
  for (let i = 0; i < 9; i++) prof.push(.92 - .48 * Math.sin(i / 8 * Math.PI) - i * .01);
  heatSpark(ctx, gx0, gy0, gw, gh, prof, "#ffb26b", true);
  text(ctx, "yuqori", gx0 + 6, gy0 + 12, { size: 8.5, color: "rgba(190,215,230,.6)" });
  text(ctx, "tub", gx0 + 6, gy0 + gh - 4, { size: 8.5, color: "rgba(190,215,230,.6)" });
  text(ctx, "t = " + fmt(s.t2, 0) + " °C", gx0 + gw - 4, gy0 + 14, { size: 9, align: "right", mono: true, color: "#ffd0a0" });

  heatRow(ctx, px + 292, fy + 62, "Foydali issiqlik, Q_f", fmt(r.Qf / 1000, 1) + " MJ", "#ffcf9a");
  heatRow(ctx, px + 292, fy + 112, "Yo‘qotish, Q_yo‘q", fmt(r.Ql / 1000, 1) + " MJ", "#ff9f6b");
  heatRow(ctx, px + 292, fy + 162, "Quvvat, P", fmt(r.P, 1) + " kW", "#f5b84b");
  heatRow(ctx, px + 292, fy + 212, "Unumdorlik, B", fmt(r.B, 0) + " kg/soat", "#9ff0e7");

  const ratio = clamp(+s.qloss / 40, 0, 1);
  heatBar(ctx, px + 18, fy + 250, pw - 36, 12, r.Qf / Math.max(r.Qf + r.Ql, 1), "#ffcf9a");
  text(ctx, "yo‘qotish ulushi " + fmt(s.qloss, 0) + "%", px + pw - 18, fy + 280, { size: 9, align: "right", color: "rgba(200,220,235,.65)" });

  text(ctx, "Q_f = m·c·ΔT   ·   P = (Q_f + Q_yo‘q)/(3600·t·η)   ·   B = m/t", 30, 518, { size: 10, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-7",
  subject: "quymakorlik",
  name: "7-ish · Shaxtali pech",
  labLabel: "7-ish · Shaxtali pech",
  kicker: "Quymakorlik · termik pechlar",
  title: "Shaxtali pech uzun detallarni qanday qizdiradi?",
  goal: "Maqsad: detal massasi va harorat rejimidan foydalanib foydali issiqlik <b>Q_f</b>, elektr quvvat <b>P</b> va unumdorlik <b>B</b> ni hisoblash.",
  accent: "#f5b84b",
  equipment: ["Shaxtali elektr pech", "Muffel (retorta)", "Sirkulyatsiya ventilyatori", "Gidrozatvorli qopqoq", "Termojuft"],
  bigLabel: "elektr quvvati",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 7-jadval. c = 0,68 kJ/(kg·°C). Yo‘qotish ulushi hujjatda berilmagan — hisob uchun 20% qabul qilingan va slayder bilan o‘zgartiriladi.",
  controls: [
    heatVarSelect(HEAT_V7, v => v.mat + " · " + fmt(v.m, 0) + " kg · " + fmt(v.t2, 0) + " °C"),
    { id: "m", label: "Detal massasi, m", type: "range", min: 100, max: 1000, step: 10, value: 450, unit: "kg", dec: 0 },
    { id: "t1", label: "Boshlang‘ich harorat, T₁", type: "range", min: 0, max: 40, step: 1, value: 20, unit: "°C", dec: 0 },
    { id: "t2", label: "Yakuniy harorat, T₂", type: "range", min: 500, max: 1100, step: 10, value: 850, unit: "°C", dec: 0 },
    { id: "h", label: "Qizdirish vaqti, t", type: "range", min: 1, max: 6, step: .5, value: 2, unit: "soat", dec: 1 },
    { id: "eta", label: "Pech FIK, η", type: "range", min: .50, max: .80, step: .01, value: .65, dec: 2 },
    { id: "qloss", label: "Yo‘qotish ulushi, Q_yo‘q", type: "range", min: 0, max: 40, step: 1, value: 20, unit: "%", dec: 0 }
  ],
  state: { variant: 1, mat: "Po‘lat 45 (val)", m: 450, t1: 20, t2: 850, h: 2, eta: .65, qloss: 20 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V7, { mat: "mat", m: "m", t1: "t1", t2: "t2", h: "h", eta: "eta" });
  },
  compute(s) {
    const r = v7Calc(s);
    return {
      big: fmt(r.P, 1) + " kW",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Material / detal", s.mat, ""],
        ["Massasi, m", fmt(s.m, 0), "kg"],
        ["Harorat, T₁ → T₂", fmt(s.t1, 0) + " → " + fmt(s.t2, 0), "°C"],
        ["Qizdirish vaqti, t", fmt(s.h, 1), "soat"],
        ["Pech FIK, η", fmt(s.eta, 2), ""],
        ["Foydali issiqlik, Q_f", fmt(r.Qf, 0), "kJ", true],
        ["Yo‘qotish, Q_yo‘q", fmt(r.Ql, 0), "kJ"],
        ["Umumiy issiqlik", fmt(r.Qf + r.Ql, 0), "kJ"],
        ["Elektr quvvati, P", fmt(r.P, 2), "kW", true],
        ["Unumdorlik, B", fmt(r.B, 1), "kg/soat", true]
      ],
      calc:
        "Berilgan: m = " + fmt(s.m, 0) + " kg, T₁ = " + fmt(s.t1, 0) + " °C, T₂ = " + fmt(s.t2, 0) + " °C, t = " + fmt(s.h, 1) + " soat\n" +
        "η = " + fmt(s.eta, 2) + ", Q_yo‘q = " + fmt(s.qloss, 0) + "%·Q_f, c = 0,68 kJ/(kg·°C)\n\n" +
        "1) Q_f = m·c·(T₂ − T₁) = " + fmt(s.m, 0) + "·0,68·" + fmt(+s.t2 - +s.t1, 0) + " = " + fmt(r.Qf, 0) + " kJ\n\n" +
        "2) Q_yo‘q = " + fmt(s.qloss, 0) + "%·Q_f = " + fmt(r.Ql, 0) + " kJ\n\n" +
        "3) P = (Q_f + Q_yo‘q)/(3600·t·η)\n" +
        "     = (" + fmt(r.Qf, 0) + " + " + fmt(r.Ql, 0) + ")/(3600·" + fmt(s.h, 1) + "·" + fmt(s.eta, 2) + ") = " + fmt(r.P, 2) + " kW\n\n" +
        "4) B = m/t = " + fmt(s.m, 0) + " / " + fmt(s.h, 1) + " = " + fmt(r.B, 1) + " kg/soat",
      conclusion:
        "№" + s.variant + " variant: " + s.mat + " detallarini " + fmt(s.t2, 0) + " °C gacha qizdirish uchun Q_f = " + fmt(r.Qf, 0) +
        " kJ issiqlik va P = " + fmt(r.P, 1) + " kW quvvat talab etiladi. Pech unumdorligi B = " + fmt(r.B, 0) + " kg/soat."
    };
  },
  steps: [
    "Variantdagi material, massa, harorat, vaqt va FIKni yozib oling.",
    "Q_f = m·c·(T₂ − T₁) foydali issiqlikni hisoblang.",
    "Qabul qilingan yo‘qotish ulushi bo‘yicha Q_yo‘q ni toping.",
    "P = (Q_f + Q_yo‘q)/(3600·t·η) quvvatni hisoblang.",
    "B = m/t unumdorlikni aniqlang.",
    "Konstruksiya elementlari va konveksiya ta’sirini tahlil qilib xulosa yozing."
  ],
  questions: [
    "Shaxtali pechning kamerali pechdan asosiy afzalligi nimada?",
    "Nima uchun detallar vertikal osiladi?",
    "Sirkulyatsiya ventilyatori qanday vazifani bajaradi?",
    "Gidrozatvor nima uchun kerak?",
    "Muffel (retorta) qachon qo‘llaniladi?",
    "Qizdirgichlar qanday materiallardan tayyorlanadi?"
  ],
  draw: drawHeat7
});

/* ============================================================
   8-amaliy. Konveyerli pech
   ============================================================ */

const HEAT_V8 = [
  { name: "Val shaklidagi detal", m1: 2.5, N: 120, t1: 20, t2: 860 },
  { name: "Tishli g‘ildirak", m1: 4.0, N: 85, t1: 20, t2: 880 },
  { name: "Prujina (avtomobil)", m1: 1.8, N: 200, t1: 15, t2: 850 },
  { name: "Shtamp tayanch plastinasi", m1: 6.5, N: 50, t1: 20, t2: 900 },
  { name: "Porshen barmog‘i", m1: .8, N: 450, t1: 25, t2: 840 },
  { name: "Kuporosli gayka / bolt", m1: .3, N: 1200, t1: 20, t2: 820 },
  { name: "Flanetsli birikma", m1: 5.2, N: 70, t1: 15, t2: 870 },
  { name: "Ressor plastinasi", m1: 3.5, N: 110, t1: 20, t2: 890 },
  { name: "Podshipnik halqasi", m1: 1.5, N: 250, t1: 20, t2: 850 },
  { name: "Vtulka va vtulkali mufta", m1: 3.0, N: 140, t1: 18, t2: 860 }
];

function v8Calc(s) {
  const P = +s.N * +s.m1;
  const Qf = P * .68 * (+s.t2 - +s.t1);
  return { P, Qf, kw: Qf / 3600 };
}

function drawHeat8(ctx, s, time) {
  const r = v8Calc(s);
  const tt = time || 0;
  const ac = "#6be0c0";
  heatShell(ctx, "Konveyerli pechni hisoblash", "NamDTU · 2026 · 8-amaliy");

  heatPillRow(ctx, [s.name, "m₁ = " + fmt(s.m1, 1) + " kg", "N = " + fmt(s.N, 0) + " dona/soat", fmt(s.t1, 0) + " → " + fmt(s.t2, 0) + " °C"], 80, ac);
  heatPillRow(ctx, ["P = " + fmt(r.P, 0) + " kg/soat", "Q_f = " + fmt(r.Qf, 0) + " kJ/soat", "P_iss = " + fmt(r.kw, 1) + " kW"], 112, ac);

  const fx = 40, fy = 158, fw = 880, fh = 240;
  panel(ctx, fx, fy, fw, fh, ac);

  const tx = fx + 26, ty = fy + 58, tw = fw - 52, th = 108;
  const zones = [
    ["I · qizdirish", "#ff9a55", .36],
    ["II · ushlash", "#f5b84b", .34],
    ["III · tenglashtirish", "#ffe6a3", .30]
  ];
  let zx = tx;
  zones.forEach(z => {
    const zw = tw * z[2];
    const g = ctx.createLinearGradient(zx, 0, zx + zw, 0);
    g.addColorStop(0, heatA(z[1], .06));
    g.addColorStop(.5, heatA(z[1], .16));
    g.addColorStop(1, heatA(z[1], .06));
    ctx.fillStyle = g;
    ctx.fillRect(zx, ty, zw, th);
    ctx.strokeStyle = heatA(z[1], .28);
    ctx.strokeRect(zx, ty, zw, th);
    text(ctx, z[0], zx + zw / 2, ty - 10, { size: 9, align: "center", weight: 700, color: heatA(z[1], .9) });
    zx += zw;
  });
  text(ctx, "harakat yo‘nalishi  →", tx + tw / 2, ty + th + 18, { size: 9, align: "center", color: "rgba(200,225,235,.65)" });

  const beltY = ty + th - 26;
  ctx.strokeStyle = "#6d7f8e";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(tx + 6, beltY); ctx.lineTo(tx + tw - 6, beltY); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const rx = tx + 40 + i * (tw - 80);
    ctx.beginPath(); ctx.arc(rx, beltY, 7, 0, TAU);
    ctx.strokeStyle = "#8fa0af"; ctx.stroke();
  }

  const speed = 34;
  for (let i = 0; i < 9; i++) {
    const base = (i * (tw - 40) / 9 + tt * speed) % (tw - 40);
    const xx = tx + 20 + base;
    const prog = base / (tw - 40);
    const col = heatColor(lerp(+s.t1, +s.t2, prog));
    ctx.beginPath();
    ctx.arc(xx, beltY - 9, 5.5, 0, TAU);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = .8;
    ctx.stroke();
  }

  const gx0 = tx + 20, gy0 = fy + 182, gw = tw - 40, gh = 34;
  heatSpark(ctx, gx0, gy0, gw, gh, [.12, .3, .55, .82, .95, .97, .92, .8], "#ffcf9a", true);
  text(ctx, "harorat egri chizig‘i", gx0 + 4, gy0 - 6, { size: 8.5, color: "rgba(200,220,235,.6)" });
  text(ctx, fmt(s.t2, 0) + " °C", gx0 + gw - 2, gy0 - 6, { size: 9, align: "right", mono: true, color: "#ffd0a0" });

  const px = 40, pw = 880;
  panel(ctx, px, 418, pw, 72, ac);
  const items = [
    ["Unumdorlik, P = N·m₁", fmt(r.P, 0) + " kg/soat"],
    ["Foydali issiqlik, Q_f", fmt(r.Qf, 0) + " kJ/soat"],
    ["Issiqlik quvvati", fmt(r.kw, 1) + " kW"],
    ["Bir soatda detallar", fmt(s.N, 0) + " dona"],
    ["Zagotovka massasi", fmt(s.m1, 1) + " kg"]
  ];
  items.forEach((it, i) => {
    const x = px + 22 + i * 172;
    text(ctx, it[0], x, 440, { size: 8.5, color: "rgba(185,210,225,.65)" });
    text(ctx, it[1], x, 462, { size: 13, mono: true, weight: 700, color: i === 2 ? "#9ff0e7" : "#e9f4fb" });
  });

  text(ctx, "P = N·m₁   ·   Q_f = P·c·(T₂ − T₁)", 30, 518, { size: 10, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-8",
  subject: "quymakorlik",
  name: "8-ish · Konveyerli pech",
  labLabel: "8-ish · Konveyerli pech",
  kicker: "Quymakorlik · uzluksiz pechlar",
  title: "Konveyerli pechning unumdorligi qanday?",
  goal: "Maqsad: bitta buyum massasi va soatlik sonidan foydalanib pech unumdorligi <b>P</b> va foydali issiqlik <b>Q_f</b> ni hisoblash.",
  accent: "#6be0c0",
  equipment: ["Konveyerli pech", "Issiqqa chidamli to‘r (setka)", "Yuklash mexanizmi", "Harorat zonalari datchiklari", "Sekundomer"],
  bigLabel: "pech unumdorligi",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 8-jadval. c = 0,68 kJ/(kg·°C). P = N·m₁; Q_f = P·c·(T₂ − T₁).",
  controls: [
    heatVarSelect(HEAT_V8, v => v.name + " · " + fmt(v.N, 0) + " dona/soat"),
    { id: "m1", label: "Bitta buyum massasi, m₁", type: "range", min: .2, max: 8, step: .1, value: 2.5, unit: "kg", dec: 1 },
    { id: "N", label: "Soatlik soni, N", type: "range", min: 40, max: 1300, step: 10, value: 120, unit: "dona/soat", dec: 0 },
    { id: "t1", label: "Boshlang‘ich harorat, T₁", type: "range", min: 0, max: 40, step: 1, value: 20, unit: "°C", dec: 0 },
    { id: "t2", label: "Yakuniy harorat, T₂", type: "range", min: 700, max: 950, step: 10, value: 860, unit: "°C", dec: 0 }
  ],
  state: { variant: 1, name: "Val shaklidagi detal", m1: 2.5, N: 120, t1: 20, t2: 860 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V8, { name: "name", m1: "m1", N: "N", t1: "t1", t2: "t2" });
  },
  compute(s) {
    const r = v8Calc(s);
    return {
      big: fmt(r.P, 0) + " kg/soat",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Buyum turi", s.name, ""],
        ["Bitta buyum massasi, m₁", fmt(s.m1, 2), "kg"],
        ["Soatlik soni, N", fmt(s.N, 0), "dona/soat"],
        ["Harorat, T₁ → T₂", fmt(s.t1, 0) + " → " + fmt(s.t2, 0), "°C"],
        ["Unumdorlik, P = N·m₁", fmt(r.P, 1), "kg/soat", true],
        ["Unumdorlik", fmt(r.P / 1000, 3), "t/soat"],
        ["Foydali issiqlik, Q_f", fmt(r.Qf, 0), "kJ/soat", true],
        ["Issiqlik quvvati", fmt(r.kw, 2), "kW"]
      ],
      calc:
        "Berilgan: m₁ = " + fmt(s.m1, 1) + " kg, N = " + fmt(s.N, 0) + " dona/soat, T₁ = " + fmt(s.t1, 0) + " °C, T₂ = " + fmt(s.t2, 0) + " °C\n" +
        "c = 0,68 kJ/(kg·°C)\n\n" +
        "1) P = N·m₁ = " + fmt(s.N, 0) + "·" + fmt(s.m1, 1) + " = " + fmt(r.P, 1) + " kg/soat\n\n" +
        "2) Q_f = P·c·(T₂ − T₁) = " + fmt(r.P, 1) + "·0,68·" + fmt(+s.t2 - +s.t1, 0) + " = " + fmt(r.Qf, 0) + " kJ/soat\n\n" +
        "3) Q_f = " + fmt(r.Qf, 0) + " kJ/soat = " + fmt(r.kw, 2) + " kW",
      conclusion:
        "№" + s.variant + " variant: " + s.name + " uchun P = " + fmt(r.P, 0) + " kg/soat (" + fmt(r.P / 1000, 2) +
        " t/soat) unumdorlik va Q_f = " + fmt(r.Qf, 0) + " kJ/soat (" + fmt(r.kw, 1) + " kW) foydali issiqlik talab etiladi."
    };
  },
  steps: [
    "Variantdagi buyum turi, m₁, N va haroratlarni yozib oling.",
    "P = N·m₁ unumdorlikni hisoblang.",
    "Q_f = P·c·(T₂ − T₁) foydali issiqlikni toping.",
    "Natijani kJ/soat va kW da ifodalang.",
    "Konveyer tezligi va yuklash zichligining unumdorlikka ta’sirini tahlil qiling.",
    "Harorat zonalari bo‘yicha xulosa yozing."
  ],
  questions: [
    "Konveyerli pechning asosiy afzalligi nimada?",
    "Konveyer to‘ri qanday materialdan tayyorlanadi?",
    "Issiqlik balansining eng katta qismi nimaga sarflanadi?",
    "Harorat zonalariga bo‘lish nima uchun kerak?",
    "Unumdorlikka qaysi omillar ta’sir qiladi?",
    "Nima uchun uzluksiz rejim tejamkor hisoblanadi?"
  ],
  draw: drawHeat8
});
