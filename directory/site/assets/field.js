// Each tile is a published Suede catalog category or publisher. Matter supplies
// contacts and sleeping bodies; the scene, pointer controls and drawing are local.
export function startField(items) {
  const layer = document.querySelector("#publisher-field");
  const background = document.querySelector("#dot-field");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const { Engine, Bodies, Body, World, Sleeping, Constraint } = window.Matter;
  let width,
    height,
    size,
    engine,
    tiles,
    animation,
    held,
    joint,
    start,
    last,
    lastDotFrame;
  let lastWidth = 0,
    lastHeight = 0,
    dotContext,
    dotScale,
    resizeTimer;
  const pointer = { x: -1000, y: -1000 };

  function drawDots(t) {
    const ctx = dotContext;
    ctx.clearRect(0, 0, width, height);
    // Paint a low-resolution repeating point field. Sparse interference bands
    // drift under the icon pile; drawing pauses when the tab is hidden.
    for (let y = 8; y < height; y += 7) {
      const vertical = Math.sin((Math.PI * y) / height);
      for (let x = 2; x < width; x += 7) {
        const wave = Math.sin(
          x * 0.01 + Math.sin(y * 0.009 + t * 0.13) * 2.6 + t * 0.12,
        );
        const band = ((wave + 1) / 2) * Math.pow(vertical, 0.65);
        if (band < 0.11) continue;
        ctx.fillStyle = "rgba(73,130,133," + Math.min(0.37, band * 0.33) + ")";
        ctx.fillRect(
          x + Math.sin(y * 0.055 + x * 0.016) * 1.5,
          y,
          0.7 + band * 1.25,
          0.7 + band * 1.25,
        );
      }
    }
  }
  function render(time) {
    if (!last) last = time - 16;
    if (!reduced.matches)
      Engine.update(engine, Math.max(6, Math.min(1000 / 30, time - last)));
    last = time;
    if (time - lastDotFrame > 120) {
      drawDots(time / 1000);
      lastDotFrame = time;
    }
    for (const { el, body } of tiles) {
      el.style.transform =
        "translate3d(" +
        (body.position.x - size / 2).toFixed(1) +
        "px," +
        (body.position.y - size / 2).toFixed(1) +
        "px,0) rotate(" +
        body.angle.toFixed(3) +
        "rad)";
    }
    if (!reduced.matches) animation = requestAnimationFrame(render);
  }
  function stopDrag() {
    if (joint) World.remove(engine.world, joint);
    held = joint = null;
  }
  function build() {
    const nextWidth = layer.clientWidth,
      nextHeight = layer.clientHeight;
    if (
      width === nextWidth &&
      height === nextHeight &&
      engine &&
      !reduced.matches
    )
      return;
    cancelAnimationFrame(animation);
    if (engine) {
      stopDrag();
      Engine.clear(engine);
      World.clear(engine.world);
    }
    width = nextWidth;
    height = nextHeight;
    const mobile = width < 640;
    size = mobile ? 15 : Math.min(28, Math.round(height * 0.033));
    const count = Math.min(
      253,
      Math.max(95, Math.round(width * (mobile ? 0.45 : 0.2))),
    );
    engine = Engine.create({
      enableSleeping: true,
      positionIterations: 5,
      velocityIterations: 4,
      gravity: { x: 0, y: 1.12 },
    });
    World.add(engine.world, [
      Bodies.rectangle(width / 2, height + 26, width + 120, 52, {
        isStatic: true,
      }),
      Bodies.rectangle(-22, height / 2, 44, height * 5, { isStatic: true }),
      Bodies.rectangle(width + 22, height / 2, 44, height * 5, {
        isStatic: true,
      }),
    ]);
    layer.replaceChildren();
    tiles = [];
    last = 0;
    lastDotFrame = -1000;
    for (let i = 0; i < count; i++) {
      const item = items[i % items.length];
      const el = document.createElement("a"),
        img = document.createElement("img");
      el.className = "publisher-tile";
      el.href = item.href;
      el.title = item.name;
      el.tabIndex = -1;
      el.style.width = el.style.height = size + "px";
      img.src = item.icon;
      img.alt = "";
      el.append(img);
      layer.append(el);
      const cols = Math.max(1, Math.floor(width / size));
      const x = reduced.matches
        ? ((i % cols) + 0.5) * size
        : size / 2 + Math.random() * (width - size);
      const y = reduced.matches
        ? height - (Math.floor(i / cols) + 0.5) * size
        : -42 - Math.random() * height * 1.8;
      const body = Bodies.rectangle(x, y, size - 1, size - 1, {
        chamfer: { radius: size * 0.17 },
        angle: (Math.random() - 0.5) * 0.9,
        restitution: 0.32,
        friction: 0.42,
        frictionAir: 0.001,
        sleepThreshold: 42,
      });
      World.add(engine.world, body);
      tiles.push({ el, body });
      el.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || reduced.matches) return;
        start = { x: e.clientX, y: e.clientY, moved: false };
        held = body;
        Sleeping.set(body, false);
        el.setPointerCapture(e.pointerId);
        joint = Constraint.create({
          pointA: { x: e.clientX, y: e.clientY },
          bodyB: body,
          pointB: {
            x: e.clientX - body.position.x,
            y: e.clientY - body.position.y,
          },
          stiffness: 0.45,
          damping: 0.12,
          length: 0,
        });
        World.add(engine.world, joint);
      });
      el.addEventListener("click", (e) => {
        if (start?.moved) {
          e.preventDefault();
          start = null;
        }
      });
    }
    dotScale = Math.min(devicePixelRatio, 1.5) || 1;
    background.width = Math.round(width * dotScale);
    background.height = Math.round(height * dotScale);
    dotContext = background.getContext("2d");
    dotContext.scale(dotScale, dotScale);
    render(performance.now());
  }
  window.addEventListener("pointermove", (e) => {
    if (joint) {
      joint.pointA.x = e.clientX;
      joint.pointA.y = e.clientY;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5)
        start.moved = true;
    } else if (
      !reduced.matches &&
      e.pointerType === "mouse" &&
      pointer.x >= 0
    ) {
      const vx = Math.max(-18, Math.min(18, e.clientX - pointer.x)),
        vy = Math.max(-18, Math.min(18, e.clientY - pointer.y));
      if (Math.abs(vx) + Math.abs(vy) > 3)
        for (const { body } of tiles) {
          if (
            Math.hypot(
              e.clientX - body.position.x,
              e.clientY - body.position.y,
            ) >
            size * 1.8
          )
            continue;
          Sleeping.set(body, false);
          Body.setVelocity(body, {
            x: 0.62 * vx,
            y: Math.min(-3, 0.6 * vy - 5),
          });
        }
    }
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
  window.addEventListener("resize", () => {
    if (lastWidth === innerWidth && Math.abs(lastHeight - innerHeight) < 120)
      return;
    lastWidth = innerWidth;
    lastHeight = innerHeight;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 140);
  });
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(animation);
    last = 0;
    if (!document.hidden && !reduced.matches)
      animation = requestAnimationFrame(render);
  });
  reduced.addEventListener("change", () => {
    width = 0;
    build();
  });
  lastWidth = innerWidth;
  lastHeight = innerHeight;
  build();
}
