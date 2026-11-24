"use strict";

/* ============================================================
   FIZIKA — 4–8-amaliy ishlar: mayatnik, Om qonuni,
   kalorimetriya, yupqa linza va fotoeffekt.
   subjects.js dagi defs ga ulanadi.
   ============================================================ */

const HC_EV_NM = 1239.84;

const PHYS_MATERIALS = {
  cu: { name: "Mis", rho: 0.017, color: "#bd7a4c" },
  al: { name: "Alyuminiy", rho: 0.028, color: "#b9c6d4" },
  ni: { name: "Nixrom", rho: 1.10, color: "#c9a15e" }
};

const PHYS_HEAT = {
  water: { name: "Suv", c: 4200 },
  alu: { name: "Alyuminiy", c: 900 },
  iron: { name: "Temir", c: 460 }
};

const PHYS_PHOTO = {
  cs: { name: "Seziy (Cs)", A: 2.1 },
  zn: { name: "Rux (Zn)", A: 4.3 },
  pt: { name: "Platina (Pt)", A: 5.6 }
};

/* ---------------- 4-ish. Mayatnik ---------------- */

function drawPhysPendulum(ctx, s, time) {
  const l = +s.l, t10 = +s.t10;
  const T = t10 / 10;
  const g = 4 * Math.PI * Math.PI * l / (T * T);
  const ac = "#5aa9ff";
  subjectBg(ctx, "FIZIKA", "Mayatnik", "T = 2π√(l/g)");

  panel(ctx, 120, 120, 440, 340, ac);
  const px = 320, py = 158;
  const lPix = 90 + (l / 2) * 200;
  const amp = 0.27;
  const ang = amp * Math.cos(time * TAU / Math.max(T, 0.35));
  const bx = px + Math.sin(ang) * lPix;
  const by = py + Math.cos(ang) * lPix;

  ctx.strokeStyle = "rgba(150,205,235,.5)";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(px - 8, py - 12); ctx.lineTo(px + 8, py - 12); ctx.stroke();

  ctx.setLineDash([3, 7]);
  ctx.strokeStyle = "rgba(150,205,235,.22)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(px, py, lPix, Math.PI / 2 - amp, Math.PI / 2 + amp); ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(190,220,240,.6)";
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();

  const bobR = 15;
  const glow = ctx.createRadialGradient(bx, by, 2, bx, by, bobR * 2.6);
  glow.addColorStop(0, hexA(ac, .5));
  glow.addColorStop(1, hexA(ac, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(bx, by, bobR * 2.6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(bx, by, bobR, 0, TAU);
  ctx.fillStyle = "#8fc6ff";
  ctx.fill();
  ctx.strokeStyle = "rgba(220,240,255,.7)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath(); ctx.arc(bx - 4, by - 4, 4, 0, TAU);
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.fill();

  for (let i = 1; i <= 5; i++) {
    const y = py + lPix * i / 5;
    ctx.strokeStyle = "rgba(150,205,235,.25)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 16, y); ctx.lineTo(px + (i % 2 ? 26 : 22), y); ctx.stroke();
  }
  text(ctx, "l = " + fmt(l, 2) + " m", px + 34, py + lPix / 2, { size: 11, color: "#bcd9f2" });
  text(ctx, "T = " + fmt(T, 2) + " s", px - 90, py + lPix + 34, { size: 11, color: "#9db2c6" });

  panel(ctx, 590, 120, 300, 340, ac);
  const lines = [
    ["Ip uzunligi, l", fmt(l, 2) + " m"],
    ["10 tebranish, t₁₀", fmt(t10, 1) + " s"],
    ["Davr, T = t₁₀/10", fmt(T, 3) + " s"],
    ["g = 4π²l/T²", fmt(g, 2) + " m/s²"],
    ["Jadval qiymati", fmt(G, 2) + " m/s²"],
    ["Xatolik", fmt((g - G) / G * 100, 2) + " %"]
  ];
  lines.forEach((row, i) => {
    const y = 170 + i * 42;
    text(ctx, row[0], 614, y, { size: 10.5, color: "rgba(160,195,220,.7)" });
    text(ctx, row[1], 866, y, { size: i === 3 ? 13 : 11.5, align: "right", weight: i === 3 ? 700 : 500, color: i === 3 ? "#8fc6ff" : "#dcebf5" });
  });
}

defs["fizika-mayatnik"] = {
  key: "fizika-mayatnik",
  subject: "fizika",
  name: "4-ish · Mayatnik",
  labLabel: "4-ish · Mayatnik",
  kicker: "Fizika · tebranishlar",
  title: "Mayatnik yordamida g ni qanday aniqlaymiz?",
  goal: "Maqsad: matematik mayatnikning tebranish davrini o‘lchab, <b>T = 2π√(l/g)</b> va <b>g = 4π²l/T²</b> formulalari bo‘yicha erkin tushish tezlanishini aniqlash va jadval qiymati bilan solishtirish.",
  accent: "#5aa9ff",
  equipment: ["Ip va metall shar", "Shtativ", "O‘lchov lentasi", "Sekundomer", "Transportir", "Qisqich"],
  bigLabel: "aniqlangan g",
  hint: "Kichik burchak (α < 5°) uchun mayatnik davri amplitudaga bog‘liq emas. 10 ta to‘liq tebranish vaqtini o‘lchab, davrni T = t₁₀/10 orqali topamiz.",
  controls: [
    { id: "l", label: "Ip uzunligi, l", type: "range", min: 0.2, max: 2, step: 0.05, value: 1, unit: "m", dec: 2 },
    { id: "t10", label: "10 tebranish vaqti, t₁₀", type: "range", min: 5, max: 40, step: 0.1, value: 20.1, unit: "s", dec: 1 }
  ],
  state: { l: 1, t10: 20.1 },
  compute(s) {
    const l = +s.l, t10 = +s.t10;
    const T = t10 / 10;
    const g = 4 * Math.PI * Math.PI * l / (T * T);
    const err = (g - G) / G * 100;
    return {
      big: fmt(g, 2) + " m/s²",
      readout: [
        ["Ip uzunligi, l", fmt(l, 2), "m"],
        ["10 tebranish vaqti, t₁₀", fmt(t10, 1), "s"],
        ["Bir tebranish davri, T", fmt(T, 3), "s", true],
        ["Aniqlangan g", fmt(g, 2), "m/s²", true],
        ["Jadval qiymati, g", fmt(G, 2), "m/s²"],
        ["Nisbiy xatolik, ε", fmt(err, 2), "%"]
      ],
      calc: "T = t₁₀ / 10 = " + fmt(t10, 1) + " / 10 = " + fmt(T, 3) + " s\n\n" +
        "g = 4π²l / T²\n" +
        "g = 4π² × " + fmt(l, 2) + " / " + fmt(T, 3) + "² = " + fmt(g, 2) + " m/s²\n\n" +
        "ε = |g − 9,81| / 9,81 × 100% = " + fmt(Math.abs(err), 2) + "%",
      conclusion: "l = " + fmt(l, 2) + " m mayatnikning davri T = " + fmt(T, 3) + " s bo‘lib, undan g = " +
        fmt(g, 2) + " m/s² aniqlandi. Jadval qiymatidan farq " + fmt(err, 2) + "%. Xatolik asosan vaqtni o‘lchashdagi noaniqlikdan kelib chiqadi."
    };
  },
  draw: drawPhysPendulum,
  steps: [
    "Ip uzunligini o‘lchab, slayderga qo‘ying.",
    "Mayatnikni kichik burchakka og‘dirib qo‘yib yuboring.",
    "10 ta to‘liq tebranish vaqtini o‘lchab, t₁₀ ni kiriting.",
    "Davrni T = t₁₀/10 orqali hisoblang.",
    "g = 4π²l/T² formula bo‘yicha erkin tushish tezlanishini toping.",
    "Natijani 9,81 m/s² bilan solishtirib, xatolikni baholang."
  ],
  questions: [
    "Nega mayatnik davri sharning massasiga bog‘liq emas?",
    "Nega katta burchaklarda formula aniqligi pasayadi?",
    "Ip uzunligi 4 marta ortsa, davr necha marta ortadi?",
    "Xatolikni kamaytirish uchun nima qilish kerak?"
  ]
};

/* ---------------- 5-ish. Om qonuni ---------------- */

function drawPhysOhm(ctx, s, time) {
  const mat = PHYS_MATERIALS[s.mat] || PHYS_MATERIALS.cu;
  const l = +s.l, d = +s.d, U = +s.u;
  const S = Math.PI * d * d / 4;
  const R = mat.rho * l / S;
  const I = U / R;
  const P = U * I;
  const ac = "#f5b84b";
  subjectBg(ctx, "FIZIKA", "Om qonuni", "R = ρl/S");

  panel(ctx, 110, 120, 740, 340, ac);
  const L = 190, Rr = 760, Tt = 210, B = 400;
  ctx.strokeStyle = "rgba(190,220,240,.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L, Tt); ctx.lineTo(L, B); ctx.lineTo(Rr, B); ctx.lineTo(Rr, Tt); ctx.lineTo(600, Tt);
  ctx.stroke();

  ctx.fillStyle = "rgba(20,40,55,.95)";
  rr(ctx, 560, Tt - 26, 84, 52, 8);
  ctx.fill();
  ctx.strokeStyle = hexA(ac, .8);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.strokeStyle = hexA(ac, .85);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const x = 566 + i * 9;
    const y = Tt + (i % 2 ? -12 : 12);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  text(ctx, "R = " + fmt(R, 2) + " Ω", 602, Tt + 44, { size: 11, align: "center", color: "#ffe0a0" });

  const glow = ctx.createRadialGradient(602, Tt, 4, 602, Tt, 70);
  glow.addColorStop(0, hexA(ac, Math.min(.5, P / 3000)));
  glow.addColorStop(1, hexA(ac, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(602, Tt, 70, 0, TAU); ctx.fill();

  // manba
  ctx.fillStyle = "rgba(15,35,48,.95)";
  rr(ctx, L - 30, 268, 60, 74, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(190,220,240,.5)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  text(ctx, "+", L, 288, { size: 15, align: "center", weight: 700, color: "#ffd0d0" });
  text(ctx, "−", L, 330, { size: 15, align: "center", weight: 700, color: "#bcd9f2" });
  text(ctx, "U = " + fmt(U, 1) + " V", L, 366, { size: 11, align: "center", color: "#bcd9f2" });

  // ampermetr
  ctx.beginPath(); ctx.arc(430, Tt, 24, 0, TAU);
  ctx.fillStyle = "rgba(8,22,32,.95)";
  ctx.fill();
  ctx.strokeStyle = hexA(ac, .7);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  text(ctx, "A", 430, Tt + 5, { size: 13, align: "center", weight: 700, color: "#ffe0a0" });
  text(ctx, fmt(I, 2) + " A", 430, Tt - 34, { size: 11, align: "center", color: "#ffe0a0" });

  // voltaетр
  ctx.beginPath(); ctx.arc(430, B, 24, 0, TAU);
  ctx.fillStyle = "rgba(8,22,32,.95)";
  ctx.fill();
  ctx.strokeStyle = "rgba(190,220,240,.45)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  text(ctx, "V", 430, B + 5, { size: 13, align: "center", weight: 700, color: "#bcd9f2" });
  text(ctx, "voltmetr", 430, B + 46, { size: 9.5, align: "center", color: "rgba(160,195,220,.7)" });
  text(ctx, "P = " + fmt(P, 1) + " W", Rr + 42, B - 6, { size: 11, align: "right", color: "#bcd9f2" });

  text(ctx, mat.name + " sim · l = " + fmt(l, 0) + " m · d = " + fmt(d, 2) + " mm", 130, 140 + 0, { size: 10.5, color: "rgba(160,195,220,.7)" });
}

defs["fizika-om"] = {
  key: "fizika-om",
  subject: "fizika",
  name: "5-ish · Om qonuni",
  labLabel: "5-ish · Om qonuni",
  kicker: "Fizika · elektr toki",
  title: "Simning qarshiligi va tok kuchini qanday aniqlaymiz?",
  goal: "Maqsad: o‘tkazgich qarshiligini <b>R = ρl/S</b> orqali hisoblash, Om qonuni <b>I = U/R</b> va quvvat <b>P = UI</b> bo‘yicha tok kuchi hamda ajraladigan quvvatni aniqlash.",
  accent: "#f5b84b",
  equipment: ["O‘tkazgich namuna", "Shtangensirkul", "O‘lchov lentasi", "Manba", "Ampermetr", "Voltmetr"],
  bigLabel: "qarshilik",
  hint: "ρ — solishtirma qarshilik (Ω·mm²/m), S — ko‘ndalang kesim yuzasi (mm²). Sim diametri 2 marta ortsa, qarshilik 4 marta kamayadi.",
  controls: [
    { id: "mat", label: "Material", type: "select", value: "cu", options: [
      { value: "cu", label: "Mis (ρ = 0,017)" },
      { value: "al", label: "Alyuminiy (ρ = 0,028)" },
      { value: "ni", label: "Nixrom (ρ = 1,10)" }
    ] },
    { id: "l", label: "Sim uzunligi, l", type: "range", min: 1, max: 100, step: 1, value: 20, unit: "m", dec: 0 },
    { id: "d", label: "Sim diametri, d", type: "range", min: 0.1, max: 1, step: 0.05, value: 0.5, unit: "mm", dec: 2 },
    { id: "u", label: "Manba kuchlanishi, U", type: "range", min: 1, max: 24, step: 1, value: 12, unit: "V", dec: 0 }
  ],
  state: { mat: "cu", l: 20, d: 0.5, u: 12 },
  compute(s) {
    const mat = PHYS_MATERIALS[s.mat] || PHYS_MATERIALS.cu;
    const l = +s.l, d = +s.d, U = +s.u;
    const S = Math.PI * d * d / 4;
    const R = mat.rho * l / S;
    const I = U / R;
    const P = U * I;
    return {
      big: fmt(R, 2) + " Ω",
      readout: [
        ["Material", mat.name, ""],
        ["Uzunlik, l", fmt(l, 0), "m"],
        ["Kesim yuzasi, S = πd²/4", fmt(S, 4), "mm²"],
        ["Qarshilik, R = ρl/S", fmt(R, 2), "Ω", true],
        ["Kuchlanish, U", fmt(U, 0), "V"],
        ["Tok kuchi, I = U/R", fmt(I, 3), "A", true],
        ["Quvvat, P = UI", fmt(P, 2), "W"]
      ],
      calc: "S = πd²/4 = π × " + fmt(d, 2) + "² / 4 = " + fmt(S, 4) + " mm²\n\n" +
        "R = ρl/S = " + fmt(mat.rho, 3) + " × " + fmt(l, 0) + " / " + fmt(S, 4) + " = " + fmt(R, 2) + " Ω\n\n" +
        "I = U/R = " + fmt(U, 0) + " / " + fmt(R, 2) + " = " + fmt(I, 3) + " A\n" +
        "P = U·I = " + fmt(U, 0) + " × " + fmt(I, 3) + " = " + fmt(P, 2) + " W",
      conclusion: mat.name + " simdan (" + fmt(l, 0) + " m, d = " + fmt(d, 2) + " mm) yasalgan o‘tkazgich qarshiligi " +
        fmt(R, 2) + " Ω. " + fmt(U, 0) + " V kuchlanishda tok " + fmt(I, 3) + " A bo‘lib, " + fmt(P, 2) +
        " W quvvat ajraladi." + (I > 5 ? " Diqqat: tok katta — sim qizib ketishi va izolyatsiya kuishi mumkin." : "")
    };
  },
  draw: drawPhysOhm,
  steps: [
    "Materialni tanlang va solishtirma qarshiligini aniqlang.",
    "Sim uzunligi va diametrini o‘lchab, kesim yuzasini hisoblang.",
    "R = ρl/S formula bo‘yicha qarshilikni toping.",
    "Manba kuchlanishini tanlang.",
    "I = U/R bo‘yicha tok kuchini hisoblang.",
    "P = UI orqali ajraladigan quvvatni aniqlang."
  ],
  questions: [
    "Nega nixrom qizdirish elementlarida ishlatiladi?",
    "Sim diametri 2 marta ortsa, qarshilik necha marta o‘zgaradi?",
    "Nega uzun simlarda kuchlanish pasayishi katta?",
    "Tok kuchi oshsa, sim nega qiziydi?"
  ]
};

/* ---------------- 6-ish. Kalorimetriya ---------------- */

function drawPhysCalor(ctx, s, time) {
  const cSet = PHYS_HEAT[s.c] || PHYS_HEAT.water;
  const m = +s.m, dT = +s.dT, P = +s.p;
  const Q = cSet.c * m * dT;
  const t = Q / P;
  const ac = "#ff8a6b";
  subjectBg(ctx, "FIZIKA", "Kalorimetriya", "Q = cmΔT");

  panel(ctx, 140, 120, 430, 340, ac);
  const cx0 = 250, cw = 190, top = 210, bot = 402;
  const fill = clamp(dT / 90, 0.05, 1);
  const liqTop = bot - (bot - top) * fill;

  ctx.strokeStyle = "rgba(190,220,240,.55)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx0 - 10, top); ctx.lineTo(cx0, top); ctx.lineTo(cx0, bot);
  ctx.lineTo(cx0 + cw, bot); ctx.lineTo(cx0 + cw, top); ctx.lineTo(cx0 + cw + 10, top);
  ctx.stroke();

  const lg = ctx.createLinearGradient(0, liqTop, 0, bot);
  lg.addColorStop(0, hexA(ac, .38));
  lg.addColorStop(1, hexA(ac, .14));
  ctx.fillStyle = lg;
  ctx.fillRect(cx0 + 3, liqTop, cw - 6, bot - liqTop);

  ctx.strokeStyle = "rgba(255,170,140,.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const x = cx0 + 26 + i * 14;
    const y = bot - 14 + (i % 2 ? -9 : 9);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  if (dT >= 60) {
    for (let i = 0; i < 9; i++) {
      const bx = cx0 + 28 + (i * 37) % (cw - 56);
      const by = liqTop - ((time * 40 + i * 23) % 80);
      const a = 1 - (liqTop - by) / 80;
      ctx.strokeStyle = "rgba(255,220,200," + (0.5 * a).toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(bx, by, 3.4, 0, TAU); ctx.stroke();
    }
  }

  // termometr
  const tx = 500;
  ctx.strokeStyle = "rgba(190,220,240,.6)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(tx, 150); ctx.lineTo(tx, 380); ctx.stroke();
  ctx.strokeStyle = hexA(ac, .85);
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(tx, 380); ctx.lineTo(tx, 380 - 200 * fill); ctx.stroke();
  ctx.beginPath(); ctx.arc(tx, 388, 9, 0, TAU);
  ctx.fillStyle = hexA(ac, .85);
  ctx.fill();
  text(ctx, "ΔT = " + fmt(dT, 0) + " °C", tx + 16, 230, { size: 11, color: "#ffd0c2" });
  text(ctx, "m = " + fmt(m, 1) + " kg", cx0 + cw / 2, top - 12, { size: 11, align: "center", color: "#bcd9f2" });
  text(ctx, "Q = " + fmt(Q / 1000, 1) + " kJ", cx0 + cw / 2, bot + 28, { size: 12, align: "center", weight: 700, color: "#ffc2b0" });

  panel(ctx, 590, 120, 300, 340, ac);
  const lines = [
    ["Modda", cSet.name],
    ["Solishtirma issiqlik, c", fmt(cSet.c, 0) + " J/(kg·°C)"],
    ["Massa, m", fmt(m, 1) + " kg"],
    ["Qizdirish, ΔT", fmt(dT, 0) + " °C"],
    ["Issiqlik miqdori, Q", fmt(Q / 1000, 2) + " kJ"],
    ["Qizdirgich quvvati, P", fmt(P, 0) + " W"],
    ["Kerakli vaqt, t = Q/P", fmt(t, 1) + " s"]
  ];
  lines.forEach((row, i) => {
    const y = 168 + i * 40;
    text(ctx, row[0], 614, y, { size: 10.5, color: "rgba(160,195,220,.7)" });
    text(ctx, row[1], 866, y, { size: i === 4 ? 12.5 : 11, align: "right", weight: i === 4 ? 700 : 500, color: i === 4 ? "#ffc2b0" : "#dcebf5" });
  });
}

defs["fizika-kalorimetriya"] = {
  key: "fizika-kalorimetriya",
  subject: "fizika",
  name: "6-ish · Kalorimetriya",
  labLabel: "6-ish · Kalorimetriya",
  kicker: "Fizika · issiqlik hodisalari",
  title: "Suvni qizdirish uchun qancha issiqlik kerak?",
  goal: "Maqsad: jismni qizdirish uchun sarflanadigan issiqlik miqdorini <b>Q = cmΔT</b> bo‘yicha hisoblash va qizdirgich quvvati orqali kerakli vaqtni <b>t = Q/P</b> aniqlash.",
  accent: "#ff8a6b",
  equipment: ["Kalorimetr", "Termometr", "Suv va o‘lchov menzurkasi", "Elektr qizdirgich", "Tarozi", "Sekundomer"],
  bigLabel: "issiqlik miqdori",
  hint: "Suvning solishtirma issiqlik sig‘imi c = 4200 J/(kg·°C): 1 kg suvni 1 °C ga qizdirish uchun 4200 J energiya kerak. Isrofgarchilik hisobga olinmagan.",
  controls: [
    { id: "c", label: "Modda", type: "select", value: "water", options: [
      { value: "water", label: "Suv (c = 4200)" },
      { value: "alu", label: "Alyuminiy (c = 900)" },
      { value: "iron", label: "Temir (c = 460)" }
    ] },
    { id: "m", label: "Massa, m", type: "range", min: 0.1, max: 2, step: 0.1, value: 1, unit: "kg", dec: 1 },
    { id: "dT", label: "Qizdirish, ΔT", type: "range", min: 10, max: 90, step: 5, value: 40, unit: "°C", dec: 0 },
    { id: "p", label: "Qizdirgich quvvati, P", type: "range", min: 300, max: 2000, step: 100, value: 800, unit: "W", dec: 0 }
  ],
  state: { c: "water", m: 1, dT: 40, p: 800 },
  compute(s) {
    const cSet = PHYS_HEAT[s.c] || PHYS_HEAT.water;
    const m = +s.m, dT = +s.dT, P = +s.p;
    const Q = cSet.c * m * dT;
    const t = Q / P;
    return {
      big: fmt(Q / 1000, 1) + " kJ",
      readout: [
        ["Modda", cSet.name, ""],
        ["Solishtirma issiqlik, c", fmt(cSet.c, 0), "J/(kg·°C)"],
        ["Massa, m", fmt(m, 1), "kg"],
        ["Qizdirish, ΔT", fmt(dT, 0), "°C"],
        ["Issiqlik miqdori, Q", fmt(Q / 1000, 2), "kJ", true],
        ["Qizdirgich quvvati, P", fmt(P, 0), "W"],
        ["Kerakli vaqt, t", fmt(t, 1), "s", true]
      ],
      calc: "Q = c·m·ΔT\n" +
        "Q = " + fmt(cSet.c, 0) + " × " + fmt(m, 1) + " × " + fmt(dT, 0) + " = " + fmt(Q / 1000, 2) + " kJ\n\n" +
        "t = Q/P\n" +
        "t = " + fmt(Q / 1000, 2) + " kJ / " + fmt(P, 0) + " W = " + fmt(t, 1) + " s ≈ " + fmt(t / 60, 1) + " min",
      conclusion: fmt(m, 1) + " kg " + cSet.name.toLowerCase() + "ni " + fmt(dT, 0) + " °C ga qizdirish uchun " +
        fmt(Q / 1000, 2) + " kJ issiqlik kerak. " + fmt(P, 0) + " W quvvatli qizdirgich buni " +
        fmt(t, 1) + " s (" + fmt(t / 60, 1) + " min) da beradi. Amalda issiqlikning bir qismi atrof-muhitga yo‘qoladi, shuning uchun vaqt biroz uzunroq bo‘ladi."
    };
  },
  draw: drawPhysCalor,
  steps: [
    "Moddani tanlang va uning solishtirma issiqlik sig‘imini yozib oling.",
    "Massani o‘lchab, slayderga qo‘ying.",
    "Boshlang‘ich va oxirgi haroratni o‘lchab, ΔT ni toping.",
    "Q = cmΔT bo‘yicha issiqlik miqdorini hisoblang.",
    "Qizdirgich quvvatini tanlang.",
    "t = Q/P orqali qizdirish vaqtini aniqlang."
  ],
  questions: [
    "Nega suvning issiqlik sig‘imi metallarnikidan katta?",
    "Qizdirish vaqti quvvatga qanday bog‘liq?",
    "Nega amalda hisoblangan vaqtdan ko‘proq vaqt ketadi?",
    "ΔT 2 marta ortsa, Q qanday o‘zgaradi?"
  ]
};

/* ---------------- 7-ish. Yupqa linza ---------------- */

function lensImage(F, d) {
  const den = 1 / F - 1 / d;
  if (Math.abs(den) < 1e-4) return { f: Infinity, k: Infinity };
  const f = 1 / den;
  return { f, k: f / d };
}

function drawPhysLens(ctx, s, time) {
  const F = +s.f, d = +s.dist;
  const res = lensImage(F, d);
  const f = res.f, k = res.k;
  const ac = "#b28dff";
  subjectBg(ctx, "FIZIKA", "Yupqa linza", "1/F = 1/d + 1/f");

  panel(ctx, 90, 120, 780, 340, ac);
  const axisY = 290, lensX = 480, PPX = 2.2;
  ctx.strokeStyle = "rgba(150,205,235,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(120, axisY); ctx.lineTo(840, axisY); ctx.stroke();

  const lensH = 150;
  ctx.strokeStyle = hexA(ac, .55);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(lensX, axisY, 26, lensH / 2, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = hexA(ac, .08);
  ctx.fill();

  [-1, 1].forEach(sgn => {
    const fx = lensX + sgn * F * PPX;
    ctx.beginPath(); ctx.arc(fx, axisY, 3.4, 0, TAU);
    ctx.fillStyle = hexA(ac, .8);
    ctx.fill();
    text(ctx, sgn < 0 ? "F" : "F′", fx, axisY + 20, { size: 10, align: "center", color: "#cbb3ff" });
  });

  const objX = Math.max(150, lensX - d * PPX);
  const objH = 62;
  arrow(ctx, objX, axisY, objX, axisY - objH, "#7fe3ff");
  text(ctx, "d = " + fmt(d, 0) + " sm", objX, axisY + 36, { size: 10.5, align: "center", color: "#9db2c6" });

  if (isFinite(f)) {
    const imgXraw = lensX + f * PPX;
    const imgX = clamp(imgXraw, 150, 820);
    const imgH = clamp(Math.abs(k) * objH, 16, 150);
    const real = f > 0;
    const imgTop = real ? axisY + imgH : axisY - imgH;
    ctx.save();
    if (!real) ctx.setLineDash([5, 5]);
    arrow(ctx, imgX, axisY, imgX, imgTop, real ? "#ffc24b" : "#ff7a9c");
    ctx.restore();
    text(ctx, "f = " + fmt(f, 1) + " sm", imgX, real ? axisY + 36 : axisY - 18, { size: 10.5, align: "center", color: real ? "#ffe0a0" : "#ffc2d0" });

    ctx.strokeStyle = "rgba(127,227,255,.5)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(objX, axisY - objH); ctx.lineTo(lensX, axisY); ctx.lineTo(imgX, real ? axisY + imgH : axisY - imgH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(objX, axisY - objH); ctx.lineTo(lensX, axisY - objH);
    const fx2 = lensX + F * PPX;
    ctx.moveTo(lensX, axisY - objH); ctx.lineTo(fx2, axisY); ctx.stroke();
    if (!real) {
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(255,122,156,.4)";
      ctx.beginPath(); ctx.moveTo(fx2, axisY); ctx.lineTo(lensX, axisY - objH); ctx.stroke();
      ctx.restore();
    }
  } else {
    text(ctx, "Jism fokusda — nurlar parallel ketadi, tasvir cheksizlikda", lensX + 30, 180, { size: 11, color: "#ffe0a0" });
  }

  const kind = !isFinite(f) ? "tasvir cheksizlikda"
    : f > 0 ? (Math.abs(k) > 1 ? "haqiqiy, teskari, kattalashgan" : "haqiqiy, teskari, kichraygan")
      : "mavhum, to‘g‘ri, kattalashgan";
  text(ctx, kind, 700, 430, { size: 10.5, align: "right", color: "rgba(160,195,220,.85)" });
  text(ctx, "k = " + (isFinite(k) ? fmt(k, 2) : "—"), 700, 446, { size: 10.5, align: "right", color: "rgba(160,195,220,.85)" });
}

function arrow(ctx, x0, y0, x1, y1, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.42) * 9, y1 - Math.sin(a - 0.42) * 9);
  ctx.lineTo(x1 - Math.cos(a + 0.42) * 9, y1 - Math.sin(a + 0.42) * 9);
  ctx.closePath();
  ctx.fill();
}

defs["fizika-linza"] = {
  key: "fizika-linza",
  subject: "fizika",
  name: "7-ish · Yupqa linza",
  labLabel: "7-ish · Yupqa linza",
  kicker: "Fizika · geometrik optika",
  title: "Linza tasvirni qanday hosil qiladi?",
  goal: "Maqsad: yupqa linza formulasidan foydalanib tasvir masofasini aniqlash, kattalashtirishni hisoblash va haqiqiy hamda mavhum tasvir holatlarini farqlash.",
  accent: "#b28dff",
  equipment: ["Yig‘uvchi linza", "Optik skameyka", "Yorug‘lik manbai", "Ekran", "Chizg‘ich", "Shtativlar"],
  bigLabel: "tasvir masofasi",
  hint: "1/F = 1/d + 1/f. d > F bo‘lsa tasvir haqiqiy va teskari; d < F bo‘lsa mavhum, to‘g‘ri va kattalashgan bo‘ladi. d = F da nurlar parallel ketadi.",
  controls: [
    { id: "f", label: "Linza fokus masofasi, F", type: "range", min: 5, max: 30, step: 1, value: 10, unit: "sm", dec: 0 },
    { id: "dist", label: "Jism masofasi, d", type: "range", min: 5, max: 100, step: 1, value: 30, unit: "sm", dec: 0 }
  ],
  state: { f: 10, dist: 30 },
  compute(s) {
    const F = +s.f, d = +s.dist;
    const { f, k } = lensImage(F, d);
    const kind = !isFinite(f) ? "Tasvir cheksizlikda (fokusda)"
      : f > 0 ? (Math.abs(k) > 1 ? "Haqiqiy, teskari, kattalashgan" : "Haqiqiy, teskari, kichraygan")
        : "Mavhum, to‘g‘ri, kattalashgan";
    return {
      big: isFinite(f) ? fmt(f, 1) + " sm" : "∞",
      readout: [
        ["Fokus masofasi, F", fmt(F, 0), "sm"],
        ["Jism masofasi, d", fmt(d, 0), "sm"],
        ["Tasvir masofasi, f", isFinite(f) ? fmt(f, 1) : "∞", "sm", true],
        ["Kattalashtirish, k = f/d", isFinite(k) ? fmt(k, 2) : "—", "", true],
        ["Tasvir turi", kind, ""],
        ["F/d nisbati", fmt(d / F, 2), ""]
      ],
      calc: "1/F = 1/d + 1/f  ⇒  f = F·d / (d − F)\n" +
        "f = " + fmt(F, 0) + " × " + fmt(d, 0) + " / (" + fmt(d, 0) + " − " + fmt(F, 0) + ") = " +
        (isFinite(f) ? fmt(f, 2) + " sm" : "∞") + "\n\n" +
        "k = f/d = " + (isFinite(k) ? fmt(Math.abs(k), 2) : "—") + "\n\n" +
        kind + ". d " + (d > F ? ">" : d < F ? "<" : "=") + " F bo‘lgani uchun shunday natija olindi.",
      conclusion: "F = " + fmt(F, 0) + " sm linza uchun d = " + fmt(d, 0) + " sm masofadagi jism tasviri " +
        (isFinite(f) ? "f = " + fmt(f, 1) + " sm da hosil bo‘ladi" : "cheksizlikda bo‘ladi") + ". " + kind +
        (isFinite(k) ? ", kattalashtirish k = " + fmt(Math.abs(k), 2) : "") + "."
    };
  },
  draw: drawPhysLens,
  steps: [
    "Linzaning fokus masofasini tanlang.",
    "Jismni linzadan ma’lum masofaga qo‘ying.",
    "1/F = 1/d + 1/f formula bo‘yicha tasvir masofasini hisoblang.",
    "k = f/d orqali kattalashtirishni toping.",
    "Tasvir haqiqiy yoki mavhumligini aniqlang.",
    "Ekranda tasvirning holatini kuzatib, xulosa yozing."
  ],
  questions: [
    "Nega d < F bo‘lganda tasvir mavhum bo‘ladi?",
    "Qanday holatda tasvir jism bilan bir xil kattalikda bo‘ladi?",
    "Nega fokusda turgan jismning tasviri ekranda ko‘rinmaydi?",
    "Kattalashtirish manfiy bo‘lishi nimani bildiradi?"
  ]
};

/* ---------------- 8-ish. Fotoeffekt ---------------- */

function drawPhysPhoto(ctx, s, time) {
  const mat = PHYS_PHOTO[s.mat] || PHYS_PHOTO.cs;
  const lam = +s.lam;
  const E = HC_EV_NM / lam;
  const Ek = E - mat.A;
  const emit = Ek > 0;
  const ac = "#66d9ff";
  subjectBg(ctx, "FIZIKA", "Fotoeffekt", "hν = A + E_k");

  panel(ctx, 120, 130, 720, 340, ac);
  ctx.strokeStyle = "rgba(150,205,235,.4)";
  ctx.lineWidth = 2;
  rr(ctx, 210, 180, 480, 230, 22);
  ctx.stroke();
  ctx.fillStyle = "rgba(8,24,36,.6)";
  ctx.fill();

  const cathX = 320, anodX = 590, y0 = 215, y1 = 375;
  ctx.fillStyle = "rgba(190,220,240,.85)";
  rr(ctx, cathX - 7, y0, 14, y1 - y0, 4);
  ctx.fill();
  rr(ctx, anodX - 7, y0, 14, y1 - y0, 4);
  ctx.fill();
  text(ctx, "katod", cathX, y1 + 26, { size: 10, align: "center", color: "#9db2c6" });
  text(ctx, "anod", anodX, y1 + 26, { size: 10, align: "center", color: "#9db2c6" });
  text(ctx, mat.name + " · A = " + fmt(mat.A, 1) + " eV", 450, 162, { size: 10.5, align: "center", color: "#bcd9f2" });

  for (let i = 0; i < 4; i++) {
    const p = ((time * 0.5 + i * 0.25) % 1);
    const x = 232 + p * (cathX - 240);
    ctx.strokeStyle = "rgba(102,217,255," + (0.18 + 0.5 * (1 - p)).toFixed(3) + ")";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    for (let dx = 0; dx <= 18; dx += 3) {
      const yy = 258 + i * 26 + Math.sin(dx * 0.9 + time * 8 + i) * 4;
      dx ? ctx.lineTo(x + dx, yy) : ctx.moveTo(x + dx, yy);
    }
    ctx.stroke();
  }

  if (emit) {
    const speed = clamp(Ek / 3, 0.12, 1);
    for (let i = 0; i < 9; i++) {
      const p = ((time * (0.5 + speed) + i * 0.37) % 1);
      const x = cathX + 12 + p * (anodX - cathX - 24);
      const yy = 230 + (i % 5) * 32 + Math.sin(time * 5 + i) * 4;
      ctx.beginPath(); ctx.arc(x, yy, 4.2, 0, TAU);
      ctx.fillStyle = "rgba(127,227,255,.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(127,227,255,.35)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 12 * speed, yy); ctx.lineTo(x - 4, yy); ctx.stroke();
    }
    const glow = ctx.createRadialGradient(cathX, 295, 6, cathX, 295, 90);
    glow.addColorStop(0, "rgba(127,227,255,.22)");
    glow.addColorStop(1, "rgba(127,227,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cathX, 295, 90, 0, TAU); ctx.fill();
  } else {
    text(ctx, "energiya yetarli emas — emissiya yo‘q", (cathX + anodX) / 2, 300, { size: 11.5, align: "center", color: "#ff9d9d" });
  }

  const rows = [
    ["To‘lqin uzunligi, λ", fmt(lam, 0) + " nm"],
    ["Foton energiyasi, hν", fmt(E, 2) + " eV"],
    ["Chiqish ishi, A", fmt(mat.A, 1) + " eV"],
    ["Maksimal kinetik energiya, E_k", emit ? fmt(Ek, 2) + " eV" : "0 eV"],
    ["To‘xtatuvchi kuchlanish, U_t", emit ? fmt(Ek, 2) + " V" : "—"],
    ["Chegaraviy to‘lqin, λ_max = hc/A", fmt(HC_EV_NM / mat.A, 0) + " nm"]
  ];
  rows.forEach((row, i) => {
    const y = 380 + (i % 3) * 22;
    const x = i < 3 ? 140 : 500;
    text(ctx, row[0], x, y, { size: 10, color: "rgba(160,195,220,.7)" });
    text(ctx, row[1], x + 330, y, { size: 10.5, align: "right", weight: 600, color: "#dcebf5" });
  });
}

defs["fizika-fotoeffekt"] = {
  key: "fizika-fotoeffekt",
  subject: "fizika",
  name: "8-ish · Fotoeffekt",
  labLabel: "8-ish · Fotoeffekt",
  kicker: "Fizika · kvant hodisalari",
  title: "Yorug‘lik metallardan elektronlarni qanday chiqaradi?",
  goal: "Maqsad: Eynshteyn tenglamasi <b>hν = A + E_k</b> bo‘yicha foton energiyasini, chiqish ishini va elektronlarning maksimal kinetik energiyasini hisoblash hamda chegaraviy to‘lqin uzunligini aniqlash.",
  accent: "#66d9ff",
  equipment: ["Vakuum fotoelement", "Monoxromator", "Metall katod", "Manba", "Mikroampermetr", "To‘xtatuvchi kuchlanish manbai"],
  bigLabel: "kinetik energiya",
  hint: "hν = 1239,84/λ(nm) eV. Foton energiyasi chiqish ishidan kichik bo‘lsa, elektron chiqmaydi — yorug‘lik intensivligi qancha katta bo‘lsa ham. To‘xtatuvchi kuchlanish U_t = E_k/e.",
  controls: [
    { id: "mat", label: "Katod materiali", type: "select", value: "cs", options: [
      { value: "cs", label: "Seziy (A = 2,1 eV)" },
      { value: "zn", label: "Rux (A = 4,3 eV)" },
      { value: "pt", label: "Platina (A = 5,6 eV)" }
    ] },
    { id: "lam", label: "Yorug‘lik to‘lqin uzunligi, λ", type: "range", min: 200, max: 800, step: 10, value: 400, unit: "nm", dec: 0 }
  ],
  state: { mat: "cs", lam: 400 },
  compute(s) {
    const mat = PHYS_PHOTO[s.mat] || PHYS_PHOTO.cs;
    const lam = +s.lam;
    const E = HC_EV_NM / lam;
    const Ek = E - mat.A;
    const emit = Ek > 0;
    return {
      big: emit ? fmt(Ek, 2) + " eV" : "emissiya yo‘q",
      readout: [
        ["To‘lqin uzunligi, λ", fmt(lam, 0), "nm"],
        ["Foton energiyasi, hν", fmt(E, 2), "eV"],
        ["Chiqish ishi, A", fmt(mat.A, 1), "eV"],
        ["Maksimal kinetik energiya, E_k", emit ? fmt(Ek, 2) : "0", "eV", true],
        ["To‘xtatuvchi kuchlanish, U_t", emit ? fmt(Ek, 2) : "—", "V", true],
        ["Chegaraviy to‘lqin, λ_max", fmt(HC_EV_NM / mat.A, 0), "nm"]
      ],
      calc: "hν = 1239,84 / λ = 1239,84 / " + fmt(lam, 0) + " = " + fmt(E, 2) + " eV\n\n" +
        "E_k = hν − A = " + fmt(E, 2) + " − " + fmt(mat.A, 1) + " = " + fmt(Ek, 2) + " eV\n" +
        (emit ? "U_t = E_k/e = " + fmt(Ek, 2) + " V\n\n" : "E_k < 0 — fotoeffekt kuzatilmaydi.\n\n") +
        "λ_max = hc/A = 1239,84 / " + fmt(mat.A, 1) + " = " + fmt(HC_EV_NM / mat.A, 0) + " nm",
      conclusion: mat.name + " katodi uchun λ = " + fmt(lam, 0) + " nm yorug‘lik foton energiyasi " + fmt(E, 2) +
        " eV. Chiqish ishi " + fmt(mat.A, 1) + " eV bo‘lgani uchun " + (emit
          ? "elektronlar " + fmt(Ek, 2) + " eV kinetik energiya bilan chiqadi; to‘xtatuvchi kuchlanish " + fmt(Ek, 2) + " V."
          : "fotoeffekt sodir bo‘lmaydi — λ ni " + fmt(HC_EV_NM / mat.A, 0) + " nm dan kichraytirish kerak.") +
        " Chegaraviy to‘lqin uzunligi " + fmt(HC_EV_NM / mat.A, 0) + " nm."
    };
  },
  draw: drawPhysPhoto,
  steps: [
    "Katod materialini tanlang va chiqish ishini yozib oling.",
    "Yorug‘lik to‘lqin uzunligini tanlang.",
    "Foton energiyasini hν = 1239,84/λ orqali hisoblang.",
    "Eynshteyn tenglamasidan E_k ni toping.",
    "To‘xtatuvchi kuchlanishni U_t = E_k/e aniqlang.",
    "Shu material uchun chegaraviy to‘lqin uzunligini hisoblang."
  ],
  questions: [
    "Nega yorug‘lik intensivligi ortsa ham, E_k o‘zgarmaydi?",
    "Nega qizil yorug‘lik ba’zi metallarda fotoeffekt bermaydi?",
    "To‘xtatuvchi kuchlanish nimani o‘lchaydi?",
    "Chiqish ishi qanday omillarga bog‘liq?"
  ]
};

/* ============================================================
   Ulanish: tablar, karta va footer
   ============================================================ */

SUBJECT_LABS.fizika = [
  "fizika", "fizika-parchalanish", "fizika-kollayder",
  "fizika-mayatnik", "fizika-om", "fizika-kalorimetriya",
  "fizika-linza", "fizika-fotoeffekt"
];

const physCard3 = CARDS.find(c => c.key === "fizika");
if (physCard3) {
  physCard3.count = "8 ish";
  physCard3.tagline = "Erkin tushish, yadro, kollayder, mayatnik, Om qonuni, kalorimetriya, linza va fotoeffekt.";
  physCard3.tags = ["8 ish", "mexanika", "optika", "TXT"];
}
const physFoot3 = document.querySelector("footer .footer-inner span:last-child");
if (physFoot3) physFoot3.textContent = "8 fan · " + (6 + Object.keys(defs).length) + " ish · animatsiyalar · hisobot";
renderCards();
window.SubjectCatalog = { defs: defs, labs: SUBJECT_LABS };
const physStartHash3 = (location.hash || "").replace(/^#/, "");
if (["fizika-mayatnik", "fizika-om", "fizika-kalorimetriya", "fizika-linza", "fizika-fotoeffekt"].indexOf(physStartHash3) !== -1) route();
