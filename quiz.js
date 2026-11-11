"use strict";

/* BILIMNI SINASH — 4 variantli test va viktorina */

(function () {
  const LETTERS = ["A", "B", "C", "D"];

  const BANK = {
    fizika: [
      {
        q: "Havo qarshiligi hisobga olinmasa, balandlik 4 marta oshirilsa tushish vaqti qanday o‘zgaradi?",
        o: ["2 marta ortadi", "4 marta ortadi", "2 marta kamayadi", "o‘zgarmaydi"],
        k: 0,
        e: "t = √(2h/g); h 4 marta oshsa, √4 = 2 marta ortadi."
      },
      {
        q: "Erkin tushishda jism tezligi har sekundda qanchaga ortadi?",
        o: ["9,81 m/s", "4,9 m/s", "19,62 m/s", "o‘zgarmaydi"],
        k: 0,
        e: "v = g·t, demak har sekundda g = 9,81 m/s ga ortadi."
      },
      {
        q: "Havo qarshiligi hisobga olinmasa, bir xil balandlikdan tushgan yengil va og‘ir sharcha qanday tushadi?",
        o: ["Bir vaqtda", "Og‘iri oldin", "Yengili oldin", "Faqat balandlikka bog‘liq"],
        k: 0,
        e: "Erkin tushish tezlanishi massaga bog‘liq emas."
      }
    ],
    "fizika-parchalanish": [
      {
        q: "Bitta yarim yemirilish davri o‘tgach, aktivlik qanday o‘zgaradi?",
        o: ["2 marta kamayadi", "2 marta ortadi", "4 marta kamayadi", "o‘zgarmaydi"],
        k: 0,
        e: "A = A₀·2^(−t/T½); t = T½ bo‘lganda A = A₀/2."
      },
      {
        q: "Ikki yarim yemirilish davridan keyin yadrolarning qancha qismi qoladi?",
        o: ["1/4", "1/2", "1/3", "3/4"],
        k: 0,
        e: "Har davrda 2 marta kamayadi: 1 → 1/2 → 1/4."
      },
      {
        q: "Aktivlikning SI birligi qaysi?",
        o: ["Bekkerel (Bq)", "Kuri (Ci)", "Zivert (Sv)", "Tesla (T)"],
        k: 0,
        e: "1 Bq — sekundiga bitta yemirilish."
      },
      {
        q: "A = A₀·2^(−t/T½) formuladagi T½ nimani bildiradi?",
        o: ["Yarim yemirilish davrini", "To‘liq yemirilish vaqtini", "Yadro radiusini", "O‘rtacha tezlikni"],
        k: 0,
        e: "T½ — aktivlik ikki marta kamayadigan vaqt."
      }
    ],
    "fizika-kollayder": [
      {
        q: "B = E/(0,2998·R) formulada R nimani bildiradi?",
        o: ["Zaryadli zarraning egrilik radiusini", "Kollayder halqasining radiusini", "Detektor uzunligini", "Magnit maydon induksiyasini"],
        k: 0,
        e: "R — magnit maydondagi zarraning traektoriya egrilik radiusi (m)."
      },
      {
        q: "Magnit maydon induksiyasi B ortsa, zarraning egrilik radiusi qanday o‘zgaradi?",
        o: ["Kamayadi", "Ortadi", "O‘zgarmaydi", "Avval ortadi, keyin kamayadi"],
        k: 0,
        e: "R = E/(0,2998·B) — B ortsa, R kamayadi."
      },
      {
        q: "13 TeV nimani bildiradi?",
        o: ["Protonlarning to‘qnashuv energiyasini", "LHC halqasining uzunligini", "Magnit maydon kuchini", "Detektor massasini"],
        k: 0,
        e: "Bu — to‘qnashuvdagi umumiy energiya, 13 teraelektronvolt."
      },
      {
        q: "Ushbu laboratoriyada Higgs bozoni qaysi kanal orqali ko‘rsatilgan?",
        o: ["H → ZZ* → 4ℓ", "H → γγ", "H → bb", "H → WW → 2ℓ"],
        k: 0,
        e: "Detektorda to‘rtta lepton izi — H → ZZ* → 4ℓ kanali."
      }
    ]
  };

  const HYDRO_META = {
    "hydro-1": { subject: "Gidravlika", title: "1-laboratoriya. Suyuqlik bosimi va chuqurlik" },
    "hydro-2": { subject: "Gidravlika", title: "2-laboratoriya. Gidravlik press" },
    "hydro-3": { subject: "Gidravlika", title: "3-laboratoriya. Arximed kuchi" },
    "hydro-4": { subject: "Gidravlika", title: "4-laboratoriya. Torricelli qonuni" },
    "hydro-5": { subject: "Gidravlika", title: "5-laboratoriya. Zichlikni aniqlash" },
    "hydro-6": { subject: "Gidravlika", title: "6-laboratoriya. Quvur torayishi" }
  };

  function liquidOptions() {
    return Object.keys(LIQUIDS).map(k => ({ value: k, label: LIQUIDS[k].name }));
  }

  function solidOptions() {
    return Object.keys(SOLIDS).map(k => ({ value: k, label: SOLIDS[k].name }));
  }

  /* Zichlikni dinamometr bilan aniqlashda faqat cho‘kadigan jismlar mos keladi */
  function denseSolidOptions() {
    return Object.keys(SOLIDS)
      .filter(k => SOLIDS[k].rho > 1030)
      .map(k => ({ value: k, label: SOLIDS[k].name }));
  }

  /* Gidravlika laboratoriyalari uchun hisob modellari */
  const HYDRO_DEFS = {
    "hydro-1": {
      state: { liquid: "water", h: 0.8 },
      controls: [
        { id: "liquid", label: "Suyuqlik", type: "select", value: "water", options: liquidOptions() },
        { id: "h", label: "Datchik chuqurligi, h", type: "range", min: 0.05, max: 1.5, step: 0.05, value: 0.8, unit: "m", dec: 2 }
      ],
      compute(s) {
        const rho = LIQUIDS[s.liquid].rho;
        const p = rho * G * (+s.h);
        return {
          readout: [
            ["Suyuqlik zichligi, ρ", fmt(rho, 0), "kg/m³"],
            ["Chuqurlik, h", fmt(+s.h, 2), "m"],
            ["Bosim, p", fmt(p, 0), "Pa"],
            ["Bosim, p", fmt(p / 1000, 2), "kPa", true]
          ]
        };
      }
    },

    "hydro-2": {
      state: { f1: 100, d1: 6, d2: 18 },
      controls: [
        { id: "f1", label: "Kichik porshenga kuch, F₁", type: "range", min: 20, max: 500, step: 20, value: 100, unit: "N", dec: 0 },
        { id: "d1", label: "Kichik porshen diametri, d₁", type: "range", min: 3, max: 10, step: 0.5, value: 6, unit: "sm", dec: 1 },
        { id: "d2", label: "Katta porshen diametri, d₂", type: "range", min: 8, max: 30, step: 1, value: 18, unit: "sm", dec: 0 }
      ],
      compute(s) {
        const d1 = +s.d1, d2 = +s.d2, f1 = +s.f1;
        const a1 = Math.PI * d1 * d1 / 4;
        const a2 = Math.PI * d2 * d2 / 4;
        const pNcm = f1 / a1;
        const f2 = pNcm * a2;
        const k = a2 / a1;
        const s2 = 6 * a1 / a2;
        const work = f1 * 6 / 100;
        return {
          readout: [
            ["Kichik porshen yuzasi, A₁", fmt(a1, 1), "sm²"],
            ["Katta porshen yuzasi, A₂", fmt(a2, 1), "sm²"],
            ["Bosim, p", fmt(pNcm, 2), "N/sm²"],
            ["Bosim, p", fmt(pNcm * 10, 1), "kPa"],
            ["Katta porshendagi kuch, F₂", fmt(f2, 1), "N", true],
            ["Kuch yutug‘i, K", fmt(k, 2), "marta"],
            ["Katta porshen yo‘li, s₂", fmt(s2, 2), "sm"],
            ["Bajarilgan ish, W", fmt(work, 1), "J"]
          ]
        };
      }
    },

    "hydro-3": {
      state: { solid: "wood", liquid: "water", f: 50 },
      controls: [
        { id: "solid", label: "Jism", type: "select", value: "wood", options: solidOptions() },
        { id: "liquid", label: "Suyuqlik", type: "select", value: "water", options: liquidOptions() },
        { id: "f", label: "Botish ulushi, f", type: "range", min: 10, max: 100, step: 5, value: 50, unit: "%", dec: 0 }
      ],
      compute(s) {
        const rhoS = SOLIDS[s.solid].rho;
        const rhoL = LIQUIDS[s.liquid].rho;
        const V = 0.001;
        const mass = rhoS * V;
        const P = mass * G;
        const FAfull = rhoL * G * V;
        const FA = FAfull * (+s.f) / 100;
        const feq = rhoS / rhoL * 100;
        const Vsub = +s.f * 1000;
        const dh = Vsub / 200;
        return {
          readout: [
            ["Jism massasi, m", fmt(mass, 3), "kg"],
            ["Og‘irlik, P", fmt(P, 2), "N"],
            ["To‘liq botgandagi F_A", fmt(FAfull, 2), "N"],
            ["Hozirgi F_A", fmt(FA, 2), "N", true],
            ["Muvozanat botish ulushi", fmt(feq, 0), "%"],
            ["Sath ko‘tarilishi, Δh", fmt(dh, 1), "sm"]
          ]
        };
      }
    },

    "hydro-4": {
      state: { h: 0.8, d: 6, liquid: "water" },
      controls: [
        { id: "h", label: "Suyuqlik sathi, H", type: "range", min: 0.1, max: 1.5, step: 0.05, value: 0.8, unit: "m", dec: 2 },
        { id: "d", label: "Teshik diametri, d", type: "range", min: 2, max: 12, step: 0.5, value: 6, unit: "mm", dec: 1 },
        { id: "liquid", label: "Suyuqlik", type: "select", value: "water", options: liquidOptions() }
      ],
      compute(s) {
        const h = +s.h, d = +s.d;
        const v = Math.sqrt(2 * G * h);
        const A = Math.PI * Math.pow(d / 1000, 2) / 4;
        const Q = A * v;
        const t1 = 0.001 / Q;
        const range = v * Math.sqrt(2 * 0.7 / G);
        return {
          readout: [
            ["Oqim tezligi, v", fmt(v, 2), "m/s", true],
            ["Teshik yuzasi, A", fmt(A * 1e6, 1), "mm²"],
            ["Sarf, Q", fmt(Q * 1000, 3), "L/s"],
            ["1 L to‘lish vaqti", fmt(t1, 1), "s"],
            ["Oqim masofasi, x", fmt(range, 2), "m"],
            ["Suyuqlik zichligi, ρ", fmt(LIQUIDS[s.liquid].rho, 0), "kg/m³"]
          ]
        };
      }
    },

    "hydro-5": {
      state: { solid: "alu", liquid: "water", V: 100 },
      controls: [
        { id: "solid", label: "Jism", type: "select", value: "alu", options: denseSolidOptions() },
        { id: "liquid", label: "Suyuqlik", type: "select", value: "water", options: liquidOptions() },
        { id: "V", label: "Jism hajmi, V", type: "range", min: 50, max: 200, step: 10, value: 100, unit: "sm³", dec: 0 }
      ],
      compute(s) {
        const V = (+s.V) / 1e6;
        const rhoS = SOLIDS[s.solid].rho;
        const rhoL = LIQUIDS[s.liquid].rho;
        const P1 = rhoS * V * G;
        const FAfull = rhoL * V * G;
        const P2 = Math.max(0, P1 - FAfull);
        const FA = P1 - P2;
        const rhoMeas = FA > 0 ? P1 / FA * rhoL : rhoS;
        const err = (rhoMeas - rhoS) / rhoS * 100;
        return {
          readout: [
            ["Havodagi ko‘rsatish, P₁", fmt(P1, 2), "N"],
            ["To‘liq botgandagi ko‘rsatish, P₂", fmt(P2, 2), "N"],
            ["Arximed kuchi, F_A", fmt(FA, 2), "N", true],
            ["O‘lchangan zichlik, ρ", fmt(rhoMeas, 0), "kg/m³"],
            ["Nisbiy xatolik, δ", fmt(err, 1), "%"]
          ]
        };
      }
    },

    "hydro-6": {
      state: { q: 8, dw: 120, d2: 50, liquid: "water" },
      controls: [
        { id: "q", label: "Sarf, Q", type: "range", min: 2, max: 20, step: 1, value: 8, unit: "L/s", dec: 0 },
        { id: "dw", label: "Keng quvur diametri, D", type: "range", min: 80, max: 140, step: 10, value: 120, unit: "mm", dec: 0 },
        { id: "d2", label: "Tor quvur diametri, d₂", type: "range", min: 20, max: 70, step: 5, value: 50, unit: "mm", dec: 0 },
        { id: "liquid", label: "Suyuqlik", type: "select", value: "water", options: liquidOptions() }
      ],
      compute(s) {
        const Q = (+s.q) / 1000;
        const rho = LIQUIDS[s.liquid].rho;
        const Aw = Math.PI * Math.pow((+s.dw) / 1000, 2) / 4;
        const A2 = Math.PI * Math.pow((+s.d2) / 1000, 2) / 4;
        const vw = Q / Aw;
        const v2 = Q / A2;
        const k = rho / 2000;
        const p2 = Math.max(0, 40 - k * (v2 * v2 - vw * vw));
        const dp = 40 - p2;
        return {
          readout: [
            ["Keng quvurdagi tezlik, v₀", fmt(vw, 2), "m/s"],
            ["Tor quvurdagi tezlik, v₂", fmt(v2, 2), "m/s", true],
            ["Tezliklar nisbati, K", fmt(v2 / vw, 2), "marta"],
            ["Tor quvurdagi bosim, p₂", fmt(p2, 1), "kPa"],
            ["Bosim farqi, Δp", fmt(dp, 1), "kPa"],
            ["Keng quvur yuzasi, A₀", fmt(Aw * 1e4, 1), "sm²"]
          ]
        };
      }
    }
  };

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function uniq(list) {
    return list.filter((v, i) => list.indexOf(v) === i);
  }

  function rowValue(row) {
    return row[1] + (row[2] ? " " + row[2] : "");
  }

  function parseNum(str) {
    const m = String(str).replace(/[\u2009\u202f]/g, "").replace(/−/g, "-").match(/-?\d+(?:[.,]\d+)?/);
    return m ? parseFloat(m[0].replace(",", ".")) : NaN;
  }

  function sameValue(a, b) {
    if (a === b) return true;
    const x = parseNum(a);
    const y = parseNum(b);
    return isFinite(x) && isFinite(y) && Math.abs(x - y) < 1e-9;
  }

  function decimalsOf(str) {
    const m = String(str).match(/[.,](\d+)/);
    return m ? m[1].length : 0;
  }

  function snap(v, c) {
    const step = +c.step || 1;
    const x = Math.round((v - c.min) / step) * step + c.min;
    return Math.min(c.max, Math.max(c.min, x));
  }

  function fillOptions(values, correct) {
    const opts = uniq(values);
    const n = parseNum(correct);
    const space = String(correct).indexOf(" ");
    const unit = space > -1 ? String(correct).slice(space) : "";
    const dec = decimalsOf(correct);
    [0.08, -0.08, 0.15, -0.15, 0.25, -0.25, 0.4, -0.4].some(p => {
      if (opts.length >= 4 || !isFinite(n)) return true;
      const v = fmt(n * (1 + p), dec) + unit;
      if (opts.indexOf(v) < 0) opts.push(v);
      return false;
    });
    return opts.slice(0, 4);
  }

  function numericQuestions(def, limit) {
    const out = [];
    if (!def || typeof def.compute !== "function") return out;
    let base;
    try { base = def.compute(def.state); } catch (e) { return out; }
    if (!base || !Array.isArray(base.readout)) return out;

    const controls = (def.controls || []).filter(c =>
      (c.type === "range" && isFinite(c.min) && isFinite(c.max)) ||
      (c.type === "select" && c.id !== "variant" && (c.options || []).length >= 3)
    );

    const groups = [];
    for (let ci = 0; ci < controls.length; ci++) {
      const c = controls[ci];
      let targets;
      if (c.type === "range") {
        targets = [0.18, 0.34, 0.5, 0.66, 0.82, 0.95]
          .map(f => snap(c.min + (c.max - c.min) * f, c))
          .filter((v, i, arr) => arr.indexOf(v) === i && Math.abs(v - (+def.state[c.id] || 0)) > 1e-9)
          .slice(0, 4)
          .map(v => ({ key: String(v), label: fmt(v, c.dec == null ? 0 : c.dec) }));
      } else {
        targets = (c.options || []).slice(0, 4).map(o => ({ key: String(o.value), label: o.label }));
      }
      if (targets.length < 3) continue;

      const outs = targets.map(t => {
        const s = Object.assign({}, def.state);
        s[c.id] = t.key;
        let res = null;
        try { res = def.compute(s); } catch (e) { res = null; }
        return { t: t, out: res };
      });
      if (outs.some(o => !o.out || !Array.isArray(o.out.readout))) continue;

      const group = [];
      for (let r = 0; r < base.readout.length && group.length < 6; r++) {
        const values = outs.map(o => {
          const row = o.out.readout[r];
          return row ? rowValue(row) : "";
        });
        if (values.some(v => !v) || uniq(values).length < 3) continue;
        const rowLabel = base.readout[r][0];
        const picks = shuffle(outs).slice(0, 2);
        for (let pi = 0; pi < picks.length && group.length < 6; pi++) {
          const pick = picks[pi];
          const correct = rowValue(pick.out.readout[r]);
          const echo = pick.t.label + (c.unit ? " " + c.unit : "");
          if (sameValue(correct, echo)) continue;
          const options = fillOptions(values, correct);
          if (options.length < 4) continue;
          const idx = options.indexOf(correct);
          if (idx < 0) continue;
          group.push({
            q: c.label + " = " + pick.t.label + (c.unit ? " " + c.unit : "") +
              " bo‘lganda, “" + rowLabel + "” qanday bo‘ladi?",
            options: options,
            correct: idx,
            why: rowLabel + " = " + correct + "."
          });
        }
      }
      if (group.length) groups.push(group);
    }

    /* Har bir nazoratdan navbatma-navbat olish — savollar xilma-xil bo‘lsin */
    for (let round = 0; out.length < limit; round++) {
      let added = false;
      for (let gi = 0; gi < groups.length && out.length < limit; gi++) {
        if (groups[gi][round]) {
          out.push(groups[gi][round]);
          added = true;
        }
      }
      if (!added) break;
    }
    return out.slice(0, limit);
  }

  function bankQuestions(key) {
    return (BANK[key] || []).map(b => ({
      q: b.q,
      options: b.o.slice(),
      correct: b.k,
      why: b.e || ""
    }));
  }

  function prepare(item) {
    const order = shuffle(item.options.map((_, i) => i));
    return {
      q: item.q,
      options: order.map(i => item.options[i]),
      correct: order.indexOf(item.correct),
      why: item.why || ""
    };
  }

  function labPool(key, count) {
    const def = defs[key];
    const list = bankQuestions(key);
    list.push.apply(list, numericQuestions(def, count));
    return shuffle(list).slice(0, count).map(prepare);
  }

  function hydroPool(key, count) {
    return shuffle(numericQuestions(HYDRO_DEFS[key], count)).slice(0, count).map(prepare);
  }

  function arenaPool(count) {
    const list = [];
    const all = Object.assign({}, defs, HYDRO_DEFS);
    Object.keys(all).forEach(k => {
      const def = all[k];
      if (!def || typeof def.compute !== "function") return;
      const g = numericQuestions(def, 1);
      if (g[0]) list.push(g[0]);
    });
    Object.keys(BANK).forEach(k => {
      list.push.apply(list, bankQuestions(k));
    });
    return shuffle(list).slice(0, count).map(prepare);
  }

  let current = {
    key: null,
    family: "subject",
    meta: null,
    mode: "idle",
    run: null,
    timer: null,
    ui: null
  };

  function el(id) {
    return document.getElementById(id);
  }

  function clearTimer() {
    if (current.timer) {
      clearInterval(current.timer);
      current.timer = null;
    }
    if (current.run && current.run.advance) {
      clearTimeout(current.run.advance);
      current.run.advance = null;
    }
  }

  function clearRun() {
    clearTimer();
    current.run = null;
  }

  function subjectSurface() {
    current.family = "subject";
    current.meta = null;
    current.ui = {
      root: el("subject-quiz-card"),
      list: el("subject-questions"),
      box: el("subject-quiz"),
      defaultMode: "open"
    };
  }

  function setIdle(box) {
    box.hidden = false;
    box.innerHTML = '<p class="quiz-note">Har bir savolda 4 variant. <b>Test</b> — 6 savol izoh bilan, <b>Viktorina</b> — 10 savol, har biriga 15 soniya.</p>';
  }

  function setMode(mode, scroll) {
    if (!current.ui) return;
    current.mode = mode;
    const root = current.ui.root;
    const list = current.ui.list;
    const box = current.ui.box;
    if (root) {
      root.querySelectorAll("[data-quiz-mode]").forEach(b => {
        const on = b.getAttribute("data-quiz-mode") === mode;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
    if (!box) return;
    clearRun();
    box.innerHTML = "";
    if (mode === "open") {
      box.hidden = true;
      if (list) list.hidden = false;
    } else {
      box.hidden = false;
      if (list) list.hidden = true;
      if (mode === "test") startTest();
      else if (mode === "arena") startArena();
      else setIdle(box);
    }
    if (scroll && root) root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function currentPool(count) {
    if (current.family === "hydro") return hydroPool(current.key, count);
    return labPool(current.key, count);
  }

  function startTest() {
    const list = currentPool(6);
    if (!list.length) {
      renderEmpty();
      return;
    }
    current.run = {
      mode: "test",
      list: list,
      i: 0,
      score: 0,
      points: 0,
      streak: 0,
      bestStreak: 0,
      answers: [],
      timed: false,
      locked: false,
      advance: null
    };
    renderQuestion();
  }

  function startArena() {
    const list = arenaPool(10);
    if (!list.length) {
      renderEmpty();
      return;
    }
    current.run = {
      mode: "arena",
      list: list,
      i: 0,
      score: 0,
      points: 0,
      streak: 0,
      bestStreak: 0,
      answers: [],
      timed: true,
      timeLeft: 15,
      timeLimit: 15,
      locked: false,
      advance: null
    };
    renderQuestion();
  }

  function renderEmpty() {
    const box = current.ui && current.ui.box;
    if (!box) return;
    box.innerHTML = '<p class="quiz-note">Bu laboratoriya uchun test savollari hozircha tayyorlanmoqda.</p>';
  }

  function renderQuestion() {
    const run = current.run;
    const box = current.ui && current.ui.box;
    if (!run || !box) return;
    if (run.i >= run.list.length) {
      renderResult();
      return;
    }
    run.locked = false;
    const item = run.list[run.i];
    box.innerHTML = "";

    const top = document.createElement("div");
    top.className = "quiz-top";
    const stage = document.createElement("span");
    stage.textContent = (run.mode === "arena" ? "Viktorina" : "Test") + " · " + run.list.length + " savol";
    top.append(stage);
    if (run.timed) {
      const timer = document.createElement("span");
      timer.className = "quiz-timer";
      timer.id = "quiz-timer";
      timer.textContent = run.timeLeft + " s";
      top.append(timer);
    }
    const meta = document.createElement("b");
    meta.textContent = (run.i + 1) + " / " + run.list.length;
    top.append(meta);

    const bar = document.createElement("div");
    bar.className = "quiz-bar";
    const fill = document.createElement("i");
    fill.style.width = Math.round(run.i / run.list.length * 100) + "%";
    bar.append(fill);

    const q = document.createElement("p");
    q.className = "quiz-q";
    q.textContent = item.q;

    const opts = document.createElement("div");
    opts.className = "quiz-opts";
    item.options.forEach((text, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      const letter = document.createElement("span");
      letter.className = "quiz-letter";
      letter.textContent = LETTERS[idx];
      const label = document.createElement("span");
      label.textContent = text;
      b.append(letter, label);
      b.addEventListener("click", () => answer(idx));
      opts.append(b);
    });

    box.append(top, bar, q, opts);
    if (run.timed) startTimer();
  }

  function startTimer() {
    const run = current.run;
    if (!run || !run.timed) return;
    clearTimer();
    current.timer = setInterval(() => {
      if (!current.run || current.run !== run || run.locked) return;
      run.timeLeft--;
      const t = el("quiz-timer");
      if (t) {
        t.textContent = run.timeLeft + " s";
        t.classList.toggle("hot", run.timeLeft <= 5);
      }
      if (run.timeLeft <= 0) {
        clearInterval(current.timer);
        current.timer = null;
        answer(-1, true);
      }
    }, 1000);
  }

  function answer(idx, timedOut) {
    const run = current.run;
    const box = current.ui && current.ui.box;
    if (!run || !box || run.locked || run.i >= run.list.length) return;
    run.locked = true;
    if (current.timer) {
      clearInterval(current.timer);
      current.timer = null;
    }
    const item = run.list[run.i];
    const correct = idx === item.correct;

    Array.prototype.forEach.call(box.querySelectorAll(".quiz-opt"), (b, i) => {
      b.disabled = true;
      if (i === item.correct) b.classList.add("ok");
      else if (i === idx) b.classList.add("bad");
    });

    if (correct) {
      run.score++;
      run.streak++;
      run.bestStreak = Math.max(run.bestStreak, run.streak);
      run.points += 10 + (run.streak >= 3 ? 5 : 0);
    } else {
      run.streak = 0;
    }
    run.answers.push({
      q: item.q,
      chosen: idx >= 0 ? idx : null,
      correct: item.correct,
      options: item.options
    });

    const note = document.createElement("div");
    note.className = "quiz-note" + (correct ? "" : " bad");
    const lead = document.createElement("b");
    if (timedOut) lead.textContent = "Vaqt tugadi.";
    else lead.textContent = correct ? "To‘g‘ri." : "Xato.";
    note.append(lead, document.createTextNode(" " + (correct ? item.why : "To‘g‘ri javob: " + item.options[item.correct] + ". " + (item.why || ""))));
    box.append(note);

    if (run.timed) {
      run.advance = setTimeout(() => {
        run.advance = null;
        run.i++;
        renderQuestion();
      }, 1400);
    } else {
      const actions = document.createElement("div");
      actions.className = "quiz-actions";
      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn primary";
      next.textContent = run.i + 1 < run.list.length ? "Keyingi savol" : "Natijani ko‘rish";
      next.addEventListener("click", () => {
        run.i++;
        renderQuestion();
      });
      actions.append(next);
      box.append(actions);
    }
  }

  function renderResult() {
    const run = current.run;
    const box = current.ui && current.ui.box;
    if (!run || !box) return;
    clearTimer();
    const total = run.list.length;
    const pct = Math.round(run.score / total * 100);
    const msg = pct >= 90 ? "Ajoyib natija" : pct >= 70 ? "Yaxshi natija" : pct >= 50 ? "O‘rtacha — mavzuni takrorlang" : "Mavzuni yana bir bor ko‘rib chiqing";

    let record = 0;
    try {
      if (run.mode === "arena") {
        record = +localStorage.getItem("vlab-arena-best") || 0;
        if (run.points > record) {
          record = run.points;
          localStorage.setItem("vlab-arena-best", String(record));
        }
      } else {
        const key = "vlab-test-best-" + current.key;
        record = +localStorage.getItem(key) || 0;
        if (pct > record) {
          record = pct;
          localStorage.setItem(key, String(record));
        }
      }
    } catch (e) { record = 0; }

    box.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "quiz-result";
    const kicker = document.createElement("span");
    kicker.className = "quiz-kicker";
    kicker.textContent = run.mode === "arena" ? "Viktorina yakunlandi" : "Test yakunlandi";
    const score = document.createElement("b");
    score.className = "quiz-score";
    score.textContent = run.mode === "arena" ? run.points + " ball" : run.score + " / " + total;
    const line = document.createElement("p");
    line.textContent = run.mode === "arena"
      ? run.score + "/" + total + " to‘g‘ri · seriya " + run.bestStreak + " · rekord " + record + " ball"
      : pct + "% · " + msg + (record ? " · rekord " + record + "%" : "");
    wrap.append(kicker, score, line);

    const actions = document.createElement("div");
    actions.className = "quiz-actions";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "btn primary";
    retry.textContent = "Qayta urinish";
    retry.addEventListener("click", () => {
      setMode(run.mode, false);
    });
    actions.append(retry);

    const other = document.createElement("button");
    other.type = "button";
    other.className = "btn";
    other.textContent = run.mode === "arena" ? "Test" : "Viktorina";
    other.addEventListener("click", () => {
      setMode(run.mode === "arena" ? "test" : "arena", false);
    });
    actions.append(other);

    const exp = document.createElement("button");
    exp.type = "button";
    exp.className = "btn";
    exp.textContent = "Natijani yuklab olish (.txt)";
    exp.addEventListener("click", exportResult);
    actions.append(exp);

    wrap.append(actions);
    box.append(wrap);
  }

  function exportResult() {
    const run = current.run;
    if (!run) return;
    const def = defs[current.key] || {};
    const card = (typeof CARDS !== "undefined" ? CARDS : []).find(c => c.key === def.subject);
    const meta = current.meta;
    const total = run.list.length;
    const pct = Math.round(run.score / total * 100);
    let text = "VirtualLab UZ — bilimni sinash\n\n";
    text += "Fan: " + (meta ? meta.subject : (card ? card.name : def.subject || "—")) + "\n";
    text += "Laboratoriya: " + (meta ? meta.title : (def.name ? def.name + ". " : "") + (def.title || current.key)) + "\n";
    text += "Sana: " + new Date().toLocaleString("uz-UZ") + "\n";
    text += "Rejim: " + (run.mode === "arena" ? "Viktorina" : "Test") + "\n";
    text += "Natija: " + run.score + "/" + total + " (" + pct + "%)\n";
    if (run.mode === "arena") text += "Ball: " + run.points + " · eng uzun seriya: " + run.bestStreak + "\n";
    text += "\nSavollar:\n";
    run.answers.forEach((a, i) => {
      text += (i + 1) + ") " + a.q + "\n";
      text += "   To‘g‘ri javob: " + a.options[a.correct] + "\n";
      if (a.chosen == null) text += "   Sizning javobingiz: — (vaqt tugadi)\n";
      else text += "   Sizning javobingiz: " + a.options[a.chosen] + (a.chosen === a.correct ? " (to‘g‘ri)" : " (xato)") + "\n";
    });
    text += "\nVirtualLab UZ · 2026";
    if (typeof downloadText === "function") {
      downloadText((run.mode === "arena" ? "viktorina-" : "test-") + current.key + ".txt", text);
    }
  }

  function resetUI() {
    clearRun();
    setMode((current.ui && current.ui.defaultMode) || "open", false);
  }

  function injectJump() {
    const report = el("subject-report");
    if (!report || el("subject-quiz-jump")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.id = "subject-quiz-jump";
    b.className = "btn wide";
    b.style.marginTop = "7px";
    b.textContent = "Testni boshlash · 4 variant";
    b.addEventListener("click", () => {
      if (!current.key) return;
      setMode("test", true);
    });
    report.after(b);
  }

  function injectHydro() {
    for (let n = 1; n <= 6; n++) {
      const sec = el("lab" + n);
      if (!sec || sec.querySelector("[data-hq]")) continue;
      const wrap = document.createElement("section");
      wrap.className = "lab-notes hydro-quiz-notes";
      wrap.innerHTML =
        '<div class="notes-grid"><div class="card" data-hq="' + n + '">' +
          '<div class="quiz-head-row"><h3>Bilimni sinash</h3>' +
            '<div class="quiz-switch" role="tablist" aria-label="Bilimni sinash rejimi">' +
              '<button type="button" data-quiz-mode="test" role="tab">Test</button>' +
              '<button type="button" data-quiz-mode="arena" role="tab">Viktorina</button>' +
            '</div>' +
          '</div>' +
          '<div data-hq-box hidden></div>' +
        '</div></div>';
      sec.appendChild(wrap);

      wrap.querySelector(".quiz-switch").addEventListener("click", e => {
        const b = e.target.closest("[data-quiz-mode]");
        if (!b) return;
        mountHydro(n, b.getAttribute("data-quiz-mode"), false);
      });

      const jump = document.createElement("button");
      jump.type = "button";
      jump.className = "btn wide hydro-quiz-jump";
      jump.style.marginTop = "7px";
      jump.textContent = "Testni boshlash · 4 variant";
      jump.addEventListener("click", () => mountHydro(n, "test", true));
      const rep = sec.querySelector('.report-btn[data-report="' + n + '"]');
      if (rep) rep.after(jump);
    }
  }

  function mountHydro(n, mode, scroll) {
    injectHydro();
    const card = document.querySelector('[data-hq="' + n + '"]');
    if (!card) return;
    current.family = "hydro";
    current.key = "hydro-" + n;
    current.meta = HYDRO_META[current.key];
    current.ui = {
      root: card,
      list: null,
      box: card.querySelector("[data-hq-box]"),
      defaultMode: "idle"
    };
    setMode(mode || "idle", !!scroll);
  }

  function hydroActive() {
    const v = el("hydro-view");
    return !!(v && v.classList.contains("active"));
  }

  function boot() {
    injectJump();
    injectHydro();

    const sw = el("quiz-switch");
    if (sw) {
      sw.addEventListener("click", e => {
        const b = e.target.closest("[data-quiz-mode]");
        if (b) setMode(b.getAttribute("data-quiz-mode"), false);
      });
    }

    window.addEventListener("subject:mount", e => {
      if (!e.detail || !e.detail.key) return;
      subjectSurface();
      current.key = e.detail.key;
      resetUI();
    });

    document.addEventListener("click", e => {
      const tab = e.target.closest("#hydro-view .tab[data-lab]");
      if (!tab || !hydroActive()) return;
      mountHydro(+tab.getAttribute("data-lab"), "idle", false);
    });

    window.addEventListener("hashchange", () => {
      clearTimer();
      if (hydroActive()) {
        const n = typeof activeLab !== "undefined" ? activeLab : 1;
        mountHydro(n, "idle", false);
      }
    });

    let key = null;
    try { key = typeof currentKey !== "undefined" ? currentKey : null; } catch (e) { key = null; }
    if (key && defs[key]) {
      subjectSurface();
      current.key = key;
      resetUI();
    } else if (hydroActive()) {
      const n = typeof activeLab !== "undefined" ? activeLab : 1;
      mountHydro(n, "idle", false);
    }
  }

  window.VLabQuiz = {
    bank: BANK,
    hydro: HYDRO_DEFS,
    numericQuestions: numericQuestions,
    labPool: labPool,
    hydroPool: hydroPool,
    arenaPool: arenaPool,
    setMode: setMode,
    mountHydro: mountHydro
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
