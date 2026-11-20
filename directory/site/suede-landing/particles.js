// Lightweight point sprites. Vertex IDs index an implicit grid without a geometry buffer.
const vertex = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 size;
uniform vec4 trail[12], quiet[8];
uniform float clock, grid, ratio, starting;
uniform int columns, field;
out float strength;
out float glint;
flat out int symbol;
float noise(vec2 p) { return fract(sin(dot(p, vec2(37.13, 91.77))) * 4096.71); }
void main() {
  vec2 id = vec2(gl_VertexID % columns, gl_VertexID / columns);
  float identity = noise(id);
  vec2 point = (id + 0.5) * grid;
  float wave = (sin(point.x * .01 + point.y * .009 - clock * .65) * .58 +
                cos(point.y * .013 - point.x * .006 - clock * .43) * .42) * .5 + .5;
  float edge = smoothstep(35., 185., point.y) * smoothstep(0., 170., size.y - point.y);
  float trailLight = 0.;
  vec2 shift = vec2(0.);
  for (int i = 0; i < 12; ++i) {
    vec2 tangent = point - trail[i].xy;
    float density = exp(-dot(tangent, tangent) / 4900.) * trail[i].z;
    trailLight = max(trailLight, density);
    shift += normalize(tangent + .01) * density * (i == 0 ? 6. : .45);
  }
  point += shift;
  float mask = 1.;
  for (int i = 0; i < 8; ++i) {
    if (quiet[i].z > 0.) {
      vec2 outside = max(vec2(0.), abs(point - quiet[i].xy) - quiet[i].zw);
      mask = min(mask, .16 + .84 * smoothstep(0., 86., length(outside)));
    }
  }
  symbol = int(floor(identity * 3.));
  strength = mask * edge * (.032 + .245 * pow(wave, 1.65));
  glint = trailLight;
  float width = min(5., grid * .82);
  if (field == 0 && starting >= 0.) {
    float distanceToCenter = length(point - vec2(size.x * .5, min(size.y, starting) * .43));
    float ring = clock * .17 * length(size);
    strength *= 1. - smoothstep(ring, ring + 100., distanceToCenter);
  } else if (field == 1) {
    vec2 flow = vec2(dot(point, vec2(.78,-.63)), dot(point, vec2(.63,.78)));
    float filament = cos(flow.y * .013 + sin(flow.x * .003 - clock * .25) * .57 - clock * .125);
    strength = smoothstep(.35, .98, filament) * (.065 + .125 * wave) * mask * edge;
    width = 2.2;
    symbol = identity < .5 ? 0 : 3;
    glint = 0.;
  } else if (field == 2) {
    strength = (.009 + .095 * pow(point.y / size.y, 1.7)) * (.58 + .42 * wave);
    glint *= .45;
  }
  if (identity < .1) strength = 0.;
  gl_Position = vec4(vec2(point.x / size.x, 1. - point.y / size.y) * 2. - 1., 0., 1.);
  gl_PointSize = width * ratio;
}`;
const fragment = `#version 300 es
precision highp float;
precision highp int;
uniform int field;
in float strength;
in float glint;
flat in int symbol;
out vec4 color;
void main() {
  vec2 p = gl_PointCoord - .5;
  float r = length(p);
  float mark;
  if (symbol == 1) mark = smoothstep(.12, .2, r) * (1. - smoothstep(.32, .41, r));
  else if (symbol == 2) {
    vec2 centers = abs(p - .13 * sign(p.x));
    mark = 1. - smoothstep(.15, .23, max(centers.x, centers.y));
  } else if (symbol == 3) mark = 1. - smoothstep(.28, .39, max(abs(p.x), abs(p.y)));
  else mark = 1. - smoothstep(.16, .26, r);
  vec3 tint = field == 2 ? vec3(.88,.92,.96) : mix(vec3(.19,.40,.34), vec3(.02,.58,.36), glint);
  float alpha = mark * mix(strength, .52, glint);
  color = vec4(tint * alpha, alpha);
}`;

export function attachField(section, name, field) {
  const canvas = document.createElement('canvas');
  canvas.className = name;
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: true, depth: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Suede particle shader unavailable.', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Suede particle field unavailable.', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  const uniforms = Object.fromEntries(['size','clock','grid','ratio','quiet','trail','columns','field','starting']
    .map(key => [key, gl.getUniformLocation(program, key)]));
  section.prepend(canvas);
  const text = Array.from(section.querySelectorAll(field === 1 ? '.bentext' : '.hero-h1,.hsteps,.hfoot,.hcli,.htool.more,.sl')).slice(0,8);
  const positions = new Float32Array(32);
  const history = new Float32Array(48);
  const samples = [];
  let count = 0, visible = false, lastFrame = -1, dirty = true;
  let width, height;
  function measure() {
    width = section.clientWidth;
    height = section.clientHeight;
    if (field === 1) {
      const last = section.querySelector('.ben:last-of-type') || Array.from(section.querySelectorAll('.ben')).at(-1);
      if (last) height = Math.ceil(last.getBoundingClientRect().bottom - section.getBoundingClientRect().top);
    }
    if (width < 1 || height < 1) return;
    const limit = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const ratio = Math.min(1.25, devicePixelRatio || 1, limit[0] / width, limit[1] / height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = height + 'px';
    const touch = matchMedia('(pointer: coarse)').matches;
    const grid = Math.max(field === 1 ? (touch ? 7 : 5) : (touch ? 8 : 6), Math.sqrt(width * height / (field === 1 ? 150000 : 60000)));
    const columns = Math.ceil(width / grid);
    count = columns * Math.ceil(height / grid);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.size, width, height);
    gl.uniform1f(uniforms.grid, grid);
    gl.uniform1f(uniforms.ratio, ratio);
    gl.uniform1i(uniforms.columns, columns);
    gl.uniform1i(uniforms.field, field);
    const base = section.getBoundingClientRect();
    text.forEach((el, index) => {
      const b = el.getBoundingClientRect();
      positions.set([b.x - base.x + b.width / 2, b.y - base.y + b.height / 2, b.width / 2, b.height / 2], index * 4);
    });
    gl.uniform4fv(uniforms.quiet, positions);
    dirty = true;
  }
  const bounds = new ResizeObserver(measure);
  bounds.observe(section);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; dirty = true; }).observe(section);
  if (field !== 1) section.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const box = section.getBoundingClientRect(), now = performance.now();
    samples.unshift([e.clientX - box.x, e.clientY - box.y, now]);
    samples.length = Math.min(samples.length, 12);
  }, { passive: true });
  canvas.addEventListener('webglcontextlost', () => { visible = false; canvas.hidden = true; });
  measure();
  document.fonts.ready.then(measure);
  window.addEventListener('suede:opening-end', measure);
  return (now, intro, reduced) => {
    if (!visible || (!dirty && (reduced || now - lastFrame < 30))) return;
    lastFrame = now;
    dirty = false;
    history.fill(0);
    if (!reduced) samples.forEach(([x,y,time], i) => {
      const fade = Math.max(0, 1 - (now - time) / (field === 2 ? 1100 : 550));
      history.set([x,y,fade * fade,0], i * 4);
    });
    gl.uniform4fv(uniforms.trail, history);
    gl.uniform1f(uniforms.clock, reduced ? 0 : (intro?.elapsed ?? now / 1000));
    gl.uniform1f(uniforms.starting, intro && field === 0 ? innerHeight : -1);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  };
}
