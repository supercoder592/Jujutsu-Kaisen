// 式神與五條悟造型的預先繪製（開始時畫一次，之後每幀只貼圖）
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

// 細緻的雜訊材質（布料、皮膚用）
function grain(g, w, h, n, colors, alpha = .08, size = 1.5) {
  g.save();
  for (let k = 0; k < n; k++) {
    g.globalAlpha = alpha * Math.random();
    g.fillStyle = colors[(Math.random() * colors.length) | 0];
    g.fillRect(Math.random() * w, Math.random() * h, size, size);
  }
  g.restore();
}

// 依路徑方向畫毛／羽的短筆觸
function strokesInside(g, path, box, n, dirFn, lenRange, widthRange, colors, alpha) {
  g.save();
  g.clip(path);
  g.lineCap = "round";
  for (let k = 0; k < n; k++) {
    const x = rnd(box[0], box[2]), y = rnd(box[1], box[3]);
    const [dx, dy] = dirFn(x, y);
    const len = rnd(...lenRange);
    const bend = rnd(-.25, .25);
    g.globalAlpha = alpha * rnd(.4, 1);
    g.strokeStyle = colors[(Math.random() * colors.length) | 0];
    g.lineWidth = rnd(...widthRange);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + dx * len * .5 - dy * len * bend, y + dy * len * .5 + dx * len * bend, x + dx * len, y + dy * len);
    g.stroke();
  }
  g.restore();
}

// ================= 玉犬 =================
// 側面狼頭，原座標單位與 index.html 的舊路徑相同（x: -60..95, y: -160..0），放大 U 倍
const WU = 3.2;
function wolfShape() {
  const p = new Path2D();
  const P = (x, y) => [x * WU, y * WU];
  p.moveTo(...P(-58, 0));
  p.bezierCurveTo(...P(-66, -50), ...P(-56, -92), ...P(-32, -114));
  p.lineTo(...P(-40, -156)); p.lineTo(...P(-14, -124));
  p.lineTo(...P(-4, -158)); p.lineTo(...P(8, -120));
  p.bezierCurveTo(...P(28, -120), ...P(48, -110), ...P(78, -97));
  p.bezierCurveTo(...P(86, -94), ...P(93, -90), ...P(92, -84));
  p.bezierCurveTo(...P(91, -79), ...P(86, -77), ...P(80, -77));
  p.bezierCurveTo(...P(66, -74), ...P(52, -72), ...P(42, -71));
  p.lineTo(...P(62, -63));
  p.bezierCurveTo(...P(42, -54), ...P(22, -54), ...P(12, -50));
  p.bezierCurveTo(...P(6, -30), ...P(12, -10), ...P(18, 0));
  p.closePath();
  return p;
}
function makeWolf(white) {
  const W = 620, H = 600, ox = 230, oy = 560;           // 原點（脖子底部中央）在畫布中的位置
  const c = canvas(W, H), g = c.getContext("2d");
  g.translate(ox, oy);
  const shape = wolfShape();
  const pal = white
    ? { base: ["#f7f9fd", "#b9c3da", "#8d98b8"], fur: ["#ffffff", "#f1f4fb", "#c9d3e6", "#9aa7c4"], dark: "#56607e", rim: "rgba(150,200,255,.9)" }
    : { base: ["#2c3247", "#11141f", "#05060a"], fur: ["#4a5370", "#262c3e", "#11141e", "#000"], dark: "#000", rim: "rgba(90,160,255,.95)" };

  // 底色：從口鼻（亮）到脖子（暗）
  let gr;
  cel(g, shape, pal.base[0], pal.base[1], 26, 22, null);

  // 毛流：從口鼻往後、往下
  const box = [-70 * WU, -160 * WU, 95 * WU, 0];
  strokesInside(g, shape, box, 1600, (x, y) => {
    const a = Math.atan2(.35 + (y / (160 * WU)) * -.2, -1) + (x < -20 * WU ? .9 : 0);
    return [Math.cos(a), Math.sin(a)];
  }, [12, 30], [1.2, 2.6], pal.fur, .3);

  // 額頭與口鼻的反光
  g.save(); g.clip(shape);
  gr = g.createRadialGradient(40 * WU, -112 * WU, 0, 40 * WU, -112 * WU, 55 * WU);
  gr.addColorStop(0, white ? "rgba(255,255,255,.55)" : "rgba(120,150,220,.28)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(-70 * WU, -170 * WU, 170 * WU, 170 * WU);
  // 下巴與脖子陰影
  gr = g.createLinearGradient(0, -60 * WU, 0, 0);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, white ? "rgba(40,50,80,.55)" : "rgba(0,0,0,.8)");
  g.fillStyle = gr; g.fillRect(-70 * WU, -60 * WU, 165 * WU, 60 * WU);
  g.restore();

  // 頸部鬃毛（外緣的毛簇）
  g.lineCap = "round";
  for (let k = 0; k < 70; k++) {
    const f = Math.random(), y = -108 * WU * f, x = (-58 + 26 * f * f) * WU;
    const len = rnd(14, 34);
    g.strokeStyle = pal.fur[(Math.random() * 3) | 0]; g.globalAlpha = rnd(.5, 1); g.lineWidth = rnd(2, 5);
    g.beginPath(); g.moveTo(x + 10, y); g.quadraticCurveTo(x - len * .5, y + rnd(-6, 6), x - len, y + rnd(4, 16)); g.stroke();
  }
  g.globalAlpha = 1;

  // 耳朵內側
  g.fillStyle = white ? "rgba(150,120,140,.6)" : "rgba(60,30,40,.8)";
  g.beginPath(); g.moveTo(-34 * WU, -116 * WU); g.lineTo(-37 * WU, -146 * WU); g.lineTo(-20 * WU, -124 * WU); g.closePath(); g.fill();

  // 眉骨陰影、眼睛
  const ex = 32 * WU, ey = -104 * WU;
  g.fillStyle = white ? "rgba(70,80,110,.55)" : "rgba(0,0,0,.8)";
  g.beginPath(); g.ellipse(ex - 4, ey - 6, 30, 10, -.25, 0, TAU); g.fill();
  g.fillStyle = "#05060a";
  g.beginPath(); g.moveTo(ex - 26, ey + 2); g.quadraticCurveTo(ex, ey - 16, ex + 24, ey - 2); g.quadraticCurveTo(ex, ey + 12, ex - 26, ey + 2); g.fill();
  gr = g.createRadialGradient(ex + 2, ey - 2, 1, ex + 2, ey - 2, 14);
  gr.addColorStop(0, "#fff"); gr.addColorStop(.35, white ? "#8fd4ff" : "#ff6a5a"); gr.addColorStop(1, white ? "#1b4a8a" : "#5a0a10");
  g.fillStyle = gr; g.beginPath(); g.ellipse(ex + 2, ey - 2, 13, 8, -.15, 0, TAU); g.fill();
  g.fillStyle = "#000"; g.beginPath(); g.ellipse(ex + 2, ey - 2, 2.5, 7, 0, 0, TAU); g.fill();
  g.fillStyle = "rgba(255,255,255,.9)"; g.beginPath(); g.arc(ex + 6, ey - 5, 2.4, 0, TAU); g.fill();

  // 鼻子
  gr = g.createRadialGradient(88 * WU, -86 * WU, 2, 88 * WU, -84 * WU, 22);
  gr.addColorStop(0, "#444"); gr.addColorStop(.4, "#111"); gr.addColorStop(1, "#000");
  g.fillStyle = gr; g.beginPath(); g.ellipse(87 * WU, -84 * WU, 20, 15, .2, 0, TAU); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(85 * WU, -89 * WU, 6, 3, .2, 0, TAU); g.fill();

  // 嘴巴與獠牙
  g.strokeStyle = "#08080c"; g.lineWidth = 6; g.lineCap = "round";
  g.beginPath(); g.moveTo(80 * WU, -77 * WU); g.bezierCurveTo(66 * WU, -74 * WU, 52 * WU, -72 * WU, 40 * WU, -71 * WU); g.lineTo(60 * WU, -63 * WU); g.stroke();
  g.fillStyle = "#8a1018"; g.beginPath(); g.moveTo(42 * WU, -71 * WU); g.lineTo(78 * WU, -76 * WU); g.lineTo(60 * WU, -64 * WU); g.closePath(); g.fill();
  g.fillStyle = "#f6f2ea";
  for (const [x, l] of [[70, 10], [52, 12], [46, 8]]) {
    g.beginPath(); g.moveTo((x - 2) * WU, -75 * WU); g.lineTo(x * WU, (-75 + l) * WU); g.lineTo((x + 2) * WU, -75 * WU); g.closePath(); g.fill();
  }

  // 輪廓：暗線 + 藍色邊緣光
  g.strokeStyle = "#0b0c14"; g.lineWidth = 6; g.lineJoin = "round"; g.stroke(shape);
  g.save(); g.clip(shape);
  g.strokeStyle = pal.rim; g.lineWidth = 7; g.shadowColor = pal.rim; g.shadowBlur = 14;
  g.translate(-4, 4); g.stroke(shape);
  g.restore();

  // 底部融進影子
  g.globalCompositeOperation = "destination-in";
  gr = g.createLinearGradient(0, -40 * WU, 0, 0);
  gr.addColorStop(0, "#000"); gr.addColorStop(1, "rgba(0,0,0,.15)");
  g.fillStyle = gr; g.fillRect(-ox, -oy, W, H);
  g.globalCompositeOperation = "source-over";
  return { img: c, ox, oy, unit: WU, eye: [ex, ey] };
}

// ================= 鵺 =================
function feather(g, len, wid, base, edge, rachis) {
  const gr = g.createLinearGradient(0, 0, len, 0);
  gr.addColorStop(0, base[0]); gr.addColorStop(.7, base[1]); gr.addColorStop(1, base[2]);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, -wid * .3);
  g.bezierCurveTo(len * .3, -wid, len * .8, -wid * .7, len, 0);
  g.bezierCurveTo(len * .8, wid * .6, len * .3, wid * .8, 0, wid * .3);
  g.closePath(); g.fill();
  g.strokeStyle = edge; g.lineWidth = 1.5; g.stroke();
  g.strokeStyle = rachis; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * .5, -wid * .1, len * .95, 0); g.stroke();
  // 羽枝
  g.lineWidth = .7; g.globalAlpha *= .5;
  for (let k = 1; k < 14; k++) {
    const x = len * k / 15;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, -wid * .55); g.moveTo(x, 0); g.lineTo(x + 8, wid * .45); g.stroke();
  }
  g.globalAlpha /= .5;
}
function makeNueWing() {
  // 右翼，肩膀在 (40, 260)，往右上展開
  const W = 760, H = 420, c = canvas(W, H), g = c.getContext("2d");
  const sx = 40, sy = 260;
  const dark = ["#151a2c", "#0a0d18", "#04050a"], edge = "rgba(110,170,255,.55)", rachis = "rgba(170,200,255,.35)";
  // 初級飛羽（最長）
  for (let k = 0; k < 11; k++) {
    const f = k / 10;
    g.save(); g.translate(sx + 260 + f * 160, sy - 120 - f * 40); g.rotate(-.55 + f * .85);
    feather(g, 340 - f * 90, 34, dark, edge, rachis); g.restore();
  }
  // 次級飛羽
  for (let k = 0; k < 12; k++) {
    const f = k / 11;
    g.save(); g.translate(sx + 40 + f * 250, sy - 30 - f * 100); g.rotate(.9 - f * .45);
    feather(g, 230, 30, dark, edge, rachis); g.restore();
  }
  // 覆羽（小羽毛，鱗片狀）
  for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) {
    const f = k / 11;
    g.save(); g.translate(sx + 10 + f * 300 + r * 8, sy - 50 - f * 110 + r * 26); g.rotate(.6 - f * .3);
    feather(g, 90 - r * 8, 20, ["#2a3350", "#141a2c", "#090b14"], "rgba(130,180,255,.5)", rachis); g.restore();
  }
  // 翼骨上緣的高光
  g.strokeStyle = "rgba(160,200,255,.6)"; g.lineWidth = 4; g.lineCap = "round";
  g.beginPath(); g.moveTo(sx, sy - 40); g.quadraticCurveTo(sx + 200, sy - 190, sx + 420, sy - 170); g.stroke();
  return { img: c, ox: sx, oy: sy };
}
function makeNueBody() {
  const W = 360, H = 420, c = canvas(W, H), g = c.getContext("2d");
  const cx = W / 2;
  // 身體：深藍黑色的羽毛鱗片
  const body = new Path2D();
  body.moveTo(cx, 60); body.bezierCurveTo(cx + 120, 80, cx + 130, 260, cx + 40, 400);
  body.lineTo(cx, 380); body.lineTo(cx - 40, 400); body.bezierCurveTo(cx - 130, 260, cx - 120, 80, cx, 60);
  let gr = g.createLinearGradient(cx - 120, 0, cx + 120, 0);
  gr.addColorStop(0, "#05060c"); gr.addColorStop(.5, "#1c2440"); gr.addColorStop(1, "#05060c");
  g.fillStyle = gr; g.fill(body);
  g.save(); g.clip(body);
  for (let row = 0; row < 16; row++) for (let k = -6; k <= 6; k++) {
    const x = cx + k * 22 + (row % 2) * 11, y = 140 + row * 18;
    g.strokeStyle = `rgba(120,170,255,${.15 + .2 * Math.random()})`; g.lineWidth = 1.4;
    g.fillStyle = `rgba(${20 + row * 2},${26 + row * 2},${50 + row * 3},.9)`;
    g.beginPath(); g.arc(x, y, 13, 0, Math.PI); g.fill(); g.stroke();
  }
  g.restore();
  // 白色面具頭部
  const hy = 120;
  g.fillStyle = "#06070c"; g.beginPath(); g.ellipse(cx, hy, 78, 86, 0, 0, TAU); g.fill();
  const mask = new Path2D();
  mask.moveTo(cx - 70, hy - 50); mask.quadraticCurveTo(cx, hy - 95, cx + 70, hy - 50);
  mask.bezierCurveTo(cx + 74, hy + 10, cx + 40, hy + 60, cx, hy + 82);
  mask.bezierCurveTo(cx - 40, hy + 60, cx - 74, hy + 10, cx - 70, hy - 50);
  gr = g.createRadialGradient(cx - 20, hy - 40, 10, cx, hy, 110);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(.6, "#d9dde6"); gr.addColorStop(1, "#7d8396");
  g.fillStyle = gr; g.fill(mask);
  grain(g, W, 220, 2500, ["#000", "#8890a8"], .12, 1.5);
  g.strokeStyle = "rgba(30,34,50,.9)"; g.lineWidth = 3; g.stroke(mask);
  // 面具紋路
  g.strokeStyle = "rgba(40,45,70,.7)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(cx, hy - 72); g.lineTo(cx, hy + 70); g.stroke();
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(cx + s * 10, hy - 60); g.quadraticCurveTo(cx + s * 50, hy - 50, cx + s * 64, hy - 20); g.stroke();
    // 眼洞
    g.fillStyle = "#000";
    g.beginPath(); g.moveTo(cx + s * 14, hy - 14); g.quadraticCurveTo(cx + s * 40, hy - 34, cx + s * 58, hy - 12);
    g.quadraticCurveTo(cx + s * 36, hy + 2, cx + s * 14, hy - 14); g.fill();
  }
  // 喙
  g.fillStyle = "#1a1c26"; g.beginPath(); g.moveTo(cx - 10, hy + 20); g.lineTo(cx + 10, hy + 20); g.lineTo(cx, hy + 56); g.closePath(); g.fill();
  // 頭頂冠羽
  for (let k = -3; k <= 3; k++) {
    g.save(); g.translate(cx + k * 14, hy - 70); g.rotate(-Math.PI / 2 + k * .22);
    feather(g, 70 - Math.abs(k) * 6, 14, ["#20283f", "#0c0f1a", "#000"], "rgba(130,180,255,.6)", "rgba(170,200,255,.4)");
    g.restore();
  }
  return { img: c, ox: cx, oy: hy, eyes: [[cx - 36, hy - 16], [cx + 36, hy - 16]] };
}

// ================= 魔虛羅（賽璐璐上色） =================
// 平塗底色 → 右下方的陰影塊（用位移後的同一形狀挖出） → 黑色線稿
function cel(g, path, base, shadow, dx, dy, line = "#1d1b28", lw = 5, deep = null, hatch = false) {
  g.save(); g.clip(path);
  g.fillStyle = deep || shadow; g.fill(path);
  if (deep) { g.save(); g.translate(-dx * .4, -dy * .4); g.fillStyle = shadow; g.fill(path); g.restore(); }
  if (hatch) {                                     // 陰影裡的漫畫排線（亮面會被下一步蓋掉）
    g.strokeStyle = "rgba(40,36,56,.45)"; g.lineWidth = 1.6;
    for (let k = -1600; k < 1600; k += 9) { g.beginPath(); g.moveTo(k - 800, 800); g.lineTo(k + 800, -2400); g.stroke(); }
  }
  g.translate(-dx, -dy); g.fillStyle = base; g.fill(path);
  g.restore();
  if (line) { g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(path); }
}
// 兩點之間的肢體：寬度 wa→wb，兩側各自可以鼓起（肌肉）
function limb(A, B, wa, wb, bulgeOut = 0, bulgeIn = 0) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, wm = (wa + wb) / 4;
  const p = new Path2D();
  p.moveTo(A[0] + nx * wa / 2, A[1] + ny * wa / 2);
  p.quadraticCurveTo(mx + nx * (wm + bulgeOut), my + ny * (wm + bulgeOut), B[0] + nx * wb / 2, B[1] + ny * wb / 2);
  p.quadraticCurveTo(B[0] + dx / L * wb * .45, B[1] + dy / L * wb * .45, B[0] - nx * wb / 2, B[1] - ny * wb / 2);
  p.quadraticCurveTo(mx - nx * (wm + bulgeIn), my - ny * (wm + bulgeIn), A[0] - nx * wa / 2, A[1] - ny * wa / 2);
  p.closePath();
  return p;
}
function vein(g, pts, w = 2.5) {
  g.strokeStyle = "rgba(40,36,56,.7)"; g.lineWidth = w; g.lineCap = "round";
  g.beginPath(); g.moveTo(...pts[0]);
  for (let k = 1; k < pts.length; k++) g.quadraticCurveTo(pts[k - 1][0] + 8, pts[k - 1][1] + 6, ...pts[k]);
  g.stroke();
}
function makeMahoraga() {
  const W = 1300, H = 1700, c = canvas(W, H), g = c.getContext("2d");
  const ox = W / 2, oy = H;
  g.translate(ox, oy);
  const SK = "#ecebf0", SH = "#a9a6b8", DP = "#7d7990", LN = "#1a1822";
  const P = (cmds) => { const p = new Path2D(); for (const [op, ...a] of cmds) p[op](...a); return p; };

  // ---- 背後的大羽翼（往上往外展開）----
  const feather = (len, wid) => { const p = new Path2D(); p.moveTo(0, -wid * .45); p.bezierCurveTo(len * .3, -wid * 1.05, len * .78, -wid * .7, len, 0); p.bezierCurveTo(len * .8, wid * .5, len * .3, wid * .75, 0, wid * .45); p.closePath(); return p; };
  // 每一邊是一片鳥翼：沿著翼骨（從頭側往外上方）排羽毛，越外側越長、越往上翹
  for (const s of [-1, 1]) {
    g.save(); g.scale(s, 1);
    for (let tier = 0; tier < 2; tier++) {
      for (let k = 7; k >= 0; k--) {
        const f = k / 7, bx = 70 + f * 230, by = -1010 - f * 190 - tier * 30;
        const len = (tier ? 200 : 300) + f * (tier ? 120 : 200), ang = -.18 - f * .55 - tier * .25;
        g.save(); g.translate(bx, by); g.rotate(ang);
        cel(g, feather(len, tier ? 34 : 44), "#f8f8fb", "#bcb9cb", 0, 12, LN, 4);
        g.strokeStyle = "#9d99b2"; g.lineWidth = 2; g.beginPath(); g.moveTo(12, 0); g.lineTo(len * .9, 0); g.stroke();
        g.restore();
      }
    }
    // 翼骨
    g.strokeStyle = LN; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(60, -1000); g.quadraticCurveTo(200, -1080, 310, -1210); g.stroke();
    g.restore();
  }
  // ---- 頭頂往上捲的長角 ----
  const HEAD_T = () => { g.translate(0, -960); g.scale(1.32, 1.32); g.translate(0, 960); };
  g.save(); HEAD_T();
  {
    const ctr = [[0, -1070], [6, -1170], [30, -1270], [78, -1350], [140, -1392], [205, -1388], [240, -1360]];
    const L2 = [], R2 = [];
    ctr.forEach((q, i) => {
      const nq = ctr[Math.min(ctr.length - 1, i + 1)], pq = ctr[Math.max(0, i - 1)];
      const tx = nq[0] - pq[0], ty = nq[1] - pq[1], tl = Math.hypot(tx, ty), w = 30 * (1 - i / (ctr.length - 1)) + 3;
      L2.push([q[0] - ty / tl * w, q[1] + tx / tl * w]); R2.push([q[0] + ty / tl * w, q[1] - tx / tl * w]);
    });
    const horn = new Path2D(); horn.moveTo(...L2[0]); L2.slice(1).forEach(q => horn.lineTo(...q)); R2.reverse().forEach(q => horn.lineTo(...q)); horn.closePath();
    cel(g, horn, "#f4f3f7", "#b4b0c4", 12, 10, LN, 5);
    g.strokeStyle = "#8e8aa4"; g.lineWidth = 2.5;
    for (let i = 1; i < ctr.length - 1; i++) { g.beginPath(); g.moveTo(...L2[i]); g.lineTo(...[...R2].reverse()[i]); g.stroke(); }
  }
  g.restore();
  // ---- 左手（垂下）----
  cel(g, limb([-345, -350], [-330, 0], 120, 90, 18, 6), SK, SH, -14, 8, LN, 5, null, true);
  cel(g, limb([-300, -650], [-348, -320], 140, 116, 30, 10), SK, SH, -16, 10, LN, 5, null, true);
  vein(g, [[-360, -300], [-372, -220], [-356, -140], [-366, -60]]);
  vein(g, [[-330, -560], [-342, -470], [-336, -390]], 2);
  // ---- 右手（舉起，握著劍）----
  cel(g, limb([496, -880], [470, -1160], 120, 86, 22, 8), SK, SH, 14, 8, LN, 5, null, true);
  cel(g, limb([320, -690], [505, -910], 142, 110, 34, 6), SK, SH, 14, 12, LN, 5, null, true);
  vein(g, [[520, -930], [528, -1010], [512, -1090], [500, -1140]]);
  // 劍：纏繩的握柄 + 圓錐形長刃
  const blade = P([["moveTo", 448, -1240], ["lineTo", 492, -1240], ["lineTo", 476, -1640], ["closePath"]]);
  cel(g, blade, "#dfe3ec", "#8d93a8", 10, 0, LN, 4);
  g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo(458, -1250); g.lineTo(474, -1600); g.stroke();
  cel(g, P([["rect", 446, -1250, 48, 70]]), "#d8cfb4", "#9a8f70", 6, 0, LN, 4);
  g.strokeStyle = LN; g.lineWidth = 2.5;
  for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(446, -1244 + k * 12); g.lineTo(494, -1236 + k * 12); g.stroke(); }
  // 拳頭
  const fist = P([["moveTo", 420, -1150], ["bezierCurveTo", 410, -1200, 430, -1240, 470, -1242], ["bezierCurveTo", 515, -1244, 532, -1205, 524, -1160], ["bezierCurveTo", 516, -1130, 440, -1124, 420, -1150], ["closePath"]]);
  cel(g, fist, SK, SH, 10, 8, LN, 5);
  g.strokeStyle = LN; g.lineWidth = 3;
  for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(432 + k * 26, -1222); g.quadraticCurveTo(440 + k * 26, -1190, 438 + k * 26, -1160); g.stroke(); }

  // ---- 軀幹 ----
  const torso = P([
    ["moveTo", -176, 0], ["bezierCurveTo", -182, -120, -220, -262, -254, -382], ["bezierCurveTo", -274, -472, -280, -562, -262, -652],
    ["lineTo", -196, -735], ["bezierCurveTo", -152, -775, -108, -796, -76, -836], ["lineTo", -80, -900], ["lineTo", 80, -900],
    ["lineTo", 76, -836], ["bezierCurveTo", 108, -796, 152, -775, 196, -735], ["lineTo", 262, -652],
    ["bezierCurveTo", 280, -562, 274, -472, 254, -382], ["bezierCurveTo", 220, -262, 182, -120, 176, 0], ["closePath"]]);
  cel(g, torso, SK, SH, 24, 8, LN, 6, null, true);
  for (const s of [-1, 1]) cel(g, P([["moveTo", s * 70, -876], ["bezierCurveTo", s * 120, -814, s * 186, -792, s * 244, -770], ["lineTo", s * 162, -744], ["bezierCurveTo", s * 120, -772, s * 90, -802, s * 70, -834], ["closePath"]]), SK, SH, s * 10, 8, LN, 4);
  // 胸肌（含肌纖維線）
  for (const s of [-1, 1]) {
    cel(g, P([["moveTo", 0, -740], ["bezierCurveTo", s * 92, -750, s * 204, -736, s * 260, -664], ["bezierCurveTo", s * 266, -600, s * 236, -540, s * 174, -520],
      ["bezierCurveTo", s * 112, -504, s * 42, -518, 0, -538], ["closePath"]]), SK, SH, s * 8, 28, LN, 5, DP, true);
    g.strokeStyle = "rgba(40,36,56,.5)"; g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(s * (40 + k * 30), -722 + k * 4); g.quadraticCurveTo(s * (90 + k * 26), -650, s * (120 + k * 22), -560 + k * 6); g.stroke(); }
  }
  // 腹肌
  for (const s of [-1, 1]) for (let r = 0; r < 4; r++) {
    const y0 = -508 + r * 80, y1 = y0 + 68, x0 = s * 12, x1 = s * (98 - r * 8);
    const p = new Path2D();
    p.moveTo(x0, y0 + 10); p.quadraticCurveTo(x0, y0, x0 + s * 12, y0); p.lineTo(x1 - s * 18, y0 + 4);
    p.quadraticCurveTo(x1, y0 + 8, x1, y0 + 26); p.lineTo(x1 - s * 4, y1 - 12); p.quadraticCurveTo(x1 - s * 8, y1, x1 - s * 26, y1);
    p.lineTo(x0 + s * 10, y1); p.quadraticCurveTo(x0, y1, x0, y1 - 12); p.closePath();
    cel(g, p, SK, SH, s * 8, 14, LN, 3.5, null, true);
  }
  g.strokeStyle = LN; g.lineWidth = 3.5; g.lineCap = "round";
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(s * (238 - k * 6), -530 + k * 40); g.quadraticCurveTo(s * 208, -515 + k * 40, s * (178 - k * 4), -498 + k * 42); g.stroke(); }
    g.beginPath(); g.moveTo(s * 178, -250); g.quadraticCurveTo(s * 126, -160, s * 74, -96); g.stroke();
    g.beginPath(); g.moveTo(s * 24, -756); g.quadraticCurveTo(s * 100, -774, s * 180, -756); g.stroke();
    g.beginPath(); g.moveTo(s * 52, -892); g.quadraticCurveTo(s * 36, -820, s * 18, -764); g.stroke();
  }
  // 三角肌
  cel(g, P([["moveTo", -192, -764], ["bezierCurveTo", -306, -808, -400, -728, -396, -606], ["bezierCurveTo", -392, -528, -340, -474, -298, -502], ["bezierCurveTo", -276, -602, -246, -702, -192, -764], ["closePath"]]), SK, SH, -20, 16, LN, 5, null, true);
  cel(g, P([["moveTo", 192, -764], ["bezierCurveTo", 300, -820, 410, -790, 420, -700], ["bezierCurveTo", 424, -640, 380, -600, 330, -610], ["bezierCurveTo", 290, -660, 250, -720, 192, -764], ["closePath"]]), SK, SH, 18, 16, LN, 5, null, true);
  g.strokeStyle = "rgba(40,36,56,.5)"; g.lineWidth = 2;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-230 - k * 30, -748 + k * 6); g.quadraticCurveTo(-320 - k * 14, -690, -330 - k * 10, -560 + k * 10); g.stroke(); }
  // ---- 胸前的鎖鏈 ----
  const chainAt = t => [(-1 + 2 * t) * 210, -770 + Math.sin(Math.PI * t) * 66];
  for (let k = 0; k <= 22; k++) {
    const t = k / 22, [x, y] = chainAt(t), [x2, y2] = chainAt(Math.min(1, t + .02)), ang = Math.atan2(y2 - y, x2 - x);
    g.save(); g.translate(x, y); g.rotate(ang);
    g.strokeStyle = "#141218"; g.lineWidth = k % 2 ? 4 : 7;
    g.beginPath(); g.ellipse(0, 0, 13, k % 2 ? 4 : 9, 0, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(-2, -2, 9, k % 2 ? 2 : 6, 0, Math.PI, TAU * .85); g.stroke();
    g.restore();
  }
  for (const t of [.2, .5, .8]) {
    const [x, y] = chainAt(t);
    for (let j = 1; j <= 3; j++) { g.strokeStyle = "#141218"; g.lineWidth = j % 2 ? 4 : 6; g.beginPath(); g.ellipse(x, y + j * 20, j % 2 ? 3 : 7, 10, 0, 0, TAU); g.stroke(); }
  }
  // ---- 黑色袴褲、白色繩結腰帶 ----
  const hakama = P([["moveTo", -230, -96], ["bezierCurveTo", -110, -122, 110, -122, 230, -96], ["lineTo", 300, 0], ["lineTo", -300, 0], ["closePath"]]);
  cel(g, hakama, "#232129", "#0c0b10", 14, 10, "#000", 5);
  g.strokeStyle = "rgba(255,255,255,.16)"; g.lineWidth = 3;
  for (let k = -5; k <= 5; k++) { g.beginPath(); g.moveTo(k * 42, -108); g.quadraticCurveTo(k * 48 + 10, -50, k * 56, 0); g.stroke(); }
  const rope = P([["moveTo", -226, -104], ["bezierCurveTo", -110, -136, 110, -136, 226, -104], ["lineTo", 220, -80], ["bezierCurveTo", 110, -112, -110, -112, -220, -80], ["closePath"]]);
  cel(g, rope, "#f1f0f4", "#aeaabe", 0, 8, LN, 4);
  g.strokeStyle = "#aeaabe"; g.lineWidth = 2;
  for (let k = -10; k <= 10; k++) { g.beginPath(); g.moveTo(k * 21 - 6, -118 + Math.abs(k) * 1.3); g.lineTo(k * 21 + 6, -96 + Math.abs(k) * 1.3); g.stroke(); }
  // 繩結與飄帶
  cel(g, P([["ellipse", -150, -102, 26, 20, 0, 0, TAU]]), "#f1f0f4", "#aeaabe", 4, 6, LN, 4);
  for (const [dx, len] of [[-10, 120], [12, 96]]) {
    cel(g, P([["moveTo", -150 + dx, -90], ["bezierCurveTo", -170 + dx, -40, -130 + dx, -10, -160 + dx, -90 + len], ["lineTo", -136 + dx, -90 + len], ["bezierCurveTo", -112 + dx, -20, -150 + dx, -40, -132 + dx, -90], ["closePath"]]), "#f1f0f4", "#aeaabe", 6, 0, LN, 3.5);
  }
  // ---- 頭：骷髏般的臉、咧嘴的牙齒 ----
  g.save(); HEAD_T();
  const head = P([["moveTo", 0, -1092], ["bezierCurveTo", 72, -1092, 94, -1030, 92, -985], ["bezierCurveTo", 90, -940, 76, -904, 52, -880],
    ["bezierCurveTo", 36, -866, 18, -860, 0, -860], ["bezierCurveTo", -18, -860, -36, -866, -52, -880], ["bezierCurveTo", -76, -904, -90, -940, -92, -985],
    ["bezierCurveTo", -94, -1030, -72, -1092, 0, -1092], ["closePath"]]);
  cel(g, head, SK, SH, 16, 12, LN, 6, null, true);
  g.strokeStyle = LN; g.lineWidth = 3;
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(s * 80, -985); g.quadraticCurveTo(s * 60, -960, s * 66, -925); g.stroke();      // 顴骨
    g.beginPath(); g.moveTo(s * 70, -918); g.quadraticCurveTo(s * 66, -896, s * 48, -882); g.stroke();      // 下顎
    g.fillStyle = "#2a2632"; g.beginPath(); g.ellipse(s * 9, -960, 4, 8, s * .3, 0, TAU); g.fill();       // 鼻孔
  }
  const mouth = P([["moveTo", -60, -936], ["quadraticCurveTo", 0, -948, 60, -936], ["quadraticCurveTo", 56, -900, 46, -890], ["quadraticCurveTo", 0, -882, -46, -890], ["quadraticCurveTo", -56, -900, -60, -936], ["closePath"]]);
  g.fillStyle = "#24202a"; g.fill(mouth);
  g.save(); g.clip(mouth);
  g.fillStyle = "#f7f6f2";
  g.fill(P([["moveTo", -60, -940], ["quadraticCurveTo", 0, -952, 60, -940], ["lineTo", 60, -918], ["quadraticCurveTo", 0, -924, -60, -918], ["closePath"]]));
  g.fill(P([["moveTo", -60, -912], ["quadraticCurveTo", 0, -918, 60, -912], ["lineTo", 60, -880], ["lineTo", -60, -880], ["closePath"]]));
  g.strokeStyle = "#3a3540"; g.lineWidth = 2;
  for (let k = -5; k <= 5; k++) { g.beginPath(); g.moveTo(k * 10.5, -948); g.lineTo(k * 10.5, -920); g.moveTo(k * 10.5 + 5, -914); g.lineTo(k * 10.5 + 5, -884); g.stroke(); }
  g.restore();
  g.strokeStyle = LN; g.lineWidth = 4; g.stroke(mouth);
  // 遮住眼睛的前羽（橫向的面罩）
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * 6, -1006); g.scale(s, 1);
    for (let k = 0; k < 6; k++) {
      g.save(); g.rotate(-.42 + k * .1);
      cel(g, feather(150 + k * 24, 34), "#fbfbfd", "#c4c1d2", 0, 10, LN, 4);
      g.restore();
    }
    g.restore();
  }
  g.restore();
  return { img: c, ox, oy, headY: -1000, wheelY: -1330 };
}

function makeWheel() {
  // 八根輻條、末端是金色圓球的法輪
  const R = 260, S = R * 2 + 90, c = canvas(S, S), g = c.getContext("2d");
  g.translate(S / 2, S / 2);
  const ball = (x, y, r) => {
    const gr = g.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
    gr.addColorStop(0, "#fff7d6"); gr.addColorStop(.35, "#e8c768"); gr.addColorStop(.8, "#a87c24"); gr.addColorStop(1, "#6b4a12");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.strokeStyle = "#3b2a08"; g.lineWidth = 3; g.stroke();
  };
  const bar = (x0, y0, x1, y1, w) => {
    const nx = -(y1 - y0), ny = x1 - x0, n = Math.hypot(nx, ny);
    const gr = g.createLinearGradient(x0 + nx / n * w, y0 + ny / n * w, x0 - nx / n * w, y0 - ny / n * w);
    gr.addColorStop(0, "#fff2c0"); gr.addColorStop(.4, "#d9b252"); gr.addColorStop(1, "#7a5616");
    g.strokeStyle = gr; g.lineWidth = w; g.lineCap = "round";
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  };
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * TAU, cx = Math.cos(a), sy = Math.sin(a);
    bar(cx * R * .18, sy * R * .18, cx * R * .9, sy * R * .9, 18);
  }
  // 外圈（金屬斜面）
  for (const [r, w] of [[R * .6, 26], [R * .2, 20]]) {
    const gr = g.createLinearGradient(-r, -r, r, r);
    gr.addColorStop(0, "#fff2c0"); gr.addColorStop(.35, "#e0bb5a"); gr.addColorStop(.6, "#8a6420"); gr.addColorStop(1, "#e9c870");
    g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    g.strokeStyle = "#3b2a08"; g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, r + w / 2, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, r - w / 2, 0, TAU); g.stroke();
  }
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ball(Math.cos(a) * R, Math.sin(a) * R, 36); }
  ball(0, 0, 30);
  return { img: c, size: S, r: R };
}

// ================= 五條悟：白髮、眼罩布紋 =================
function makeGojoHair() {
  const W = 900, H = 620, c = canvas(W, H), g = c.getContext("2d");
  const cx = W / 2, base = H - 40;                        // base：眼罩上緣
  // 由後往前一層層畫尖刺
  for (let layer = 0; layer < 4; layer++) {
    const n = 15 - layer * 2;
    for (let k = 0; k < n; k++) {
      const f = (k + .5) / n - .5;
      const x = cx + f * (W * .82 - layer * 80) + rnd(-12, 12);
      const len = (360 - Math.abs(f) * 300) * (1 - layer * .12) * rnd(.85, 1.15);
      const ang = -Math.PI / 2 + f * 1.6 + rnd(-.18, .18);
      const w = rnd(46, 70) - layer * 4;
      const tx = x + Math.cos(ang) * len, ty = base + Math.sin(ang) * len;
      const gr = g.createLinearGradient(x, base, tx, ty);
      const shade = 210 + layer * 14;
      gr.addColorStop(0, `rgb(${shade - 60},${shade - 50},${shade - 30})`);
      gr.addColorStop(.6, `rgb(${shade},${shade + 4},${Math.min(255, shade + 20)})`);
      gr.addColorStop(1, "#ffffff");
      g.fillStyle = gr;
      const bx = Math.cos(ang + Math.PI / 2) * w / 2, by = Math.sin(ang + Math.PI / 2) * w / 2;
      const cx1 = x + Math.cos(ang + .25) * len * .6, cy1 = base + Math.sin(ang + .25) * len * .6;
      g.beginPath(); g.moveTo(x - bx, base - by);
      g.quadraticCurveTo(cx1, cy1, tx, ty);
      g.quadraticCurveTo(cx1 + bx * .3, cy1 + by * .3, x + bx, base + by);
      g.closePath(); g.fill();
      g.strokeStyle = "rgba(120,130,170,.55)"; g.lineWidth = 2; g.stroke();
      // 髮絲
      g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 1.2;
      for (let s = 0; s < 4; s++) {
        const o = rnd(-.3, .3);
        g.beginPath(); g.moveTo(x + bx * o, base + by * o); g.quadraticCurveTo(cx1, cy1, tx, ty); g.stroke();
      }
    }
  }
  return { img: c, ox: cx, oy: base, w: W };
}
function makeClothPattern() {
  const c = canvas(64, 64), g = c.getContext("2d");
  g.fillStyle = "#0b0b0f"; g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 2) { g.fillStyle = `rgba(255,255,255,${.025 + .02 * Math.random()})`; g.fillRect(0, y, 64, 1); }
  for (let x = 0; x < 64; x += 3) { g.fillStyle = `rgba(0,0,0,${.25 * Math.random()})`; g.fillRect(x, 0, 1, 64); }
  grain(g, 64, 64, 500, ["#fff", "#000"], .15, 1);
  return c;
}

export function buildArt() {
  return {
    wolfWhite: makeWolf(true),
    wolfBlack: makeWolf(false),
    nueWing: makeNueWing(),
    nueBody: makeNueBody(),
    mahoraga: makeMahoraga(),
    wheel: makeWheel(),
    hair: makeGojoHair(),
    cloth: makeClothPattern(),
  };
}
