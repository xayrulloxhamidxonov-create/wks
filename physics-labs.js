"use strict";

/* ============================================================
   FIZIKA — 2–3-amaliy ishlar: yadro parchalanishi va adron
   kollayderi. subjects.js dagi defs ga ulanadi.
   ============================================================ */

const PHYS_MP = 0.000938272;
const PHYS_R = 2804;
const PHYS_CIRC = 26658.883;
const PHYS_FIELD_K = 0.299792458;
const PHYS_C = 299792458;

const PHYS_ISO = {
  i131: { name: "I-131", label: "I-131 — yod", T: 8.02 * 86400, mode: "β⁻", daughter: "Xe-131", eq: "I-131 → Xe-131 + β⁻ + ν" },
  tc99m: { name: "Tc-99m", label: "Tc-99m — texnetsiy", T: 6.01 * 3600, mode: "γ", daughter: "Tc-99", eq: "Tc-99m → Tc-99 + γ" },
  cs137: { name: "Cs-137", label: "Cs-137 — seziy", T: 30.17 * 365.25 * 86400, mode: "β⁻", daughter: "Ba-137", eq: "Cs-137 → Ba-137 + β⁻ + ν" },
  co60: { name: "Co-60", label: "Co-60 — kobalt", T: 5.2714 * 365.25 * 86400, mode: "β⁻ + γ", daughter: "Ni-60", eq: "Co-60 → Ni-60 + β⁻ + γ" },
  c14: { name: "C-14", label: "C-14 — uglerod", T: 5730 * 365.25 * 86400, mode: "β⁻", daughter: "N-14", eq: "C-14 → N-14 + β⁻ + ν" },
  ra226: { name: "Ra-226", label: "Ra-226 — radiy", T: 1600 * 365.25 * 86400, mode: "α", daughter: "Rn-222", eq: "Ra-226 → Rn-222 + α" }
};

function physTime(sec) {
  if (sec < 120) return fmt(sec, 1) + " s";
  if (sec < 7200) return fmt(sec / 60, 1) + " min";
  if (sec < 172800) return fmt(sec / 3600, 1) + " soat";
  if (sec < 63072000) return fmt(sec / 86400, 1) + " kun";
  return fmt(sec / 31557600, 1) + " yil";
}

function physAlpha(color, a) {
  return color.charAt(0) === "#" ? hexA(color, a) : color;
}

function physHash(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ============================================================
   2-amaliy. Yadro parchalanishi
   ============================================================ */

function drawPhysDecay(ctx, s, time) {
  const iso = PHYS_ISO[s.iso] || PHYS_ISO.i131;
  const k = +s.ratio;
  const frac = Math.pow(2, -k);
  const ac = "#7fa8ff";
  const cx = 240, cy = 286;

  subjectBg(ctx, "FIZIKA", "Yadro parchalanishi", "N = N₀·2^(−t/T½)");

  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 150);
  glow.addColorStop(0, physAlpha(ac, .26));
  glow.addColorStop(.55, physAlpha(ac, .07));
  glow.addColorStop(1, physAlpha(ac, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, 150, 0, TAU); ctx.fill();

  ctx.setLineDash([3, 7]);
  ctx.strokeStyle = "rgba(150,205,235,.22)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, 88, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = physAlpha(ac, .8);
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 88, -Math.PI / 2, -Math.PI / 2 + TAU * frac); ctx.stroke();

  const nucleons = 34;
  for (let i = 0; i < nucleons; i++) {
    const a = i * 2.399963;
    const r = 9.4 * Math.sqrt(i);
    const x = cx + Math.cos(a) * r + Math.sin(time * 1.6 + i) * .7;
    const y = cy + Math.sin(a) * r + Math.cos(time * 1.3 + i) * .7;
    const proton = i % 2 === 0;
    ctx.beginPath(); ctx.arc(x, y, 6.4, 0, TAU);
    ctx.fillStyle = proton ? "rgba(255,138,107,.92)" : "rgba(141,201,255,.9)";
    ctx.fill();
    ctx.strokeStyle = proton ? "rgba(255,190,170,.5)" : "rgba(200,230,255,.45)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const emit = Math.max(0, Math.min(10, Math.ceil(frac * 10)));
  for (let i = 0; i < emit; i++) {
    const p = (time * .42 + i * .31) % 1;
    const a = i * 2.399963 + .6;
    const r = 96 + p * 88;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const al = (1 - p) * .9;
    const alphaMode = iso.mode.indexOf("α") >= 0;
    const gammaMode = iso.mode === "γ" || (iso.mode.indexOf("γ") >= 0 && i % 2 === 1);

    if (gammaMode) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.strokeStyle = "rgba(255,209,102," + al + ")";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let d = -12; d <= 12; d += 2) {
        const yy = Math.sin(d * .9 + time * 9) * 3.4;
        d === -12 ? ctx.moveTo(d, yy) : ctx.lineTo(d, yy);
      }
      ctx.stroke();
      ctx.restore();
    } else if (alphaMode) {
      ctx.fillStyle = "rgba(255,138,107," + al + ")";
      ctx.beginPath(); ctx.arc(x - 2.2, y, 3, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(141,201,255," + al + ")";
      ctx.beginPath(); ctx.arc(x + 2.2, y, 3, 0, TAU); ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(127,227,255," + (al * .55) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(a) * 16, y - Math.sin(a) * 16);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(127,227,255," + al + ")";
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
    }
  }

  text(ctx, fmt(frac * 100, 1) + "%", cx, cy - 114, { size: 17, align: "center", mono: true, weight: 700, color: "#cfe0ff" });
  text(ctx, "qolgan yadrolar", cx, cy - 97, { size: 9.5, align: "center", color: "rgba(165,195,220,.6)" });

  text(ctx, iso.name + " · T½ = " + physTime(iso.T), cx, 402, { size: 13, align: "center", weight: 650 });
  text(ctx, "parchalanish turi: " + iso.mode, cx, 422, { size: 10.5, align: "center", color: "rgba(165,195,220,.65)" });
  text(ctx, iso.eq, cx, 448, { size: 11.5, align: "center", mono: true, color: "rgba(205,225,245,.8)" });

  const x0 = 492, y0 = 158, w = 412, h = 226;
  panel(ctx, 466, 116, 462, 300, ac);
  text(ctx, "AKTIVLIKNING VAQT BO‘YICHA KAMAYISHI", 486, 142, { size: 9.5, weight: 750, color: "rgba(160,195,220,.62)" });

  ctx.strokeStyle = "rgba(150,205,235,.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i += 2) {
    ctx.beginPath(); ctx.moveTo(x0 + w * i / 10, y0); ctx.lineTo(x0 + w * i / 10, y0 + h); ctx.stroke();
  }
  [0, .25, .5, .75, 1].forEach(v => {
    ctx.beginPath(); ctx.moveTo(x0, y0 + h * (1 - v)); ctx.lineTo(x0 + w, y0 + h * (1 - v)); ctx.stroke();
    text(ctx, fmt(v * 100, 0), x0 - 10, y0 + h * (1 - v) + 3.5, { size: 9, align: "right", mono: true, color: "rgba(160,195,220,.55)" });
  });
  for (let i = 0; i <= 10; i += 2) {
    text(ctx, String(i), x0 + w * i / 10, y0 + h + 18, { size: 9.5, align: "center", mono: true, color: "rgba(160,195,220,.55)" });
  }
  text(ctx, "t / T½", x0 + w, y0 + h + 34, { size: 9.5, align: "right", color: "rgba(160,195,220,.6)" });
  text(ctx, "A/A₀, %", x0 + w, y0 - 10, { size: 9.5, align: "right", color: "rgba(160,195,220,.6)" });

  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const xv = i / 20;
    const px = x0 + w * xv / 10;
    const py = y0 + h * (1 - Math.pow(2, -xv));
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.strokeStyle = ac;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  const pxk = x0 + w * k / 10;
  const pyk = y0 + h * (1 - frac);
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = "rgba(210,230,255,.4)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pxk, pyk); ctx.lineTo(pxk, y0 + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pxk, pyk); ctx.lineTo(x0, pyk); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(pxk, pyk, 5, 0, TAU);
  ctx.fillStyle = "#eaf3ff"; ctx.fill();
  ctx.strokeStyle = ac; ctx.lineWidth = 2; ctx.stroke();

  text(ctx, "t = " + fmt(k, 1) + " T½", Math.min(pxk + 10, x0 + w - 10), Math.max(pyk - 12, y0 + 12), {
    size: 10, mono: true, weight: 650, align: pxk > x0 + w - 90 ? "right" : "left", color: "#d7e6ff"
  });

  pill(ctx, 486, 430, "A = " + fmt(+s.a0 * frac, 1) + " kBq", { bg: physAlpha(ac, .10), border: physAlpha(ac, .34), color: "#cfe0ff" });
  text(ctx, "N = N₀·2^(−t/T½) · A = λN", 30, 508, { size: 10.5, color: "rgba(150,195,215,.55)" });
}

defs["fizika-parchalanish"] = {
  key: "fizika-parchalanish",
  subject: "fizika",
  name: "2-ish · Yadro parchalanishi",
  labLabel: "2-ish · Yadro parchalanishi",
  kicker: "Fizika · yadro fizikasi",
  title: "Yadro qanchalik tez parchalanadi?",
  goal: "Maqsad: radioaktiv yadroning yarim yemirilish davri va aktivlik orasidagi bog‘lanishni kuzatish hamda <b>A = A₀·2^(−t/T½)</b> va <b>N = A/λ</b> formulalari bo‘yicha qolgan aktivlik va yadrolar sonini hisoblash.",
  accent: "#7fa8ff",
  equipment: ["I-131 namunasi", "Geiger–Myuller hisoblagichi", "Qo‘rg‘oshin ekran", "Sekundomer", "Aktivlik o‘lchagichi", "Yarim logarifmik shkala"],
  bigLabel: "qolgan aktivlik",
  hint: "Radioaktiv yemirilish — ehtimoliy jarayon: har bir yadro qachon parchalanishi tasodifiy, lekin katta to‘plam uchun qonuniyat aniq. λ = ln2/T½. Animatsiya shartli, hisob esa haqiqiy formula bo‘yicha bajariladi.",
  controls: [
    { id: "iso", label: "Radioaktiv izotop", type: "select", value: "i131", options: [
      { value: "i131", label: "I-131 — yod (T½ = 8,02 kun)" },
      { value: "tc99m", label: "Tc-99m — texnetsiy (T½ = 6,01 soat)" },
      { value: "cs137", label: "Cs-137 — seziy (T½ = 30,17 yil)" },
      { value: "co60", label: "Co-60 — kobalt (T½ = 5,27 yil)" },
      { value: "c14", label: "C-14 — uglerod (T½ = 5 730 yil)" },
      { value: "ra226", label: "Ra-226 — radiy (T½ = 1 600 yil)" }
    ] },
    { id: "a0", label: "Boshlang‘ich aktivlik, A₀", type: "range", min: 10, max: 500, step: 10, value: 100, unit: "kBq", dec: 0 },
    { id: "ratio", label: "Kuzatish vaqti, t / T½", type: "range", min: 0, max: 10, step: .1, value: 1, unit: "T½", dec: 1 }
  ],
  state: { iso: "i131", a0: 100, ratio: 1 },
  compute(s) {
    const iso = PHYS_ISO[s.iso] || PHYS_ISO.i131;
    const k = +s.ratio;
    const frac = Math.pow(2, -k);
    const lam = Math.LN2 / iso.T;
    const a0 = +s.a0;
    const A = a0 * frac;
    const N = A * 1000 / lam;
    const t = k * iso.T;
    return {
      big: fmt(A, 1) + " kBq",
      readout: [
        ["Izotop", iso.name, ""],
        ["Yarim yemirilish davri, T½", physTime(iso.T), ""],
        ["Parchalanish turi", iso.mode, ""],
        ["Boshlang‘ich aktivlik, A₀", fmt(a0, 0), "kBq"],
        ["Kuzatish vaqti, t", fmt(k, 1) + " T½ = " + physTime(t), ""],
        ["Qolgan aktivlik, A", fmt(A, 1), "kBq", true],
        ["Qolgan yadrolar ulushi", fmt(frac * 100, 1), "%", true],
        ["Parchalangan ulush", fmt((1 - frac) * 100, 1), "%"],
        ["Yadrolar soni, N", sci(N, 2), "ta"],
        ["Yemirilish doimiysi, λ", sci(lam, 2), "s⁻¹"]
      ],
      calc: "Berilgan: A₀ = " + fmt(a0, 0) + " kBq, t = " + fmt(k, 1) + "·T½, " + iso.name + " uchun T½ = " + physTime(iso.T) + "\n\n" +
        "1) λ = ln2 / T½ = 0,693 / " + fmt(iso.T, 0) + " = " + sci(lam, 2) + " s⁻¹\n\n" +
        "2) A = A₀·2^(−t/T½) = " + fmt(a0, 0) + "·2^(−" + fmt(k, 1) + ") = " + fmt(A, 1) + " kBq\n\n" +
        "3) N = A / λ = " + fmt(A * 1000, 0) + " / " + sci(lam, 2) + " = " + sci(N, 2) + " ta\n\n" +
        "4) Qolgan ulush = 2^(−" + fmt(k, 1) + ")·100% = " + fmt(frac * 100, 1) + "%\n" +
        "5) Parchalangan ulush = 100% − " + fmt(frac * 100, 1) + "% = " + fmt((1 - frac) * 100, 1) + "%",
      conclusion: iso.name + " namunasi " + fmt(k, 1) + " yarim yemirilish davri (" + physTime(t) + ") o‘tgach " +
        fmt(frac * 100, 1) + "% gacha kamayadi: aktivlik " + fmt(a0, 0) + " kBq dan " + fmt(A, 1) +
        " kBq gacha tushadi. Namunada ≈ " + sci(N, 2) + " ta yadro qoladi."
    };
  },
  steps: [
    "Izotopni tanlang va uning yarim yemirilish davri T½ hamda parchalanish turini yozib oling.",
    "λ = ln2/T½ formula bo‘yicha yemirilish doimiysini hisoblang.",
    "Kuzatish vaqtini yarim yemirilish davrlari soni k = t/T½ ko‘rinishida belgilang.",
    "A = A₀·2^(−k) formula bo‘yicha qolgan aktivlikni toping.",
    "Qolgan va parchalangan yadrolar ulushini foizda hisoblang.",
    "N = A/λ orqali namunada qolgan yadrolar sonini aniqlang.",
    "Grafikdagi egri chiziqni kuzatib, xulosa yozing va hisobotni yuklab oling."
  ],
  questions: [
    "Yarim yemirilish davri nima va u nimaga bog‘liq?",
    "Nega aktivlik vaqt o‘tishi bilan kamayadi?",
    "Ikki yarim yemirilish davridan keyin namunaning necha foizi qoladi?",
    "Yemirilish doimiysi λ va yarim yemirilish davri T½ orasidagi bog‘lanish qanday?",
    "α, β va γ nurlanishlar bir-biridan nimasi bilan farq qiladi?",
    "Nega qolgan yadrolar soni N = A/λ formula orqali topiladi?",
    "Nega radioaktiv yemirilishni ehtimoliy jarayon deb ataymiz?"
  ],
  draw: drawPhysDecay
};

/* ============================================================
   3-amaliy. Adron kollayderi
   ============================================================ */

const PHYS_PROC = {
  higgs: {
    name: "H → ZZ* → 4ℓ",
    head: "Higgs bozoni",
    desc: "Higgs bozoni hosil bo‘lib, to‘rtta leptonga parchalanadi —\n2012-yilda shu kanal orqali kashf etilgan.",
    color: "#7fe3ff",
    tracks: [
      { a: 0.22, len: 94, R: 76, c: "#7fe3ff" },
      { a: 0.22 + Math.PI, len: 94, R: -76, c: "#7fe3ff" },
      { a: 1.08, len: 82, R: 66, c: "#ffd166" },
      { a: 1.08 + Math.PI, len: 82, R: -66, c: "#ffd166" }
    ]
  },
  z: {
    name: "Z → e⁺e⁻",
    head: "Z bozoni",
    desc: "Z bozoni elektron va pozitron juftiga parchalanadi;\nikkala iz qarama-qarshi yo‘nalishda chiqadi.",
    color: "#7fe3ff",
    tracks: [
      { a: 0.16, len: 104, R: 90, c: "#7fe3ff" },
      { a: 0.16 + Math.PI, len: 104, R: -90, c: "#7fe3ff" }
    ]
  },
  top: {
    name: "t t̄ → jetlar",
    head: "Top kvarklar",
    desc: "Top kvark jufti tez parchalanib, detektorda ko‘p jetli\nzarracha “yomg‘iri” hosil qiladi.",
    color: "#ff8a6b",
    tracks: (() => {
      const list = [];
      for (let i = 0; i < 9; i++) {
        list.push({
          a: i * TAU / 9 + .18,
          len: 40 + (i % 3) * 9,
          R: (i % 2 ? 1 : -1) * (32 + i * 3),
          c: i % 3 ? "#ff8a6b" : "#ffd166"
        });
      }
      list.push({ a: 2.55, len: 110, R: 620, c: "#7fe3ff" });
      return list;
    })()
  }
};

function physTrack(ctx, cx, cy, tr, grow, alpha) {
  const R = tr.R || 1e6;
  const len = tr.len * grow;
  ctx.beginPath();
  for (let d = 0; d <= len; d += 2) {
    const th = d / R;
    const lx = R * Math.sin(th);
    const ly = R * (1 - Math.cos(th));
    const x = cx + lx * Math.cos(tr.a) - ly * Math.sin(tr.a);
    const y = cy + lx * Math.sin(tr.a) + ly * Math.cos(tr.a);
    d ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.strokeStyle = physAlpha(tr.c, alpha);
  ctx.lineWidth = 1.7;
  ctx.stroke();
  const th = len / R;
  const ex = cx + R * Math.sin(th) * Math.cos(tr.a) - R * (1 - Math.cos(th)) * Math.sin(tr.a);
  const ey = cy + R * Math.sin(th) * Math.sin(tr.a) + R * (1 - Math.cos(th)) * Math.cos(tr.a);
  ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, TAU);
  ctx.fillStyle = physAlpha(tr.c, alpha);
  ctx.fill();
}

function drawPhysLhc(ctx, s, time) {
  const E = +s.energy;
  const proc = PHYS_PROC[s.proc] || PHYS_PROC.higgs;
  const gamma = E / PHYS_MP;
  const beta = Math.sqrt(1 - 1 / (gamma * gamma));
  const B = E * 1000 / (PHYS_FIELD_K * PHYS_R);
  const ac = "#66d9ff";

  subjectBg(ctx, "FIZIKA", "Adron kollayderi", "E_cm = " + fmt(2 * E, 1) + " TeV");

  const cx = 250, cy = 288, rx = 190, ry = 114;
  ctx.strokeStyle = "rgba(90,169,255,.08)";
  ctx.lineWidth = 28;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = "rgba(90,169,255,.20)";
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a0 = i * TAU / 8 + .08;
    const a1 = (i + 1) * TAU / 8 - .08;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1);
    ctx.strokeStyle = i % 2 ? "rgba(102,217,255,.5)" : "rgba(127,168,255,.34)";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  ctx.save();
  ctx.setLineDash([5, 12]);
  ctx.lineDashOffset = -time * 26;
  ctx.strokeStyle = "rgba(127,227,255,.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx - 5, ry - 5, 0, 0, TAU); ctx.stroke();
  ctx.lineDashOffset = time * 26;
  ctx.strokeStyle = "rgba(255,122,156,.7)";
  ctx.beginPath(); ctx.ellipse(cx, cy, rx + 4, ry + 4, 0, 0, TAU); ctx.stroke();
  ctx.restore();

  [[time * .55, "#7fe3ff"], [time * .55 + Math.PI, "#ff7a9c"]].forEach(b => {
    const x = cx + Math.cos(b[0]) * (rx - 5);
    const y = cy + Math.sin(b[0]) * (ry - 5);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
    g.addColorStop(0, physAlpha(b[1], .8));
    g.addColorStop(1, physAlpha(b[1], 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU);
    ctx.fillStyle = b[1]; ctx.fill();
  });

  const exps = [
    { a: -Math.PI / 2, n: "ATLAS", main: true },
    { a: Math.PI / 2, n: "CMS" },
    { a: -0.14, n: "LHCb" },
    { a: Math.PI + 0.5, n: "ALICE" }
  ];
  exps.forEach(e => {
    const x = cx + Math.cos(e.a) * rx;
    const y = cy + Math.sin(e.a) * ry;
    const bx = clamp(x - 30, 22, CW - 62);
    const by = y - 11;
    rr(ctx, bx, by, 60, 22, 11);
    ctx.fillStyle = "rgba(6,18,28,.92)";
    ctx.fill();
    ctx.strokeStyle = e.main ? physAlpha(ac, .8) : "rgba(150,205,235,.34)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    text(ctx, e.n, bx + 30, by + 14.5, { size: 9, align: "center", weight: 700, color: e.main ? "#bfeeff" : "rgba(200,225,240,.75)" });
  });

  text(ctx, "LHC · 26,7 km", cx, cy - 4, { size: 11.5, align: "center", weight: 700, color: "rgba(190,220,240,.6)" });
  text(ctx, "vakuum · 1,9 K · dipol magnitlar", cx, cy + 14, { size: 8.8, align: "center", color: "rgba(160,195,220,.45)" });

  const dx = 724, dy = 292;
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = "rgba(150,205,235,.28)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy - ry - 12); ctx.lineTo(dx - 96, dy - 104); ctx.stroke();
  ctx.setLineDash([]);

  const glow = ctx.createRadialGradient(dx, dy, 10, dx, dy, 152);
  glow.addColorStop(0, physAlpha(ac, .18));
  glow.addColorStop(1, physAlpha(ac, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(dx, dy, 152, 0, TAU); ctx.fill();

  const layers = [
    [24, "rgba(127,227,255,.5)", "rgba(127,227,255,.05)"],
    [44, "rgba(255,209,102,.42)", "rgba(255,209,102,.04)"],
    [66, "rgba(255,138,107,.4)", "rgba(255,138,107,.035)"],
    [94, "rgba(94,224,138,.4)", "rgba(94,224,138,.03)"],
    [122, "rgba(150,205,235,.32)", "rgba(150,205,235,.02)"]
  ];
  layers.forEach(l => {
    ctx.beginPath(); ctx.arc(dx, dy, l[0], 0, TAU);
    ctx.fillStyle = l[2]; ctx.fill();
    ctx.strokeStyle = l[1]; ctx.lineWidth = 1.3; ctx.stroke();
  });

  ctx.strokeStyle = "rgba(150,205,235,.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = i * TAU / 12;
    ctx.beginPath();
    ctx.moveTo(dx + Math.cos(a) * 24, dy + Math.sin(a) * 24);
    ctx.lineTo(dx + Math.cos(a) * 122, dy + Math.sin(a) * 122);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(200,225,240,.2)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(dx - 136, dy); ctx.lineTo(dx + 136, dy); ctx.stroke();

  const cyc = (time % 1.7) / 1.7;
  const grow = clamp(cyc / .55, 0, 1);
  const fade = 1 - clamp((cyc - .78) / .22, 0, 1);
  proc.tracks.forEach(tr => physTrack(ctx, dx, dy, tr, grow, fade));

  const flash = Math.max(0, 1 - cyc * 6);
  if (flash > 0) {
    const fg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 46);
    fg.addColorStop(0, "rgba(235,250,255," + flash + ")");
    fg.addColorStop(.4, physAlpha(proc.color, flash * .5));
    fg.addColorStop(1, physAlpha(proc.color, 0));
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.arc(dx, dy, 46, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(235,250,255," + flash + ")";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + .3;
      const r1 = 6, r2 = 16 + flash * 18;
      ctx.beginPath();
      ctx.moveTo(dx + Math.cos(a) * r1, dy + Math.sin(a) * r1);
      ctx.lineTo(dx + Math.cos(a) * r2, dy + Math.sin(a) * r2);
      ctx.stroke();
    }
  }

  text(ctx, "ATLAS kesimi (sxematik)", dx, 146, { size: 10.5, align: "center", weight: 650, color: "rgba(200,225,240,.75)" });
  text(ctx, proc.name, dx, 164, { size: 12, align: "center", mono: true, weight: 700, color: physAlpha(proc.color, .95) });

  const legend = [
    ["iz qatlami", "#7fe3ff"],
    ["kalorimetr", "#ffd166"],
    ["muon", "#5ee08a"]
  ];
  legend.forEach((l, i) => {
    const lx = 596 + i * 92;
    ctx.beginPath(); ctx.arc(lx, 444, 3.6, 0, TAU);
    ctx.fillStyle = l[1]; ctx.fill();
    text(ctx, l[0], lx + 8, 447.5, { size: 9, color: "rgba(170,200,220,.7)" });
  });

  text(ctx, "Halqa: 26,7 km · protonlar qarama-qarshi yo‘nalishda", 30, 462, { size: 10, color: "rgba(170,200,220,.68)" });
  text(ctx, "B = " + fmt(B, 2) + " T · γ = " + fmt(gamma, 0) + " · β = " + fmt(beta, 9), 30, 482, { size: 10, mono: true, color: "rgba(170,200,220,.68)" });
  text(ctx, "Sxematik o‘quv animatsiyasi — haqiqiy LHC ma’lumotlari emas", 30, 512, { size: 9.5, color: "rgba(150,195,215,.5)" });
}

defs["fizika-kollayder"] = {
  key: "fizika-kollayder",
  subject: "fizika",
  name: "3-ish · Adron kollayderi",
  labLabel: "3-ish · Adron kollayderi",
  kicker: "Fizika · yuqori energiyalar fizikasi",
  title: "Adron kollayderida nimalar sodir bo‘ladi?",
  goal: "Maqsad: protonlarning to‘qnashuv energiyasi, Lorentz faktori, tezligi va ularni halqada ushlab turuvchi magnit maydonini hisoblash hamda detektorda kuzatiladigan zarracha izlarini tahlil qilish.",
  accent: "#66d9ff",
  equipment: ["LHC halqasi sxemasi", "Dipol magnitlar", "ATLAS detektori", "CMS detektori", "Vakuum kamerasi", "Ma’lumot yig‘ish tizimi"],
  bigLabel: "to‘qnashuv energiyasi",
  hint: "Sxematik o‘quv animatsiyasi — haqiqiy LHC ma’lumotlari emas. B = p/(0,2998·R), R = 2 804 m; γ = E/(m_p c²), m_p c² = 0,000938 TeV. Har bir proton energiyasi E, to‘qnashuv energiyasi E_cm = 2E.",
  controls: [
    { id: "energy", label: "Har bir proton energiyasi, E", type: "range", min: .45, max: 7, step: .05, value: 6.5, unit: "TeV", dec: 2 },
    { id: "proc", label: "Kuzatiladigan jarayon", type: "select", value: "higgs", options: [
      { value: "higgs", label: "H → ZZ* → 4ℓ (Higgs bozoni)" },
      { value: "z", label: "Z → e⁺e⁻ (Z bozoni)" },
      { value: "top", label: "t t̄ → jetlar (top kvarklar)" }
    ] }
  ],
  state: { energy: 6.5, proc: "higgs" },
  compute(s) {
    const E = +s.energy;
    const Ecm = 2 * E;
    const gamma = E / PHYS_MP;
    const beta = Math.sqrt(1 - 1 / (gamma * gamma));
    const B = E * 1000 / (PHYS_FIELD_K * PHYS_R);
    const f = PHYS_C / PHYS_CIRC;
    const Trev = 1 / f;
    const proc = PHYS_PROC[s.proc] || PHYS_PROC.higgs;
    return {
      big: fmt(Ecm, 2) + " TeV",
      readout: [
        ["Rejim", "proton–proton (p–p)", ""],
        ["Har bir proton energiyasi, E", fmt(E, 2), "TeV"],
        ["To‘qnashuv energiyasi, E_cm", fmt(Ecm, 2), "TeV", true],
        ["Lorentz faktori, γ", fmt(gamma, 0), ""],
        ["Tezlik, β = v/c", fmt(beta, 9), ""],
        ["Magnit maydon, B", fmt(B, 2), "T", true],
        ["Halqa radiusi, R", fmt(PHYS_R, 0), "m"],
        ["Aylanish chastotasi, f", fmt(f, 0), "Hz"],
        ["Bir aylanish vaqti, T", fmt(Trev * 1e6, 1), "µs"],
        ["Jarayon", proc.name, ""]
      ],
      calc: "Berilgan: E = " + fmt(E, 2) + " TeV (har bir proton), R = " + fmt(PHYS_R, 0) + " m, jarayon — " + proc.name + "\n\n" +
        "1) E_cm = 2E = 2·" + fmt(E, 2) + " = " + fmt(Ecm, 2) + " TeV\n\n" +
        "2) γ = E/(m_p c²) = " + fmt(E, 2) + " / 0,000938 = " + fmt(gamma, 0) + "\n\n" +
        "3) β = √(1 − 1/γ²) = " + fmt(beta, 9) + "\n\n" +
        "4) B = E/(0,2998·R) = " + fmt(E * 1000, 0) + " / (0,2998·" + fmt(PHYS_R, 0) + ") = " + fmt(B, 2) + " T\n\n" +
        "5) f = c/C = 299 792 458 / " + fmt(PHYS_CIRC, 3) + " = " + fmt(f, 0) + " Hz\n" +
        "   T = 1/f = " + fmt(Trev * 1e6, 1) + " µs\n\n" +
        proc.name + ": " + proc.desc,
      conclusion: "Har bir proton " + fmt(E, 2) + " TeV energiya bilan to‘qnashadi: E_cm = " + fmt(Ecm, 2) +
        " TeV, γ = " + fmt(gamma, 0) + ", β = " + fmt(beta, 9) + ". Protonlarni halqada ushlab turish uchun B = " +
        fmt(B, 2) + " T magnit maydoni kerak. " + proc.name + " kanalida detektorda " + proc.tracks.length + " ta zarracha izi kuzatiladi."
    };
  },
  steps: [
    "Har bir proton energiyasini tanlang va to‘qnashuv energiyasini E_cm = 2E bo‘yicha hisoblang.",
    "γ = E/(m_p c²) orqali Lorentz faktorini toping.",
    "β = √(1 − 1/γ²) formula bo‘yicha proton tezligini hisoblang.",
    "B = E/(0,2998·R) orqali protonlarni ushlab turuvchi magnit maydonini aniqlang.",
    "Aylanish chastotasi f = c/C va bir aylanish vaqtini hisoblang.",
    "Kuzatiladigan jarayonni tanlab, detektordagi zarracha izlarini kuzating.",
    "Barcha natijalarni yozib, xulosa qiling va hisobotni yuklab oling."
  ],
  questions: [
    "Nega kollayder halqasi juda katta quriladi?",
    "Nega zaryadlangan zarrachalarni halqada ushlab turish uchun magnit maydoni kerak?",
    "Lorentz faktori γ va tezlik β nimani ifodalaydi?",
    "Nega kollayder trubasida vakuum hosil qilinadi?",
    "Detektor qatlamlari qanday vazifani bajaradi?",
    "Higgs bozoni qanday zarracha izlari orqali aniqlanadi?",
    "Nega top kvark detektorda to‘g‘ridan-to‘g‘ri ko‘rinmaydi?"
  ],
  draw: drawPhysLhc
};

/* ============================================================
   Ulanish: tablar, karta va footer
   ============================================================ */

SUBJECT_LABS.fizika = ["fizika", "fizika-parchalanish", "fizika-kollayder"];

const physCard = CARDS.find(c => c.key === "fizika");
if (physCard) {
  physCard.count = "3 ish";
  physCard.tagline = "Erkin tushish, yadro parchalanishi va adron kollayderi.";
  physCard.tags = ["3 ish", "yadro", "TXT"];
}
const physFoot = document.querySelector("footer .footer-inner span:last-child");
if (physFoot) physFoot.textContent = "8 fan · " + (6 + Object.keys(defs).length) + " ish · animatsiyalar · hisobot";
renderCards();
window.SubjectCatalog = { defs: defs, labs: SUBJECT_LABS };
const physStartHash = (location.hash || "").replace(/^#/, "");
if (physStartHash === "fizika" || physStartHash === "fizika-parchalanish" || physStartHash === "fizika-kollayder") route();
