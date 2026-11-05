"use strict";

/* ============================================================
   QUYMAKORLIK — 2–15-amaliy ishlar uchun umumiy yadro
   ============================================================ */

const HEAT_LAB_KEYS = [];
const HEAT_STD_TR = [25, 40, 50, 60, 75, 100, 125, 160, 200, 250, 320, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300];

function heatStdTransformer(v) {
  for (let i = 0; i < HEAT_STD_TR.length; i++) if (HEAT_STD_TR[i] >= v - 1e-9) return HEAT_STD_TR[i];
  return Math.ceil(v / 500) * 500;
}

function heatRegister(def) {
  defs[def.key] = def;
  HEAT_LAB_KEYS.push(def.key);
}

function heatApplyVariant(def, arr, map) {
  const sel = document.querySelector('[data-control="variant"]');
  const idx = Math.max(0, Math.min(arr.length - 1, (+(sel ? sel.value : def.state.variant) || 1) - 1));
  const v = arr[idx];
  Object.keys(map).forEach(k => {
    if (v[k] === undefined) return;
    def.state[k] = v[k];
    const inp = document.querySelector('[data-control="' + k + '"]');
    if (inp) inp.value = v[k];
  });
}

function heatVarSelect(arr, describe) {
  return {
    id: "variant", label: "Variant topshirig‘i", type: "select", value: "1",
    options: arr.map((v, i) => ({ value: String(i + 1), label: (i + 1) + "-variant · " + describe(v) }))
  };
}

/* ---------------- chizish yordamchilari ---------------- */

function heatShell(ctx, title, meta) {
  subjectBg(ctx, "QUYMAKORLIK", title, meta);
}

function heatA(c, a) {
  if (!c) return "rgba(245,184,75," + a + ")";
  if (c.charAt(0) === "#") return hexA(c, a);
  return c.replace("rgb(", "rgba(").replace(")", "," + a + ")");
}

function heatPillRow(ctx, list, y, ac, x0) {
  let x = x0 == null ? 30 : x0;
  const o = { bg: heatA(ac, .09), border: heatA(ac, .32), color: "#f6dfb4" };
  list.forEach(t => { x += pill(ctx, x, y, t, o) + 8; });
  return x - 8;
}

function heatPanelTitle(ctx, x, y, label, ac) {
  text(ctx, label, x, y, { size: 9.5, weight: 750, color: heatA(ac, .82) });
}

function heatBar(ctx, x, y, w, h, frac, color, track) {
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = track || "rgba(255,255,255,.055)";
  ctx.fill();
  const ww = clamp(frac, 0, 1) * w;
  if (ww > 1) {
    rr(ctx, x, y, Math.max(ww, h), h, h / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function heatGauge(ctx, cx, cy, r, frac, color, value, label) {
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
  ctx.lineCap = "round";
  ctx.lineWidth = 9;
  ctx.strokeStyle = "rgba(255,255,255,.07)";
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + (a1 - a0) * clamp(frac, 0, 1)); ctx.stroke();
  ctx.lineCap = "butt";
  text(ctx, value, cx, cy + 5, { size: 16, align: "center", weight: 750, mono: true });
  text(ctx, label, cx, cy + r * 0.62, { size: 8.5, align: "center", color: "rgba(190,215,230,.6)" });
}

function heatSpark(ctx, x, y, w, h, vals, color, fill) {
  const n = vals.length;
  if (n < 2) return;
  const pts = vals.map((v, i) => [x + w * i / (n - 1), y + h * (1 - clamp(v, 0, 1))]);
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], y + h);
    pts.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(pts[n - 1][0], y + h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, heatA(color, .28));
    g.addColorStop(1, heatA(color, 0));
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function heatFlame(ctx, x, y, s, time, color) {
  const f = 0.88 + 0.12 * Math.sin(time * 7 + x * 0.05);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y);
  ctx.quadraticCurveTo(x - s * 0.62, y - s * 0.95 * f, x + Math.sin(time * 3 + x) * s * 0.12, y - s * 1.85 * f);
  ctx.quadraticCurveTo(x + s * 0.62, y - s * 0.95 * f, x + s * 0.5, y);
  ctx.closePath();
  ctx.fillStyle = heatA(color, .22);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.24, y);
  ctx.quadraticCurveTo(x - s * 0.3, y - s * 0.5 * f, x, y - s * 0.95 * f);
  ctx.quadraticCurveTo(x + s * 0.3, y - s * 0.5 * f, x + s * 0.24, y);
  ctx.closePath();
  ctx.fillStyle = heatA("#ffd27a", .55);
  ctx.fill();
}

function heatBrick(ctx, x, y, w, h, color) {
  ctx.fillStyle = heatA(color, .09);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = heatA(color, .16);
  ctx.lineWidth = 0.8;
  const step = 11;
  for (let yy = y + step; yy < y + h; yy += step) {
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
  }
  for (let row = 0, yy = y; yy < y + h; yy += step, row++) {
    const off = row % 2 ? step : 0;
    for (let xx = x + off; xx < x + w; xx += step * 2) {
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, Math.min(y + h, yy + step)); ctx.stroke();
    }
  }
}

function heatFlow(ctx, x1, y1, x2, y2, color, time, speed) {
  ctx.save();
  ctx.setLineDash([7, 7]);
  ctx.lineDashOffset = -((time || 0) * (speed || 28)) % 14;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function heatGlow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, heatA(color, .5));
  g.addColorStop(0.45, heatA(color, .16));
  g.addColorStop(1, heatA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function heatStatusPill(ctx, x, y, ok, textOk, textBad) {
  return pill(ctx, x, y, ok ? textOk : textBad, {
    bg: ok ? "rgba(94,224,138,.12)" : "rgba(255,110,90,.13)",
    border: ok ? "rgba(94,224,138,.4)" : "rgba(255,110,90,.45)",
    color: ok ? "#a9f0c0" : "#ffb3a6"
  });
}

function heatRow(ctx, x, y, label, value, color) {
  text(ctx, label, x, y, { size: 9.5, color: "rgba(175,200,215,.68)" });
  text(ctx, value, x, y + 14, { size: 12, weight: 650, mono: true, color: color || "#e9f4fb" });
}

function heatSteel(ctx, x, y, w, h, hot) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, hot || "#7d8b98");
  g.addColorStop(0.55, "#4c5966");
  g.addColorStop(1, "#2f3a45");
  rr(ctx, x, y, w, h, 3);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(220,235,245,.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function heatGrid(ctx, x, y, w, h) {
  ctx.strokeStyle = "rgba(150,200,220,.07)";
  ctx.lineWidth = 1;
  for (let xx = x; xx <= x + w; xx += w / 6) {
    ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); ctx.stroke();
  }
  for (let yy = y; yy <= y + h; yy += h / 4) {
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
  }
}

function heatFinish() {
  SUBJECT_LABS.quymakorlik = ["quymakorlik"].concat(HEAT_LAB_KEYS);
  const card = CARDS.find(c => c.key === "quymakorlik");
  if (card) {
    card.count = "15 ish";
    card.tagline = "Qizdirish qurilmalari: 15 amaliy ish, hisob va sxemalar.";
    card.tags = ["15 ish", "pechlar", "TXT"];
  }
  const foot = document.querySelector("footer .footer-inner span:last-child");
  if (foot) foot.textContent = "8 fan · 31 ish · animatsiyalar · hisobot";
  window.SubjectCatalog = { defs: defs, labs: SUBJECT_LABS };
  renderCards();
  const hash = (location.hash || "").replace(/^#/, "");
  if (hash.startsWith("quymakorlik") && hash !== currentKey) route();
}
