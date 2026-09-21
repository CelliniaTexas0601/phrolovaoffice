(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  document.body.classList.add("has-cursor-fx");

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

  const ctx = canvas.getContext("2d");
  const mouse = { x: -999, y: -999, tx: -999, ty: -999 };
  const ringPos = { x: -999, y: -999 };
  const points = [];
  const MAX_POINTS = 20;
  const ripples = [];
  let width = 0;
  let height = 0;
  let dpr = 1;

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

  function onMove(e) {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const last = points[points.length - 1];
    if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 4) {
      points.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (points.length > MAX_POINTS) points.shift();
    }
  }

  function onClick(e) {
    ripples.push({ x: e.clientX, y: e.clientY, r: 4, life: 1 });
    ring.classList.add("is-click");
    window.setTimeout(() => ring.classList.remove("is-click"), 280);
  }

  function onOver(e) {
    const interactive = e.target.closest("a, button, .nav-link");
    ring.classList.toggle("is-hover", Boolean(interactive));
  }

  function drawTrail() {
    if (points.length < 2) return;

    // 外层柔光 - 金色
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(212, 192, 136, 0.15)";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(212, 192, 136, 0.25)";

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // 主线
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const t = i / (points.length - 1);
      const alpha = Math.min(prev.life, curr.life) * (0.2 + t * 0.8);

      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(212, 192, 136, ${alpha})`;
      ctx.lineWidth = 0.8 + t * 1.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(212, 192, 136, ${alpha * 0.6})`;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();

      // 核心亮线
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 0.3 + t * 0.4;
      ctx.shadowBlur = 0;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }
  }

  function tick() {
    ringPos.x += (mouse.tx - ringPos.x) * 0.12;
    ringPos.y += (mouse.ty - ringPos.y) * 0.12;

    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 0;

    for (let i = points.length - 1; i >= 0; i--) {
      points[i].life -= 0.04;
      if (points[i].life <= 0) points.splice(i, 1);
    }

    drawTrail();

    // 点击涟漪
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += 2.5;
      r.life -= 0.035;
      if (r.life <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.strokeStyle = `rgba(212, 192, 136, ${r.life * 0.4})`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(212, 192, 136, ${r.life * 0.3})`;
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mousedown", onClick);
  document.addEventListener("mouseover", onOver);
  requestAnimationFrame(tick);
})();
