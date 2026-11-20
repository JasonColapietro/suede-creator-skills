import * as THREE from './three/three.module.min.js';
import { RoomEnvironment } from './three/RoomEnvironment.js';

// Form a continuous beveled rim from an outline and a reverse-wound aperture.
function contour(width, height, radius, inside) {
  const path = inside ? new THREE.Path() : new THREE.Shape();
  const x = width / 2, y = height / 2;
  const sign = inside ? -1 : 1;
  path.moveTo(sign * (x - radius), y);
  path.lineTo(sign * (-x + radius), y);
  path.quadraticCurveTo(-sign * x, y, -sign * x, y - radius);
  path.lineTo(-sign * x, -y + radius);
  path.quadraticCurveTo(-sign * x, -y, sign * (-x + radius), -y);
  path.lineTo(sign * (x - radius), -y);
  path.quadraticCurveTo(sign * x, -y, sign * x, -y + radius);
  path.lineTo(sign * x, y - radius);
  path.quadraticCurveTo(sign * x, y, sign * (x - radius), y);
  return path;
}

function rim(outer, inner, depth, bevel) {
  const profile = contour(outer, outer, .245, false);
  profile.holes.push(contour(inner, inner - .14, .16, true));
  const geometry = new THREE.ExtrudeGeometry(profile, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
    bevelSegments: 5, curveSegments: 18
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function addBrand(group, brandImage) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const ink = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, depthWrite: false, color: 0xffffff
  });
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(.58, .145), ink);
  stamp.position.set(-.68, 1.075, .087);
  group.add(stamp);
  const paint = () => {
    context.clearRect(0, 0, 512, 128);
    let textX = 8;
    if (brandImage?.naturalWidth) {
      context.drawImage(brandImage, 0, 6, 112, 112);
      context.globalCompositeOperation = 'source-in';
      context.fillStyle = '#54615b';
      context.fillRect(0, 0, 112, 128);
      context.globalCompositeOperation = 'source-over';
      textX = 115;
    }
    context.fillStyle = '#59635f';
    context.font = '600 89px Inter, Arial, sans-serif';
    context.textBaseline = 'middle';
    context.fillText('Suede', textX, 70);
    texture.needsUpdate = true;
  };
  paint();
  if (brandImage && !brandImage.complete) brandImage.addEventListener('load', paint, { once: true });
  document.fonts.ready.then(paint);
}

export function mountModel(host, context, canvas) {
  const output = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  output.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  output.setClearColor(0, 0);
  output.toneMapping = THREE.ACESFilmicToneMapping;
  output.toneMappingExposure = 1.1;
  canvas.className = 'gateway-webgl';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Suede glass gateway. Drag or use the arrow keys to rotate. Press Home to reset.');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, .1, 60);
  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(output);
  const reflections = generator.fromScene(room, .035);
  scene.environment = reflections.texture;
  scene.environmentIntensity = .68;
  generator.dispose();
  room.dispose();

  const ambient = new THREE.HemisphereLight(0xffffff, 0x798780, 1.15);
  scene.add(ambient);
  for (const [x, y, z, strength, color] of [[1, 3, 6, 2.9, 0xfffcf7], [5, 0, 4, 1.3, 0xffffff], [-3, 2, -4, 2.4, 0xd2f7e8]]) {
    const lamp = new THREE.DirectionalLight(color, strength);
    lamp.position.set(x, y, z);
    scene.add(lamp);
  }

  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const porcelain = new THREE.MeshPhysicalMaterial({
    color: 0xf9faf8, metalness: .27, roughness: .22, clearcoat: 1, clearcoatRoughness: .17
  });
  const bevel = new THREE.MeshPhysicalMaterial({
    color: 0xecf0ee, metalness: .78, roughness: .18, clearcoat: .85
  });
  const trim = new THREE.MeshStandardMaterial({ color: 0xe2ede8, metalness: 1, roughness: .13 });
  const face = new THREE.Group();
  face.add(new THREE.Mesh(rim(2.6, 1.83, .12, .021), [porcelain, bevel]));
  addBrand(face, document.querySelector('.hcore img, .navwrap .brand img, .nav-logo img'));
  face.position.z = .66;
  sculpture.add(face);
  const back = new THREE.Mesh(rim(2.6, 1.83, .075, .018), [porcelain, bevel]);
  back.position.z = -.84;
  sculpture.add(back);

  const panels = [];
  const plate = rim(2.6, 1.97, .085, .014);
  const edge = contour(2.627, 2.627, .245, false);
  edge.holes.push(contour(2.59, 2.59, .224, true));
  const edgeGeometry = new THREE.ExtrudeGeometry(edge, { depth: .009, bevelEnabled: false, curveSegments: 16 });
  const indicator = new THREE.BoxGeometry(.035, .023, .07);
  for (let i = 0; i < 6; i++) {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8ebcaf, roughness: .06, metalness: 0, transmission: .93, thickness: .17,
      ior: 1.48, attenuationColor: 0x286655, attenuationDistance: .55, clearcoat: 1,
      emissive: 0x59bb96, emissiveIntensity: 0
    });
    const layer = new THREE.Group();
    const lip = new THREE.Mesh(edgeGeometry, trim);
    lip.position.z = .038;
    layer.add(new THREE.Mesh(plate, material), lip);
    const light = new THREE.MeshStandardMaterial({ color: 0xabf4d9, emissive: 0x4ab98f, emissiveIntensity: 1 });
    for (const side of [-1, 1]) {
      const point = new THREE.Mesh(indicator, light);
      point.position.set(side * 1.27, -.02, .035);
      layer.add(point);
    }
    const depth = .43 - i * .205;
    layer.position.z = depth;
    sculpture.add(layer);
    panels.push({ layer, material, light, depth, amount: 0 });
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const rotation = { x: .055, y: .52 };
  let drag = null, hoverX = 0, hoverY = 0, rendered = false, visible = true, previousTime = 0;
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    output.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = 11.21 * Math.max(1, .9 / camera.aspect);
    camera.updateProjectionMatrix();
    rendered = false;
  }
  const size = new ResizeObserver(resize);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  size.observe(host);
  observer.observe(host);
  resize();
  sculpture.rotation.set(rotation.x, rotation.y, 0);

  const reset = () => { rotation.x = .055; rotation.y = .52; hoverX = hoverY = 0; rendered = false; };
  canvas.addEventListener('keydown', e => {
    const directions = { ArrowLeft: [-.12, 0], ArrowRight: [.12, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] };
    if (e.key === 'Home') { e.preventDefault(); reset(); }
    if (!directions[e.key]) return;
    e.preventDefault();
    rotation.y += directions[e.key][0];
    rotation.x = Math.max(-.85, Math.min(.85, rotation.x + directions[e.key][1]));
    rendered = false;
  });
  canvas.addEventListener('dblclick', reset);
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0 || host.dataset.intro === 'running') return;
    drag = { x: e.clientX, y: e.clientY, yaw: rotation.y, pitch: rotation.x };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    rotation.y = drag.yaw + (e.clientX - drag.x) * .007;
    rotation.x = Math.max(-.85, Math.min(.85, drag.pitch + (e.clientY - drag.y) * .005));
    rendered = false;
  });
  const hoverArea = host.closest('.hero') || host;
  hoverArea.addEventListener('pointermove', e => {
    if (drag || coarse.matches || reduced.matches) return;
    const box = host.getBoundingClientRect();
    const horizontal = (e.clientX - box.left) / box.width - .5;
    const vertical = (e.clientY - box.top) / box.height - .5;
    const influence = .14 + .86 * Math.exp(-1.3 * (horizontal ** 2 + vertical ** 2));
    hoverY = Math.max(-1, Math.min(1, horizontal)) * influence * .48;
    hoverX = Math.max(-1, Math.min(1, vertical)) * influence * .27;
    rendered = false;
  });
  const clearHover = () => { hoverX = hoverY = 0; };
  hoverArea.addEventListener('pointerleave', clearHover);
  window.addEventListener('blur', clearHover);
  canvas.addEventListener('lostpointercapture', () => { drag = null; });
  const target = host.querySelector('.gateway-model') || host;
  target.append(canvas);

  function tick(now, intro) {
    if (!visible || document.hidden || (reduced.matches && rendered && !intro)) { previousTime = now; return; }
    const dt = Math.min(.06, (now - (previousTime || now)) / 1000);
    previousTime = now;
    const follow = reduced.matches ? 1 : 1 - Math.exp(-8 * dt);
    const extra = intro?.remaining || 0;
    const yaw = rotation.y + (reduced.matches ? 0 : hoverY) + .36 * extra;
    const pitch = rotation.x + (reduced.matches ? 0 : hoverX) - .13 * extra;
    sculpture.rotation.y += (yaw - sculpture.rotation.y) * follow;
    sculpture.rotation.x += (pitch - sculpture.rotation.x) * follow;
    sculpture.scale.setScalar(intro?.scale ?? 1);
    const gap = 1 + (intro?.spread || 0);
    panels.forEach(({ layer, material, light, depth }, i) => {
      const phase = ((now / 1000 + i * .22) % 1.32) / .72;
      const goal = reduced.matches || phase > 1 ? 0 : Math.sin(phase * Math.PI) ** 2;
      panels[i].amount += (goal - panels[i].amount) * (reduced.matches ? 1 : 1 - Math.exp(-16 * dt));
      const glow = panels[i].amount;
      layer.position.y = .18 * glow + extra * (.19 + i * .035);
      layer.position.z = depth * gap;
      material.emissiveIntensity = glow * .22;
      light.emissiveIntensity = 1 + glow * 2;
    });
    face.position.z = .66 * gap;
    back.position.z = -.84 * gap;
    output.render(scene, camera);
    rendered = true;
  }
  tick(performance.now());
  host.dataset.modelState = 'ready';
  host.classList.add('model-ready');
  return tick;
}
