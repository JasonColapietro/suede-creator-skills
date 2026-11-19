// Decorative layer for <canvas id="audit-glyphs" aria-hidden="true"> inside the hero.
// Give the canvas position:absolute, inset:0, width/height:100% and pointer-events:none.
(() => {
  const canvas = document.getElementById('audit-glyphs');
  if (!canvas) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)');
  const host = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!ctx || !host) return;

  // Each small stamp contains a different mixture of dots, rings and stepped squares.
  const stamp = document.createElement('canvas');
  const side = 66;
  stamp.width = stamp.height = side;
  const ink = stamp.getContext('2d');
  if (!ink) return;
  ink.fillStyle = ink.strokeStyle = '#268365';
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 11; col++) {
      const seed = (row * 29 + col * 37 + row * col * 11) % 97;
      if (seed < 13) continue;
      const x = col * 6 + 3;
      const y = row * 6 + 3;
      ink.globalAlpha = 0.35 + seed / 160;
      if (seed % 3 === 0) {
        ink.fillRect(x - 1.5, y - 1.5, 2, 2);
        ink.fillRect(x, y, 2, 2);
      } else {
        ink.beginPath();
        ink.arc(x, y, seed % 3 === 1 ? 0.95 : 1.5, 0, 2 * Math.PI);
        if (seed % 3 === 1) ink.fill();
        else ink.stroke();
      }
    }
  }

  const tilePattern = ctx.createPattern(stamp, 'repeat');
  const still = document.createElement('canvas');
  const paper = still.getContext('2d');
  if (!tilePattern || !paper) return;

  function drawStill() {
    if (motion.matches && width && height) ctx.drawImage(still, 0, 0, width, height);
  }

  const trail = [];
  const duration = 700;
  let width = 0;
  let height = 0;
  let scale = 1;
  let frame = 0;
  let previous = null;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    trail.length = 0;
    previous = null;
    ctx.clearRect(0, 0, width, height);
    drawStill();
  }

  function resize() {
    reset();
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    still.width = Math.max(1, Math.round(width));
    still.height = Math.max(1, Math.round(height));
    paper.globalAlpha = 0.048;
    paper.fillStyle = paper.createPattern(stamp, 'repeat');
    paper.fillRect(0, 0, width, height);
    // Fade the mark field towards the navigation, type and heap.
    const fade = paper.createLinearGradient(0, 0, 0, Math.max(height, 1));
    fade.addColorStop(0, 'transparent');
    fade.addColorStop(0.32, 'black');
    fade.addColorStop(0.72, 'black');
    fade.addColorStop(1, 'transparent');
    paper.globalAlpha = 1;
    paper.globalCompositeOperation = 'destination-in';
    paper.fillStyle = fade;
    paper.fillRect(0, 0, width, height);
    drawStill();
  }

  function paint(now) {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    while (trail.length && now - trail[0].time >= duration) trail.shift();
    if (!trail.length) {
      drawStill();
      return;
    }

    // Use a fading soft brush as a mask for the cached grid. Only pointer activity
    // schedules frames. The last frame restores the cached still field.
    for (const point of trail) {
      const life = 1 - Math.max(0, now - point.time) / duration;
      const radius = 12 + (1 - life) * 8;
      const brush = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      brush.addColorStop(0, 'rgba(0,0,0,' + (0.44 * life * life) + ')');
      brush.addColorStop(1, 'transparent');
      ctx.fillStyle = brush;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    }
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = tilePattern;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-over';
    drawStill();
    ctx.globalCompositeOperation = 'source-over';
    frame = requestAnimationFrame(paint);
  }

  function move(event) {
    if (!motion.matches || event.pointerType === 'touch' || document.hidden) return;
    const rect = canvas.getBoundingClientRect();
    if (!width || rect.width !== width || rect.height !== height) resize();
    const point = {x: event.clientX - rect.left, y: event.clientY - rect.top, time: performance.now()};
    if (previous) {
      const dx = point.x - previous.x;
      const dy = point.y - previous.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 4) return;
      if (distance < 140) {
        const steps = Math.ceil(distance / 8);
        for (let i = 1; i < steps; i++) {
          trail.push({x: previous.x + dx * i / steps, y: previous.y + dy * i / steps, time: point.time});
        }
      }
    }
    trail.push(point);
    if (trail.length > 90) trail.splice(0, trail.length - 90);
    previous = point;
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function update() {
    host.removeEventListener('pointermove', move);
    if (motion.matches) {
      resize();
      host.addEventListener('pointermove', move, {passive: true});
    } else reset();
  }

  update();
  motion.addEventListener('change', update);
  host.addEventListener('pointerleave', () => { previous = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  window.addEventListener('pagehide', reset);
})();

document.getElementById("engine-pile")?.addEventListener("audit:platform", (event) => {
  const brief = document.getElementById("workflow-brief");
  if (!brief || brief.form?.hidden || !event.detail?.name) return;
  brief.value = `Find skills for a workflow that uses ${event.detail.name}`;
  brief.focus();
});
