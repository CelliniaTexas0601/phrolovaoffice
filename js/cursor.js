/**
 * 清宵主题光标特效 — 仙侠剑客美学
 * 冰蓝气动能量 · 剑光火花 · 丝带飘逸 · 星尘花瓣
 */
(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  
  if (isTouch) return;
  
  document.body.classList.add("has-cursor-fx");

  // ═══════════════════════════════════════════════════════════════════════════
  // 配置
  // ═══════════════════════════════════════════════════════════════════════════
  const CONFIG = {
    // 粒子上限 (性能)
    maxTrailPoints: 25,
    maxParticles: prefersReducedMotion ? 0 : 60,
    maxRippleRings: 5,
    maxSparks: prefersReducedMotion ? 0 : 12,
    
    // 颜色
    colors: {
      ice: { r: 91, g: 196, b: 212 },       // 冰蓝
      iceLight: { r: 200, g: 235, b: 242 }, // 浅冰蓝
      gold: { r: 212, g: 192, b: 136 },     // 金色
      white: { r: 255, g: 255, b: 255 },    // 白色
      teal: { r: 58, g: 180, b: 196 },      // 深青
    },
    
    // 动画速度
    trailDecay: 0.045,
    particleDecay: 0.02,
    sparkDecay: 0.04,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DOM 元素
  // ═══════════════════════════════════════════════════════════════════════════
  const canvas = document.createElement("canvas");
  canvas.className = "cursor-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);

  // 剑光内核
  const swordCore = document.createElement("div");
  swordCore.className = "cursor-sword-core";
  swordCore.setAttribute("aria-hidden", "true");
  document.body.appendChild(swordCore);

  const ctx = canvas.getContext("2d");

  // ═══════════════════════════════════════════════════════════════════════════
  // 状态
  // ═══════════════════════════════════════════════════════════════════════════
  const mouse = { x: -999, y: -999, tx: -999, ty: -999, vx: 0, vy: 0 };
  const ringPos = { x: -999, y: -999 };
  const trailPoints = [];
  const particles = [];
  const ripples = [];
  const sparks = [];
  let width = 0, height = 0, dpr = 1;
  let isHovering = false;
  let lastX = 0, lastY = 0;
  let frameCount = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 工具函数
  // ═══════════════════════════════════════════════════════════════════════════
  function rgba(color, alpha) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(c1, c2, t) {
    return {
      r: Math.round(lerp(c1.r, c2.r, t)),
      g: Math.round(lerp(c1.g, c2.g, t)),
      b: Math.round(lerp(c1.b, c2.b, t)),
    };
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 粒子类型
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 星尘/花瓣粒子
  function createParticle(x, y, type = "dust") {
    if (particles.length >= CONFIG.maxParticles) return;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(0.3, 1.5);
    const size = type === "petal" ? randomRange(2, 4) : randomRange(1, 2.5);
    
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed + mouse.vx * 0.3,
      vy: Math.sin(angle) * speed + mouse.vy * 0.3 - 0.5,
      size,
      life: 1,
      type,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: randomRange(-0.1, 0.1),
    });
  }

  // 剑光火花
  function createSpark(x, y) {
    if (sparks.length >= CONFIG.maxSparks) return;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(2, 5);
    
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      length: randomRange(8, 20),
      angle,
    });
  }

  // 点击涟漪
  function createRipple(x, y) {
    const ringCount = Math.min(3, CONFIG.maxRippleRings);
    for (let i = 0; i < ringCount; i++) {
      ripples.push({
        x, y,
        r: 4 + i * 8,
        life: 1,
        delay: i * 0.08,
        type: i === 0 ? "core" : "ring",
      });
    }
    
    // 剑光火花爆发
    if (!prefersReducedMotion) {
      for (let i = 0; i < 8; i++) {
        createSpark(x, y);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Canvas 尺寸
  // ═══════════════════════════════════════════════════════════════════════════
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 事件处理
  // ═══════════════════════════════════════════════════════════════════════════
  function onMove(e) {
    mouse.vx = e.clientX - mouse.tx;
    mouse.vy = e.clientY - mouse.ty;
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    
    // 轨迹点
    if (dist > 3) {
      trailPoints.push({ 
        x: e.clientX, 
        y: e.clientY, 
        life: 1,
        vx: mouse.vx,
        vy: mouse.vy,
      });
      if (trailPoints.length > CONFIG.maxTrailPoints) trailPoints.shift();
      lastX = e.clientX;
      lastY = e.clientY;
    }

    // 移动时产生星尘
    if (!prefersReducedMotion && dist > 8 && Math.random() > 0.6) {
      createParticle(e.clientX, e.clientY, Math.random() > 0.8 ? "petal" : "dust");
    }
  }

  function onClick(e) {
    createRipple(e.clientX, e.clientY);
    ring.classList.add("is-click");
    swordCore.classList.add("is-flash");
    setTimeout(() => ring.classList.remove("is-click"), 350);
    setTimeout(() => swordCore.classList.remove("is-flash"), 200);
  }

  function onOver(e) {
    const interactive = e.target.closest("a, button, .nav-link, [role='button']");
    isHovering = Boolean(interactive);
    ring.classList.toggle("is-hover", isHovering);
    dot.classList.toggle("is-hover", isHovering);
    
    // 悬停时产生小火花
    if (isHovering && !prefersReducedMotion && Math.random() > 0.5) {
      createSpark(mouse.x, mouse.y);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 绘制函数
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 绘制丝带轨迹
  function drawTrail() {
    if (trailPoints.length < 2) return;

    // 外层柔光 (冰蓝)
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = rgba(CONFIG.colors.ice, 0.08);
    ctx.lineWidth = 12;
    ctx.shadowBlur = 25;
    ctx.shadowColor = rgba(CONFIG.colors.ice, 0.3);

    for (let i = 0; i < trailPoints.length; i++) {
      const p = trailPoints[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = trailPoints[i - 1];
        const cpx = (prev.x + p.x) / 2;
        const cpy = (prev.y + p.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
      }
    }
    ctx.stroke();
    ctx.restore();

    // 主丝带 (冰蓝→金色渐变)
    for (let i = 1; i < trailPoints.length; i++) {
      const prev = trailPoints[i - 1];
      const curr = trailPoints[i];
      const t = i / (trailPoints.length - 1);
      const alpha = Math.min(prev.life, curr.life) * (0.15 + t * 0.85);
      const width = 0.5 + t * 3;

      // 颜色从冰蓝过渡到金色
      const color = lerpColor(CONFIG.colors.teal, CONFIG.colors.gold, t * 0.7);

      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.strokeStyle = rgba(color, alpha * 0.7);
      ctx.lineWidth = width;
      ctx.shadowBlur = 10;
      ctx.shadowColor = rgba(CONFIG.colors.ice, alpha * 0.4);
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();

      // 内核亮线
      ctx.beginPath();
      ctx.strokeStyle = rgba(CONFIG.colors.white, alpha * 0.6);
      ctx.lineWidth = width * 0.3;
      ctx.shadowBlur = 5;
      ctx.shadowColor = rgba(CONFIG.colors.iceLight, alpha * 0.5);
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }

    // 偶尔在轨迹上添加闪烁点
    if (!prefersReducedMotion && frameCount % 3 === 0 && trailPoints.length > 5) {
      const idx = Math.floor(Math.random() * (trailPoints.length - 2)) + 1;
      const p = trailPoints[idx];
      if (p.life > 0.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(CONFIG.colors.white, p.life * 0.8);
        ctx.shadowBlur = 8;
        ctx.shadowColor = rgba(CONFIG.colors.ice, 0.6);
        ctx.fill();
      }
    }
  }

  // 绘制星尘/花瓣粒子
  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === "petal") {
        // 花瓣形状
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(CONFIG.colors.iceLight, p.life * 0.5);
        ctx.shadowBlur = 6;
        ctx.shadowColor = rgba(CONFIG.colors.ice, p.life * 0.4);
        ctx.fill();
      } else {
        // 星尘点
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        const color = Math.random() > 0.5 ? CONFIG.colors.ice : CONFIG.colors.gold;
        ctx.fillStyle = rgba(color, p.life * 0.7);
        ctx.shadowBlur = 8;
        ctx.shadowColor = rgba(color, p.life * 0.5);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 绘制剑光火花
  function drawSparks() {
    for (const s of sparks) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // 火花线条
      const gradient = ctx.createLinearGradient(0, 0, s.length * s.life, 0);
      gradient.addColorStop(0, rgba(CONFIG.colors.white, s.life));
      gradient.addColorStop(0.3, rgba(CONFIG.colors.iceLight, s.life * 0.8));
      gradient.addColorStop(1, rgba(CONFIG.colors.ice, 0));

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s.length * s.life, 0);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = rgba(CONFIG.colors.ice, s.life * 0.6);
      ctx.stroke();

      ctx.restore();
    }
  }

  // 绘制点击涟漪
  function drawRipples() {
    for (const r of ripples) {
      if (r.delay > 0) continue;

      ctx.save();
      ctx.translate(r.x, r.y);

      if (r.type === "core") {
        // 中心核心 - 剑光闪烁
        const coreSize = 15 * (1 - r.life * 0.5);
        
        // 十字剑光
        ctx.beginPath();
        ctx.moveTo(-coreSize, 0);
        ctx.lineTo(coreSize, 0);
        ctx.moveTo(0, -coreSize);
        ctx.lineTo(0, coreSize);
        ctx.strokeStyle = rgba(CONFIG.colors.white, r.life * 0.9);
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = rgba(CONFIG.colors.ice, r.life);
        ctx.stroke();

        // 中心光点
        ctx.beginPath();
        ctx.arc(0, 0, 3 * r.life, 0, Math.PI * 2);
        ctx.fillStyle = rgba(CONFIG.colors.white, r.life);
        ctx.fill();
      } else {
        // 外圈涟漪
        ctx.beginPath();
        ctx.arc(0, 0, r.r, 0, Math.PI * 2);
        
        // 双色涟漪
        ctx.strokeStyle = rgba(CONFIG.colors.ice, r.life * 0.5);
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = rgba(CONFIG.colors.ice, r.life * 0.4);
        ctx.stroke();

        // 金色内环
        ctx.beginPath();
        ctx.arc(0, 0, r.r * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(CONFIG.colors.gold, r.life * 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // 绘制悬停时的能量场
  function drawHoverField() {
    if (!isHovering) return;

    const pulse = Math.sin(frameCount * 0.1) * 0.3 + 0.7;
    
    // 环形能量场
    ctx.save();
    ctx.translate(ringPos.x, ringPos.y);

    // 外圈光晕
    ctx.beginPath();
    ctx.arc(0, 0, 28 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(CONFIG.colors.ice, 0.15 * pulse);
    ctx.lineWidth = 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = rgba(CONFIG.colors.ice, 0.3);
    ctx.stroke();

    // 旋转的能量弧线
    const arcCount = 3;
    for (let i = 0; i < arcCount; i++) {
      const angle = (frameCount * 0.02) + (i * Math.PI * 2 / arcCount);
      ctx.beginPath();
      ctx.arc(0, 0, 22, angle, angle + Math.PI * 0.4);
      ctx.strokeStyle = rgba(CONFIG.colors.gold, 0.25 * pulse);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 主循环
  // ═══════════════════════════════════════════════════════════════════════════
  function tick() {
    frameCount++;

    // 插值光标位置
    ringPos.x += (mouse.tx - ringPos.x) * 0.1;
    ringPos.y += (mouse.ty - ringPos.y) * 0.1;

    // 更新 DOM 元素位置
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    swordCore.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;

    // 清空画布
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 0;

    // 更新轨迹点
    for (let i = trailPoints.length - 1; i >= 0; i--) {
      trailPoints[i].life -= CONFIG.trailDecay;
      if (trailPoints[i].life <= 0) trailPoints.splice(i, 1);
    }

    // 更新粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // 轻微重力
      p.vx *= 0.98; // 阻力
      p.rotation += p.rotationSpeed;
      p.life -= CONFIG.particleDecay;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // 更新火花
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.92;
      s.vy *= 0.92;
      s.life -= CONFIG.sparkDecay;
      if (s.life <= 0) sparks.splice(i, 1);
    }

    // 更新涟漪
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      if (r.delay > 0) {
        r.delay -= 0.016;
        continue;
      }
      r.r += r.type === "core" ? 1.5 : 3;
      r.life -= 0.03;
      if (r.life <= 0) ripples.splice(i, 1);
    }

    // 绘制所有元素
    drawTrail();
    if (!prefersReducedMotion) {
      drawParticles();
      drawSparks();
    }
    drawRipples();
    drawHoverField();

    requestAnimationFrame(tick);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 初始化
  // ═══════════════════════════════════════════════════════════════════════════
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mousedown", onClick);
  document.addEventListener("mouseover", onOver, { passive: true });
  requestAnimationFrame(tick);
})();
