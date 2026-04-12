/**
 * SPACE ENGINE — realistic deep-space background
 * Features: multi-layer parallax stars, nebulae, animated sun with corona,
 *           shooting stars. Camera drag is handled by the universe engine
 *           (index.html); this file reads window.SPACE_CAM for parallax.
 */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;

  // On project pages (no universe engine) we allow drag directly on the canvas
  const IS_PROJECT = !document.getElementById('universe');
  let cam  = { x: 0, y: 0 };
  let vel  = { x: 0, y: 0 };
  let drag = { active: false, sx: 0, sy: 0, cx: 0, cy: 0 };

  // ── LAYERS ────────────────────────────────────────────────────────────────
  const LAYER_CFG = [
    { count: 500, rMin: 0.15, rMax: 0.65, parallax: 0.06, twinkle: 0.018 },
    { count: 200, rMin: 0.4,  rMax: 1.1,  parallax: 0.18, twinkle: 0.012 },
    { count:  70, rMin: 1.0,  rMax: 2.2,  parallax: 0.38, twinkle: 0.008 },
    { count:  18, rMin: 2.3,  rMax: 3.5,  parallax: 0.62, twinkle: 0.005 },
  ];
  let layers = [];

  // ── NEBULAE ───────────────────────────────────────────────────────────────
  const NEBULA_CFG = [
    { wx: 0.15, wy: 0.22, rx: 0.28, ry: 0.18, c0: 'rgba(60,0,120,0.18)',  c1: 'rgba(30,0,80,0.06)',  parallax: 0.04 },
    { wx: 0.70, wy: 0.15, rx: 0.22, ry: 0.14, c0: 'rgba(0,60,140,0.16)',  c1: 'rgba(0,30,90,0.06)',  parallax: 0.03 },
    { wx: 0.55, wy: 0.72, rx: 0.30, ry: 0.20, c0: 'rgba(80,10,60,0.14)',  c1: 'rgba(40,0,40,0.05)',  parallax: 0.05 },
    { wx: 0.20, wy: 0.65, rx: 0.18, ry: 0.22, c0: 'rgba(0,40,80,0.12)',   c1: 'rgba(0,20,60,0.04)',  parallax: 0.03 },
    { wx: 0.82, wy: 0.50, rx: 0.16, ry: 0.26, c0: 'rgba(100,20,10,0.10)', c1: 'rgba(60,10,0,0.04)',  parallax: 0.04 },
    { wx: 0.40, wy: 0.40, rx: 0.12, ry: 0.10, c0: 'rgba(0,80,100,0.09)',  c1: 'rgba(0,40,60,0.03)',  parallax: 0.06 },
  ];

  // ── SUN (only on project pages) ───────────────────────────────────────────
  const SUN = { wx: 0.82, wy: 0.13, r: 0, parallax: 0.10, coronaRays: 24 };

  // ── SHOOTING STARS ────────────────────────────────────────────────────────
  let shooters = [];
  let nextShooter = 0;

  // ── RESIZE ────────────────────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    SUN.r = Math.min(W, H) * 0.055;
    buildLayers();
  }

  function buildLayers() {
    layers = LAYER_CFG.map(cfg => {
      const arr = [];
      for (let i = 0; i < cfg.count; i++) arr.push({
        wx:    (Math.random() - 0.5) * W * 2.8,
        wy:    (Math.random() - 0.5) * H * 2.8,
        r:     cfg.rMin + Math.random() * (cfg.rMax - cfg.rMin),
        base:  0.15 + Math.random() * 0.7,
        speed: cfg.twinkle * (0.6 + Math.random() * 0.8),
        phase: Math.random() * Math.PI * 2,
        tint:  Math.random() < 0.08 ? 1 : Math.random() < 0.06 ? 2 : 0,
      });
      return { cfg, stars: arr };
    });
  }

  // ── GET CAM (reads universe engine cam if on home page) ───────────────────
  function getCam() {
    if (!IS_PROJECT && window.SPACE_CAM) return window.SPACE_CAM;
    return cam;
  }

  // ── SHOOTING STARS ────────────────────────────────────────────────────────
  function spawnShooter() {
    const angle = (Math.PI / 5) + Math.random() * (Math.PI / 6);
    const speed = 8 + Math.random() * 14;
    shooters.push({
      x: Math.random() * W, y: -20,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      len: 120 + Math.random() * 220,
      speed, life: 1,
      decay: 0.012 + Math.random() * 0.01,
      width: 1 + Math.random() * 1.5,
    });
    nextShooter = Date.now() + 1800 + Math.random() * 5000;
  }

  function updateShooters() {
    if (Date.now() > nextShooter) spawnShooter();
    shooters = shooters.filter(s => s.life > 0);
    for (const s of shooters) { s.x += s.vx; s.y += s.vy; s.life -= s.decay; }
  }

  function drawShooters() {
    for (const s of shooters) {
      const alpha = Math.pow(s.life, 2);
      const tx = s.x - s.vx / s.speed * s.len;
      const ty = s.y - s.vy / s.speed * s.len;
      const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
      grad.addColorStop(0,    `rgba(255,255,255,${(alpha * .95).toFixed(3)})`);
      grad.addColorStop(0.15, `rgba(200,220,255,${(alpha * .6).toFixed(3)})`);
      grad.addColorStop(1,    'rgba(180,200,255,0)');
      ctx.save();
      ctx.strokeStyle = grad; ctx.lineWidth = s.width * alpha;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8; ctx.shadowColor = `rgba(200,220,255,${(alpha * .4).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.restore();
    }
  }

  // ── SUN (project pages only) ──────────────────────────────────────────────
  function drawSun(t, c) {
    const px = W * SUN.wx - c.x * SUN.parallax;
    const py = H * SUN.wy - c.y * SUN.parallax;
    const r  = SUN.r;

    ctx.save();

    // Atmosphere
    const atmo = ctx.createRadialGradient(px, py, r * .5, px, py, r * 9);
    atmo.addColorStop(0,   'rgba(255,200,80,.04)');
    atmo.addColorStop(.3,  'rgba(255,160,40,.022)');
    atmo.addColorStop(1,   'transparent');
    ctx.fillStyle = atmo;
    ctx.beginPath(); ctx.arc(px, py, r * 9, 0, Math.PI * 2); ctx.fill();

    // Corona
    for (let i = 0; i < SUN.coronaRays; i++) {
      const ang   = (Math.PI * 2 / SUN.coronaRays) * i + .04 * Math.sin(t * .0008 + i * 1.3);
      const inner = r * 1.1;
      const outer = r * (2.2 + .5 * Math.sin(t * .0006 + i * .7));
      const al    = (.08 + .05 * Math.sin(t * .001 + i * .9)).toFixed(3);
      const rg    = ctx.createLinearGradient(
        px + Math.cos(ang) * inner, py + Math.sin(ang) * inner,
        px + Math.cos(ang) * outer, py + Math.sin(ang) * outer
      );
      rg.addColorStop(0, `rgba(255,210,100,${al})`);
      rg.addColorStop(1, 'transparent');
      ctx.strokeStyle = rg; ctx.lineWidth = 2 + 3 * Math.sin(t * .0005 + i);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(ang) * inner, py + Math.sin(ang) * inner);
      ctx.lineTo(px + Math.cos(ang) * outer, py + Math.sin(ang) * outer);
      ctx.stroke();
    }

    // Mid glow
    const mg = ctx.createRadialGradient(px, py, r * .3, px, py, r * 2.5);
    mg.addColorStop(0,   'rgba(255,230,140,.22)');
    mg.addColorStop(.4,  'rgba(255,180,60,.1)');
    mg.addColorStop(1,   'transparent');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(px, py, r * 2.5, 0, Math.PI * 2); ctx.fill();

    // Disk
    const dk = ctx.createRadialGradient(px - r * .25, py - r * .25, r * .05, px, py, r);
    dk.addColorStop(0,   'rgba(255,255,220,1)');
    dk.addColorStop(.35, 'rgba(255,230,120,1)');
    dk.addColorStop(.7,  'rgba(255,180,40,1)');
    dk.addColorStop(1,   'rgba(220,100,20,.9)');
    ctx.fillStyle = dk;
    ctx.shadowBlur = 60; ctx.shadowColor = 'rgba(255,180,60,.6)';
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Limb darkening
    const lb = ctx.createRadialGradient(px, py, r * .6, px, py, r);
    lb.addColorStop(0, 'transparent'); lb.addColorStop(1, 'rgba(160,60,0,.35)');
    ctx.fillStyle = lb;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();

    // Lens flares
    const fd = { x: .5 - SUN.wx, y: .5 - SUN.wy };
    for (const f of [
      { t: .15, r: 6,  a: .18 }, { t: .30, r: 14, a: .10 },
      { t: .50, r: 22, a: .14 }, { t: .65, r: 8,  a: .08 },
      { t: .85, r: 35, a: .07 }, { t: 1.10, r: 18, a: .09 },
    ]) {
      const fx = px + fd.x * W * f.t, fy = py + fd.y * H * f.t;
      const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r);
      fg.addColorStop(0, `rgba(255,240,200,${f.a})`);
      fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(fx, fy, f.r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  // ── NEBULAE ───────────────────────────────────────────────────────────────
  function drawNebulae(c) {
    for (const n of NEBULA_CFG) {
      const px = n.wx * W - c.x * n.parallax;
      const py = n.wy * H - c.y * n.parallax;
      const rx = n.rx * W, ry = n.ry * H;
      const r  = Math.max(rx, ry);
      ctx.save(); ctx.scale(rx / r, ry / r);
      const sx = px * (r / rx), sy = py * (r / ry);
      const g  = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, n.c0); g.addColorStop(.5, n.c1); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // ── STARS ─────────────────────────────────────────────────────────────────
  const TINTS = [null, [200, 220, 255], [255, 220, 180]];

  function drawLayers(t, c) {
    for (const layer of layers) {
      for (const s of layer.stars) {
        const sx = W / 2 + s.wx - c.x * layer.cfg.parallax;
        const sy = H / 2 + s.wy - c.y * layer.cfg.parallax;
        const pad = s.r * 4;
        if (sx < -pad || sx > W + pad || sy < -pad || sy > H + pad) continue;

        const a   = s.base * (0.45 + 0.55 * Math.sin(t * s.speed + s.phase));
        const col = TINTS[s.tint];
        ctx.globalAlpha = a;

        if (s.r > 1.5) {
          const spike = s.r * 4;
          const sa    = a * 0.35;
          const rgb   = col ? `${col[0]},${col[1]},${col[2]}` : '255,255,255';
          for (const [x1, y1, x2, y2, w, h] of [
            [sx - spike, sy, sx + spike, sy, spike * 2, 1],
            [sx, sy - spike, sx, sy + spike, 1, spike * 2],
          ]) {
            const sg = ctx.createLinearGradient(x1, y1, x2, y2);
            sg.addColorStop(0, 'transparent');
            sg.addColorStop(.5, `rgba(${rgb},${sa.toFixed(3)})`);
            sg.addColorStop(1, 'transparent');
            ctx.fillStyle = sg; ctx.fillRect(x1, y1, w, h);
          }
          ctx.shadowBlur  = s.r * 5;
          ctx.shadowColor = col ? `rgb(${col[0]},${col[1]},${col[2]})` : 'white';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = col ? `rgb(${col[0]},${col[1]},${col[2]})` : 'white';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── PROJECT PAGE DRAG (only when no universe canvas) ──────────────────────
  if (IS_PROJECT) {
    function onDown(e) {
      drag.active = true;
      drag.sx = e.clientX ?? e.touches?.[0].clientX;
      drag.sy = e.clientY ?? e.touches?.[0].clientY;
      drag.cx = cam.x; drag.cy = cam.y;
      vel.x = vel.y = 0;
      canvas.style.cursor = 'grabbing';
    }
    function onMove(e) {
      if (!drag.active) return;
      const mx = e.clientX ?? e.touches?.[0].clientX;
      const my = e.clientY ?? e.touches?.[0].clientY;
      const prevX = cam.x, prevY = cam.y;
      cam.x = drag.cx - (mx - drag.sx);
      cam.y = drag.cy - (my - drag.sy);
      vel.x = cam.x - prevX; vel.y = cam.y - prevY;
    }
    function onUp() { drag.active = false; canvas.style.cursor = 'default'; }
    canvas.addEventListener('mousedown',  onDown);
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mouseup',    onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    canvas.addEventListener('touchmove',  onMove, { passive: true });
    canvas.addEventListener('touchend',   onUp);
  }

  // ── MAIN LOOP ─────────────────────────────────────────────────────────────
  function loop(t) {
    const c = getCam();

    if (!drag.active && IS_PROJECT) {
      cam.x += vel.x; cam.y += vel.y;
      vel.x *= 0.92;  vel.y *= 0.92;
    }

    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createRadialGradient(W * .5, H * .3, 0, W * .5, H * .5, Math.max(W, H) * .9);
    bg.addColorStop(0,   '#08062a');
    bg.addColorStop(.4,  '#04041a');
    bg.addColorStop(1,   '#02020e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    drawNebulae(c);
    if (IS_PROJECT) drawSun(t, c);
    drawLayers(t, c);
    updateShooters();
    drawShooters();

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  nextShooter = Date.now() + 800;
  requestAnimationFrame(loop);
})();
