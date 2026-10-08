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
function cel(g, path, base, shadow, dx, dy, line = "#1d1b28", lw = 5, deep = null) {
  g.save(); g.clip(path);
  g.fillStyle = deep || shadow; g.fill(path);
  if (deep) { g.save(); g.translate(-dx * .4, -dy * .4); g.fillStyle = shadow; g.fill(path); g.restore(); }
  g.translate(-dx, -dy); g.fillStyle = base; g.fill(path);
  g.restore();
  if (line) { g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(path); }
}
function mirrorPath(build) {             // build(p, s) 用 s=±1 畫左右兩邊
  const p = new Path2D(); build(p, -1); build(p, 1); return p;
}
function makeMahoraga() {
  const W = 1100, H = 1320, c = canvas(W, H), g = c.getContext("2d");
  const ox = W / 2, oy = H;
  g.translate(ox, oy);
  const SK = "#f2f0f6", SH = "#b9b5cc", DP = "#8f8aa8", LN = "#1d1b28";
  const P = (cmds) => { const p = new Path2D(); for (const [op, ...a] of cmds) p[op](...a); return p; };

  for (const s of [-1, 1]) {
    // 前臂、上臂
    cel(g, P([["moveTo", s * 292, -345], ["bezierCurveTo", s * 282, -240, s * 292, -120, s * 306, 0], ["lineTo", s * 396, 0],
      ["bezierCurveTo", s * 414, -140, s * 424, -262, s * 404, -348], ["closePath"]]), SK, SH, s * 16, 10, LN, 5);
    cel(g, P([["moveTo", s * 268, -612], ["bezierCurveTo", s * 248, -488, s * 266, -386, s * 296, -322], ["lineTo", s * 398, -332],
      ["bezierCurveTo", s * 424, -424, s * 414, -526, s * 388, -620], ["closePath"]]), SK, SH, s * 18, 12, LN, 5);
    // 二頭肌分界線
    g.strokeStyle = LN; g.lineWidth = 3;
    g.beginPath(); g.moveTo(s * 300, -500); g.quadraticCurveTo(s * 330, -420, s * 318, -350); g.stroke();
  }
  // 軀幹
  const torso = P([
    ["moveTo", -172, 0], ["bezierCurveTo", -178, -120, -216, -262, -250, -382], ["bezierCurveTo", -270, -472, -276, -562, -256, -652],
    ["lineTo", -190, -735], ["bezierCurveTo", -150, -772, -110, -792, -80, -832], ["lineTo", -74, -905], ["lineTo", 74, -905],
    ["lineTo", 80, -832], ["bezierCurveTo", 110, -792, 150, -772, 190, -735], ["lineTo", 256, -652],
    ["bezierCurveTo", 276, -562, 270, -472, 250, -382], ["bezierCurveTo", 216, -262, 178, -120, 172, 0], ["closePath"]]);
  cel(g, torso, SK, SH, 22, 8, LN, 6);
  // 斜方肌
  for (const s of [-1, 1]) cel(g, P([["moveTo", s * 74, -870], ["bezierCurveTo", s * 120, -812, s * 180, -790, s * 238, -768], ["lineTo", s * 160, -742], ["bezierCurveTo", s * 120, -770, s * 92, -800, s * 74, -830], ["closePath"]]), SK, SH, s * 10, 8, LN, 4);
  // 胸肌
  for (const s of [-1, 1]) cel(g, P([["moveTo", 0, -738], ["bezierCurveTo", s * 90, -748, s * 200, -734, s * 256, -664], ["bezierCurveTo", s * 262, -602, s * 232, -542, s * 172, -522],
    ["bezierCurveTo", s * 112, -506, s * 42, -520, 0, -540], ["closePath"]]), SK, SH, s * 8, 26, LN, 5, DP);
  // 腹肌（三排）
  for (const s of [-1, 1]) for (let r = 0; r < 3; r++) {
    const y0 = -510 + r * 82, y1 = y0 + 70, x0 = s * 12, x1 = s * (96 - r * 4);
    const p = new Path2D();
    p.moveTo(x0, y0 + 10); p.quadraticCurveTo(x0, y0, x0 + s * 12, y0); p.lineTo(x1 - s * 18, y0 + 4);
    p.quadraticCurveTo(x1, y0 + 8, x1, y0 + 26); p.lineTo(x1 - s * 4, y1 - 12); p.quadraticCurveTo(x1 - s * 8, y1, x1 - s * 26, y1);
    p.lineTo(x0 + s * 10, y1); p.quadraticCurveTo(x0, y1, x0, y1 - 12); p.closePath();
    cel(g, p, SK, SH, s * 8, 14, LN, 3.5);
  }
  // 前鋸肌、腹外斜肌
  g.strokeStyle = LN; g.lineWidth = 3.5; g.lineCap = "round";
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(s * (232 - k * 6), -520 + k * 44); g.quadraticCurveTo(s * 205, -505 + k * 44, s * (178 - k * 4), -488 + k * 46); g.stroke(); }
    g.beginPath(); g.moveTo(s * 170, -280); g.quadraticCurveTo(s * 120, -170, s * 66, -80); g.stroke();
    // 鎖骨
    g.beginPath(); g.moveTo(s * 22, -752); g.quadraticCurveTo(s * 100, -770, s * 176, -752); g.stroke();
    // 頸部肌腱
    g.beginPath(); g.moveTo(s * 58, -896); g.quadraticCurveTo(s * 40, -820, s * 20, -760); g.stroke();
  }
  // 三角肌（蓋在手臂與軀幹上）
  for (const s of [-1, 1]) cel(g, P([["moveTo", s * 186, -762], ["bezierCurveTo", s * 300, -806, s * 394, -726, s * 390, -604],
    ["bezierCurveTo", s * 386, -526, s * 334, -472, s * 292, -500], ["bezierCurveTo", s * 270, -600, s * 240, -700, s * 186, -762], ["closePath"]]), SK, SH, s * 20, 16, LN, 5);
  // 腰布與繩結
  const cloth = P([["moveTo", -214, -70], ["bezierCurveTo", -110, -100, 110, -100, 214, -70], ["lineTo", 244, 0], ["lineTo", -244, 0], ["closePath"]]);
  cel(g, cloth, "#24222e", "#0d0c12", 14, 10, "#000", 5);
  g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 3;
  for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(k * 46, -82); g.quadraticCurveTo(k * 50 + 8, -40, k * 54, 0); g.stroke(); }
  const rope = P([["moveTo", -206, -78], ["bezierCurveTo", -100, -112, 100, -112, 206, -78], ["lineTo", 200, -56], ["bezierCurveTo", 100, -88, -100, -88, -200, -56], ["closePath"]]);
  cel(g, rope, "#e8dcc0", "#a8977a", 0, 8, LN, 4);
  // 劍（右前臂外側伸出）
  const blade = P([["moveTo", 404, -300], ["bezierCurveTo", 440, -220, 500, -100, 560, 0], ["lineTo", 470, 0], ["bezierCurveTo", 440, -110, 420, -200, 392, -262], ["closePath"]]);
  cel(g, blade, "#e6ebf5", "#8f98b0", -12, 6, LN, 4);
  g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(410, -280); g.bezierCurveTo(445, -205, 495, -100, 548, 0); g.stroke();
  // 頭
  const head = P([["moveTo", 0, -1112], ["bezierCurveTo", 82, -1112, 98, -1022, 92, -962], ["bezierCurveTo", 86, -910, 56, -884, 0, -878],
    ["bezierCurveTo", -56, -884, -86, -910, -92, -962], ["bezierCurveTo", -98, -1022, -82, -1112, 0, -1112], ["closePath"]]);
  cel(g, head, SK, SH, 18, 14, LN, 6);
  // 鼻子陰影、嘴唇
  g.fillStyle = SH; g.beginPath(); g.moveTo(-6, -965); g.lineTo(10, -935); g.lineTo(-10, -935); g.closePath(); g.fill();
  g.strokeStyle = LN; g.lineWidth = 3; g.beginPath(); g.moveTo(-8, -936); g.lineTo(10, -936); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(-34, -912); g.quadraticCurveTo(0, -904, 34, -912); g.stroke();
  g.fillStyle = SH; g.beginPath(); g.moveTo(-24, -908); g.quadraticCurveTo(0, -896, 24, -908); g.quadraticCurveTo(0, -900, -24, -908); g.fill();
  // 頭部的翅膀：一對蓋住眼睛，一對在上面
  const wingFeather = (len, wid) => { const p = new Path2D(); p.moveTo(0, -wid * .4); p.bezierCurveTo(len * .35, -wid, len * .8, -wid * .6, len, 0); p.bezierCurveTo(len * .8, wid * .45, len * .35, wid * .7, 0, wid * .4); p.closePath(); return p; };
  for (const s of [-1, 1]) {
    for (const [ax, ay, rot0, sc] of [[50, -992, -.05, 1], [42, -1062, -.55, .72]]) {
      g.save(); g.translate(s * ax, ay); g.scale(s * sc, sc); g.rotate(rot0);
      for (let k = 4; k >= 0; k--) {
        g.save(); g.rotate(-.32 + k * .16);
        cel(g, wingFeather(250 - k * 28, 40), "#ffffff", "#c9c5da", 0, 10, LN, 4);
        g.strokeStyle = "#a9a4c0"; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 0); g.lineTo(220 - k * 28, 0); g.stroke();
        g.restore();
      }
      g.restore();
    }
  }
  return { img: c, ox, oy, headY: -995 };
}
function makeWheel() {
  const R = 260, S = R * 2 + 60, c = canvas(S, S), g = c.getContext("2d");
  g.translate(S / 2, S / 2);
  const gold = (x0, y0, x1, y1) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, "#fff6d0"); gr.addColorStop(.3, "#e6c56a"); gr.addColorStop(.55, "#8a6420"); gr.addColorStop(.8, "#f2d27e"); gr.addColorStop(1, "#6b4a12");
    return gr;
  };
  g.lineCap = "round";
  for (let k = 0; k < 8; k++) {
    g.save(); g.rotate(k / 8 * TAU);
    // 輻條
    g.strokeStyle = gold(0, -12, 0, 12); g.lineWidth = 22;
    g.beginPath(); g.moveTo(R * .22, 0); g.lineTo(R * .92, 0); g.stroke();
    g.strokeStyle = "rgba(60,40,10,.8)"; g.lineWidth = 3; g.stroke();
    // 把手（舵輪般）
    g.fillStyle = gold(R * .9, -30, R * 1.05, 30);
    g.beginPath(); g.ellipse(R * .98, 0, 26, 40, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(60,40,10,.9)"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "rgba(255,250,220,.7)"; g.beginPath(); g.ellipse(R * .96, -12, 8, 14, 0, 0, TAU); g.fill();
    g.restore();
  }
  // 外圈（雙線斜面）
  for (const [r, w] of [[R * .66, 30], [R * .25, 22]]) {
    g.strokeStyle = gold(-r, -r, r, r); g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(255,250,220,.6)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r - w / 2 + 2, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(60,40,10,.9)"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r + w / 2, 0, TAU); g.stroke();
  }
  g.fillStyle = gold(-30, -30, 30, 30); g.beginPath(); g.arc(0, 0, 34, 0, TAU); g.fill();
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
