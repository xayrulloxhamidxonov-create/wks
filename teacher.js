"use strict";

/* ============================================================
   O‘QITUVCHILAR PANELI (demo)
   - ID/parol bilan kirish (demo hisoblar kod ichida)
   - .pdf / .docx / .txt / .md faylni tahlil qilib virtual ish yasash
   - sinf honasi kodi va talabalarni qabul qilish
   Barcha ma’lumot brauzerning localStorage xotirasida saqlanadi.
   ============================================================ */

(function () {
  const DEMO_TEACHERS = [
    { id: "ustoz01", pass: "demo2026", name: "Xayrullox Hamidxonov" }
  ];
  const ROOMS_KEY = "vlab-classrooms-v1";
  const SESSION_KEY = "vlab-teacher-session";
  const MAX_FILE = 8 * 1024 * 1024;

  const FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    log: Math.log10, ln: Math.log, exp: Math.exp, min: Math.min, max: Math.max,
    round: Math.round, floor: Math.floor, ceil: Math.ceil, pow: Math.pow
  };
  const CONSTS = { pi: Math.PI, g: 9.81, e: Math.E };
  const SYM = { rho: "ρ", eta: "η", mu: "μ", omega: "ω", alpha: "α", beta: "β", lambda: "λ", sigma: "σ" };

  /* Atmosfera tashlamalari laboratoriyasi (RET hisobi) */
  const AIR_GASES = [
    { id: "co", name: "CO", rek: 5, device: "Katalitik neytrallashtirish (CO → CO₂) yoki termik yondirish" },
    { id: "no2", name: "NO₂", rek: 0.085, device: "Ishqoriy eritma bilan absorbsiya yoki katalitik qaytarish" },
    { id: "so2", name: "SO₂", rek: 0.5, device: "Ohakli sut bilan absorbsiya (desulfatsiya)" },
    { id: "nh3", name: "NH₃", rek: 0.2, device: "Suv yoki kislotali eritma bilan absorbsiya" }
  ];
  const AIR_FIELDS = [
    { id: "co", min: 0.001, max: 100000, typ: [3, 60000] },
    { id: "no2", min: 0.001, max: 400, typ: [0.5, 380] },
    { id: "so2", min: 0.001, max: 20000, typ: [3, 1400] },
    { id: "nh3", min: 0.001, max: 5000, typ: [8, 700] },
    { id: "h", min: 2, max: 300, typ: [4, 200] },
    { id: "l", min: 0.05, max: 20, typ: [0.2, 2] },
    { id: "b", min: 0.05, max: 20, typ: [0.2, 2] },
    { id: "w", min: 1, max: 60, typ: [8, 30] },
    { id: "tg", min: 30, max: 200, typ: [50, 120] },
    { id: "tx", min: -20, max: 60, typ: [5, 40] }
  ];
  const AIR_CONSTANTS = { A: 200, F: 1, cfFactor: 0.5 };

  const SAMPLE = {
    title: "Suyuqlik bosimi va chuqurlik",
    goal: "Chuqurlik ortishi bilan gidrostatik bosim qanday o‘zgarishini kuzatish.",
    equipment: ["Shaffof idish", "Bosim datchigi", "O‘lchov chizg‘ichi"],
    formula: "p = rho * g * h",
    result: { label: "Bosim, p", unit: "Pa", dec: 1 },
    variables: [
      { id: "rho", label: "Zichlik, ρ", min: 700, max: 2000, step: 10, value: 1000, unit: "kg/m³" },
      { id: "h", label: "Chuqurlik, h", min: 0.1, max: 2, step: 0.05, value: 0.8, unit: "m" }
    ],
    theory: "Gidrostatik bosim p = ρgh formula bo‘yicha hisoblanadi."
  };

  let teacher = null;
  let rooms = {};
  let current = null;
  let stopAnim = null;
  let busy = false;

  const byId = id => document.getElementById(id);

  /* ---------------- yordamchilar ---------------- */

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  function clean(v, max) {
    return String(v == null ? "" : v)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max || 200);
  }

  function cleanBlock(v, max) {
    return String(v == null ? "" : v)
      .replace(/\r\n?/g, "\n")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
      .trim()
      .slice(0, max || 4000);
  }

  function toNumber(x, fallback) {
    if (typeof x === "number" && isFinite(x)) return x;
    const n = parseFloat(String(x == null ? "" : x).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : fallback;
  }

  function niceStep(raw) {
    if (!isFinite(raw) || raw <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return +(m * p).toFixed(6);
  }

  function autoDec(v) {
    const a = Math.abs(v);
    return a > 0 && a < 1 ? 3 : a < 10 ? 2 : a < 1000 ? 1 : 0;
  }

  function fmtNum(v, dec) {
    if (v == null || !isFinite(v)) return "—";
    const d = dec == null ? autoDec(v) : dec;
    if (typeof window.fmt === "function") {
      try { return window.fmt(v, d); } catch (e) { /* pastga tushadi */ }
    }
    return String(Number(v.toFixed(d)));
  }

  function saveText(name, text) {
    if (typeof window.downloadText === "function") {
      try { window.downloadText(name, text); return; } catch (e) { /* fallback */ }
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------------- formula tahlilchisi ---------------- */

  function normalizeFormula(src) {
    return String(src == null ? "" : src)
      .replace(/[\u2212\u2013\u2014]/g, "-")
      .replace(/[×·∙]/g, "*")
      .replace(/÷/g, "/")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .replace(/√/g, "sqrt")
      .replace(/ρ/g, "rho")
      .replace(/π/g, "pi")
      .replace(/μ/g, "mu")
      .replace(/Δ/g, "d")
      .replace(/η/g, "eta")
      .replace(/ω/g, "omega")
      .replace(/α/g, "alpha")
      .replace(/β/g, "beta")
      .replace(/λ/g, "lambda")
      .replace(/σ/g, "sigma");
  }

  function expandIds(expr, raw) {
    return expr.replace(/[A-Za-z_][A-Za-z0-9_]*/g, run => {
      const low = run.toLowerCase();
      if (SKIP_IDS[low] || run.length < 2) return run;
      const greek = low.match(/^(rho|eta|mu|omega|alpha|beta|lambda|sigma)([a-z]+)$/);
      if (greek) {
        return [greek[1]].concat(greek[2].split("")).join("*");
      }
      if (!/^[A-Za-z]+$/.test(run)) return run;
      const each = run.split("");
      const known = each.every(ch => {
        const c = ch.toLowerCase();
        if (c === "g" || SKIP_IDS[c]) return true;
        return new RegExp("(?:^|[^A-Za-z0-9_])" + c + "\\s*=", "i").test(raw);
      });
      return known ? each.join("*") : run;
    });
  }

  function tokenize(src) {
    const s = String(src);
    const out = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const num = parseFloat(s.slice(i, j));
        if (!isFinite(num)) throw new Error("Son noto‘g‘ri: " + s.slice(i, j));
        out.push({ t: "num", v: num });
        i = j;
        continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        let j = i;
        while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
        out.push({ t: "id", v: s.slice(i, j).toLowerCase() });
        i = j;
        continue;
      }
      if ("+-*/^(),".indexOf(ch) > -1) {
        out.push({ t: ch });
        i++;
        continue;
      }
      throw new Error("Formulada tushunarsiz belgi: " + ch);
    }
    return out;
  }

  function evalFormula(expr, vars) {
    const toks = tokenize(expr);
    let p = 0;
    const peek = () => toks[p] || null;
    const eat = t => {
      if (!peek() || peek().t !== t) throw new Error("Formulada qavs yoki belgi yetishmaydi");
      p++;
    };

    function parseExpr() {
      let v = parseTerm();
      while (peek() && (peek().t === "+" || peek().t === "-")) {
        const op = toks[p++].t;
        const r = parseTerm();
        v = op === "+" ? v + r : v - r;
      }
      return v;
    }

    function parseTerm() {
      let v = parseUnary();
      for (;;) {
        const t = peek();
        if (!t) break;
        if (t.t === "*" || t.t === "/") {
          const op = toks[p++].t;
          const r = parseUnary();
          v = op === "*" ? v * r : v / r;
        } else if (t.t === "num" || t.t === "id" || t.t === "(") {
          v *= parseUnary();
        } else {
          break;
        }
      }
      return v;
    }

    function parseUnary() {
      const t = peek();
      if (t && (t.t === "+" || t.t === "-")) {
        p++;
        const v = parseUnary();
        return t.t === "-" ? -v : v;
      }
      return parsePower();
    }

    function parsePower() {
      const base = parsePrimary();
      if (peek() && peek().t === "^") {
        p++;
        return Math.pow(base, parseUnary());
      }
      return base;
    }

    function parsePrimary() {
      const t = peek();
      if (!t) throw new Error("Formula tugallanmagan");
      if (t.t === "num") { p++; return t.v; }
      if (t.t === "(") {
        p++;
        const v = parseExpr();
        eat(")");
        return v;
      }
      if (t.t === "id") {
        p++;
        const name = t.v;
        if (peek() && peek().t === "(") {
          const fn = FUNCS[name];
          if (!fn) throw new Error("Funksiya noma’lum: " + name);
          p++;
          const args = [];
          if (!(peek() && peek().t === ")")) {
            args.push(parseExpr());
            while (peek() && peek().t === ",") {
              p++;
              args.push(parseExpr());
            }
          }
          eat(")");
          return fn.apply(null, args);
        }
        if (Object.prototype.hasOwnProperty.call(vars, name)) {
          const v = Number(vars[name]);
          if (!isFinite(v)) throw new Error("Qiymat noto‘g‘ri: " + name);
          return v;
        }
        if (Object.prototype.hasOwnProperty.call(CONSTS, name)) return CONSTS[name];
        throw new Error("Noma’lum kattalik: " + name);
      }
      throw new Error("Formulada xato");
    }

    const result = parseExpr();
    if (p < toks.length) throw new Error("Formulada ortiqcha belgi");
    if (!isFinite(result)) throw new Error("Natijani hisoblab bo‘lmadi");
    return result;
  }

  /* ---------------- faylni virtual ishga aylantirish ---------------- */

  function makeRoom(base, fileName) {
    const room = {
      code: "",
      title: clean(base.title, 140) || "Yangi virtual ish",
      goal: clean(base.goal, 400),
      equipment: (base.equipment || []).map(x => clean(x, 100)).filter(Boolean).slice(0, 12),
      theory: cleanBlock(base.theory, 4000),
      variables: base.variables,
      expr: base.expr,
      formulaText: clean(base.formulaText, 300),
      result: base.result || { label: "Natija", unit: "", dec: null },
      readout: base.readout || null,
      teacher: teacher ? teacher.name : "",
      fileName: clean(fileName, 120),
      createdAt: Date.now(),
      participants: []
    };
    setRoomDefaults(room);
    return room;
  }

  function setRoomDefaults(room) {
    const state = {};
    room.variables.forEach(v => { state[v.id] = v.value; });
    if (!room.formulaText) room.formulaText = (room.result.label || "Natija") + " = " + room.expr;
    if (!room.goal) room.goal = "O‘qituvchi yuklagan fayl asosida avtomatik yaratilgan virtual ish.";
    if (!room.result || typeof room.result !== "object") room.result = { label: "Natija", unit: "", dec: null };
    if (!room.result.label) room.result.label = "Natija";
    room.result.unit = clean(room.result.unit, 24);
    const dec = room.result.dec;
    room.result.dec = dec == null || dec === "" ? null : clamp(Math.round(toNumber(dec, 2)), 0, 6);
    evalFormula(room.expr, state);
  }

  function baseName(name) {
    return String(name || "").replace(/\.[^.]+$/, "");
  }

  function roomFromJSON(raw, fileName) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("JSON fayl obyekt ko‘rinishida bo‘lishi kerak.");
    }
    const formula = clean(raw.formula, 300);
    if (!formula) throw new Error("JSON faylda \"formula\" maydoni topilmadi.");
    let expr = formula;
    let label = "";
    if (formula.indexOf("=") > -1) {
      const i = formula.indexOf("=");
      label = formula.slice(0, i).trim();
      expr = formula.slice(i + 1).trim();
    }
    expr = normalizeFormula(expr);
    if (!expr) throw new Error("Formulaning o‘ng tomoni bo‘sh.");

    let result = { label: clean(raw.result && raw.result.label, 80) || clean(label, 80) || "Natija", unit: "", dec: null };
    if (raw.result && typeof raw.result === "object") {
      result.unit = clean(raw.result.unit, 24);
      result.dec = raw.result.dec;
    }

    const list = Array.isArray(raw.variables) ? raw.variables : [];
    const variables = [];
    list.slice(0, 6).forEach((v, idx) => {
      if (!v || typeof v !== "object") return;
      const id = normalizeFormula(v.id || ("x" + (idx + 1))).replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
      if (!id || /^[0-9]/.test(id)) throw new Error("O‘zgaruvchi nomi noto‘g‘ri: " + String(v.id));
      if (variables.some(x => x.id === id)) return;
      const value = toNumber(v.value, toNumber(v.default, 1));
      let min = toNumber(v.min, Math.min(0, value * 2));
      let max = toNumber(v.max, value > 0 ? value * 2 : 100);
      if (max <= min) max = min + Math.max(1, Math.abs(value) || 1);
      const step = toNumber(v.step, niceStep((max - min) / 40));
      variables.push({
        id,
        label: clean(v.label, 80) || (SYM[id] || id.toUpperCase()),
        min,
        max,
        step: step > 0 ? step : 1,
        value: clamp(value, min, max),
        unit: clean(v.unit, 24)
      });
    });
    if (!variables.length) throw new Error("JSON faylda \"variables\" ro‘yxati bo‘sh yoki yo‘q.");

    let readout = null;
    if (Array.isArray(raw.readout) && raw.readout.length) {
      readout = raw.readout.slice(0, 8).map(r => {
        if (!r || typeof r !== "object" || !r.expr) return null;
        return {
          label: clean(r.label, 80) || "Natija",
          expr: normalizeFormula(r.expr),
          unit: clean(r.unit, 24),
          dec: r.dec == null ? null : clamp(Math.round(toNumber(r.dec, 2)), 0, 6)
        };
      }).filter(Boolean);
      if (!readout.length) readout = null;
    }

    return makeRoom({
      title: clean(raw.title || raw.name, 140) || clean(baseName(fileName), 140),
      goal: clean(raw.goal || raw.objective, 400),
      equipment: Array.isArray(raw.equipment) ? raw.equipment : [],
      theory: raw.theory || raw.note || "",
      variables,
      expr,
      formulaText: formula,
      result,
      readout
    }, fileName);
  }

  const SKIP_IDS = { g: 1, pi: 1, e: 1, sqrt: 1, abs: 1, sin: 1, cos: 1, tan: 1, log: 1, ln: 1, exp: 1, min: 1, max: 1, round: 1, floor: 1, ceil: 1, pow: 1 };

  function guessRange(unit, value) {
    const u = String(unit || "").toLowerCase();
    if (u === "m") return { min: 0.1, max: 2, step: 0.05 };
    if (u === "sm" || u === "mm" || u === "km") return { min: 1, max: 100, step: 1 };
    if (u.indexOf("kg/m") === 0) return { min: 600, max: 2000, step: 10 };
    if (u === "n") return { min: 0, max: Math.max(100, Math.abs(value) * 2), step: 1 };
    if (u === "s") return { min: 0.1, max: 20, step: 0.1 };
    const span = Math.abs(value) || 10;
    return { min: 0, max: Math.max(1, span * 2), step: niceStep(span / 20) };
  }

  function roomFromText(text, fileName) {
    const raw = String(text || "").replace(/\r\n?/g, "\n").trim();
    if (!raw) throw new Error("Fayl bo‘sh.");
    const lines = raw.split("\n");
    const titleLine = (lines.find(l => l.trim()) || "").replace(/^#+\s*/, "").trim();
    let title = clean(titleLine.replace(/^\s*(?:mavzu|ish nomi|laboratoriya ishi(?:ning mavzusi)?)\s*[:.\-–]\s*/i, ""), 140);
    if (title.length < 3) title = baseName(fileName);

    const sec = { goal: "", equipment: [], formula: "", theory: [] };
    let section = "";
    let pendingFormula = false;
    lines.forEach(line => {
      const m = line.match(/^\s*(maqsad|ishning maqsadi|goal|jihozlar|kerakli jihozlar|asboblar|equipment|formula(?:si)?|hisoblash formulasi|nazariya|nazariy qism|theory|izoh|qoidalar|ish tartibi|topshiriq)\s*:?\s*(.*)$/i);
      if (m) {
        const k = m[1].toLowerCase();
        const isFormula = /formula|hisoblash/.test(k);
        section = /maqsad|goal/.test(k) ? "goal" : /jihoz|asbob|equipment/.test(k) ? "equipment" : isFormula ? "formula" : "theory";
        pendingFormula = isFormula && !m[2];
        if (m[2]) {
          if (section === "goal") sec.goal += (sec.goal ? " " : "") + m[2].trim();
          else if (section === "formula") sec.formula += (sec.formula ? " " : "") + m[2].trim();
          else if (section === "equipment") {
            const item = clean(m[2], 100);
            if (item) sec.equipment.push(item);
          } else sec.theory.push(m[2]);
        }
        return;
      }
      if (pendingFormula) {
        const t = line.trim();
        if (t) {
          if (t.indexOf("=") > 0) sec.formula = t;
          pendingFormula = false;
        }
        return;
      }
      if (section === "equipment") {
        const item = clean(line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, ""), 100);
        if (item) sec.equipment.push(item);
      } else if (section === "goal") {
        if (line.trim()) sec.goal += (sec.goal ? " " : "") + line.trim();
      } else if (section === "theory") {
        sec.theory.push(line);
      }
    });

    let formula = sec.formula.trim();
    if (!formula || formula.indexOf("=") < 0) {
      formula = "";
      lines.some(line => {
        const m = line.match(/^\s*([A-Za-zρπΔ_ηωαβλσ][A-Za-z0-9_ρπΔηωαβλσ]*)\s*=\s*(.+)$/);
        if (!m) return false;
        if (/^(g|pi|e)$/i.test(m[1])) return false;
        const rhs = m[2].trim();
        if (/^[\d.,]+\s*[A-Za-zµ°%\/³².]+$/.test(rhs)) return false;
        if (!/[A-Za-zρπΔ_ηωαβλσ]/.test(rhs)) return false;
        formula = line.trim();
        return true;
      });
    }
    if (!formula) {
      throw new Error("Faylda formula topilmadi. Formula alohida qatorda ko‘rinishi kerak: \"p = ρgh\" yoki \"Formula: p = rho * g * h\".");
    }
    formula = formula.replace(/[.;]\s*$/, "").replace(/\([^)]*\)\s*$/, "").trim();
    if (formula.indexOf("=") < 0) throw new Error("Formula \"natija = ifoda\" ko‘rinishida bo‘lishi kerak.");
    const eq = formula.indexOf("=");
    const lhs = formula.slice(0, eq).trim();
    const rhs = formula.slice(eq + 1).trim().replace(/(\d),(\d)/g, "$1.$2");
    const search = normalizeFormula(raw);
    let expr = expandIds(normalizeFormula(rhs), search);
    if (!expr) throw new Error("Formulaning o‘ng tomoni bo‘sh.");

    const ids = [];
    (expr.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []).forEach(id => {
      const k = id.toLowerCase();
      if (SKIP_IDS[k] || ids.indexOf(k) > -1) return;
      ids.push(k);
    });
    if (!ids.length) throw new Error("Formulada o‘zgaruvchilar topilmadi. Formulani soddaroq yozing yoki JSON fayldan foydalaning.");

    const variables = ids.slice(0, 5).map(id => {
      const re = new RegExp("(?:^|[^A-Za-z0-9_])" + id + "\\s*=\\s*([0-9]+(?:[.,][0-9]+)?)\\s*([^\\s,;)]{0,14})", "i");
      const m = search.match(re);
      const value = m ? toNumber(m[1], 10) : 10;
      let unit = m && m[2] ? clean(String(m[2]).replace(/[.,;]+$/, ""), 20) : "";
      unit = unit.replace(/\^([23])/g, (all, d) => d === "2" ? "²" : "³");
      if (/^[a-z]$/i.test(unit) && unit.toLowerCase() !== "n" && unit.toLowerCase() !== "s" && unit.toLowerCase() !== "m") unit = "";
      const range = guessRange(unit, value);
      let min = range.min;
      let max = range.max;
      if (value < min) min = Math.max(0, value * 0.5);
      if (value > max) max = value * 1.5;
      return {
        id,
        label: (SYM[id] || id.toUpperCase()) + (unit ? ", " + unit : ""),
        min,
        max,
        step: range.step,
        value: clamp(value, min, max),
        unit
      };
    });

    let goal = clean(sec.goal, 400);
    if (!goal) {
      const para = lines.filter(l => l.trim() && l.trim() !== titleLine).slice(0, 2).join(" ");
      goal = clean(para, 260);
    }
    const theory = sec.theory.join("\n").trim() || raw;

    return makeRoom({
      title,
      goal,
      equipment: sec.equipment,
      theory,
      variables,
      expr,
      formulaText: lhs ? lhs + " = " + rhs : formula,
      result: { label: clean(lhs, 80) || "Natija", unit: "", dec: null },
      readout: null
    }, fileName);
  }

  /* ---------------- atmosfera tashlamalari laboratoriyasi ---------------- */

  function airAssign(tokens) {
    let best = null;
    const vals = [];

    function walk(i, fi, score) {
      if (best && score >= best.score) return;
      if (fi === AIR_FIELDS.length) {
        if (i === tokens.length && (!best || score < best.score)) best = { score, vals: vals.slice() };
        return;
      }
      const field = AIR_FIELDS[fi];
      const left = AIR_FIELDS.length - fi - 1;
      for (let take = 1; take <= 3; take++) {
        if (i + take > tokens.length) break;
        if (tokens.length - (i + take) < left) break;
        const raw = tokens.slice(i, i + take).join("");
        let val;
        if (raw === "-") {
          if (field.id !== "co" && field.id !== "no2" && field.id !== "so2" && field.id !== "nh3") continue;
          val = null;
        } else {
          if (!/^\d{1,6}(?:,\d{1,2})?$/.test(raw)) continue;
          val = parseFloat(raw.replace(",", "."));
          if (!isFinite(val) || val < field.min || val > field.max) continue;
        }
        let s = score;
        if (take > 1) s += 0.2 * (take - 1);
        if (val != null && (val < field.typ[0] || val > field.typ[1])) s += 1.2;
        vals.push(val);
        walk(i + take, fi + 1, s);
        vals.pop();
      }
    }

    walk(0, 0, 0);
    return best ? best.vals : null;
  }

  function airVariants(text) {
    const found = {};
    String(text || "").split("\n").forEach(line => {
      const m = line.match(/^\s*(\d{1,2})\s+(.+)$/);
      if (!m) return;
      const n = +m[1];
      if (!(n >= 1 && n <= 60) || found[n]) return;
      const rest = m[2]
        .replace(/[\uE000-\uF8FF]/g, " ")
        .replace(/(\d)\s*[×xх]\s*(?=\d)/gi, "$1 ")
        .replace(/\s+/g, " ").trim();
      if (/[A-Za-zА-Яа-яЁё]/.test(rest)) return;
      const tokens = rest.split(/\s+/).filter(Boolean);
      if (tokens.length < 10 || tokens.length > 18) return;
      const vals = airAssign(tokens);
      if (!vals) return;
      const row = { n };
      AIR_FIELDS.forEach((f, i) => { row[f.id] = vals[i]; });
      found[n] = row;
    });
    return Object.keys(found).map(k => found[k]).sort((a, b) => a.n - b.n);
  }

  function atmosphereRoomFromText(text, fileName) {
    const raw = String(text || "").replace(/\r\n?/g, "\n");
    const low = raw.toLowerCase();
    if (!/atmosfer|zararli modda/.test(low)) return null;
    if (!/ret|ruxsat etilgan tashlama|rek/.test(low)) return null;
    const variants = airVariants(raw);
    if (variants.length < 5) return null;

    const title = "Zararli moddalarni atmosferada tarqalishi va ruxsat etilgan tashlama me’yorlarini hisoblash";
    return {
      kind: "atmosphere",
      code: "",
      title,
      goal: "Zararli moddalarning atmosferaga tashlanishini hisoblash va olingan miqdorni ruxsat etilgan tashlama me’yori (RET) bilan taqqoslash.",
      equipment: [
        "Variantlar jadvali",
        "Muhandislik kalkulyatori",
        "REK va RET qiymatlari jadvali"
      ],
      theory: "Atmosferaga chiqarilayotgan zararli moddalar miqdori ruxsat etilgan tashlama me’yoridan oshmasligi kerak. Hisob quvur diametri, chiqindi hajmi, haroratlar farqi va tarqalish koeffitsientlari orqali bajariladi.",
      variables: [],
      variants,
      constants: AIR_CONSTANTS,
      teacher: teacher ? teacher.name : "",
      fileName: clean(fileName, 120),
      createdAt: Date.now(),
      participants: []
    };
  }

  function airCalc(p, consts) {
    const A = consts && isFinite(consts.A) ? +consts.A : 200;
    const F = consts && isFinite(consts.F) ? +consts.F : 1;
    const out = { valid: false, error: "" };
    if ([p.h, p.l, p.b, p.w, p.tg, p.tx].some(v => v == null || v === "")) {
      out.error = "Barcha manba parametrlari to‘ldirilishi kerak.";
      return out;
    }
    const h = +p.h, l = +p.l, b = +p.b, w = +p.w, tg = +p.tg, tx = +p.tx;
    if (![h, l, b, w, tg, tx].every(v => isFinite(v))) {
      out.error = "Barcha manba parametrlari to‘ldirilishi kerak.";
      return out;
    }
    if (h <= 0 || l <= 0 || b <= 0 || w <= 0) {
      out.error = "H, L, B va W noldan katta bo‘lishi kerak.";
      return out;
    }
    const dT = tg - tx;
    if (!(dT > 0)) {
      out.error = "Tg Tx dan katta bo‘lishi kerak.";
      return out;
    }
    const ds = 2 * l * b / (l + b);
    const v1 = Math.PI * ds * ds * w / 4;
    const f = 1000 * w * w * ds / (h * h * dT);
    const mCoef = 1 / (0.67 + 0.1 * Math.sqrt(f) + 0.34 * Math.cbrt(f));
    const vm = 0.65 * Math.cbrt(v1 * dT / h);
    const n = vm <= 0.3 ? 3 : vm <= 2 ? 3 - Math.sqrt(Math.max(0, (vm - 0.3) * (4.36 - vm))) : 1;
    const retBase = h * h * Math.cbrt(v1 * dT) / (A * F * mCoef * n);

    const gases = AIR_GASES.map(g => {
      const c = p[g.id];
      if (c == null || c === "" || !isFinite(+c) || +c < 0) {
        return { id: g.id, name: g.name, rek: g.rek, c: null, m: null, ret: null, ratio: null, ok: true, device: g.device };
      }
      const mass = (+c) * v1 / 1000;
      const ret = (g.rek - g.rek * 0.5) * retBase;
      const ratio = ret > 0 ? mass / ret : Infinity;
      return { id: g.id, name: g.name, rek: g.rek, c: +c, m: mass, ret, ratio, ok: mass <= ret, device: g.device };
    });
    const active = gases.filter(g => g.m != null);
    const exceed = active.filter(g => !g.ok).sort((a, b) => b.ratio - a.ratio);
    const worst = active.slice().sort((a, b) => b.ratio - a.ratio)[0] || null;

    return {
      valid: true, error: "", ds, v1, dT, f, m: mCoef, vm, n, retBase,
      gases, active, exceed, worst, A, F
    };
  }

  /* ---------------- DOCX matnini o‘qish ---------------- */

  function decodeXml(s) {
    return s
      .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(parseInt(d, 10)))
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, "\"")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  async function docxText(file) {
    const buf = await file.arrayBuffer();
    const u8 = new Uint8Array(buf);
    const dv = new DataView(buf);
    let eocd = -1;
    for (let i = u8.length - 22; i >= 0 && i >= u8.length - 65558; i--) {
      if (u8[i] === 0x50 && u8[i + 1] === 0x4b && u8[i + 2] === 0x05 && u8[i + 3] === 0x06) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error("DOCX fayl tuzilishi tanilmadi. PDF yoki TXT yuklang.");
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    let entry = null;
    for (let i = 0; i < count && p + 46 <= u8.length; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true);
      const nameLen = dv.getUint16(p + 28, true);
      const extraLen = dv.getUint16(p + 30, true);
      const cmtLen = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen));
      if (name === "word/document.xml") {
        entry = { method, csize, off };
        break;
      }
      p += 46 + nameLen + extraLen + cmtLen;
    }
    if (!entry) throw new Error("DOCX ichida matn qismi topilmadi.");
    const lh = entry.off;
    if (dv.getUint32(lh, true) !== 0x04034b50) throw new Error("DOCX fayl boshqaruvi buzilgan.");
    const nLen = dv.getUint16(lh + 26, true);
    const eLen = dv.getUint16(lh + 28, true);
    const start = lh + 30 + nLen + eLen;
    const data = u8.subarray(start, start + entry.csize);
    let xml;
    if (entry.method === 0) {
      xml = new TextDecoder().decode(data);
    } else if (entry.method === 8) {
      if (typeof DecompressionStream !== "function") {
        throw new Error("Brauzer DOCX matnini ochishni qo‘llamaydi. PDF yoki TXT yuklang.");
      }
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      xml = await new Response(stream).text();
    } else {
      throw new Error("DOCX siqish usuli qo‘llanmaydi. PDF yoki TXT yuklang.");
    }
    const text = decodeXml(xml
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<\/w:tc>/g, "\t")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<\/m:oMathPara>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, ""))
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!text) throw new Error("DOCX faylda matn topilmadi.");
    return text;
  }

  /* ---------------- PDF matnini o‘qish ---------------- */

  let pdfLibPromise = null;

  function loadPdfLib() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "pdf.min.js";
      s.async = true;
      s.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";
          resolve(window.pdfjsLib);
        } else {
          pdfLibPromise = null;
          reject(new Error("PDF kutubxonasi yuklanmadi."));
        }
      };
      s.onerror = () => {
        pdfLibPromise = null;
        reject(new Error("PDF o‘qish kutubxonasi yuklanmadi. Word (.docx) yoki TXT faylini yuklang."));
      };
      document.head.appendChild(s);
    });
    return pdfLibPromise;
  }

  async function pdfText(file) {
    const lib = await loadPdfLib();
    let pdf;
    try {
      pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    } catch (e) {
      if (e && (e.name === "PasswordException" || /password/i.test(e.message || ""))) {
        throw new Error("PDF parol bilan himoyalangan. Parolsiz nusxasini yuklang.");
      }
      throw new Error("PDF faylni o‘qib bo‘lmadi. Word (.docx) yoki TXT nusxasini yuklab ko‘ring.");
    }
    const pages = [];
    const total = Math.min(pdf.numPages || 0, 40);
    for (let i = 1; i <= total; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = [];
      let line = "";
      let lastY = null;
      content.items.forEach(it => {
        if (!it || typeof it.str !== "string") return;
        const y = it.transform && it.transform.length > 5 ? it.transform[5] : null;
        if (lastY != null && y != null && Math.abs(y - lastY) > 2.5 && line.trim()) {
          lines.push(line.trim());
          line = "";
        }
        if (line && it.str && !/\s$/.test(line) && !/^\s/.test(it.str)) line += " ";
        line += it.str;
        if (it.hasEOL && line.trim()) {
          lines.push(line.trim());
          line = "";
        }
        if (y != null) lastY = y;
      });
      if (line.trim()) lines.push(line.trim());
      pages.push(lines.join("\n"));
      if (typeof page.cleanup === "function") page.cleanup();
    }
    const text = pages.join("\n\n").replace(/[ \t]+\n/g, "\n").trim();
    if (!/[A-Za-z]{3}/.test(text)) {
      throw new Error("PDF ichida matn topilmadi — fayl skanerlangan rasm bo‘lishi mumkin. Word (.docx) yoki TXT yuklang.");
    }
    return text;
  }

  async function readUpload(file) {
    if (/\.pdf$/i.test(file.name)) return pdfText(file);
    if (/\.docx$/i.test(file.name)) return docxText(file);
    if (/\.doc$/i.test(file.name)) {
      throw new Error("Eski .doc formatini brauzerda o‘qib bo‘lmaydi. Wordda «Save as» orqali .docx yoki PDF qilib yuklang.");
    }
    return file.text();
  }

  /* ---------------- localStorage ---------------- */

  function loadRooms() {
    try {
      const raw = localStorage.getItem(ROOMS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveRooms() {
    try {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
      return true;
    } catch (e) {
      return false;
    }
  }

  let resultTimer = 0;

  function saveStudentResult(room, name, record) {
    const code = room.code;
    const all = loadRooms();
    const fresh = all[code] || room;
    if (!fresh.results || typeof fresh.results !== "object") fresh.results = {};
    record.name = name;
    record.updatedAt = Date.now();
    fresh.results[String(name).toLowerCase()] = record;
    if (!Array.isArray(fresh.participants)) fresh.participants = [];
    if (!fresh.participants.some(p => String(p).toLowerCase() === String(name).toLowerCase())) {
      fresh.participants.push(name);
    }
    all[code] = fresh;
    try { localStorage.setItem(ROOMS_KEY, JSON.stringify(all)); } catch (e) { /* xotira to‘lgan */ }
    rooms = all;
    room.results = fresh.results;
  }

  function scheduleStudentResult(room, name, build) {
    if (resultTimer) clearTimeout(resultTimer);
    resultTimer = setTimeout(() => {
      resultTimer = 0;
      let rec;
      try { rec = build(); } catch (e) { return; }
      saveStudentResult(room, name, rec);
    }, 450);
  }

  function studentFileName(room, name) {
    const slug = String(name).replace(/[^\w\u0400-\u04FF]+/g, "-").replace(/^-+|-+$/g, "");
    return "talaba-" + room.code + "-" + (slug || "natija") + ".txt";
  }

  function studentReport(room, name, rec, fmt) {
    const lines = [
      "VirtualLab UZ — talaba hisoboti",
      "",
      "Sinf honasi kodi: " + room.code,
      "Ish: " + room.title,
      "Talaba: " + name,
      "Sana: " + new Date(rec.updatedAt || Date.now()).toLocaleString("uz-UZ"),
      ""
    ];
    if (rec.kind === "atmosphere") {
      const p = rec.params || {};
      const c = rec.calc || {};
      lines.push(
        "Variant: " + rec.variant,
        "",
        "Manba parametrlari:",
        "  H = " + fmt(p.h, 2) + " m, L = " + fmt(p.l, 2) + " m, B = " + fmt(p.b, 2) + " m, W = " + fmt(p.w, 2) + " m/s",
        "  Tg = " + fmt(p.tg, 1) + " °C, Tx = " + fmt(p.tx, 1) + " °C",
        "",
        "Oraliq hisoblar:",
        "  Ds = " + fmt(c.ds, 3) + " m",
        "  V1 = " + fmt(c.v1, 3) + " m³/s",
        "  ΔT = " + fmt(c.dT, 1) + " °C",
        "  f = " + fmt(c.f, 2) + ", m = " + fmt(c.m, 3) + ", Vm = " + fmt(c.vm, 3) + ", n = " + fmt(c.n, 3),
        "",
        "Natijalar:"
      );
      (rec.gases || []).forEach(g => {
        lines.push("  " + g.name + ": C = " + (g.c == null ? "—" : fmt(g.c, g.c < 1 ? 3 : 1) + " mg/m³") +
          ", M = " + (g.m == null ? "—" : fmt(g.m, 4) + " g/s") +
          ", RET = " + (g.ret == null ? "—" : fmt(g.ret, 4) + " g/s") +
          ", M/RET = " + (g.ratio == null ? "—" : fmt(g.ratio, 2) + "×") +
          (g.m == null ? "" : g.ok ? " (me’yor ichida)" : " (me’yordan yuqori)"));
      });
      lines.push("", "Xulosa:");
      if (rec.bad) {
        (rec.gases || []).filter(g => g.m != null && !g.ok).forEach(g => {
          const gas = AIR_GASES.find(x => x.id === g.id);
          if (gas) lines.push("  " + gas.name + " uchun: " + gas.device);
        });
      } else {
        lines.push("  Barcha gazlar RET ichida. Qo‘shimcha tozalash uskunasi talab etilmaydi.");
      }
    } else {
      lines.push("Kiritilgan qiymatlar:");
      (rec.inputs || []).forEach(i => {
        lines.push("  " + i.label + " = " + fmt(i.value, 2) + (i.unit ? " " + i.unit : ""));
      });
      lines.push("", "Natijalar:");
      (rec.outputs || []).forEach(r => {
        lines.push("  " + r.label + " = " + (r.value == null ? "—" : fmt(r.value, r.dec)) + (r.unit ? " " + r.unit : ""));
      });
    }
    return lines.join("\n");
  }

  function newCode() {
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let n = 0; n < 50; n++) {
      let code = "";
      for (let i = 0; i < 6; i++) code += abc[Math.floor(Math.random() * abc.length)];
      if (!rooms[code]) return code;
    }
    return "K" + Date.now().toString(36).toUpperCase().slice(-5);
  }

  /* ---------------- oynalar ---------------- */

  function anyOpen() {
    return ["teacher-overlay", "join-overlay", "classroom-overlay"].some(id => {
      const o = byId(id);
      return o && !o.hidden;
    });
  }

  function openOverlay(id) {
    const o = byId(id);
    if (!o) return;
    o.hidden = false;
    document.body.classList.add("tp-lock");
  }

  function closeOverlay(id) {
    const o = byId(id);
    if (!o || o.hidden) return;
    o.hidden = true;
    if (id === "classroom-overlay") {
      if (stopAnim) { stopAnim(); stopAnim = null; }
      current = null;
    }
    if (!anyOpen()) document.body.classList.remove("tp-lock");
  }

  function showLogin() {
    byId("tp-login").hidden = false;
    byId("tp-panel").hidden = true;
    byId("tp-title").textContent = "Tizimga kirish";
    byId("tp-login-err").hidden = true;
  }

  function showPanel() {
    byId("tp-login").hidden = true;
    byId("tp-panel").hidden = false;
    byId("tp-title").textContent = "O‘qituvchi paneli";
    byId("tp-name").textContent = teacher ? teacher.name : "";
    renderRooms();
  }

  function renderRooms() {
    const wrap = byId("tp-rooms");
    if (!wrap) return;
    wrap.textContent = "";
    const list = Object.keys(rooms).map(k => rooms[k]).filter(Boolean)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (!list.length) {
      wrap.append(el("p", "tp-empty", "Hozircha sinf honasi yaratilmagan. Amaliy ish faylini yuklang."));
      return;
    }
    list.slice(0, 8).forEach(room => {
      const row = el("div", "tp-room");
      const main = el("div", "tp-room-main");
      const date = new Date(room.createdAt || Date.now()).toLocaleDateString("uz-UZ");
      main.append(
        el("b", "", room.title),
        el("span", "", date + " · " + ((room.participants || []).length) + " talaba · " + room.teacher)
      );
      const open = el("button", "", "Ochish");
      open.type = "button";
      open.addEventListener("click", () => openClassroom(room, "teacher", null));
      row.append(el("span", "tp-room-code", room.code), main, open);
      wrap.append(row);
    });
  }

  /* ---------------- fayl yuklash ---------------- */

  function setProgress(percent, stage) {
    byId("tp-bar").style.width = clamp(percent, 0, 100) + "%";
    byId("tp-stage").textContent = stage;
  }

  async function handleFile(file) {
    if (busy) return;
    busy = true;
    const err = byId("tp-error");
    const prog = byId("tp-progress");
    err.hidden = true;
    prog.hidden = false;
    setProgress(8, /\.pdf$/i.test(file ? file.name : "") ? "PDF matni ajratilmoqda…" : "Fayl o‘qilmoqda…");
    try {
      if (!file) throw new Error("Fayl tanlanmadi.");
      if (file.size > MAX_FILE) throw new Error("Fayl hajmi 8 MB dan oshmasligi kerak.");
      const text = await readUpload(file);
      setProgress(38, "Mazmun tahlil qilinmoqda…");
      await delay(320);
      let room;
      if (/\.json$/i.test(file.name)) {
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("JSON fayl noto‘g‘ri tuzilgan. Namunani yuklab, shu shaklda to‘ldiring.");
        }
        room = roomFromJSON(data, file.name);
      } else {
        room = atmosphereRoomFromText(text, file.name) || roomFromText(text, file.name);
      }
      setProgress(68, "Virtual laboratoriya yig‘ilmoqda…");
      await delay(340);
      room.code = newCode();
      room.teacher = teacher ? teacher.name : "";
      room.createdAt = Date.now();
      rooms[room.code] = room;
      if (!saveRooms()) {
        delete rooms[room.code];
        throw new Error("Brauzer xotirasi to‘ldi. Avval eski sinf honasini o‘chiring yoki boshqa brauzerda sinab ko‘ring.");
      }
      renderRooms();
      setProgress(100, "Sinf honasi ochilmoqda…");
      await delay(420);
      prog.hidden = true;
      openClassroom(room, "teacher", null);
    } catch (e) {
      prog.hidden = true;
      err.textContent = (e && e.message) ? e.message : "Faylni qayta ishlashda xatolik yuz berdi.";
      err.hidden = false;
    } finally {
      busy = false;
    }
  }

  /* ---------------- sinf honasi ---------------- */

  function evaluateRows(room, state) {
    const rows = [];
    if (Array.isArray(room.readout) && room.readout.length) {
      room.readout.forEach(r => {
        let v = null;
        try { v = evalFormula(r.expr, state); } catch (e) { v = null; }
        rows.push({ label: r.label, value: v, unit: r.unit, dec: r.dec });
      });
    } else {
      let v = null;
      try { v = evalFormula(room.expr, state); } catch (e) { v = null; }
      rows.push({ label: room.result.label, value: v, unit: room.result.unit, dec: room.result.dec });
    }
    return rows;
  }

  function substituted(room, state) {
    return room.expr.replace(/[A-Za-z_][A-Za-z0-9_]*/g, m => {
      const k = m.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(state, k)) return fmtNum(state[k], 2);
      if (k === "g") return "9,81";
      if (k === "pi") return "3,14";
      return m;
    });
  }

  function openClassroom(room, role, studentName) {
    const fresh = loadRooms()[room.code];
    if (fresh) room = fresh;
    current = { room, role, name: studentName };
    byId("cr-code").textContent = room.code;
    const meta = byId("cr-meta");
    meta.textContent = "";
    meta.append(el("span", "", "O‘qituvchi: " + room.teacher));
    if (room.kind === "atmosphere") {
      meta.append(el("span", "", "Variantlar: " + room.variants.length));
    } else {
      meta.append(el("span", "", "Parametrlar: " + room.variables.length));
    }
    meta.append(el("span", "", "Talabalar: " + ((room.participants || []).length)));
    if (role === "student" && studentName) meta.append(el("span", "", "Talaba: " + studentName));
    closeOverlay("join-overlay");
    openOverlay("classroom-overlay");
    renderLab(room, byId("cr-body"), role, studentName);
  }

  function renderLab(room, host, role, studentName) {
    if (stopAnim) { stopAnim(); stopAnim = null; }
    if (room.kind === "atmosphere") {
      renderAirLab(room, host, role, studentName);
      return;
    }
    host.textContent = "";
    const state = {};
    room.variables.forEach(v => { state[v.id] = v.value; });

    const head = el("div", "cr-head");
    head.append(el("h2", "", room.title), el("p", "", room.goal));
    const badge = el("span", "cr-badge", "");
    badge.textContent = role === "teacher"
      ? "O‘qituvchi rejimi · fayl: " + room.fileName
      : "Talaba: " + (studentName || "—");
    head.append(badge);

    const grid = el("div", "cr-grid");
    const stage = el("div", "cr-canvas-wrap");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", room.title + " animatsiyasi");
    stage.append(canvas);
    const side = el("div", "cr-side");
    grid.append(stage, side);
    host.append(head, grid);

    const controls = el("div", "card");
    controls.append(el("h3", "", "Boshqarish"));
    room.variables.forEach(v => {
      const box = el("div", "control");
      const row = el("div", "row");
      row.append(el("span", "name", v.label));
      const out = document.createElement("output");
      out.textContent = fmtNum(v.value, 2) + (v.unit ? " " + v.unit : "");
      row.append(out);
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(v.min);
      input.max = String(v.max);
      input.step = String(v.step);
      input.value = String(v.value);
      input.setAttribute("aria-label", v.label);
      input.addEventListener("input", () => {
        state[v.id] = +input.value;
        out.textContent = fmtNum(state[v.id], 2) + (v.unit ? " " + v.unit : "");
        refresh();
      });
      box.append(row, input);
      controls.append(box);
    });

    const resultCard = el("div", "card");
    resultCard.append(el("h3", "", "Natija"));
    const big = el("div", "big-result");
    const bigValue = el("b", "", "—");
    const bigLabel = el("small", "", room.result.label);
    big.append(bigValue, bigLabel);
    resultCard.append(big);
    const resTable = el("table", "readout");
    const resBody = document.createElement("tbody");
    resTable.append(resBody);
    resultCard.append(resTable);
    const reportBtn = el("button", "btn wide report-btn", "Hisobotni yuklab olish (.txt)");
    reportBtn.type = "button";
    reportBtn.style.marginTop = "10px";
    resultCard.append(reportBtn);

    const inputCard = el("div", "card");
    inputCard.append(el("h3", "", "Kiritilgan qiymatlar"));
    const inTable = el("table", "readout");
    const inBody = document.createElement("tbody");
    inTable.append(inBody);
    room.variables.forEach(v => {
      const tr = document.createElement("tr");
      const td1 = el("td", "", v.label);
      const td2 = document.createElement("td");
      td2.append(el("b", "", fmtNum(v.value, 2)));
      if (v.unit) td2.append(el("span", "unit", v.unit));
      tr.append(td1, td2);
      inBody.append(tr);
    });
    inputCard.append(inTable);

    const calcCard = el("div", "card");
    calcCard.append(el("h3", "", "Hisoblash"));
    const fLine = el("p", "cr-formula");
    fLine.append(el("b", "", "Formula: "), document.createTextNode(room.formulaText));
    const cLine = el("p", "cr-formula", "Hisob: —");
    cLine.style.marginTop = "7px";
    calcCard.append(fLine, cLine, el("p", "cr-note", "Qiymatlar fayldagi formula bo‘yicha real vaqtda hisoblanadi."));

    function refresh() {
      const rows = evaluateRows(room, state);
      resBody.textContent = "";
      rows.forEach((r, i) => {
        const tr = document.createElement("tr");
        if (i === 0) tr.className = "accent";
        const td1 = el("td", "", r.label);
        const td2 = document.createElement("td");
        td2.append(el("b", "", r.value == null ? "—" : fmtNum(r.value, r.dec)));
        if (r.unit) td2.append(el("span", "unit", r.unit));
        tr.append(td1, td2);
        resBody.append(tr);
      });
      const first = rows[0];
      bigValue.textContent = first && first.value != null
        ? fmtNum(first.value, first.dec) + (first.unit ? " " + first.unit : "")
        : "—";
      bigLabel.textContent = first ? first.label : "natija";
      cLine.textContent = first && first.value != null
        ? "Hisob: " + substituted(room, state) + " = " + fmtNum(first.value, first.dec) + (first.unit ? " " + first.unit : "")
        : "Hisob: —";

      if (role === "student" && studentName) {
        const snapshot = {};
        room.variables.forEach(v => { snapshot[v.id] = state[v.id]; });
        scheduleStudentResult(room, studentName, () => {
          const out = evaluateRows(room, snapshot);
          const firstRow = out[0];
          return {
            kind: "lab",
            summary: firstRow
              ? firstRow.label + ": " + (firstRow.value == null ? "—" : fmtNum(firstRow.value, firstRow.dec) + (firstRow.unit ? " " + firstRow.unit : ""))
              : "—",
            inputs: room.variables.map(v => ({ label: v.label, value: snapshot[v.id], unit: v.unit })),
            outputs: out.map(r => ({ label: r.label, value: r.value, unit: r.unit, dec: r.dec }))
          };
        });
      }
    }

    reportBtn.addEventListener("click", () => {
      const rows = evaluateRows(room, state);
      const lines = [
        "VirtualLab UZ — sinf honasi hisoboti",
        "",
        "Sinf honasi kodi: " + room.code,
        "Ish nomi: " + room.title,
        "O‘qituvchi: " + room.teacher,
        role === "student" && studentName ? "Talaba: " + studentName : "Rejim: o‘qituvchi",
        "Sana: " + new Date().toLocaleString("uz-UZ"),
        "",
        "Formula: " + room.formulaText,
        "",
        "Kiritilgan qiymatlar:"
      ];
      room.variables.forEach(v => {
        lines.push("  " + v.label + " = " + fmtNum(state[v.id], 2) + (v.unit ? " " + v.unit : ""));
      });
      lines.push("", "Natijalar:");
      rows.forEach(r => {
        lines.push("  " + r.label + " = " + (r.value == null ? "—" : fmtNum(r.value, r.dec)) + (r.unit ? " " + r.unit : ""));
      });
      lines.push("");
      saveText("sinf-honasi-" + room.code + ".txt", lines.join("\n"));
    });

    side.append(controls, resultCard, calcCard, inputCard);

    if (room.equipment && room.equipment.length) {
      const eq = el("div", "card");
      eq.append(el("h3", "", "Jihozlar"));
      const ul = document.createElement("ul");
      ul.className = "eq-list";
      room.equipment.forEach(item => ul.append(el("li", "", item)));
      eq.append(ul);
      side.append(eq);
    }

    const studentsCard = buildStudentsCard(room, role);
    if (studentsCard) host.append(studentsCard);

    refresh();
    stopAnim = startCanvas(canvas, room, state);
  }

  /* ---------------- talabalar natijalari kartasi ---------------- */

  function buildStudentsCard(room, role) {
    if (role !== "teacher") return null;
    const card = el("div", "card air-students");
    const title = el("h3", "", "Sinf honasiga tashrif buyurgan talabalar");
    const list = el("div", "air-students-list");
    const note = el("p", "cr-note", "Sinf honasiga kirgan talabalar va ularning oxirgi natijalari. «Yangilash» tugmasi bilan yangilang.");
    const refresh = el("button", "air-refresh", "Yangilash");
    refresh.type = "button";
    card.append(title, list, note, refresh);

    function timeText(ts) {
      if (!ts) return "";
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    }

    function render() {
      const fresh = loadRooms()[room.code] || room;
      const participants = Array.isArray(fresh.participants) ? fresh.participants : [];
      const results = fresh.results && typeof fresh.results === "object" ? fresh.results : {};
      title.textContent = "Sinf honasiga tashrif buyurgan talabalar (" + participants.length + ")";
      list.textContent = "";

      if (!participants.length) {
        list.append(el("p", "air-empty", "Hozircha hech kim qo‘shilmagan. Talaba sinf honasi kodi va ismi bilan kirganda shu yerda paydo bo‘ladi."));
        note.hidden = true;
        return;
      }
      note.hidden = false;

      participants.forEach(name => {
        const rec = results[String(name).toLowerCase()];
        const box = el("div", "air-student");
        const top = el("div", "air-student-top");
        top.append(el("b", "", name), el("span", "air-student-time", rec ? timeText(rec.updatedAt) : ""));
        box.append(top);

        if (!rec) {
          box.append(el("p", "air-student-sum", "Natija hali saqlanmagan."));
          list.append(box);
          return;
        }

        const sum = el("p", "air-student-sum");
        if (rec.kind === "atmosphere") {
          sum.append(el("span", "air-tag " + (rec.bad ? "bad" : "ok"), rec.status || (rec.bad ? "Me’yor oshgan" : "RET ichida")));
          sum.append(document.createTextNode("Variant " + rec.variant + " · " + (rec.summary || "—")));
        } else {
          sum.textContent = rec.summary || "Natija saqlangan";
        }
        box.append(sum);

        const details = document.createElement("details");
        const dsum = document.createElement("summary");
        dsum.textContent = "Batafsil";
        details.append(dsum);

        if (rec.kind === "atmosphere" && Array.isArray(rec.gases)) {
          const table = document.createElement("table");
          table.className = "air-table";
          const head = document.createElement("thead");
          const htr = document.createElement("tr");
          ["Gaz", "M, g/s", "RET, g/s", "M/RET"].forEach(t => htr.append(el("th", "", t)));
          head.append(htr);
          const body = document.createElement("tbody");
          rec.gases.forEach(g => {
            const tr = document.createElement("tr");
            tr.append(el("td", "", g.name));
            tr.append(el("td", "", g.m == null ? "—" : fmtNum(g.m, 3)));
            tr.append(el("td", "", g.ret == null ? "—" : fmtNum(g.ret, 3)));
            tr.append(el("td", g.ratio == null ? "" : g.ok ? "good" : "bad", g.ratio == null ? "—" : fmtNum(g.ratio, 2) + "×"));
            body.append(tr);
          });
          table.append(head, body);
          details.append(table);
        } else if (Array.isArray(rec.outputs)) {
          const table = document.createElement("table");
          table.className = "readout";
          const body = document.createElement("tbody");
          rec.outputs.forEach(r => {
            const tr = document.createElement("tr");
            tr.append(el("td", "", r.label));
            const td = document.createElement("td");
            td.append(el("b", "", r.value == null ? "—" : fmtNum(r.value, r.dec)));
            if (r.unit) td.append(el("span", "unit", r.unit));
            tr.append(td);
            body.append(tr);
          });
          table.append(body);
          details.append(table);
        }

        const dl = el("button", "air-refresh", "Talaba hisobotini yuklash (.txt)");
        dl.type = "button";
        dl.addEventListener("click", () => {
          saveText(studentFileName(room, name), studentReport(room, name, rec, fmtNum));
        });
        details.append(dl);
        box.append(details);
        list.append(box);
      });
    }

    refresh.addEventListener("click", () => {
      render();
      refresh.textContent = "Yangilandi";
      setTimeout(() => { refresh.textContent = "Yangilash"; }, 1200);
    });

    render();
    return card;
  }

  /* ---------------- atmosfera laboratoriyasi interfeysi ---------------- */

  function renderAirLab(room, host, role, studentName) {
    host.textContent = "";
    const consts = room.constants || AIR_CONSTANTS;
    const first = room.variants[0] || {};
    const state = {
      variant: first.n || 1,
      co: first.co == null ? null : first.co,
      no2: first.no2 == null ? null : first.no2,
      so2: first.so2 == null ? null : first.so2,
      nh3: first.nh3 == null ? null : first.nh3,
      h: first.h == null ? null : first.h,
      l: first.l == null ? null : first.l,
      b: first.b == null ? null : first.b,
      w: first.w == null ? null : first.w,
      tg: first.tg == null ? null : first.tg,
      tx: first.tx == null ? null : first.tx
    };

    const head = el("div", "cr-head");
    head.append(el("h2", "", room.title), el("p", "", room.goal));
    head.append(el("span", "cr-badge", role === "teacher"
      ? "O‘qituvchi rejimi · fayl: " + room.fileName
      : "Talaba: " + (studentName || "—")));

    const grid = el("div", "cr-grid");
    const stage = el("div", "cr-canvas-wrap");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Atmosferaga tashlama tarqalishi animatsiyasi");
    stage.append(canvas);
    const side = el("div", "cr-side");
    grid.append(stage, side);
    host.append(head, grid);

    const variantCard = el("div", "card");
    variantCard.append(el("h3", "", "Variant"));
    const vrow = el("div", "air-variant");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Variant tanlash");
    room.variants.forEach(v => {
      const o = document.createElement("option");
      o.value = String(v.n);
      o.textContent = "Variant " + v.n;
      select.append(o);
    });
    select.value = String(state.variant);
    vrow.append(select, el("span", "air-count", room.variants.length + " ta variant"));
    variantCard.append(vrow, el("p", "cr-note", "Jadvaldagi variantni tanlang — qiymatlar avtomatik to‘ldiriladi. Har bir maydonni qo‘lda ham o‘zgartirish mumkin."));

    const inputs = {};
    function numField(parent, label, key, step) {
      const lab = document.createElement("label");
      lab.append(document.createTextNode(label));
      const inp = document.createElement("input");
      inp.type = "number";
      inp.step = String(step);
      inp.value = state[key] == null ? "" : String(state[key]);
      inp.setAttribute("aria-label", label);
      inp.addEventListener("input", () => {
        state[key] = inp.value === "" ? null : +inp.value;
        refresh();
      });
      lab.append(inp);
      parent.append(lab);
      inputs[key] = inp;
      return inp;
    }

    const resultCard = el("div", "card");
    resultCard.append(el("h3", "", "Natija"));
    const big = el("div", "big-result air-big");
    const bigValue = el("b", "", "—");
    const bigLabel = el("small", "", "M / RET");
    big.append(bigValue, bigLabel);
    const status = el("span", "air-status", "");
    const resTable = el("table", "air-table");
    const resHead = document.createElement("thead");
    const htr = document.createElement("tr");
    ["Gaz", "M, g/s", "RET, g/s", "M/RET"].forEach(t => htr.append(el("th", "", t)));
    resHead.append(htr);
    const resBody = document.createElement("tbody");
    resTable.append(resHead, resBody);
    resultCard.append(big, status, resTable);

    const paramCard = el("div", "card");
    paramCard.append(el("h3", "", "Manba parametrlari"));
    const paramGrid = el("div", "air-inputs");
    numField(paramGrid, "H, m", "h", 0.5);
    numField(paramGrid, "L, m", "l", 0.05);
    numField(paramGrid, "B, m", "b", 0.05);
    numField(paramGrid, "W, m/s", "w", 0.5);
    numField(paramGrid, "Tg, °C", "tg", 0.5);
    numField(paramGrid, "Tx, °C", "tx", 0.5);
    paramCard.append(paramGrid, el("p", "cr-note", "A = 200, F = 1, Cf = 0,5·REK."));

    const gasCard = el("div", "card");
    gasCard.append(el("h3", "", "Chiqindi gazlar, mg/m³"));
    const gasGrid = el("div", "air-inputs");
    AIR_GASES.forEach(g => numField(gasGrid, g.name, g.id, 0.001));
    gasCard.append(gasGrid, el("p", "cr-note", "REK: CO 5 · NO₂ 0,085 · SO₂ 0,5 · NH₃ 0,2 mg/m³. Bo‘sh maydon — bu gaz chiqarilmaydi deb hisoblanadi."));

    const calcCard = el("div", "card");
    calcCard.append(el("h3", "", "Oraliq hisoblar"));
    const calcTable = el("table", "readout");
    const calcBody = document.createElement("tbody");
    calcTable.append(calcBody);
    const calcRows = {};
    [
      ["ds", "Quvur diametri, Ds"],
      ["v1", "Chiqindi hajmi, V₁"],
      ["dt", "Haroratlar farqi, ΔT"],
      ["f", "Koeffitsient, f"],
      ["m", "Koeffitsient, m"],
      ["vm", "Koeffitsient, Vm"],
      ["n", "Koeffitsient, n"]
    ].forEach(pair => {
      const tr = document.createElement("tr");
      tr.append(el("td", "", pair[1]));
      const td = document.createElement("td");
      const b = el("b", "", "—");
      td.append(b);
      tr.append(td);
      calcBody.append(tr);
      calcRows[pair[0]] = { b, td };
    });
    const details = document.createElement("details");
    details.className = "air-formulas";
    const summary = document.createElement("summary");
    summary.textContent = "Formulalar";
    const pre = document.createElement("pre");
    pre.textContent = [
      "Ds = 2·L·B / (L + B)",
      "V₁ = π·Ds²·W / 4",
      "ΔT = Tg − Tx",
      "f = 1000·W²·Ds / (H²·ΔT)",
      "m = 1 / (0,67 + 0,1·√f + 0,34·∛f)",
      "Vm = 0,65·∛(V₁·ΔT / H)",
      "n = 3            (Vm ≤ 0,3)",
      "n = 3 − √((Vm−0,3)(4,36−Vm))   (0,3 < Vm ≤ 2)",
      "n = 1            (Vm > 2)",
      "M = C·V₁ / 1000",
      "RET = 0,5·REK·H²·∛(V₁·ΔT) / (A·F·m·n)"
    ].join("\n");
    details.append(summary, pre);
    calcCard.append(calcTable, details);

    const conclCard = el("div", "card");
    conclCard.append(el("h3", "", "Xulosa"));
    const concl = el("p", "air-conclusion", "");
    const devices = document.createElement("ul");
    devices.className = "air-devices";
    const reportBtn = el("button", "btn wide report-btn", "Hisobotni yuklab olish (.txt)");
    reportBtn.type = "button";
    reportBtn.style.marginTop = "10px";
    conclCard.append(concl, devices, reportBtn);

    side.append(variantCard, resultCard, paramCard, gasCard, calcCard, conclCard);
    const studentsCard = buildStudentsCard(room, role);
    if (studentsCard) host.append(studentsCard);

    function setCalc(key, val, dec, unit) {
      const cell = calcRows[key];
      cell.b.textContent = val == null || !isFinite(val) ? "—" : fmtNum(val, dec) + (unit ? " " + unit : "");
    }

    function refresh() {
      const res = airCalc(state, consts);

      if (res.valid) {
        setCalc("ds", res.ds, 3, "m");
        setCalc("v1", res.v1, 3, "m³/s");
        setCalc("dt", res.dT, 1, "°C");
        setCalc("f", res.f, 2);
        setCalc("m", res.m, 3);
        setCalc("vm", res.vm, 3);
        setCalc("n", res.n, 3);
      } else {
        ["ds", "v1", "dt", "f", "m", "vm", "n"].forEach(k => setCalc(k, null));
      }

      resBody.textContent = "";
      res.gases.forEach(g => {
        const tr = document.createElement("tr");
        tr.append(el("td", "", g.name));
        tr.append(el("td", "", g.m == null ? "—" : fmtNum(g.m, 3)));
        tr.append(el("td", "", g.ret == null ? "—" : fmtNum(g.ret, 3)));
        const ratio = el("td", g.ratio == null ? "" : g.ok ? "good" : "bad",
          g.ratio == null ? "—" : fmtNum(g.ratio, 2) + "×");
        tr.append(ratio);
        resBody.append(tr);
      });

      big.classList.remove("ok", "bad");
      if (res.valid && res.worst) {
        bigValue.textContent = fmtNum(res.worst.ratio, 2) + "×";
        bigLabel.textContent = res.worst.name + " · M / RET";
        big.classList.add(res.worst.ok ? "ok" : "bad");
      } else {
        bigValue.textContent = "—";
        bigLabel.textContent = res.valid ? "gaz kiritilmagan" : "hisoblanmadi";
      }

      if (!res.valid) {
        status.className = "air-status";
        status.textContent = res.error || "Ma’lumot yetarli emas";
      } else if (!res.active.length) {
        status.className = "air-status";
        status.textContent = "Gaz konsentratsiyalari kiritilmagan";
      } else if (res.exceed.length) {
        status.className = "air-status bad";
        status.textContent = "Me’yor oshgan: " + res.exceed.map(g => g.name).join(", ");
      } else {
        status.className = "air-status ok";
        status.textContent = "Barcha gazlar RET ichida";
      }

      devices.textContent = "";
      if (!res.valid) {
        concl.textContent = res.error || "Hisoblash uchun ma’lumot yetarli emas.";
      } else if (!res.active.length) {
        concl.textContent = "Hisoblash uchun kamida bitta gaz konsentratsiyasini kiriting.";
      } else if (!res.exceed.length) {
        concl.textContent = "Barcha chiqindi gazlarning miqdori ruxsat etilgan tashlama me’yoridan past. Qo‘shimcha tozalash uskunasi talab etilmaydi.";
      } else {
        concl.textContent = "RET dan oshgan gazlar: " +
          res.exceed.map(g => g.name + " (" + fmtNum(g.ratio, 2) + "×)").join(", ") +
          ". Ularni tozalash uchun quyidagi uskunalar tavsiya etiladi:";
        res.exceed.forEach(g => devices.append(el("li", "", g.name + ": " + g.device)));
      }

      if (role === "student" && studentName) {
        const snapshot = {
          h: state.h, l: state.l, b: state.b, w: state.w, tg: state.tg, tx: state.tx,
          co: state.co, no2: state.no2, so2: state.so2, nh3: state.nh3
        };
        scheduleStudentResult(room, studentName, () => ({
          kind: "atmosphere",
          variant: state.variant,
          summary: res.valid && res.worst
            ? res.worst.name + " · M/RET " + fmtNum(res.worst.ratio, 2) + "×"
            : "—",
          status: !res.valid ? "Hisoblanmadi" : res.exceed.length ? "Me’yor oshgan" : "RET ichida",
          bad: res.valid ? res.exceed.length : 0,
          params: snapshot,
          calc: res.valid ? { ds: res.ds, v1: res.v1, dT: res.dT, f: res.f, m: res.m, vm: res.vm, n: res.n } : null,
          gases: res.valid ? res.gases.map(g => ({ id: g.id, name: g.name, c: g.c, m: g.m, ret: g.ret, ratio: g.ratio, ok: g.ok })) : []
        }));
      }
    }

    select.addEventListener("change", () => {
      const v = room.variants.find(x => x.n === +select.value);
      if (!v) return;
      state.variant = v.n;
      AIR_FIELDS.forEach(f => {
        state[f.id] = v[f.id];
        if (inputs[f.id]) inputs[f.id].value = v[f.id] == null ? "" : String(v[f.id]);
      });
      refresh();
    });

    reportBtn.addEventListener("click", () => {
      const res = airCalc(state, consts);
      const num = (v, d) => v == null || !isFinite(v) ? "—" : fmtNum(v, d);
      const lines = [
        "VirtualLab UZ — atmosfera tashlamalari hisoboti",
        "",
        "Sinf honasi kodi: " + room.code,
        "Ish: " + room.title,
        "Variant: " + state.variant,
        "O‘qituvchi: " + room.teacher,
        role === "student" && studentName ? "Talaba: " + studentName : "Rejim: o‘qituvchi",
        "Sana: " + new Date().toLocaleString("uz-UZ"),
        "",
        "Manba parametrlari:",
        "  H = " + num(state.h, 2) + " m, L = " + num(state.l, 2) + " m, B = " + num(state.b, 2) + " m, W = " + num(state.w, 2) + " m/s",
        "  Tg = " + num(state.tg, 1) + " °C, Tx = " + num(state.tx, 1) + " °C",
        "",
        "Oraliq hisoblar:"
      ];
      if (res.valid) {
        lines.push(
          "  Ds = " + num(res.ds, 3) + " m",
          "  V1 = " + num(res.v1, 3) + " m³/s",
          "  ΔT = " + num(res.dT, 1) + " °C",
          "  f = " + num(res.f, 2) + ", m = " + num(res.m, 3) + ", Vm = " + num(res.vm, 3) + ", n = " + num(res.n, 3),
          "  A = 200, F = 1, Cf = 0,5·REK",
          "",
          "Natijalar:"
        );
        res.gases.forEach(g => {
          lines.push("  " + g.name + ": C = " + (g.c == null ? "—" : num(g.c, g.c < 1 ? 3 : 1) + " mg/m³") +
            ", M = " + (g.m == null ? "—" : num(g.m, 4) + " g/s") +
            ", RET = " + (g.ret == null ? "—" : num(g.ret, 4) + " g/s") +
            ", M/RET = " + (g.ratio == null ? "—" : num(g.ratio, 2) + "×") +
            (g.m == null ? "" : g.ok ? " (me’yor ichida)" : " (me’yordan yuqori)"));
        });
        lines.push("", "Xulosa:");
        if (!res.exceed.length) {
          lines.push("  Barcha gazlar RET ichida. Qo‘shimcha tozalash uskunasi talab etilmaydi.");
        } else {
          res.exceed.forEach(g => lines.push("  " + g.name + " uchun: " + g.device));
        }
      } else {
        lines.push("  " + (res.error || "Ma’lumot yetarli emas."));
      }
      saveText("atmosfera-" + room.code + ".txt", lines.join("\n"));
    });

    refresh();
    stopAnim = startAirCanvas(canvas, room, state, consts);
  }

  /* ---------------- canvas animatsiyasi ---------------- */

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function startCanvas(canvas, room, state) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return function () {};
    const smooth = {};
    room.variables.forEach(v => { smooth[v.id] = v.value; });
    let base = 1;
    try { base = Math.max(1e-9, Math.abs(evalFormula(room.expr, state))); } catch (e) { base = 1; }

    let w = 1, h = 1, dpr = 1, raf = 0, last = performance.now();
    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    let ro = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }
    resize();

    function draw(now) {
      if (!canvas.isConnected) { raf = 0; return; }
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      room.variables.forEach(v => {
        smooth[v.id] += (state[v.id] - smooth[v.id]) * Math.min(1, dt * 6);
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#081b2a");
      bg.addColorStop(1, "#050f18");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(110,180,215,.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(150,200,220,.55)";
      ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("AVTOMATIK VIRTUAL MODEL", 16, 22);
      const title = room.title.length > 46 ? room.title.slice(0, 46) + "…" : room.title;
      ctx.fillStyle = "rgba(210,235,245,.75)";
      ctx.font = "600 11px system-ui, -apple-system, sans-serif";
      ctx.fillText(title, 16, 40);

      let val = 0;
      try { val = evalFormula(room.expr, smooth); } catch (e) { val = 0; }
      const norm = clamp(Math.abs(val) / base, 0, 1.5);
      const waveY = h * 0.54;
      const amp = 5 + norm * Math.min(h * 0.15, 62);

      ctx.save();
      ctx.textAlign = "right";
      ctx.fillStyle = "#9ff0e7";
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(
        fmtNum(val, room.result.dec) + (room.result.unit ? " " + room.result.unit : ""),
        w - 16, 30
      );
      ctx.fillStyle = "rgba(150,200,220,.5)";
      ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(room.result.label.toUpperCase(), w - 16, 45);
      ctx.restore();

      for (let L = 0; L < 3; L++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const env = Math.sin(Math.PI * x / w);
          const y = waveY + Math.sin(x * 0.026 + now / 640 + L * 1.7) * amp * env * (1 - L * 0.22);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = L === 0 ? "rgba(97,224,211,.9)" : L === 1 ? "rgba(90,169,255,.4)" : "rgba(245,184,75,.25)";
        ctx.lineWidth = L === 0 ? 2 : 1.2;
        if (L === 0) {
          ctx.shadowColor = "rgba(79,209,197,.55)";
          ctx.shadowBlur = 12;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const n = Math.max(1, room.variables.length);
      const gap = 12;
      const bw = Math.max(26, Math.min(92, (w - 40 - gap * (n - 1)) / n));
      const total = bw * n + gap * (n - 1);
      let bx = (w - total) / 2;
      const barY = h - 58;
      room.variables.forEach(v => {
        const k = clamp((smooth[v.id] - v.min) / (v.max - v.min || 1), 0, 1);
        ctx.fillStyle = "rgba(255,255,255,.06)";
        roundRect(ctx, bx, barY, bw, 10, 5);
        ctx.fill();
        const fillW = Math.max(5, bw * k);
        const grad = ctx.createLinearGradient(bx, 0, bx + fillW, 0);
        grad.addColorStop(0, "rgba(79,209,197,.9)");
        grad.addColorStop(1, "rgba(90,169,255,.75)");
        ctx.fillStyle = grad;
        roundRect(ctx, bx, barY, fillW, 10, 5);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(156,182,200,.85)";
        ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(v.id.toUpperCase(), bx + bw / 2, barY - 8);
        ctx.fillStyle = "rgba(220,240,248,.8)";
        ctx.font = "600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(fmtNum(smooth[v.id], 2) + (v.unit ? " " + v.unit : ""), bx + bw / 2, barY + 26);
        bx += bw + gap;
      });
      ctx.textAlign = "left";

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (ro) ro.disconnect();
    };
  }

  function startAirCanvas(canvas, room, state, consts) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return function () {};
    const parts = [];
    const smooth = { h: isFinite(state.h) ? state.h : 10 };
    let w = 1, h = 1, dpr = 1, raf = 0, last = performance.now(), emit = 0, seeded = false;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    let ro = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }
    resize();

    function spawnAt(ox, oy, spread) {
      parts.push({
        x: ox + (Math.random() - 0.5) * 8,
        y: oy + (Math.random() - 0.5) * 6,
        vx: 22 + Math.min(60, (isFinite(state.w) ? state.w : 14) * 1.4) + Math.random() * 18,
        vy: -(8 + Math.random() * 18),
        r: 2 + Math.random() * 4,
        age: spread ? Math.random() * 2.4 : 0,
        life: 2.6 + Math.random() * 1.8
      });
    }

    function draw(now) {
      if (!canvas.isConnected) { raf = 0; return; }
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const res = airCalc(state, consts);
      smooth.h += ((isFinite(state.h) ? state.h : 10) - smooth.h) * Math.min(1, dt * 4);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#081b2a");
      bg.addColorStop(1, "#050f18");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(110,180,215,.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }

      const worst = res.valid ? res.worst : null;
      const bad = !!(worst && !worst.ok);
      const accent = bad ? "255,122,122" : "97,224,211";

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(150,200,220,.55)";
      ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("ATMOSFERA TARQALISHI", 16, 22);
      ctx.fillStyle = "rgba(210,235,245,.75)";
      ctx.font = "600 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("Variant " + state.variant + " / " + room.variants.length, 16, 40);

      ctx.textAlign = "right";
      ctx.fillStyle = bad ? "#ffb0b0" : "#9ff0e7";
      ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(worst ? fmtNum(worst.ratio, 2) + "×" : "—", w - 16, 30);
      ctx.fillStyle = "rgba(150,200,220,.5)";
      ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(worst ? worst.name + " · M / RET" : "M / RET", w - 16, 45);
      ctx.textAlign = "left";

      const groundY = h - 92;
      const cw = Math.max(14, Math.min(40, w * 0.05));
      const ox = Math.max(cw * 2.2, w * 0.2);
      const stackH = clamp(h * 0.1 + smooth.h / 150 * h * 0.42, h * 0.16, h * 0.62);
      const topY = groundY - stackH;

      ctx.fillStyle = "rgba(38,72,86,.55)";
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = "rgba(120,190,215,.28)";
      ctx.beginPath();
      ctx.moveTo(0, groundY + 0.5);
      ctx.lineTo(w, groundY + 0.5);
      ctx.stroke();

      if (!seeded) {
        seeded = true;
        for (let i = 0; i < 46; i++) {
          spawnAt(ox, topY, true);
          const p = parts[parts.length - 1];
          p.x += p.age * p.vx * 0.55;
          p.y -= p.age * 10;
        }
      }

      emit += dt * (16 + Math.min(20, (isFinite(state.w) ? state.w : 14) * 0.7));
      while (emit >= 1) {
        spawnAt(ox, topY - 4);
        emit -= 1;
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 5 * dt;
        p.r += dt * 4;
        if (p.age > p.life || p.x > w + 24 || p.y < 8) parts.splice(i, 1);
      }
      if (parts.length > 240) parts.splice(0, parts.length - 240);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      parts.forEach(p => {
        const k = 1 - p.age / p.life;
        ctx.globalAlpha = Math.max(0, k) * 0.45;
        ctx.fillStyle = "rgba(" + accent + ",1)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      const grad = ctx.createLinearGradient(ox - cw, 0, ox + cw, 0);
      grad.addColorStop(0, "#7d94a2");
      grad.addColorStop(0.45, "#41565f");
      grad.addColorStop(1, "#263942");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox - cw * 0.72, groundY);
      ctx.lineTo(ox - cw * 0.5, topY);
      ctx.lineTo(ox + cw * 0.5, topY);
      ctx.lineTo(ox + cw * 0.72, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(190,220,232,.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = bad ? "rgba(255,122,122,.85)" : "rgba(97,224,211,.85)";
      ctx.fillRect(ox - cw * 0.56, topY, cw * 1.12, 4);

      ctx.strokeStyle = "rgba(150,200,220,.35)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ox - cw * 1.6, topY);
      ctx.lineTo(ox - cw * 1.6, groundY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(170,210,225,.7)";
      ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("H = " + fmtNum(smooth.h, 1) + " m", ox - cw * 1.75, (topY + groundY) / 2);
      ctx.textAlign = "left";

      if (!res.valid) {
        ctx.fillStyle = "rgba(255,176,176,.85)";
        ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(res.error || "Ma’lumot yetarli emas", Math.min(w * 0.34, 180), groundY - 18);
      }

      const barY = h - 54;
      const gap = 10;
      const totalW = Math.min(w - 48, 520);
      const bw = (totalW - gap * 3) / 4;
      let bx = (w - totalW) / 2;
      res.gases.forEach(g => {
        const k = g.ratio == null ? 0 : clamp(g.ratio / 1.5, 0, 1);
        ctx.fillStyle = "rgba(255,255,255,.07)";
        roundRect(ctx, bx, barY, bw, 6, 3);
        ctx.fill();
        if (g.ratio != null && k > 0) {
          ctx.fillStyle = g.ok ? "rgba(97,224,211,.85)" : "rgba(255,122,122,.9)";
          roundRect(ctx, bx, barY, Math.max(3, bw * k), 6, 3);
          ctx.fill();
        }
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(190,220,232,.75)";
        ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(g.name, bx + bw / 2, barY - 6);
        ctx.fillStyle = g.ratio == null ? "rgba(140,160,170,.6)" : g.ok ? "#9ff0e7" : "#ffb0b0";
        ctx.fillText(g.ratio == null ? "—" : fmtNum(g.ratio, 2) + "×", bx + bw / 2, barY + 21);
        bx += bw + gap;
      });
      ctx.textAlign = "left";

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (ro) ro.disconnect();
    };
  }

  /* ---------------- kirish / chiqish ---------------- */

  function trySession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (!saved || !saved.id) return null;
      return DEMO_TEACHERS.find(t => t.id === saved.id) || null;
    } catch (e) {
      return null;
    }
  }

  function bindLogin() {
    byId("tp-login-form").addEventListener("submit", e => {
      e.preventDefault();
      const id = byId("tp-id").value.trim().toLowerCase();
      const pass = byId("tp-pass").value;
      const err = byId("tp-login-err");
      const found = DEMO_TEACHERS.find(t => t.id.toLowerCase() === id && t.pass === pass);
      if (!found) {
        err.textContent = "ID yoki parol noto‘g‘ri. Demo: ustoz01 / demo2026";
        err.hidden = false;
        return;
      }
      teacher = { id: found.id, name: found.name };
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(teacher)); } catch (e2) {}
      err.hidden = true;
      byId("tp-login-form").reset();
      showPanel();
    });

    byId("tp-logout").addEventListener("click", () => {
      teacher = null;
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      showLogin();
    });
  }

  /* ---------------- talaba kirishi ---------------- */

  function bindJoin() {
    byId("join-form").addEventListener("submit", e => {
      e.preventDefault();
      const err = byId("join-err");
      const code = byId("join-code").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      const name = byId("join-name").value.trim().replace(/\s+/g, " ");
      if (code.length < 4) {
        err.textContent = "Sinf honasi kodini kiriting.";
        err.hidden = false;
        return;
      }
      if (name.length < 3) {
        err.textContent = "Ism va familiyani to‘liq yozing.";
        err.hidden = false;
        return;
      }
      rooms = loadRooms();
      const room = rooms[code];
      if (!room) {
        err.textContent = "Bunday kodli sinf honasi topilmadi. Demo versiyada sinf honasi faqat shu brauzerda yaratilgan bo‘lsa ochiladi.";
        err.hidden = false;
        return;
      }
      if (!Array.isArray(room.participants)) room.participants = [];
      const existing = room.participants.find(p => String(p).toLowerCase() === name.toLowerCase());
      if (!existing) {
        room.participants.push(name);
        rooms[code] = room;
        saveRooms();
      }
      const displayName = existing || name;
      try { localStorage.setItem("gidrostatika-student", displayName); } catch (e2) {}
      const studentInput = byId("student-name");
      if (studentInput) studentInput.value = displayName;
      err.hidden = true;
      byId("join-form").reset();
      openClassroom(room, "student", displayName);
    });
  }

  /* ---------------- umumiy hodisalar ---------------- */

  function bindShell() {
    byId("nav-teacher").addEventListener("click", () => {
      openOverlay("teacher-overlay");
      if (teacher) showPanel();
      else showLogin();
    });
    byId("nav-join").addEventListener("click", () => {
      const nameInput = byId("join-name");
      const saved = byId("student-name");
      if (nameInput && !nameInput.value && saved && saved.value) nameInput.value = saved.value;
      openOverlay("join-overlay");
    });

    document.querySelectorAll("[data-tp-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-tp-close");
        closeOverlay(key === "classroom" ? "classroom-overlay" : key === "join" ? "join-overlay" : "teacher-overlay");
      });
    });

    ["teacher-overlay", "join-overlay"].forEach(id => {
      byId(id).addEventListener("mousedown", e => {
        if (e.target === byId(id)) closeOverlay(id);
      });
    });

    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      if (byId("classroom-overlay") && !byId("classroom-overlay").hidden) closeOverlay("classroom-overlay");
      else if (byId("join-overlay") && !byId("join-overlay").hidden) closeOverlay("join-overlay");
      else if (byId("teacher-overlay") && !byId("teacher-overlay").hidden) closeOverlay("teacher-overlay");
    });

    byId("cr-copy").addEventListener("click", async () => {
      const code = current && current.room ? current.room.code : byId("cr-code").textContent;
      const btn = byId("cr-copy");
      try {
        await navigator.clipboard.writeText(code);
      } catch (e) {
        const range = document.createRange();
        range.selectNodeContents(byId("cr-code"));
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        try { document.execCommand("copy"); } catch (e2) {}
        if (sel) sel.removeAllRanges();
      }
      btn.textContent = "Nusxalandi";
      setTimeout(() => { btn.textContent = "Nusxalash"; }, 1400);
    });

    byId("tp-sample").addEventListener("click", () => {
      saveText("laboratoriya-namuna.json", JSON.stringify(SAMPLE, null, 2));
    });

    byId("tp-guide").addEventListener("click", () => {
      const box = byId("tp-guide-box");
      box.hidden = !box.hidden;
    });

    byId("tp-pick").addEventListener("click", () => byId("tp-file").click());
    byId("tp-file").addEventListener("change", () => {
      const file = byId("tp-file").files && byId("tp-file").files[0];
      byId("tp-file").value = "";
      if (file) handleFile(file);
    });

    const drop = byId("tp-drop");
    drop.addEventListener("click", e => {
      if (e.target === drop) byId("tp-file").click();
    });
    ["dragenter", "dragover"].forEach(ev => {
      drop.addEventListener(ev, e => {
        e.preventDefault();
        e.stopPropagation();
        drop.classList.add("drag");
      });
    });
    ["dragleave", "drop"].forEach(ev => {
      drop.addEventListener(ev, e => {
        e.preventDefault();
        e.stopPropagation();
        drop.classList.remove("drag");
      });
    });
    drop.addEventListener("drop", e => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
  }

  function boot() {
    if (!byId("teacher-overlay")) return;
    rooms = loadRooms();
    const saved = trySession();
    if (saved) {
      teacher = { id: saved.id, name: saved.name };
      showPanel();
    } else {
      showLogin();
    }
    bindLogin();
    bindJoin();
    bindShell();
  }

  boot();

  window.TeacherRoom = {
    parseJSON: roomFromJSON,
    parseText: roomFromText,
    evalFormula: evalFormula,
    rooms: () => rooms,
    open: openClassroom
  };
})();
