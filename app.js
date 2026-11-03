"use strict";

/* ============================================================
   VIRTUAL LABORATORIYA
   Gidrostatika bo‘limi: 6 ta laboratoriya ishi
   Boshqa fanlar subjects.js faylida ulanadi.
   ============================================================ */

const G = 9.81;
const CW = 960;
const CH = 540;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TAU = Math.PI * 2;
const FONT_UI = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const $ = (id) => document.getElementById(id);

/* ---------------- ma'lumotlar ---------------- */

const LIQUIDS = {
  water:    { name: "Suv",              rho: 1000, color: "#2f9fd8", deep: "#0b4a70" },
  sea:      { name: "Dengiz suvi",      rho: 1030, color: "#2389c9", deep: "#093f62" },
  spirit:   { name: "Spirt",            rho: 800,  color: "#9fb9c9", deep: "#365a6d" },
  oil:      { name: "O‘simlik yog‘i",   rho: 920,  color: "#d8b24c", deep: "#6b5220" },
  glycerin: { name: "Gliserin",         rho: 1260, color: "#68c9a8", deep: "#1e6b55" }
};

const SOLIDS = {
  wood:   { name: "Qarag‘ay yog‘ochi", short: "Yog‘och",  rho: 600,   color: "#a9743f", light: "#c99560" },
  ice:    { name: "Muz",               short: "Muz",       rho: 917,   color: "#9fd3ec", light: "#d6effa" },
  abs:    { name: "Plastik (ABS)",     short: "ABS",       rho: 1050,  color: "#8c9bb0", light: "#b7c4d6" },
  alu:    { name: "Alyuminiy",         short: "Al",        rho: 2700,  color: "#b9c6d4", light: "#e1e9f2" },
  glass:  { name: "Shisha",            short: "Shisha",    rho: 2500,  color: "#86c8c2", light: "#c6eae6" },
  iron:   { name: "Temir",             short: "Fe",        rho: 7800,  color: "#798492", light: "#a9b4c2" },
  copper: { name: "Mis",               short: "Cu",        rho: 8900,  color: "#bd7a4c", light: "#e0a97a" },
  lead:   { name: "Qo‘rg‘oshin",       short: "Pb",        rho: 11300, color: "#6f7a8b", light: "#9aa6b8" }
};

/* ---------------- yordamchi funksiyalar ---------------- */

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function roundStep(v, step) { return Math.round(v / step) * step; }

function fmt(v, dec = 2) {
  if (!isFinite(v)) return "—";
  const s = Math.abs(v).toFixed(dec);
  const parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009");
  return (v < 0 ? "−" : "") + (parts[1] ? parts[0] + "," + parts[1] : parts[0]);
}

const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sup(n) { return String(n).split("").map(c => SUP[c] || c).join(""); }

function sci(v, dec = 2) {
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 0.01 && a < 100000) return fmt(v, a < 1 ? Math.max(dec, 4) : dec);
  const e = Math.floor(Math.log10(a));
  const m = v / Math.pow(10, e);
  return fmt(m, dec) + "·10" + sup(e);
}

function hexA(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

function begin(ctx) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, CW, CH);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function initCanvas(id) {
  const c = $(id);
  c.width = CW * DPR;
  c.height = CH * DPR;
  const ctx = c.getContext("2d");
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return ctx;
}

function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, opt) {
  opt = opt || {};
  const size = opt.size || 14;
  const weight = opt.weight || 500;
  ctx.font = weight + " " + size + "px " + (opt.mono ? FONT_MONO : FONT_UI);
  ctx.fillStyle = opt.color || "#e9f4fb";
  ctx.textAlign = opt.align || "left";
  ctx.textBaseline = opt.base || "alphabetic";
  ctx.fillText(str, x, y);
}

function pill(ctx, x, y, str, opt) {
  opt = opt || {};
  const size = opt.size || 11.5;
  const h = opt.h || 26;
  const pad = opt.pad == null ? 10 : opt.pad;
  ctx.font = "600 " + size + "px " + (opt.mono ? FONT_MONO : FONT_UI);
  const w = ctx.measureText(str).width + pad * 2;
  const x0 = opt.align === "right" ? x - w : x;
  rr(ctx, x0, y, w, h, h / 2);
  ctx.fillStyle = opt.bg || "rgba(79,209,197,.10)";
  ctx.fill();
  ctx.strokeStyle = opt.border || "rgba(79,209,197,.30)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = opt.color || "#9ff0e7";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(str, x0 + w / 2, y + h / 2 + 0.5);
  return w;
}

function arrow(ctx, x1, y1, x2, y2, color, width, head) {
  width = width || 2.5;
  head = head || 8;
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(a) * head * 0.7, y2 - Math.sin(a) * head * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.45) * head, y2 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x2 - Math.cos(a + 0.45) * head, y2 - Math.sin(a + 0.45) * head);
  ctx.closePath();
  ctx.fill();
}

function drawBg(ctx, num, title, brand, meta) {
  const bg = ctx.createLinearGradient(0, 0, CW, CH);
  bg.addColorStop(0, "#0a1a29");
  bg.addColorStop(0.55, "#081420");
  bg.addColorStop(1, "#060f18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  const rg = ctx.createRadialGradient(180, 60, 20, 180, 60, 620);
  rg.addColorStop(0, "rgba(55,170,175,.10)");
  rg.addColorStop(1, "rgba(55,170,175,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, CW, CH);

  ctx.strokeStyle = "rgba(110,175,205,.05)";
  ctx.lineWidth = 1;
  for (let x = 24; x < CW; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 72); ctx.lineTo(x, CH); ctx.stroke();
  }
  for (let y = 96; y < CH; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
  }

  ctx.fillStyle = "rgba(79,209,197,.9)";
  ctx.beginPath(); ctx.arc(30, 31, 3, 0, TAU); ctx.fill();
  text(ctx, (brand || "GIDROSTATIKA") + (num ? " · " + num + "-ISH" : " · AMALIYOT"), 42, 35, { size: 10.5, color: "rgba(150,200,215,.7)", weight: 700 });
  text(ctx, title, 30, 60, { size: 18, color: "rgba(233,246,255,.94)", weight: 650 });
  text(ctx, meta || "g = 9,81 m/s²", CW - 30, 35, { size: 11.5, color: "rgba(150,195,215,.55)", align: "right", mono: true });
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function makeBubbles(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      x: Math.random(),
      y: Math.random(),
      r: 1.4 + Math.random() * 2.4,
      v: 0.025 + Math.random() * 0.055,
      a: 0.08 + Math.random() * 0.16
    });
  }
  return arr;
}

/* Canvaslar */
const ctx1 = initCanvas("canvas1");
const ctx2 = initCanvas("canvas2");
const ctx3 = initCanvas("canvas3");
const ctx4 = initCanvas("canvas4");
const ctx5 = initCanvas("canvas5");
const ctx6 = initCanvas("canvas6");

/* ============================================================
   1-LABORATORIYA — bosim va chuqurlik
   ============================================================ */

const lab1 = (() => {
  const st = {
    key: "water",
    h: 0.8,
    hAnim: 0.8,
    p: 0,
    needle: 0.5,
    bubbles: makeBubbles(18)
  };

  const el = {
    liquid: $("l1-liquid"),
    h: $("l1-h"),
    hOut: $("l1-h-out"),
    rho: $("l1-rho"),
    hVal: $("l1-h-val"),
    pPa: $("l1-p-pa"),
    pkPa: $("l1-p-kpa"),
    big: $("l1-big"),
    calc: $("l1-calc")
  };

  function compute() {
    st.key = el.liquid.value;
    st.h = +el.h.value;
    const liq = LIQUIDS[st.key];
    st.p = liq.rho * G * st.h;

    el.hOut.textContent = fmt(st.h, 2) + " m";
    setText("l1-rho", fmt(liq.rho, 0));
    setText("l1-h-val", fmt(st.h, 2));
    setText("l1-p-pa", fmt(st.p, 0));
    setText("l1-p-kpa", fmt(st.p / 1000, 2));
    setText("l1-big", fmt(st.p / 1000, 2) + " kPa");

    el.calc.textContent =
      "p = ρ · g · h\n" +
      "p = " + fmt(liq.rho, 0) + " kg/m³ × " + fmt(G, 2) + " m/s² × " + fmt(st.h, 2) + " m\n" +
      "p = " + fmt(st.p, 0) + " Pa\n" +
      "p = " + fmt(st.p / 1000, 2) + " kPa\n\n" +
      "Chuqurlik " + fmt(st.h, 2) + " m bo‘lganda datchikka shu bosim ta’sir qiladi.";
  }

  el.liquid.addEventListener("input", compute);
  el.h.addEventListener("input", compute);
  compute();

  function wave(x, t) {
    return Math.sin(x * 0.034 + t * 1.5) * 2.1 + Math.sin(x * 0.012 - t * 1.1) * 1.3;
  }

  function draw(t, dt) {
    begin(ctx1);
    drawBg(ctx1, "1", "Bosim va chuqurlik");

    const liq = LIQUIDS[st.key];
    st.hAnim += (st.h - st.hAnim) * Math.min(1, dt * 8);
    const pAnim = liq.rho * G * st.hAnim;
    const pMax = liq.rho * G * 1.5;
    st.needle += (pAnim / pMax - st.needle) * Math.min(1, dt * 9);

    const tank = { x: 285, y: 112, w: 300, h: 382 };
    const surf = 168;
    const bottom = tank.y + tank.h - 8;
    const scale = 200;
    const probeX = tank.x + tank.w / 2;
    const probeY = surf + st.hAnim * scale;

    /* shtativ va datchik kabeli */
    ctx1.strokeStyle = "rgba(185,205,218,.35)";
    ctx1.lineWidth = 3;
    ctx1.beginPath(); ctx1.moveTo(probeX, 88); ctx1.lineTo(probeX, probeY - 26); ctx1.stroke();
    ctx1.fillStyle = "#9aa7b6";
    rr(ctx1, probeX - 34, 78, 68, 14, 7); ctx1.fill();
    ctx1.fillStyle = "rgba(255,255,255,.18)";
    rr(ctx1, probeX - 30, 81, 60, 3, 1.5); ctx1.fill();

    /* idish orqa oynasi */
    rr(ctx1, tank.x, tank.y, tank.w, tank.h, 20);
    ctx1.fillStyle = "rgba(120,190,225,.045)";
    ctx1.fill();

    /* suyuqlik */
    ctx1.save();
    rr(ctx1, tank.x + 5, tank.y + 5, tank.w - 10, tank.h - 10, 16);
    ctx1.clip();

    const wg = ctx1.createLinearGradient(0, surf, 0, bottom);
    wg.addColorStop(0, hexA(liq.color, 0.7));
    wg.addColorStop(0.6, hexA(liq.color, 0.5));
    wg.addColorStop(1, hexA(liq.deep, 0.92));
    ctx1.fillStyle = wg;
    ctx1.beginPath();
    ctx1.moveTo(tank.x, surf + wave(tank.x, t));
    for (let x = tank.x; x <= tank.x + tank.w; x += 7) {
      ctx1.lineTo(x, surf + wave(x, t));
    }
    ctx1.lineTo(tank.x + tank.w, bottom + 12);
    ctx1.lineTo(tank.x, bottom + 12);
    ctx1.closePath();
    ctx1.fill();

    /* pufakchalar */
    st.bubbles.forEach(b => {
      b.y -= b.v * dt;
      if (b.y < -0.02) { b.y = 1.02; b.x = Math.random(); }
      const bx = tank.x + 18 + b.x * (tank.w - 36);
      const by = surf + 18 + b.y * (bottom - surf - 26);
      ctx1.beginPath();
      ctx1.arc(bx, by, b.r, 0, TAU);
      ctx1.fillStyle = "rgba(220,245,255," + b.a + ")";
      ctx1.fill();
    });

    /* yorug‘lik aksi */
    const shine = ctx1.createLinearGradient(tank.x, 0, tank.x + tank.w, 0);
    shine.addColorStop(0, "rgba(255,255,255,0)");
    shine.addColorStop(0.28, "rgba(255,255,255,.06)");
    shine.addColorStop(0.34, "rgba(255,255,255,0)");
    ctx1.fillStyle = shine;
    ctx1.fillRect(tank.x, surf, tank.w, bottom - surf);
    ctx1.restore();

    /* sath chizig‘i */
    ctx1.strokeStyle = "rgba(215,243,255,.55)";
    ctx1.lineWidth = 1.6;
    ctx1.beginPath();
    for (let x = tank.x + 4; x <= tank.x + tank.w - 4; x += 8) {
      const y = surf + wave(x, t);
      if (x === tank.x + 4) ctx1.moveTo(x, y); else ctx1.lineTo(x, y);
    }
    ctx1.stroke();

    /* shisha devorlari */
    rr(ctx1, tank.x, tank.y, tank.w, tank.h, 20);
    ctx1.strokeStyle = "rgba(185,225,245,.38)";
    ctx1.lineWidth = 2;
    ctx1.stroke();
    ctx1.strokeStyle = "rgba(255,255,255,.09)";
    ctx1.lineWidth = 6;
    ctx1.beginPath();
    ctx1.moveTo(tank.x + 14, tank.y + 30);
    ctx1.lineTo(tank.x + 14, tank.y + tank.h - 32);
    ctx1.stroke();

    /* chizg‘ich */
    const rx = 252;
    ctx1.strokeStyle = "rgba(165,200,220,.32)";
    ctx1.lineWidth = 1;
    ctx1.beginPath(); ctx1.moveTo(rx, surf); ctx1.lineTo(rx, surf + 1.5 * scale); ctx1.stroke();
    for (let i = 0; i <= 15; i++) {
      const m = i * 0.1;
      const y = surf + m * scale;
      const major = i % 5 === 0;
      const len = major ? 11 : 6;
      ctx1.beginPath();
      ctx1.moveTo(rx, y);
      ctx1.lineTo(rx - len, y);
      ctx1.strokeStyle = major ? "rgba(190,225,240,.55)" : "rgba(165,200,220,.22)";
      ctx1.stroke();
      if (major) {
        const lab = i === 0 ? "0" : (i === 15 ? "1,5" : fmt(m, 1));
        text(ctx1, lab, rx - 16, y + 4, { size: 10, color: "rgba(170,205,225,.6)", align: "right", mono: true });
      }
    }
    text(ctx1, "m", rx - 16, surf + 1.5 * scale + 18, { size: 10, color: "rgba(170,205,225,.4)", align: "right", mono: true });

    /* chuqurlik chizig‘i */
    ctx1.setLineDash([5, 6]);
    ctx1.strokeStyle = "rgba(79,209,197,.32)";
    ctx1.lineWidth = 1;
    ctx1.beginPath(); ctx1.moveTo(rx - 10, probeY); ctx1.lineTo(tank.x + tank.w - 12, probeY); ctx1.stroke();
    ctx1.setLineDash([]);

    pill(ctx1, tank.x + tank.w - 12, probeY - 35, "h = " + fmt(st.hAnim, 2) + " m", {
      align: "right", bg: "rgba(4,14,22,.78)", border: "rgba(79,209,197,.35)",
      color: "#8fe9df", size: 11, h: 23
    });

    /* datchik */
    ctx1.strokeStyle = "rgba(200,216,226,.55)";
    ctx1.lineWidth = 2;
    ctx1.beginPath(); ctx1.moveTo(probeX, probeY - 25); ctx1.lineTo(probeX, probeY); ctx1.stroke();

    ctx1.beginPath(); ctx1.arc(probeX, probeY, 17, 0, TAU);
    ctx1.fillStyle = "#b9c7d3"; ctx1.fill();
    ctx1.beginPath(); ctx1.arc(probeX, probeY, 11, 0, TAU);
    ctx1.fillStyle = hexA(liq.color, 0.95); ctx1.fill();
    ctx1.strokeStyle = "rgba(235,250,255,.6)"; ctx1.lineWidth = 1; ctx1.stroke();

    const ratio = clamp(pAnim / pMax, 0, 1);
    const len = 6 + 24 * ratio;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const x1 = probeX + Math.cos(a) * (36 + len);
      const y1 = probeY + Math.sin(a) * (36 + len);
      const x2 = probeX + Math.cos(a) * 30;
      const y2 = probeY + Math.sin(a) * 30;
      arrow(ctx1, x1, y1, x2, y2, "rgba(246,184,75,.72)", 2, 5);
    }
    text(ctx1, "datchik", probeX - 58, probeY + 4, { size: 10, color: "rgba(180,210,225,.55)", align: "right" });

    /* suyuqlik yorlig‘i */
    pill(ctx1, CW - 30, 92, liq.name + " · " + fmt(liq.rho, 0) + " kg/m³", {
      align: "right", bg: "rgba(11,28,42,.85)", border: "rgba(150,205,235,.18)",
      color: "#cfe6f2", size: 11.5, h: 28
    });

    /* bosim o‘lchagich */
    const gx = 800, gy = 272, gr = 108;
    const start = Math.PI * 0.75;
    const end = Math.PI * 2.25;
    const span = end - start;

    ctx1.beginPath(); ctx1.arc(gx, gy, gr, 0, TAU);
    ctx1.fillStyle = "rgba(6,16,26,.92)"; ctx1.fill();
    ctx1.strokeStyle = "rgba(160,210,235,.24)"; ctx1.lineWidth = 1.5; ctx1.stroke();

    ctx1.beginPath(); ctx1.arc(gx, gy, gr - 16, start, end);
    ctx1.strokeStyle = "rgba(120,190,215,.22)"; ctx1.lineWidth = 2; ctx1.stroke();

    for (let i = 0; i <= 6; i++) {
      const a = start + span * i / 6;
      const r1 = gr - 16;
      const r2 = gr - 28;
      ctx1.beginPath();
      ctx1.moveTo(gx + Math.cos(a) * r1, gy + Math.sin(a) * r1);
      ctx1.lineTo(gx + Math.cos(a) * r2, gy + Math.sin(a) * r2);
      ctx1.strokeStyle = "rgba(180,220,240,.45)";
      ctx1.lineWidth = i % 2 === 0 ? 2 : 1;
      ctx1.stroke();
      if (i % 2 === 0) {
        const lp = gr - 45;
        text(ctx1, fmt(pMax * i / 6 / 1000, 1), gx + Math.cos(a) * lp, gy + Math.sin(a) * lp + 4, {
          size: 9.5, color: "rgba(170,205,225,.6)", align: "center", mono: true
        });
      }
    }

    const na = start + span * clamp(st.needle, 0, 1);
    ctx1.strokeStyle = "#f6b84b";
    ctx1.lineWidth = 3.5;
    ctx1.beginPath();
    ctx1.moveTo(gx, gy);
    ctx1.lineTo(gx + Math.cos(na) * (gr - 30), gy + Math.sin(na) * (gr - 30));
    ctx1.stroke();
    ctx1.beginPath(); ctx1.arc(gx, gy, 8, 0, TAU); ctx1.fillStyle = "#f6b84b"; ctx1.fill();
    ctx1.beginPath(); ctx1.arc(gx, gy, 4, 0, TAU); ctx1.fillStyle = "#0a1620"; ctx1.fill();
    text(ctx1, "kPa", gx, gy + 34, { size: 11, color: "rgba(160,200,220,.6)", align: "center", weight: 600 });
    text(ctx1, fmt(pAnim / 1000, 2), gx, gy + 70, { size: 26, color: "#f6d79b", align: "center", weight: 650, mono: true });
    text(ctx1, "BOSIM O‘LCHAGICH", gx, gy - gr - 18, { size: 10.5, color: "rgba(160,200,220,.5)", align: "center", weight: 700 });
    text(ctx1, "p = ρ·g·h", gx, gy + 112, { size: 12, color: "rgba(150,200,220,.55)", align: "center", mono: true });

    text(ctx1, "Shaffof idish · suyuqlik", tank.x + tank.w / 2, tank.y + tank.h + 28, {
      size: 11, color: "rgba(160,200,220,.5)", align: "center"
    });
    text(ctx1, "Datchik chuqurlikka tushirilganda bosim ortadi", 30, 514, {
      size: 11.5, color: "rgba(150,195,215,.5)"
    });
  }

  function report() {
    const liq = LIQUIDS[st.key];
    return {
      title: "1-laboratoriya. Suyuqlik bosimi va chuqurlik",
      goal: "Gidrostatik bosimning chuqurlik va suyuqlik zichligiga bog‘liqligini tekshirish.",
      equipment: "Shaffof idish, o‘lchov chizg‘ichi, bosim datchigi, bosim o‘lchagich.",
      rows: [
        ["Suyuqlik", liq.name],
        ["Zichlik, ρ", fmt(liq.rho, 0) + " kg/m³"],
        ["Chuqurlik, h", fmt(st.h, 2) + " m"],
        ["Erkin tushish tezlanishi, g", "9,81 m/s²"],
        ["Bosim, p", fmt(st.p, 0) + " Pa = " + fmt(st.p / 1000, 2) + " kPa"]
      ],
      calc: [
        "p = ρ·g·h",
        "p = " + fmt(liq.rho, 0) + " kg/m³ × 9,81 m/s² × " + fmt(st.h, 2) + " m = " + fmt(st.p, 0) + " Pa",
        "p = " + fmt(st.p / 1000, 2) + " kPa"
      ],
      conclusion: liq.name + " uchun " + fmt(st.h, 2) + " m chuqurlikda bosim " + fmt(st.p / 1000, 2) + " kPa ga teng. Chuqurlik ortishi bilan bosim chiziqli ravishda ortadi."
    };
  }

  return { draw, report };
})();

/* ============================================================
   2-LABORATORIYA — gidravlik press
   ============================================================ */

const lab2 = (() => {
  const st = {
    f1: 100, d1: 6, d2: 18, s1: 6, s1Anim: 6,
    anim: -1, animFrom: 0, flow: 0,
    a1: 0, a2: 0, pPa: 0, pNcm: 0, f2: 0, k: 0, s2: 0, work: 0, mass: 0
  };

  const el = {
    f1: $("l2-f1"), f1Out: $("l2-f1-out"),
    d1: $("l2-d1"), d1Out: $("l2-d1-out"),
    d2: $("l2-d2"), d2Out: $("l2-d2-out"),
    s1: $("l2-s1"), s1Out: $("l2-s1-out"),
    press: $("l2-press"),
    calc: $("l2-calc")
  };

  function calc() {
    const a1cm = Math.PI * st.d1 * st.d1 / 4;
    const a2cm = Math.PI * st.d2 * st.d2 / 4;
    const a1m = a1cm / 10000;
    const a2m = a2cm / 10000;

    st.a1 = a1cm;
    st.a2 = a2cm;
    st.pNcm = st.f1 / a1cm;
    st.pPa = st.pNcm * 10000;
    st.f2 = st.pPa * a2m;
    st.k = a2cm / a1cm;
    st.s2 = st.s1Anim * a1cm / a2cm;
    st.work = st.f1 * (st.s1Anim / 100);
    st.mass = st.f2 / G;

    el.f1Out.textContent = fmt(st.f1, 0) + " N";
    el.d1Out.textContent = fmt(st.d1, 1) + " sm";
    el.d2Out.textContent = fmt(st.d2, 0) + " sm";
    el.s1Out.textContent = fmt(st.s1Anim, 1) + " sm";

    setText("l2-a1", fmt(st.a1, 1));
    setText("l2-a2", fmt(st.a2, 1));
    setText("l2-p", fmt(st.pPa / 1000, 1));
    setText("l2-f2", fmt(st.f2, st.f2 >= 100 ? 0 : 1));
    setText("l2-k", fmt(st.k, 1));
    setText("l2-s2", fmt(st.s2, 2));
    setText("l2-work", fmt(st.work, 1));
    setText("l2-mass", fmt(st.mass, 1));
    setText("l2-big", fmt(st.f2, st.f2 >= 100 ? 0 : 1) + " N");

    el.calc.textContent =
      "p = F₁ / A₁ = " + fmt(st.f1, 0) + " N / " + fmt(st.a1, 2) + " sm²\n" +
      "p = " + fmt(st.pNcm, 2) + " N/sm² = " + fmt(st.pPa / 1000, 1) + " kPa\n\n" +
      "F₂ = p · A₂ = " + fmt(st.pNcm, 2) + " × " + fmt(st.a2, 2) + " = " + fmt(st.f2, 1) + " N\n" +
      "K = A₂ / A₁ = " + fmt(st.k, 2) + " marta\n" +
      "s₂ = s₁ · A₁ / A₂ = " + fmt(st.s1Anim, 1) + " × " + fmt(st.a1 / st.a2, 3) + " = " + fmt(st.s2, 2) + " sm\n" +
      "W = F₁ · s₁ = " + fmt(st.f1, 0) + " × " + fmt(st.s1Anim / 100, 3) + " = " + fmt(st.work, 2) + " J\n" +
      "F₂ · s₂ = " + fmt(st.work, 2) + " J — ish saqlanadi.";
  }

  function readInputs() {
    st.f1 = +el.f1.value;
    st.d1 = +el.d1.value;
    st.d2 = +el.d2.value;
    if (st.anim < 0) {
      st.s1 = +el.s1.value;
      st.s1Anim = st.s1;
    }
    calc();
  }

  el.f1.addEventListener("input", readInputs);
  el.d1.addEventListener("input", readInputs);
  el.d2.addEventListener("input", readInputs);
  el.s1.addEventListener("input", () => {
    st.anim = -1;
    st.s1 = +el.s1.value;
    st.s1Anim = st.s1;
    calc();
  });
  el.press.addEventListener("click", () => {
    if (st.anim >= 0) return;
    st.animFrom = st.s1Anim;
    st.anim = 0;
  });
  readInputs();

  function drawCylinder(c, liquidTop) {
    rr(ctx2, c.x, c.top, c.w, c.bottom - c.top, 16);
    ctx2.fillStyle = "rgba(120,190,225,.045)";
    ctx2.fill();
    ctx2.strokeStyle = "rgba(185,225,245,.34)";
    ctx2.lineWidth = 2.5;
    ctx2.stroke();

    ctx2.save();
    rr(ctx2, c.ix, c.top + 8, c.iw, c.bottom - c.top - 8, 10);
    ctx2.clip();
    const lg = ctx2.createLinearGradient(0, liquidTop, 0, c.bottom);
    lg.addColorStop(0, "rgba(63,175,225,.55)");
    lg.addColorStop(1, "rgba(13,72,110,.78)");
    ctx2.fillStyle = lg;
    ctx2.fillRect(c.ix, liquidTop, c.iw, c.bottom - liquidTop + 10);
    ctx2.fillStyle = "rgba(255,255,255,.07)";
    ctx2.fillRect(c.ix + 8, liquidTop, 8, c.bottom - liquidTop);
    ctx2.restore();

    ctx2.strokeStyle = "rgba(200,235,250,.14)";
    ctx2.lineWidth = 5;
    ctx2.beginPath();
    ctx2.moveTo(c.ix + 5, c.top + 18);
    ctx2.lineTo(c.ix + 5, c.bottom - 18);
    ctx2.stroke();
  }

  function drawPiston(c, y, isBig) {
    const cx = c.x + c.w / 2;
    const pg = ctx2.createLinearGradient(0, y, 0, y + 18);
    pg.addColorStop(0, "#dfe7ee");
    pg.addColorStop(0.45, "#a7b5c2");
    pg.addColorStop(1, "#7c8a97");

    if (!isBig) {
      ctx2.fillStyle = "#9aa8b7";
      rr(ctx2, cx - 13, y - 72, 26, 72, 6);
      ctx2.fill();
      ctx2.fillStyle = "rgba(255,255,255,.25)";
      ctx2.fillRect(cx - 9, y - 70, 5, 66);
      ctx2.fillStyle = "#b7c3cf";
      rr(ctx2, cx - 44, y - 84, 88, 12, 6);
      ctx2.fill();
      ctx2.strokeStyle = "rgba(255,255,255,.25)";
      ctx2.lineWidth = 1;
      ctx2.stroke();
    }

    rr(ctx2, c.ix - 8, y, c.iw + 16, isBig ? 19 : 16, 7);
    ctx2.fillStyle = pg;
    ctx2.fill();
    ctx2.strokeStyle = "rgba(240,250,255,.45)";
    ctx2.lineWidth = 1.2;
    ctx2.stroke();

    ctx2.fillStyle = "rgba(31,45,58,.75)";
    rr(ctx2, c.ix - 2, y + (isBig ? 6 : 5), c.iw + 4, 4, 2);
    ctx2.fill();
  }

  function draw(t, dt) {
    begin(ctx2);
    drawBg(ctx2, "2", "Gidravlik press");

    if (st.anim >= 0) {
      st.anim += dt;
      let v;
      if (st.anim < 0.9) {
        v = lerp(st.animFrom, 15, ease(st.anim / 0.9));
      } else if (st.anim < 1.5) {
        v = 15;
      } else if (st.anim < 2.3) {
        v = lerp(15, st.s1, ease((st.anim - 1.5) / 0.8));
      } else {
        v = st.s1;
        st.anim = -1;
      }
      st.s1Anim = v;
      el.s1.value = v.toFixed(1);
      calc();
    }

    st.flow = (st.flow + dt * (st.anim >= 0 ? 0.55 : 0.08)) % 1;

    const A = { x: 135, w: 135, top: 145, bottom: 490, ix: 148, iw: 109 };
    const B = { x: 540, w: 300, top: 145, bottom: 490, ix: 552, iw: 276 };
    const smallBase = 232;
    const bigBase = 244;
    const push = (st.s1Anim / 15) * 95;
    const lift = (st.s2 / 15) * 95;
    const smallY = smallBase + push;
    const bigY = bigBase - lift;

    /* stol */
    rr(ctx2, 80, 490, 800, 22, 9);
    const tg = ctx2.createLinearGradient(0, 490, 0, 512);
    tg.addColorStop(0, "#243748");
    tg.addColorStop(1, "#101d29");
    ctx2.fillStyle = tg;
    ctx2.fill();
    ctx2.strokeStyle = "rgba(170,210,235,.15)";
    ctx2.lineWidth = 1;
    ctx2.stroke();

    /* ulash trubasi */
    rr(ctx2, A.x + A.w - 14, 438, B.x - (A.x + A.w) + 28, 52, 10);
    ctx2.fillStyle = "rgba(120,190,225,.06)";
    ctx2.fill();
    ctx2.strokeStyle = "rgba(185,225,245,.3)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.fillStyle = "rgba(30,120,165,.6)";
    rr(ctx2, 250, 458, 300, 24, 4);
    ctx2.fill();

    /* silindrlar */
    drawCylinder(A, smallY + 16);
    drawCylinder(B, bigY + 19);

    /* oqim zarralari */
    for (let i = 0; i < 9; i++) {
      const px = 268 + ((i / 9 + st.flow) % 1) * 255;
      ctx2.beginPath();
      ctx2.arc(px, 470, 2.3, 0, TAU);
      ctx2.fillStyle = "rgba(170,230,255,.55)";
      ctx2.fill();
    }
    if (st.anim >= 0) {
      arrow(ctx2, 300, 432, 370, 432, "rgba(120,220,245,.75)", 2, 7);
      arrow(ctx2, 390, 432, 460, 432, "rgba(120,220,245,.75)", 2, 7);
    }

    /* porshenlar */
    drawPiston(A, smallY, false);
    drawPiston(B, bigY, true);

    /* yuk */
    const loadW = 200;
    const loadX = B.x + (B.w - loadW) / 2;
    const loadH = 66;
    rr(ctx2, loadX, bigY - loadH - 5, loadW, loadH, 10);
    const lgd = ctx2.createLinearGradient(0, bigY - loadH, 0, bigY);
    lgd.addColorStop(0, "#2d455b");
    lgd.addColorStop(1, "#16283a");
    ctx2.fillStyle = lgd;
    ctx2.fill();
    ctx2.strokeStyle = "rgba(140,200,235,.35)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    text(ctx2, "YUK", B.x + B.w / 2, bigY - loadH / 2 - 6, { size: 11, color: "rgba(150,200,225,.6)", align: "center", weight: 700 });
    text(ctx2, fmt(st.f2, st.f2 >= 100 ? 0 : 1) + " N", B.x + B.w / 2, bigY - loadH / 2 + 16, { size: 18, color: "#e7f7ff", align: "center", weight: 650, mono: true });
    text(ctx2, fmt(st.mass, 1) + " kg", B.x + B.w / 2, bigY - 14, { size: 10.5, color: "rgba(170,210,230,.6)", align: "center", mono: true });

    /* F1 */
    const f1len = 34 + 58 * (st.f1 / 500);
    const ax = A.x + A.w / 2;
    arrow(ctx2, ax, smallY - 96 - f1len, ax, smallY - 91, "#f6b84b", 3, 10);
    text(ctx2, "F₁ = " + fmt(st.f1, 0) + " N", ax, smallY - 104 - f1len, { size: 12, color: "#f6cf82", align: "center", weight: 650, mono: true });

    /* F2 */
    const f2x = B.x + B.w / 2;
    arrow(ctx2, f2x, bigY + 112, f2x, bigY + 26, "#4fd1c5", 3, 10);
    text(ctx2, "F₂ = " + fmt(st.f2, st.f2 >= 100 ? 0 : 1) + " N", f2x + 14, bigY + 74, { size: 12, color: "#8ff0e5", weight: 650, mono: true });

    /* porshen yuzalari */
    pill(ctx2, A.x + A.w / 2, 405, "A₁ = " + fmt(st.a1, 1) + " sm²", {
      align: "center", bg: "rgba(5,18,30,.82)", border: "rgba(90,169,255,.28)",
      color: "#cfe4ff", size: 11, h: 25
    });
    pill(ctx2, B.x + B.w / 2, 405, "A₂ = " + fmt(st.a2, 1) + " sm²", {
      align: "center", bg: "rgba(5,18,30,.82)", border: "rgba(90,169,255,.28)",
      color: "#cfe4ff", size: 11, h: 25
    });

    /* yo‘llar */
    ctx2.setLineDash([5, 5]);
    ctx2.strokeStyle = "rgba(180,210,230,.35)";
    ctx2.lineWidth = 1;
    ctx2.beginPath(); ctx2.moveTo(A.x - 4, smallBase + 8); ctx2.lineTo(A.x + A.w + 4, smallBase + 8); ctx2.stroke();
    ctx2.beginPath(); ctx2.moveTo(B.x - 4, bigBase + 9); ctx2.lineTo(B.x + B.w + 4, bigBase + 9); ctx2.stroke();
    ctx2.setLineDash([]);
    pill(ctx2, A.x - 6, smallY - 6, "s₁ = " + fmt(st.s1Anim, 1) + " sm", {
      align: "right", bg: "rgba(4,14,22,.8)", border: "rgba(246,184,75,.3)",
      color: "#f6cf82", size: 10.5, h: 23
    });
    pill(ctx2, CW - 26, bigY - 46, "s₂ = " + fmt(st.s2, 2) + " sm", {
      align: "right", bg: "rgba(4,14,22,.8)", border: "rgba(79,209,197,.3)",
      color: "#9ff0e7", size: 10.5, h: 23
    });

    /* bosim */
    pill(ctx2, 420, 386, "p = " + fmt(st.pPa / 1000, 1) + " kPa", {
      align: "center", bg: "rgba(12,30,45,.92)", border: "rgba(79,209,197,.3)",
      color: "#9ff0e7", size: 13, h: 30, pad: 14
    });
    text(ctx2, "Paskal qonuni: bosim suyuqlikning har bir nuqtasida bir xil", 420, 430, {
      size: 10.5, color: "rgba(160,200,220,.55)", align: "center"
    });

    text(ctx2, "Kichik porshen", A.x + A.w / 2, 530, { size: 10.5, color: "rgba(150,195,215,.5)", align: "center" });
    text(ctx2, "Katta porshen", B.x + B.w / 2, 530, { size: 10.5, color: "rgba(150,195,215,.5)", align: "center" });
  }

  function report() {
    return {
      title: "2-laboratoriya. Gidravlik press (Paskal qonuni)",
      goal: "Kichik porshenga berilgan kuchning katta porshenda qanchalik kuchayishini aniqlash.",
      equipment: "Gidravlik press modeli, ikkita porshen, yuk, bosim o‘lchagich, chizg‘ich.",
      rows: [
        ["Kichik porshenga kuch, F₁", fmt(st.f1, 0) + " N"],
        ["Diametrlar, d₁ / d₂", fmt(st.d1, 1) + " sm / " + fmt(st.d2, 0) + " sm"],
        ["Yuzalar, A₁ / A₂", fmt(st.a1, 1) + " sm² / " + fmt(st.a2, 1) + " sm²"],
        ["Bosim, p", fmt(st.pPa / 1000, 1) + " kPa"],
        ["Katta porshendagi kuch, F₂", fmt(st.f2, 1) + " N"],
        ["Kuch yutug‘i, K", fmt(st.k, 2) + " marta"],
        ["Kichik porshen yo‘li, s₁", fmt(st.s1Anim, 1) + " sm"],
        ["Katta porshen yo‘li, s₂", fmt(st.s2, 2) + " sm"],
        ["Bajarilgan ish, W", fmt(st.work, 2) + " J"]
      ],
      calc: [
        "p = F₁/A₁ = " + fmt(st.f1, 0) + " / " + fmt(st.a1, 2) + " = " + fmt(st.pNcm, 2) + " N/sm² = " + fmt(st.pPa / 1000, 1) + " kPa",
        "F₂ = p·A₂ = " + fmt(st.pNcm, 2) + " × " + fmt(st.a2, 2) + " = " + fmt(st.f2, 1) + " N",
        "F₂/F₁ = " + fmt(st.k, 2),
        "s₂ = s₁·A₁/A₂ = " + fmt(st.s2, 2) + " sm",
        "W = F₁·s₁ = F₂·s₂ = " + fmt(st.work, 2) + " J"
      ],
      conclusion: "Kichik porshendagi " + fmt(st.f1, 0) + " N kuch " + fmt(st.f2, 1) + " N gacha kuchaydi, ya’ni " + fmt(st.k, 2) + " marta. Yo‘l shu marta kamayadi, bajarilgan ish esa o‘zgarmaydi."
    };
  }

  return { draw, report };
})();

/* ============================================================
   3-LABORATORIYA — Arximed kuchi
   ============================================================ */

const lab3 = (() => {
  const st = {
    solid: "wood", liquid: "water",
    f: 0.5, fAnim: 0.5,
    mode: "held", sink: false,
    bottomY: 0, init: false,
    rhoS: 0, rhoL: 0, mass: 0, P: 0, FA: 0, FAfull: 0,
    fEq: 0, Vsub: 0, dh: 0,
    bubbles: makeBubbles(12)
  };

  const el = {
    solid: $("l3-solid"),
    liquid: $("l3-liquid"),
    f: $("l3-f"),
    fOut: $("l3-f-out"),
    release: $("l3-release"),
    hold: $("l3-hold"),
    state: $("l3-state"),
    calc: $("l3-calc")
  };

  function compute() {
    st.solid = el.solid.value;
    st.liquid = el.liquid.value;

    const so = SOLIDS[st.solid];
    const li = LIQUIDS[st.liquid];
    st.rhoS = so.rho;
    st.rhoL = li.rho;

    if (st.mode === "released") {
      st.sink = st.rhoS >= st.rhoL;
      st.f = st.sink ? 1 : st.rhoS / st.rhoL;
      el.f.value = (st.f * 100).toFixed(1);
    } else {
      st.f = +el.f.value / 100;
    }

    const V = 0.001;
    st.mass = st.rhoS * V;
    st.P = st.mass * G;
    st.FAfull = st.rhoL * G * V;
    st.FA = st.FAfull * st.f;
    st.fEq = st.rhoS / st.rhoL;
    st.Vsub = st.f * 1000;
    st.dh = st.Vsub / 200;

    el.fOut.textContent = fmt(st.f * 100, 0) + " %";

    setText("l3-rho-s", fmt(st.rhoS, 0));
    setText("l3-rho-l", fmt(st.rhoL, 0));
    setText("l3-v", "1,000");
    setText("l3-m", fmt(st.mass, 3));
    setText("l3-p", fmt(st.P, 2));
    setText("l3-fa", fmt(st.FA, 2));
    setText("l3-fa-full", fmt(st.FAfull, 2));
    setText("l3-vsub", fmt(st.Vsub, 0));
    setText("l3-dh", fmt(st.dh, 1));
    setText("l3-feq", fmt(st.fEq * 100, 0));
    setText("l3-big", fmt(st.FAfull, 2) + " N");

    let bannerClass = "held";
    let bannerText = "";
    if (st.mode === "held") {
      bannerText = "Qo‘lda ushlab turilgan · " + (st.rhoS < st.rhoL ? "suzishga intiladi" : st.rhoS > st.rhoL ? "cho‘kishga intiladi" : "muvozanat");
      bannerClass = "held";
    } else if (st.sink) {
      bannerText = "Cho‘kadi — menzurka tubida yotadi";
      bannerClass = "bad";
    } else {
      bannerText = "Muvozanatda suzadi — " + fmt(st.f * 100, 0) + "% qismi botgan";
      bannerClass = "ok";
    }
    el.state.textContent = bannerText;
    el.state.className = "state-banner " + bannerClass;

    const net = st.P - st.FA;
    const netText = Math.abs(net) < 0.01
      ? "F_net = 0 N (muvozanat)"
      : "F_net = " + fmt(Math.abs(net), 2) + " N " + (net > 0 ? "pastga" : "yuqoriga");

    el.calc.textContent =
      "P = ρ_j · g · V = " + fmt(st.rhoS, 0) + " × 9,81 × 0,001\n" +
      "P = " + fmt(st.P, 2) + " N\n\n" +
      "F_A = ρ_s · g · V_botgan\n" +
      "F_A = " + fmt(st.rhoL, 0) + " × 9,81 × " + fmt(st.Vsub / 1000, 4) + " = " + fmt(st.FA, 2) + " N\n\n" +
      (st.rhoS < st.rhoL
        ? "ρ_j (" + fmt(st.rhoS, 0) + ") < ρ_s (" + fmt(st.rhoL, 0) + ") → jism suzadi.\nMuvozanatda botgan qism: " + fmt(st.fEq * 100, 1) + " %."
        : st.rhoS > st.rhoL
          ? "ρ_j (" + fmt(st.rhoS, 0) + ") > ρ_s (" + fmt(st.rhoL, 0) + ") → jism cho‘kadi."
          : "ρ_j = ρ_s → jism suyuqlik ichida muvozanatda turadi.") +
      "\n\nHozir: " + netText + ".";
  }

  el.solid.addEventListener("input", () => { st.mode = "held"; st.sink = false; compute(); });
  el.liquid.addEventListener("input", () => { st.mode = "held"; st.sink = false; compute(); });
  el.f.addEventListener("input", () => {
    st.mode = "held";
    st.sink = false;
    st.f = +el.f.value / 100;
    compute();
  });
  el.release.addEventListener("click", () => {
    st.mode = "released";
    compute();
  });
  el.hold.addEventListener("click", () => {
    st.mode = "held";
    st.sink = false;
    st.f = +el.f.value / 100;
    compute();
  });

  compute();

  function draw(t, dt) {
    begin(ctx3);
    drawBg(ctx3, "3", "Arximed kuchi va suzish");

    const so = SOLIDS[st.solid];
    const li = LIQUIDS[st.liquid];

    st.fAnim += (st.f - st.fAnim) * Math.min(1, dt * 5);

    const beaker = { x: 330, y: 188, w: 330, h: 292, ix: 342, iw: 306, bottom: 470 };
    const side = 104;
    const cx = 495;
    const surface = 322 - st.fAnim * 36;

    let targetBottom = surface + st.fAnim * side;
    if (st.mode === "released" && st.sink) targetBottom = 468;
    if (!st.init) { st.bottomY = targetBottom; st.init = true; }
    st.bottomY += (targetBottom - st.bottomY) * Math.min(1, dt * 5);

    const top = st.bottomY - side;
    const centerY = st.bottomY - side / 2;
    const fVis = clamp((st.bottomY - surface) / side, 0, 1);

    /* stol */
    rr(ctx3, 250, 498, 460, 12, 6);
    ctx3.fillStyle = "#1b2a38";
    ctx3.fill();
    ctx3.strokeStyle = "rgba(170,210,235,.14)";
    ctx3.lineWidth = 1;
    ctx3.stroke();

    /* menzurka orqa oynasi */
    rr(ctx3, beaker.x, beaker.y, beaker.w, beaker.h, 14);
    ctx3.fillStyle = "rgba(120,190,225,.04)";
    ctx3.fill();

    /* suv */
    ctx3.save();
    rr(ctx3, beaker.ix - 2, beaker.y + 8, beaker.iw + 4, beaker.h - 12, 10);
    ctx3.clip();

    const wg = ctx3.createLinearGradient(0, surface, 0, beaker.bottom);
    wg.addColorStop(0, hexA(li.color, 0.45));
    wg.addColorStop(0.55, hexA(li.color, 0.34));
    wg.addColorStop(1, hexA(li.deep, 0.72));
    ctx3.fillStyle = wg;
    ctx3.beginPath();
    ctx3.moveTo(beaker.ix, surface + Math.sin(t * 1.6) * 1.8);
    for (let x = beaker.ix; x <= beaker.ix + beaker.iw; x += 8) {
      ctx3.lineTo(x, surface + Math.sin(x * 0.03 + t * 1.5) * 1.8);
    }
    ctx3.lineTo(beaker.ix + beaker.iw, beaker.bottom + 12);
    ctx3.lineTo(beaker.ix, beaker.bottom + 12);
    ctx3.closePath();
    ctx3.fill();

    st.bubbles.forEach(b => {
      b.y -= b.v * dt;
      if (b.y < -0.02) { b.y = 1.02; b.x = Math.random(); }
      const bx = beaker.ix + 14 + b.x * (beaker.iw - 28);
      const by = surface + 16 + b.y * (beaker.bottom - surface - 24);
      ctx3.beginPath();
      ctx3.arc(bx, by, b.r, 0, TAU);
      ctx3.fillStyle = "rgba(220,245,255," + b.a + ")";
      ctx3.fill();
    });
    ctx3.restore();

    /* sath */
    ctx3.strokeStyle = "rgba(215,243,255,.5)";
    ctx3.lineWidth = 1.4;
    ctx3.beginPath();
    for (let x = beaker.ix; x <= beaker.ix + beaker.iw; x += 8) {
      const y = surface + Math.sin(x * 0.03 + t * 1.5) * 1.8;
      if (x === beaker.ix) ctx3.moveTo(x, y); else ctx3.lineTo(x, y);
    }
    ctx3.stroke();

    /* shisha devor + graduatsiya */
    rr(ctx3, beaker.x, beaker.y, beaker.w, beaker.h, 14);
    ctx3.strokeStyle = "rgba(185,225,245,.38)";
    ctx3.lineWidth = 2;
    ctx3.stroke();
    ctx3.strokeStyle = "rgba(255,255,255,.09)";
    ctx3.lineWidth = 5;
    ctx3.beginPath();
    ctx3.moveTo(beaker.x + 12, beaker.y + 22);
    ctx3.lineTo(beaker.x + 12, beaker.y + beaker.h - 24);
    ctx3.stroke();

    for (let i = 1; i <= 5; i++) {
      const gy = beaker.bottom - i * 48;
      ctx3.beginPath();
      ctx3.moveTo(beaker.ix + beaker.iw - 18, gy);
      ctx3.lineTo(beaker.ix + beaker.iw, gy);
      ctx3.strokeStyle = "rgba(200,230,245,.22)";
      ctx3.lineWidth = 1;
      ctx3.stroke();
      text(ctx3, i + " L", beaker.ix + beaker.iw - 25, gy + 4, {
        size: 8.5, color: "rgba(185,215,230,.35)", align: "right", mono: true
      });
    }

    /* ushlagich */
    if (st.mode === "held") {
      ctx3.strokeStyle = "rgba(180,198,212,.55)";
      ctx3.lineWidth = 8;
      ctx3.beginPath(); ctx3.moveTo(cx, 76); ctx3.lineTo(cx, top + 6); ctx3.stroke();
      ctx3.strokeStyle = "rgba(255,255,255,.18)";
      ctx3.lineWidth = 2;
      ctx3.beginPath(); ctx3.moveTo(cx - 2, 80); ctx3.lineTo(cx - 2, top + 8); ctx3.stroke();
      rr(ctx3, cx - 70, 66, 140, 16, 8);
      ctx3.fillStyle = "#9aa8b7";
      ctx3.fill();
      ctx3.strokeStyle = "rgba(240,250,255,.3)";
      ctx3.lineWidth = 1;
      ctx3.stroke();
      text(ctx3, "ushlagich", cx + 82, 79, { size: 10, color: "rgba(170,205,225,.5)" });
    }

    /* jism */
    const bx = cx - side / 2;
    const bg = ctx3.createLinearGradient(bx, top, bx + side, top + side);
    bg.addColorStop(0, so.light);
    bg.addColorStop(0.55, so.color);
    bg.addColorStop(1, hexA(so.color, 0.7));
    rr(ctx3, bx, top, side, side, 9);
    ctx3.fillStyle = bg;
    ctx3.fill();
    ctx3.strokeStyle = "rgba(240,250,255,.4)";
    ctx3.lineWidth = 1.5;
    ctx3.stroke();

    ctx3.fillStyle = "rgba(255,255,255,.14)";
    rr(ctx3, bx + 8, top + 8, side - 16, 9, 4);
    ctx3.fill();

    const dark = st.rhoS > 2000 ? "rgba(8,18,28,.65)" : "rgba(35,25,12,.6)";
    text(ctx3, so.short, cx, top + side / 2 - 7, { size: 14, color: dark, align: "center", weight: 700 });
    text(ctx3, fmt(st.rhoS, 0) + " kg/m³", cx, top + side / 2 + 12, { size: 9.5, color: dark, align: "center", mono: true });
    text(ctx3, "V = 1 L", cx, top + side / 2 + 29, { size: 9.5, color: dark, align: "center", mono: true });

    /* suv ostidagi qism rangi */
    const subTop = Math.max(top, surface);
    if (subTop < st.bottomY) {
      ctx3.save();
      rr(ctx3, bx, top, side, side, 9);
      ctx3.clip();
      ctx3.fillStyle = hexA(li.color, 0.3);
      ctx3.fillRect(bx, subTop, side, st.bottomY - subTop);
      ctx3.restore();
    }

    /* kuchlar */
    const maxF = Math.max(st.P, st.FAfull);
    const lenP = 6 + 44 * (st.P / maxF);
    const lenA = st.FA > 0.001 ? 6 + 44 * (st.FA / maxF) : 0;
    const fxP = cx - side / 2 - 46;
    const fxA = cx + side / 2 + 46;

    if (lenA > 0) {
      arrow(ctx3, fxA, centerY, fxA, centerY - lenA, "#5aa9ff", 2.6, 9);
      pill(ctx3, fxA + 8, centerY, "F_A = " + fmt(st.FA, 2) + " N", {
        align: "left", bg: "rgba(8,22,36,.85)", border: "rgba(90,169,255,.32)",
        color: "#a9d2ff", size: 10, h: 22, pad: 8
      });
    }
    arrow(ctx3, fxP, centerY, fxP, centerY + lenP, "#f6b84b", 2.6, 9);
    pill(ctx3, fxP - 8, centerY, "P = " + fmt(st.P, 2) + " N", {
      align: "right", bg: "rgba(8,22,36,.85)", border: "rgba(246,184,75,.3)",
      color: "#f6cf82", size: 10, h: 22, pad: 8
    });

    /* holat belgisi */
    const tendency = st.rhoS < st.rhoL ? "SUZADI" : st.rhoS > st.rhoL ? "CHO‘KADI" : "MUVOZANAT";
    const col = st.rhoS < st.rhoL ? "#7de9a8" : st.rhoS > st.rhoL ? "#ff9292" : "#84c4ff";
    pill(ctx3, CW - 30, 90, tendency, {
      align: "right", bg: st.rhoS < st.rhoL ? "rgba(94,224,138,.09)" : st.rhoS > st.rhoL ? "rgba(255,107,107,.09)" : "rgba(90,169,255,.09)",
      border: st.rhoS < st.rhoL ? "rgba(94,224,138,.32)" : st.rhoS > st.rhoL ? "rgba(255,107,107,.32)" : "rgba(90,169,255,.32)",
      color: col, size: 12, h: 28, pad: 13
    });
    text(ctx3, st.mode === "held" ? "qo‘lda ushlab turilgan" : "qo‘yib yuborilgan", CW - 30, 137, {
      size: 10, color: "rgba(170,205,225,.55)", align: "right"
    });

    pill(ctx3, beaker.x - 12, surface - 38, "sath +" + fmt(st.dh, 1) + " sm", {
      align: "right", bg: "rgba(4,14,22,.78)", border: "rgba(79,209,197,.28)",
      color: "#9ff0e7", size: 10, h: 22
    });

    text(ctx3, "Menzurka · S = 200 sm²", cx, 526, { size: 10.5, color: "rgba(150,195,215,.5)", align: "center" });
    text(ctx3, so.name + " · ρ = " + fmt(st.rhoS, 0) + " kg/m³", 30, 96, {
      size: 10.5, color: "rgba(150,195,215,.6)"
    });
    text(ctx3, li.name + " · ρ = " + fmt(st.rhoL, 0) + " kg/m³", 30, 113, {
      size: 10.5, color: "rgba(150,195,215,.6)"
    });

    if (st.mode === "held") {
      const net = st.P - st.FA;
      const netTxt = Math.abs(net) < 0.01 ? "F_net = 0 N" : "F_net = " + fmt(Math.abs(net), 2) + " N " + (net > 0 ? "pastga" : "yuqoriga");
      pill(ctx3, 30, 404, netTxt, {
        bg: "rgba(4,14,22,.78)", border: "rgba(150,205,235,.18)",
        color: "#cfe6f2", size: 10, h: 22
      });
    }
  }

  function report() {
    const so = SOLIDS[st.solid];
    const li = LIQUIDS[st.liquid];
    return {
      title: "3-laboratoriya. Arximed kuchi va suzish sharti",
      goal: "Arximed kuchini aniqlash, jismning suzish–cho‘kish shartlarini tekshirish.",
      equipment: "Menzurka (S = 200 sm²), jism namunalari, suyuqlik, shtativ, chizg‘ich.",
      rows: [
        ["Jism", so.name + ", ρ = " + fmt(so.rho, 0) + " kg/m³"],
        ["Suyuqlik", li.name + ", ρ = " + fmt(li.rho, 0) + " kg/m³"],
        ["Jism hajmi, V", "1,000 L = 0,001 m³"],
        ["Jism massasi, m", fmt(st.mass, 3) + " kg"],
        ["Og‘irlik, P", fmt(st.P, 2) + " N"],
        ["To‘liq botgandagi F_A", fmt(st.FAfull, 2) + " N"],
        ["Hozirgi botish", fmt(st.f * 100, 0) + " %"],
        ["Hozirgi F_A", fmt(st.FA, 2) + " N"],
        ["Muvozanat botish ulushi", fmt(st.fEq * 100, 1) + " %"],
        ["Sath ko‘tarilishi, Δh", fmt(st.dh, 1) + " sm"],
        ["Holat", st.mode === "held" ? "qo‘lda ushlab turilgan" : (st.sink ? "cho‘kadi" : "suzadi")]
      ],
      calc: [
        "P = ρ_j·g·V = " + fmt(st.rhoS, 0) + " × 9,81 × 0,001 = " + fmt(st.P, 2) + " N",
        "F_A = ρ_s·g·V_botgan = " + fmt(st.rhoL, 0) + " × 9,81 × " + fmt(st.Vsub / 1000, 4) + " = " + fmt(st.FA, 2) + " N",
        "ρ_j / ρ_s = " + fmt(st.rhoS, 0) + " / " + fmt(st.rhoL, 0) + " = " + fmt(st.fEq, 3),
        "Muvozanatda botgan qism = " + fmt(st.fEq * 100, 1) + " %"
      ],
      conclusion: st.rhoS < st.rhoL
        ? "Jism suzadi: uning zichligi suyuqliknikidan kichik. Muvozanatda jismning " + fmt(st.fEq * 100, 1) + "% qismi suyuqlik ostida bo‘ladi."
        : "Jism cho‘kadi: uning zichligi suyuqliknikidan katta. To‘liq botganda F_A = " + fmt(st.FAfull, 2) + " N bo‘lib, og‘irlikdan kichik qoladi."
    };
  }

  return { draw, report };
})();

/* ============================================================
   4-LABORATORIYA — Torricelli qonuni
   ============================================================ */

const lab4 = (() => {
  const st = {
    h: 0.8, d: 6, v: 0, A: 0, q: 0, t1: 0, range: 0,
    time: 0, volume: 0, overflow: false, lastDom: 0,
    bubbles: makeBubbles(10)
  };

  const el = {
    h: $("l4-h"), hOut: $("l4-h-out"),
    d: $("l4-d"), dOut: $("l4-d-out"),
    reset: $("l4-reset"),
    calc: $("l4-calc")
  };

  function compute() {
    st.h = +el.h.value;
    st.d = +el.d.value;
    st.v = Math.sqrt(2 * G * st.h);
    st.A = Math.PI * Math.pow(st.d / 1000, 2) / 4;
    st.q = st.A * st.v;
    st.t1 = 0.001 / st.q;
    st.range = st.v * Math.sqrt(2 * 0.7 / G);

    el.hOut.textContent = fmt(st.h, 2) + " m";
    el.dOut.textContent = fmt(st.d, 1) + " mm";

    setText("l4-h-val", fmt(st.h, 2));
    setText("l4-d-val", fmt(st.d, 1));
    setText("l4-a-mm", fmt(st.A * 1e6, 1));
    setText("l4-a-m", sci(st.A, 2));
    setText("l4-v", fmt(st.v, 2));
    setText("l4-q", fmt(st.q * 1000, 3));
    setText("l4-qmin", fmt(st.q * 60000, 1));
    setText("l4-t1", fmt(st.t1, 1));
    setText("l4-range", fmt(st.range, 2));
    setText("l4-big", fmt(st.v, 2) + " m/s");

    el.calc.textContent =
      "v = √(2gH) = √(2 × 9,81 × " + fmt(st.h, 2) + ")\n" +
      "v = " + fmt(st.v, 3) + " m/s\n\n" +
      "A = πd²/4 = " + fmt(st.A * 1e6, 1) + " mm² = " + sci(st.A, 2) + " m²\n" +
      "Q = A·v = " + sci(st.q, 3) + " m³/s = " + fmt(st.q * 1000, 3) + " L/s\n" +
      "1 L to‘lish vaqti: t = 0,001 / Q = " + fmt(st.t1, 1) + " s\n" +
      "Oqim masofasi: x = v·√(2y/g) = " + fmt(st.range, 2) + " m  (y = 0,70 m).";
  }

  el.h.addEventListener("input", compute);
  el.d.addEventListener("input", compute);
  el.reset.addEventListener("click", () => {
    st.time = 0;
    st.volume = 0;
    st.overflow = false;
    setText("l4-time", "0,0");
    setText("l4-vol", "0,00");
  });
  compute();

  function draw(t, dt) {
    begin(ctx4);
    drawBg(ctx4, "4", "Torricelli qonuni");

    if (!st.overflow) {
      st.time += dt;
      st.volume += st.q * 1000 * dt;
      if (st.volume >= 2) { st.volume = 2; st.overflow = true; }
    }
    if (t - st.lastDom > 0.1) {
      st.lastDom = t;
      setText("l4-time", fmt(st.time, 1));
      setText("l4-vol", fmt(st.volume, 2));
    }

    const li = LIQUIDS.water;
    const tank = { x: 125, y: 78, w: 265, h: 382 };
    const bottom = tank.y + tank.h;
    const holeX = 392;
    const holeY = 338;
    const scale = 200;
    const surf = holeY - st.h * scale;

    /* stol */
    rr(ctx4, 95, 500, 840, 18, 8);
    ctx4.fillStyle = "#1b2a38";
    ctx4.fill();
    ctx4.strokeStyle = "rgba(170,210,235,.14)";
    ctx4.lineWidth = 1;
    ctx4.stroke();

    /* idish */
    rr(ctx4, tank.x, tank.y, tank.w, tank.h, 16);
    ctx4.fillStyle = "rgba(120,190,225,.045)";
    ctx4.fill();

    ctx4.save();
    rr(ctx4, tank.x + 4, tank.y + 4, tank.w - 8, tank.h - 8, 13);
    ctx4.clip();
    const wg = ctx4.createLinearGradient(0, surf, 0, bottom);
    wg.addColorStop(0, hexA(li.color, 0.62));
    wg.addColorStop(0.7, hexA(li.color, 0.44));
    wg.addColorStop(1, hexA(li.deep, 0.82));
    ctx4.fillStyle = wg;
    ctx4.beginPath();
    ctx4.moveTo(tank.x, surf + Math.sin(t * 1.5) * 1.5);
    for (let x = tank.x; x <= tank.x + tank.w; x += 7) {
      ctx4.lineTo(x, surf + Math.sin(x * 0.04 + t * 1.6) * 1.8);
    }
    ctx4.lineTo(tank.x + tank.w, bottom + 10);
    ctx4.lineTo(tank.x, bottom + 10);
    ctx4.closePath();
    ctx4.fill();

    st.bubbles.forEach(b => {
      b.y -= b.v * dt;
      if (b.y < -0.02) { b.y = 1.02; b.x = Math.random(); }
      const bx = tank.x + 16 + b.x * (tank.w - 32);
      const by = surf + 16 + b.y * (bottom - surf - 26);
      ctx4.beginPath();
      ctx4.arc(bx, by, b.r, 0, TAU);
      ctx4.fillStyle = "rgba(220,245,255," + b.a + ")";
      ctx4.fill();
    });
    ctx4.restore();

    ctx4.strokeStyle = "rgba(215,243,255,.55)";
    ctx4.lineWidth = 1.4;
    ctx4.beginPath();
    for (let x = tank.x + 4; x <= tank.x + tank.w - 4; x += 8) {
      const y = surf + Math.sin(x * 0.04 + t * 1.6) * 1.8;
      if (x === tank.x + 4) ctx4.moveTo(x, y); else ctx4.lineTo(x, y);
    }
    ctx4.stroke();

    rr(ctx4, tank.x, tank.y, tank.w, tank.h, 16);
    ctx4.strokeStyle = "rgba(185,225,245,.38)";
    ctx4.lineWidth = 2;
    ctx4.stroke();
    ctx4.strokeStyle = "rgba(255,255,255,.09)";
    ctx4.lineWidth = 5;
    ctx4.beginPath();
    ctx4.moveTo(tank.x + 12, tank.y + 24);
    ctx4.lineTo(tank.x + 12, tank.y + tank.h - 26);
    ctx4.stroke();

    /* balandlik o‘lchovi */
    ctx4.strokeStyle = "rgba(165,200,220,.3)";
    ctx4.lineWidth = 1;
    ctx4.beginPath(); ctx4.moveTo(106, holeY); ctx4.lineTo(106, holeY - 1.2 * scale); ctx4.stroke();
    for (let i = 0; i <= 6; i++) {
      const m = i * 0.2;
      const y = holeY - m * scale;
      const major = i % 2 === 0;
      ctx4.beginPath();
      ctx4.moveTo(106, y);
      ctx4.lineTo(106 + (major ? 10 : 6), y);
      ctx4.strokeStyle = major ? "rgba(190,225,240,.5)" : "rgba(165,200,220,.2)";
      ctx4.stroke();
      if (major) {
        text(ctx4, fmt(m, 1), 98, y + 4, { size: 9.5, color: "rgba(170,205,225,.55)", align: "right", mono: true });
      }
    }
    text(ctx4, "m", 98, holeY - 1.2 * scale - 10, { size: 9.5, color: "rgba(170,205,225,.4)", align: "right", mono: true });

    /* H o‘lchovi */
    const hx = 158;
    ctx4.strokeStyle = "rgba(79,209,197,.62)";
    ctx4.lineWidth = 1.4;
    ctx4.beginPath(); ctx4.moveTo(hx, surf); ctx4.lineTo(hx, holeY); ctx4.stroke();
    ctx4.beginPath(); ctx4.moveTo(hx - 6, surf); ctx4.lineTo(hx + 6, surf); ctx4.stroke();
    ctx4.beginPath(); ctx4.moveTo(hx - 6, holeY); ctx4.lineTo(hx + 6, holeY); ctx4.stroke();
    pill(ctx4, hx + 12, surf + (holeY - surf) / 2 - 12, "H = " + fmt(st.h, 2) + " m", {
      bg: "rgba(4,14,22,.8)", border: "rgba(79,209,197,.3)",
      color: "#9ff0e7", size: 10.5, h: 23
    });

    /* teshik */
    ctx4.beginPath();
    ctx4.arc(holeX, holeY, 8, 0, TAU);
    ctx4.fillStyle = "#04121d";
    ctx4.fill();
    ctx4.strokeStyle = "rgba(190,230,250,.5)";
    ctx4.lineWidth = 2;
    ctx4.stroke();
    rr(ctx4, holeX - 2, holeY - 5, 14, 10, 3);
    ctx4.fillStyle = "rgba(90,200,240,.22)";
    ctx4.fill();

    /* trayektoriya */
    const tFall = Math.sqrt(2 * 0.7 / G);
    ctx4.setLineDash([4, 7]);
    ctx4.strokeStyle = "rgba(120,210,245,.22)";
    ctx4.lineWidth = 1.2;
    ctx4.beginPath();
    for (let i = 0; i <= 30; i++) {
      const tt = tFall * i / 30;
      const px = holeX + st.v * tt * scale;
      const py = holeY + 0.5 * G * tt * tt * scale;
      if (i === 0) ctx4.moveTo(px, py); else ctx4.lineTo(px, py);
    }
    ctx4.stroke();
    ctx4.setLineDash([]);

    /* oqim zarralari */
    const dropR = 1.1 + st.d * 0.28;
    for (let i = 0; i < 28; i++) {
      const phase = (t * 1.5 + i / 28) % 1;
      const tt = phase * tFall;
      const px = holeX + st.v * tt * scale;
      const py = holeY + 0.5 * G * tt * tt * scale;
      ctx4.beginPath();
      ctx4.arc(px, py, dropR, 0, TAU);
      ctx4.fillStyle = "rgba(140,225,255," + (0.25 + 0.65 * (1 - phase)) + ")";
      ctx4.fill();
    }

    /* tezlik strelkasi */
    arrow(ctx4, holeX + 12, holeY - 26, holeX + 72, holeY - 26, "#4fd1c5", 2.6, 9);
    text(ctx4, "v = " + fmt(st.v, 2) + " m/s", holeX + 78, holeY - 22, {
      size: 11, color: "#9ff0e7", weight: 650, mono: true
    });

    /* sakrash */
    const xEnd = Math.min(930, holeX + st.range * scale);
    const yEnd = holeY + 0.5 * G * tFall * tFall * scale;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.25 + Math.sin(t * 8 + i) * 0.12;
      const len = 6 + 4 * Math.sin(t * 6 + i * 2) ** 2;
      ctx4.beginPath();
      ctx4.moveTo(xEnd, yEnd);
      ctx4.lineTo(xEnd + Math.cos(a) * len, yEnd + Math.sin(a) * len);
      ctx4.strokeStyle = "rgba(150,225,255,.45)";
      ctx4.lineWidth = 1.4;
      ctx4.stroke();
    }

    /* o‘lchov vannasi */
    const tray = { x: 410, y: 458, w: 520, h: 46 };
    rr(ctx4, tray.x, tray.y, tray.w, tray.h, 8);
    ctx4.fillStyle = "rgba(120,190,225,.05)";
    ctx4.fill();
    ctx4.strokeStyle = "rgba(185,225,245,.32)";
    ctx4.lineWidth = 2;
    ctx4.stroke();

    ctx4.save();
    rr(ctx4, tray.x + 4, tray.y + 4, tray.w - 8, tray.h - 8, 5);
    ctx4.clip();
    const fillH = 4 + (st.volume / 2) * 28;
    const twg = ctx4.createLinearGradient(0, tray.y + tray.h - fillH, 0, tray.y + tray.h);
    twg.addColorStop(0, "rgba(90,195,235,.62)");
    twg.addColorStop(1, "rgba(18,80,115,.85)");
    ctx4.fillStyle = twg;
    ctx4.fillRect(tray.x + 4, tray.y + tray.h - fillH, tray.w - 8, fillH);
    ctx4.strokeStyle = "rgba(200,240,255,.55)";
    ctx4.lineWidth = 1;
    ctx4.beginPath();
    ctx4.moveTo(tray.x + 4, tray.y + tray.h - fillH);
    for (let x = tray.x + 4; x <= tray.x + tray.w - 4; x += 10) {
      ctx4.lineTo(x, tray.y + tray.h - fillH + Math.sin(x * 0.05 + t * 2) * 1.2);
    }
    ctx4.stroke();
    ctx4.restore();

    for (let i = 0; i <= 4; i++) {
      const gy = tray.y + tray.h - 7 - (i / 4) * 28;
      ctx4.beginPath();
      ctx4.moveTo(tray.x + 4, gy);
      ctx4.lineTo(tray.x + 14, gy);
      ctx4.strokeStyle = "rgba(190,225,240,.28)";
      ctx4.lineWidth = 1;
      ctx4.stroke();
      if (i > 0) {
        text(ctx4, fmt(i * 0.5, 1) + " L", tray.x + 18, gy + 3, {
          size: 8.5, color: "rgba(185,215,230,.4)", mono: true
        });
      }
    }
    text(ctx4, "O‘lchov vannasi · 2 L", tray.x + tray.w - 14, tray.y + tray.h - 14, {
      size: 10, color: "rgba(170,205,225,.5)", align: "right"
    });

    /* sekundomer */
    const card = { x: 648, y: 92, w: 282, h: 158 };
    rr(ctx4, card.x, card.y, card.w, card.h, 14);
    ctx4.fillStyle = "rgba(5,16,26,.9)";
    ctx4.fill();
    ctx4.strokeStyle = st.overflow ? "rgba(255,107,107,.45)" : "rgba(150,205,235,.22)";
    ctx4.lineWidth = 1.4;
    ctx4.stroke();
    text(ctx4, "SEKUNDOMER", card.x + 18, card.y + 26, { size: 9.5, color: "rgba(160,200,220,.55)", weight: 700 });
    text(ctx4, fmt(st.time, 1) + " s", card.x + 18, card.y + 66, { size: 30, color: "#e8faff", weight: 650, mono: true });
    text(ctx4, "V = " + fmt(st.volume, 2) + " / 2,00 L", card.x + 18, card.y + 95, { size: 12, color: "#9ff0e7", mono: true });
    text(ctx4, "1 L → " + fmt(st.t1, 1) + " s", card.x + 18, card.y + 120, { size: 11, color: "rgba(170,210,230,.65)", mono: true });

    const barW = card.w - 36;
    rr(ctx4, card.x + 18, card.y + 132, barW, 8, 4);
    ctx4.fillStyle = "rgba(255,255,255,.06)";
    ctx4.fill();
    rr(ctx4, card.x + 18, card.y + 132, barW * clamp(st.volume / 2, 0, 1), 8, 4);
    ctx4.fillStyle = st.overflow ? "#ff7b7b" : "#4fd1c5";
    ctx4.fill();

    if (st.overflow) {
      pill(ctx4, card.x + card.w - 16, card.y + 14, "TO‘LDI", {
        align: "right", bg: "rgba(255,107,107,.12)", border: "rgba(255,107,107,.4)",
        color: "#ff9c9c", size: 10, h: 22
      });
    }

    /* pastki izoh */
    text(ctx4, "Torricelli: v = √(2gH). Suv sathi qanchalik baland bo‘lsa, oqim shunchalik tez.", 30, 522, {
      size: 10.5, color: "rgba(150,195,215,.5)"
    });
    text(ctx4, "Teshik: d = " + fmt(st.d, 1) + " mm", 930, 522, {
      size: 10.5, color: "rgba(150,195,215,.5)", align: "right"
    });
  }

  function report() {
    return {
      title: "4-laboratoriya. Torricelli qonuni",
      goal: "Teshikdan oqayotgan suyuqlik tezligining suv sathi balandligiga bog‘liqligini tekshirish.",
      equipment: "Teshikli idish, o‘lchov chizg‘ichi, sekundomer, o‘lchov vannasi (2 L), suv.",
      rows: [
        ["Suv sathi, H", fmt(st.h, 2) + " m"],
        ["Teshik diametri, d", fmt(st.d, 1) + " mm"],
        ["Teshik yuzasi, A", fmt(st.A * 1e6, 1) + " mm² = " + sci(st.A, 2) + " m²"],
        ["Oqim tezligi, v", fmt(st.v, 3) + " m/s"],
        ["Sarf, Q", fmt(st.q * 1000, 3) + " L/s = " + fmt(st.q * 60000, 1) + " L/min"],
        ["1 L to‘lish vaqti", fmt(st.t1, 1) + " s"],
        ["Oqim masofasi", fmt(st.range, 2) + " m (y = 0,70 m)"],
        ["O‘tgan vaqt", fmt(st.time, 1) + " s"],
        ["Yig‘ilgan hajm", fmt(st.volume, 2) + " L"]
      ],
      calc: [
        "v = √(2gH) = √(2 × 9,81 × " + fmt(st.h, 2) + ") = " + fmt(st.v, 3) + " m/s",
        "A = πd²/4 = " + fmt(st.A * 1e6, 1) + " mm² = " + sci(st.A, 2) + " m²",
        "Q = A·v = " + fmt(st.q * 1000, 3) + " L/s",
        "t(1 L) = 0,001/Q = " + fmt(st.t1, 1) + " s",
        "x = v·√(2y/g) = " + fmt(st.range, 2) + " m"
      ],
      conclusion: "Suv sathi H = " + fmt(st.h, 2) + " m bo‘lganda teshikdan chiqish tezligi " + fmt(st.v, 2) + " m/s, sarf esa " + fmt(st.q * 1000, 3) + " L/s bo‘ldi. H ortishi bilan v = √(2gH) qonuniga muvofiq tezlik ortadi."
    };
  }

  return { draw, report };
})();

/* ============================================================
   5-LABORATORIYA — zichlikni aniqlash
   ============================================================ */

const lab5 = (() => {
  const st = {
    solid: "alu", liquid: "water",
    Vcm3: 100, V: 0.0001,
    imm: 0, immAnim: 0,
    rhoS: 0, rhoL: 0,
    P1: 0, P2: 0, FAfull: 0,
    P1r: 0, P2r: 0, FAmeas: 0, Vmeas: 0, rhoMeas: 0, err: 0, Tcur: 0
  };

  const el = {
    solid: $("l5-solid"),
    liquid: $("l5-liquid"),
    v: $("l5-v"),
    vOut: $("l5-v-out"),
    imm: $("l5-imm"),
    immOut: $("l5-imm-out"),
    full: $("l5-full"),
    out: $("l5-out"),
    calc: $("l5-calc")
  };

  function compute() {
    st.solid = el.solid.value;
    st.liquid = el.liquid.value;
    st.Vcm3 = +el.v.value;
    st.V = st.Vcm3 / 1e6;
    st.imm = +el.imm.value / 100;

    const so = SOLIDS[st.solid];
    const li = LIQUIDS[st.liquid];
    st.rhoS = so.rho;
    st.rhoL = li.rho;

    st.P1 = st.rhoS * st.V * G;
    st.FAfull = st.rhoL * st.V * G;
    st.P2 = st.P1 - st.FAfull;

    st.P1r = roundStep(st.P1, 0.05);
    st.P2r = Math.max(0, roundStep(st.P2, 0.05));
    st.FAmeas = st.P1r - st.P2r;
    st.Vmeas = st.FAmeas / (st.rhoL * G);
    st.rhoMeas = st.P1r / st.FAmeas * st.rhoL;
    st.err = (st.rhoMeas - st.rhoS) / st.rhoS * 100;
    st.Tcur = Math.max(0, roundStep(st.P1 - st.FAfull * st.imm, 0.05));

    el.vOut.textContent = fmt(st.Vcm3, 0) + " sm³";
    el.immOut.textContent = fmt(st.imm * 100, 0) + " %";

    setText("l5-rho-j", fmt(st.rhoS, 0));
    setText("l5-v-val", fmt(st.Vcm3, 0));
    setText("l5-p1", fmt(st.P1r, 2));
    setText("l5-p2", fmt(st.P2r, 2));
    setText("l5-fa", fmt(st.FAmeas, 2));
    setText("l5-vm", fmt(st.Vmeas * 1e6, 1));
    setText("l5-rho-m", fmt(st.rhoMeas, 0));
    setText("l5-err", fmt(st.err, 1));
    setText("l5-cur", fmt(st.Tcur, 2));
    setText("l5-big", fmt(st.rhoMeas, 0) + " kg/m³");

    el.calc.textContent =
      "P₁ = ρ_j · V · g = " + fmt(st.rhoS, 0) + " × " + sci(st.V, 3) + " × 9,81\n" +
      "P₁ = " + fmt(st.P1r, 2) + " N  (dinamometr ko‘rsatishi)\n\n" +
      "F_A = P₁ − P₂ = " + fmt(st.P1r, 2) + " − " + fmt(st.P2r, 2) + " = " + fmt(st.FAmeas, 2) + " N\n" +
      "V = F_A / (ρ_s·g) = " + fmt(st.FAmeas, 2) + " / (1000 × 9,81)\n" +
      "V = " + sci(st.Vmeas, 3) + " m³ = " + fmt(st.Vmeas * 1e6, 1) + " sm³\n\n" +
      "ρ = P₁/(P₁ − P₂) · ρ_s\n" +
      "ρ = " + fmt(st.P1r, 2) + " / " + fmt(st.FAmeas, 2) + " × " + fmt(st.rhoL, 0) + " = " + fmt(st.rhoMeas, 0) + " kg/m³\n" +
      "Jadval: " + fmt(st.rhoS, 0) + " kg/m³;  xatolik: " + fmt(st.err, 1) + " %.";
  }

  el.solid.addEventListener("input", compute);
  el.liquid.addEventListener("input", compute);
  el.v.addEventListener("input", compute);
  el.imm.addEventListener("input", compute);
  el.full.addEventListener("click", () => {
    el.imm.value = 100;
    compute();
  });
  el.out.addEventListener("click", () => {
    el.imm.value = 0;
    compute();
  });
  compute();

  function draw(t, dt) {
    begin(ctx5);
    drawBg(ctx5, "5", "Zichlikni Arximed usulida aniqlash");

    const so = SOLIDS[st.solid];
    const li = LIQUIDS[st.liquid];

    st.immAnim += (st.imm - st.immAnim) * Math.min(1, dt * 5);
    const Tvis = Math.max(0, roundStep(st.P1 - st.FAfull * st.immAnim, 0.05));
    const raise = st.immAnim * 80;

    const beaker = {
      x: 360, w: 205,
      top: 345 - raise, bottom: 495 - raise,
      surface: 350 - raise,
      ix: 370, iw: 185
    };
    const obj = { cx: 462, w: 66, top: 270, bottom: 350 };
    const centerY = (obj.top + obj.bottom) / 2;

    /* stol */
    rr(ctx5, 90, 505, 810, 16, 7);
    ctx5.fillStyle = "#1b2a38";
    ctx5.fill();
    ctx5.strokeStyle = "rgba(170,210,235,.14)";
    ctx5.lineWidth = 1;
    ctx5.stroke();

    /* shtativ */
    ctx5.fillStyle = "#7f8d9b";
    rr(ctx5, 238, 58, 16, 447, 6);
    ctx5.fill();
    ctx5.fillStyle = "rgba(255,255,255,.16)";
    ctx5.fillRect(241, 62, 4, 438);
    ctx5.fillStyle = "#6c7a88";
    rr(ctx5, 184, 500, 126, 16, 7);
    ctx5.fill();
    rr(ctx5, 236, 58, 286, 12, 5);
    ctx5.fillStyle = "#8e9ba8";
    ctx5.fill();
    ctx5.strokeStyle = "rgba(255,255,255,.18)";
    ctx5.lineWidth = 1;
    ctx5.stroke();
    /* qisqich */
    rr(ctx5, 424, 58, 34, 22, 5);
    ctx5.fillStyle = "#5f6d7b";
    ctx5.fill();

    /* dinamometr korpusi */
    const body = { x: 390, y: 78, w: 110, h: 158 };
    const bg = ctx5.createLinearGradient(body.x, body.y, body.x + body.w, body.y);
    bg.addColorStop(0, "#b7c3cf");
    bg.addColorStop(0.35, "#e6edf4");
    bg.addColorStop(0.68, "#a9b6c3");
    bg.addColorStop(1, "#758290");
    rr(ctx5, body.x, body.y, body.w, body.h, 12);
    ctx5.fillStyle = bg;
    ctx5.fill();
    ctx5.strokeStyle = "rgba(245,252,255,.45)";
    ctx5.lineWidth = 1.5;
    ctx5.stroke();

    text(ctx5, "DINAMOMETR", body.x + body.w / 2, body.y + 16, {
      size: 8.5, color: "rgba(35,55,70,.72)", align: "center", weight: 700
    });
    text(ctx5, "0–30 N · 0,05 N", body.x + body.w / 2, body.y + 28, {
      size: 7.5, color: "rgba(35,55,70,.55)", align: "center", mono: true
    });

    const sTop = body.y + 36;
    const sLen = 90;
    ctx5.strokeStyle = "rgba(35,55,70,.5)";
    ctx5.lineWidth = 1;
    ctx5.beginPath(); ctx5.moveTo(body.x + 16, sTop); ctx5.lineTo(body.x + 16, sTop + sLen); ctx5.stroke();
    for (let i = 0; i <= 30; i++) {
      const yy = sTop + sLen * i / 30;
      const major = i % 5 === 0;
      ctx5.beginPath();
      ctx5.moveTo(body.x + 16, yy);
      ctx5.lineTo(body.x + 16 + (major ? 9 : 5), yy);
      ctx5.strokeStyle = major ? "rgba(35,55,70,.65)" : "rgba(35,55,70,.35)";
      ctx5.lineWidth = major ? 1.2 : 0.8;
      ctx5.stroke();
      if (major) {
        text(ctx5, String(i), body.x + 30, yy + 3.5, {
          size: 7.5, color: "rgba(35,55,70,.65)", mono: true
        });
      }
    }

    const markerY = sTop + sLen * clamp(Tvis / 30, 0, 1);
    ctx5.strokeStyle = "#d94841";
    ctx5.lineWidth = 1.8;
    ctx5.beginPath();
    ctx5.moveTo(body.x + 12, markerY);
    ctx5.lineTo(body.x + 92, markerY);
    ctx5.stroke();
    ctx5.beginPath();
    ctx5.moveTo(body.x + 12, markerY);
    ctx5.lineTo(body.x + 18, markerY - 4);
    ctx5.lineTo(body.x + 18, markerY + 4);
    ctx5.closePath();
    ctx5.fillStyle = "#d94841";
    ctx5.fill();

    /* raqamli ko‘rsatish */
    rr(ctx5, body.x + 10, body.y + body.h - 36, body.w - 20, 26, 6);
    ctx5.fillStyle = "rgba(8,20,30,.85)";
    ctx5.fill();
    ctx5.strokeStyle = "rgba(90,169,255,.28)";
    ctx5.lineWidth = 1;
    ctx5.stroke();
    text(ctx5, "T = " + fmt(Tvis, 2) + " N", body.x + body.w / 2, body.y + body.h - 18, {
      size: 12, color: "#cdfff8", align: "center", weight: 650, mono: true
    });

    /* ilgak va prujina */
    ctx5.strokeStyle = "#8794a2";
    ctx5.lineWidth = 3;
    ctx5.beginPath(); ctx5.moveTo(obj.cx, body.y + body.h); ctx5.lineTo(obj.cx, body.y + body.h + 10); ctx5.stroke();
    ctx5.beginPath(); ctx5.arc(obj.cx, body.y + body.h + 12, 4, 0, TAU); ctx5.stroke();
    ctx5.strokeStyle = "#c8d3de";
    ctx5.lineWidth = 1.6;
    ctx5.beginPath();
    const coilTop = body.y + body.h + 16;
    const coilBot = obj.top - 2;
    const coils = 7;
    for (let i = 0; i <= coils * 2; i++) {
      const yy = coilTop + (coilBot - coilTop) * i / (coils * 2);
      const xx = obj.cx + (i % 2 === 0 ? -7 : 7);
      if (i === 0) ctx5.moveTo(obj.cx, coilTop); else ctx5.lineTo(xx, yy);
    }
    ctx5.stroke();

    /* elevator */
    const platY = beaker.bottom + 7;
    const baseY = 505;
    ctx5.strokeStyle = "rgba(170,195,215,.55)";
    ctx5.lineWidth = 4;
    if (baseY - platY > 10) {
      ctx5.beginPath();
      ctx5.moveTo(beaker.x + 32, baseY - 6);
      ctx5.lineTo(beaker.x + beaker.w - 32, platY + 8);
      ctx5.moveTo(beaker.x + beaker.w - 32, baseY - 6);
      ctx5.lineTo(beaker.x + 32, platY + 8);
      ctx5.stroke();
      ctx5.beginPath();
      ctx5.arc((beaker.x * 2 + beaker.w) / 2, (baseY + platY) / 2, 4, 0, TAU);
      ctx5.fillStyle = "#8a9aa9";
      ctx5.fill();
    }
    rr(ctx5, beaker.x + 12, platY, beaker.w - 24, 8, 3);
    ctx5.fillStyle = "#73818f";
    ctx5.fill();
    rr(ctx5, beaker.x + 55, 500, beaker.w - 110, 10, 4);
    ctx5.fillStyle = "#5c6a78";
    ctx5.fill();

    /* menzurka orqasi */
    rr(ctx5, beaker.x, beaker.top, beaker.w, beaker.bottom - beaker.top, 12);
    ctx5.fillStyle = "rgba(120,190,225,.035)";
    ctx5.fill();

    /* suv */
    ctx5.save();
    rr(ctx5, beaker.ix - 2, beaker.top + 6, beaker.iw + 4, beaker.bottom - beaker.top - 10, 8);
    ctx5.clip();
    const wg = ctx5.createLinearGradient(0, beaker.surface, 0, beaker.bottom);
    wg.addColorStop(0, hexA(li.color, 0.4));
    wg.addColorStop(1, hexA(li.deep, 0.7));
    ctx5.fillStyle = wg;
    ctx5.beginPath();
    ctx5.moveTo(beaker.ix, beaker.surface + Math.sin(t * 1.5) * 1.4);
    for (let x = beaker.ix; x <= beaker.ix + beaker.iw; x += 8) {
      ctx5.lineTo(x, beaker.surface + Math.sin(x * 0.035 + t * 1.6) * 1.5);
    }
    ctx5.lineTo(beaker.ix + beaker.iw, beaker.bottom + 10);
    ctx5.lineTo(beaker.ix, beaker.bottom + 10);
    ctx5.closePath();
    ctx5.fill();
    ctx5.restore();

    ctx5.strokeStyle = "rgba(215,243,255,.55)";
    ctx5.lineWidth = 1.3;
    ctx5.beginPath();
    for (let x = beaker.ix; x <= beaker.ix + beaker.iw; x += 8) {
      const y = beaker.surface + Math.sin(x * 0.035 + t * 1.6) * 1.5;
      if (x === beaker.ix) ctx5.moveTo(x, y); else ctx5.lineTo(x, y);
    }
    ctx5.stroke();

    /* jism */
    const ox = obj.cx - obj.w / 2;
    const og = ctx5.createLinearGradient(ox, 0, ox + obj.w, 0);
    og.addColorStop(0, so.light);
    og.addColorStop(0.45, so.color);
    og.addColorStop(1, hexA(so.color, 0.72));
    rr(ctx5, ox, obj.top, obj.w, obj.bottom - obj.top, 7);
    ctx5.fillStyle = og;
    ctx5.fill();
    ctx5.strokeStyle = "rgba(245,252,255,.42)";
    ctx5.lineWidth = 1.3;
    ctx5.stroke();

    ctx5.beginPath();
    ctx5.ellipse(obj.cx, obj.top + 2, obj.w / 2 - 3, 7, 0, 0, TAU);
    ctx5.fillStyle = hexA(so.light, 0.82);
    ctx5.fill();
    ctx5.strokeStyle = "rgba(255,255,255,.28)";
    ctx5.lineWidth = 1;
    ctx5.stroke();

    ctx5.beginPath();
    ctx5.ellipse(obj.cx, obj.bottom, obj.w / 2, 7, 0, 0, Math.PI);
    ctx5.fillStyle = hexA(so.color, 0.6);
    ctx5.fill();

    const objDark = "rgba(8,18,28,.62)";
    text(ctx5, so.short, obj.cx, obj.top + 40, { size: 13, color: objDark, align: "center", weight: 700 });
    text(ctx5, fmt(st.Vcm3, 0) + " sm³", obj.cx, obj.top + 58, { size: 8.5, color: objDark, align: "center", mono: true });

    /* botgan qism rangi */
    const subTop = Math.max(obj.top, beaker.surface);
    if (subTop < obj.bottom) {
      ctx5.save();
      rr(ctx5, ox, obj.top, obj.w, obj.bottom - obj.top, 7);
      ctx5.clip();
      ctx5.fillStyle = hexA(li.color, 0.3);
      ctx5.fillRect(ox, subTop, obj.w, obj.bottom - subTop);
      ctx5.restore();
    }

    /* menzurka old oynasi */
    rr(ctx5, beaker.x, beaker.top, beaker.w, beaker.bottom - beaker.top, 12);
    ctx5.strokeStyle = "rgba(185,225,245,.32)";
    ctx5.lineWidth = 2;
    ctx5.stroke();
    ctx5.strokeStyle = "rgba(255,255,255,.09)";
    ctx5.lineWidth = 5;
    ctx5.beginPath();
    ctx5.moveTo(beaker.x + 12, beaker.top + 20);
    ctx5.lineTo(beaker.x + 12, beaker.bottom - 20);
    ctx5.stroke();

    for (let i = 1; i <= 4; i++) {
      const gy = beaker.bottom - i * 28;
      ctx5.beginPath();
      ctx5.moveTo(beaker.ix + beaker.iw - 14, gy);
      ctx5.lineTo(beaker.ix + beaker.iw, gy);
      ctx5.strokeStyle = "rgba(200,230,245,.24)";
      ctx5.lineWidth = 1;
      ctx5.stroke();
    }

    /* kuchlar */
    const maxF = Math.max(st.P1r, st.FAmeas, 0.2);
    const lenP = 10 + 36 * (st.P1r / maxF);
    const lenA = 8 + 36 * (st.FAfull * st.immAnim / maxF);
    const fxP = obj.cx - obj.w / 2 - 26;
    const fxA = obj.cx + obj.w / 2 + 26;

    arrow(ctx5, fxP, centerY, fxP, centerY + lenP, "#f6b84b", 2.4, 8);
    text(ctx5, "P=" + fmt(st.P1r, 2) + " N", fxP - 6, centerY, {
      size: 9.5, color: "#f6cf82", align: "right", mono: true
    });
    if (st.immAnim > 0.01) {
      arrow(ctx5, fxA, centerY, fxA, centerY - lenA, "#5aa9ff", 2.4, 8);
      text(ctx5, "F_A=" + fmt(st.FAfull * st.immAnim, 2) + " N", fxA + 6, centerY, {
        size: 9.5, color: "#a9d2ff", align: "left", mono: true
      });
    }

    /* holat */
    const stateTxt = st.immAnim < 0.01 ? "HAVODA" : st.immAnim > 0.99 ? "TO‘LIQ BOTGAN" : "QISMAN BOTGAN";
    const stateCol = st.immAnim < 0.01 ? "#cfe6f2" : st.immAnim > 0.99 ? "#84c4ff" : "#f6cf82";
    pill(ctx5, CW - 30, 90, stateTxt, {
      align: "right", bg: "rgba(8,22,36,.82)", border: "rgba(150,205,235,.22)",
      color: stateCol, size: 11, h: 27, pad: 12
    });
    text(ctx5, so.name + " · " + fmt(st.rhoS, 0) + " kg/m³", CW - 30, 137, {
      size: 10.5, color: "rgba(170,205,225,.6)", align: "right"
    });
    text(ctx5, li.name + " · " + fmt(st.rhoL, 0) + " kg/m³", CW - 30, 154, {
      size: 10.5, color: "rgba(170,205,225,.5)", align: "right"
    });

    text(ctx5, "Menzurka elevatorda ko‘tariladi", beaker.x + beaker.w / 2, 528, {
      size: 10, color: "rgba(150,195,215,.5)", align: "center"
    });
  }

  function report() {
    const so = SOLIDS[st.solid];
    const li = LIQUIDS[st.liquid];
    return {
      title: "5-laboratoriya. Zichlikni Arximed usulida aniqlash",
      goal: "Dinamometr ko‘rsatishlari asosida jism zichligini topish va o‘lchov xatoligini baholash.",
      equipment: "Dinamometr (0–30 N, 0,05 N), menzurka, laboratoriya elevatori, metall silindr, suyuqlik.",
      rows: [
        ["Jism", so.name + ", jadval bo‘yicha " + fmt(st.rhoS, 0) + " kg/m³"],
        ["Suyuqlik", li.name + ", " + fmt(st.rhoL, 0) + " kg/m³"],
        ["Jism hajmi, V", fmt(st.Vcm3, 0) + " sm³"],
        ["Havodagi ko‘rsatish, P₁", fmt(st.P1r, 2) + " N"],
        ["To‘liq botgandagi ko‘rsatish, P₂", fmt(st.P2r, 2) + " N"],
        ["Arximed kuchi, F_A", fmt(st.FAmeas, 2) + " N"],
        ["O‘lchangan hajm", fmt(st.Vmeas * 1e6, 1) + " sm³"],
        ["O‘lchangan zichlik", fmt(st.rhoMeas, 0) + " kg/m³"],
        ["Nisbiy xatolik", fmt(st.err, 1) + " %"]
      ],
      calc: [
        "P₁ = ρ_j·V·g = " + fmt(st.rhoS, 0) + " × " + sci(st.V, 3) + " × 9,81 = " + fmt(st.P1r, 2) + " N",
        "F_A = P₁ − P₂ = " + fmt(st.P1r, 2) + " − " + fmt(st.P2r, 2) + " = " + fmt(st.FAmeas, 2) + " N",
        "V = F_A/(ρ_s·g) = " + sci(st.Vmeas, 3) + " m³ = " + fmt(st.Vmeas * 1e6, 1) + " sm³",
        "ρ = P₁/(P₁ − P₂)·ρ_s = " + fmt(st.rhoMeas, 0) + " kg/m³",
        "δ = (ρ_o‘lch − ρ_j)/ρ_j × 100% = " + fmt(st.err, 1) + " %"
      ],
      conclusion: "Dinamometr yordamida " + so.name.toLowerCase() + " uchun " + fmt(st.rhoMeas, 0) + " kg/m³ zichlik olindi. Jadvaldagi qiymat " + fmt(st.rhoS, 0) + " kg/m³, nisbiy xatolik " + fmt(st.err, 1) + "%. Xatolik dinamometrning 0,05 N bo‘linishi bilan bog‘liq."
    };
  }

  return { draw, report };
})();

/* ============================================================
   6-LABORATORIYA — Bernulli qonuni va Venturi effekti
   ============================================================ */

const lab6 = (() => {
  const IN = 70, OUT = 890;
  const S1 = 250, S2 = 480;
  const C0 = 300, C1 = 390, C2 = 570, C3 = 660;
  const CY = 318;

  const st = {
    q: 8, d1: 120, d2: 50, liquid: "water",
    Q: 0, A1: 0, A2: 0, v1: 0, v2: 0, rho: 1000,
    p1: 40, p2: 0, dp: 0, k: 0,
    parts: []
  };

  for (let i = 0; i < 72; i++) {
    st.parts.push({
      x: IN + Math.random() * (OUT - IN),
      u: Math.random() * 1.5 - 0.75
    });
  }

  const el = {
    q: $("l6-q"), qOut: $("l6-q-out"),
    d1: $("l6-d1"), d1Out: $("l6-d1-out"),
    d2: $("l6-d2"), d2Out: $("l6-d2-out"),
    liquid: $("l6-liquid"),
    calc: $("l6-calc")
  };

  function syncD2() {
    const max = Math.min(80, +el.d1.value - 20);
    el.d2.max = String(max);
    if (+el.d2.value > max) el.d2.value = String(max);
  }

  function compute() {
    syncD2();
    st.q = +el.q.value;
    st.d1 = +el.d1.value;
    st.d2 = +el.d2.value;
    st.liquid = el.liquid.value;

    const li = LIQUIDS[st.liquid];
    st.rho = li.rho;
    st.Q = st.q / 1000;
    st.A1 = Math.PI * Math.pow(st.d1 / 1000, 2) / 4;
    st.A2 = Math.PI * Math.pow(st.d2 / 1000, 2) / 4;
    st.v1 = st.Q / st.A1;
    st.v2 = st.Q / st.A2;
    st.p1 = 40;
    st.dp = 0.5 * st.rho * (st.v2 * st.v2 - st.v1 * st.v1) / 1000;
    st.p2 = Math.max(0, st.p1 - st.dp);
    st.k = st.v2 / st.v1;

    el.qOut.textContent = fmt(st.q, 1) + " L/s";
    el.d1Out.textContent = fmt(st.d1, 0) + " mm";
    el.d2Out.textContent = fmt(st.d2, 0) + " mm";

    setText("l6-d1", fmt(st.d1, 0));
    setText("l6-d2", fmt(st.d2, 0));
    setText("l6-a1", fmt(st.A1 * 1e4, 1));
    setText("l6-a2", fmt(st.A2 * 1e4, 1));
    setText("l6-q", fmt(st.q, 1));
    setText("l6-v1", fmt(st.v1, 2));
    setText("l6-v2", fmt(st.v2, 2));
    setText("l6-k", fmt(st.k, 2));
    setText("l6-p1", fmt(st.p1, 1));
    setText("l6-p2", fmt(st.p2, 1));
    setText("l6-dp", fmt(st.dp, 1));
    setText("l6-rho", fmt(st.rho, 0));
    setText("l6-big", fmt(st.v2, 2) + " m/s");

    el.calc.textContent =
      "Q = " + fmt(st.q, 1) + " L/s = " + sci(st.Q, 3) + " m³/s\n\n" +
      "A₁ = πd₁²/4 = " + fmt(st.A1 * 1e4, 1) + " sm² = " + sci(st.A1, 3) + " m²\n" +
      "v₁ = Q / A₁ = " + fmt(st.v1, 3) + " m/s\n\n" +
      "A₂ = πd₂²/4 = " + fmt(st.A2 * 1e4, 1) + " sm² = " + sci(st.A2, 3) + " m²\n" +
      "v₂ = Q / A₂ = " + fmt(st.v2, 3) + " m/s\n\n" +
      "A₁v₁ = A₂v₂ = Q — sarf o‘zgarmaydi.\n" +
      "p₁ + ½ρv₁² = p₂ + ½ρv₂²\n" +
      "p₂ = p₁ − ½ρ(v₂² − v₁²)\n" +
      "p₂ = " + fmt(st.p1, 1) + " − " + fmt(st.dp, 2) + " = " + fmt(st.p2, 1) + " kPa";
  }

  el.q.addEventListener("input", compute);
  el.d1.addEventListener("input", compute);
  el.d2.addEventListener("input", compute);
  el.liquid.addEventListener("change", compute);
  compute();

  function radiusAt(x, r1, r2) {
    if (x <= C0) return r1;
    if (x < C1) return lerp(r1, r2, ease((x - C0) / (C1 - C0)));
    if (x <= C2) return r2;
    if (x < C3) return lerp(r2, r1, ease((x - C2) / (C3 - C2)));
    return r1;
  }

  function draw(t, dt) {
    begin(ctx6);
    drawBg(ctx6, "6", "Bernulli qonuni va Venturi effekti");

    const li = LIQUIDS[st.liquid];
    const r1 = clamp(st.d1 * 0.26, 24, 36);
    const r2 = clamp(st.d2 * 0.26, 10, 21);
    const rad = (x) => radiusAt(x, r1, r2);
    const vLocal = (x) => st.v1 * Math.pow(r1 / rad(x), 2);

    st.parts.forEach(p => {
      p.x += vLocal(p.x) * 40 * dt;
      if (p.x > OUT) p.x = IN + (p.x - OUT) % 26;
    });

    function shape(pad) {
      ctx6.beginPath();
      for (let x = IN; x <= OUT; x += 4) {
        const y = CY - rad(x) - pad;
        if (x === IN) ctx6.moveTo(x, y); else ctx6.lineTo(x, y);
      }
      for (let x = OUT; x >= IN; x -= 4) {
        ctx6.lineTo(x, CY + rad(x) + pad);
      }
      ctx6.closePath();
    }

    const steel = ctx6.createLinearGradient(0, CY - 48, 0, CY + 48);
    steel.addColorStop(0, "#51697e");
    steel.addColorStop(0.45, "#33485c");
    steel.addColorStop(1, "#1a2937");
    shape(8);
    ctx6.fillStyle = steel;
    ctx6.fill();
    ctx6.strokeStyle = "rgba(175,215,240,.4)";
    ctx6.lineWidth = 1.6;
    ctx6.stroke();

    const fg = ctx6.createLinearGradient(0, CY - r1, 0, CY + r1);
    fg.addColorStop(0, hexA(li.color, 0.55));
    fg.addColorStop(0.55, hexA(li.color, 0.78));
    fg.addColorStop(1, hexA(li.deep, 0.9));
    shape(0);
    ctx6.fillStyle = fg;
    ctx6.fill();

    ctx6.save();
    shape(0);
    ctx6.clip();
    st.parts.forEach(p => {
      const y = CY + p.u * rad(p.x) * 0.82;
      const len = clamp(vLocal(p.x) * 4.5, 2.5, 20);
      ctx6.strokeStyle = "rgba(228,248,255,.52)";
      ctx6.lineWidth = 1.5;
      ctx6.beginPath();
      ctx6.moveTo(p.x - len, y);
      ctx6.lineTo(p.x, y);
      ctx6.stroke();
    });
    ctx6.restore();

    shape(0);
    ctx6.strokeStyle = "rgba(215,245,255,.28)";
    ctx6.lineWidth = 1.2;
    ctx6.stroke();

    ctx6.setLineDash([6, 8]);
    ctx6.strokeStyle = "rgba(230,250,255,.14)";
    ctx6.lineWidth = 1;
    ctx6.beginPath(); ctx6.moveTo(IN, CY); ctx6.lineTo(OUT, CY); ctx6.stroke();
    ctx6.setLineDash([]);

    text(ctx6, "torayish", (C0 + C1) / 2, CY - r1 - 20, {
      size: 9.5, color: "rgba(150,205,225,.55)", align: "center"
    });
    text(ctx6, "kengayish", (C2 + C3) / 2, CY - r1 - 20, {
      size: 9.5, color: "rgba(150,205,225,.55)", align: "center"
    });

    function manometer(x, p, label, side) {
      const base = CY - rad(x);
      const tubeH = 166;
      const h = clamp(p * 4, 4, tubeH);
      const top = base - h;
      const tubeTop = base - tubeH;

      rr(ctx6, x - 10, base - 13, 20, 17, 4);
      ctx6.fillStyle = "#8e9dad";
      ctx6.fill();
      ctx6.strokeStyle = "rgba(230,245,255,.3)";
      ctx6.lineWidth = 1;
      ctx6.stroke();

      rr(ctx6, x - 8, tubeTop, 16, tubeH + 14, 6);
      ctx6.fillStyle = "rgba(205,238,252,.07)";
      ctx6.fill();
      ctx6.strokeStyle = "rgba(190,228,246,.38)";
      ctx6.lineWidth = 1.4;
      ctx6.stroke();

      if (h > 2) {
        ctx6.save();
        rr(ctx6, x - 8, tubeTop, 16, tubeH + 14, 6);
        ctx6.clip();
        ctx6.fillStyle = hexA(li.color, 0.62);
        ctx6.fillRect(x - 6, top + 2, 12, base - top);
        ctx6.restore();
        ctx6.beginPath();
        ctx6.moveTo(x - 8, top + 2);
        ctx6.lineTo(x + 8, top + 2);
        ctx6.strokeStyle = "rgba(230,250,255,.55)";
        ctx6.lineWidth = 1.2;
        ctx6.stroke();
      }

      ctx6.setLineDash([4, 4]);
      ctx6.beginPath();
      ctx6.moveTo(x - 22, top + 2);
      ctx6.lineTo(x + 22, top + 2);
      ctx6.strokeStyle = "rgba(200,240,255,.35)";
      ctx6.lineWidth = 1;
      ctx6.stroke();
      ctx6.setLineDash([]);

      const ly = tubeTop + 18;
      pill(ctx6, side === "left" ? x - 18 : x + 18, ly, label, {
        align: side === "left" ? "right" : "left",
        bg: "rgba(5,18,30,.86)",
        border: side === "left" ? "rgba(90,169,255,.34)" : "rgba(79,209,197,.34)",
        color: side === "left" ? "#a9d2ff" : "#9ff0e7",
        size: 10.5, h: 24
      });
    }

    manometer(S1, st.p1, "p₁ = " + fmt(st.p1, 1) + " kPa", "left");
    manometer(S2, st.p2, "p₂ = " + fmt(st.p2, 1) + " kPa", "right");

    const ya = CY + 72;
    function velocityArrow(x, v, label, color) {
      const len = clamp(34 + v * 16, 38, 118);
      arrow(ctx6, x, ya, x + len, ya, color, 2.6, 8);
      text(ctx6, label, x + len / 2, ya - 11, {
        size: 10.5, color, align: "center", mono: true
      });
    }

    velocityArrow(118, st.v1, "v₁ = " + fmt(st.v1, 2) + " m/s", "#8fd8ff");
    velocityArrow(420, st.v2, "v₂ = " + fmt(st.v2, 2) + " m/s", "#9ff0e7");
    velocityArrow(748, st.v1, "v₁ = " + fmt(st.v1, 2) + " m/s", "#8fd8ff");

    text(ctx6, li.name + " · ρ = " + fmt(li.rho, 0) + " kg/m³", 30, 88, {
      size: 10.5, color: "rgba(160,205,225,.65)"
    });
    text(ctx6, "Q = " + fmt(st.q, 1) + " L/s · d₁ = " + fmt(st.d1, 0) + " mm · d₂ = " + fmt(st.d2, 0) + " mm", 30, 105, {
      size: 10.5, color: "rgba(160,205,225,.55)", mono: true
    });

    text(ctx6, "VENTURI EFFEKTI", CW / 2, 86, {
      size: 9.5, color: "rgba(79,209,197,.7)", align: "center", weight: 700
    });

    pill(ctx6, CW - 30, 86, "TORAYISH: v ↑ · p ↓", {
      align: "right", bg: "rgba(90,169,255,.08)", border: "rgba(90,169,255,.3)",
      color: "#a9d2ff", size: 10, h: 23
    });
    pill(ctx6, CW - 30, 118, "KENGAYISH: v ↓ · p ↑", {
      align: "right", bg: "rgba(246,184,75,.07)", border: "rgba(246,184,75,.26)",
      color: "#f6cf82", size: 10, h: 23
    });

    pill(ctx6, 390, 414, "p₁ − p₂ = " + fmt(st.dp, 1) + " kPa", {
      bg: "rgba(12,32,46,.9)", border: "rgba(79,209,197,.3)",
      color: "#9ff0e7", size: 11.5, h: 26, pad: 12
    });

    text(ctx6, "Torayishda tezlik ortadi, bosim kamayadi — kengayishda tezlik kamayib, bosim ortadi.", CW / 2, 468, {
      size: 11.5, color: "rgba(205,230,242,.82)", align: "center"
    });
    text(ctx6, "A₁v₁ = A₂v₂ = Q   ·   p₁ + ½ρv₁² = p₂ + ½ρv₂²", CW / 2, 492, {
      size: 10.5, color: "rgba(155,205,225,.62)", align: "center", mono: true
    });
    text(ctx6, "Ideal suyuqlik; ishqalanish hisobga olinmagan. Ustunlar shartli masshtabda.", CW / 2, 516, {
      size: 9.5, color: "rgba(150,195,215,.42)", align: "center"
    });
  }

  function report() {
    const li = LIQUIDS[st.liquid];
    return {
      title: "6-laboratoriya. Bernulli tenglamasi va Venturi effekti",
      goal: "Quvurning toraygan va kengaygan qismlarida oqim tezligi va bosimining o‘zgarishini kuzatish, uzluksizlik va Bernulli tenglamalarini tekshirish.",
      equipment: "Venturi quvuri, nasos, sarf o‘lchagich, ikkita pezometr, suyuqlik, chizg‘ich.",
      rows: [
        ["Suyuqlik", li.name + ", ρ = " + fmt(st.rho, 0) + " kg/m³"],
        ["Hajmiy sarf, Q", fmt(st.q, 1) + " L/s = " + sci(st.Q, 3) + " m³/s"],
        ["Keng qism diametri, d₁", fmt(st.d1, 0) + " mm"],
        ["Toraygan qism diametri, d₂", fmt(st.d2, 0) + " mm"],
        ["Keng qism yuzasi, A₁", fmt(st.A1 * 1e4, 1) + " sm² = " + sci(st.A1, 3) + " m²"],
        ["Toraygan qism yuzasi, A₂", fmt(st.A2 * 1e4, 1) + " sm² = " + sci(st.A2, 3) + " m²"],
        ["Keng qismda tezlik, v₁", fmt(st.v1, 3) + " m/s"],
        ["Toraygan qismda tezlik, v₂", fmt(st.v2, 3) + " m/s"],
        ["Tezlik nisbati, v₂/v₁", fmt(st.k, 2) + " marta"],
        ["Keng qismda bosim, p₁", fmt(st.p1, 1) + " kPa"],
        ["Toraygan qismda bosim, p₂", fmt(st.p2, 1) + " kPa"],
        ["Bosim farqi, Δp", fmt(st.dp, 1) + " kPa"]
      ],
      calc: [
        "A₁ = πd₁²/4 = " + fmt(st.A1 * 1e4, 1) + " sm² = " + sci(st.A1, 3) + " m²",
        "A₂ = πd₂²/4 = " + fmt(st.A2 * 1e4, 1) + " sm² = " + sci(st.A2, 3) + " m²",
        "v₁ = Q/A₁ = " + fmt(st.v1, 3) + " m/s",
        "v₂ = Q/A₂ = " + fmt(st.v2, 3) + " m/s",
        "A₁v₁ = A₂v₂ = Q — uzluksizlik tenglamasi.",
        "p₂ = p₁ − ½ρ(v₂² − v₁²) = " + fmt(st.p2, 1) + " kPa",
        "Δp = p₁ − p₂ = " + fmt(st.dp, 2) + " kPa"
      ],
      conclusion: "Quvur " + fmt(st.d1, 0) + " mm dan " + fmt(st.d2, 0) + " mm gacha torayganda tezlik " + fmt(st.k, 2) + " marta ortib, " + fmt(st.v2, 2) + " m/s ga yetdi, bosim esa " + fmt(st.dp, 2) + " kPa ga kamaydi. Kengaygan qismda teskari jarayon kuzatiladi: tezlik kamayadi, bosim ortadi."
    };
  }

  return { draw, report };
})();

/* ============================================================
   HISOBOT
   ============================================================ */

const labs = { 1: lab1, 2: lab2, 3: lab3, 4: lab4, 5: lab5, 6: lab6 };

function buildReport(r) {
  const name = ($("student-name").value || "").trim() || "—";
  const d = new Date();
  const date = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
  const lines = [];
  lines.push("VIRTUAL LABORATORIYA — FANLAR TO‘PLAMI");
  lines.push("=".repeat(56));
  lines.push("Talaba: " + name);
  lines.push("Sana: " + date);
  lines.push("");
  lines.push(r.title);
  lines.push("");
  lines.push("Ishdan maqsad: " + r.goal);
  lines.push("Jihozlar: " + r.equipment);
  lines.push("");
  if (r.steps && r.steps.length) {
    lines.push("BAJARISH TARTIBI");
    lines.push("-".repeat(56));
    r.steps.forEach((s, i) => lines.push((i + 1) + ". " + s));
    lines.push("");
  }
  lines.push("O‘LCHOV VA HISOBLASH NATIJALARI");
  lines.push("-".repeat(56));
  r.rows.forEach(row => lines.push("• " + row[0] + ": " + row[1]));
  lines.push("");
  lines.push("HISOBLASH");
  lines.push("-".repeat(56));
  r.calc.forEach(line => lines.push("  " + line));
  lines.push("");
  lines.push("XULOSA");
  lines.push("-".repeat(56));
  lines.push(r.conclusion);
  lines.push("");
  lines.push("Qabul qilingan doimiylar: g = 9,81 m/s², π = 3,14.");
  return lines.join("\n");
}

function downloadText(filename, content) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

document.querySelectorAll("[data-report]").forEach(btn => {
  btn.addEventListener("click", () => {
    const n = btn.getAttribute("data-report");
    const lab = labs[n];
    if (!lab) return;
    try {
      downloadText("gidrostatika-" + n + "-laboratoriya.txt", buildReport(lab.report()));
    } catch (e) {
      console.error(e);
      alert("Hisobotni yaratishda xatolik yuz berdi.");
    }
  });
});

/* talaba ismini eslab qolish */
try {
  const saved = localStorage.getItem("gidrostatika-student");
  if (saved) $("student-name").value = saved;
  $("student-name").addEventListener("input", (e) => {
    try { localStorage.setItem("gidrostatika-student", e.target.value); } catch (err) {}
  });
} catch (e) {}

/* ============================================================
   TABLAR VA ANIMATSIYA
   ============================================================ */

let activeLab = 1;

const AppNav = {
  view: "home",
  set(v) { this.view = v; }
};
window.AppNav = AppNav;

function activate(n) {
  activeLab = n;
  document.querySelectorAll(".tab").forEach(btn => {
    const on = btn.getAttribute("data-lab") === String(n);
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.querySelectorAll(".lab").forEach(sec => {
    sec.classList.toggle("active", sec.id === "lab" + n);
  });
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => activate(+btn.getAttribute("data-lab")));
});

let lastFrame = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (AppNav.view === "hydro") {
    const lab = labs[activeLab];
    if (lab) lab.draw(now / 1000, dt);
  } else if (AppNav.view !== "home" && window.SubjectRuntime) {
    window.SubjectRuntime.draw(now / 1000, dt);
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
