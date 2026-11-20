(function () {
  "use strict";

  const DESIGN = { w: 1280, h: 780 };
  const C = {
    bg: "#050B14", panel: "#0C1926", panel2: "#081320", line: "#1D3348",
    text: "#EEF6FF", muted: "#9DB2C6", dim: "#6F8499",
    blue: "#4DA8FF", amber: "#FFC24B", green: "#3FD0A3", purple: "#B084FF", red: "#FF7A7A"
  };

  const ROLES = {
    teacher: { label: "O‘qituvchi", color: C.blue },
    student: { label: "Talaba", color: C.green },
    dev: { label: "Dasturchi", color: C.purple },
    critic: { label: "Tanqidchi", color: C.red },
    danger: { label: "Xavf ishqibozi", color: C.amber }
  };

  const PERSONAS = [
    { name: "Muzaffar aka", age: 52, role: "teacher", trait: "katta guruh, vaqt kam", focus: ["guruh", "baholash", "hisobot", "tezlik"] },
    { name: "Dilnoza opa", age: 38, role: "teacher", trait: "nazariya bilan bog‘lash", focus: ["tushunarlilik", "tillar", "baholash"] },
    { name: "Sardor aka", age: 45, role: "teacher", trait: "metodist, hisobotchi", focus: ["hisobot", "baholash", "guruh", "eksport"] },
    { name: "Nodira opa", age: 29, role: "teacher", trait: "telefon bilan ishlaydi", focus: ["mobil", "kirish", "tezlik"] },
    { name: "Jasur", age: 20, role: "student", trait: "o‘yin va tez natija", focus: ["grafik", "tezlik", "effekt"] },
    { name: "Malika", age: 19, role: "student", trait: "xatoni tushunishni xohlaydi", focus: ["tushunarlilik", "mobil", "baholash"] },
    { name: "Bekzod", age: 21, role: "student", trait: "interneti sekin", focus: ["oflayn", "tezlik", "mobil"] },
    { name: "Shahzod", age: 18, role: "student", trait: "qiyin labdan qo‘rqadi", focus: ["tushunarlilik", "kirish", "tushunarlilik"] },
    { name: "Aziza", age: 20, role: "student", trait: "hisobotni tez yozadi", focus: ["hisobot", "eksport", "tezlik"] },
    { name: "Temur", age: 22, role: "student", trait: "guruhda musobaqa", focus: ["guruh", "grafik", "baholash"] },
    { name: "Rustam", age: 27, role: "dev", trait: "frontend, tezlik", focus: ["tezlik", "oflayn", "mobil"] },
    { name: "Kamola", age: 24, role: "dev", trait: "backend, integratsiya", focus: ["eksport", "oflayn", "tillar"] },
    { name: "Otabek", age: 31, role: "dev", trait: "game-dev, animatsiya", focus: ["grafik", "effekt", "tezlik"] },
    { name: "Erkin", age: 40, role: "critic", trait: "mustaqil ekspert", focus: ["tushunarlilik", "baholash", "guruh"] },
    { name: "Sevara", age: 33, role: "critic", trait: "UX tadqiqotchi", focus: ["mobil", "kirish", "tushunarlilik"] },
    { name: "Botir", age: 28, role: "critic", trait: "xavfsizlik mutaxassisi", focus: ["xavfsizlik", "oflayn", "kirish"] },
    { name: "Doniyor", age: 19, role: "danger", trait: "effektlarni yaxshi ko‘radi", focus: ["effekt", "xavfsizlik", "grafik"] },
    { name: "Umid", age: 20, role: "danger", trait: "«nima bo‘ladi agar» tajribalari", focus: ["effekt", "xavfsizlik", "tushunarlilik"] },
    { name: "Gulsanam", age: 21, role: "danger", trait: "avariya holatlari", focus: ["xavfsizlik", "effekt", "hisobot"] },
    { name: "Farrux", age: 23, role: "danger", trait: "ekstremal parametrlar", focus: ["effekt", "grafik", "tezlik"] }
  ];

  const TOPICS = {
    tushunarlilik: {
      label: "Tushunarlilik",
      task: "Har qadamga izoh va avtomatik tekshiruv qo‘shish",
      problem: ["formula qayerdan kelgani ko‘rinmadi", "qadamlar tartibi chalkash", "natija izohsiz chiqdi", "hisobni qo‘lda tekshirishga joy yo‘q"],
      praise: ["slayder bilan formula bog‘lanishi aniq", "natija darhol yangilanadi"]
    },
    tezlik: {
      label: "Tezlik",
      task: "Yuklanishni tezlashtirish va og‘ir fayllarni bo‘laklab o‘qish",
      problem: ["sahifa sekin ochildi", "animatsiya telefonda qotdi", "katta fayl yuklanganda kutish uzoq"],
      praise: ["ochilish tez", "animatsiya silliq ishladi"]
    },
    oflayn: {
      label: "Oflayn",
      task: "Oflayn rejim (PWA) qo‘shish",
      problem: ["internet uzilganda ishlamaydi", "auditoriyada Wi-Fi yo‘q", "oflayn ochish imkoni yo‘q"],
      praise: ["oflayn ham ochildi"]
    },
    hisobot: {
      label: "Hisobot",
      task: "Hisobotni avtomatik shakllantirish va birliklarni tekshirish",
      problem: ["hisobotni qo‘lda yozish uzoq", "hisobotda birliklar avtomatik chiqmaydi", "xulosani qayta yozishga to‘g‘ri keldi"],
      praise: ["hisobot bir tugmada yuklandi"]
    },
    baholash: {
      label: "Baholash",
      task: "Rubrika bo‘yicha avtomatik baholash",
      problem: ["talaba xatosini tizim aytmaydi", "o‘qituvchi har ishni qo‘lda tekshiradi", "ball qanday qo‘yilishi noaniq"],
      praise: ["natija aniq ko‘rsatilgan"]
    },
    xavfsizlik: {
      label: "Xavfsizlik",
      task: "Xavfli rejim: chegaralar, ogohlantirish va nosozlik simulyatsiyasi",
      problem: ["xavfli qiymatlarda ogohlantirish yo‘q", "avariya holati ko‘rsatilmaydi", "chegara qiymatlar belgilanmagan"],
      praise: ["chegarada ogohlantirish chiqadi"]
    },
    mobil: {
      label: "Mobil",
      task: "Mobil ko‘rinishni yaxshilash",
      problem: ["telefonda tugmalar kichik", "gorizontal surish qiyin", "telefon ekranida panel sig‘madi"],
      praise: ["telefonda ham qulay"]
    },
    eksport: {
      label: "Eksport",
      task: "Excel/CSV eksport qo‘shish",
      problem: ["natijalarni jadvalga chiqarish yo‘q", "Excelga ko‘chirish qiyin", "guruh natijalarini yig‘ish qo‘lda"],
      praise: ["TXT hisobot qulay"]
    },
    kirish: {
      label: "Kirish",
      task: "QR-kod bilan sinfga kirish",
      problem: ["kodni qo‘lda yozish noqulay", "talabalar navbatda qoldi", "havola ulashish oson emas"],
      praise: ["kod bilan kirish oson"]
    },
    effekt: {
      label: "Effektlar",
      task: "Avariya effektlari: kuyish, uchqun, ogohlantirish",
      problem: ["haddan tashqari qizish ko‘rinmaydi", "nosozlik effekti yo‘q", "portlash yoki kuyish ko‘rsatilmaydi"],
      praise: ["animatsiya jonli chiqdi"]
    },
    grafik: {
      label: "Grafika",
      task: "3D/AR ko‘rinish qo‘shish",
      problem: ["2D chizmalar yetarli emas", "3D ko‘rinish yo‘q", "qurilma ichini ko‘rish qiyin"],
      praise: ["chizmalar tushunarli"]
    },
    guruh: {
      label: "Guruh",
      task: "Har talabaga alohida variant va guruh statistikasi",
      problem: ["60 talaba bir vaqtda sig‘maydi", "variantlar takrorlanadi", "kim qaysi variantni olgani ko‘rinmaydi"],
      praise: ["guruh bilan ishlash qulay"]
    },
    narx: {
      label: "Jihoz va smeta",
      task: "Jihoz va smeta bo‘limini qo‘shish",
      problem: ["jihoz narxi ko‘rsatilmagan", "smeta hisobi yo‘q"],
      praise: ["jihozlar ro‘yxati bor"]
    },
    tillar: {
      label: "Tillar",
      task: "Rus va ingliz tilini qo‘shish",
      problem: ["rus/ingliz tili yo‘q", "atamalar izohsiz qoldi"],
      praise: ["o‘zbek tilida tushunarli"]
    }
  };

  const LABS = [
    {
      id: "heat", subject: "Quymakorlik", title: "Qizdirish elementi", result: { label: "d", unit: "mm", dec: 2 },
      params: [
        { id: "P", unit: "kVt", min: 3, max: 24, step: 1 },
        { id: "U", unit: "V", min: 110, max: 440, step: 10 },
        { id: "w", unit: "Vt/sm²", min: 0.6, max: 4.8, step: 0.2 }
      ],
      calc: p => 0.217 * Math.cbrt(Math.pow(p.P * 1000, 2) * 1.187 / (p.U * p.U * p.w))
    },
    {
      id: "load", subject: "Quymakorlik", title: "Sirtqi yuklama", result: { label: "w", unit: "Vt/sm²", dec: 2 },
      params: [
        { id: "P", unit: "kVt", min: 3, max: 25, step: 1 },
        { id: "d", unit: "mm", min: 1.5, max: 6, step: 0.1 },
        { id: "L", unit: "m", min: 20, max: 80, step: 5 }
      ],
      calc: p => p.P * 1000 / (Math.PI * (p.d / 10) * (p.L * 100))
    },
    {
      id: "induk", subject: "Quymakorlik", title: "Induksion pech quvvati", result: { label: "P", unit: "kVt", dec: 1 },
      params: [
        { id: "m", unit: "kg", min: 5, max: 40, step: 1 },
        { id: "T", unit: "°C", min: 500, max: 1300, step: 25 },
        { id: "t", unit: "min", min: 2, max: 12, step: 0.5 }
      ],
      calc: p => p.m * 0.68 * (p.T - 20) / (p.t * 60 * 0.76)
    },
    {
      id: "gaz", subject: "Quymakorlik", title: "Yumshatish pechi gaz sarfi", result: { label: "V", unit: "m³/soat", dec: 1 },
      params: [
        { id: "P", unit: "t/soat", min: 1, max: 5, step: 0.5 },
        { id: "T", unit: "°C", min: 700, max: 950, step: 10 },
        { id: "k", unit: "", min: 1.25, max: 1.5, step: 0.01 }
      ],
      calc: p => p.P * 1000 * 0.68 * (p.T - 20) * p.k / 35588
    },
    {
      id: "termo", subject: "Quymakorlik", title: "Termojuftlik signali", result: { label: "E", unit: "mV", dec: 2 },
      params: [
        { id: "T", unit: "°C", min: 400, max: 1700, step: 25 },
        { id: "T0", unit: "°C", min: 0, max: 50, step: 1 }
      ],
      calc: p => (p.T - p.T0) * 0.041
    },
    {
      id: "kamera", subject: "Quymakorlik", title: "Kamerali pech quvvati", result: { label: "Q", unit: "kVt", dec: 1 },
      params: [
        { id: "F", unit: "m²", min: 2, max: 20, step: 1 },
        { id: "T", unit: "°C", min: 300, max: 1000, step: 25 }
      ],
      calc: p => p.F * (p.T - 20) * 0.011
    },
    {
      id: "fall", subject: "Fizika", title: "Erkin tushish vaqti", result: { label: "t", unit: "s", dec: 2 },
      params: [{ id: "h", unit: "m", min: 5, max: 100, step: 5 }],
      calc: p => Math.sqrt(2 * p.h / 9.81)
    },
    {
      id: "decay", subject: "Fizika", title: "Yadro parchalanishi", result: { label: "A", unit: "kBq", dec: 1 },
      params: [
        { id: "A0", unit: "kBq", min: 100, max: 400, step: 10 },
        { id: "T½", unit: "kun", min: 2, max: 10, step: 1 },
        { id: "t", unit: "kun", min: 1, max: 20, step: 1 }
      ],
      calc: p => p.A0 * Math.pow(2, -p.t / p["T½"])
    },
    {
      id: "filter", subject: "Gidravlika", title: "Suv filtri samaradorligi", result: { label: "η", unit: "%", dec: 1 },
      params: [
        { id: "Cin", unit: "mg/l", min: 5, max: 40, step: 1 },
        { id: "Cout", unit: "mg/l", min: 0.2, max: 5, step: 0.2 }
      ],
      calc: p => (1 - p.Cout / p.Cin) * 100
    },
    {
      id: "hydro", subject: "Gidravlika", title: "Gidrostatik bosim", result: { label: "p", unit: "kPa", dec: 1 },
      params: [
        { id: "ρ", unit: "kg/m³", min: 700, max: 1400, step: 10 },
        { id: "h", unit: "m", min: 1, max: 15, step: 1 }
      ],
      calc: p => p["ρ"] * 9.81 * p.h / 1000
    },
    {
      id: "gear", subject: "Mexanika", title: "Tishli uzatma nisbati", result: { label: "i", unit: "", dec: 2 },
      params: [
        { id: "z1", unit: "tish", min: 12, max: 40, step: 1 },
        { id: "z2", unit: "tish", min: 20, max: 120, step: 1 }
      ],
      calc: p => p.z2 / p.z1
    },
    {
      id: "heart", subject: "Anatomiya", title: "Yurak debiti", result: { label: "Q", unit: "l/min", dec: 2 },
      params: [
        { id: "SV", unit: "ml", min: 50, max: 120, step: 5 },
        { id: "HR", unit: "urish/min", min: 50, max: 180, step: 5 }
      ],
      calc: p => p.SV * p.HR / 1000
    }
  ];

  const PREFIX = {
    teacher: ["Guruh bilan sinab ko‘rdim", "5 talaba bilan ochdim", "Darsda qo‘lladim"],
    student: ["Uyda ochib ko‘rdim", "Telefonda sinab ko‘rdim", "Kechqurun ishladim"],
    dev: ["Texnik tomondan ko‘rdim", "Kodni o‘lchadim", "Keshni tozalab sindim"],
    critic: ["Kamchilik izladim", "Yonma-yon solishtirdim", "Qattiq tekshirdim"],
    danger: ["Chegaragacha bosdim", "Maksimal qiymatlarni qo‘ydim", "Hammasini buzdim"]
  };

  const THOUGHTS = {
    teacher: [
      "30 talabaga bir vaqtda bersam, chalkashmaydimi?",
      "Talaba xatoni o‘zi topa oladimi?",
      "Bu labni darsning qaysi qismiga qo‘ysam bo‘ladi?",
      "Hisobotni tekshirishga qancha vaqt ketadi?"
    ],
    student: [
      "Maksimal qiymatni qo‘ysam nima bo‘ladi?",
      "Telefonda ham shunday chiroyli ochiladimi?",
      "Xato qilsam, tizim menga aytadimi?",
      "Bu natijani qanday qilib tushuntiraman?"
    ],
    dev: [
      "Yuklanish vaqtini o‘lchab ko‘ray.",
      "Keshni tozalab, qaytadan sinab ko‘ray.",
      "Hamma brauzerda bir xil ishlaydimi?",
      "Kodni sekinlashtiradigan joy bormi?"
    ],
    critic: [
      "Bu yerda nimani buzsa bo‘ladi?",
      "Talaba buni noto‘g‘ri tushunishi mumkinmi?",
      "Boshqa lablar bilan solishtirsam-chi?",
      "Chegara qiymatlarda nima ko‘rsatadi?"
    ],
    danger: [
      "Hammasini maksimumga tortaman.",
      "Bu qurilma qachon portlaydi?",
      "Avariya bo‘lsa, tizim nimani ko‘rsatadi?",
      "Chegaradan chiqarsam nima bo‘ladi?"
    ]
  };

  const BOSS = { name: "Qoder", roleLabel: "Bosh agent", color: "#5FE1FF" };

  const PHASES = {
    command: { label: "Buyruq", dur: 5 },
    analyze: { label: "Tahlil", dur: 60 },
    collect: { label: "Yig‘ish", dur: 5 },
    vote: { label: "Ovoz berish", dur: 14 },
    apply: { label: "Push qilish", dur: 6 },
    verify: { label: "Tekshiruv", dur: 20 }
  };

  const VERIFY_BUGS = [
    "mobil ekranda natija paneli pastga siljidi",
    "slayder qiymati qayta ochilganda saqlanmadi",
    "ogohlantirish banneri sarlavha bilan ustma-ust tushdi",
    "hisobot faylida o‘lchov birligi tushib qoldi",
    "sinf honasi kodi bilan kirishda kechikish bor",
    "sahifa telefonda gorizontal suriladi",
    "kesh eski skriptni ko‘rsatmoqda"
  ];

  const ROLE_BIAS = {
    teacher: { baholash: 0.3, hisobot: 0.24, guruh: 0.2, tushunarlilik: 0.14, tillar: 0.1 },
    student: { mobil: 0.2, tushunarlilik: 0.14, tezlik: 0.12, grafik: 0.1, hisobot: 0.08 },
    dev: { tezlik: 0.24, oflayn: 0.2, eksport: 0.14, mobil: 0.08 },
    critic: { xavfsizlik: 0.2, tushunarlilik: 0.14, kirish: 0.1, baholash: 0.08 },
    danger: { effekt: 0.34, xavfsizlik: 0.2, grafik: 0.1, tezlik: 0.05 }
  };

  const GRID = { x: 54, y: 204, w: 1200, h: 552, cols: 5, rows: 4, gap: 12 };
  const CELL_W = (GRID.w - GRID.gap * (GRID.cols - 1)) / GRID.cols;
  const CELL_H = (GRID.h - GRID.gap * (GRID.rows - 1)) / GRID.rows;

  function roomRect(i) {
    const c = i % GRID.cols;
    const r = Math.floor(i / GRID.cols);
    return {
      x: GRID.x + c * (CELL_W + GRID.gap),
      y: GRID.y + r * (CELL_H + GRID.gap),
      w: CELL_W, h: CELL_H
    };
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function fmt(v, step) {
    const dec = step != null && step < 0.1 ? 2 : step != null && step < 1 ? 1 : 0;
    return v.toFixed(step != null && step < 1 && step >= 0.1 ? 1 : dec).replace(".", ",");
  }

  const agents = PERSONAS.map((p, i) => ({
    ...p,
    id: i,
    color: ROLES[p.role].color,
    roleLabel: ROLES[p.role].label,
    rect: roomRect(i),
    state: "rest",
    timer: rand(0.2, 9),
    phase: Math.random() * 10,
    lab: null,
    params: null,
    result: null,
    runs: 0,
    notes: [],
    satisfaction: Math.round(rand(52, 78)),
    bubble: null,
    status: 1
  }));

  let playing = true;
  let speed = 1;
  let simTime = 0;
  let selected = null;
  let feed = [];
  let lastUi = -1;
  let dirty = true;
  let lastStats = 0;

  const cycle = {
    phase: "command",
    t: 0,
    version: 1,
    orderNo: 0,
    order: "",
    windowStart: 0,
    proposals: [],
    votes: [],
    reveal: 0,
    revealT: 0,
    changelog: [],
    applied: [],
    lastApplied: "",
    pushed: null,
    verify: null,
    stopMode: false,
    checkIdx: 0,
    checkT: 0
  };

  function orderText(n, applied) {
    if (n === 0) return "Diqqat! Har qanday ishdan oldin dasturni tahlil qiling: har bir labni ochib, kamchilik va g‘oyalaringizni yozing.";
    if (n % 2 === 1) return "Men ovozlar bo‘yicha dasturni o‘zgartirdim" + (applied ? " («" + applied + "»)" : "") + ". Uni ko‘rib chiqing va qayta tahlil qiling.";
    return "Kamchiliklar qolmagan bo‘lsa — yana nimalar qo‘shishimiz mumkin? Dasturni tahlil qiling va yangi g‘oyalarni ayting.";
  }

  function ver() {
    return "v1." + (cycle.version - 1);
  }

  function bossSay(text, tone) {
    feed.unshift({ boss: true, text, tone: tone || "boss", t: simTime });
    if (feed.length > 90) feed.pop();
    dirty = true;
  }

  function voteProb(a, topic) {
    let p = 0.42 + Math.min(0.08, (cycle.version - 1) * 0.02);
    if (a.focus.indexOf(topic) !== -1) p += 0.3;
    p += (ROLE_BIAS[a.role] && ROLE_BIAS[a.role][topic]) || 0;
    return clamp(p, 0.08, 0.95);
  }

  function buildProposals(limit) {
    const max = limit || 2;
    const counts = {};
    for (const a of agents) {
      for (const n of a.notes) {
        if (n.t >= cycle.windowStart && n.tone !== "praise") counts[n.topic] = (counts[n.topic] || 0) + 1;
      }
    }
    const fresh = k => cycle.applied.indexOf(k) === -1;
    let picked = Object.keys(counts)
      .filter(k => counts[k] >= 2 && fresh(k))
      .sort((x, y) => counts[y] - counts[x])
      .slice(0, max);
    if (!picked.length) {
      picked = Object.keys(counts).filter(fresh).sort((x, y) => counts[y] - counts[x]).slice(0, max);
    }
    if (!picked.length) {
      cycle.applied = [];
      picked = ["effekt", "tezlik"];
    }
    while (picked.length < 2) {
      const cand = Object.keys(TOPICS).find(k => picked.indexOf(k) === -1 && k !== "narx" && fresh(k));
      if (!cand) break;
      picked.push(cand);
    }
    cycle.proposals = picked.map(k => ({
      topic: k,
      label: TOPICS[k].label,
      task: TOPICS[k].task,
      support: counts[k] || 0
    }));
  }

  function buildVotes() {
    cycle.votes = cycle.proposals.map(p => ({
      ...p,
      decisions: agents.map(a => ({ a, yes: Math.random() < voteProb(a, p.topic) })),
      yes: 0,
      no: 0
    }));
    cycle.reveal = 0;
    cycle.revealT = 0;
    for (const a of agents) a.vote = null;
  }

  function revealStep() {
    if (cycle.reveal >= agents.length) return;
    const i = cycle.reveal++;
    for (const v of cycle.votes) {
      const d = v.decisions[i];
      if (d.yes) v.yes++;
      else v.no++;
    }
    if (cycle.votes[0]) cycle.votes[0].decisions[i].a.vote = cycle.votes[0].decisions[i].yes ? "yes" : "no";
    dirty = true;
  }

  function setPhase(phase) {
    cycle.phase = phase;
    cycle.t = 0;
    if (phase !== "vote") for (const a of agents) a.vote = null;
    if (phase === "analyze") {
      cycle.windowStart = simTime;
      for (const a of agents) { a.state = "rest"; a.timer = rand(0.1, 2.2); }
      bossSay("Tahlil boshlandi. " + PHASES.analyze.dur + " soniya ichida barcha lablarni ko‘rib chiqing va xulosa yozing.");
    } else if (phase === "collect") {
      for (const a of agents) a.state = "rest";
      buildProposals();
      bossSay("Fikrlaringizni yig‘yapman. Eng ko‘p takrorlangan muammolarni ajrataman.");
    } else if (phase === "vote") {
      for (const a of agents) a.state = "rest";
      buildVotes();
      const names = cycle.proposals.map(p => "«" + p.label + "»").join(", ");
      bossSay("Takliflar: " + names + ". Hammangiz ovoz bering.", "vote");
    } else if (phase === "apply") {
      while (cycle.reveal < agents.length) revealStep();
      const passed = cycle.votes.filter(v => v.yes > v.no).sort((a, b) => (b.yes - b.no) - (a.yes - a.no));
      if (passed.length) {
        const best = passed[0];
        cycle.version++;
        if (cycle.applied.indexOf(best.topic) === -1) cycle.applied.push(best.topic);
        cycle.lastApplied = best.label;
        cycle.pushed = { label: best.label, task: best.task, version: ver() };
        cycle.changelog.unshift(ver() + " — " + best.task + " (" + best.yes + "/" + (best.yes + best.no) + " ovoz)");
        if (cycle.changelog.length > 6) cycle.changelog.pop();
        bossSay("Ovozlar bo‘yicha «" + best.label + "» dasturga push qilindi. Yangi versiya " + ver() + ".", "apply");
      } else {
        cycle.pushed = null;
        bossSay("Bu safar takliflar yetarli ovoz olmadi — push qilinmadi. Qayta tahlil qilamiz.", "warn");
      }
    } else if (phase === "verify") {
      cycle.stopMode = false;
      cycle.checkIdx = 0;
      cycle.checkT = 0;
      cycle.verify = { ok: 0, err: 0, errors: [] };
      const target = cycle.pushed ? "«" + cycle.pushed.label + "» (" + cycle.pushed.version + ")" : "oxirgi o‘zgarish";
      bossSay("Push bajarildi: " + target + ". Endi shu o‘zgarishni tekshiring — xatosi bormi, hamma joyda ishlayaptimi?", "verify");
    } else if (phase === "command") {
      cycle.orderNo++;
      cycle.order = orderText(cycle.orderNo, cycle.lastApplied);
      bossSay(cycle.order);
    }
    updateStopBtn();
    dirty = true;
  }

  function finishVerify() {
    const v = cycle.verify || { ok: 0, err: 0, errors: [] };
    const total = v.ok + v.err;
    if (!total) {
      bossSay("Tekshiruvda hech kim javob bermadi — keyingi sikl tahlili boshlanadi.", "warn");
      return;
    }
    if (v.err === 0) {
      bossSay("Tekshiruv: " + total + " ta agent tekshirdi — xato topilmadi. Push toza, keyingi buyruqni kutamiz.", "apply");
    } else {
      bossSay("Tekshiruv: " + v.ok + " agent xato topmadi, " + v.err + " ta xato qayd etildi: " + v.errors[0] + (v.errors.length > 1 ? " va boshqalar" : "") + ". Keyingi siklda tuzatamiz.", "warn");
    }
  }

  function writeCheck(a) {
    const errRate = a.role === "danger" ? 0.5 : a.role === "critic" ? 0.35 : a.role === "dev" ? 0.18 : 0.1;
    const bad = Math.random() < errRate;
    const target = cycle.pushed ? "«" + cycle.pushed.label + "»" : "oxirgi o‘zgarish";
    const bug = pick(VERIFY_BUGS);
    const text = bad
      ? a.name + ": " + target + " tekshirdim — xato: " + bug + "."
      : a.name + ": " + target + " tekshirdim — ishlayapti, xato topilmadi.";
    a.bubble = { text, ttl: 4.2, tone: bad ? "excite" : "praise" };
    feed.unshift({ agent: a, topic: "tekshiruv", tone: bad ? "check-err" : "check-ok", text, t: simTime, check: true });
    if (feed.length > 90) feed.pop();
    if (cycle.verify) {
      if (bad) { cycle.verify.err++; cycle.verify.errors.push(bug); }
      else cycle.verify.ok++;
    }
    dirty = true;
  }

  function phaseTick(dt) {
    cycle.t += dt;
    if (cycle.phase === "vote") {
      cycle.revealT += dt;
      if (cycle.revealT >= 0.5 && cycle.reveal < agents.length) {
        cycle.revealT = 0;
        revealStep();
      }
    }
    if (cycle.phase === "verify") {
      cycle.checkT += dt;
      if (cycle.checkT >= 0.9 && cycle.checkIdx < agents.length) {
        cycle.checkT = 0;
        writeCheck(agents[cycle.checkIdx++]);
      }
    }
    if (cycle.t >= PHASES[cycle.phase].dur) {
      if (cycle.phase === "verify") finishVerify();
      const next = { command: "analyze", analyze: "collect", collect: "vote", vote: "apply", apply: "verify", verify: "command" };
      setPhase(next[cycle.phase]);
    }
  }

  const byId = id => document.getElementById(id);
  const stateColor = a => a.state === "run" ? C.amber : a.state === "think" ? C.blue : a.state === "note" ? C.purple : C.green;

  function runLab(a) {
    const lab = pick(LABS);
    const params = lab.params.map(p => {
      const steps = Math.round((p.max - p.min) / p.step);
      return { ...p, v: +(p.min + Math.round(Math.random() * steps) * p.step).toFixed(2) };
    });
    return { lab, params, value: lab.calc(Object.fromEntries(params.map(p => [p.id, p.v]))) };
  }

  function pickTone(a) {
    const r = Math.random();
    if (a.role === "danger") return r < 0.6 ? "excite" : "problem";
    if (a.role === "critic") return r < 0.85 ? "problem" : "praise";
    if (a.role === "teacher") return r < 0.62 ? "problem" : "praise";
    if (a.role === "dev") return r < 0.6 ? "problem" : "praise";
    return r < 0.45 ? "problem" : "praise";
  }

  function makeNote(a, run) {
    const tone = pickTone(a);
    const topicKey = tone === "excite" ? "effekt" : pick(a.focus);
    const T = TOPICS[topicKey] || TOPICS.tushunarlilik;
    const prefix = pick(PREFIX[a.role]);
    const p0 = run.params[0];
    const num = p0.id + " = " + fmt(p0.v, p0.step) + (p0.unit ? " " + p0.unit : "");
    let text;
    if (tone === "praise") {
      text = prefix + ": «" + run.lab.title + "» — " + pick(T.praise) + ".";
    } else if (tone === "excite") {
      text = prefix + ": «" + run.lab.title + "» da " + num + " — " + pick(T.problem) + "! Shu joyda kuchliroq effekt kerak.";
    } else {
      text = prefix + ": «" + run.lab.title + "» — " + pick(T.problem) + " (" + num + ").";
    }
    return {
      agent: a,
      lab: run.lab,
      topic: topicKey,
      tone,
      text,
      value: run.value,
      unit: run.lab.result.unit,
      t: simTime
    };
  }

  function beginThink(a) {
    a.state = "think";
    a.timer = rand(1.6, 4.2);
    a.pending = runLab(a);
    a.thought = pick(THOUGHTS[a.role]);
    a.bubble = { text: a.thought, ttl: 2.3, tone: "think" };
  }

  function beginRun(a) {
    a.state = "run";
    a.timer = rand(1.2, 3.2);
    a.runs++;
  }

  function beginNote(a) {
    const run = a.pending;
    a.result = run;
    a.state = "note";
    a.timer = 0.7;
    const note = makeNote(a, run);
    a.notes.unshift(note);
    if (a.notes.length > 12) a.notes.pop();
    a.satisfaction = clamp(a.satisfaction + (note.tone === "praise" ? 2.5 : -1.4 - (a.role === "critic" ? 0.6 : 0)), 20, 96);
    a.bubble = { text: note.text, ttl: 4.2, tone: note.tone };
    feed.unshift(note);
    if (feed.length > 90) feed.pop();
    dirty = true;
  }

  function tick(dt) {
    simTime += dt;
    phaseTick(dt);
    const working = cycle.phase === "analyze";
    for (const a of agents) {
      if (a.bubble) {
        a.bubble.ttl -= dt;
        if (a.bubble.ttl <= 0) a.bubble = null;
      }
      if (!working) continue;
      a.timer -= dt * 1.4;
      if (a.timer > 0) continue;
      if (a.state === "rest") beginThink(a);
      else if (a.state === "think") beginRun(a);
      else if (a.state === "run") beginNote(a);
      else { a.state = "rest"; a.timer = rand(1.2, 3.4); }
    }
    if (dirty && simTime - lastUi > 0.3) flushUI();
  }

  function simClock() {
    const s = Math.floor(simTime);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function flushUI() {
    lastUi = simTime;
    dirty = false;
    renderStats();
    renderBoss();
    renderFeed();
    renderSummary();
    if (selected != null) renderAgentCard(agents[selected]);
  }

  function renderBoss() {
    const P = PHASES[cycle.phase];
    byId("boss-phase").textContent = P.label;
    byId("boss-ver").textContent = ver();
    byId("boss-order").textContent = cycle.order;
    byId("boss-bar").style.width = Math.min(100, cycle.t / P.dur * 100) + "%";
    const voteHost = byId("boss-vote");
    if ((cycle.phase === "vote" || cycle.phase === "apply") && cycle.votes.length) {
      voteHost.hidden = false;
      voteHost.innerHTML = cycle.votes.map(v => {
        const total = v.yes + v.no;
        const pct = total ? Math.round(v.yes / total * 100) : 0;
        return '<div class="bv-row"><span class="bv-name">' + v.label + '</span>' +
          '<span class="bv-nums">' + v.yes + ' ha · ' + v.no + ' yo‘q</span>' +
          '<span class="bv-bar"><i style="width:' + pct + '%"></i></span></div>';
      }).join("");
    } else {
      voteHost.hidden = true;
      voteHost.innerHTML = "";
    }
    byId("boss-log").innerHTML = (cycle.changelog.length ? cycle.changelog : ["v1.0 — boshlang‘ich versiya"])
      .map(x => "<li>" + x + "</li>").join("");
  }

  function renderStats() {
    const runs = agents.reduce((s, a) => s + a.runs, 0);
    const notes = agents.reduce((s, a) => s + a.notes.length, 0);
    const busy = agents.filter(a => a.state === "run" || a.state === "think").length;
    byId("stats").innerHTML =
      "<span><b>" + runs + "</b>urinish</span>" +
      "<span><b>" + notes + "</b>xulosa</span>" +
      "<span><b>" + busy + "</b>faol agent</span>" +
      "<span><b>" + simClock() + "</b>sessiya</span>";
  }

  function renderFeed() {
    const host = byId("feed");
    host.innerHTML = feed.slice(0, 40).map(n => {
      if (n.boss) {
        return '<div class="feed-item boss-item">' +
          '<span class="fdot" style="background:' + BOSS.color + '"></span>' +
          '<div><div class="fmeta"><b>' + BOSS.name + '</b><span class="role">' + BOSS.roleLabel + '</span>' +
          '<span class="chip boss">buyruq</span><time>' + fmtClock(n.t) + '</time></div>' +
          "<p>" + n.text + "</p></div></div>";
      }
      const cls = n.check ? (n.tone === "check-err" ? "err" : "check")
        : n.tone === "praise" ? "praise" : n.tone === "excite" ? "excite" : "";
      const label = n.check ? (n.tone === "check-err" ? "xato" : "xato yo‘q")
        : n.tone === "praise" ? "maqtov" : n.tone === "excite" ? "talab" : "muammo";
      return '<div class="feed-item">' +
        '<span class="fdot" style="background:' + n.agent.color + '"></span>' +
        '<div><div class="fmeta"><b>' + n.agent.name + '</b><span class="role">' + n.agent.roleLabel + '</span>' +
        '<span class="chip ' + cls + '">' + (TOPICS[n.topic] ? TOPICS[n.topic].label : n.topic) + ' · ' + label + '</span>' +
        '<time>' + fmtClock(n.t) + '</time></div>' +
        "<p>" + n.text + "</p></div></div>";
    }).join("") || '<p class="empty">Agentlar ishga tushmoqda…</p>';
  }

  function fmtClock(t) {
    const s = Math.floor(t);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function summaryData() {
    const counts = {};
    let problem = 0, praise = 0;
    for (const a of agents) {
      for (const n of a.notes) {
        const c = counts[n.topic] || (counts[n.topic] = { votes: 0, praise: 0 });
        if (n.tone === "praise") { c.praise++; praise++; }
        else { c.votes++; problem++; }
      }
    }
    return { counts, problem, praise };
  }

  function renderSummary() {
    const { counts, problem, praise } = summaryData();
    const rows = Object.keys(counts)
      .map(k => ({ k, ...counts[k] }))
      .sort((a, b) => b.votes - a.votes || b.praise - a.praise);
    const max = rows.length ? Math.max(1, rows[0].votes) : 1;
    byId("summary").innerHTML = rows.length
      ? rows.slice(0, 8).map(r =>
        '<div class="sum-row"><span class="sum-name">' + (TOPICS[r.k] ? TOPICS[r.k].label : r.k) + '</span>' +
        '<span class="sum-bar"><i style="width:' + Math.round(r.votes / max * 100) + '%"></i></span>' +
        '<b>' + r.votes + '</b></div>'
      ).join("") + '<p class="hint" style="margin-top:8px">' + problem + ' muammo · ' + praise + ' maqtov</p>'
      : '<p class="empty">Hali xulosa yo‘q.</p>';
    byId("next").innerHTML = rows.slice(0, 5).map(r =>
      "<li>" + (TOPICS[r.k] ? TOPICS[r.k].task : r.k) + ' <span>(' + r.votes + ' ovoz)</span></li>'
    ).join("") || "<li>Kutilmoqda…</li>";
  }

  function renderAgentCard(a) {
    const card = byId("agent-card");
    card.hidden = false;
    card.innerHTML =
      '<div class="agent-head"><div class="who"><h2>' + a.name + '</h2>' +
      '<div class="agent-role" style="color:' + a.color + '">' + a.roleLabel + ' · ' + a.age + ' yosh</div></div>' +
      '<button class="x" type="button" aria-label="Yopish">×</button></div>' +
      '<div class="agent-meta"><span>Xarakter: <b>' + a.trait + '</b></span>' +
      "<span>Urinish: <b>" + a.runs + "</b></span>" +
      "<span>Reyting: <b>" + Math.round(a.satisfaction) + "%</b></span>" +
      (a.vote ? "<span>Ovozi: <b>" + (a.vote === "yes" ? "ha" : "yo‘q") + "</b></span>" : "") + "</div>" +
      (a.thought && a.state !== "rest" ? '<div class="agent-thought">Fikri: ' + a.thought + "</div>" : "") +
      '<div class="agent-notes">' + (a.notes.length
        ? a.notes.slice(0, 6).map(n => "<p>• " + n.text + "</p>").join("")
        : '<p class="empty">Hali xulosa yozmadi.</p>') + "</div>";
    card.querySelector(".x").addEventListener("click", () => select(null));
  }

  function select(id) {
    selected = id;
    const card = byId("agent-card");
    if (id == null) { card.hidden = true; card.innerHTML = ""; return; }
    renderAgentCard(agents[id]);
  }

  /* ---------------- canvas ---------------- */

  const canvas = byId("town");
  const ctx = canvas.getContext("2d");
  let dpr = 1, scale = 1;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || 900;
    scale = w / DESIGN.w;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(DESIGN.h * scale * dpr);
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function text(str, x, y, size, color, weight, align) {
    ctx.font = (weight || 400) + " " + size + "px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(str, x, y);
  }

  function fit(str, maxW) {
    if (ctx.measureText(str).width <= maxW) return str;
    let s = str;
    while (s.length > 4 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
    return s + "…";
  }

  function drawRoom(a, t) {
    const R = a.rect;
    const sel = selected === a.id;
    roundRect(R.x, R.y, R.w, R.h, 12);
    ctx.fillStyle = "#0C1926";
    ctx.fill();
    ctx.lineWidth = sel ? 2 : 1;
    ctx.strokeStyle = sel ? a.color : "#1D3348";
    ctx.stroke();

    roundRect(R.x + 1, R.y + 1, R.w - 2, 8, 6);
    ctx.fillStyle = "rgba(77,168,255,.05)";
    ctx.fill();

    ctx.fillStyle = a.color;
    ctx.fillRect(R.x + 10, R.y + 12, 3, 12);

    text(fit(a.name, R.w - 90), R.x + 19, R.y + 22, 11.5, C.text, 600);
    text(a.roleLabel, R.x + 19, R.y + 35, 9.5, C.muted, 400);

    const sc = stateColor(a);
    const pulse = 0.55 + 0.45 * Math.sin(t * 3 + a.phase);
    ctx.beginPath();
    ctx.arc(R.x + R.w - 16, R.y + 18, 4, 0, Math.PI * 2);
    ctx.fillStyle = sc;
    ctx.globalAlpha = pulse;
    ctx.fill();
    ctx.globalAlpha = 1;

    const dx = R.x + 18, dy = R.y + R.h - 44;
    roundRect(dx, dy + 28, 74, 6, 3);
    ctx.fillStyle = "#16283A";
    ctx.fill();
    const mx = dx + 8, my = dy;
    roundRect(mx, my, 46, 30, 4);
    ctx.fillStyle = "#0A1622";
    ctx.fill();
    ctx.strokeStyle = "rgba(77,168,255,.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
    const bars = 4;
    for (let i = 0; i < bars; i++) {
      const bh = 4 + Math.abs(Math.sin(t * 2.4 + a.phase + i * 1.9)) * 16;
      ctx.fillStyle = a.state === "run" ? "rgba(255,194,75,.85)" : "rgba(77,168,255,.65)";
      ctx.fillRect(mx + 5 + i * 10, my + 24 - bh, 6, bh);
    }
    ctx.fillStyle = "#1B3044";
    ctx.fillRect(mx + 6, my + 30, 34, 3);

    const walk = Math.sin(t * 0.8 + a.phase) * 10;
    const bob = a.state === "run" ? Math.abs(Math.sin(t * 7 + a.phase)) * 2.2 : Math.abs(Math.sin(t * 1.4 + a.phase)) * 1.2;
    const ax = R.x + R.w - 58 + walk;
    const ay = R.y + R.h - 20;

    ctx.beginPath();
    ctx.ellipse(ax, ay + 2, 13, 3.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,.38)";
    ctx.fill();

    ctx.strokeStyle = "#22384C";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ax - 3, ay - 13);
    ctx.lineTo(ax - 3, ay - 2);
    ctx.moveTo(ax + 3, ay - 13);
    ctx.lineTo(ax + 3, ay - 2);
    ctx.stroke();

    roundRect(ax - 8, ay - 32 - bob, 16, 20, 6);
    ctx.fillStyle = a.color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = a.color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const swing = a.state === "run" ? Math.sin(t * 8 + a.phase) * 5 : Math.sin(t * 1.2 + a.phase) * 1.5;
    ctx.moveTo(ax - 7, ay - 28 - bob);
    ctx.lineTo(ax - 11, ay - 18 - bob + swing);
    ctx.moveTo(ax + 7, ay - 28 - bob);
    ctx.lineTo(ax + 11, ay - 18 - bob - swing);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ax, ay - 39 - bob, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#E8C39E";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ax, ay - 41 - bob, 7, Math.PI * 1.02, Math.PI * 1.98);
    ctx.fillStyle = "#2A3442";
    ctx.fill();
    ctx.fillStyle = "#22303E";
    ctx.beginPath();
    ctx.arc(ax - 2.4, ay - 38 - bob, 0.9, 0, Math.PI * 2);
    ctx.arc(ax + 2.4, ay - 38 - bob, 0.9, 0, Math.PI * 2);
    ctx.fill();

    text(a.runs + " urinish", R.x + 10, R.y + R.h - 8, 8.5, C.dim, 400);

    if (a.vote) {
      text(a.vote === "yes" ? "✓" : "✕", R.x + R.w - 36, R.y + R.h - 52, 14, a.vote === "yes" ? C.green : C.red, 700, "center");
    }
  }

  function drawBubble(a) {
    if (!a.bubble) return;
    const R = a.rect;
    const ax = R.x + R.w - 58;
    const ay = R.y + R.h - 20;
    const bw = Math.min(168, R.w - 16);
    const maxTextW = bw - 16;
    ctx.font = "9.5px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif";

    const all = [];
    let line = "";
    for (const w of a.bubble.text.split(" ")) {
      const next = line ? line + " " + w : w;
      if (ctx.measureText(next).width > maxTextW && line) {
        all.push(line);
        line = w;
      } else {
        line = next;
      }
    }
    if (line) all.push(line);
    const lines = all.slice(0, 2);
    if (all.length > 2) lines[1] = fit(lines[1], maxTextW - 6);

    const bh = lines.length * 12 + 12;
    const bx = clamp(ax - bw / 2, R.x + 6, R.x + R.w - bw - 6);
    const by = ay - 50 - bh;
    const alpha = a.bubble.ttl < 0.8 ? clamp(a.bubble.ttl / 0.8, 0, 1) : 1;
    const fill = a.bubble.tone === "praise" ? "rgba(12,32,28,.96)"
      : a.bubble.tone === "excite" ? "rgba(38,28,10,.97)"
      : a.bubble.tone === "think" ? "rgba(10,26,44,.97)"
      : "#0E1E2E";

    ctx.globalAlpha = alpha;
    roundRect(bx, by, bw, bh, 8);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = a.color;
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 1;
    ctx.stroke();

    const tx = clamp(ax, bx + 12, bx + bw - 12);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(tx - 4, by + bh);
    ctx.lineTo(tx, by + bh + 6);
    ctx.lineTo(tx + 4, by + bh);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    lines.forEach((l, i) => text(l, bx + 8, by + 15 + i * 12, 9.5, "#DCEBF7", 400));
    ctx.globalAlpha = 1;
  }

  function wrap2(str, maxW) {
    ctx.font = "11px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif";
    const words = str.split(" ");
    const lines = [""];
    for (const w of words) {
      if (lines.length === 1) {
        const cand = lines[0] ? lines[0] + " " + w : w;
        if (ctx.measureText(cand).width <= maxW) lines[0] = cand;
        else lines.push(w);
      } else {
        lines[1] += " " + w;
      }
    }
    if (lines[1] && ctx.measureText(lines[1]).width > maxW) lines[1] = fit(lines[1], maxW - 2);
    return lines;
  }

  function drawBossAvatar(cx, feet, t) {
    const bob = Math.sin(t * 1.6) * 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, feet + 2, 17, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fill();

    ctx.strokeStyle = "#1E4C5E";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 5, feet - 12);
    ctx.lineTo(cx - 5, feet - 2);
    ctx.moveTo(cx + 5, feet - 12);
    ctx.lineTo(cx + 5, feet - 2);
    ctx.stroke();

    roundRect(cx - 13, feet - 34 - bob, 26, 25, 7);
    ctx.fillStyle = "#123B4C";
    ctx.fill();
    ctx.strokeStyle = "#3FCBE8";
    ctx.lineWidth = 1;
    ctx.stroke();
    roundRect(cx - 7, feet - 29 - bob, 14, 8, 2);
    ctx.fillStyle = "rgba(95,225,255,.4)";
    ctx.fill();

    ctx.strokeStyle = "#2C93AC";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 13, feet - 27 - bob);
    ctx.lineTo(cx - 18, feet - 17 - bob + Math.sin(t * 2.2) * 1.5);
    ctx.moveTo(cx + 13, feet - 27 - bob);
    ctx.lineTo(cx + 18, feet - 17 - bob - Math.sin(t * 2.2) * 1.5);
    ctx.stroke();

    roundRect(cx - 10, feet - 51 - bob, 20, 16, 5);
    ctx.fillStyle = "#E6F7FC";
    ctx.fill();
    const blink = Math.sin(t * 2.3) > 0.96 ? 1 : 3;
    ctx.fillStyle = "#0A3A4A";
    ctx.fillRect(cx - 5, feet - 45 - bob, 3, blink);
    ctx.fillRect(cx + 2, feet - 45 - bob, 3, blink);

    ctx.strokeStyle = "#5FE1FF";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, feet - 51 - bob);
    ctx.lineTo(cx, feet - 59 - bob);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, feet - 61 - bob, 2.4 + Math.sin(t * 4) * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "#5FE1FF";
    ctx.fill();
  }

  function drawBossStrip(t) {
    const x = 26, y = 106, w = 1228, h = 94;
    roundRect(x, y, w, h, 12);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "rgba(9,36,50,.96)");
    g.addColorStop(1, "rgba(7,20,31,.96)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(95,225,255,.28)";
    ctx.lineWidth = 1;
    ctx.stroke();

    drawBossAvatar(x + 38, y + h - 12, t);

    text(BOSS.name, x + 70, y + 24, 12.5, "#8FEAFF", 700);
    text(BOSS.roleLabel + " · " + PHASES[cycle.phase].label, x + 70, y + 38, 9.5, C.muted, 400);

    const lines = wrap2(cycle.order, w - 330);
    text(lines[0] || "", x + 70, y + 56, 11, "#D8F3FF", 400);
    if (lines[1]) text(lines[1], x + 70, y + 70, 11, "#D8F3FF", 400);

    const barW = w - 350;
    roundRect(x + 70, y + 79, barW, 5, 3);
    ctx.fillStyle = "#0F2A3A";
    ctx.fill();
    const pct = Math.min(1, cycle.t / PHASES[cycle.phase].dur);
    if (pct > 0.005) {
      roundRect(x + 70, y + 79, Math.max(3, barW * pct), 5, 3);
      ctx.fillStyle = "rgba(95,225,255,.75)";
      ctx.fill();
    }

    text(PHASES[cycle.phase].label.toUpperCase(), x + w - 24, y + 26, 9.5, "#8FEAFF", 600, "right");
    text(ver(), x + w - 24, y + 54, 17, C.text, 700, "right");

    let note = cycle.changelog.length + " ta o‘zgarish";
    if ((cycle.phase === "vote" || cycle.phase === "apply") && cycle.votes[0]) {
      const v = cycle.votes[0];
      note = "Ovoz: " + v.yes + " ha / " + v.no + " yo‘q";
    }
    text(note, x + w - 24, y + 72, 9.5, C.muted, 400, "right");
    text("boshqaruv", x + w - 24, y + 84, 8.5, C.dim, 400, "right");
  }

  function draw(t) {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, DESIGN.w, DESIGN.h);

    const g = ctx.createLinearGradient(0, 0, 0, DESIGN.h);
    g.addColorStop(0, "#081422");
    g.addColorStop(1, "#050B14");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, DESIGN.w, DESIGN.h);

    roundRect(12, 50, 1256, 716, 18);
    ctx.fillStyle = "rgba(8,19,31,.85)";
    ctx.fill();
    ctx.strokeStyle = "#16283A";
    ctx.lineWidth = 1;
    ctx.stroke();

    roundRect(24, 58, 1232, 42, 10);
    ctx.fillStyle = "rgba(12,25,38,.9)";
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.stroke();

    text("AGENT BINO", 40, 86, 15, C.text, 700);
    text("20 ta agent + Qoder · VirtualLab UZ ni tahlil qilmoqda", 152, 86, 10.5, C.muted, 400);
    text("Sessiya " + simClock(), 1230, 86, 10.5, C.dim, 400, "right");

    drawBossStrip(t);

    for (let r = 0; r < GRID.rows; r++) {
      const cy = GRID.y + r * (CELL_H + GRID.gap) + CELL_H / 2;
      ctx.save();
      ctx.translate(40, cy);
      ctx.rotate(-Math.PI / 2);
      text((r + 1) + "-QAVAT", 0, 0, 9, C.dim, 600, "center");
      ctx.restore();
    }

    for (const a of agents) drawRoom(a, t);
    for (const a of agents) drawBubble(a);

    if (!playing) {
      ctx.fillStyle = "rgba(5,11,20,.35)";
      ctx.fillRect(12, 50, 1256, 716);
      text("PAUZA", DESIGN.w / 2, 60, 12, C.amber, 700, "center");
    }
  }

  /* ---------------- loop & events ---------------- */

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.08, (now - last) / 1000);
    last = now;
    if (playing) tick(dt * speed);
    draw(now / 1000);
    requestAnimationFrame(frame);
  }

  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * DESIGN.w;
    const y = (e.clientY - r.top) / r.width * DESIGN.w;
    const hit = agents.find(a => x >= a.rect.x && x <= a.rect.x + a.rect.w && y >= a.rect.y && y <= a.rect.y + a.rect.h);
    select(hit ? hit.id : null);
  });

  canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * DESIGN.w;
    const y = (e.clientY - r.top) / r.width * DESIGN.w;
    canvas.style.cursor = agents.some(a => x >= a.rect.x && x <= a.rect.x + a.rect.w && y >= a.rect.y && y <= a.rect.y + a.rect.h) ? "pointer" : "default";
  });

  byId("pause").addEventListener("click", e => {
    playing = !playing;
    e.currentTarget.textContent = playing ? "Pauza" : "Davom ettirish";
  });

  function updateStopBtn() {
    const btn = byId("stop-vote");
    if (!btn) return;
    const active = cycle.stopMode && (cycle.phase === "vote" || cycle.phase === "apply");
    btn.classList.toggle("active", active);
    btn.textContent = active
      ? (cycle.phase === "vote" ? "To‘xtatildi · ovoz" : "To‘xtatildi · push")
      : "Stop · ovozga";
  }

  function stopAndVote() {
    if (cycle.phase !== "analyze" && cycle.phase !== "command") return false;
    if (!playing) { playing = true; byId("pause").textContent = "Pauza"; }
    for (const a of agents) { a.state = "rest"; a.bubble = null; }
    buildProposals(4);
    cycle.stopMode = true;
    setPhase("vote");
    updateStopBtn();
    bossSay("Stop bosildi: tahlil to‘xtadi, " + cycle.proposals.length + " ta xulosa ovozga qo‘yildi.", "warn");
    return true;
  }

  byId("stop-vote").addEventListener("click", stopAndVote);

  document.querySelectorAll(".speed").forEach(btn => {
    btn.addEventListener("click", () => {
      speed = +btn.dataset.speed;
      document.querySelectorAll(".speed").forEach(b => b.classList.toggle("active", b === btn));
    });
  });

  byId("clear").addEventListener("click", () => {
    feed = [];
    for (const a of agents) { a.notes = []; a.bubble = null; a.runs = 0; }
    dirty = true;
    flushUI();
  });

  if (typeof ResizeObserver === "function") new ResizeObserver(resize).observe(canvas);
  resize();
  window.addEventListener("resize", resize);
  cycle.order = orderText(0);
  bossSay(cycle.order);
  renderStats();
  renderBoss();
  renderFeed();
  renderSummary();
  requestAnimationFrame(frame);

  window.AgentSim = {
    agents,
    cycle,
    setPhase,
    tick,
    draw,
    stopAndVote,
    simulate(sec) {
      const step = 0.25;
      for (let i = 0; i < sec / step; i++) tick(step);
      flushUI();
      draw(performance.now() / 1000);
      return { feed: feed.length, runs: agents.reduce((s, a) => s + a.runs, 0) };
    },
    summary: summaryData
  };
})();
