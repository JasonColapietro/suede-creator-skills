(() => {
  const pile = document.getElementById("engine-pile");
  const script = document.currentScript;
  if (!pile || !script?.src || pile.dataset.ready) return;
  pile.dataset.ready = "true";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const icons = [
    ["google", "Google"],
    ["openai", "ChatGPT"],
    ["googlegemini", "Gemini"],
    ["perplexity", "Perplexity"],
    ["reddit", "Reddit"],
    ["claude", "Claude"],
    ["googlemaps", "Google Maps"],
    ["bluesky", "Bluesky"],
    ["youtube", "YouTube"],
    ["duckduckgo", "DuckDuckGo"],
    ["mistralai", "Mistral AI"],
    ["instagram", "Instagram"],
    ["meta", "Meta"],
    ["shopify", "Shopify"],
    ["wikipedia", "Wikipedia"],
    ["trustpilot", "Trustpilot"],
    ["deepseek", "DeepSeek"],
    ["yelp", "Yelp"],
    ["pinterest", "Pinterest"],
    ["anthropic", "Anthropic"],
    ["googleanalytics", "Google Analytics"],
    ["wordpress", "WordPress"],
    ["facebook", "Facebook"],
    ["quora", "Quora"],
    ["googlenews", "Google News"],
    ["huggingface", "Hugging Face"],
    ["brave", "Brave"],
    ["medium", "Medium"],
    ["tiktok", "TikTok"],
    ["semrush", "Semrush"],
    ["github", "GitHub"],
    ["qwant", "Qwant"],
    ["mastodon", "Mastodon"],
    ["ecosia", "Ecosia"],
    ["discord", "Discord"],
    ["googlesearchconsole", "Google Search Console"],
    ["baidu", "Baidu"],
    ["tripadvisor", "Tripadvisor"]  ];
  const atlas = new URL("platforms.svg", script.src);
  const ns = "http://www.w3.org/2000/svg";
  const entries = [];
  let engine;
  let frame = 0;
  let last = 0;
  let remaining = 0;
  let visible = false;
  let resizeTimer;
  let drag;
  let matterLibrary;

  function makeTile(index, size) {
    const [id, name] = icons[index % icons.length];
    const tile = document.createElement("span");
    tile.className = "discovery-tile";
    tile.title = name;
    tile.style.setProperty("--tile-size", size + "px");
    const svg = document.createElementNS(ns, "svg");
    const use = document.createElementNS(ns, "use");
    use.setAttribute("href", atlas.href + "#" + id);
    svg.append(use);
    tile.append(svg);
    pile.append(tile);
    return { tile, name, size };
  }

  function render(entry, x, y, angle) {
    entry.tile.style.transform = `translate3d(${x - entry.size / 2}px,${y - entry.size / 2}px,0) rotate(${angle}rad)`;
  }

  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || !engine) return;
    const elapsed = last ? Math.min(1000 / 60, now - last) : 1000 / 60;
    last = now;
    const { Engine, Composite, Body } = window.Matter;
    entries.forEach((entry) => {
      if (!entry.added && now > entry.start) {
        Composite.add(engine.world, entry.body);
        entry.added = true;
        entry.tile.hidden = false;
      }
    });
    if (drag?.moved) {
      const { body } = drag.entry;
      Body.setVelocity(body, {
        x: Math.max(-22, Math.min(22, (drag.x - body.position.x) * .24)),
        y: Math.max(-22, Math.min(22, (drag.y - body.position.y) * .24)),
      });
    }
    Engine.update(engine, elapsed);
    for (const entry of entries) {
      if (entry.added && !entry.body.isSleeping) {
        const { position, angle } = entry.body;
        render(entry, position.x, position.y, angle);
      }
    }
    if (--remaining > 0 || drag?.moved) frame = requestAnimationFrame(tick);
    else last = 0;
  }

  function wake(budget = 180) {
    remaining = Math.max(remaining, budget);
    if (!frame && visible && !document.hidden && engine) frame = requestAnimationFrame(tick);
  }

  function arrange(animate) {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    drag = undefined;
    engine = undefined;
    entries.length = 0;
    pile.replaceChildren();
    const width = pile.clientWidth;
    const height = pile.clientHeight;
    const pitch = width < 620 ? 32 : 35;
    const columns = Math.max(1, Math.floor(width / pitch));
    const tiers = width < 620 ? 3 : 4;
    const count = Math.min(columns * tiers, 152);
    if (animate) {
      const { Engine, Composite, Bodies } = window.Matter;
      engine = Engine.create({ enableSleeping: true, positionIterations: 7 });
      engine.gravity.y = 1.45;
      const wall = { isStatic: true, friction: .85 };
      Composite.add(engine.world, [
        Bodies.rectangle(width / 2, height + 16, width + 120, 40, wall),
        Bodies.rectangle(-20, height / 2, 40, height * 2, wall),
        Bodies.rectangle(width + 20, height / 2, 40, height * 2, wall),
      ]);
    }
    const now = performance.now();
    for (let index = 0; index < count; index++) {
      const size = pitch - 5 + index % 6;
      const entry = makeTile(index, size);
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = (col + .5) * width / columns + Math.sin(index * 2.4) * 4;
      const y = height - pitch * (.35 + row) + Math.cos(index * .68) * (4 + row);
      const angle = Math.sin(index * 1.9) * .31;
      render(entry, x, y, angle);
      if (animate) {
        entry.body = window.Matter.Bodies.rectangle(x, y - 155 - (index % 12) * 7, size - 2, size - 2, {
          angle, chamfer: { radius: 4 }, restitution: .45, friction: .62, frictionAir: .024,
        });
        entry.tile.hidden = true;
        entry.start = now + index * 6;
      }
      entries.push(entry);
    }
    wake(320);
  }

  function initialize() {
    arrange(false);
    if (reducedMotion.matches || !visible) return;
    matterLibrary ??= new Promise((resolve, reject) => {
      const library = document.createElement("script");
      library.src = new URL("matter.min.js", script.src).href;
      library.onload = resolve;
      library.onerror = reject;
      document.head.append(library);
    });
    matterLibrary.then(() => {
      if (visible && !reducedMotion.matches && !engine) arrange(true);
    }).catch(() => {});
  }

  pile.addEventListener("pointerdown", (event) => {
    const entry = entries.find(({ tile }) => tile === event.target);
    if (!entry || !event.isPrimary || event.button !== 0) return;
    const bounds = pile.getBoundingClientRect();
    drag = { entry, id: event.pointerId, x: event.clientX - bounds.left, y: event.clientY - bounds.top, startX: event.clientX, startY: event.clientY, moved: false };
    entry.tile.setPointerCapture(event.pointerId);
  });
  pile.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId || !engine) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
    const bounds = pile.getBoundingClientRect();
    drag.moved = true;
    drag.x = event.clientX - bounds.left;
    drag.y = Math.max(bounds.height - 240, event.clientY - bounds.top);
    window.Matter.Sleeping.set(drag.entry.body, false);
    wake();
  });
  function release(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const { entry, moved } = drag;
    drag = undefined;
    if (event.type === "pointerup" && !moved) {
      pile.dispatchEvent(new CustomEvent("audit:platform", { bubbles: true, detail: { name: entry.name } }));
      if (entry.body) {
        window.Matter.Sleeping.set(entry.body, false);
        window.Matter.Body.setVelocity(entry.body, { x: 0, y: -5 });
        wake();
      }
    }
  }
  pile.addEventListener("pointerup", release);
  pile.addEventListener("pointercancel", release);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
  reducedMotion.addEventListener("change", initialize);

  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !engine) initialize();
    if (visible) wake();
  });
  view.observe(pile);

  let size = "";
  new ResizeObserver(() => {
    const nextSize = pile.clientWidth + "x" + pile.clientHeight;
    if (size === nextSize) return;
    size = nextSize;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.Matter && !reducedMotion.matches && visible && !engine) arrange(true);
      else if (window.Matter && engine && !reducedMotion.matches) arrange(true);
      else initialize();
    }, 120);
  }).observe(pile);
})();
