"use strict";

/* ============================================================
   9-amaliy. Suruvchi pech
   ============================================================ */

const HEAT_V9 = [
  { name: "Kvadrat blyum (200×200)", mz: 1200, nz: 40, h: 2.0, f: .35 },
  { name: "To‘g‘ri to‘rtburchak sleyb", mz: 2500, nz: 30, h: 2.5, f: .40 },
  { name: "Kvadrat zagotovka (150×150)", mz: 650, nz: 60, h: 1.8, f: .38 },
  { name: "Dumaloq zagotovka (D220)", mz: 900, nz: 50, h: 2.2, f: .35 },
  { name: "Yirik blyum (300×300)", mz: 3200, nz: 25, h: 3.0, f: .42 },
  { name: "Qalin sleyb (250×1000)", mz: 4500, nz: 20, h: 3.5, f: .40 },
  { name: "Kvadrat zagotovka (120×120)", mz: 420, nz: 75, h: 1.5, f: .36 },
  { name: "Blyum zagotovka (250×250)", mz: 1800, nz: 35, h: 2.4, f: .37 },
  { name: "Quyma metall zagotovka", mz: 1100, nz: 45, h: 2.1, f: .35 },
  { name: "Maxsus prokat sleybi", mz: 2800, nz: 28, h: 2.8, f: .39 }
];

function v9Calc(s) {
  const total = +s.nz * +s.mz;
  return { P: total / +s.h, F: +s.f * total * 9.81 / 1000, total };
}

function drawHeat9(ctx, s, time) {
  const r = v9Calc(s);
  const tt = time || 0;
  const ac = "#ff8a6b";
  heatShell(ctx, "Suruvchi pechni hisoblash", "NamDTU · 2026 · 9-amaliy");

  heatPillRow(ctx, [s.name, "m_z = " + fmt(s.mz, 0) + " kg", "n_z = " + fmt(s.nz, 0) + " dona", "τ = " + fmt(s.h, 1) + " soat"], 80, ac);
  heatPillRow(ctx, ["P = " + fmt(r.P, 0) + " kg/soat", "F_sur = " + fmt(r.F, 1) + " kN", "f = " + fmt(s.f, 2)], 112, ac);

  const fx = 40, fy = 190, fw = 600, fh = 210;
  panel(ctx, fx, fy, fw, fh, ac);

  const shell = { x: fx + 46, y: fy + 42, w: fw - 92, h: 116 };
  rr(ctx, shell.x, shell.y, shell.w, shell.h, 8);
  ctx.fillStyle = "#101c26";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .45);
  ctx.lineWidth = 2;
  ctx.stroke();
  heatBrick(ctx, shell.x + 6, shell.y + 6, shell.w - 12, 12, "#c98d5a");
  heatBrick(ctx, shell.x + 6, shell.y + shell.h - 18, shell.w - 12, 12, "#c98d5a");

  const chx = shell.x + 18, chy = shell.y + 22, chw = shell.w - 36, chh = shell.h - 44;
  ctx.fillStyle = "#071019";
  ctx.fillRect(chx, chy, chw, chh);
  heatGlow(ctx, chx + chw / 2, chy + chh / 2, 150, "#ff9a55");

  const hot = heatColor(1150);
  const step = chw / 8;
  for (let i = 0; i < 8; i++) {
    const shift = (tt * 9) % step;
    const xx = chx + 8 + i * step + shift;
    if (xx > chx + chw - 34) continue;
    heatSteel(ctx, xx, chy + 24, 26, chh - 46, hot);
  }

  const pz = fx + 10, py = chy + 26;
  rr(ctx, pz, py, 30, 26, 4);
  ctx.fillStyle = "#26343f";
  ctx.fill();
  ctx.strokeStyle = "#9fb0c0";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pz + 30, py + 13);
  ctx.lineTo(chx + 4, py + 13);
  ctx.strokeStyle = "#c0ccd6";
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, "surgich", pz + 15, py + 42, { size: 8.5, align: "center", color: "#c0ccd6" });
  text(ctx, "gidravlik", pz + 15, py - 8, { size: 8, align: "center", color: "rgba(200,220,235,.6)" });

  for (let i = 0; i < 4; i++) {
    const yy = chy + 14 + i * 20;
    heatFlow(ctx, chx + chw - 10, yy, chx + 14, yy, heatA("#8fd3ff", .3), tt + i * .4, 20);
  }
  text(ctx, "tutun gazlari ←", chx + chw - 16, chy - 8, { size: 8.5, align: "right", color: "#9fc8e0" });
  text(ctx, "metall →", chx + 16, chy - 8, { size: 8.5, color: "#ffcf9a" });

  const px = 660, pw = 270;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "SURISH KUCHI", ac);
  heatGauge(ctx, px + pw / 2, fy + 92, 46, r.F / 500, "#ff8a6b", fmt(r.F, 0), "kN · F_sur");

  heatRow(ctx, px + 18, fy + 156, "Pechdagi massa", fmt(r.total, 0) + " kg", "#ffcf9a");
  heatRow(ctx, px + 150, fy + 156, "Unumdorlik, P", fmt(r.P, 0) + " kg/soat", "#9ff0e7");

  const px2 = 40, pw2 = 880;
  panel(ctx, px2, 416, pw2, 72, ac);
  const cells = [
    ["Unumdorlik", fmt(r.P / 1000, 2) + " t/soat"],
    ["Umumiy massa", fmt(r.total, 0) + " kg"],
    ["Ishqalanish koeff.", fmt(s.f, 2)],
    ["Surish kuchi", fmt(r.F, 1) + " kN"],
    ["Pechdagi soni", fmt(s.nz, 0) + " dona"]
  ];
  cells.forEach((c, i) => {
    const x = px2 + 24 + i * 174;
    text(ctx, c[0], x, 438, { size: 8.5, color: "rgba(185,210,225,.65)" });
    text(ctx, c[1], x, 460, { size: 13, mono: true, weight: 700, color: i === 3 ? "#ffb3a6" : "#e9f4fb" });
  });

  text(ctx, "P = n_z·m_z/τ   ·   F_sur = f·n_z·m_z·g/1000", 30, 518, { size: 10, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-9",
  subject: "quymakorlik",
  name: "9-ish · Suruvchi pech",
  labLabel: "9-ish · Suruvchi pech",
  kicker: "Quymakorlik · uzluksiz pechlar",
  title: "Suruvchi pech qanday kuch bilan ishlaydi?",
  goal: "Maqsad: zagotovkalar soni va massasidan foydalanib pech unumdorligi <b>P</b> va surish mexanizmining minimal kuchi <b>F_sur</b> ni hisoblash.",
  accent: "#ff8a6b",
  equipment: ["Suruvchi metodik pech", "Gidravlik surgich", "Skliz bruslar", "Zagotovkalar", "Dinamometr"],
  bigLabel: "surish kuchi",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 9-jadval. g = 9,81 m/s². Yuqori haroratda ishqalanish koeffitsiyenti f ≈ 0,35–0,45.",
  controls: [
    heatVarSelect(HEAT_V9, v => v.name + " · " + fmt(v.mz, 0) + " kg × " + fmt(v.nz, 0)),
    { id: "mz", label: "Bitta zagotovka massasi, m_z", type: "range", min: 200, max: 5000, step: 50, value: 1200, unit: "kg", dec: 0 },
    { id: "nz", label: "Pechdagi zagotovkalar soni, n_z", type: "range", min: 10, max: 80, step: 1, value: 40, unit: "dona", dec: 0 },
    { id: "h", label: "Qizish vaqti, τ", type: "range", min: 1, max: 4, step: .1, value: 2, unit: "soat", dec: 1 },
    { id: "f", label: "Ishqalanish koeffitsiyenti, f", type: "range", min: .30, max: .45, step: .01, value: .35, dec: 2 }
  ],
  state: { variant: 1, name: "Kvadrat blyum (200×200)", mz: 1200, nz: 40, h: 2, f: .35 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V9, { name: "name", mz: "mz", nz: "nz", h: "h", f: "f" });
  },
  compute(s) {
    const r = v9Calc(s);
    return {
      big: fmt(r.F, 1) + " kN",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Zagotovka turi", s.name, ""],
        ["Bitta massasi, m_z", fmt(s.mz, 0), "kg"],
        ["Pechdagi soni, n_z", fmt(s.nz, 0), "dona"],
        ["Qizish vaqti, τ", fmt(s.h, 1), "soat"],
        ["Ishqalanish koeff., f", fmt(s.f, 2), ""],
        ["Umumiy massa", fmt(r.total, 0), "kg", true],
        ["Unumdorlik, P", fmt(r.P, 1), "kg/soat", true],
        ["Unumdorlik", fmt(r.P / 1000, 3), "t/soat"],
        ["Surish kuchi, F_sur", fmt(r.F, 2), "kN", true]
      ],
      calc:
        "Berilgan: m_z = " + fmt(s.mz, 0) + " kg, n_z = " + fmt(s.nz, 0) + " dona, τ = " + fmt(s.h, 1) + " soat, f = " + fmt(s.f, 2) + "\n" +
        "g = 9,81 m/s²\n\n" +
        "1) Umumiy massa = n_z·m_z = " + fmt(s.nz, 0) + "·" + fmt(s.mz, 0) + " = " + fmt(r.total, 0) + " kg\n\n" +
        "2) P = n_z·m_z/τ = " + fmt(r.total, 0) + " / " + fmt(s.h, 1) + " = " + fmt(r.P, 1) + " kg/soat\n\n" +
        "3) F_sur = f·n_z·m_z·g/1000\n" +
        "     = " + fmt(s.f, 2) + "·" + fmt(s.nz, 0) + "·" + fmt(s.mz, 0) + "·9,81/1000 = " + fmt(r.F, 2) + " kN",
      conclusion:
        "№" + s.variant + " variant: " + s.name + " zagotovkalari uchun pech unumdorligi P = " + fmt(r.P, 0) +
        " kg/soat, umumiy massa " + fmt(r.total, 0) + " kg. Surgich kamida F_sur = " + fmt(r.F, 1) + " kN kuch bilan surishi kerak."
    };
  },
  steps: [
    "Variantdagi zagotovka massasi, soni, qizish vaqti va f ni yozib oling.",
    "Umumiy massani n_z·m_z orqali toping.",
    "P = n_z·m_z/τ unumdorlikni hisoblang.",
    "F_sur = f·n_z·m_z·g/1000 surish kuchini hisoblang.",
    "Natijalarni t/soat va kN da ifodalang.",
    "Qarama-qarshi oqim va zona ishlashini tahlil qilib xulosa yozing."
  ],
  questions: [
    "Suruvchi pechda zagotovkalar qanday harakatlanadi?",
    "Qarama-qarshi oqim prinsipi nimaga asoslangan?",
    "Metodik zonaning vazifasi nima?",
    "Tenglashtirish zonasi nima uchun kerak?",
    "Surish kuchi qaysi omillarga bog‘liq?",
    "Ishqalanish koeffitsiyenti harorat bilan qanday o‘zgaradi?"
  ],
  draw: drawHeat9
});

/* ============================================================
   10-amaliy. Metodik pech
   ============================================================ */

const HEAT_V10 = [
  { name: "Po‘lat blyum (250×250)", P: 45, ps: 350, Q: 110, eta: 58 },
  { name: "Prokat sleybi (200×800)", P: 60, ps: 400, Q: 145, eta: 62 },
  { name: "Kvadrat zagotovka (150×150)", P: 30, ps: 320, Q: 75, eta: 55 },
  { name: "Og‘ir sleyb (300×1000)", P: 80, ps: 420, Q: 190, eta: 65 },
  { name: "Rel’s po‘lat blyumi", P: 50, ps: 380, Q: 125, eta: 60 },
  { name: "Quvur blyumi (200×200)", P: 35, ps: 340, Q: 88, eta: 56 },
  { name: "Lenta sleybi (180×600)", P: 55, ps: 390, Q: 135, eta: 61 },
  { name: "Legirlangan kvadrat zagotovka", P: 25, ps: 300, Q: 65, eta: 52 },
  { name: "Yirik truba zagotovkasi", P: 65, ps: 410, Q: 160, eta: 63 },
  { name: "Maxsus profilli blyum", P: 40, ps: 360, Q: 98, eta: 57 }
];
const V10_QSH = 29300;

function v10Calc(s) {
  const Fpod = +s.P * 1000 / +s.ps;
  const bsh = +s.Q * 1e6 / (+s.P * V10_QSH);
  return { Fpod, bsh };
}

function drawHeat10(ctx, s, time) {
  const r = v10Calc(s);
  const tt = time || 0;
  const ac = "#ffd166";
  heatShell(ctx, "Metodik pechni hisoblash", "NamDTU · 2026 · 10-amaliy");

  heatPillRow(ctx, [s.name, "P = " + fmt(s.P, 0) + " t/soat", "p_sol = " + fmt(s.ps, 0) + " kg/(m²·soat)", "Q = " + fmt(s.Q, 0) + " GJ/soat"], 80, ac);
  heatPillRow(ctx, ["F_pod = " + fmt(r.Fpod, 1) + " m²", "b_sh = " + fmt(r.bsh, 1) + " kg sh.y./t", "η = " + fmt(s.eta, 0) + "%"], 112, ac);

  const fx = 40, fy = 170, fw = 600, fh = 230;
  panel(ctx, fx, fy, fw, fh, ac);

  const tx = fx + 30, ty = fy + 68, tw = fw - 60, th = 108;
  const zones = [["METODIK", 0.30, "#8fd3ff"], ["PAYVANDLASH", 0.42, "#ffb26b"], ["TENGLASHTIRISH", 0.28, "#ffe6a3"]];
  let zx = tx;
  zones.forEach(z => {
    const zw = tw * z[1];
    const g = ctx.createLinearGradient(zx, 0, zx + zw, 0);
    g.addColorStop(0, heatA(z[2], .05));
    g.addColorStop(.5, heatA(z[2], .14));
    g.addColorStop(1, heatA(z[2], .05));
    ctx.fillStyle = g;
    ctx.fillRect(zx, ty, zw, th);
    ctx.strokeStyle = heatA(z[2], .25);
    ctx.strokeRect(zx, ty, zw, th);
    text(ctx, z[0], zx + zw / 2, ty - 10, { size: 8.5, align: "center", weight: 750, color: heatA(z[2], .9) });
    zx += zw;
  });

  const hot = heatColor(1200);
  for (let i = 0; i < 11; i++) {
    const base = (i * (tw - 40) / 11 + tt * 16) % (tw - 40);
    const xx = tx + 12 + base;
    heatSteel(ctx, xx, ty + th - 42, 24, 22, i < 4 ? heatColor(700) : hot);
  }
  text(ctx, "metall →", tx + 8, ty + th + 18, { size: 8.5, color: "#ffcf9a" });
  text(ctx, "← tutun gazlari", tx + tw - 8, ty + th + 18, { size: 8.5, align: "right", color: "#9fc8e0" });

  for (let i = 0; i < 4; i++) {
    const yy = ty + 16 + i * 22;
    heatFlow(ctx, tx + tw - 8, yy, tx + 8, yy, heatA("#8fd3ff", .24), tt + i * .3, 18);
  }

  const gx0 = tx + 20, gy0 = fy + 192, gw = tw - 40, gh = 26;
  heatSpark(ctx, gx0, gy0, gw, gh, [.2, .35, .6, .85, .95, .98, .96, .9, .6], "#ffb26b", true);
  text(ctx, "metall harorati", gx0, gy0 - 5, { size: 8, color: "rgba(200,220,235,.6)" });

  const px = 660, pw = 270;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "POD MAYDONI", ac);
  heatGauge(ctx, px + pw / 2, fy + 92, 46, r.Fpod / 300, "#ffd166", fmt(r.Fpod, 0), "m² · F_pod");
  heatRow(ctx, px + 18, fy + 160, "b_sh", fmt(r.bsh, 1) + " kg sh.y./t", "#ffd166");
  heatRow(ctx, px + 18, fy + 198, "Pech FIK", fmt(s.eta, 0) + " %", "#9ff0e7");

  panel(ctx, 40, 418, 880, 70, ac);
  const cells = [
    ["Unumdorlik", fmt(s.P, 0) + " t/soat"],
    ["Pod kuchlanishi", fmt(s.ps, 0) + " kg/(m²·soat)"],
    ["Pod maydoni", fmt(r.Fpod, 1) + " m²"],
    ["Issiqlik quvvati", fmt(s.Q, 0) + " GJ/soat"],
    ["Shartli yoqilg‘i", fmt(r.bsh, 1) + " kg/t"]
  ];
  cells.forEach((c, i) => {
    const x = 64 + i * 172;
    text(ctx, c[0], x, 440, { size: 8.5, color: "rgba(185,210,225,.65)" });
    text(ctx, c[1], x, 462, { size: 12.5, mono: true, weight: 700, color: i === 4 ? "#ffd166" : "#e9f4fb" });
  });

  text(ctx, "F_pod = P·1000/p_sol   ·   b_sh = Q_umum·10⁶/(P·Q_sh)   ·   Q_sh = 29 300 kJ/kg", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-10",
  subject: "quymakorlik",
  name: "10-ish · Metodik pech",
  labLabel: "10-ish · Metodik pech",
  kicker: "Quymakorlik · uzluksiz pechlar",
  title: "Metodik pechning pod maydoni qanday topiladi?",
  goal: "Maqsad: pech unumdorligi va pod kuchlanishidan foydalanib aktiv pod maydoni <b>F_pod</b> va 1 tonna metallga sarflanadigan shartli yoqilg‘i <b>b_sh</b> ni hisoblash.",
  accent: "#ffd166",
  equipment: ["Metodik pech", "Rekuperator", "Pod maydoni o‘lchagichi", "Gaz analizatori", "Termojuftlar"],
  bigLabel: "aktiv pod maydoni",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 10-jadval. Q_sh = 29 300 kJ/kg. b_sh = Q_umum·10⁶/(P·Q_sh), bunda Q_umum — GJ/soat, P — t/soat.",
  controls: [
    heatVarSelect(HEAT_V10, v => v.name + " · " + fmt(v.P, 0) + " t/soat"),
    { id: "P", label: "Unumdorlik, P", type: "range", min: 20, max: 90, step: 1, value: 45, unit: "t/soat", dec: 0 },
    { id: "ps", label: "Pod kuchlanishi, p_sol", type: "range", min: 280, max: 450, step: 5, value: 350, unit: "kg/(m²·soat)", dec: 0 },
    { id: "Q", label: "Issiqlik quvvati, Q_umum", type: "range", min: 55, max: 200, step: 1, value: 110, unit: "GJ/soat", dec: 0 },
    { id: "eta", label: "Pech FIK, η", type: "range", min: 50, max: 70, step: 1, value: 58, unit: "%", dec: 0 }
  ],
  state: { variant: 1, name: "Po‘lat blyum (250×250)", P: 45, ps: 350, Q: 110, eta: 58 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V10, { name: "name", P: "P", ps: "ps", Q: "Q", eta: "eta" });
  },
  compute(s) {
    const r = v10Calc(s);
    return {
      big: fmt(r.Fpod, 1) + " m²",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Zagotovka turi", s.name, ""],
        ["Unumdorlik, P", fmt(s.P, 0), "t/soat"],
        ["Pod kuchlanishi, p_sol", fmt(s.ps, 0), "kg/(m²·soat)"],
        ["Issiqlik quvvati, Q_umum", fmt(s.Q, 0), "GJ/soat"],
        ["Pech FIK, η", fmt(s.eta, 0), "%"],
        ["Aktiv pod maydoni, F_pod", fmt(r.Fpod, 2), "m²", true],
        ["Shartli yoqilg‘i, b_sh", fmt(r.bsh, 2), "kg sh.y./t", true],
        ["1 soatdagi yoqilg‘i", fmt(r.bsh * +s.P, 0), "kg sh.y./soat"]
      ],
      calc:
        "Berilgan: P = " + fmt(s.P, 0) + " t/soat, p_sol = " + fmt(s.ps, 0) + " kg/(m²·soat), Q_umum = " + fmt(s.Q, 0) + " GJ/soat\n" +
        "Q_sh = 29 300 kJ/kg\n\n" +
        "1) F_pod = P·1000/p_sol = " + fmt(+s.P * 1000, 0) + " / " + fmt(s.ps, 0) + " = " + fmt(r.Fpod, 2) + " m²\n\n" +
        "2) Q_umum = " + fmt(s.Q, 0) + " GJ/soat = " + fmt(+s.Q * 1e6, 0) + " kJ/soat\n\n" +
        "3) b_sh = Q_umum·10⁶/(P·Q_sh)\n" +
        "     = " + fmt(+s.Q * 1e6, 0) + " / (" + fmt(s.P, 0) + "·29 300) = " + fmt(r.bsh, 2) + " kg sh.y./t",
      conclusion:
        "№" + s.variant + " variant: P = " + fmt(s.P, 0) + " t/soat va p_sol = " + fmt(s.ps, 0) +
        " kg/(m²·soat) bo‘lganda aktiv pod maydoni F_pod = " + fmt(r.Fpod, 1) + " m². 1 t metallga b_sh = " +
        fmt(r.bsh, 1) + " kg shartli yoqilg‘i sarflanadi."
    };
  },
  steps: [
    "Variantdagi P, p_sol, Q_umum va η qiymatlarini yozib oling.",
    "F_pod = P·1000/p_sol pod maydonini hisoblang.",
    "Q_umum ni GJ/soat dan kJ/soat ga o‘tkazing.",
    "b_sh = Q_umum·10⁶/(P·Q_sh) shartli yoqilg‘i sarfini toping.",
    "Zonalar bo‘yicha harorat rejimini tahlil qiling.",
    "Rekuperator va regenerator samarasini izohlab xulosa yozing."
  ],
  questions: [
    "Metodik pechda gaz va metall qanday harakatlanadi?",
    "Metodik zona qanday issiqlik manbaidan foydalanadi?",
    "Tenglashtirish zonasining maqsadi nima?",
    "Rekuperator va regenerator nima uchun ishlatiladi?",
    "Payvandlash zonasida harorat qancha bo‘ladi?",
    "Pod kuchlanishi oshsa pod maydoni qanday o‘zgaradi?"
  ],
  draw: drawHeat10
});

/* ============================================================
   11-amaliy. Pech-vanna
   ============================================================ */

const HEAT_V11 = [
  { G: 40, t1: 20, t2: 800, tq: 12, Qy: 10.5 },
  { G: 60, t1: 20, t2: 850, tq: 18, Qy: 14.0 },
  { G: 35, t1: 15, t2: 780, tq: 10, Qy: 9.0 },
  { G: 75, t1: 20, t2: 900, tq: 20, Qy: 16.5 },
  { G: 50, t1: 25, t2: 860, tq: 15, Qy: 12.0 },
  { G: 45, t1: 20, t2: 820, tq: 14, Qy: 11.0 },
  { G: 80, t1: 20, t2: 920, tq: 22, Qy: 18.0 },
  { G: 30, t1: 15, t2: 750, tq: 10, Qy: 8.5 },
  { G: 55, t1: 20, t2: 840, tq: 16, Qy: 13.0 },
  { G: 65, t1: 20, t2: 880, tq: 18, Qy: 15.0 }
];

function v11Calc(s) {
  const Qf = +s.G * .68 * (+s.t2 - +s.t1) / (3600 * (+s.tq / 60));
  const Ph = 1.25 * (Qf + +s.Qy);
  return { Qf, Ph, Pst: heatStdTransformer(Ph) };
}

function drawHeat11(ctx, s, time) {
  const r = v11Calc(s);
  const tt = time || 0;
  const ac = "#b28dff";
  heatShell(ctx, "Pech-vannani hisoblash", "NamDTU · 2026 · 11-amaliy");

  heatPillRow(ctx, ["G = " + fmt(s.G, 0) + " kg", fmt(s.t1, 0) + " → " + fmt(s.t2, 0) + " °C", "t_q = " + fmt(s.tq, 0) + " min", "Q_y = " + fmt(s.Qy, 1) + " kW"], 80, ac);
  heatPillRow(ctx, ["Q_f = " + fmt(r.Qf, 2) + " kW", "P_h = " + fmt(r.Ph, 2) + " kW", "P_st = " + fmt(r.Pst, 0) + " kW"], 112, ac);

  const fx = 40, fy = 172, fw = 450, fh = 250;
  panel(ctx, fx, fy, fw, fh, ac);

  const bx = fx + 56, by = fy + 54, bw = 210, bh = 146;
  rr(ctx, bx - 12, by - 12, bw + 24, bh + 24, 8);
  ctx.fillStyle = "#1b2733";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .4);
  ctx.lineWidth = 2;
  ctx.stroke();

  const salt = ctx.createLinearGradient(0, by + 34, 0, by + bh);
  salt.addColorStop(0, "rgba(255,180,110,.55)");
  salt.addColorStop(1, "rgba(255,120,70,.75)");
  ctx.fillStyle = salt;
  ctx.fillRect(bx, by + 34, bw, bh - 34);
  ctx.strokeStyle = heatA("#ffd0a0", .6);
  ctx.beginPath(); ctx.moveTo(bx, by + 34); ctx.lineTo(bx + bw, by + 34); ctx.stroke();

  for (let i = 0; i < 6; i++) {
    const xx = bx + 20 + i * 34;
    const yy = by + 58 + (i % 2) * 18;
    heatSteel(ctx, xx, yy, 18, 40, heatColor(+s.t2));
  }
  ctx.strokeStyle = "rgba(220,230,240,.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(bx + 12, by + 48, bw - 24, 66);
  text(ctx, "savatdagi detallar", bx + bw / 2, by + 18, { size: 8.5, align: "center", color: "#ffd0a0" });

  for (let i = 0; i < 4; i++) {
    const xx = bx + 24 + i * 52;
    rr(ctx, xx, by + bh - 10, 12, 24, 4);
    ctx.fillStyle = "#ff8a55";
    ctx.fill();
    heatGlow(ctx, xx + 6, by + bh + 2, 22, "#ff9a55");
  }
  text(ctx, "isitgichlar", bx + bw / 2, by + bh + 34, { size: 8.5, align: "center", color: "rgba(220,215,240,.7)" });

  text(ctx, "erigan tuz (NaCl)", bx + bw / 2, by + 31, { size: 8, align: "center", color: "#ffd0a0" });

  panel(ctx, 508, fy, 422, fh, ac);
  heatPanelTitle(ctx, 526, fy + 26, "QUVVATLAR BALANSI", ac);

  const maxP = Math.max(r.Ph, 1);
  [["Foydali, Q_f", r.Qf, "#ffb26b", fy + 46], ["Yo‘qotish, Q_y", s.Qy, "#ff9f6b", fy + 92], ["Hisobiy, P_h", r.Ph, "#b28dff", fy + 138]].forEach(row => {
    text(ctx, row[0], 526, row[3] + 11, { size: 9.5, color: "rgba(205,200,230,.75)" });
    heatBar(ctx, 526, row[3] + 18, 236, 12, row[1] / maxP, row[2]);
    text(ctx, fmt(row[1], 2) + " kW", 772, row[3] + 29, { size: 11, mono: true, weight: 650, color: row[2] });
  });

  text(ctx, "k_z = 1,25", 526, fy + 190, { size: 9.5, color: "rgba(205,200,230,.65)" });
  text(ctx, "STANDART TRANSFORMATOR", 526, fy + 216, { size: 8.5, weight: 750, color: heatA(ac, .8) });
  const tw = pill(ctx, 526, fy + 224, "P_st = " + fmt(r.Pst, 0) + " kW", {
    bg: heatA(ac, .16), border: heatA(ac, .45), color: "#ded0ff", size: 13, h: 28
  });
  text(ctx, "tanlandi", 526 + tw + 10, fy + 242, { size: 9, color: "rgba(205,200,230,.6)" });

  text(ctx, "Q_f = G·c·(T₂−T₁)/(3600·t_q)   ·   P_h = k_z·(Q_f + Q_y)", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-11",
  subject: "quymakorlik",
  name: "11-ish · Pech-vanna",
  labLabel: "11-ish · Pech-vanna",
  kicker: "Quymakorlik · tuzli vannalar",
  title: "Tuzli pech-vannaning quvvati qancha?",
  goal: "Maqsad: bir marta yuklanadigan massa va qizdirish vaqtidan foydalanib foydali quvvat <b>Q_f</b>, hisobiy quvvat <b>P_h</b> va standart transformator quvvatini tanlash.",
  accent: "#b28dff",
  equipment: ["Tuzli pech-vanna", "NaCl / BaCl2 tuzi", "Savat", "Termojuft", "Transformator", "Sekundomer"],
  bigLabel: "hisobiy quvvat",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 11-jadval. c = 0,68 kJ/(kg·°C), k_z = 1,25. Standart transformator quvvati hisobiy qiymatdan katta eng yaqin qiymatga tanlanadi.",
  controls: [
    heatVarSelect(HEAT_V11, v => fmt(v.G, 0) + " kg · " + fmt(v.t2, 0) + " °C · " + fmt(v.tq, 0) + " min"),
    { id: "G", label: "Detallar massasi, G", type: "range", min: 20, max: 90, step: 5, value: 50, unit: "kg", dec: 0 },
    { id: "t1", label: "Boshlang‘ich harorat, T₁", type: "range", min: 10, max: 30, step: 1, value: 20, unit: "°C", dec: 0 },
    { id: "t2", label: "Yakuniy harorat, T₂", type: "range", min: 700, max: 950, step: 10, value: 850, unit: "°C", dec: 0 },
    { id: "tq", label: "Qizdirish vaqti, t_q", type: "range", min: 8, max: 25, step: 1, value: 15, unit: "min", dec: 0 },
    { id: "Qy", label: "Yo‘qotishlar, Q_y", type: "range", min: 5, max: 20, step: .5, value: 12, unit: "kW", dec: 1 }
  ],
  state: { variant: 1, G: 50, t1: 20, t2: 850, tq: 15, Qy: 12 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V11, { G: "G", t1: "t1", t2: "t2", tq: "tq", Qy: "Qy" });
  },
  compute(s) {
    const r = v11Calc(s);
    return {
      big: fmt(r.Ph, 1) + " kW",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Massa, G", fmt(s.G, 0), "kg"],
        ["Harorat, T₁ → T₂", fmt(s.t1, 0) + " → " + fmt(s.t2, 0), "°C"],
        ["Qizdirish vaqti, t_q", fmt(s.tq, 0), "min"],
        ["Yo‘qotishlar, Q_y", fmt(s.Qy, 1), "kW"],
        ["Foydali quvvat, Q_f", fmt(r.Qf, 2), "kW", true],
        ["Zaxira koeffitsiyenti, k_z", "1,25", ""],
        ["Hisobiy quvvat, P_h", fmt(r.Ph, 2), "kW", true],
        ["Standart transformator, P_st", fmt(r.Pst, 0), "kW", true],
        ["Zaxira", fmt(r.Pst - r.Ph, 2), "kW"]
      ],
      calc:
        "Berilgan: G = " + fmt(s.G, 0) + " kg, T₁ = " + fmt(s.t1, 0) + " °C, T₂ = " + fmt(s.t2, 0) + " °C, t_q = " + fmt(s.tq, 0) + " min\n" +
        "c = 0,68 kJ/(kg·°C), Q_y = " + fmt(s.Qy, 1) + " kW, k_z = 1,25\n\n" +
        "1) Q_f = G·c·(T₂−T₁)/(3600·t_q)\n" +
        "     = " + fmt(s.G, 0) + "·0,68·" + fmt(+s.t2 - +s.t1, 0) + "/(3600·" + fmt(+s.tq / 60, 3) + ") = " + fmt(r.Qf, 2) + " kW\n\n" +
        "2) P_h = k_z·(Q_f + Q_y) = 1,25·(" + fmt(r.Qf, 2) + " + " + fmt(s.Qy, 1) + ") = " + fmt(r.Ph, 2) + " kW\n\n" +
        "3) Standart qatordan P_st = " + fmt(r.Pst, 0) + " kW tanlanadi",
      conclusion:
        "№" + s.variant + " variant: " + fmt(s.G, 0) + " kg detallarni " + fmt(s.tq, 0) + " daqiqada " + fmt(s.t2, 0) +
        " °C gacha qizdirish uchun Q_f = " + fmt(r.Qf, 2) + " kW foydali quvvat kerak. Yo‘qotishlarni hisobga olganda P_h = " +
        fmt(r.Ph, 2) + " kW, standart transformator P_st = " + fmt(r.Pst, 0) + " kW tanlanadi."
    };
  },
  steps: [
    "Variantdagi G, T₁, T₂, t_q va Q_y qiymatlarini yozib oling.",
    "t_q ni soatga o‘tkazing va Q_f = G·c·ΔT/(3600·t_q) ni hisoblang.",
    "P_h = k_z·(Q_f + Q_y) hisobiy quvvatni toping.",
    "Standart transformator quvvatlar qatoridan P_st ni tanlang.",
    "Zaxira quvvatni P_st − P_h ayirmasi bilan baholang.",
    "Tuz muhiti va oksidlanishdan himoya afzalliklarini izohlang."
  ],
  questions: [
    "Tuzli vannada qizdirishning afzalligi nima?",
    "Qanday tuzlar ishlatiladi?",
    "k_z koeffitsiyenti nimani bildiradi?",
    "Vanna yuzasidan issiqlik qanday yo‘qoladi?",
    "Tuzli vannada qizdirish havoli pechga nisbatan qancha tez?",
    "Standart transformator quvvati qanday tanlanadi?"
  ],
  draw: drawHeat11
});

/* ============================================================
   12-amaliy. Elektrodli pech-vanna
   ============================================================ */

const HEAT_V12 = [
  { rho: .75, L: 12, Se: 250, U: 10 },
  { rho: .80, L: 18, Se: 320, U: 12 },
  { rho: .65, L: 10, Se: 200, U: 8 },
  { rho: .85, L: 20, Se: 400, U: 15 },
  { rho: .70, L: 14, Se: 280, U: 12 },
  { rho: .78, L: 16, Se: 300, U: 10 },
  { rho: .90, L: 22, Se: 450, U: 18 },
  { rho: .60, L: 10, Se: 180, U: 8 },
  { rho: .82, L: 15, Se: 350, U: 12 },
  { rho: .88, L: 18, Se: 380, U: 14 }
];

function v12Calc(s) {
  const R = +s.rho * +s.L / +s.Se;
  return { R, P: +s.U * +s.U / R / 1000, I: +s.U / R };
}

function drawHeat12(ctx, s, time) {
  const r = v12Calc(s);
  const tt = time || 0;
  const ac = "#8fd3ff";
  heatShell(ctx, "Elektrodli pech-vannani hisoblash", "NamDTU · 2026 · 12-amaliy");

  heatPillRow(ctx, ["ρ = " + fmt(s.rho, 2) + " Ω·cm", "L = " + fmt(s.L, 0) + " sm", "S_e = " + fmt(s.Se, 0) + " sm²", "U = " + fmt(s.U, 0) + " V"], 80, ac);
  heatPillRow(ctx, ["R = " + fmt(r.R, 3) + " Ω", "P = " + fmt(r.P, 2) + " kW", "I = " + fmt(r.I, 0) + " A"], 112, ac);

  const fx = 40, fy = 170, fw = 470, fh = 252;
  panel(ctx, fx, fy, fw, fh, ac);

  const bx = fx + 60, by = fy + 72, bw = 250, bh = 140;
  rr(ctx, bx - 10, by - 10, bw + 20, bh + 20, 8);
  ctx.fillStyle = "#16232e";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .4);
  ctx.lineWidth = 2;
  ctx.stroke();
  const salt = ctx.createLinearGradient(0, by + 20, 0, by + bh);
  salt.addColorStop(0, "rgba(255,185,120,.5)");
  salt.addColorStop(1, "rgba(255,120,70,.72)");
  ctx.fillStyle = salt;
  ctx.fillRect(bx, by + 20, bw, bh - 20);
  ctx.strokeStyle = heatA("#ffd0a0", .55);
  ctx.beginPath(); ctx.moveTo(bx, by + 20); ctx.lineTo(bx + bw, by + 20); ctx.stroke();

  const ex = [bx + 55, bx + 125, bx + 195];
  ex.forEach((x0, i) => {
    rr(ctx, x0 - 7, by - 34, 14, 76, 4);
    ctx.fillStyle = "#c9d4de";
    ctx.fill();
    ctx.strokeStyle = "rgba(230,240,250,.4)";
    ctx.stroke();
    text(ctx, "E" + (i + 1), x0, by - 40, { size: 8.5, align: "center", color: "#dbe7f2" });
  });

  for (let i = 0; i < 2; i++) {
    const x1 = ex[i], x2 = ex[i + 1];
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -(tt * 26) % 12;
    ctx.strokeStyle = heatA("#9ff0e7", .55);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, by + 30);
    ctx.quadraticCurveTo((x1 + x2) / 2, by + 52, x2, by + 30);
    ctx.stroke();
    ctx.restore();
  }
  text(ctx, "erigan tuz (elektrolit)", bx + bw / 2, by + bh - 14, { size: 9, align: "center", color: "rgba(70,25,10,.85)", weight: 700 });

  const trx = fx + 18, try0 = fy + 44;
  rr(ctx, trx, try0, 62, 54, 6);
  ctx.fillStyle = "#1d2a36";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .45);
  ctx.stroke();
  text(ctx, "TR", trx + 31, try0 + 24, { size: 12, align: "center", weight: 800, color: "#cbeaff" });
  text(ctx, fmt(s.U, 0) + " V", trx + 31, try0 + 42, { size: 9, align: "center", mono: true, color: "rgba(200,225,245,.7)" });
  ctx.beginPath();
  ctx.moveTo(trx + 62, try0 + 27);
  ctx.lineTo(bx + 20, try0 + 27);
  ctx.lineTo(bx + 20, by - 20);
  ctx.strokeStyle = "#8fa0af";
  ctx.lineWidth = 2;
  ctx.stroke();

  const px = 528, pw = 402;
  panel(ctx, px, fy, pw, fh, ac);
  heatPanelTitle(ctx, px + 18, fy + 26, "ELEKTR PARAMETRLAR", ac);

  heatGauge(ctx, px + 92, fy + 104, 48, r.I / 800, "#8fd3ff", fmt(r.I, 0), "A · tok");
  heatGauge(ctx, px + 240, fy + 104, 48, r.P / 10, "#f5b84b", fmt(r.P, 1), "kW · quvvat");

  heatRow(ctx, px + 18, fy + 176, "Qarshilik, R", fmt(r.R, 4) + " Ω", "#cbeaff");
  heatRow(ctx, px + 150, fy + 176, "Kuchlanish, U", fmt(s.U, 0) + " V", "#dbe7f2");
  heatRow(ctx, px + 282, fy + 176, "Tok, I", fmt(r.I, 0) + " A", "#9ff0e7");

  text(ctx, "R = ρ·L/S_e   ·   P = U²/R·10⁻³   ·   I = U/R", px + 18, fy + 222, { size: 9.5, color: "rgba(180,215,235,.62)", mono: true });

  text(ctx, "Joul–Lens qonuni: Q = I²·R·t   ·   past kuchlanish (6–18 V), katta tok", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-12",
  subject: "quymakorlik",
  name: "12-ish · Elektrodli vanna",
  labLabel: "12-ish · Elektrodli vanna",
  kicker: "Quymakorlik · tuzli vannalar",
  title: "Elektrodli vanna qanday hisoblanadi?",
  goal: "Maqsad: erigan tuzning qarshiligi <b>R</b>, ajraladigan quvvat <b>P</b> va elektrodlar toki <b>I</b> ni hisoblash.",
  accent: "#8fd3ff",
  equipment: ["Elektrodli pech-vanna", "Grafit / po‘lat elektrodlar", "Past kuchlanishli transformator", "Ampermetr", "Voltmetr"],
  bigLabel: "elektr quvvati",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 12-jadval. ρ — Ω·cm, L va S_e — sm; R — Ω, P — kW, I — A. Joul–Lens qonuni asosida.",
  controls: [
    heatVarSelect(HEAT_V12, v => "ρ = " + fmt(v.rho, 2) + " · L = " + fmt(v.L, 0) + " sm · U = " + fmt(v.U, 0) + " V"),
    { id: "rho", label: "Solishtirma qarshilik, ρ", type: "range", min: .55, max: .95, step: .01, value: .8, unit: "Ω·cm", dec: 2 },
    { id: "L", label: "Elektrodlar masofasi, L", type: "range", min: 8, max: 24, step: 1, value: 15, unit: "sm", dec: 0 },
    { id: "Se", label: "Botish yuzasi, S_e", type: "range", min: 150, max: 500, step: 10, value: 300, unit: "sm²", dec: 0 },
    { id: "U", label: "Kuchlanish, U", type: "range", min: 6, max: 18, step: 1, value: 12, unit: "V", dec: 0 }
  ],
  state: { variant: 1, rho: .8, L: 15, Se: 300, U: 12 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V12, { rho: "rho", L: "L", Se: "Se", U: "U" });
  },
  compute(s) {
    const r = v12Calc(s);
    return {
      big: fmt(r.P, 2) + " kW",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Solishtirma qarshilik, ρ", fmt(s.rho, 2), "Ω·cm"],
        ["Elektrodlar masofasi, L", fmt(s.L, 0), "sm"],
        ["Botish yuzasi, S_e", fmt(s.Se, 0), "sm²"],
        ["Kuchlanish, U", fmt(s.U, 0), "V"],
        ["Qarshilik, R", fmt(r.R, 4), "Ω", true],
        ["Tok kuchi, I", fmt(r.I, 1), "A", true],
        ["Quvvat, P", fmt(r.P, 3), "kW", true],
        ["Quvvat", fmt(r.P * 1000, 0), "W"],
        ["Tekshirish, I²R", fmt(r.I * r.I * r.R / 1000, 3), "kW"]
      ],
      calc:
        "Berilgan: ρ = " + fmt(s.rho, 2) + " Ω·cm, L = " + fmt(s.L, 0) + " sm, S_e = " + fmt(s.Se, 0) + " sm², U = " + fmt(s.U, 0) + " V\n\n" +
        "1) R = ρ·L/S_e = " + fmt(s.rho, 2) + "·" + fmt(s.L, 0) + "/" + fmt(s.Se, 0) + " = " + fmt(r.R, 4) + " Ω\n\n" +
        "2) I = U/R = " + fmt(s.U, 0) + " / " + fmt(r.R, 4) + " = " + fmt(r.I, 1) + " A\n\n" +
        "3) P = U²/R·10⁻³ = " + fmt(+s.U * +s.U, 0) + "/" + fmt(r.R, 4) + "·10⁻³ = " + fmt(r.P, 3) + " kW\n" +
        "   Tekshirish: P = I²·R·10⁻³ = " + fmt(r.I, 1) + "²·" + fmt(r.R, 4) + "·10⁻³ = " + fmt(r.I * r.I * r.R / 1000, 3) + " kW",
      conclusion:
        "№" + s.variant + " variant: erigan tuz qarshiligi R = " + fmt(r.R, 4) + " Ω, elektrodlar toki I = " + fmt(r.I, 0) +
        " A, ajraladigan quvvat P = " + fmt(r.P, 2) + " kW. Transformator " + fmt(s.U, 0) + " V ikkilamchi kuchlanish va kamida " +
        fmt(r.I, 0) + " A tokka mo‘ljallangan bo‘lishi kerak."
    };
  },
  steps: [
    "Variantdagi ρ, L, S_e va U qiymatlarini yozib oling.",
    "R = ρ·L/S_e qarshilikni hisoblang.",
    "I = U/R tok kuchini toping.",
    "P = U²/R·10⁻³ quvvatni hisoblang.",
    "Natijani I²·R·10⁻³ bilan tekshiring.",
    "Transformator parametrlarini tanlab, xulosa yozing."
  ],
  questions: [
    "Elektrodli vannada issiqlik qaysi qonun bo‘yicha ajraladi?",
    "Nima uchun past kuchlanish (6–18 V) ishlatiladi?",
    "Elektrodlar qanday materialdan tayyorlanadi?",
    "Tuz qarshiligi harorat oshishi bilan qanday o‘zgaradi?",
    "Sovuq vanna qanday ishga tushiriladi?",
    "Elektrodlar orasidagi masofa quvvatga qanday ta’sir qiladi?"
  ],
  draw: drawHeat12
});

/* ============================================================
   13-amaliy. Gaz generatori
   ============================================================ */

const HEAT_V13 = [
  { B: 450, Vh: 1800, eta: 75 },
  { B: 500, Vh: 1950, eta: 78 },
  { B: 520, Vh: 2100, eta: 76 },
  { B: 480, Vh: 1850, eta: 74 },
  { B: 600, Vh: 2400, eta: 80 },
  { B: 550, Vh: 2200, eta: 77 },
  { B: 420, Vh: 1700, eta: 73 },
  { B: 580, Vh: 2300, eta: 79 },
  { B: 620, Vh: 2500, eta: 81 },
  { B: 470, Vh: 1900, eta: 75 }
];

const V13_GAS = {
  havo: { name: "Havo generator gazi", co: .28, h2: .02, ch4: .01, n2: .66, co2: .03, qn: 4.102 },
  aralash: { name: "Aralash gaz", co: .27, h2: .15, ch4: .025, n2: .50, co2: .055, qn: 5.917 },
  suv: { name: "Suv gazi", co: .37, h2: .48, ch4: .005, n2: .12, co2: .025, qn: 10.025 }
};

function v13Calc(s) {
  const g = V13_GAS[s.gas] || V13_GAS.havo;
  const B = +s.B, Vh = +s.Vh, eta = +s.eta;
  const Vgaz = s.gas === "suv" ? Vh * 1.15 : .79 * Vh / g.n2;
  const Qf = Vgaz * g.qn;
  const Qco = Vgaz * (g.co * 12.6 + g.h2 * 10.8);
  const Quse = Qf * eta / 100;
  return {
    g: g, Vgaz: Vgaz, Qf: Qf, Qco: Qco, Quse: Quse, gpk: Vgaz / B,
    kW: Qf / 3.6, kWco: Qco / 3.6, kWuse: Quse / 3.6
  };
}

function drawHeat13(ctx, s, time) {
  const r = v13Calc(s);
  const tt = time || 0;
  const ac = "#f2a65a";
  heatShell(ctx, "Gaz generatorini hisoblash", "NamDTU · 2026 · 13-amaliy");

  heatPillRow(ctx, [r.g.name, "B = " + fmt(s.B, 0) + " kg/soat", "V_h = " + fmt(s.Vh, 0) + " m³/soat", "η = " + fmt(s.eta, 0) + "%"], 80, ac);
  heatPillRow(ctx, ["V_gaz = " + fmt(r.Vgaz, 0) + " m³/soat", "Q_umum = " + fmt(r.kW, 0) + " kVt", "Q_CO+H₂ = " + fmt(r.kWco, 0) + " kVt"], 112, ac);

  panel(ctx, 40, 155, 555, 255, ac);
  heatPanelTitle(ctx, 58, 177, "SHAXTALI GENERATOR", ac);

  const sx = 170, sy = 190, sw = 235, sh = 190;
  const zones = [
    { name: "QURITISH", t: "200–500 °C", h: 48, c: "#8fd3ff" },
    { name: "QAYTARILISH", t: "800–1000 °C", h: 48, c: "#ffb26b" },
    { name: "YONISH", t: "1000–1200 °C", h: 50, c: "#ff7a59" },
    { name: "KUL", t: "200–400 °C", h: 44, c: "#9aa7b3" }
  ];

  ctx.fillStyle = "#071019";
  ctx.fillRect(sx, sy, sw, sh);
  heatGlow(ctx, sx + sw / 2, sy + 102, 120, "#ff7a45");

  let zy = sy;
  zones.forEach(z => {
    const gg = ctx.createLinearGradient(sx, 0, sx + sw, 0);
    gg.addColorStop(0, heatA(z.c, .05));
    gg.addColorStop(.5, heatA(z.c, .13));
    gg.addColorStop(1, heatA(z.c, .05));
    ctx.fillStyle = gg;
    ctx.fillRect(sx, zy, sw, z.h);
    ctx.strokeStyle = "rgba(160,200,220,.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, zy, sw, z.h);
    text(ctx, z.name, sx + sw - 8, zy + 17, { size: 8, align: "right", weight: 750, color: heatA(z.c, .9) });
    text(ctx, z.t, sx + sw - 8, zy + 29, { size: 7.5, align: "right", color: "rgba(200,220,235,.6)" });
    zy += z.h;
  });

  for (let i = 0; i < 3; i++) {
    const xx = sx + 48 + i * 34;
    heatFlow(ctx, xx, sy + sh - 10, xx, sy + 12, "rgba(140,200,235,.22)", tt + i * .5, 22);
  }
  text(ctx, "havo ↑", sx + 46, sy + sh - 2, { size: 7.5, color: "rgba(160,215,245,.7)" });

  for (let i = 0; i < 7; i++) {
    const yy = sy + 6 + ((tt * 20 + i * 26) % (sh - 18));
    const xx = sx + 14 + (i % 3) * 16;
    ctx.beginPath();
    ctx.moveTo(xx, yy + 8);
    ctx.lineTo(xx + 4, yy);
    ctx.lineTo(xx + 10, yy + 2);
    ctx.lineTo(xx + 9, yy + 10);
    ctx.lineTo(xx + 2, yy + 11);
    ctx.closePath();
    ctx.fillStyle = "rgba(72,62,56,.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(190,160,120,.35)";
    ctx.lineWidth = .8;
    ctx.stroke();
  }

  heatBrick(ctx, sx - 10, sy, 10, sh, "#c98d5a");
  heatBrick(ctx, sx + sw, sy, 10, sh, "#c98d5a");

  arrow(ctx, sx + sw / 2, sy - 18, sx + sw / 2, sy - 2, heatA("#d7c3aa", .8), 2, 6);
  text(ctx, "ko‘mir", sx + sw / 2, sy - 22, { size: 8.5, align: "center", color: "#d7c3aa" });

  const px0 = sx + sw;
  ctx.strokeStyle = heatA("#9ff0e7", .55);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(px0, sy + 12);
  ctx.lineTo(px0 + 52, sy + 12);
  ctx.stroke();
  arrow(ctx, px0 + 52, sy + 12, px0 + 68, sy + 12, heatA("#9ff0e7", .85), 2, 7);
  text(ctx, "gaz", px0 + 60, sy + 34, { size: 8.5, align: "center", color: "#9ff0e7" });

  const fanx = 112, fany = 360;
  ctx.beginPath();
  ctx.arc(fanx, fany, 15, 0, TAU);
  ctx.fillStyle = "#132330";
  ctx.fill();
  ctx.strokeStyle = heatA("#8fd3ff", .55);
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = tt * 4 + i * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(fanx, fany);
    ctx.lineTo(fanx + Math.cos(a) * 11, fany + Math.sin(a) * 11);
    ctx.strokeStyle = heatA("#8fd3ff", .55);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(fanx + 15, fany);
  ctx.lineTo(sx - 12, fany);
  ctx.strokeStyle = "rgba(160,215,245,.45)";
  ctx.lineWidth = 4;
  ctx.stroke();
  arrow(ctx, fanx + 20, fany, sx - 14, fany, heatA("#8fd3ff", .85), 2, 7);
  text(ctx, "havo + bug‘", fanx, fany + 30, { size: 8.5, align: "center", color: "rgba(160,215,245,.75)" });

  const gx = 615, gw = 305;
  panel(ctx, gx, 155, gw, 255, ac);
  heatPanelTitle(ctx, gx + 18, 177, "GENERATOR GAZI", ac);

  const comp = [
    ["CO", r.g.co, "#ff9a6b"],
    ["H₂", r.g.h2, "#8fd3ff"],
    ["CH₄", r.g.ch4, "#ffd166"],
    ["N₂", r.g.n2, "#a7b6c4"],
    ["CO₂", r.g.co2, "#c48f9a"]
  ];
  comp.forEach((c, i) => {
    const yy = 196 + i * 25;
    text(ctx, c[0], gx + 18, yy + 12, { size: 9.5, color: "rgba(195,215,230,.75)" });
    heatBar(ctx, gx + 58, yy + 4, 150, 8, c[1] * 2, heatA(c[2], .8), "rgba(255,255,255,.05)");
    text(ctx, fmt(c[1] * 100, 1) + "%", gx + gw - 18, yy + 12, { size: 9, align: "right", mono: true, color: c[2] });
  });

  heatRow(ctx, gx + 18, 328, "Q_n", fmt(r.g.qn, 2) + " MJ/m³", "#ffd166");
  heatRow(ctx, gx + 158, 328, "Gaz unumi", fmt(r.gpk, 2) + " m³/kg", "#9ff0e7");
  pill(ctx, gx + 18, 366, "CO + H₂ = " + fmt(r.Qco / r.Qf * 100, 0) + "% issiqlik", {
    bg: heatA(ac, .1), border: heatA(ac, .32), color: "#f6dfb4", size: 10.5
  });

  panel(ctx, 40, 420, 880, 68, ac);
  const cells = [
    ["Gaz unumdorligi", fmt(r.Vgaz, 0) + " m³/soat"],
    ["Issiqlik quvvati", fmt(r.kW, 0) + " kVt"],
    ["CO + H₂ quvvati", fmt(r.kWco, 0) + " kVt"],
    ["Foydali issiqlik", fmt(r.kWuse, 0) + " kVt"],
    ["Gaz unumi", fmt(r.gpk, 2) + " m³/kg"]
  ];
  cells.forEach((c, i) => {
    const x = 64 + i * 172;
    text(ctx, c[0], x, 442, { size: 8.5, color: "rgba(185,210,225,.65)" });
    text(ctx, c[1], x, 464, { size: 12.5, mono: true, weight: 700, color: i === 0 ? "#f6dfb4" : "#e9f4fb" });
  });

  text(ctx, "V_gaz = 0,79·V_h/x_N₂   ·   Q_n = CO·12,6 + H₂·10,8 + CH₄·35,8   ·   suv gazi: V_gaz = 1,15·V_h", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-13",
  subject: "quymakorlik",
  name: "13-ish · Gaz generatori",
  labLabel: "13-ish · Gaz generatori",
  kicker: "Quymakorlik · yonilg‘i xo‘jaligi",
  title: "Gaz generatori qancha generator gazi beradi?",
  goal: "Maqsad: ko‘mir sarfi va havo puflashdan foydalanib generator gazining soatlik unumdorligini <b>V_gaz</b> hamda CO va H₂ ning issiqlik ajratish quvvatini hisoblash.",
  accent: "#f2a65a",
  equipment: ["Shaxtali gaz generatori", "Puflash ventilyatori", "Gaz analizatori", "Gaz quvurlari", "Issiqlik hisoblagichi"],
  bigLabel: "gaz unumdorligi",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 13-jadval. Havo va aralash gaz uchun azot balansi V_gaz = 0,79·V_h/x_N₂; suv gazi uchun V_gaz = 1,15·V_h. Q_n = CO·12,6 + H₂·10,8 + CH₄·35,8 MJ/m³.",
  controls: [
    heatVarSelect(HEAT_V13, v => "B = " + fmt(v.B, 0) + " kg/soat · V_h = " + fmt(v.Vh, 0)),
    {
      id: "gas", label: "Generator gazi turi", type: "select", value: "havo", options: [
        { value: "havo", label: "Havo gazi · Q = 4,0–4,5 MJ/m³" },
        { value: "aralash", label: "Aralash gaz · Q = 5,5–6,5 MJ/m³" },
        { value: "suv", label: "Suv gazi · Q = 10–10,5 MJ/m³" }
      ]
    },
    { id: "B", label: "Ko‘mir sarfi, B", type: "range", min: 400, max: 650, step: 10, value: 450, unit: "kg/soat", dec: 0 },
    { id: "Vh", label: "Havo puflash, V_h", type: "range", min: 1600, max: 2600, step: 50, value: 1800, unit: "m³/soat", dec: 0 },
    { id: "eta", label: "Generator FIK, η", type: "range", min: 70, max: 85, step: 1, value: 75, unit: "%", dec: 0 }
  ],
  state: { variant: 1, gas: "havo", B: 450, Vh: 1800, eta: 75 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V13, { B: "B", Vh: "Vh", eta: "eta" });
  },
  compute(s) {
    const r = v13Calc(s);
    return {
      big: fmt(r.Vgaz, 0) + " m³/soat",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Gaz turi", r.g.name, ""],
        ["Ko‘mir sarfi, B", fmt(s.B, 0), "kg/soat"],
        ["Havo puflash, V_h", fmt(s.Vh, 0), "m³/soat"],
        ["Generator FIK, η", fmt(s.eta, 0), "%"],
        ["Gaz unumdorligi, V_gaz", fmt(r.Vgaz, 0), "m³/soat", true],
        ["Gaz unumi", fmt(r.gpk, 2), "m³/kg"],
        ["Yonish issiqligi, Q_n", fmt(r.g.qn, 3), "MJ/m³"],
        ["Issiqlik quvvati, Q_umum", fmt(r.kW, 1), "kVt", true],
        ["CO + H₂ quvvati", fmt(r.kWco, 1), "kVt", true],
        ["Foydali issiqlik", fmt(r.kWuse, 1), "kVt"]
      ],
      calc:
        "Berilgan: B = " + fmt(s.B, 0) + " kg/soat, V_h = " + fmt(s.Vh, 0) + " m³/soat, η = " + fmt(s.eta, 0) + "%, gaz turi — " + r.g.name.toLowerCase() + "\n\n" +
        (s.gas === "suv"
          ? "1) Suv gazi: V_gaz = 1,15·V_h = 1,15·" + fmt(s.Vh, 0) + " = " + fmt(r.Vgaz, 1) + " m³/soat\n\n"
          : "1) Azot balansi: V_gaz = 0,79·V_h/x_N₂ = 0,79·" + fmt(s.Vh, 0) + "/" + fmt(r.g.n2, 2) + " = " + fmt(r.Vgaz, 1) + " m³/soat\n\n") +
        "2) Q_n = CO·12,6 + H₂·10,8 + CH₄·35,8\n" +
        "     = " + fmt(r.g.co, 3) + "·12,6 + " + fmt(r.g.h2, 3) + "·10,8 + " + fmt(r.g.ch4, 3) + "·35,8 = " + fmt(r.g.qn, 3) + " MJ/m³\n\n" +
        "3) Q_umum = V_gaz·Q_n = " + fmt(r.Vgaz, 0) + "·" + fmt(r.g.qn, 3) + " = " + fmt(r.Qf, 0) + " MJ/soat = " + fmt(r.kW, 1) + " kVt\n\n" +
        "4) Q_CO+H₂ = V_gaz·(CO·12,6 + H₂·10,8)\n" +
        "     = " + fmt(r.Vgaz, 0) + "·(" + fmt(r.g.co, 3) + "·12,6 + " + fmt(r.g.h2, 3) + "·10,8) = " + fmt(r.Qco, 0) + " MJ/soat = " + fmt(r.kWco, 1) + " kVt\n\n" +
        "5) Foydali issiqlik: Q_f = Q_umum·η = " + fmt(r.Qf, 0) + "·" + fmt(s.eta, 0) + "/100 = " + fmt(r.Quse, 0) + " MJ/soat = " + fmt(r.kWuse, 1) + " kVt",
      conclusion:
        "№" + s.variant + " variant: " + r.g.name.toLowerCase() + " olinganda soatlik gaz unumdorligi V_gaz = " + fmt(r.Vgaz, 0) +
        " m³/soat (" + fmt(r.gpk, 2) + " m³/kg ko‘mir). Gazning issiqlik quvvati " + fmt(r.kW, 0) +
        " kVt, shundan CO va H₂ ulushi " + fmt(r.Qco / r.Qf * 100, 0) + "%. Pechga η = " + fmt(s.eta, 0) + "% FIK bilan " + fmt(r.kWuse, 0) + " kVt issiqlik yetkaziladi."
    };
  },
  steps: [
    "Variantdagi B, V_h va η qiymatlarini yozib oling.",
    "Generator gazi turini tanlang va uning tarkibini aniqlang.",
    "Azot balansi (yoki suv gazi uchun 1,15·V_h) bo‘yicha V_gaz ni hisoblang.",
    "Q_n = CO·12,6 + H₂·10,8 + CH₄·35,8 orqali gazning yonish issiqligini toping.",
    "Q_umum = V_gaz·Q_n va Q_CO+H₂ = V_gaz·(CO·12,6 + H₂·10,8) quvvatlarini hisoblang.",
    "Issiqlik balansini sxema bo‘yicha tahlil qilib, xulosa yozing."
  ],
  questions: [
    "Gaz generatori nima va u qanday yonilg‘ida ishlaydi?",
    "Gazifikatsiyalashda qanday texnologik zonalar hosil bo‘ladi?",
    "CO₂ + C → 2CO reaksiyasi qanday reaksiya hisoblanadi?",
    "Havo generator gazi tarkibida qaysi gaz ko‘p?",
    "Suv gazi qanday olinadi va u havo gazidan nimasi bilan farq qiladi?",
    "Aralash gaz qayerlarda keng qo‘llaniladi?"
  ],
  draw: drawHeat13
});

/* ============================================================
   14-amaliy. Zamonaviy qizdirish qurilmalari
   ============================================================ */

const HEAT_V14 = [
  { m: 120, T: 1150, t: 8 },
  { m: 150, T: 1200, t: 10 },
  { m: 200, T: 1100, t: 12 },
  { m: 180, T: 1250, t: 11 },
  { m: 250, T: 1150, t: 15 },
  { m: 90, T: 1050, t: 6 },
  { m: 110, T: 1200, t: 7 },
  { m: 300, T: 1250, t: 18 },
  { m: 220, T: 1150, t: 13 },
  { m: 160, T: 1200, t: 9 }
];
const V14_C = .68;
const V14_ETA = .85;

function v14Calc(s) {
  const Q = +s.m * V14_C * (+s.T - 20);
  const P = Q / (+s.t * 60 * V14_ETA);
  const E = P * (+s.t) / 60;
  return { Q: Q, P: P, E: E, sp: E / (+s.m / 1000), rate: (+s.T - 20) / +s.t };
}

function drawHeat14(ctx, s, time) {
  const r = v14Calc(s);
  const tt = time || 0;
  const ac = "#7ee0c1";
  heatShell(ctx, "Zamonaviy qizdirish qurilmalari", "NamDTU · 2026 · 14-amaliy");

  heatPillRow(ctx, ["m = " + fmt(s.m, 0) + " kg", "T₂ = " + fmt(s.T, 0) + " °C", "t = " + fmt(s.t, 0) + " min", "η = 85%"], 80, ac);
  heatPillRow(ctx, ["P = " + fmt(r.P, 0) + " kVt", "W = " + fmt(r.E, 1) + " kVt·soat", "w = " + fmt(r.sp, 0) + " kVt·soat/t", "v = " + fmt(r.rate, 0) + " °C/min"], 112, ac);

  panel(ctx, 40, 150, 530, 262, ac);
  heatPanelTitle(ctx, 58, 172, "INDUKSION QIZDIRISH", ac);

  const bx = 132, by = 248, bw = 300, bh = 44;
  heatGlow(ctx, bx + bw / 2, by + bh / 2, 175, "#ff9a55");

  for (let i = 0; i < 7; i++) {
    const cx = bx + 22 + i * 43;
    ctx.beginPath();
    ctx.ellipse(cx, by + bh / 2, 15, 34, 0, Math.PI, TAU);
    ctx.strokeStyle = "rgba(214,140,80,.5)";
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  heatSteel(ctx, bx, by, bw, bh, heatColor(+s.T));

  for (let i = 0; i < 7; i++) {
    const cx = bx + 22 + i * 43;
    ctx.beginPath();
    ctx.ellipse(cx, by + bh / 2, 15, 34, 0, 0, Math.PI);
    ctx.strokeStyle = "rgba(232,160,100,.9)";
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  const pz = { x: 60, y: 232, w: 46, h: 52 };
  rr(ctx, pz.x, pz.y, pz.w, pz.h, 7);
  ctx.fillStyle = "#132330";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .55);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, "IG", pz.x + pz.w / 2, pz.y + 22, { size: 12, align: "center", weight: 750, color: heatA(ac, .95) });
  text(ctx, "10 kHz", pz.x + pz.w / 2, pz.y + 38, { size: 7.5, align: "center", color: "rgba(190,220,230,.6)" });
  ctx.beginPath();
  ctx.moveTo(pz.x + pz.w, pz.y + 26);
  ctx.bezierCurveTo(bx - 24, pz.y + 18, bx - 18, by + 6, bx + 22, by + 10);
  ctx.strokeStyle = "rgba(214,140,80,.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  text(ctx, "T₂ = " + fmt(s.T, 0) + " °C", bx + bw - 8, by - 14, { size: 9, align: "right", color: heatA("#ffb26b", .9) });
  text(ctx, "T₁ = 20 °C", bx + 6, by - 14, { size: 8.5, color: "rgba(190,215,230,.65)" });
  pill(ctx, 58, 300, "suv bilan sovutish", { bg: heatA("#8fd3ff", .08), border: heatA("#8fd3ff", .26), color: "#a9d9f5", size: 8.5, h: 22, pad: 8 });

  heatPanelTitle(ctx, 58, 344, "HARORAT O‘SISHI", ac);
  heatSpark(ctx, 58, 356, 490, 40, [.02, .14, .28, .42, .56, .7, .84, 1], "#ffb26b", true);
  text(ctx, "20 °C", 58, 408, { size: 8, color: "rgba(190,215,230,.6)" });
  text(ctx, fmt(s.T, 0) + " °C", 548, 408, { size: 8, align: "right", mono: true, color: "#ffd0a0" });

  const gx = 590, gw = 330;
  panel(ctx, gx, 150, gw, 262, ac);
  heatPanelTitle(ctx, gx + 18, 172, "QURILMALAR FIK", ac);

  const devs = [
    ["Induksion", 85, "#7ee0c1", true],
    ["Vakuumli", 70, "#8fd3ff", false],
    ["Qarshilikli", 55, "#ffd166", false],
    ["Plazma / lazer", 90, "#ff9a6b", false]
  ];
  devs.forEach((d, i) => {
    const yy = 196 + i * 34;
    text(ctx, d[0], gx + 18, yy + 12, { size: 9.5, color: d[3] ? "#d9fff4" : "rgba(195,215,230,.7)" });
    heatBar(ctx, gx + 118, yy + 4, 140, 9, d[1] / 100, heatA(d[2], d[3] ? .9 : .45), "rgba(255,255,255,.05)");
    text(ctx, d[1] + "%", gx + gw - 18, yy + 12, { size: 9, align: "right", mono: true, color: d[3] ? d[2] : "rgba(200,220,235,.65)" });
  });

  heatRow(ctx, gx + 18, 336, "Foydali issiqlik, Q", fmt(r.Q / 1000, 1) + " MJ", "#ffd166");
  heatRow(ctx, gx + 160, 336, "Quvvat, P", fmt(r.P, 0) + " kVt", ac);
  heatRow(ctx, gx + 18, 370, "Energiya, W", fmt(r.E, 1) + " kVt·soat", "#9ff0e7");
  heatRow(ctx, gx + 160, 370, "Solishtirma", fmt(r.sp, 0) + " kVt·soat/t", "#f6dfb4");

  panel(ctx, 40, 420, 880, 68, ac);
  const cells = [
    ["Foydali issiqlik", fmt(r.Q / 1000, 1) + " MJ"],
    ["Elektr quvvat", fmt(r.P, 0) + " kVt"],
    ["Energiya sarfi", fmt(r.E, 1) + " kVt·soat"],
    ["Solishtirma energiya", fmt(r.sp, 0) + " kVt·soat/t"],
    ["Qizish tezligi", fmt(r.rate, 0) + " °C/min"]
  ];
  cells.forEach((c, i) => {
    const x = 64 + i * 172;
    text(ctx, c[0], x, 442, { size: 8.5, color: "rgba(185,210,225,.65)" });
    text(ctx, c[1], x, 464, { size: 12.5, mono: true, weight: 700, color: i === 1 ? "#d9fff4" : "#e9f4fb" });
  });

  text(ctx, "Q = m·c·(T₂ − 20)   ·   P = Q/(t·60·η)   ·   W = P·t/60   ·   c = 0,68 kJ/(kg·°C)", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-14",
  subject: "quymakorlik",
  name: "14-ish · Zamonaviy qizdirish",
  labLabel: "14-ish · Zamonaviy qizdirish",
  kicker: "Quymakorlik · ilg‘or texnologiyalar",
  title: "Induksion pech zagotovkani qancha quvvat bilan qizdiradi?",
  goal: "Maqsad: zagotovka massasi va haroratidan foydalanib induksion qizdirishning foydali issiqligi <b>Q</b>, elektr quvvati <b>P</b> va solishtirma energiya sarfini hisoblash.",
  accent: "#7ee0c1",
  equipment: ["Induksion qizdirish qurilmasi", "Mis induktor", "Yuqori chastotali generator", "Suv sovutish tizimi", "Optik pirometr"],
  bigLabel: "induksion quvvat",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 14-jadval. c = 0,68 kJ/(kg·°C), T₁ = 20 °C, induksion pech FIK η = 85%. W = P·t/60 (kVt·soat).",
  controls: [
    heatVarSelect(HEAT_V14, v => fmt(v.m, 0) + " kg · " + fmt(v.T, 0) + " °C · " + fmt(v.t, 0) + " min"),
    { id: "m", label: "Zagotovka massasi, m", type: "range", min: 50, max: 350, step: 5, value: 120, unit: "kg", dec: 0 },
    { id: "T", label: "Qizdirish harorati, T₂", type: "range", min: 1000, max: 1300, step: 10, value: 1150, unit: "°C", dec: 0 },
    { id: "t", label: "Qizdirish vaqti, t", type: "range", min: 5, max: 20, step: .5, value: 8, unit: "min", dec: 1 }
  ],
  state: { variant: 1, m: 120, T: 1150, t: 8 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V14, { m: "m", T: "T", t: "t" });
  },
  compute(s) {
    const r = v14Calc(s);
    return {
      big: fmt(r.P, 1) + " kVt",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Zagotovka massasi, m", fmt(s.m, 0), "kg"],
        ["Boshlang‘ich harorat, T₁", "20", "°C"],
        ["Oxirgi harorat, T₂", fmt(s.T, 0), "°C"],
        ["Qizdirish vaqti, t", fmt(s.t, 1), "min"],
        ["Solishtirma issiqlik, c", "0,68", "kJ/(kg·°C)"],
        ["Foydali issiqlik, Q", fmt(r.Q, 0), "kJ", true],
        ["Foydali issiqlik", fmt(r.Q / 1000, 2), "MJ"],
        ["Elektr quvvati, P", fmt(r.P, 2), "kVt", true],
        ["Energiya sarfi, W", fmt(r.E, 2), "kVt·soat"],
        ["Solishtirma energiya", fmt(r.sp, 0), "kVt·soat/t"],
        ["Qizish tezligi", fmt(r.rate, 1), "°C/min"]
      ],
      calc:
        "Berilgan: m = " + fmt(s.m, 0) + " kg, T₁ = 20 °C, T₂ = " + fmt(s.T, 0) + " °C, t = " + fmt(s.t, 1) + " min, c = 0,68 kJ/(kg·°C), η = 85%\n\n" +
        "1) Q = m·c·(T₂ − T₁) = " + fmt(s.m, 0) + "·0,68·(" + fmt(s.T, 0) + " − 20)\n" +
        "     = " + fmt(s.m, 0) + "·0,68·" + fmt(+s.T - 20, 0) + " = " + fmt(r.Q, 0) + " kJ = " + fmt(r.Q / 1000, 2) + " MJ\n\n" +
        "2) P = Q/(t·60·η) = " + fmt(r.Q, 0) + "/(" + fmt(s.t, 1) + "·60·0,85)\n" +
        "     = " + fmt(r.Q, 0) + "/" + fmt(+s.t * 60 * V14_ETA, 0) + " = " + fmt(r.P, 2) + " kVt\n\n" +
        "3) W = P·t/60 = " + fmt(r.P, 2) + "·" + fmt(s.t, 1) + "/60 = " + fmt(r.E, 2) + " kVt·soat\n\n" +
        "4) w = W/(m/1000) = " + fmt(r.E, 2) + "/" + fmt(+s.m / 1000, 3) + " = " + fmt(r.sp, 0) + " kVt·soat/t\n\n" +
        "5) v = (T₂ − 20)/t = " + fmt(+s.T - 20, 0) + "/" + fmt(s.t, 1) + " = " + fmt(r.rate, 1) + " °C/min",
      conclusion:
        "№" + s.variant + " variant: " + fmt(s.m, 0) + " kg zagotovkani 20 °C dan " + fmt(s.T, 0) +
        " °C gacha " + fmt(s.t, 1) + " daqiqada qizdirish uchun Q = " + fmt(r.Q / 1000, 1) + " MJ issiqlik va P = " +
        fmt(r.P, 0) + " kVt induksion quvvat zarur. Sarf W = " + fmt(r.E, 1) + " kVt·soat (" + fmt(r.sp, 0) +
        " kVt·soat/t). Induksion qurilma FIK 80–90%, oksidlanish deyarli yo‘q — qarshilikli pechga nisbatan 1,5–1,6 baravar tejamkor."
    };
  },
  steps: [
    "Variantdagi zagotovka massasi, harorat va vaqtni yozib oling.",
    "Q = m·c·(T₂ − 20) foydali issiqlikni hisoblang.",
    "P = Q/(t·60·η) elektr quvvatini toping (η = 0,85).",
    "W = P·t/60 energiya sarfini hisoblang.",
    "Solishtirma energiyani kVt·soat/t da ifodalang.",
    "Induksion, vakuumli va qarshilikli qurilmalarni texnologik jihatdan taqqoslab xulosa yozing."
  ],
  questions: [
    "Induksion qizdirish qaysi fizik qonuniyatga asoslangan?",
    "Fuko toklari nima va ular qanday hosil bo‘ladi?",
    "Vakuumli qizdirish pechlarining asosiy afzalligi nimada?",
    "Nima uchun induktor mis naychadan tayyorlanadi?",
    "Plazmali va lazerli qizdirish qanday hollarda qo‘llaniladi?",
    "Zamonaviy induksion pechlarning FIK qancha?"
  ],
  draw: drawHeat14
});

/* ============================================================
   15-amaliy. Ultratovushli tozalash
   ============================================================ */

const HEAT_V15 = [
  { V: 15, f: 28, m: 4.5 },
  { V: 25, f: 40, m: 8.0 },
  { V: 40, f: 20, m: 15.0 },
  { V: 30, f: 35, m: 10.0 },
  { V: 50, f: 28, m: 20.0 },
  { V: 10, f: 40, m: 2.5 },
  { V: 20, f: 28, m: 6.0 },
  { V: 60, f: 20, m: 25.0 },
  { V: 35, f: 40, m: 12.0 },
  { V: 80, f: 25, m: 35.0 }
];

function v15Calc(s) {
  const qs = +s.qs, f = +s.f, t = +s.t;
  const P = +s.V * qs;
  const irel = Math.sqrt(28 / f) * (qs / 25);
  const trec = clamp(8 - 4 * irel, 3, 8);
  const E = P * t / 60;
  return {
    P: P, irel: irel, trec: trec, E: E, sp: E / +s.m,
    ntr: Math.ceil(P / 50), rate: 100 / t,
    mode: f <= 28 ? "Quyi chastota" : f < 40 ? "O‘rta chastota" : "Yuqori chastota",
    modeNote: f <= 28 ? "yirik ifloslanish" : f < 40 ? "aralash ifloslanish" : "nozik detallar"
  };
}

function drawHeat15(ctx, s, time) {
  const r = v15Calc(s);
  const tt = time || 0;
  const ac = "#78d4f4";
  heatShell(ctx, "Ultratovushli tozalash", "NamDTU · 2026 · 15-amaliy");

  heatPillRow(ctx, ["V = " + fmt(s.V, 0) + " l", "f = " + fmt(s.f, 0) + " kHz", "m = " + fmt(s.m, 1) + " kg", "q_s = " + fmt(s.qs, 0) + " Vt/l"], 80, ac);
  heatPillRow(ctx, ["P_gen = " + fmt(r.P, 0) + " Vt", "W = " + fmt(r.E, 0) + " Vt·soat", "w = " + fmt(r.sp, 1) + " Vt·soat/kg"], 112, ac);

  panel(ctx, 40, 150, 520, 262, ac);
  heatPanelTitle(ctx, 58, 172, "ULTRATOVUSH VANNASI", ac);

  const tx = 82, ty = 186, tw = 306, th = 184;
  rr(ctx, tx, ty, tw, th, 10);
  ctx.fillStyle = "#0d1b26";
  ctx.fill();
  ctx.strokeStyle = "rgba(165,215,235,.35)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const lx = tx + 8, ly = ty + 28, lw = tw - 16, lh = th - 36;
  const lg = ctx.createLinearGradient(0, ly, 0, ly + lh);
  lg.addColorStop(0, "rgba(80,190,215,.16)");
  lg.addColorStop(1, "rgba(40,110,150,.30)");
  ctx.fillStyle = lg;
  ctx.fillRect(lx, ly, lw, lh);
  ctx.beginPath();
  ctx.moveTo(lx, ly + 8);
  for (let x = lx; x <= lx + lw; x += 12) {
    ctx.lineTo(x, ly + 8 + Math.sin(x * .06 + tt * 2) * 2.5);
  }
  ctx.strokeStyle = "rgba(140,230,245,.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tx + tw / 2, ty);
  ctx.lineTo(tx + tw / 2, ty + 54);
  ctx.strokeStyle = "rgba(200,225,235,.45)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const bx0 = tx + tw / 2 - 36, by0 = ty + 54;
  rr(ctx, bx0, by0, 72, 64, 9);
  ctx.fillStyle = "#6c7b88";
  ctx.fill();
  ctx.strokeStyle = "rgba(220,238,248,.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  [[bx0 + 18, by0 + 18], [bx0 + 52, by0 + 18], [bx0 + 35, by0 + 44]].forEach(h => {
    ctx.beginPath();
    ctx.arc(h[0], h[1], 8, 0, TAU);
    ctx.fillStyle = "#12222d";
    ctx.fill();
    ctx.strokeStyle = "rgba(215,235,245,.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  text(ctx, "detal", bx0 + 36, by0 + 76, { size: 8, align: "center", color: "rgba(200,225,235,.7)" });

  for (let i = 0; i < 3; i++) {
    rr(ctx, tx + 34 + i * 82, ty + th - 14, 46, 9, 3);
    ctx.fillStyle = heatA("#ffd166", .55);
    ctx.fill();
    ctx.strokeStyle = heatA("#ffd166", .8);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  text(ctx, "almashtirgichlar", tx + tw / 2, ty + th + 15, { size: 8, align: "center", color: "rgba(220,205,165,.7)" });

  for (let i = 0; i < 18; i++) {
    const ph = (tt * .32 + i * .137) % 1;
    const bxp = lx + 10 + ((i * 53) % (lw - 20));
    const byp = ly + lh - 8 - ph * (lh - 14);
    const br = 1.4 + 3.4 * Math.sin(ph * Math.PI);
    ctx.beginPath();
    ctx.arc(bxp, byp, br, 0, TAU);
    ctx.fillStyle = "rgba(175,240,250," + (0.12 + 0.3 * Math.sin(ph * Math.PI)) + ")";
    ctx.fill();
    if (ph > .93) {
      ctx.beginPath();
      ctx.arc(bxp, byp, br + (ph - .93) * 40, 0, TAU);
      ctx.strokeStyle = "rgba(190,245,255," + (1 - (ph - .93) / .07) * .55 + ")";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }
  text(ctx, "kavitatsiya", lx + 12, ly + 18, { size: 8, color: "rgba(175,240,250,.65)" });
  text(ctx, "60 °C suv", lx + lw - 10, ly + lh - 8, { size: 8, align: "right", color: "rgba(200,230,240,.55)" });

  const gb = { x: 432, y: 244, w: 108, h: 66 };
  rr(ctx, gb.x, gb.y, gb.w, gb.h, 8);
  ctx.fillStyle = "#132330";
  ctx.fill();
  ctx.strokeStyle = heatA(ac, .5);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, "GENERATOR", gb.x + gb.w / 2, gb.y + 22, { size: 9, align: "center", weight: 750, color: heatA(ac, .95) });
  text(ctx, fmt(s.f, 0) + " kHz", gb.x + gb.w / 2, gb.y + 40, { size: 13, align: "center", mono: true, color: "#d9f6ff" });
  text(ctx, fmt(r.P, 0) + " Vt", gb.x + gb.w / 2, gb.y + 56, { size: 8.5, align: "center", color: "rgba(190,220,235,.65)" });
  ctx.beginPath();
  ctx.moveTo(gb.x, gb.y + 54);
  ctx.bezierCurveTo(gb.x - 26, gb.y + 58, tx + tw + 18, ty + th - 10, tx + tw - 6, ty + th - 10);
  ctx.strokeStyle = "rgba(120,212,244,.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const gx = 580, gw = 340;
  panel(ctx, gx, 150, gw, 262, ac);
  heatPanelTitle(ctx, gx + 18, 172, "CHASTOTA REJIMI", ac);

  const fs = [20, 28, 35, 40];
  const base = 312, maxH = 112;
  let best = fs[0];
  fs.forEach(f0 => { if (Math.abs(f0 - +s.f) < Math.abs(best - +s.f)) best = f0; });
  fs.forEach((f0, i) => {
    const val = Math.sqrt(28 / f0) * (+s.qs / 25);
    const h = clamp(val / 1.3, 0, 1) * maxH;
    const x = gx + 26 + i * 74;
    const sel = f0 === best;
    rr(ctx, x, base - h, 46, h, 4);
    ctx.fillStyle = sel ? heatA(ac, .65) : "rgba(120,170,195,.22)";
    ctx.fill();
    text(ctx, fmt(val, 2), x + 23, base - h - 8, { size: 8.5, align: "center", mono: true, color: sel ? "#d9f6ff" : "rgba(190,215,230,.55)" });
    text(ctx, f0 + " kHz", x + 23, base + 16, { size: 8, align: "center", color: sel ? heatA(ac, .95) : "rgba(190,215,230,.55)" });
  });
  ctx.beginPath();
  ctx.moveTo(gx + 16, base);
  ctx.lineTo(gx + gw - 16, base);
  ctx.strokeStyle = "rgba(160,205,225,.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  pill(ctx, gx + 18, 340, r.mode + " · " + r.modeNote, {
    bg: heatA(ac, .1), border: heatA(ac, .3), color: "#cdefff", size: 9.5
  });
  text(ctx, "Tavsiya: t ≈ " + fmt(r.trec, 1) + " daq · I_kav = " + fmt(r.irel * 100, 0) + "%", gx + 18, 392, { size: 10, color: "rgba(205,232,245,.75)" });

  panel(ctx, 40, 420, 880, 68, ac);
  const cells = [
    ["Generator quvvati", fmt(r.P, 0) + " Vt"],
    ["Energiya", fmt(r.E, 1) + " Vt·soat"],
    ["Solishtirma energiya", fmt(r.sp, 1) + " Vt·soat/kg"],
    ["Almashtirgichlar", fmt(r.ntr, 0) + " dona"],
    ["Tozalash vaqti", fmt(s.t, 1) + " min"],
    ["Kavitatsiya", fmt(r.irel * 100, 0) + " %"]
  ];
  cells.forEach((c, i) => {
    const x = 62 + i * 146;
    text(ctx, c[0], x, 442, { size: 8, color: "rgba(185,210,225,.65)" });
    text(ctx, c[1], x, 464, { size: 12, mono: true, weight: 700, color: i === 0 ? "#cdefff" : "#e9f4fb" });
  });

  text(ctx, "P_gen = V·q_s   ·   W = P_gen·t/60   ·   I_kav ≈ √(28/f)·(q_s/25)   ·   1 almashtirgich ≈ 50 Vt", 30, 518, { size: 9.5, color: "rgba(160,195,215,.6)", mono: true });
}

heatRegister({
  key: "quymakorlik-15",
  subject: "quymakorlik",
  name: "15-ish · Ultratovushli tozalash",
  labLabel: "15-ish · Ultratovushli tozalash",
  kicker: "Quymakorlik · sirt tayyorlash",
  title: "Ultratovush vannasi qancha quvvat talab qiladi?",
  goal: "Maqsad: vanna hajmi va solishtirma akustik quvvatdan foydalanib generator quvvati <b>P_gen</b>, energiya sarfi va chastota rejimiga mos tozalash vaqtini aniqlash.",
  accent: "#78d4f4",
  equipment: ["Ultratovush vannasi (AISI 304)", "Pyezoelektrik almashtirgichlar", "20–40 kHz generator", "Isitish elementi", "Sekundomer"],
  bigLabel: "generator quvvati",
  hint: "Ma’lumotlar: NamDTU uslubiy ko‘rsatmasi (2026), 15-jadval. Tavsiya etilgan q_s = 25 Vt/l. Kavitatsiya intensivligi I ≈ √(28/f)·(q_s/25); optimal vaqt 3–8 min, almashtirgich quvvati ≈ 50 Vt.",
  controls: [
    heatVarSelect(HEAT_V15, v => fmt(v.V, 0) + " l · " + fmt(v.f, 0) + " kHz · " + fmt(v.m, 1) + " kg"),
    { id: "V", label: "Vanna hajmi, V", type: "range", min: 5, max: 100, step: 1, value: 15, unit: "l", dec: 0 },
    { id: "f", label: "Ishchi chastota, f", type: "range", min: 20, max: 60, step: 1, value: 28, unit: "kHz", dec: 0 },
    { id: "m", label: "Detal massasi, m", type: "range", min: 1, max: 40, step: .5, value: 4.5, unit: "kg", dec: 1 },
    { id: "qs", label: "Solishtirma quvvat, q_s", type: "range", min: 15, max: 40, step: 1, value: 25, unit: "Vt/l", dec: 0 },
    { id: "t", label: "Tozalash vaqti, t", type: "range", min: 3, max: 8, step: .5, value: 4, unit: "min", dec: 1 }
  ],
  state: { variant: 1, V: 15, f: 28, m: 4.5, qs: 25, t: 4 },
  onChange(def, id) {
    if (id !== "variant") return;
    heatApplyVariant(def, HEAT_V15, { V: "V", f: "f", m: "m" });
    const rec = Math.round(clamp(8 - 4 * Math.sqrt(28 / (+def.state.f)), 3, 8) * 2) / 2;
    def.state.t = rec;
    const inp = document.querySelector('[data-control="t"]');
    if (inp) inp.value = rec;
  },
  compute(s) {
    const r = v15Calc(s);
    return {
      big: fmt(r.P, 0) + " Vt",
      readout: [
        ["Variant", "№ " + s.variant, ""],
        ["Vanna hajmi, V", fmt(s.V, 0), "l"],
        ["Ishchi chastota, f", fmt(s.f, 0), "kHz"],
        ["Detal massasi, m", fmt(s.m, 1), "kg"],
        ["Solishtirma quvvat, q_s", fmt(s.qs, 0), "Vt/l"],
        ["Generator quvvati, P_gen", fmt(r.P, 0), "Vt", true],
        ["Kavitatsiya intensivligi", fmt(r.irel * 100, 0), "%"],
        ["Tavsiya etilgan vaqt", fmt(r.trec, 1), "min"],
        ["Tanlangan vaqt, t", fmt(s.t, 1), "min"],
        ["Tozalash tezligi", fmt(r.rate, 1), "%/min"],
        ["Energiya sarfi, W", fmt(r.E, 1), "Vt·soat"],
        ["Solishtirma energiya", fmt(r.sp, 2), "Vt·soat/kg"],
        ["Almashtirgichlar soni", fmt(r.ntr, 0), "dona (50 Vt)"]
      ],
      calc:
        "Berilgan: V = " + fmt(s.V, 0) + " l, f = " + fmt(s.f, 0) + " kHz, m = " + fmt(s.m, 1) + " kg, q_s = " + fmt(s.qs, 0) + " Vt/l, t = " + fmt(s.t, 1) + " min\n\n" +
        "1) P_gen = V·q_s = " + fmt(s.V, 0) + "·" + fmt(s.qs, 0) + " = " + fmt(r.P, 0) + " Vt\n\n" +
        "2) I_kav ≈ √(28/f)·(q_s/25) = √(28/" + fmt(s.f, 0) + ")·(" + fmt(s.qs, 0) + "/25)\n" +
        "     = " + fmt(Math.sqrt(28 / +s.f), 3) + "·" + fmt(+s.qs / 25, 2) + " = " + fmt(r.irel, 3) + " (" + fmt(r.irel * 100, 0) + "%)\n\n" +
        "3) Rejim: " + r.mode.toLowerCase() + " — " + r.modeNote + "\n" +
        "   Tavsiya etilgan vaqt: t ≈ " + fmt(r.trec, 1) + " min (3–8 min oralig‘ida)\n\n" +
        "4) W = P_gen·t/60 = " + fmt(r.P, 0) + "·" + fmt(s.t, 1) + "/60 = " + fmt(r.E, 1) + " Vt·soat\n\n" +
        "5) w = W/m = " + fmt(r.E, 1) + "/" + fmt(s.m, 1) + " = " + fmt(r.sp, 2) + " Vt·soat/kg\n\n" +
        "6) Almashtirgichlar: n = P_gen/50 = " + fmt(r.P, 0) + "/50 → " + fmt(r.ntr, 0) + " dona",
      conclusion:
        "№" + s.variant + " variant: " + fmt(s.V, 0) + " litrli vanna uchun q_s = " + fmt(s.qs, 0) + " Vt/l da generator quvvati P_gen = " +
        fmt(r.P, 0) + " Vt, taxminan " + fmt(r.ntr, 0) + " ta 50 Vt almashtirgich kerak. " + fmt(s.f, 0) +
        " kHz — " + r.mode.toLowerCase() + " rejimi, tavsiya etilgan vaqt " + fmt(r.trec, 1) + " min. Sarf W = " +
        fmt(r.E, 1) + " Vt·soat (" + fmt(r.sp, 2) + " Vt·soat/kg), tozalash tezligi " + fmt(r.rate, 1) + "%/min."
    };
  },
  steps: [
    "Variantdagi vanna hajmi, chastota va detal massasini yozib oling.",
    "P_gen = V·q_s generator quvvatini hisoblang (q_s = 25 Vt/l).",
    "Chastota bo‘yicha kavitatsiya intensivligini baholang.",
    "3–8 min oralig‘idan optimal tozalash vaqtini tanlang.",
    "W = P_gen·t/60 energiya va solishtirma sarfni toping.",
    "Almashtirgichlar sonini aniqlab, an’anaviy usullar bilan taqqoslab xulosa yozing."
  ],
  questions: [
    "Ultratovushli tozalashning fizik mexanizmi nimaga asoslangan?",
    "Akustik kavitatsiya hodisasi qanday sodir bo‘ladi?",
    "Elektr energiyasini mexanik tebranishga aylantiruvchi moslama nima deyiladi?",
    "Qattiq kuydirma va zangni tozalash uchun qaysi chastota samarali?",
    "Kavitatsiya maksimal bo‘ladigan harorat oralig‘i qanday?",
    "Ultratovushli tozalashning an’anaviy usullardan afzalligi nimada?"
  ],
  draw: drawHeat15
});

heatFinish();
