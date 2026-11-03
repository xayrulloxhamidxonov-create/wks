import * as THREE from "./vendor/three.module.min.js";

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

let stage, overlay, canvas, switchBar;
let surfaceTex = null;
let renderer = null, scene = null, camera = null, clock = null;
let pivot = null, root = null, shadowMesh = null;
let extras = null;
let active = false, mode = "3d", webglOk = false, ready = false;
let materialMode = "realistic";
let organKey = null, def = null;
let accent = new THREE.Color("#ff7a9c");
let yaw = 0.5, pitch = -0.12, auto = true, lastInput = 0, drag = null;
let camDist = 6, camDistGoal = 6, minDist = 3, maxDist = 12;
let resizeObserver = null;
let rndState = 7;

function rnd() {
  rndState = (rndState * 1664525 + 1013904223) % 4294967296;
  return rndState / 4294967296;
}

function hexToColor(hex) {
  return new THREE.Color(hex);
}

function alphaCss(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function addMesh(parent, geo, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function glassTissueMaterial(color, opts) {
  opts = opts || {};
  const c = new THREE.Color(color);
  const tint = c.clone().lerp(new THREE.Color(0xffffff), 0.4);
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: opts.roughness == null ? 0.08 : Math.min(opts.roughness, 0.16),
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
    ior: 1.45,
    envMapIntensity: 2.1,
    specularIntensity: 1.2,
    sheen: 0.55,
    sheenColor: tint,
    sheenRoughness: 0.45,
    iridescence: 0.42,
    iridescenceIOR: 1.32,
    emissive: new THREE.Color(opts.emissive == null ? 0x000000 : opts.emissive),
    emissiveIntensity: (opts.emissiveIntensity == null ? 0 : opts.emissiveIntensity) * 0.5,
    side: THREE.FrontSide
  });
}

function tissueMaterial(color, opts) {
  if (materialMode === "glass") return glassTissueMaterial(color, opts);
  opts = opts || {};
  const c = new THREE.Color(color);
  const sheen = c.clone().lerp(new THREE.Color(0xffffff), 0.42);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    metalness: 0,
    roughness: opts.roughness == null ? 0.42 : opts.roughness,
    clearcoat: opts.clearcoat == null ? 0.72 : opts.clearcoat,
    clearcoatRoughness: opts.clearcoatRoughness == null ? 0.22 : opts.clearcoatRoughness,
    sheen: opts.sheen == null ? 0.38 : opts.sheen,
    sheenColor: sheen,
    sheenRoughness: 0.9,
    specularIntensity: opts.specular == null ? 1.0 : opts.specular,
    bumpMap: surfaceTex,
    bumpScale: opts.bump == null ? 0.008 : opts.bump,
    envMapIntensity: opts.env == null ? 0.85 : opts.env,
    emissive: new THREE.Color(opts.emissive == null ? 0x000000 : opts.emissive),
    emissiveIntensity: opts.emissiveIntensity == null ? 0 : opts.emissiveIntensity,
    side: THREE.FrontSide
  });
}

function detailMaterial(color, opts) {
  opts = opts || {};
  return new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0,
    roughness: opts.roughness == null ? 0.5 : opts.roughness,
    emissive: opts.emissive == null ? 0x000000 : opts.emissive,
    emissiveIntensity: opts.emissiveIntensity == null ? 0 : opts.emissiveIntensity
  });
}

function glowMaterial(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color: color,
    transparent: opacity != null,
    opacity: opacity == null ? 1 : opacity,
    toneMapped: false
  });
}

function sphereGeo(rx, ry, rz, seg) {
  seg = seg || 48;
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.66));
  geo.scale(rx, ry, rz);
  return geo;
}

function pearGeo(w, h, d) {
  const geo = new THREE.SphereGeometry(1, 40, 32);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = clamp((y + 1) / 2, 0, 1);
    const taper = 0.55 + 0.45 * Math.pow(1 - t, 0.7);
    p.setXYZ(i, p.getX(i) * taper * w, y * h, p.getZ(i) * taper * d);
  }
  geo.computeVertexNormals();
  return geo;
}

function ventricleGeo(w, h, d, leanX) {
  const geo = new THREE.SphereGeometry(1, 72, 56);
  const p = geo.attributes.position;
  const lean = leanX == null ? 0.27 : leanX;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = clamp((y + 1) / 2, 0, 1);
    const taper = 0.16 + 0.84 * Math.pow(t, 0.5);
    const bend = lean * Math.pow(1 - t, 1.5);
    p.setXYZ(i, p.getX(i) * taper * w + bend, y * h, p.getZ(i) * taper * d);
  }
  geo.computeVertexNormals();
  return geo;
}

function lungGeo(w, h, d, side) {
  const geo = new THREE.SphereGeometry(1, 96, 72);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const t = clamp((y + 1) / 2, 0, 1);
    const taper = 0.30 + 0.70 * Math.pow(1 - t, 0.5);
    x *= w * taper;
    y *= h;
    z *= d * (0.82 + 0.18 * Math.pow(1 - t, 0.6));
    const medial = side < 0 ? x : -x;
    if (medial > 0) {
      const flat = Math.pow(medial / (w * taper), 1.7);
      x -= side * w * 0.32 * flat * (0.5 + 0.5 * (1 - t));
    }
    const notch = Math.exp(-Math.pow((y + 0.22 * h) / (0.4 * h), 2))
      * Math.exp(-Math.pow((z - 0.24 * d) / (0.66 * d), 2));
    if (medial > 0) x -= side * 0.16 * notch;
    if (y < 0) {
      const q = -y / h;
      y += h * 0.11 * Math.pow(q, 1.6) * (1 - Math.abs(z / (d * 1.15)));
    }
    z *= 0.96 + 0.05 * Math.cos(y * 2.8);
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function brainGyriGeo(seg) {
  seg = seg || 128;
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.76));
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const w1 = Math.sin(v.x * 6.4 + 1.9 * Math.sin(v.y * 3.7) + v.z * 3.2);
    const w2 = Math.sin(v.y * 7.6 + 1.5 * Math.sin(v.z * 4.3) - v.x * 2.7);
    const w3 = Math.sin(v.z * 8.4 + 1.4 * Math.sin(v.x * 5.1) + v.y * 2.4);
    const fine = Math.sin((v.x + v.y - v.z) * 17.5) * 0.4 + Math.sin(v.x * 23 + v.z * 19) * 0.3;
    const n = 1 + 0.034 * w1 + 0.027 * w2 + 0.022 * w3 + 0.007 * fine;
    p.setXYZ(i, v.x * n, v.y * n, v.z * n);
  }
  geo.computeVertexNormals();
  return geo;
}

function foliaGeo() {
  const geo = new THREE.SphereGeometry(1, 96, 72);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n = 1
      + 0.032 * Math.sin(v.y * 34 + 1.6 * Math.sin(v.x * 3.4))
      + 0.014 * Math.sin(v.x * 27 + v.z * 21)
      + 0.01 * Math.cos(v.z * 31 - v.y * 9);
    p.setXYZ(i, v.x * n, v.y * n, v.z * n);
  }
  geo.computeVertexNormals();
  return geo;
}

function liverRightGeo(w, h, d) {
  const geo = new THREE.SphereGeometry(1, 96, 72);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    y *= 0.6 + 0.4 * clamp((1 - x) / 2, 0, 1);
    if (y < -0.42) y = -0.42 + (y + 0.42) * 0.4;
    if (z < -0.4) z = -0.4 + (z + 0.4) * 0.6;
    x *= 1 + 0.08 * Math.max(0, -x);
    p.setXYZ(i, x * w, y * h, z * d);
  }
  geo.computeVertexNormals();
  return geo;
}

function liverLeftGeo(w, h, d) {
  const geo = new THREE.SphereGeometry(1, 80, 60);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    y *= 0.45 + 0.55 * clamp((x + 1) / 2, 0, 1);
    if (y < -0.35) y = -0.35 + (y + 0.35) * 0.35;
    x *= 1 + 0.14 * Math.max(0, x);
    p.setXYZ(i, x * w, y * h, z * d * 0.95);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeSurfaceTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const img = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const n = 0.5
        + 0.2 * Math.sin(x * 0.19 + y * 0.11)
        + 0.14 * Math.sin(x * 0.53 - y * 0.37)
        + 0.1 * Math.cos(x * 0.91 + y * 0.73)
        + 0.05 * Math.sin(x * 2.17 + y * 1.61);
      const v = clamp(n, 0, 1) * 255;
      const i = (y * 256 + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

function curve(points) {
  return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
}

function addTube(parent, path, radius, mat, segs, radial) {
  const geo = new THREE.TubeGeometry(path, segs || 72, radius, radial || 14, false);
  return addMesh(parent, geo, mat);
}

function addVessel(parent, points, radius, mat, segs) {
  const path = curve(points);
  addTube(parent, path, radius, mat, segs || 64, 14);
  const capGeo = new THREE.SphereGeometry(radius, 14, 10);
  const a = path.getPointAt(0);
  const b = path.getPointAt(1);
  addMesh(parent, capGeo, mat, a.x, a.y, a.z);
  addMesh(parent, capGeo, mat, b.x, b.y, b.z);
  return path;
}

function disposeTree(obj) {
  const geos = new Set();
  const mats = new Set();
  obj.traverse(o => {
    if (o.geometry) geos.add(o.geometry);
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => mats.add(m));
      else mats.add(o.material);
    }
  });
  geos.forEach(g => g.dispose());
  mats.forEach(m => {
    if (m.map) m.map.dispose();
    m.dispose();
  });
}

function buildEnvironment() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, "#f2f4f6");
  grd.addColorStop(0.46, "#9aa6b2");
  grd.addColorStop(0.58, "#414b56");
  grd.addColorStop(1, "#0b0f14");
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 512);

  g.filter = "blur(38px)";
  g.fillStyle = "rgba(255,255,255,1)";
  g.fillRect(120, 26, 250, 110);
  g.fillStyle = "rgba(226,236,246,.95)";
  g.fillRect(620, 54, 290, 96);
  g.fillStyle = "rgba(255,244,232,.75)";
  g.fillRect(418, 6, 150, 70);
  g.fillStyle = "rgba(190,206,220,.5)";
  g.fillRect(40, 240, 200, 80);
  g.filter = "none";

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromEquirectangular(tex);
  scene.environment = rt.texture;
  tex.dispose();
  pmrem.dispose();
}

function initGL() {
  if (ready) return true;
  canvas = $("anatomy-3d-canvas");
  if (!canvas) return false;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    webglOk = false;
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 120);
  camera.position.set(0, 0, 6);
  clock = new THREE.Clock();

  surfaceTex = makeSurfaceTexture();
  buildEnvironment();

  scene.add(new THREE.HemisphereLight(0xf7fbff, 0x2a2422, 0.85));
  const key = new THREE.DirectionalLight(0xfff2e6, 2.45);
  key.position.set(4, 6, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc6d8e8, 0.95);
  fill.position.set(-5, 2, 4);
  scene.add(fill);
  const back = new THREE.DirectionalLight(0xffffff, 1.25);
  back.position.set(-1, 4, -6);
  scene.add(back);
  const front = new THREE.PointLight(0xffd9c4, 11, 18, 2);
  front.position.set(0, 0.4, 3.4);
  scene.add(front);

  webglOk = true;
  ready = true;
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();
  requestAnimationFrame(tick);
  return true;
}

function resize() {
  if (!renderer || !stage) return;
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function resetScene() {
  if (pivot) {
    scene.remove(pivot);
    disposeTree(pivot);
    pivot = null;
  }
  if (shadowMesh) {
    scene.remove(shadowMesh);
    disposeTree(shadowMesh);
    shadowMesh = null;
  }
  root = null;
  extras = null;
}

function finalize(body, update, opts) {
  opts = opts || {};
  resetScene();
  root = new THREE.Group();
  root.add(body);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);

  pivot = new THREE.Group();
  pivot.rotation.order = "YXZ";
  pivot.add(root);
  scene.add(pivot);

  const maxDim = Math.max(size.x, size.y, size.z) || 2;
  camDistGoal = maxDim * 1.76 + 0.42;
  camDist = camDistGoal * 1.28;
  minDist = maxDim * 1.02;
  maxDist = maxDim * 2.9;

  makeShadow(size);

  yaw = opts.yaw == null ? 0.42 : opts.yaw;
  pitch = opts.pitch == null ? -0.12 : opts.pitch;
  extras = { update: update, size: size };
  lastInput = performance.now();
  resize();
}

function makeShadow(size) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 122);
  grd.addColorStop(0, "rgba(0,0,0,.5)");
  grd.addColorStop(0.55, "rgba(0,0,0,.22)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const geo = new THREE.PlaneGeometry(size.x * 1.9, size.z * 1.9);
  shadowMesh = new THREE.Mesh(geo, mat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -size.y / 2 - 0.03;
  shadowMesh.renderOrder = -1;
  scene.add(shadowMesh);
}

function tick() {
  requestAnimationFrame(tick);
  if (!ready || !active || mode !== "3d" || !pivot || !extras) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  if (auto && !drag && performance.now() - lastInput > 2400) yaw += dt * 0.13;
  pivot.rotation.y = yaw;
  pivot.rotation.x = pitch;
  camDist += (camDistGoal - camDist) * Math.min(1, dt * 5.5);
  camera.position.set(0, 0, camDist);
  camera.lookAt(0, 0, 0);
  if (extras.update) extras.update(t, dt, def ? def.state : {});
  renderer.render(scene, camera);
}

/* ------------------------------------------------------------------ */
/*  Heart                                                              */
/* ------------------------------------------------------------------ */

function buildHeart() {
  const body = new THREE.Group();
  const heartG = new THREE.Group();
  const lungsG = new THREE.Group();
  heartG.position.set(0, 0, 0.05);
  heartG.scale.setScalar(1.08);
  lungsG.position.set(0, 0, -0.08);
  body.add(heartG, lungsG);

  const myo = tissueMaterial(0x9b2e35, {
    roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2,
    bump: 0.016, sheen: 0.4, env: 1.0, emissive: 0x4a0b10, emissiveIntensity: 0.028
  });
  const myoDark = tissueMaterial(0x862830, {
    roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.24, bump: 0.016, env: 0.9,
    emissive: 0x3a080d, emissiveIntensity: 0.022
  });
  const aortaMat = tissueMaterial(0xac4147, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, env: 1.05, bump: 0.008 });
  const pulmArtMat = tissueMaterial(0x6276a6, { roughness: 0.32, clearcoat: 0.78, clearcoatRoughness: 0.16, env: 1.05, bump: 0.008 });
  const veinMat = tissueMaterial(0x566790, { roughness: 0.34, clearcoat: 0.76, clearcoatRoughness: 0.17, env: 1.0, bump: 0.008 });
  const pulmVeinMat = tissueMaterial(0x9c414c, { roughness: 0.32, clearcoat: 0.78, clearcoatRoughness: 0.16, env: 1.05, bump: 0.008 });
  const grooveMat = detailMaterial(0x6d2028, { roughness: 0.66 });
  const coronaryMat = detailMaterial(0xb85b54, { roughness: 0.46, emissive: 0x330a0c, emissiveIntensity: 0.16 });

  const lv = addMesh(heartG, ventricleGeo(0.6, 0.84, 0.52, 0.3), myo, 0.11, -0.06, 0.0);
  lv.rotation.z = 0.05;
  const rv = addMesh(heartG, ventricleGeo(0.4, 0.6, 0.38, 0.16), myo, -0.27, -0.02, 0.17);
  rv.rotation.z = -0.1;

  const ra = addMesh(heartG, sphereGeo(0.3, 0.26, 0.29), myoDark, -0.4, 0.5, 0.03);
  ra.rotation.z = -0.1;
  const la = addMesh(heartG, sphereGeo(0.29, 0.25, 0.28), myoDark, 0.34, 0.56, -0.13);
  la.rotation.z = 0.12;

  const aurR = addMesh(heartG, sphereGeo(0.2, 0.13, 0.12), myo, -0.56, 0.4, 0.2);
  aurR.rotation.z = -0.5;
  const aurL = addMesh(heartG, sphereGeo(0.17, 0.12, 0.1), myo, 0.55, 0.42, 0.1);
  aurL.rotation.z = 0.55;

  addMesh(heartG, sphereGeo(0.15, 0.16, 0.15), aortaMat, 0.16, 0.34, 0.03);

  addVessel(heartG, [
    [0.17, 0.34, 0.02],
    [0.15, 0.7, 0.0],
    [0.22, 0.98, -0.03],
    [0.42, 1.08, -0.07],
    [0.52, 0.98, -0.14],
    [0.47, 0.66, -0.23],
    [0.37, 0.12, -0.32],
    [0.32, -0.4, -0.36],
    [0.29, -0.78, -0.38]
  ], 0.112, aortaMat, 96);

  addVessel(heartG, [[0.3, 1.05, -0.04], [0.28, 1.32, -0.02], [0.3, 1.55, 0]], 0.046, aortaMat, 28);
  addVessel(heartG, [[0.42, 1.06, -0.06], [0.4, 1.32, -0.05], [0.42, 1.5, -0.04]], 0.042, aortaMat, 28);
  addVessel(heartG, [[0.5, 1.0, -0.1], [0.56, 1.24, -0.08], [0.62, 1.38, -0.06]], 0.04, aortaMat, 28);

  addVessel(heartG, [
    [-0.2, 0.3, 0.22],
    [-0.19, 0.52, 0.28],
    [-0.15, 0.74, 0.25],
    [-0.08, 0.9, 0.12]
  ], 0.102, pulmArtMat, 56);
  addVessel(heartG, [
    [-0.08, 0.9, 0.12],
    [0.18, 0.98, -0.08],
    [0.5, 0.9, -0.18],
    [0.66, 0.68, -0.22]
  ], 0.066, pulmArtMat, 48);
  addVessel(heartG, [
    [-0.08, 0.9, 0.12],
    [-0.3, 0.92, -0.06],
    [-0.55, 0.82, -0.16],
    [-0.66, 0.62, -0.22]
  ], 0.066, pulmArtMat, 48);

  addVessel(heartG, [[-0.52, 1.36, -0.14], [-0.46, 1.02, -0.08], [-0.41, 0.72, -0.02], [-0.38, 0.55, 0.02]], 0.072, veinMat, 36);
  addVessel(heartG, [[-0.24, -0.72, -0.2], [-0.29, -0.48, -0.14], [-0.34, -0.22, -0.06], [-0.37, 0.04, 0.0]], 0.086, veinMat, 40);

  const pv = [
    [[0.1, 0.62, -0.28], [0.35, 0.72, -0.36], [0.62, 0.72, -0.4]],
    [[0.08, 0.54, -0.28], [0.32, 0.5, -0.38], [0.58, 0.48, -0.42]],
    [[-0.12, 0.64, -0.26], [-0.4, 0.74, -0.36], [-0.68, 0.7, -0.4]],
    [[-0.14, 0.55, -0.26], [-0.42, 0.5, -0.36], [-0.66, 0.46, -0.4]]
  ];
  pv.forEach(points => addVessel(heartG, points, 0.045, pulmVeinMat, 32));

  const ladPath = [
    [0.02, 0.48, 0.44],
    [0.06, 0.15, 0.5],
    [0.12, -0.2, 0.45],
    [0.2, -0.5, 0.33],
    [0.27, -0.72, 0.2]
  ];
  addTube(heartG, curve(ladPath), 0.021, grooveMat, 56, 8);
  addTube(heartG, curve(ladPath.map(p => [p[0] + 0.012, p[1], p[2] + 0.006])), 0.011, coronaryMat, 56, 8);
  addTube(heartG, curve([[0.06, 0.1, 0.5], [0.22, 0.02, 0.46], [0.34, -0.08, 0.4]]), 0.007, coronaryMat, 32, 6);
  addTube(heartG, curve([[0.1, -0.25, 0.42], [0.25, -0.33, 0.37], [0.36, -0.42, 0.3]]), 0.006, coronaryMat, 32, 6);

  addTube(heartG, curve([
    [-0.2, 0.44, 0.34],
    [-0.4, 0.3, 0.36],
    [-0.52, 0.05, 0.33],
    [-0.46, -0.22, 0.32],
    [-0.32, -0.42, 0.28]
  ]), 0.011, coronaryMat, 48, 8);
  addTube(heartG, curve([
    [0.36, 0.4, 0.24],
    [0.55, 0.3, 0.16],
    [0.6, 0.08, 0.12],
    [0.52, -0.12, 0.16]
  ]), 0.01, coronaryMat, 40, 8);

  const lungMat = tissueMaterial(0xd9a0a4, {
    roughness: 0.56, clearcoat: 0.34, clearcoatRoughness: 0.4,
    sheen: 0.55, bump: 0.008, env: 0.8, emissive: 0x3a0f12, emissiveIntensity: 0.015
  });
  const lungMat2 = tissueMaterial(0xd2989d, {
    roughness: 0.58, clearcoat: 0.32, clearcoatRoughness: 0.42,
    sheen: 0.52, bump: 0.008, env: 0.8, emissive: 0x3a0f12, emissiveIntensity: 0.015
  });
  const fissureMat = detailMaterial(0xa76a70, { roughness: 0.72 });
  const tracheaMat = tissueMaterial(0xd6b3a6, { roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.24, bump: 0.006 });
  const ringMat = detailMaterial(0xc9a496, { roughness: 0.6 });

  const rightLung = addMesh(lungsG, lungGeo(0.54, 0.68, 0.42, -1), lungMat, -0.86, 0.2, -0.18);
  rightLung.rotation.z = -0.06;
  rightLung.rotation.y = -0.1;

  const leftLung = addMesh(lungsG, lungGeo(0.45, 0.62, 0.4, 1), lungMat2, 0.87, 0.22, -0.19);
  leftLung.rotation.z = 0.06;
  leftLung.rotation.y = 0.1;

  addTube(lungsG, curve([
    [-1.3, 0.62, 0.02],
    [-1.24, 0.28, 0.18],
    [-1.12, -0.15, 0.22],
    [-0.94, -0.42, 0.16]
  ]), 0.011, fissureMat, 48, 6);
  addTube(lungsG, curve([
    [-1.26, 0.36, 0.1],
    [-1.1, 0.3, 0.2],
    [-0.9, 0.26, 0.2]
  ]), 0.009, fissureMat, 40, 6);
  addTube(lungsG, curve([
    [1.24, 0.64, 0.0],
    [1.18, 0.26, 0.17],
    [1.05, -0.18, 0.2],
    [0.88, -0.42, 0.14]
  ]), 0.011, fissureMat, 48, 6);

  const trachea = curve([
    [0, 1.86, 0.0],
    [0, 1.6, 0.0],
    [0, 1.3, 0.0],
    [0, 1.02, 0.0]
  ]);
  addTube(lungsG, trachea, 0.07, tracheaMat, 44, 14);
  addMesh(lungsG, sphereGeo(0.085, 0.075, 0.085), tracheaMat, 0, 1.0, 0);

  const ringGeo = new THREE.TorusGeometry(0.078, 0.011, 8, 26);
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < 8; i++) {
    const t = 0.06 + i * 0.115;
    const p = trachea.getPointAt(t);
    const tangent = trachea.getTangentAt(t).normalize();
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(p);
    ring.quaternion.setFromUnitVectors(zAxis, tangent);
    lungsG.add(ring);
  }

  addVessel(lungsG, [[0, 1.0, 0], [-0.22, 0.92, -0.02], [-0.38, 0.72, -0.06], [-0.5, 0.56, -0.1]], 0.056, tracheaMat, 36);
  addVessel(lungsG, [[0, 1.0, 0], [0.22, 0.92, -0.02], [0.38, 0.72, -0.06], [0.48, 0.58, -0.1]], 0.052, tracheaMat, 36);

  function update(t, dt, state) {
    const hr = state.hr || 70;
    const phase = (t * hr / 60) % 1;
    const b1 = Math.exp(-Math.pow((phase - 0.15) / 0.055, 2));
    const b2 = 0.42 * Math.exp(-Math.pow((phase - 0.42) / 0.08, 2));
    const beat = b1 + b2;
    heartG.scale.setScalar(1 + 0.019 * beat);
    const breath = Math.sin(t * 1.15);
    lungsG.scale.set(1 + 0.008 * breath, 1 + 0.012 * breath, 1 + 0.006 * breath);
    myo.emissiveIntensity = 0.03 + 0.1 * beat;
    myoDark.emissiveIntensity = 0.02 + 0.05 * beat;
  }

  return { body: body, update: update, yaw: 0.42, pitch: -0.08 };
}

/* ------------------------------------------------------------------ */
/*  Brain                                                              */
/* ------------------------------------------------------------------ */

function buildBrain() {
  const body = new THREE.Group();
  const cortex = tissueMaterial(0xc9928c, {
    roughness: 0.44, clearcoat: 0.62, clearcoatRoughness: 0.24,
    bump: 0.018, sheen: 0.5, env: 0.95, emissive: 0x5a1717, emissiveIntensity: 0.03
  });
  const cortex2 = tissueMaterial(0xbf8781, {
    roughness: 0.46, clearcoat: 0.58, clearcoatRoughness: 0.26, bump: 0.016,
    sheen: 0.48, env: 0.9, emissive: 0x4c1313, emissiveIntensity: 0.025
  });
  const deep = tissueMaterial(0xb97f7a, {
    roughness: 0.48, clearcoat: 0.55, clearcoatRoughness: 0.28, bump: 0.014,
    sheen: 0.45, env: 0.9, emissive: 0x441010, emissiveIntensity: 0.02
  });
  const stemMat = tissueMaterial(0xd6b3a0, {
    roughness: 0.4, clearcoat: 0.62, clearcoatRoughness: 0.24, bump: 0.01,
    env: 0.95, emissive: 0x3a1a12, emissiveIntensity: 0.02
  });

  const gyri = brainGyriGeo(128);
  [-0.545, 0.545].forEach((x, i) => {
    const mesh = addMesh(body, gyri, cortex, x, 0.06, 0);
    mesh.scale.set(0.52, 0.86, 1.32);
    mesh.rotation.y = i ? -0.04 : 0.04;
    mesh.rotation.z = i ? -0.03 : 0.03;
  });

  const tempGeo = brainGyriGeo(72);
  [-0.72, 0.72].forEach((x, i) => {
    const mesh = addMesh(body, tempGeo, cortex2, x, -0.24, 0.3);
    mesh.scale.set(0.3, 0.32, 0.52);
    mesh.rotation.y = i ? -0.18 : 0.18;
    mesh.rotation.z = i ? -0.12 : 0.12;
  });

  const folia = foliaGeo();
  [-0.27, 0.27].forEach((x, i) => {
    const mesh = addMesh(body, folia, deep, x, -0.58, -0.82);
    mesh.scale.set(0.46, 0.38, 0.42);
    mesh.rotation.z = i ? -0.1 : 0.1;
  });

  addMesh(body, sphereGeo(0.17, 0.18, 0.17), stemMat, 0, -0.28, -0.42);
  const pons = addMesh(body, sphereGeo(0.23, 0.19, 0.2), stemMat, 0, -0.52, -0.46);
  pons.rotation.x = 0.12;
  addTube(body, curve([[0, -0.5, -0.46], [0, -0.82, -0.48], [0, -1.16, -0.5]]), 0.1, stemMat, 36, 14);

  [-0.22, 0.22].forEach(x => {
    const bulb = addMesh(body, sphereGeo(0.09, 0.07, 0.17), stemMat, x, -0.5, 1.16);
    bulb.rotation.x = 0.3;
    bulb.rotation.y = x < 0 ? 0.12 : -0.12;
  });

  function update(t, dt, state) {
    const a = clamp((state.a == null ? 55 : state.a) / 100, 0, 1);
    body.scale.setScalar(1 + Math.sin(t * 1.05) * 0.004);
    cortex.emissiveIntensity = 0.02 + 0.055 * a;
    cortex2.emissiveIntensity = 0.016 + 0.045 * a;
    deep.emissiveIntensity = 0.012 + 0.03 * a;
  }

  return { body: body, update: update, yaw: 0.3, pitch: -0.12 };
}

/* ------------------------------------------------------------------ */
/*  Liver                                                              */
/* ------------------------------------------------------------------ */

function buildLiver() {
  const body = new THREE.Group();
  const liverMat = tissueMaterial(0x8c4438, {
    roughness: 0.4, clearcoat: 0.68, clearcoatRoughness: 0.22,
    bump: 0.014, sheen: 0.35, env: 1.0, emissive: 0x3a0c08, emissiveIntensity: 0.02
  });
  const liverMat2 = tissueMaterial(0x823d33, {
    roughness: 0.42, clearcoat: 0.64, clearcoatRoughness: 0.24, bump: 0.014,
    sheen: 0.33, env: 0.95, emissive: 0x340a07, emissiveIntensity: 0.018
  });
  const gallMat = tissueMaterial(0x6f8f4a, { roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.18, env: 1.05, bump: 0.006, emissive: 0x1d2a10, emissiveIntensity: 0.03 });
  const portalMat = tissueMaterial(0x5b6e96, { roughness: 0.32, clearcoat: 0.75, clearcoatRoughness: 0.17, env: 1.0, bump: 0.006 });
  const artMat = tissueMaterial(0xa84a4a, { roughness: 0.32, clearcoat: 0.75, clearcoatRoughness: 0.17, env: 1.0, bump: 0.006 });
  const bileMat = tissueMaterial(0x5f8a4a, { roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.18, env: 1.0, bump: 0.006 });

  const right = addMesh(body, liverRightGeo(0.8, 0.72, 0.56), liverMat, -0.32, 0, 0);
  right.rotation.z = 0.03;
  const left = addMesh(body, liverLeftGeo(0.62, 0.42, 0.42), liverMat2, 0.72, 0.06, 0.02);
  left.rotation.z = 0.08;
  left.rotation.y = -0.1;
  addMesh(body, sphereGeo(0.26, 0.22, 0.24), liverMat2, -0.05, 0.2, -0.3);

  const gb = addMesh(body, pearGeo(0.15, 0.3, 0.15), gallMat, -0.34, -0.4, 0.26);
  gb.rotation.z = 0.12;

  addVessel(body, [[0.58, -0.68, 0.16], [0.3, -0.46, 0.2], [0.05, -0.3, 0.14], [-0.08, -0.28, 0.12]], 0.06, portalMat, 48);
  addTube(body, curve([[-0.06, -0.28, 0.12], [-0.28, -0.18, 0.06], [-0.52, -0.1, 0.02]]), 0.038, portalMat, 36, 10);
  addTube(body, curve([[-0.04, -0.28, 0.12], [0.2, -0.18, 0.08], [0.46, -0.1, 0.03]]), 0.034, portalMat, 36, 10);

  addVessel(body, [[0.42, -0.72, 0.1], [0.2, -0.5, 0.12], [0.04, -0.34, 0.1], [-0.06, -0.28, 0.1]], 0.03, artMat, 40);

  addVessel(body, [[-0.16, -0.76, 0.2], [-0.2, -0.56, 0.2], [-0.24, -0.4, 0.22], [-0.28, -0.32, 0.24]], 0.026, bileMat, 36);
  addTube(body, curve([[-0.3, -0.32, 0.24], [-0.32, -0.28, 0.25], [-0.34, -0.24, 0.26]]), 0.022, bileMat, 20, 8);

  addVessel(body, [[-0.36, 0.5, -0.28], [-0.42, 0.12, -0.32], [-0.38, -0.32, -0.24]], 0.068, portalMat, 36);
  [
    [[-0.12, 0.42, -0.2], [-0.28, 0.5, -0.3], [-0.38, 0.56, -0.34]],
    [[-0.02, 0.36, -0.22], [-0.22, 0.42, -0.32], [-0.36, 0.46, -0.36]],
    [[-0.1, 0.28, -0.24], [-0.26, 0.3, -0.34], [-0.4, 0.34, -0.38]]
  ].forEach(points => addVessel(body, points, 0.032, portalMat, 24));

  function update(t, dt, state) {
    body.scale.setScalar(1 + Math.sin(t * 0.8) * 0.003);
    liverMat.emissiveIntensity = 0.016 + 0.02 * Math.abs(Math.sin(t * 0.5));
  }

  return { body: body, update: update, yaw: 0.35, pitch: -0.1 };
}

/* ------------------------------------------------------------------ */
/*  Neuron                                                             */
/* ------------------------------------------------------------------ */

function buildNeuron() {
  const body = new THREE.Group();
  const somaMat = tissueMaterial(0xd7a45f, {
    roughness: 0.4, clearcoat: 0.62, clearcoatRoughness: 0.24,
    bump: 0.016, sheen: 0.4, env: 0.95, emissive: 0x4a2a08, emissiveIntensity: 0.04
  });
  const dendriteMat = tissueMaterial(0xcf9c58, { roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.24, bump: 0.012, env: 0.9, emissive: 0x3f2206, emissiveIntensity: 0.03 });
  const axonMat = tissueMaterial(0xe2c98f, { roughness: 0.38, clearcoat: 0.62, clearcoatRoughness: 0.22, env: 0.9, bump: 0.01 });
  const myelinMat = tissueMaterial(0xefe2c4, { roughness: 0.3, clearcoat: 0.68, clearcoatRoughness: 0.18, env: 1.0, bump: 0.006 });
  const postMat = tissueMaterial(0xc9877a, { roughness: 0.44, clearcoat: 0.58, clearcoatRoughness: 0.26, env: 0.9, bump: 0.012 });
  const receptorMat = detailMaterial(0xe9b768, { roughness: 0.4, emissive: 0x5c3406, emissiveIntensity: 0.08 });
  const boutonMat = tissueMaterial(0xcf9a55, { roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.24, env: 0.9, bump: 0.01 });
  const vesicleMat = glowMaterial(0xf2ca6a);

  const somaGeo = new THREE.IcosahedronGeometry(0.31, 3);
  const sp = somaGeo.attributes.position;
  const sv = new THREE.Vector3();
  for (let i = 0; i < sp.count; i++) {
    sv.fromBufferAttribute(sp, i);
    const n = 1 + 0.1 * Math.sin(sv.x * 12 + sv.y * 9) * Math.cos(sv.z * 11);
    sp.setXYZ(i, sv.x * n, sv.y * n, sv.z * n);
  }
  somaGeo.computeVertexNormals();
  addMesh(body, somaGeo, somaMat, -1.15, 0, 0);

  const hillock = addMesh(body, new THREE.ConeGeometry(0.14, 0.26, 18), somaMat, -0.86, 0, 0);
  hillock.rotation.z = -Math.PI / 2;

  function branch(from, dir, len, radius, depth) {
    const end = from.clone().addScaledVector(dir, len);
    const mid = from.clone().lerp(end, 0.5);
    mid.x += (rnd() - 0.5) * 0.16;
    mid.y += (rnd() - 0.5) * 0.16;
    mid.z += (rnd() - 0.5) * 0.16;
    const path = new THREE.CatmullRomCurve3([from, mid, end]);
    addTube(body, path, radius, dendriteMat, 14, 7);
    const tip = addMesh(body, new THREE.SphereGeometry(radius * 0.95, 8, 6), dendriteMat);
    tip.position.copy(end);
    if (depth > 0) {
      const axis = new THREE.Vector3(0, 0, 1);
      for (let i = 0; i < 2; i++) {
        const nd = dir.clone().applyAxisAngle(axis, (i ? 1 : -1) * (0.5 + rnd() * 0.25));
        nd.z += (rnd() - 0.5) * 0.4;
        nd.normalize();
        branch(end, nd, len * (0.58 + rnd() * 0.08), radius * 0.6, depth - 1);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const spinePos = end.clone().lerp(from, 0.12 + rnd() * 0.5);
        spinePos.x += (rnd() - 0.5) * 0.08;
        spinePos.y += (rnd() - 0.5) * 0.08;
        spinePos.z += (rnd() - 0.5) * 0.08;
        addMesh(body, new THREE.SphereGeometry(0.019 + rnd() * 0.006, 6, 5), dendriteMat, spinePos.x, spinePos.y, spinePos.z);
      }
    }
  }

  const soma = new THREE.Vector3(-1.15, 0, 0);
  const dirs = [
    new THREE.Vector3(-0.62, 0.76, 0.16),
    new THREE.Vector3(-0.88, 0.18, -0.34),
    new THREE.Vector3(-0.58, -0.72, 0.28),
    new THREE.Vector3(-0.2, 0.82, -0.35),
    new THREE.Vector3(-0.72, -0.1, 0.62)
  ];
  dirs.forEach(d => branch(soma.clone().addScaledVector(d.clone().normalize(), 0.26), d.clone().normalize(), 0.42, 0.05, 2));

  const axon = curve([
    [-0.82, 0, 0],
    [-0.3, 0.04, 0.05],
    [0.35, -0.02, -0.04],
    [0.95, 0.03, 0.04],
    [1.32, 0.01, -0.02],
    [1.55, 0, 0]
  ]);
  addTube(body, axon, 0.042, axonMat, 90, 12);

  const myelinGroup = new THREE.Group();
  const caps = 6;
  const capGeo = new THREE.CapsuleGeometry(0.105, 0.24, 6, 16);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < caps; i++) {
    const t = 0.1 + i * 0.14;
    const p = axon.getPointAt(t);
    const tangent = axon.getTangentAt(t).normalize();
    const cap = new THREE.Mesh(capGeo, myelinMat);
    cap.position.copy(p);
    cap.quaternion.setFromUnitVectors(up, tangent);
    myelinGroup.add(cap);

    if (i < caps - 1) {
      const np = axon.getPointAt(t + 0.07);
      const node = addMesh(myelinGroup, new THREE.SphereGeometry(0.047, 10, 8), axonMat);
      node.position.copy(np);
    }
  }
  body.add(myelinGroup);

  const endPoint = axon.getPointAt(1);
  const boutons = [];
  [
    [0.16, 0.14, 0.05],
    [0.2, -0.06, -0.04],
    [0.18, -0.18, 0.07]
  ].forEach(d => {
    const path = new THREE.CatmullRomCurve3([
      endPoint.clone(),
      endPoint.clone().add(new THREE.Vector3(d[0] * 0.55, d[1] * 0.55, d[2] * 0.55)),
      endPoint.clone().add(new THREE.Vector3(d[0], d[1], d[2]))
    ]);
    addTube(body, path, 0.026, axonMat, 18, 8);
    const bp = path.getPointAt(1);
    const bouton = addMesh(body, new THREE.SphereGeometry(0.062, 12, 10), boutonMat, bp.x, bp.y, bp.z);
    boutons.push(bouton);
  });

  const postDendrite = curve([
    [1.98, -0.72, 0.02],
    [1.93, -0.4, 0.08],
    [2.0, -0.1, -0.02],
    [1.94, 0.22, 0.06],
    [2.0, 0.5, 0.0],
    [1.96, 0.72, -0.04]
  ]);
  addTube(body, postDendrite, 0.062, postMat, 56, 12);
  for (let i = 0; i < 10; i++) {
    const t = 0.08 + i * 0.09;
    const p = postDendrite.getPointAt(t);
    const side = i % 2 ? 1 : -1;
    addMesh(body, new THREE.SphereGeometry(0.02, 6, 5), postMat, p.x - 0.055, p.y + side * 0.035, p.z + side * 0.045);
  }
  for (let i = 0; i < 5; i++) {
    const y = -0.24 + i * 0.12;
    addMesh(body, new THREE.SphereGeometry(0.028, 10, 8), receptorMat, 1.93, y, 0.01 + (i % 2) * 0.03);
  }

  const signal = new THREE.Mesh(new THREE.SphereGeometry(0.074, 14, 12), glowMaterial(0xfff3c4));
  const signalGlow = new THREE.PointLight(0xffcf7a, 0, 1.6, 2);
  body.add(signal, signalGlow);

  const trail = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 - i * 0.0036, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffd98a,
        transparent: true,
        opacity: 0.42 - i * 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      })
    );
    body.add(m);
    trail.push(m);
  }

  const vesicles = [];
  for (let i = 0; i < 6; i++) {
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), vesicleMat);
    body.add(v);
    vesicles.push(v);
  }

  function update(t, dt, state) {
    const fires = (state.stim == null ? 60 : state.stim) >= 30;
    const normal = state.myelin !== "shikast";
    myelinGroup.visible = normal;
    signal.visible = fires;
    trail.forEach(m => { m.visible = fires; });
    signalGlow.visible = fires;

    if (fires) {
      const dur = normal ? 1.9 : 8.6;
      const head = (t / dur) % 1;
      const p0 = axon.getPointAt(head);
      signal.position.copy(p0);
      signalGlow.position.copy(p0);
      signalGlow.intensity = 0.45 + Math.sin(t * 12) * 0.12;
      trail.forEach((m, i) => {
        let p = head - (i + 1) * 0.016;
        p = (p % 1 + 1) % 1;
        m.position.copy(axon.getPointAt(p));
      });

      const nearEnd = head > 0.9;
      const spread = nearEnd ? (head - 0.9) / 0.1 : 0;
      vesicles.forEach((v, i) => {
        v.position.set(
          1.68 + spread * (0.08 + i * 0.012),
          Math.sin(i * 2.1) * 0.16 * (0.35 + spread),
          Math.cos(i * 1.7) * 0.13 * (0.35 + spread)
        );
        v.material.opacity = 0.3 + 0.6 * spread;
      });
      receptorMat.emissiveIntensity = 0.08 + 0.5 * spread;
      boutons.forEach(b => { b.scale.setScalar(1 + 0.12 * spread); });
    } else {
      vesicles.forEach((v, i) => {
        v.position.set(1.66 + (i % 3) * 0.04, Math.sin(i * 2.1) * 0.1, Math.cos(i * 1.7) * 0.08);
        v.material.opacity = 0.3;
      });
      receptorMat.emissiveIntensity = 0.08;
      boutons.forEach(b => b.scale.setScalar(1));
    }

    somaMat.emissiveIntensity = fires ? 0.06 + 0.1 * Math.abs(Math.sin(t * 3)) : 0.04;
    body.scale.setScalar(1 + Math.sin(t * 1.4) * 0.003);
  }

  return { body: body, update: update, yaw: 0.34, pitch: -0.06 };
}

/* ------------------------------------------------------------------ */
/*  Mount and UI                                                       */
/* ------------------------------------------------------------------ */

const builders = {
  "anatomiya-yurak": buildHeart,
  "anatomiya-miya": buildBrain,
  "anatomiya-jigar": buildLiver,
  "anatomiya-neyron": buildNeuron
};

function updateUI() {
  if (!overlay) return;
  const show = active && webglOk;
  if (switchBar) switchBar.hidden = !show;
  overlay.hidden = !(show && mode === "3d");
  if (switchBar) {
    switchBar.querySelectorAll("[data-view3d]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view3d") === mode);
    });
  }
  if (stage) stage.style.setProperty("--glow", alphaCss(accent.getHexString ? "#" + accent.getHexString() : "#ff7a9c", 0.14));
  if (stage) stage.style.setProperty("--glow-solid", accent.getHexString ? "#" + accent.getHexString() : "#9ff0e7");
}

function mountOrgan(key, d) {
  if (!builders[key]) {
    deactivate();
    return;
  }
  initGL();
  if (!webglOk) {
    active = false;
    updateUI();
    return;
  }
  const same = active && organKey === key && !!root;
  active = true;
  organKey = key;
  def = d;
  accent = hexToColor(d.accent || "#ff7a9c");
  updateUI();

  if (!overlay.hidden) {
    resize();
  }
  if (same) return;

  rndState = 7;
  const built = builders[key]();
  finalize(built.body, built.update, { yaw: built.yaw, pitch: built.pitch });
  organKey = key;
  if (mode !== "3d") clock.getDelta();
}

function deactivate() {
  active = false;
  organKey = null;
  def = null;
  updateUI();
}

function setMode(next) {
  if (!webglOk && next === "3d") return;
  mode = next;
  if (next === "2d") {
    clock.getDelta();
  } else if (active) {
    resize();
  }
  updateUI();
}

function setMaterialMode(next) {
  if (next !== "realistic" && next !== "glass") return;
  if (next === materialMode) return;
  materialMode = next;
  document.querySelectorAll("[data-mat]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-mat") === next);
  });
  if (active && def) {
    rndState = 7;
    const built = builders[organKey]();
    finalize(built.body, built.update, { yaw: built.yaw, pitch: built.pitch });
    if (mode !== "3d") clock.getDelta();
  }
}

function bindUI() {
  stage = $("subject-stage");
  overlay = $("anatomy-3d");
  switchBar = $("anatomy-switch");
  if (!stage || !overlay || !switchBar) return;

  switchBar.querySelectorAll("[data-view3d]").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.getAttribute("data-view3d")));
  });

  document.querySelectorAll("[data-mat]").forEach(btn => {
    btn.addEventListener("click", () => setMaterialMode(btn.getAttribute("data-mat")));
  });

  const c = $("anatomy-3d-canvas");
  if (c) {
    c.addEventListener("pointerdown", e => {
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
      c.setPointerCapture(e.pointerId);
      lastInput = performance.now();
    });
    c.addEventListener("pointermove", e => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      yaw += dx * 0.007;
      pitch = clamp(pitch + dy * 0.006, -1.15, 1.15);
      lastInput = performance.now();
    });
    const stop = () => {
      if (!drag) return;
      drag = null;
      lastInput = performance.now();
    };
    c.addEventListener("pointerup", stop);
    c.addEventListener("pointercancel", stop);
    c.addEventListener("wheel", e => {
      e.preventDefault();
      camDistGoal = clamp(camDistGoal * (1 + Math.sign(e.deltaY) * 0.09), minDist, maxDist);
      lastInput = performance.now();
    }, { passive: false });
    c.addEventListener("dblclick", () => {
      yaw = 0.42;
      pitch = -0.12;
      camDistGoal = minDist * 1.55;
    });
  }

  window.addEventListener("subject:mount", e => {
    const detail = e.detail || {};
    if (detail.def && detail.def.subject === "anatomiya") mountOrgan(detail.key, detail.def);
    else deactivate();
  });
}

function initialSync() {
  const cat = window.SubjectCatalog;
  if (!cat) return;
  const raw = (location.hash || "").replace(/^#/, "");
  let key = null;
  if (cat.defs && cat.defs[raw]) key = raw;
  else if (cat.labs && cat.labs[raw]) key = cat.labs[raw][0];
  if (!key) return;
  const d = cat.defs[key];
  if (d && d.subject === "anatomiya") mountOrgan(key, d);
}

window.Anatomy3D = {
  covering() {
    return ready && active && mode === "3d" && !overlay.hidden;
  },
  setMode: setMode,
  setMaterial: setMaterialMode,
  rebuild() {
    if (active && def) {
      rndState = 7;
      const built = builders[organKey]();
      finalize(built.body, built.update, { yaw: built.yaw, pitch: built.pitch });
    }
  }
};

bindUI();
initialSync();
