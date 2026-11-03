"use strict";

/* ============================================================
   VIRTUAL LABORATORIYA — boshqa fanlar
   Har bir fan: animatsiya + slayderlar + hisob + hisobot
   ============================================================ */

const PLANETS = {
  mercury: { name: "Merkuriy", a: 0.387, color: "#c8b49b" },
  venus:   { name: "Venera",   a: 0.723, color: "#e7c27a" },
  earth:   { name: "Yer",      a: 1.000, color: "#5aa9ff" },
  mars:    { name: "Mars",     a: 1.524, color: "#d9785b" },
  jupiter: { name: "Yupiter",  a: 5.203, color: "#d8b48b" },
  saturn:  { name: "Saturn",   a: 9.537, color: "#e2cf9b" }
};

const METALS = {
  alu:   { name: "Alyuminiy", tm: 660,  B: 45, color: "#d6dee8" },
  brass: { name: "Latun",     tm: 900,  B: 60, color: "#d6b36a" },
  iron:  { name: "Cho‘yan",   tm: 1200, B: 75, color: "#b0795a" },
  steel: { name: "Po‘lat",    tm: 1450, B: 95, color: "#aeb8c8" }
};

const PROD_TYPES = {
  yakka: {
    name: "Yakka", batch: "1–10 dona", blank: "Prokat (oddiy)", work: "Universal stanok 16K20",
    delta: 4, end: 5, base: 42, tpz: 30, n: 1, color: "#ff8a6b"
  },
  seriyali: {
    name: "Seriyali", batch: "11–1000 dona", blank: "Shtampovka yoki prokat", work: "CNC stanok 16K20F3",
    delta: 3, end: 4, base: 14, tpz: 25, n: 200, color: "#f5b84b"
  },
  ommaviy: {
    name: "Ommaviy", batch: "1000 dan ortiq", blank: "Shtampovka (aniq)", work: "Avtomatik liniya",
    delta: 2, end: 3, base: 4.5, tpz: 20, n: 5000, color: "#5ee08a"
  }
};

const ROUTES = {
  yakka: [
    { n: "I", name: "Tokarlik", eq: "16K20", surf: "1–4 sirtlar", note: "qo‘pol yo‘nish" },
    { n: "II", name: "Tokarlik", eq: "16K20", surf: "5–8 sirtlar", note: "toza yo‘nish" },
    { n: "III", name: "Frezalash", eq: "6R81", surf: "9–10 sirtlar", note: "shponka o‘yig‘i" },
    { n: "IV", name: "Charxlash", eq: "3M131", surf: "2, 4, 7", note: "silliqlash" },
    { n: "V", name: "Nazorat", eq: "Shtangensirkul", surf: "barcha o‘lchamlar", note: "o‘lchash" }
  ],
  seriyali: [
    { n: "I", name: "Tokarlik (CNC)", eq: "16K20F3", surf: "1–4 sirtlar", note: "qo‘pol yo‘nish" },
    { n: "II", name: "Tokarlik (CNC)", eq: "16K20F3", surf: "5–8 sirtlar", note: "toza yo‘nish" },
    { n: "III", name: "Frezalash", eq: "6R81", surf: "9–10 sirtlar", note: "shponka o‘yig‘i" },
    { n: "IV", name: "Charxlash", eq: "3M131", surf: "2, 4, 7", note: "silliqlash" },
    { n: "V", name: "Markalash", eq: "Markalash asbobi", surf: "partiya raqami", note: "belgilash" },
    { n: "VI", name: "Nazorat", eq: "Kalibr va shtangensirkul", surf: "tanlab o‘lchash", note: "nazorat" }
  ],
  ommaviy: [
    { n: "I", name: "Shtamplash", eq: "Krishko-press", surf: "zagotovka", note: "shakl berish" },
    { n: "II", name: "Tokarlik (avtomat)", eq: "1B240", surf: "1–4 sirtlar", note: "qo‘pol yo‘nish" },
    { n: "III", name: "Tokarlik (avtomat)", eq: "1B240", surf: "5–8 sirtlar", note: "toza yo‘nish" },
    { n: "IV", name: "Frezalash (agregat)", eq: "Agregat stanok", surf: "9–10 sirtlar", note: "shponka o‘yig‘i" },
    { n: "V", name: "Charxlash (avtomat)", eq: "3M131", surf: "2, 4, 7", note: "silliqlash" },
    { n: "VI", name: "Yuvish", eq: "Yuvish mashinasi", surf: "butun detal", note: "tozalash" },
    { n: "VII", name: "Nazorat (avtomat)", eq: "O‘lchov stansiyasi", surf: "barcha o‘lchamlar", note: "nazorat" },
    { n: "VIII", name: "Qadoqlash", eq: "Qadoqlash liniyasi", surf: "tayyor detal", note: "jo‘natish" }
  ]
};

function techData(s) {
  const T = PROD_TYPES[s.type] || PROD_TYPES.yakka;
  const N = Math.max(1, Math.round(s.N));
  const k = Math.pow(s.D / 60, 1.15) * Math.pow(s.L / 240, 0.55);
  const tDona = T.base * k;
  const Tbatch = (T.tpz + N * tDona) / 60;
  const takt = N > 1 ? 28800 / N : null;
  const Dz = s.D + 2 * T.delta;
  const Lz = s.L + 2 * T.end;
  const mzag = Math.PI / 4 * Dz * Dz * Lz * 7.85e-6;
  const mdet = Math.PI / 4 * s.D * s.D * s.L * 7.85e-6;
  const waste = (mzag - mdet) / mzag * 100;
  return { T, N, k, tDona, Tbatch, takt, Dz, Lz, mzag, mdet, waste, route: ROUTES[s.type] || ROUTES.yakka };
}

const ICONS = {
  drop: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M16 4.5c4.2 5.5 8.3 9.4 8.3 14.4a8.3 8.3 0 1 1-16.6 0C7.7 13.9 11.8 10 16 4.5Z"/><path d="M10.4 20.6c1.7 2.2 3.5 3.2 5.6 3.2 1.4 0 2.8-.5 4.1-1.6" stroke-linecap="round"/></svg>',
  atom: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="16" cy="16" r="2.3" fill="currentColor" stroke="none"/><ellipse cx="16" cy="16" rx="11.5" ry="4.6"/><ellipse cx="16" cy="16" rx="11.5" ry="4.6" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="11.5" ry="4.6" transform="rotate(120 16 16)"/></svg>',
  orbit: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="16" cy="16" r="3.2" fill="currentColor" stroke="none"/><ellipse cx="16" cy="16" rx="12" ry="6.5" transform="rotate(-25 16 16)"/><circle cx="25.5" cy="10.5" r="2.3" fill="currentColor" stroke="none"/></svg>',
  leaf: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 25C6 14 13 6 26 6c0 13-8 20-20 19Z"/><path d="M9 22c4-6 8-9 13-11" stroke-linecap="round"/></svg>',
  crucible: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M9 6h14l-2 13a5 5 0 0 1-10 0L9 6Z"/><path d="M8 10h16M13 25l-2 4M19 25l2 4" stroke-linecap="round"/><path d="M16 3c2 2-1 3 0 5" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="16" cy="16" r="5.2"/><circle cx="16" cy="16" r="9.4" stroke-dasharray="2.2 2.6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8" stroke-linecap="round"/></svg>',
  incline: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 26h22L5 9v17Z"/><rect x="9" y="12" width="6" height="4.5" rx="1" transform="rotate(31 12 14.2)"/><path d="M22 8v12M19 17l3 3 3-3" stroke-linecap="round"/></svg>'
};

const CARDS = [
  { key: "gidrostatika", name: "Gidrostatika", tagline: "Bosim, suzish, gidravlik press va oqim qonunlari.", count: "6 ish", tags: ["SI", "animatsiya", "TXT"], accent: "#4fd1c5", icon: ICONS.drop },
  { key: "fizika", name: "Fizika", tagline: "Erkin tushish: balandlik, vaqt va tezlik bog‘lanishi.", count: "1 ish", tags: ["mexanika", "SI", "TXT"], accent: "#5aa9ff", icon: ICONS.atom },
  { key: "astronomiya", name: "Astronomiya", tagline: "Sayyoralar orbitalari va Kepler uchinchi qonuni.", count: "1 ish", tags: ["Kepler", "orbita", "TXT"], accent: "#b28dff", icon: ICONS.orbit },
  { key: "ekologiya", name: "Ekologiya", tagline: "Suvni filtrlash va ifloslanishni kamaytirish.", count: "1 ish", tags: ["filtr", "suv", "TXT"], accent: "#5ee08a", icon: ICONS.leaf },
  { key: "quymakorlik", name: "Quymakorlik", tagline: "Quyish harorati va qotish vaqtini hisoblash.", count: "1 ish", tags: ["metall", "qolip", "TXT"], accent: "#f5b84b", icon: ICONS.crucible },
  { key: "mashinasozlik", name: "Mashinasozlik", tagline: "Texnologik jarayon strukturasi va tishli uzatma.", count: "2 ish", tags: ["texnologiya", "uzatma", "TXT"], accent: "#ff8a6b", icon: ICONS.gear },
  { key: "nazariy", name: "Nazariy mexanika", tagline: "Qiyshiq tekislikda ishqalanish va tezlanish.", count: "1 ish", tags: ["dinamika", "kuchlar", "TXT"], accent: "#f58ac2", icon: ICONS.incline }
];

const SUBJECT_LABS = {
  mashinasozlik: ["mashinasozlik-tex", "mashinasozlik-gear"]
};

/* ============================================================
   FAN LABORATORIYALARI
   ============================================================ */

const defs = {
  fizika: {
    name: "Fizika",
    kicker: "Fizika · kinematika",
    title: "Jism balandlikdan qanchalik tez tushadi?",
    goal: "Maqsad: erkin tushishda balandlik, vaqt va tezlik orasidagi bog‘lanishni kuzatish hamda <b>t = √(2h/g)</b> va <b>v = gt</b> formulalarini tekshirish.",
    accent: "#5aa9ff",
    equipment: ["Tushirish platformasi", "Po‘lat shar", "Sekundomer", "O‘lchov lentasi", "Fotodatchik"],
    bigLabel: "tushish vaqti",
    hint: "Havo qarshiligi hisobga olinmagan. Barcha jismlar bir xil tezlanish bilan tushadi.",
    controls: [
      { id: "h", label: "Tushish balandligi, h", type: "range", min: 5, max: 50, step: 1, value: 20, unit: "m", dec: 0 }
    ],
    state: { h: 20 },
    compute(s) {
      const t = Math.sqrt(2 * s.h / G);
      const v = G * t;
      return {
        big: fmt(t, 2) + " s",
        readout: [
          ["Balandlik, h", fmt(s.h, 0), "m"],
          ["Erkin tushish tezlanishi, g", fmt(G, 2), "m/s²"],
          ["Tushish vaqti, t", fmt(t, 2), "s", true],
          ["Yakuniy tezlik, v", fmt(v, 2), "m/s", true],
          ["O‘rtacha tezlik, v/2", fmt(v / 2, 2), "m/s"]
        ],
        calc: "t = √(2h/g)\n" +
          "t = √(2 × " + fmt(s.h, 0) + " / " + fmt(G, 2) + ") = " + fmt(t, 2) + " s\n\n" +
          "v = g · t\n" +
          "v = " + fmt(G, 2) + " × " + fmt(t, 2) + " = " + fmt(v, 2) + " m/s\n\n" +
          "Tekshirish: h = ½gt² = " + fmt(0.5 * G * t * t, 1) + " m",
        conclusion: "h = " + fmt(s.h, 0) + " m balandlikdan tushgan jism " + fmt(t, 2) + " s da yerga yetadi va " + fmt(v, 2) + " m/s tezlikka ega bo‘ladi. Vaqt balandlikning kvadrat ildiziga, tezlik esa vaqtga to‘g‘ri proporsional."
      };
    },
    draw: drawFizika
  },

  astronomiya: {
    name: "Astronomiya",
    kicker: "Astronomiya · Quyosh tizimi",
    title: "Sayyora qancha vaqtda bir marta aylanadi?",
    goal: "Maqsad: sayyoralarning orbita radiusi va aylanish davri orasidagi bog‘lanishni kuzatish, <b>T² = a³</b> (Kepler uchinchi qonuni) va orbital tezlikni hisoblash.",
    accent: "#b28dff",
    equipment: ["Orbita sxemasi", "Quyosh modeli", "Sayyoralar jadvali", "Sekundomer", "Masshtab chizg‘ichi"],
    bigLabel: "aylanish davri",
    hint: "a — astronomik birlikda (1 AU = 149,6 mln km), T — Yer yilida. Animatsiya vaqti siqilgan.",
    controls: [
      { id: "planet", label: "Sayyora", type: "select", value: "earth", options: [
        { value: "mercury", label: "Merkuriy" },
        { value: "venus", label: "Venera" },
        { value: "earth", label: "Yer" },
        { value: "mars", label: "Mars" },
        { value: "jupiter", label: "Yupiter" },
        { value: "saturn", label: "Saturn" }
      ] },
      { id: "speed", label: "Animatsiya tezligi", type: "range", min: 0.5, max: 2, step: 0.1, value: 1, unit: "×", dec: 1 }
    ],
    state: { planet: "earth", speed: 1 },
    compute(s) {
      const p = PLANETS[s.planet] || PLANETS.earth;
      const T = Math.sqrt(Math.pow(p.a, 3));
      const days = T * 365.25;
      const v = TAU * p.a * 149.6e6 / (T * 365.25 * 86400);
      return {
        big: fmt(T, 2) + " yil",
        readout: [
          ["Katta yarim o‘q, a", fmt(p.a, 3), "AU"],
          ["Masofa", fmt(p.a * 149.6, 1), "mln km"],
          ["Aylanish davri, T", fmt(T, 2), "yil", true],
          ["Aylanish davri", fmt(days, 0), "kun"],
          ["Orbital tezlik, v", fmt(v, 2), "km/s", true],
          ["T² / a³", fmt(T * T / Math.pow(p.a, 3), 2), ""],
          ["Quyosh massasi (nazorat)", "1,00", "M☉"]
        ],
        calc: "Kepler uchinchi qonuni: T² = a³\n" +
          "a = " + fmt(p.a, 3) + " AU\n" +
          "T = √(a³) = √(" + fmt(Math.pow(p.a, 3), 3) + ") = " + fmt(T, 2) + " yil\n" +
          "T = " + fmt(T, 2) + " × 365,25 = " + fmt(days, 0) + " kun\n\n" +
          "v = 2πa / T\n" +
          "v = 2π × " + fmt(p.a * 149.6, 1) + " mln km / " + fmt(days, 0) + " kun = " + fmt(v, 2) + " km/s\n\n" +
          "T²/a³ = " + fmt(T * T / Math.pow(p.a, 3), 2) + " — Kepler qonuni bajarildi.",
        conclusion: p.name + " Quyosh atrofida " + fmt(T, 2) + " yilda (" + fmt(days, 0) + " kunda) bir marta aylanadi. Orbita radiusi katta bo‘lsa, aylanish davri ham uzun bo‘ladi: T² ∝ a³."
      };
    },
    draw: drawAstronomy
  },

  ekologiya: {
    name: "Ekologiya",
    kicker: "Ekologiya · suvni tozalash",
    title: "Filtr ifloslangan suvni qanchalik tozalaydi?",
    goal: "Maqsad: ko‘p bosqichli filtrning samaradorligini hisoblash va suvdagi muallaq zarrachalar konsentratsiyasi qanday kamayishini kuzatish.",
    accent: "#5ee08a",
    equipment: ["Filtr kolonkasi", "Shag‘al", "Kvarts qum", "Faol ko‘mir", "Loyqa suv", "Menzurka"],
    bigLabel: "chiqish konsentratsiyasi",
    hint: "Har bir bosqich konsentratsiyani η foizga kamaytiradi: C = C₀(1 − η)ⁿ. 1 NTU ≈ 1 mg/L shartli qabul qilingan.",
    controls: [
      { id: "c0", label: "Boshlang‘ich loyqalik, C₀", type: "range", min: 100, max: 800, step: 20, value: 400, unit: "mg/L", dec: 0 },
      { id: "eff", label: "Bir bosqich samaradorligi, η", type: "range", min: 50, max: 95, step: 5, value: 80, unit: "%", dec: 0 },
      { id: "passes", label: "Tozalash bosqichlari, n", type: "range", min: 1, max: 4, step: 1, value: 2, unit: "ta", dec: 0 },
      { id: "volume", label: "Suv hajmi, V", type: "range", min: 10, max: 100, step: 5, value: 50, unit: "L", dec: 0 }
    ],
    state: { c0: 400, eff: 80, passes: 2, volume: 50 },
    compute(s) {
      const keep = Math.pow(1 - s.eff / 100, s.passes);
      const c = s.c0 * keep;
      const pct = (1 - keep) * 100;
      const mass = (s.c0 - c) * s.volume / 1000;
      const cTxt = c >= 1 ? fmt(c, 1) : c >= 0.01 ? fmt(c, 2) : fmt(c, 3);
      return {
        big: cTxt + " mg/L",
        readout: [
          ["Boshlang‘ich konsentratsiya, C₀", fmt(s.c0, 0), "mg/L"],
          ["Bir bosqich samaradorligi, η", fmt(s.eff, 0), "%"],
          ["Bosqichlar soni, n", fmt(s.passes, 0), "ta"],
          ["Yakuniy konsentratsiya, C", cTxt, "mg/L", true],
          ["Tozalash darajasi", fmt(pct, 1), "%", true],
          ["Ushlab qolingan massa", fmt(mass, 2), "g"],
          ["Suv hajmi, V", fmt(s.volume, 0), "L"]
        ],
        calc: "C = C₀ · (1 − η/100)ⁿ\n" +
          "C = " + fmt(s.c0, 0) + " × (1 − " + fmt(s.eff / 100, 2) + ")" + sup(s.passes) + "\n" +
          "C = " + cTxt + " mg/L\n\n" +
          "Tozalash darajasi = (1 − C/C₀) · 100% = " + fmt(pct, 1) + "%\n" +
          "Ushlab qolingan massa = (C₀ − C) · V\n" +
          "m = (" + fmt(s.c0, 0) + " − " + cTxt + ") × " + fmt(s.volume, 0) + " = " + fmt(mass, 2) + " g",
        conclusion: fmt(s.c0, 0) + " mg/L loyqalikdagi suv " + fmt(s.passes, 0) + " bosqich filtrdan o‘tgach " + cTxt + " mg/L gacha tozalanadi (" + fmt(pct, 1) + "%). " + fmt(s.volume, 0) + " L suvdan " + fmt(mass, 2) + " g muallaq zarracha ushlab qolinadi."
      };
    },
    draw: drawEcology
  },

  quymakorlik: {
    name: "Quymakorlik",
    kicker: "Quymakorlik · quyish texnologiyasi",
    title: "Quyma qanchalik tez qotadi?",
    goal: "Maqsad: quyish harorati, qolipdagi metall qalinligi va qotish vaqti orasidagi bog‘lanishni Chvorinov qoidasi <b>t = B·(V/A)²</b> bo‘yicha hisoblash.",
    accent: "#f5b84b",
    equipment: ["Qolip (opalubka)", "Tigel", "Quyish cho‘michi", "Termojuft", "Metall namunalari", "Chizg‘ich"],
    bigLabel: "qotish vaqti",
    hint: "Plita uchun V/A ≈ d/2. B — qolip materialiga bog‘liq empirik doimiy (s/sm²); bu yerda qum qolipi uchun shartli qiymatlar.",
    controls: [
      { id: "metal", label: "Metall", type: "select", value: "alu", options: [
        { value: "alu", label: "Alyuminiy — 660 °C" },
        { value: "brass", label: "Latun — 900 °C" },
        { value: "iron", label: "Cho‘yan — 1200 °C" },
        { value: "steel", label: "Po‘lat — 1450 °C" }
      ] },
      { id: "d", label: "Quyma qalinligi, d", type: "range", min: 10, max: 60, step: 5, value: 25, unit: "mm", dec: 0 },
      { id: "superheat", label: "Qizdirish, ΔT", type: "range", min: 20, max: 200, step: 10, value: 80, unit: "°C", dec: 0 }
    ],
    state: { metal: "alu", d: 25, superheat: 80 },
    compute(s) {
      const m = METALS[s.metal] || METALS.alu;
      const M = s.d / 20;              // sm: d (mm) / 10 / 2
      const t = m.B * M * M;
      const Tp = m.tm + s.superheat;
      return {
        big: fmt(t, 1) + " s",
        readout: [
          ["Metall", m.name, ""],
          ["Qotish harorati, Tₛ", fmt(m.tm, 0), "°C"],
          ["Qizdirish, ΔT", fmt(s.superheat, 0), "°C"],
          ["Quyish harorati, Tᵩ", fmt(Tp, 0), "°C", true],
          ["Quyma qalinligi, d", fmt(s.d, 0), "mm"],
          ["Modul, M = d/2", fmt(M, 2), "sm"],
          ["Qolip doimiysi, B", fmt(m.B, 0), "s/sm²"],
          ["Qotish vaqti, t", fmt(t, 1), "s", true],
          ["Qotish vaqti", fmt(t / 60, 2), "min"]
        ],
        calc: "M = d / 2 = " + fmt(s.d, 0) + " mm / 2 = " + fmt(M, 2) + " sm\n" +
          "t = B · M²\n" +
          "t = " + fmt(m.B, 0) + " × " + fmt(M, 2) + "² = " + fmt(t, 1) + " s\n\n" +
          "Tᵩ = Tₛ + ΔT = " + fmt(m.tm, 0) + " + " + fmt(s.superheat, 0) + " = " + fmt(Tp, 0) + " °C\n\n" +
          "Qalinlik 2 marta oshsa, qotish vaqti 4 marta ortadi (M² qonuni).",
        conclusion: m.name + " " + fmt(Tp, 0) + " °C da quyiladi, qotish harorati " + fmt(m.tm, 0) + " °C. Qalinligi " + fmt(s.d, 0) + " mm bo‘lgan quyma taxminan " + fmt(t, 1) + " s (" + fmt(t / 60, 2) + " min) da qotadi."
      };
    },
    draw: drawCasting
  },

  "mashinasozlik-gear": {
    name: "Mashinasozlik",
    subject: "mashinasozlik",
    labLabel: "2-ish · Tishli uzatma",
    kicker: "Mashinasozlik · detallar va uzatmalar",
    title: "Tishli uzatma aylanishni qanday o‘zgartiradi?",
    goal: "Maqsad: yetakchi va yetaklanuvchi tishli g‘ildiraklar soni orqali uzatish sonini, chiqish tezligini va momentni hisoblash.",
    accent: "#ff8a6b",
    equipment: ["Tishli g‘ildiraklar", "Elektr dvigatel", "Taxometr", "Dinamometr", "Shtangensirkul"],
    bigLabel: "chiqish tezligi",
    hint: "Modul m = 4 mm, foydali ish koeffitsiyenti η = 0,97. Tishlar soni butun son, aylanish tezligi rpm da.",
    controls: [
      { id: "z1", label: "Yetakchi tishlar, z₁", type: "range", min: 10, max: 40, step: 1, value: 20, unit: "ta", dec: 0 },
      { id: "z2", label: "Yetaklanuvchi tishlar, z₂", type: "range", min: 20, max: 80, step: 1, value: 40, unit: "ta", dec: 0 },
      { id: "n1", label: "Kirish tezligi, n₁", type: "range", min: 100, max: 1500, step: 50, value: 600, unit: "rpm", dec: 0 },
      { id: "M1", label: "Kirish momenti, M₁", type: "range", min: 10, max: 100, step: 5, value: 30, unit: "N·m", dec: 0 }
    ],
    state: { z1: 20, z2: 40, n1: 600, M1: 30 },
    compute(s) {
      const i = s.z2 / s.z1;
      const n2 = s.n1 / i;
      const M2 = s.M1 * i * 0.97;
      const d1 = 4 * s.z1;
      const d2 = 4 * s.z2;
      const v = Math.PI * d1 * (s.n1 / 60) / 1000;
      return {
        big: fmt(n2, 0) + " rpm",
        readout: [
          ["Yetakchi tishlar, z₁", fmt(s.z1, 0), "ta"],
          ["Yetaklanuvchi tishlar, z₂", fmt(s.z2, 0), "ta"],
          ["Uzatish soni, i = z₂/z₁", fmt(i, 2), "", true],
          ["Kirish tezligi, n₁", fmt(s.n1, 0), "rpm"],
          ["Chiqish tezligi, n₂", fmt(n2, 0), "rpm", true],
          ["Kirish momenti, M₁", fmt(s.M1, 0), "N·m"],
          ["Chiqish momenti, M₂", fmt(M2, 1), "N·m", true],
          ["Aylana tezligi, v", fmt(v, 2), "m/s"],
          ["Yetakchi diametri, d₁", fmt(d1, 0), "mm"]
        ],
        calc: "i = z₂ / z₁ = " + fmt(s.z2, 0) + " / " + fmt(s.z1, 0) + " = " + fmt(i, 2) + "\n" +
          "n₂ = n₁ / i = " + fmt(s.n1, 0) + " / " + fmt(i, 2) + " = " + fmt(n2, 0) + " rpm\n\n" +
          "M₂ = M₁ · i · η\n" +
          "M₂ = " + fmt(s.M1, 0) + " × " + fmt(i, 2) + " × 0,97 = " + fmt(M2, 1) + " N·m\n\n" +
          "v = π · d₁ · n₁ / 60\n" +
          "v = π × " + fmt(d1, 0) + " mm × " + fmt(s.n1, 0) + " rpm = " + fmt(v, 2) + " m/s",
        conclusion: "Tishlar soni " + fmt(s.z2, 0) + "/" + fmt(s.z1, 0) + " bo‘lganda uzatish soni " + fmt(i, 2) + " ga teng. Chiqish tezligi " + fmt(n2, 0) + " rpm gacha kamayadi, moment esa " + fmt(M2, 1) + " N·m gacha ortadi."
      };
    },
    draw: drawGears
  },

  "mashinasozlik-tex": {
    name: "Mashinasozlik",
    subject: "mashinasozlik",
    labLabel: "1-ish · Texnologik jarayon",
    kicker: "Mashinasozlik · 1-laboratoriya",
    title: "Pog‘anali valga texnologik jarayon qanday tuziladi?",
    goal: "Maqsad: texnologik jarayon tuzilishiga ishlab chiqarish turining ta’sirini o‘rganish va pog‘anali val uchun yakka, seriyali hamda ommaviy sharoitda texnologik marshrut tuzish.",
    accent: "#ff8a6b",
    equipment: ["Pog‘anali val chizmasi", "Tokarlik stanogi 16K20", "Frezalash stanogi 6R81", "Charxlash stanogi 3M131", "Shtangensirkul", "Texnologik xarita"],
    bigLabel: "donabay vaqt",
    hint: "Yakka — prokat va universal stanok; seriyali — CNC va shtampovka; ommaviy — aniq shtampovka va avtomatik liniya. tдона = tб·(D/60)^1,15·(L/240)^0,55.",
    controls: [
      { id: "type", label: "Ishlab chiqarish turi", type: "select", value: "yakka", options: [
        { value: "yakka", label: "Yakka (1–10 dona)" },
        { value: "seriyali", label: "Seriyali (11–1000 dona)" },
        { value: "ommaviy", label: "Ommaviy (1000+ dona)" }
      ] },
      { id: "D", label: "Val diametri, D", type: "range", min: 30, max: 120, step: 5, value: 60, unit: "mm", dec: 0 },
      { id: "L", label: "Val uzunligi, L", type: "range", min: 100, max: 400, step: 10, value: 240, unit: "mm", dec: 0 },
      { id: "N", label: "Partiya hajmi, N", type: "range", min: 1, max: 5000, step: 1, value: 1, unit: "dona", dec: 0 }
    ],
    state: { type: "yakka", D: 60, L: 240, N: 1 },
    onChange(def, id) {
      if (id !== "type") return;
      const sel = document.querySelector('[data-control="type"]');
      const t = PROD_TYPES[sel ? sel.value : def.state.type] || PROD_TYPES.yakka;
      def.state.N = t.n;
      const input = document.querySelector('[data-control="N"]');
      if (input) input.value = t.n;
    },
    compute(s) {
      const d = techData(s);
      const T = d.T;
      const altKey = s.type === "ommaviy" ? "yakka" : "ommaviy";
      const altT = PROD_TYPES[altKey];
      const alt = techData({ D: s.D, L: s.L, N: altT.n, type: altKey });
      const rows = [
        ["Ishlab chiqarish turi", T.name, ""],
        ["Partiya hajmi, N", fmt(d.N, 0), "dona"],
        ["Zagotovka turi", T.blank, ""],
        ["Zagotovka diametri, Dzag", fmt(d.Dz, 0), "mm"],
        ["Zagotovka uzunligi, Lzag", fmt(d.Lz, 0), "mm"],
        ["Zagotovka massasi, mzag", fmt(d.mzag, 2), "kg"],
        ["Detal massasi, mdet", fmt(d.mdet, 2), "kg"],
        ["Chiqindi (qirqim), δm", fmt(d.waste, 1), "%"],
        ["Operatsiyalar soni", fmt(d.route.length, 0), "ta", true],
        ["Donabay vaqt, tdona", fmt(d.tDona, 1), "min", true],
        ["Partiya vaqti, Tpartiya", fmt(d.Tbatch, 2), "soat"]
      ];
      if (d.takt) rows.push(["Ishlab chiqarish takti, τ", fmt(d.takt, 1), "s", true]);

      return {
        big: fmt(d.tDona, 1) + " min",
        readout: rows,
        calc: "Dzag = D + 2δ = " + fmt(s.D, 0) + " + 2·" + fmt(T.delta, 0) + " = " + fmt(d.Dz, 0) + " mm\n" +
          "Lzag = L + 2·" + fmt(T.end, 0) + " = " + fmt(s.L, 0) + " + 2·" + fmt(T.end, 0) + " = " + fmt(d.Lz, 0) + " mm\n" +
          "mzag = ρ·π/4·Dzag²·Lzag = 7,85·10⁻⁶ × " + fmt(d.Dz * d.Dz * d.Lz, 0) + " = " + fmt(d.mzag, 2) + " kg\n" +
          "mdet = ρ·π/4·D²·L = 7,85·10⁻⁶ × " + fmt(s.D * s.D * s.L, 0) + " = " + fmt(d.mdet, 2) + " kg\n" +
          "Chiqindi = (mzag − mdet)/mzag × 100 % = " + fmt(d.waste, 1) + " %\n\n" +
          "tdona = tб·(D/60)^1,15·(L/240)^0,55\n" +
          "tdona = " + fmt(T.base, 1) + " × " + fmt(d.k, 2) + " = " + fmt(d.tDona, 1) + " min\n" +
          "Tpartiya = (Tпз + N·tdona)/60 = (" + fmt(T.tpz, 0) + " + " + fmt(d.N, 0) + "·" + fmt(d.tDona, 1) + ")/60 = " + fmt(d.Tbatch, 2) + " soat\n" +
          (d.takt ? "τ = 480·60/N = 28800/" + fmt(d.N, 0) + " = " + fmt(d.takt, 1) + " s/dona\n" : "") +
          "\nTexnologik marshrut:\n" +
          d.route.map(o => "  " + o.n + " " + o.name + " — " + o.eq + " · " + o.surf + " (" + o.note + ")").join("\n"),
        conclusion: T.name + " ishlab chiqarishda zagotovka — " + T.blank.toLowerCase() + ", marshrutda " + d.route.length + " ta operatsiya bor. " +
          fmt(d.N, 0) + " dona partiya uchun " + fmt(d.Tbatch, 2) + " soat sarflanadi. " +
          (s.type === "ommaviy"
            ? "Taqqoslash uchun yakka sharoitda donabay vaqt " + fmt(alt.tDona, 1) + " min, chiqindi " + fmt(alt.waste, 1) + "% bo‘lardi."
            : "Ommaviy sharoitga o‘tsa, donabay vaqt " + fmt(alt.tDona, 1) + " min, chiqindi " + fmt(alt.waste, 1) + "% bo‘ladi.")
      };
    },
    steps: [
      "Detal chizmasini o‘rganing.",
      "Detal eskizini bajaring.",
      "Chizmada detalni tayyorlash uchun zarur ma’lumotlar borligini tekshiring.",
      "Ishlanuvchi sirtlarni raqamlar bilan belgilang.",
      "Yakka ishlab chiqarish uchun texnologik yo‘nalish tuzing.",
      "Taklif etilgan variantni o‘qituvchi bilan tasdiqlang.",
      "Seriyali ishlab chiqarish uchun texnologik yo‘nalish tuzing.",
      "Variantni o‘qituvchi bilan tasdiqlang.",
      "Ommaviy ishlab chiqarish uchun texnologik yo‘nalish tuzing.",
      "Variantni o‘qituvchi bilan tasdiqlang.",
      "Har bir ishlab chiqarish turi uchun texnologik xaritani to‘ldiring.",
      "Ishlab chiqarish miqyosiga qarab jarayon tuzilishi o‘zgarishi haqida xulosa chiqaring."
    ],
    questions: [
      "Texnologik jarayon tushunchasini ta’riflab bering.",
      "Texnologik jarayonning strukturaviy tuzilishi nimalarni o‘z ichiga oladi?",
      "Texnologik operatsiyani izohlab bering.",
      "Texnologik operatsiya qaysi tushunchalarni o‘z ichiga oladi?",
      "O‘rnatish, holat, texnologik va yordamchi o‘tish, ishchi va yordamchi yurishlarni ta’riflab bering.",
      "Zagotovka turining ishlab chiqarish turiga bog‘liqligi nimadan iborat?",
      "Yakka ishlab chiqarishni qisqacha tavsiflang.",
      "Seriyali ishlab chiqarishni qisqacha tavsiflang.",
      "Ommaviy ishlab chiqarishni qisqacha tavsiflang.",
      "Bu ishlab chiqarish turlari bir-biridan qanday farq qiladi?"
    ],
    draw: drawTechProcess
  },

  nazariy: {
    name: "Nazariy mexanika",
    kicker: "Nazariy mexanika · dinamika",
    title: "Blok qiyshiq tekislikdan qanday tezlanish bilan tushadi?",
    goal: "Maqsad: og‘irlik, normal reaksiya va ishqalanish kuchlarini hisobga olib, blokning tezlanishi, vaqti va oxirgi tezligini aniqlash.",
    accent: "#f58ac2",
    equipment: ["Qiyshiq tekislik", "Yog‘och brusok", "Dinamometr", "Transportir", "Sekundomer", "Chizg‘ich"],
    bigLabel: "tezlanish",
    hint: "a = g(sinα − μcosα). Agar mg·sinα ≤ μmg·cosα bo‘lsa, blok joyidan qo‘zg‘almaydi.",
    controls: [
      { id: "alpha", label: "Qiyshiqlik burchagi, α", type: "range", min: 10, max: 45, step: 1, value: 30, unit: "°", dec: 0 },
      { id: "m", label: "Blok massasi, m", type: "range", min: 1, max: 20, step: 1, value: 5, unit: "kg", dec: 0 },
      { id: "mu", label: "Ishqalanish koeffitsiyenti, μ", type: "range", min: 0, max: 0.5, step: 0.01, value: 0.15, unit: "", dec: 2 },
      { id: "h", label: "Boshlang‘ich balandlik, h", type: "range", min: 1, max: 5, step: 0.5, value: 2, unit: "m", dec: 1 }
    ],
    state: { alpha: 30, m: 5, mu: 0.15, h: 2 },
    compute(s) {
      const rad = s.alpha * Math.PI / 180;
      const Fg = s.m * G;
      const N = Fg * Math.cos(rad);
      const Fpull = Fg * Math.sin(rad);
      const Ffr = s.mu * N;
      const a = G * (Math.sin(rad) - s.mu * Math.cos(rad));
      const moves = a > 0.001;
      const L = s.h / Math.sin(rad);
      const t = moves ? Math.sqrt(2 * L / a) : 0;
      const v = moves ? Math.sqrt(2 * a * L) : 0;
      return {
        big: moves ? fmt(a, 2) + " m/s²" : "harakat yo‘q",
        bigLabel: moves ? "tezlanish" : "blok joyida qoladi",
        readout: [
          ["Burchak, α", fmt(s.alpha, 0), "°"],
          ["Massa, m", fmt(s.m, 0), "kg"],
          ["Ishqalanish koeffitsiyenti, μ", fmt(s.mu, 2), ""],
          ["Toruvchi kuch, mg·sinα", fmt(Fpull, 1), "N"],
          ["Ishqalanish kuchi, Fᵢ", fmt(Ffr, 1), "N"],
          ["Normal reaksiya, N", fmt(N, 1), "N"],
          ["Yo‘l uzunligi, L", fmt(L, 2), "m"],
          ["Tezlanish, a", moves ? fmt(a, 2) : "0,00", "m/s²", true],
          ["Harakat vaqti, t", moves ? fmt(t, 2) : "—", moves ? "s" : "", moves],
          ["Oxirgi tezlik, v", moves ? fmt(v, 2) : "—", moves ? "m/s" : "", moves]
        ],
        calc: "a = g(sinα − μcosα)\n" +
          "a = " + fmt(G, 2) + " × (sin" + fmt(s.alpha, 0) + "° − " + fmt(s.mu, 2) + "·cos" + fmt(s.alpha, 0) + "°)\n" +
          "a = " + fmt(a, 2) + " m/s²\n\n" +
          "L = h / sinα = " + fmt(s.h, 1) + " / sin" + fmt(s.alpha, 0) + "° = " + fmt(L, 2) + " m\n" +
          (moves ? "t = √(2L/a) = " + fmt(t, 2) + " s\nv = √(2aL) = " + fmt(v, 2) + " m/s"
                 : "mg·sinα = " + fmt(Fpull, 1) + " N ≤ Fᵢ = " + fmt(Ffr, 1) + " N — harakat boshlanmaydi."),
        conclusion: moves
          ? "α = " + fmt(s.alpha, 0) + "° va μ = " + fmt(s.mu, 2) + " bo‘lganda blok " + fmt(a, 2) + " m/s² tezlanish bilan sirg‘aladi. " + fmt(L, 2) + " m yo‘lni " + fmt(t, 2) + " s da bosib o‘tib, " + fmt(v, 2) + " m/s tezlikka erishadi."
          : "α = " + fmt(s.alpha, 0) + "° da tortuvchi kuch " + fmt(Fpull, 1) + " N, ishqalanish esa " + fmt(Ffr, 1) + " N. Ishqalanish kattaroq bo‘lgani uchun blok joyidan qo‘zg‘almaydi."
      };
    },
    draw: drawIncline
  }
};

/* ============================================================
   UMUMIY CHIZISH YORDAMCHILARI
   ============================================================ */

function subjectBg(ctx, brand, title, meta) {
  drawBg(ctx, "", title, brand, meta);
}

function panel(ctx, x, y, w, h, accent) {
  rr(ctx, x, y, w, h, 14);
  ctx.fillStyle = "rgba(7,19,30,.82)";
  ctx.fill();
  ctx.strokeStyle = accent ? hexA(accent, .34) : "rgba(150,205,235,.16)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function mixHex(a, b, t) {
  t = clamp(t, 0, 1);
  const pa = a.replace("#", ""), pb = b.replace("#", "");
  const ar = parseInt(pa.slice(0, 2), 16), ag = parseInt(pa.slice(2, 4), 16), ab = parseInt(pa.slice(4, 6), 16);
  const br = parseInt(pb.slice(0, 2), 16), bg = parseInt(pb.slice(2, 4), 16), bb = parseInt(pb.slice(4, 6), 16);
  return "rgb(" + Math.round(lerp(ar, br, t)) + "," + Math.round(lerp(ag, bg, t)) + "," + Math.round(lerp(ab, bb, t)) + ")";
}

function hatchRect(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = -h; i < w; i += 13) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

/* ============================================================
   FIZIKA — erkin tushish
   ============================================================ */

function drawFizika(ctx, s, time) {
  subjectBg(ctx, "FIZIKA", "Erkin tushish", "g = 9,81 m/s²");

  const ground = 468, top = 152, bx = 500;
  const tTot = Math.sqrt(2 * s.h / G);
  const vMax = G * tTot;
  const cycle = 4.4, fall = 2.9;
  const p = clamp((time % cycle) / fall, 0, 1);
  const y = top + (ground - top) * p * p;

  ctx.strokeStyle = "rgba(150,205,235,.34)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(250, ground); ctx.lineTo(650, ground); ctx.stroke();
  ctx.strokeStyle = "rgba(150,205,235,.16)";
  ctx.lineWidth = 1;
  for (let x = 260; x < 650; x += 26) {
    ctx.beginPath(); ctx.moveTo(x, ground); ctx.lineTo(x + 12, ground + 11); ctx.stroke();
  }

  ctx.strokeStyle = "rgba(150,205,235,.26)";
  ctx.beginPath(); ctx.moveTo(380, top); ctx.lineTo(380, ground); ctx.stroke();
  for (let i = 0; i <= 10; i++) {
    const yy = ground - (ground - top) * i / 10;
    ctx.beginPath(); ctx.moveTo(372, yy); ctx.lineTo(388, yy); ctx.stroke();
    text(ctx, fmt(s.h * i / 10, 1), 364, yy + 3.5, { size: 9.5, align: "right", mono: true, color: "rgba(160,195,215,.55)" });
  }
  text(ctx, "h, m", 380, top - 12, { size: 10, align: "center", color: "rgba(160,195,215,.6)", weight: 600 });

  ctx.strokeStyle = "rgba(150,205,235,.4)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(432, top - 26); ctx.lineTo(568, top - 26); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(440, top - 26); ctx.lineTo(440, top - 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(560, top - 26); ctx.lineTo(560, top - 4); ctx.stroke();

  for (let k = 1; k <= 4; k++) {
    const pk = Math.max(0, p - k * 0.05);
    const yk = top + (ground - top) * pk * pk;
    ctx.beginPath();
    ctx.arc(bx, yk, 14 - k * 1.4, 0, TAU);
    ctx.fillStyle = "rgba(90,169,255," + (0.16 - k * 0.028) + ")";
    ctx.fill();
  }

  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = "rgba(120,190,230,.28)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(388, y); ctx.lineTo(bx - 18, y); ctx.stroke();
  ctx.setLineDash([]);

  const ball = ctx.createRadialGradient(bx - 6, y - 7, 2, bx, y, 18);
  ball.addColorStop(0, "#eaf7ff");
  ball.addColorStop(.45, "#79c8ff");
  ball.addColorStop(1, "#2c6f9e");
  ctx.beginPath(); ctx.arc(bx, y, 16, 0, TAU); ctx.fillStyle = ball; ctx.fill();
  ctx.strokeStyle = "rgba(220,245,255,.65)"; ctx.lineWidth = 1.5; ctx.stroke();

  const vNow = vMax * p;
  const arrowLen = clamp(vNow / vMax * 86, 8, 86);
  arrow(ctx, bx, y + 22, bx, y + 22 + arrowLen, "#5aa9ff", 3, 9);
  text(ctx, "v", bx + 8, y + 30 + arrowLen * .5, { size: 11, color: "#8dc9ff", weight: 700, mono: true });

  panel(ctx, 670, 126, 260, 224, "#5aa9ff");
  text(ctx, "JORIY HOLAT", 690, 152, { size: 9.5, weight: 750, color: "rgba(150,200,220,.6)" });
  text(ctx, fmt(tTot, 2) + " s", 690, 192, { size: 24, mono: true, weight: 650, color: "#e6f6ff" });
  text(ctx, "to‘liq tushish vaqti", 690, 210, { size: 10.5, color: "rgba(160,195,215,.65)" });
  text(ctx, "v = " + fmt(vNow, 2) + " m/s", 690, 248, { size: 15, mono: true, weight: 600, color: "#8dc9ff" });
  text(ctx, "hozirgi tezlik", 690, 266, { size: 10.5, color: "rgba(160,195,215,.6)" });
  text(ctx, "h = " + fmt(s.h * (1 - p * p), 2) + " m", 690, 302, { size: 15, mono: true, weight: 600, color: "#9ff0e7" });
  text(ctx, "yerdan balandlik", 690, 320, { size: 10.5, color: "rgba(160,195,215,.6)" });

  pill(ctx, 30, 88, "h = " + fmt(s.h, 0) + " m · g = 9,81 m/s²", { bg: "rgba(90,169,255,.10)", border: "rgba(90,169,255,.32)", color: "#b9dcff" });
  text(ctx, "t = √(2h/g) · v = gt · havo qarshiligi hisobga olinmagan", 30, 518, { size: 10.5, color: "rgba(150,195,215,.55)" });
}

/* ============================================================
   ASTRONOMIYA — sayyoralar orbitalari
   ============================================================ */

function drawAstronomy(ctx, s, time) {
  subjectBg(ctx, "ASTRONOMIYA", "Sayyoralar orbitalari", "T² ∝ a³");

  const cx = 470, cy = 290;
  const R = a => 85 + 30 * Math.pow(a, 0.62);
  const selected = s.planet || "earth";
  const keys = Object.keys(PLANETS);

  keys.forEach(key => {
    const p = PLANETS[key];
    ctx.beginPath();
    ctx.arc(cx, cy, R(p.a), 0, TAU);
    if (key === selected) {
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(178,141,255,.45)";
      ctx.lineWidth = 1.5;
    } else {
      ctx.setLineDash([3, 8]);
      ctx.strokeStyle = "rgba(150,205,235,.14)";
      ctx.lineWidth = 1;
    }
    ctx.stroke();
  });
  ctx.setLineDash([]);

  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 92);
  glow.addColorStop(0, "rgba(255,221,130,.75)");
  glow.addColorStop(.3, "rgba(245,184,75,.22)");
  glow.addColorStop(1, "rgba(245,184,75,0)");
  ctx.beginPath(); ctx.arc(cx, cy, 92, 0, TAU); ctx.fillStyle = glow; ctx.fill();
  const sun = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 22);
  sun.addColorStop(0, "#fff4c9");
  sun.addColorStop(.5, "#ffd46b");
  sun.addColorStop(1, "#d98f28");
  ctx.beginPath(); ctx.arc(cx, cy, 21, 0, TAU); ctx.fillStyle = sun; ctx.fill();
  text(ctx, "Quyosh", cx, cy + 40, { size: 9.5, align: "center", color: "rgba(245,200,120,.75)", weight: 600 });

  keys.forEach((key, idx) => {
    const p = PLANETS[key];
    const T = Math.sqrt(Math.pow(p.a, 3));
    const rrOrbit = R(p.a);
    const ang = idx * 1.15 + time * s.speed * 0.55 / Math.pow(T, 0.62);
    const x = cx + rrOrbit * Math.cos(ang);
    const y = cy + rrOrbit * Math.sin(ang);

    if (key === selected) {
      ctx.beginPath();
      ctx.arc(cx, cy, rrOrbit, ang - 0.38, ang);
      ctx.strokeStyle = "rgba(178,141,255,.55)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, TAU);
      ctx.fillStyle = "rgba(178,141,255,.14)";
      ctx.fill();
      ctx.strokeStyle = "rgba(178,141,255,.65)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const rad = key === selected ? 7 : 4.2;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fillStyle = p.color;
    ctx.fill();

    if (key === selected) {
      text(ctx, p.name, clamp(x + 14, 30, 885), y - 10, { size: 11, weight: 700, color: "#d9c7ff" });
    }
  });

  const p = PLANETS[selected] || PLANETS.earth;
  const T = Math.sqrt(Math.pow(p.a, 3));
  const days = T * 365.25;
  const v = TAU * p.a * 149.6e6 / (T * 365.25 * 86400);

  pill(ctx, 30, 88, p.name + " · a = " + fmt(p.a, 3) + " AU", { bg: "rgba(178,141,255,.10)", border: "rgba(178,141,255,.34)", color: "#d9c7ff" });
  pill(ctx, 30, 120, "T = " + fmt(T, 2) + " yil = " + fmt(days, 0) + " kun", { bg: "rgba(178,141,255,.10)", border: "rgba(178,141,255,.34)", color: "#d9c7ff" });
  pill(ctx, 30, 152, "v = " + fmt(v, 2) + " km/s", { bg: "rgba(178,141,255,.10)", border: "rgba(178,141,255,.34)", color: "#d9c7ff" });

  text(ctx, "Kepler: T² = a³ · orbita radiusi bo‘yicha barcha sayyoralar bir xil qonunga bo‘ysunadi", 30, 518, { size: 10.5, color: "rgba(150,195,215,.55)" });
}

/* ============================================================
   EKOLOGIYA — suv filtri
   ============================================================ */

function drawEcology(ctx, s, time, dt) {
  subjectBg(ctx, "EKOLOGIYA", "Suvni tozalash filtri", "C = C₀(1 − η)ⁿ");

  const keep = Math.pow(1 - s.eff / 100, s.passes);
  const c = s.c0 * keep;
  const pct = (1 - keep) * 100;
  const cTxt = c >= 1 ? fmt(c, 1) : c >= 0.01 ? fmt(c, 2) : fmt(c, 3);
  const x = 310, y = 120, w = 190, h = 310;
  const innerX = x + 8, innerY = y + 8, innerW = w - 16, innerH = h - 16;
  const murk = clamp(s.c0 / 800, 0, 1);

  ctx.strokeStyle = "rgba(150,205,235,.3)";
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(230, 105); ctx.lineTo(370, 105); ctx.lineTo(370, 124); ctx.stroke();
  ctx.strokeStyle = "rgba(10,25,38,1)";
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(230, 105); ctx.lineTo(370, 105); ctx.lineTo(370, 124); ctx.stroke();

  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = "rgba(8,20,32,.7)";
  ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  rr(ctx, innerX, innerY, innerW, innerH, 7);
  ctx.clip();

  ctx.fillStyle = "rgba(120,95,55," + (0.2 + 0.48 * murk) + ")";
  ctx.fillRect(innerX, innerY, innerW, 118);

  if (!s.parts) {
    s.parts = Array.from({ length: 44 }, (_, i) => ({
      x: 326 + (i * 37) % 156,
      y: 138 + (i * 29) % 96,
      v: 16 + (i * 13) % 24,
      hold: 0
    }));
  }
  const d = dt || 0.016;
  s.parts.forEach((p, i) => {
    if (p.hold > 0) {
      p.hold -= d;
      if (p.hold <= 0) {
        p.y = 136;
        p.x = 326 + (i * 37 + Math.floor(time / 5) * 17) % 156;
        p.hold = 0;
      }
    } else {
      p.y += p.v * d;
      if (p.y > 241) { p.y = 241; p.hold = 0.25 + (i % 5) * 0.11; }
    }
    if (p.y <= 243) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4 + (i % 3) * 0.5, 0, TAU);
      ctx.fillStyle = "rgba(205,172,118,.62)";
      ctx.fill();
    }
  });

  ctx.fillStyle = "#6f6558";
  ctx.fillRect(innerX, 245, innerW, 35);
  for (let i = 0; i < 60; i++) {
    const gx = innerX + (i * 53) % innerW;
    const gy = 249 + (i * 31) % 27;
    ctx.beginPath(); ctx.arc(gx, gy, 2 + (i % 3) * 0.6, 0, TAU);
    ctx.fillStyle = i % 2 ? "#8b7d6b" : "#5d554a"; ctx.fill();
  }

  ctx.fillStyle = "#c2a86a";
  ctx.fillRect(innerX, 280, innerW, 50);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 2 ? "rgba(120,95,45,.55)" : "rgba(238,220,166,.55)";
    ctx.fillRect(innerX + (i * 29) % innerW, 284 + (i * 17) % 42, 1.4, 1.4);
  }

  ctx.fillStyle = "#30343a";
  ctx.fillRect(innerX, 330, innerW, 40);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = i % 3 ? "rgba(12,14,17,.7)" : "rgba(100,105,112,.5)";
    ctx.fillRect(innerX + (i * 41) % innerW, 334 + (i * 19) % 32, 2.2, 1.5);
  }

  ctx.fillStyle = "rgba(90,105,115,.65)";
  ctx.fillRect(innerX, 370, innerW, 5);
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = "rgba(8,18,28,.6)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(innerX + i * 12, 370); ctx.lineTo(innerX + i * 12, 375); ctx.stroke();
  }

  ctx.fillStyle = "rgba(70,175,190,.22)";
  ctx.fillRect(innerX, 375, innerW, innerH - 247);

  ctx.restore();

  rr(ctx, x, y, w, h, 10);
  ctx.strokeStyle = "rgba(150,205,235,.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const layerLabels = [
    ["shag‘al", 262],
    ["qum", 305],
    ["ko‘mir", 350]
  ];
  layerLabels.forEach(([label, ly]) => {
    ctx.strokeStyle = "rgba(150,205,235,.3)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(500, ly); ctx.lineTo(510, ly); ctx.stroke();
    text(ctx, label, 516, ly + 4, { size: 10, color: "rgba(180,210,225,.65)" });
  });

  ctx.strokeStyle = "#66798a";
  ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(492, 404); ctx.lineTo(620, 404); ctx.lineTo(650, 380); ctx.stroke();
  ctx.strokeStyle = "#0a1a28";
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(492, 404); ctx.lineTo(620, 404); ctx.lineTo(650, 380); ctx.stroke();

  const beakerX = 612, beakerY = 352, beakerW = 144, beakerH = 96;
  const waterH = 18 + s.volume / 100 * 42;
  ctx.fillStyle = "rgba(80,200,195,.34)";
  ctx.fillRect(beakerX + 10, beakerY + beakerH - 8 - waterH, beakerW - 20, waterH);
  ctx.strokeStyle = "rgba(150,215,225,.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(beakerX, beakerY);
  ctx.lineTo(beakerX, beakerY + beakerH);
  ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
  ctx.lineTo(beakerX + beakerW, beakerY);
  ctx.stroke();
  text(ctx, "toza suv", beakerX + beakerW / 2, beakerY + beakerH - 12, { size: 9.5, align: "center", color: "rgba(170,230,230,.75)" });

  const drip = (time % 1.1) / 1.1;
  ctx.beginPath();
  ctx.arc(650, 386 + drip * 22, 2.6, 0, TAU);
  ctx.fillStyle = "rgba(110,215,220,.75)";
  ctx.fill();

  const chartX = 790, chartY = 170, chartW = 140;
  text(ctx, "LOYQALIK", chartX, chartY, { size: 9.5, weight: 750, color: "rgba(150,200,220,.6)" });
  const maxC = Math.max(800, s.c0);
  const barW = 100;
  [["C₀", s.c0, "#c2a86a", chartY + 22], ["C", c, "#5ee08a", chartY + 76]].forEach(([label, val, color, by]) => {
    text(ctx, label, chartX, by + 10, { size: 10, mono: true, color: "rgba(180,210,225,.75)" });
    rr(ctx, chartX + 24, by, barW, 16, 4);
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.fill();
    const ww = Math.max(2, barW * val / maxC);
    rr(ctx, chartX + 24, by, ww, 16, 4);
    ctx.fillStyle = color;
    ctx.fill();
    text(ctx, label === "C" ? cTxt : fmt(val, 0), chartX + 24, by + 30, { size: 9.5, mono: true, color: "rgba(190,215,230,.7)" });
  });

  pill(ctx, 30, 88, "C₀ = " + fmt(s.c0, 0) + " mg/L", { bg: "rgba(94,224,138,.09)", border: "rgba(94,224,138,.3)", color: "#aef0c4" });
  pill(ctx, 205, 88, "η = " + fmt(s.eff, 0) + "% × " + fmt(s.passes, 0), { bg: "rgba(94,224,138,.09)", border: "rgba(94,224,138,.3)", color: "#aef0c4" });
  pill(ctx, 930, 88, "C = " + cTxt + " mg/L", { align: "right", bg: "rgba(94,224,138,.13)", border: "rgba(94,224,138,.42)", color: "#bdf7d2" });

  text(ctx, "Tozalash darajasi " + fmt(pct, 1) + "% · ushlab qolingan massa " + fmt((s.c0 - c) * s.volume / 1000, 2) + " g", 30, 518, { size: 10.5, color: "rgba(150,195,215,.55)" });
}

/* ============================================================
   QUYMAKORLIK — quyish va qotish
   ============================================================ */

function metalColor(k) {
  if (k > 0.6) return mixHex("#ff8a3d", "#ffd36b", (k - 0.6) / 0.4);
  if (k > 0.25) return mixHex("#c94a2e", "#ff8a3d", (k - 0.25) / 0.35);
  return mixHex("#6f7b88", "#c94a2e", k / 0.25);
}

function drawCasting(ctx, s, time) {
  const m = METALS[s.metal] || METALS.alu;
  const Tp = m.tm + s.superheat;
  const M = s.d / 20;
  const tq = m.B * M * M;

  subjectBg(ctx, "QUYMAKORLIK", "Quyish va qotish", "Chvorinov: t = B·M²");

  const cycle = 7.5, pourT = 2.4, coolEnd = 6.6;
  const tt = time % cycle;
  const fill = clamp(tt / pourT, 0, 1);
  const cool = clamp((tt - pourT) / (coolEnd - pourT), 0, 1);
  const T = Tp - (Tp - (m.tm - 140)) * cool;
  const k = clamp((T - (m.tm - 140)) / (Tp - (m.tm - 140)), 0, 1);
  const col = metalColor(k);

  const mx = 250, mw = 400, mtop = 210, mbot = 430;
  const th = clamp(s.d * 1.4, 14, 84);
  const cy = 300;
  const cavX = 300, cavW = 300;

  ctx.fillStyle = "rgba(90,105,120,.20)";
  ctx.fillRect(mx, mtop, mw, cy - mtop);
  ctx.fillRect(mx, cy + th, mw, mbot - (cy + th));
  hatchRect(ctx, mx, mtop, mw, cy - mtop, "rgba(150,190,210,.10)");
  hatchRect(ctx, mx, cy + th, mw, mbot - (cy + th), "rgba(150,190,210,.10)");
  ctx.strokeStyle = "rgba(150,205,235,.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, mtop, mw, cy - mtop);
  ctx.strokeRect(mx, cy + th, mw, mbot - (cy + th));

  if (fill > 0) {
    ctx.fillStyle = col;
    ctx.fillRect(298, mtop, 24, cy - mtop);
    ctx.fillRect(cavX, cy, cavW * fill, th);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(cavX, cy + 2, cavW * fill, 2.5);
  }

  ctx.strokeStyle = "rgba(245,184,75,.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 6]);
  ctx.strokeRect(cavX, cy, cavW, th);
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(20,33,44,.95)";
  ctx.beginPath();
  ctx.moveTo(362, 96); ctx.lineTo(470, 96); ctx.lineTo(454, 146); ctx.lineTo(378, 146);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.35)";
  ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = k > .5 ? "#ffca55" : "#ff7a3d";
  ctx.beginPath(); ctx.ellipse(416, 101, 43, 5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.45)";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(468, 104); ctx.lineTo(530, 82); ctx.stroke();

  if (fill < 1) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(444, 142); ctx.lineTo(310, 210); ctx.stroke();
    ctx.strokeStyle = "rgba(255,240,190,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(444, 142); ctx.lineTo(310, 210); ctx.stroke();
  }

  text(ctx, "QOLIP", 262, 230, { size: 9.5, weight: 700, color: "rgba(150,200,220,.55)" });
  text(ctx, "quyma", cavX + 8, cy - 5, { size: 9.5, color: "rgba(245,215,150,.7)" });

  const tx = 806, ttop = 150, tbot = 420;
  rr(ctx, tx, ttop, 18, 270, 9);
  ctx.fillStyle = "rgba(255,255,255,.035)";
  ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const level = tbot - clamp(T / 2000, 0, 1) * 258;
  ctx.fillStyle = "#ff6b4a";
  ctx.fillRect(tx + 4, level, 10, tbot - 4 - level);
  for (let i = 0; i <= 4; i++) {
    const val = i * 500;
    const yy = tbot - (val / 2000) * 258;
    ctx.strokeStyle = "rgba(150,205,235,.28)";
    ctx.beginPath(); ctx.moveTo(tx - 4, yy); ctx.lineTo(tx, yy); ctx.stroke();
    text(ctx, String(val), tx - 9, yy + 3, { size: 9, align: "right", mono: true, color: "rgba(160,195,215,.55)" });
  }
  text(ctx, fmt(T, 0) + " °C", tx + 9, ttop - 12, { size: 13, align: "center", mono: true, weight: 650, color: "#ffc9a8" });

  pill(ctx, 30, 88, "Tᵩ = " + fmt(Tp, 0) + " °C", { bg: "rgba(245,184,75,.10)", border: "rgba(245,184,75,.34)", color: "#f8d79c" });
  pill(ctx, 30, 120, "t = " + fmt(tq, 1) + " s", { bg: "rgba(245,184,75,.10)", border: "rgba(245,184,75,.34)", color: "#f8d79c" });
  pill(ctx, 30, 152, "M = " + fmt(M, 2) + " sm", { bg: "rgba(245,184,75,.10)", border: "rgba(245,184,75,.34)", color: "#f8d79c" });

  text(ctx, "QOTISH JARAYONI", 250, 452, { size: 9.5, weight: 700, color: "rgba(150,200,220,.6)" });
  rr(ctx, 250, 460, 400, 9, 4.5);
  ctx.fillStyle = "rgba(255,255,255,.04)";
  ctx.fill();
  if (cool > 0) {
    rr(ctx, 250, 460, 400 * cool, 9, 4.5);
    ctx.fillStyle = col;
    ctx.fill();
  }
  text(ctx, fmt(cool * 100, 0) + "%", 662, 469, { size: 10, mono: true, color: "rgba(245,215,150,.8)" });

  text(ctx, "Chvorinov qoidasi: t = B·(V/A)² · qalinlik 2 marta oshsa, qotish vaqti 4 marta ortadi", 30, 518, { size: 10.5, color: "rgba(150,195,215,.55)" });
}

/* ============================================================
   MASHINASOZLIK — tishli uzatma
   ============================================================ */

function drawGear(ctx, cx, cy, r, teeth, angle, accent) {
  const th = clamp(6 + r * 0.035, 7, 13);
  const step = TAU / teeth;
  const tw = Math.max(3.5, 2 * r * Math.sin(step / 2) * 0.62);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  for (let i = 0; i < teeth; i++) {
    ctx.save();
    ctx.rotate(i * step);
    ctx.fillStyle = hexA(accent, .8);
    ctx.fillRect(-tw / 2, -r - th + 1, tw, th + 2);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = hexA(accent, .15);
  ctx.fill();
  ctx.strokeStyle = hexA(accent, .85);
  ctx.lineWidth = 2;
  ctx.stroke();

  if (r > 45) {
    ctx.strokeStyle = hexA(accent, .4);
    ctx.lineWidth = Math.max(4, r * 0.055);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
      ctx.lineTo(Math.cos(a) * (r - 10), Math.sin(a) * (r - 10));
      ctx.stroke();
    }
  }

  const hub = clamp(r * 0.16, 10, 19);
  ctx.beginPath();
  ctx.arc(0, 0, hub, 0, TAU);
  ctx.fillStyle = "#08131e";
  ctx.fill();
  ctx.strokeStyle = hexA(accent, .9);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawGears(ctx, s, time) {
  subjectBg(ctx, "MASHINASOZLIK", "Tishli uzatma", "m = 4 mm · η = 0,97");

  const sum = 200, cx = 480, cy = 320;
  const r1 = sum * s.z1 / (s.z1 + s.z2);
  const r2 = sum - r1;
  const x1 = cx - sum / 2, x2 = cx + sum / 2;
  const i = s.z2 / s.z1;
  const n2 = s.n1 / i;
  const M2 = s.M1 * i * 0.97;
  const v = Math.PI * 4 * s.z1 * (s.n1 / 60) / 1000;

  ctx.setLineDash([4, 7]);
  ctx.strokeStyle = "rgba(150,205,235,.14)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x1, cy, r1, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(x2, cy, r2, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);

  const a1 = time * (s.n1 / 600) * 1.1;
  const a2 = -a1 * s.z1 / s.z2 + Math.PI / s.z2;

  drawGear(ctx, x1, cy, r1, s.z1, a1, "#ff8a6b");
  drawGear(ctx, x2, cy, r2, s.z2, a2, "#5aa9ff");

  const cg = ctx.createRadialGradient(x1 + r1, cy, 1, x1 + r1, cy, 20);
  cg.addColorStop(0, "rgba(120,255,220,.55)");
  cg.addColorStop(1, "rgba(120,255,220,0)");
  ctx.beginPath(); ctx.arc(x1 + r1, cy, 20, 0, TAU); ctx.fillStyle = cg; ctx.fill();

  pill(ctx, 30, 86, "KIRISH: z₁ = " + fmt(s.z1, 0) + " · n₁ = " + fmt(s.n1, 0) + " rpm", { bg: "rgba(255,138,107,.10)", border: "rgba(255,138,107,.34)", color: "#ffc2b2" });
  pill(ctx, 930, 86, "CHIQISH: z₂ = " + fmt(s.z2, 0) + " · n₂ = " + fmt(n2, 0) + " rpm", { align: "right", bg: "rgba(90,169,255,.10)", border: "rgba(90,169,255,.34)", color: "#b9dcff" });

  text(ctx, "i = " + fmt(i, 2) + "  ·  M₂ = " + fmt(M2, 1) + " N·m  ·  v = " + fmt(v, 2) + " m/s", cx, 516, { size: 12, align: "center", mono: true, color: "rgba(210,230,240,.8)" });
}

/* ============================================================
   MASHINASOZLIK — texnologik jarayon strukturasi
   ============================================================ */

function drawTechProcess(ctx, s, time) {
  const d = techData(s);
  const T = d.T;
  const accent = T.color;
  subjectBg(ctx, "MASHINASOZLIK · 1-ISH", "Texnologik jarayon strukturasi", T.name + " ishlab chiqarish · N = " + fmt(d.N, 0) + " dona");

  const cy = 300, xStart = 160, shaftW = 400;
  const maxR = 24 + (s.D - 30) * 0.34;
  const lens = [0.25, 0.17, 0.34, 0.24];
  const rads = [0.78, 1, 0.86, 0.62];
  const segs = [];
  let px = xStart;
  lens.forEach((f, i) => {
    const w = shaftW * f;
    const r = maxR * rads[i];
    segs.push({ x: px, w, r });
    px += w;
  });
  const shaftEnd = xStart + shaftW;

  // to‘shama (bed)
  rr(ctx, 50, 412, 578, 15, 5);
  ctx.fillStyle = "rgba(22,46,63,.95)"; ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.26)"; ctx.lineWidth = 1; ctx.stroke();
  rr(ctx, 74, 427, 26, 28, 3); ctx.fillStyle = "rgba(12,28,42,.95)"; ctx.fill();
  rr(ctx, 526, 427, 26, 28, 3); ctx.fill();

  // old qismi (headstock)
  rr(ctx, 50, 250, 92, 162, 10);
  ctx.fillStyle = "rgba(16,38,54,.96)"; ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.24)"; ctx.stroke();
  text(ctx, "16K20", 96, 275, { size: 9, mono: true, align: "center", color: "rgba(160,200,220,.6)" });
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(74 + i * 22, 396, 4, 0, TAU);
    ctx.fillStyle = i === 0 ? hexA(accent, .9) : "rgba(120,160,180,.35)";
    ctx.fill();
  }

  // orqa babka (tailstock)
  rr(ctx, 570, 268, 48, 144, 8);
  ctx.fillStyle = "rgba(16,38,54,.96)"; ctx.fill();
  ctx.strokeStyle = "rgba(150,205,235,.22)"; ctx.stroke();
  rr(ctx, 560, 282, 14, 118, 4);
  ctx.fillStyle = "rgba(110,132,150,.82)"; ctx.fill();
  ctx.strokeStyle = "rgba(200,222,238,.4)"; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(560, cy - 12); ctx.lineTo(548, cy); ctx.lineTo(560, cy + 12); ctx.closePath();
  ctx.fillStyle = "rgba(190,208,222,.75)"; ctx.fill();

  // val (pog‘anali)
  segs.forEach((g, i) => {
    const grad = ctx.createLinearGradient(0, cy - g.r, 0, cy + g.r);
    grad.addColorStop(0, "#e2ebf5");
    grad.addColorStop(0.45, "#a9bacb");
    grad.addColorStop(1, "#58697a");
    rr(ctx, g.x, cy - g.r, g.w, g.r * 2, 3);
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "rgba(220,238,250,.55)"; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(g.x + 2, cy - g.r + 4);
    ctx.lineTo(g.x + g.w - 2, cy - g.r + 4);
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  });

  // shponka o‘yig‘i
  const s3 = segs[2];
  const keyX = s3.x + s3.w * 0.5 - 34;
  rr(ctx, keyX, cy - s3.r + 1, 68, 7, 3);
  ctx.fillStyle = "rgba(20,40,55,.92)"; ctx.fill();
  ctx.strokeStyle = "rgba(120,170,195,.5)"; ctx.stroke();

  // o‘q chizig‘i
  ctx.setLineDash([7, 6]);
  ctx.beginPath(); ctx.moveTo(xStart - 14, cy); ctx.lineTo(shaftEnd + 12, cy);
  ctx.strokeStyle = "rgba(150,205,235,.4)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.setLineDash([]);

  // patron (chuck) aylanadi
  const ang = time * 2.2;
  ctx.beginPath(); ctx.arc(152, cy, 50, 0, TAU);
  ctx.fillStyle = "rgba(26,48,64,.98)"; ctx.fill();
  ctx.strokeStyle = hexA(accent, .55); ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const a = ang + i * TAU / 3;
    ctx.save();
    ctx.translate(152, cy);
    ctx.rotate(a);
    rr(ctx, -7, -50, 14, 18, 3);
    ctx.fillStyle = "rgba(160,185,205,.85)"; ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(152, cy, 15, 0, TAU);
  ctx.fillStyle = "#0a1a27"; ctx.fill();
  ctx.strokeStyle = hexA(accent, .5); ctx.stroke();

  // raqamlangan sirtlar
  const surface = (x, y, num, tx, ty) => {
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(150,205,235,.35)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, 10, 0, TAU);
    ctx.fillStyle = "rgba(8,20,32,.95)"; ctx.fill();
    ctx.strokeStyle = hexA(accent, .6); ctx.stroke();
    text(ctx, String(num), tx, ty + 3.5, { size: 9.5, mono: true, align: "center", color: "#ffd9cf" });
  };
  segs.forEach((g, i) => {
    const mx = g.x + g.w / 2;
    surface(mx, cy - g.r, i + 1, mx, cy - maxR - 38);
    surface(mx, cy + g.r, i + 5, mx, cy + maxR + 42);
  });
  surface(keyX + 26, cy - s3.r + 4, 9, keyX + 54, cy - maxR - 12);
  surface(keyX + 42, cy - s3.r + 4, 10, keyX + 88, cy - maxR - 12);

  // kesuvchi asbob
  const speed = s.type === "ommaviy" ? 1.5 : s.type === "seriyali" ? 0.85 : 0.42;
  const travel = Math.sin(time * speed) * 0.5 + 0.5;
  const toolX = xStart + 46 + travel * (shaftW - 92);
  const seg = segs.find(g => toolX >= g.x && toolX <= g.x + g.w) || segs[1];
  const toolY = cy - seg.r - 3;

  ctx.strokeStyle = "rgba(150,205,235,.18)";
  ctx.beginPath(); ctx.moveTo(64, 176); ctx.lineTo(640, 176); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(toolX, 176); ctx.lineTo(toolX, 196);
  ctx.strokeStyle = "rgba(150,205,235,.28)"; ctx.lineWidth = 2; ctx.stroke();
  rr(ctx, toolX - 30, 182, 60, 20, 5);
  ctx.fillStyle = "rgba(28,52,70,.98)"; ctx.fill();
  ctx.strokeStyle = "rgba(180,215,235,.3)"; ctx.stroke();
  const toolTop = Math.max(208, toolY - 46);
  ctx.beginPath();
  ctx.moveTo(toolX - 34, toolTop);
  ctx.lineTo(toolX + 34, toolTop);
  ctx.lineTo(toolX + 4, toolY);
  ctx.lineTo(toolX - 4, toolY);
  ctx.closePath();
  ctx.fillStyle = "rgba(190,210,225,.9)"; ctx.fill();
  ctx.strokeStyle = "rgba(240,250,255,.7)"; ctx.stroke();

  // uchqun va qirqim
  for (let i = 0; i < 5; i++) {
    const a = -0.6 - i * 0.32 + Math.sin(time * 9 + i) * 0.15;
    const len = 12 + ((i * 7 + Math.floor(time * 10)) % 12);
    ctx.beginPath();
    ctx.moveTo(toolX, toolY);
    ctx.lineTo(toolX + Math.cos(a) * len, toolY + Math.sin(a) * len);
    ctx.strokeStyle = "rgba(255,190,120," + (0.75 - i * 0.12) + ")";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const t0 = (time * 1.6 + i * 0.23) % 1;
    const yy = toolY + t0 * 54;
    const xx = toolX + 10 + Math.sin(t0 * 7 + i) * 12;
    ctx.beginPath();
    ctx.arc(xx, yy, 2.2, 0, TAU);
    ctx.fillStyle = "rgba(255,170,110," + (0.5 * (1 - t0)) + ")";
    ctx.fill();
  }

  // o‘lchamlar
  const dimY = cy + maxR + 28;
  ctx.strokeStyle = "rgba(150,205,235,.45)";
  ctx.beginPath(); ctx.moveTo(xStart, dimY); ctx.lineTo(shaftEnd, dimY); ctx.stroke();
  for (const x of [xStart, shaftEnd]) {
    ctx.beginPath(); ctx.moveTo(x, dimY - 7); ctx.lineTo(x, dimY + 7); ctx.stroke();
  }
  text(ctx, "L = " + fmt(s.L, 0) + " mm", (xStart + shaftEnd) / 2, dimY - 7, { size: 10.5, mono: true, align: "center", color: "rgba(220,238,248,.8)" });
  text(ctx, "Ø" + fmt(s.D, 0) + " mm", 478, cy + 4, { size: 10.5, mono: true, align: "center", color: "rgba(235,246,252,.9)" });

  // o‘ng panel
  panel(ctx, 648, 104, 284, 328, accent);
  text(ctx, "ISHLAB CHIQARISH TURI", 666, 130, { size: 9, color: "rgba(150,195,215,.65)" });
  text(ctx, T.name + " · " + T.batch, 666, 150, { size: 15, color: "#fff1ec" });
  ctx.beginPath(); ctx.moveTo(666, 162); ctx.lineTo(914, 162);
  ctx.strokeStyle = "rgba(150,205,235,.14)"; ctx.stroke();

  const rows = [
    ["Zagotovka", T.blank],
    ["Operatsiyalar", d.route.length + " ta"],
    ["tdona", fmt(d.tDona, 1) + " min"],
    ["Partiya", fmt(d.N, 0) + " dona"],
    ["Tpartiya", fmt(d.Tbatch, 2) + " soat"],
    ["Takt, τ", d.takt ? fmt(d.takt, 1) + " s" : "—"],
    ["Chiqindi", fmt(d.waste, 1) + " %"]
  ];
  rows.forEach((r, i) => {
    const y = 186 + i * 24;
    text(ctx, r[0], 666, y, { size: 10, color: "rgba(160,190,210,.72)" });
    text(ctx, r[1], 914, y, { size: 11.5, mono: true, align: "right", color: i === 2 ? "#ffd9cf" : "rgba(232,243,250,.92)" });
  });

  text(ctx, "STRUKTURA", 666, 372, { size: 9, color: "rgba(150,195,215,.6)" });
  const chain = [["Jarayon", "Operatsiya"], ["O‘rnatish", "O‘tuv"]];
  chain.forEach((line, row) => {
    line.forEach((word, col) => {
      const bx = 666 + col * 108, by = 382 + row * 26;
      rr(ctx, bx, by, 96, 20, 5);
      ctx.fillStyle = "rgba(255,138,107,.07)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,138,107,.26)"; ctx.stroke();
      text(ctx, word, bx + 48, by + 14, { size: 9.5, align: "center", color: "rgba(255,220,210,.82)" });
      if (col === 0) text(ctx, "›", bx + 100, by + 14, { size: 12, align: "center", color: "rgba(255,180,160,.7)" });
    });
  });

  // marshrut
  const route = d.route;
  const n = route.length;
  const rx0 = 46, rx1 = 914, ry = 472;
  const step = (rx1 - rx0) / Math.max(1, n - 1);
  const active = Math.floor(time / 1.5) % n;
  ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(rx1, ry);
  ctx.strokeStyle = "rgba(150,205,235,.22)"; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, "TEXNOLOGIK MARSHRUT", rx0, ry - 26, { size: 9, color: "rgba(150,195,215,.6)" });

  route.forEach((o, i) => {
    const x = rx0 + i * step;
    const on = i === active;
    ctx.beginPath(); ctx.arc(x, ry, 13, 0, TAU);
    ctx.fillStyle = on ? hexA(accent, .22) : "rgba(8,20,32,.96)"; ctx.fill();
    ctx.strokeStyle = on ? accent : "rgba(150,205,235,.32)";
    ctx.lineWidth = on ? 2 : 1;
    ctx.stroke();
    text(ctx, o.n, x, ry + 4, { size: 9, mono: true, align: "center", color: on ? "#fff4ef" : "rgba(180,205,220,.7)" });
    text(ctx, o.name, x, ry + 32, { size: 9.5, align: "center", color: on ? "rgba(255,225,215,.95)" : "rgba(160,190,210,.65)" });
    if (i < n - 1) {
      text(ctx, "→", x + step / 2, ry + 4, { size: 10, align: "center", color: "rgba(150,205,235,.28)" });
    }
  });

  text(ctx, "Jarayon → operatsiya → o‘rnatish → o‘tuv · Tpartiya = (Tпз + N·tdona) / 60", 46, 528, { size: 10, color: "rgba(150,195,215,.55)" });
}

/* ============================================================
   NAZARIY MEXANIKA — qiyshiq tekislik
   ============================================================ */

function drawIncline(ctx, s, time) {
  subjectBg(ctx, "NAZARIY MEXANIKA", "Qiyshiq tekislikda harakat", "g = 9,81 m/s²");

  const rad = s.alpha * Math.PI / 180;
  const Fg = s.m * G;
  const N = Fg * Math.cos(rad);
  const Fpull = Fg * Math.sin(rad);
  const Ffr = s.mu * N;
  const a = G * (Math.sin(rad) - s.mu * Math.cos(rad));
  const moves = a > 0.001;
  const L = s.h / Math.sin(rad);
  const tq = moves ? Math.sqrt(2 * L / a) : 0;
  const v = moves ? Math.sqrt(2 * a * L) : 0;

  const x0 = 150, gy = 455;
  const hPx = Math.min(120 + s.h * 28, 700 * Math.tan(rad));
  const base = hPx / Math.tan(rad);
  const yTop = gy - hPx;
  const xEnd = x0 + base;

  const grd = ctx.createLinearGradient(x0, yTop, xEnd, gy);
  grd.addColorStop(0, "rgba(90,140,170,.30)");
  grd.addColorStop(1, "rgba(45,80,105,.45)");
  ctx.beginPath();
  ctx.moveTo(x0, yTop);
  ctx.lineTo(x0, gy);
  ctx.lineTo(xEnd, gy);
  ctx.closePath();
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.strokeStyle = "rgba(150,215,235,.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(150,205,235,.3)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(80, gy); ctx.lineTo(930, gy); ctx.stroke();
  ctx.strokeStyle = "rgba(150,205,235,.14)";
  ctx.lineWidth = 1;
  for (let x = 90; x < 930; x += 26) {
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + 12, gy + 10); ctx.stroke();
  }

  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = "rgba(150,205,235,.3)";
  ctx.beginPath(); ctx.moveTo(112, yTop); ctx.lineTo(112, gy); ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, "h = " + fmt(s.h, 1) + " m", 102, (yTop + gy) / 2, { size: 10, align: "right", mono: true, color: "rgba(180,210,225,.65)" });

  ctx.beginPath();
  ctx.moveTo(x0 + 78, gy);
  ctx.arc(x0, gy, 78, -rad, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(245,138,194,.10)";
  ctx.fill();
  ctx.strokeStyle = "rgba(245,138,194,.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  text(ctx, "α = " + fmt(s.alpha, 0) + "°", x0 + 86, gy - 20, { size: 11, color: "#ffc0df", weight: 700 });

  const ux = Math.cos(rad), uy = Math.sin(rad);
  const nx = Math.sin(rad), ny = -Math.cos(rad);
  const slopeLen = Math.hypot(base, hPx);
  const travel = Math.max(0, slopeLen - 110);
  const cycle = 5.2;
  const p = moves ? clamp(((time % cycle) - 0.8) / 2.8, 0, 1) : 0;
  const sPos = 48 + p * travel;
  const sx = x0 + ux * sPos, sy = yTop + uy * sPos;
  const cx = sx + nx * 18, cy = sy + ny * 18;

  if (moves) {
    for (let k = 1; k <= 3; k++) {
      const pp = Math.max(0, p - k * 0.06);
      const px = x0 + ux * (48 + pp * travel), py = yTop + uy * (48 + pp * travel);
      ctx.beginPath();
      ctx.arc(px + nx * 17, py + ny * 17, 6 - k, 0, TAU);
      ctx.fillStyle = "rgba(245,138,194," + (0.16 - k * 0.035) + ")";
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(rad);
  rr(ctx, -27, -36, 54, 36, 4);
  ctx.fillStyle = "#b9815a";
  ctx.fill();
  ctx.strokeStyle = "#e2b28c";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  arrow(ctx, cx, cy, cx, cy + 48, "#f5b84b", 2.5, 8);
  text(ctx, "mg", cx + 7, cy + 55, { size: 10, color: "#f8d79c", weight: 700, mono: true });

  arrow(ctx, cx, cy, cx + nx * 48, cy + ny * 48, "#5aa9ff", 2.5, 8);
  text(ctx, "N", cx + nx * 48 + 6, cy + ny * 48 - 4, { size: 10, color: "#9fd0ff", weight: 700, mono: true });

  const fLen = clamp(Ffr / Math.max(Fpull, 0.001), 0, 1) * 42 + 8;
  arrow(ctx, cx, cy, cx - ux * fLen, cy - uy * fLen, "#ff6b6b", 2.5, 8);
  text(ctx, "Fᵢ", cx - ux * fLen - 12, cy - uy * fLen - 4, { size: 10, color: "#ffadad", weight: 700, mono: true });

  if (moves) {
    const aLen = clamp(a / G, 0, 1) * 52 + 12;
    const ox = cx + nx * 13, oy = cy + ny * 13;
    arrow(ctx, ox, oy, ox + ux * aLen, oy + uy * aLen, "#5ee08a", 2.5, 8);
    text(ctx, "a", ox + ux * aLen + nx * 8, oy + uy * aLen + ny * 8, { size: 10, color: "#a9f0be", weight: 700, mono: true });
  }

  pill(ctx, 30, 86, "α = " + fmt(s.alpha, 0) + "° · m = " + fmt(s.m, 0) + " kg", { bg: "rgba(245,138,194,.10)", border: "rgba(245,138,194,.34)", color: "#ffc0df" });
  pill(ctx, 30, 118, "μ = " + fmt(s.mu, 2) + " · h = " + fmt(s.h, 1) + " m", { bg: "rgba(245,138,194,.10)", border: "rgba(245,138,194,.34)", color: "#ffc0df" });

  panel(ctx, 660, 86, 270, 126, "#f58ac2");
  text(ctx, "NATIJA", 680, 108, { size: 9.5, weight: 750, color: "rgba(150,200,220,.6)" });
  text(ctx, "a = " + (moves ? fmt(a, 2) : "0,00") + " m/s²", 680, 140, { size: 15, mono: true, weight: 650, color: moves ? "#ffd1e8" : "#ff9c9c" });
  text(ctx, "t = " + (moves ? fmt(tq, 2) + " s" : "—"), 680, 168, { size: 14, mono: true, color: "rgba(230,240,248,.85)" });
  text(ctx, "v = " + (moves ? fmt(v, 2) + " m/s" : "—"), 680, 194, { size: 14, mono: true, color: "rgba(230,240,248,.85)" });

  if (!moves) {
    pill(ctx, 900, 470, "mg·sinα ≤ μmg·cosα — blok harakatlanmaydi", { align: "right", bg: "rgba(255,107,107,.10)", border: "rgba(255,107,107,.4)", color: "#ffb3b3" });
  }

  text(ctx, "a = g(sinα − μcosα) · L = h/sinα · t = √(2L/a)", 30, 518, { size: 10.5, color: "rgba(150,195,215,.55)" });
}

/* ============================================================
   KO‘RINISH, BOSHQARUV VA ROUTING
   ============================================================ */

let ctxS = null;
let currentKey = null;

function buildControls(def) {
  const box = $("subject-controls");
  box.innerHTML = "";
  def.controls.forEach(c => {
    const wrap = document.createElement("div");
    wrap.className = "control";

    const row = document.createElement("div");
    row.className = "row";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = c.label;
    row.appendChild(name);
    if (c.type !== "select") {
      const out = document.createElement("output");
      out.dataset.out = c.id;
      row.appendChild(out);
    }
    wrap.appendChild(row);

    let input;
    if (c.type === "select") {
      input = document.createElement("select");
      c.options.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        input.appendChild(opt);
      });
      input.value = def.state[c.id] != null ? def.state[c.id] : c.value;
    } else {
      input = document.createElement("input");
      input.type = "range";
      input.min = c.min;
      input.max = c.max;
      input.step = c.step;
      input.value = def.state[c.id] != null ? def.state[c.id] : c.value;
    }
    input.dataset.control = c.id;
    input.addEventListener(c.type === "select" ? "change" : "input", () => {
      if (c.type === "select" && typeof def.onChange === "function") def.onChange(def, c.id);
      updateSubject(def);
    });
    wrap.appendChild(input);
    box.appendChild(wrap);
  });
}

function readControls(def) {
  def.controls.forEach(c => {
    const input = document.querySelector('[data-control="' + c.id + '"]');
    if (!input) return;
    def.state[c.id] = c.type === "select" ? input.value : +input.value;
    if (c.type !== "select") {
      const out = document.querySelector('[data-out="' + c.id + '"]');
      if (out) out.textContent = fmt(def.state[c.id], c.dec == null ? 1 : c.dec) + (c.unit ? " " + c.unit : "");
    }
  });
}

function updateSubject(def) {
  readControls(def);
  const out = def.compute(def.state);
  def.out = out;

  setText("subject-big", out.big);
  setText("subject-big-label", out.bigLabel || def.bigLabel);
  setText("subject-calc", out.calc);
  $("subject-hint").innerHTML = def.hint;

  $("subject-readout").innerHTML = out.readout.map(r => {
    const unit = r[2] ? '<span class="unit">' + r[2] + "</span>" : "";
    return '<tr' + (r[3] ? ' class="accent"' : "") + "><td>" + r[0] + "</td><td><b>" + r[1] + "</b>" + unit + "</td></tr>";
  }).join("");
}

function labSubjectKey(key) {
  const def = defs[key];
  return def && def.subject ? def.subject : key;
}

function labsOf(key) {
  const subject = labSubjectKey(key);
  return SUBJECT_LABS[subject] || [key];
}

function resolveLab(raw) {
  if (defs[raw]) return raw;
  if (SUBJECT_LABS[raw]) return SUBJECT_LABS[raw][0];
  return null;
}

function renderLabTabs(key) {
  const bar = $("subject-lab-tabs");
  if (!bar) return;
  const labs = labsOf(key);
  if (labs.length < 2) {
    bar.innerHTML = "";
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  bar.innerHTML = labs.map(k => {
    const d = defs[k];
    return '<button type="button" class="lab-tab' + (k === key ? " active" : "") + '" data-lab="' + k + '">' + (d.labLabel || d.title) + "</button>";
  }).join("");
  bar.querySelectorAll("[data-lab]").forEach(btn => {
    btn.addEventListener("click", () => { location.hash = btn.getAttribute("data-lab"); });
  });
}

function renderSubjectNotes(def) {
  const wrap = $("subject-notes");
  if (!wrap) return;
  const hasSteps = def.steps && def.steps.length;
  wrap.hidden = !hasSteps;
  if (!hasSteps) return;
  $("subject-steps").innerHTML = def.steps.map(s => "<li>" + s + "</li>").join("");
  $("subject-questions").innerHTML = (def.questions || []).map(q => "<li>" + q + "</li>").join("");
}

function mountSubject(key) {
  const def = defs[key];
  if (!def) return;
  currentKey = key;
  $("subject-kicker").textContent = def.kicker;
  $("subject-title").textContent = def.title;
  $("subject-goal").innerHTML = def.goal;
  $("subject-stats").innerHTML =
    "<span><b>" + def.equipment.length + "</b> jihoz</span>" +
    "<span><b>" + labsOf(key).length + "</b> laboratoriya</span>" +
    "<span><b>SI</b> birliklar</span>" +
    "<span><b>TXT</b> hisobot</span>";
  $("subject-equipment").innerHTML = def.equipment.map(e => "<li>" + e + "</li>").join("");
  $("subject-canvas").setAttribute("aria-label", def.title);
  renderLabTabs(key);
  renderSubjectNotes(def);
  buildControls(def);
  updateSubject(def);
}

function renderCards() {
  $("subject-grid").innerHTML = CARDS.map(c =>
    '<a class="subject-card" href="#' + c.key + '" style="--accent:' + c.accent + '">' +
      '<span class="subject-icon">' + c.icon + "</span>" +
      "<h3>" + c.name + "</h3>" +
      '<p class="tagline">' + c.tagline + "</p>" +
      '<div class="subject-meta"><span class="count">' + c.count + "</span>" + c.tags.map(t => "<span>" + t + "</span>").join("") + "</div>" +
      '<div class="subject-cta"><b>Laboratoriyani ochish</b><em>→</em></div>' +
    "</a>"
  ).join("");
}

function showView(key) {
  const isHydro = key === "gidrostatika";
  const labKey = resolveLab(key);
  const isSubject = !!labKey;
  $("home-view").classList.toggle("active", !isHydro && !isSubject);
  $("hydro-view").classList.toggle("active", isHydro);
  $("subject-view").classList.toggle("active", isSubject);
  if (isSubject) mountSubject(labKey);
  window.AppNav.set(isHydro ? "hydro" : isSubject ? "subject" : "home");
  window.scrollTo(0, 0);
}

function route() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (raw === "malumotnoma") {
    showView("gidrostatika");
    setTimeout(() => {
      const el = $("malumotnoma");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 60);
    return;
  }
  if (raw === "gidrostatika" || defs[raw] || SUBJECT_LABS[raw]) showView(raw);
  else showView("home");
}

ctxS = initCanvas("subject-canvas");
renderCards();

document.querySelectorAll("[data-home]").forEach(btn => {
  btn.addEventListener("click", () => { location.hash = "home"; });
});
$("nav-home").addEventListener("click", () => { location.hash = "home"; });
$("subject-report").addEventListener("click", () => {
  const def = defs[currentKey];
  if (!def || !def.out) return;
  const report = {
    title: def.name + ". " + def.title,
    goal: def.goal.replace(/<[^>]+>/g, "").replace(/^Maqsad:\s*/, ""),
    equipment: def.equipment.join(", "),
    steps: def.steps || [],
    rows: def.out.readout.map(r => [r[0], r[1] + (r[2] ? " " + r[2] : "")]),
    calc: def.out.calc.split("\n"),
    conclusion: def.out.conclusion || ""
  };
  downloadText("laboratoriya-" + currentKey + ".txt", buildReport(report));
});

window.SubjectRuntime = {
  draw(t, dt) {
    if (!currentKey || !ctxS) return;
    const def = defs[currentKey];
    if (def) def.draw(ctxS, def.state, t, dt);
  }
};

window.addEventListener("hashchange", route);
route();
