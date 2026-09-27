// Small, self-contained 3D objects used across the site (see Object3D.astro).
// Each mount gets its own tiny renderer; its loop runs only while the object is
// on-screen, the tab is visible and motion is not paused. When paused it shows
// a single still frame. This module is dynamically imported, so Three.js never
// lands in the initial bundle.

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  TorusKnotGeometry,
  WebGLRenderer,
  WireframeGeometry,
  type Material,
} from 'three';

export const VARIANTS = ['sphere', 'icosa', 'knot', 'helix', 'orbit'] as const;
export type Variant = (typeof VARIANTS)[number];

export interface ObjectHandle {
  setPaused(paused: boolean): void;
  dispose(): void;
}

const VIOLET = new Color('#8b5cf6');
const NEON = new Color('#c77dff');
const HOT = new Color('#f0d9ff');
const LINE = new Color('#b794ff');

// ----- Shared materials -------------------------------------------------------

const pointVertex = /* glsl */ `
  attribute float size;
  uniform float uPixelRatio;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = clamp((-mv.z - 2.5) / 3.0, 0.0, 1.0);
    gl_PointSize = size * uPixelRatio * (4.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uHot;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = pow(smoothstep(0.5, 0.0, d), 2.0);
    // Nodes at the back are dimmer, which sells the depth.
    float fade = mix(1.0, 0.35, vDepth);
    gl_FragColor = vec4(mix(uBase, uHot, glow * 0.6), glow * fade);
  }
`;

function pointsMaterial(pixelRatio: number, base = NEON) {
  return new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: { uBase: { value: base }, uHot: { value: HOT }, uPixelRatio: { value: pixelRatio } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

function lineMaterial(opacity: number, color = LINE) {
  return new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: AdditiveBlending });
}

function makePoints(positions: Float32Array, sizes: number[] | number, pixelRatio: number, base?: Color) {
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  const count = positions.length / 3;
  const s = new Float32Array(count).map((_, i) => (Array.isArray(sizes) ? sizes[i] : sizes));
  geo.setAttribute('size', new BufferAttribute(s, 1));
  return new Points(geo, pointsMaterial(pixelRatio, base));
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----- Variants -----------------------------------------------------------------
// Each builder returns a group plus a per-frame update(time).

interface Built {
  group: Group;
  update(t: number): void;
}

/** Neural-network globe: nodes on a sphere linked to nearest neighbours; gently breathing. */
function buildSphere(pr: number): Built {
  const N = 150;
  const rand = mulberry32(18);
  const dirs = new Float32Array(N * 3);
  const phase = new Float32Array(N);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    dirs.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    phase[i] = rand() * Math.PI * 2;
  }
  const edges: [number, number][] = [];
  const seen = new Set<number>();
  for (let i = 0; i < N; i++) {
    const near: [number, number][] = [];
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const dx = dirs[i * 3] - dirs[j * 3], dy = dirs[i * 3 + 1] - dirs[j * 3 + 1], dz = dirs[i * 3 + 2] - dirs[j * 3 + 2];
      near.push([dx * dx + dy * dy + dz * dz, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < 3; k++) {
      const j = near[k][1];
      const key = Math.min(i, j) * N + Math.max(i, j);
      if (!seen.has(key)) (seen.add(key), edges.push([i, j]));
    }
  }

  const pos = new Float32Array(N * 3);
  const sizes = Array.from({ length: N }, () => 5 + rand() * 7 + (rand() > 0.92 ? 9 : 0));
  const points = makePoints(pos, sizes, pr);
  const linePos = new Float32Array(edges.length * 6);
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', new BufferAttribute(linePos, 3));
  const lines = new LineSegments(lineGeo, lineMaterial(0.32));

  // A faint inner core.
  const core = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(0.42, 1)), lineMaterial(0.25, VIOLET));

  const group = new Group();
  group.add(lines, points, core);

  return {
    group,
    update(t) {
      for (let i = 0; i < N; i++) {
        const r = 1.15 + Math.sin(t * 1.1 + phase[i]) * 0.045;
        pos[i * 3] = dirs[i * 3] * r;
        pos[i * 3 + 1] = dirs[i * 3 + 1] * r;
        pos[i * 3 + 2] = dirs[i * 3 + 2] * r;
      }
      for (let e = 0; e < edges.length; e++) {
        linePos.set(pos.subarray(edges[e][0] * 3, edges[e][0] * 3 + 3), e * 6);
        linePos.set(pos.subarray(edges[e][1] * 3, edges[e][1] * 3 + 3), e * 6 + 3);
      }
      points.geometry.attributes.position.needsUpdate = true;
      lineGeo.attributes.position.needsUpdate = true;
      group.rotation.y = t * 0.18;
      core.rotation.set(t * 0.4, -t * 0.3, 0);
    },
  };
}

/** Nested icosahedra, counter-rotating, with glowing vertices. */
function buildIcosa(pr: number): Built {
  const outerGeo = new IcosahedronGeometry(1.15, 1);
  const outer = new LineSegments(new EdgesGeometry(outerGeo), lineMaterial(0.45));
  const verts = new Float32Array(outerGeo.attributes.position.array as ArrayLike<number>);
  const outerPts = makePoints(verts, 9, pr);
  const inner = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(0.55, 0)), lineMaterial(0.6, NEON));
  const outerGroup = new Group();
  outerGroup.add(outer, outerPts);
  const group = new Group();
  group.add(outerGroup, inner);
  return {
    group,
    update(t) {
      outerGroup.rotation.set(t * 0.12, t * 0.2, 0);
      inner.rotation.set(-t * 0.35, -t * 0.25, t * 0.1);
      inner.scale.setScalar(1 + Math.sin(t * 1.4) * 0.06);
    },
  };
}

/** Wireframe torus knot with sparse glowing nodes along it. */
function buildKnot(pr: number): Built {
  const geo = new TorusKnotGeometry(0.72, 0.2, 90, 8, 2, 3);
  const wire = new LineSegments(new WireframeGeometry(geo), lineMaterial(0.16));
  const src = geo.attributes.position.array as ArrayLike<number>;
  const picked: number[] = [];
  for (let i = 0; i < src.length / 3; i += 9) picked.push(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
  const pts = makePoints(new Float32Array(picked), 7, pr);
  const group = new Group();
  group.add(wire, pts);
  return {
    group,
    update(t) {
      group.rotation.set(0.5 + Math.sin(t * 0.3) * 0.2, t * 0.25, t * 0.08);
    },
  };
}

/** Double helix of nodes with rungs — a nod to data / sequences. */
function buildHelix(pr: number): Built {
  const N = 26;
  const pos = new Float32Array(N * 2 * 3);
  const linePos = new Float32Array(N * 6 + (N - 1) * 12);
  const pts = makePoints(pos, 8, pr);
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', new BufferAttribute(linePos, 3));
  const lines = new LineSegments(lineGeo, lineMaterial(0.4));
  const group = new Group();
  group.add(lines, pts);
  group.rotation.z = 0.35;
  return {
    group,
    update(t) {
      for (let i = 0; i < N; i++) {
        const y = (i / (N - 1) - 0.5) * 2.0;
        const a = i * 0.45 + t * 0.8;
        pos.set([Math.cos(a) * 0.55, y, Math.sin(a) * 0.55], i * 6);
        pos.set([Math.cos(a + Math.PI) * 0.55, y, Math.sin(a + Math.PI) * 0.55], i * 6 + 3);
      }
      let o = 0;
      for (let i = 0; i < N; i++) {
        linePos.set(pos.subarray(i * 6, i * 6 + 6), o); // rung
        o += 6;
        if (i < N - 1) {
          linePos.set(pos.subarray(i * 6, i * 6 + 3), o);
          linePos.set(pos.subarray((i + 1) * 6, (i + 1) * 6 + 3), o + 3);
          linePos.set(pos.subarray(i * 6 + 3, i * 6 + 6), o + 6);
          linePos.set(pos.subarray((i + 1) * 6 + 3, (i + 1) * 6 + 6), o + 9);
          o += 12;
        }
      }
      pts.geometry.attributes.position.needsUpdate = true;
      lineGeo.attributes.position.needsUpdate = true;
      group.rotation.y = t * 0.15;
    },
  };
}

/** A glowing core with three tilted orbits, each carrying a node. */
function buildOrbit(pr: number): Built {
  const group = new Group();
  const core = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(0.32, 1)), lineMaterial(0.7, NEON));
  group.add(core);
  const SEG = 96;
  const rings: { ring: Group; speed: number; node: Float32Array; pts: Points; radius: number }[] = [];
  [
    [1.05, 0.2, 0, 0.9],
    [0.85, 1.1, 0.6, -1.3],
    [1.2, -0.9, 1.2, 0.6],
  ].forEach(([radius, rx, rz, speed]) => {
    const circle = new Float32Array(SEG * 6);
    for (let i = 0; i < SEG; i++) {
      const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1) / SEG) * Math.PI * 2;
      circle.set([Math.cos(a0) * radius, 0, Math.sin(a0) * radius, Math.cos(a1) * radius, 0, Math.sin(a1) * radius], i * 6);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(circle, 3));
    const ring = new Group();
    ring.rotation.set(rx, 0, rz);
    const node = new Float32Array(3);
    const pts = makePoints(node, 14, pr);
    ring.add(new LineSegments(geo, lineMaterial(0.3)), pts);
    group.add(ring);
    rings.push({ ring, speed, node, pts, radius });
  });
  return {
    group,
    update(t) {
      core.rotation.set(t * 0.5, t * 0.35, 0);
      for (const r of rings) {
        const a = t * r.speed;
        r.node.set([Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius]);
        r.pts.geometry.attributes.position.needsUpdate = true;
      }
      group.rotation.y = t * 0.1;
    },
  };
}

const builders: Record<Variant, (pr: number) => Built> = {
  sphere: buildSphere,
  icosa: buildIcosa,
  knot: buildKnot,
  helix: buildHelix,
  orbit: buildOrbit,
};

// ----- Pointer (shared by all mounts) ------------------------------------------------

const pointer = { x: 0, y: 0, active: false };
let pointerBound = false;
function bindPointer() {
  if (pointerBound) return;
  pointerBound = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = e.pointerType === 'mouse';
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => (pointer.active = false));
}

// ----- Mount ---------------------------------------------------------------------------

export function mountObject(container: HTMLElement, variant: Variant, opts: { paused: boolean }): ObjectHandle {
  bindPointer();

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  const pr = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.set(0, 0, 4.4);

  const built = builders[variant](pr);
  // Outer group follows the pointer; inner group does its own animation.
  const tilt = new Group();
  tilt.add(built.group);
  scene.add(tilt);

  let time = 0;
  let tx = 0, ty = 0;
  function update(dt: number) {
    time += dt;
    // Lean toward the pointer, relative to this object's own centre.
    let gx = 0, gy = 0;
    if (pointer.active) {
      const r = container.getBoundingClientRect();
      gx = Math.max(-1, Math.min(1, (pointer.x - (r.left + r.width / 2)) / window.innerWidth));
      gy = Math.max(-1, Math.min(1, (pointer.y - (r.top + r.height / 2)) / window.innerHeight));
    }
    tx += (gx - tx) * Math.min(1, dt * 3);
    ty += (gy - ty) * Math.min(1, dt * 3);
    tilt.rotation.set(ty * 0.6, tx * 0.8, 0);
    built.update(time);
  }

  const render = () => renderer.render(scene, camera);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (paused) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let paused = opts.paused;
  let visible = false;
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    update(Math.min(0.05, (now - last) / 1000 || 0.016));
    last = now;
    render();
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    const run = !paused && visible && !document.hidden;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  io.observe(container);
  document.addEventListener('visibilitychange', sync);

  resize();
  update(1.2); // start slightly into the animation so the still frame looks composed
  render();
  sync();

  return {
    setPaused(p) {
      paused = p;
      if (p) render();
      sync();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      scene.traverse((obj) => {
        const o = obj as { geometry?: BufferGeometry; material?: Material };
        o.geometry?.dispose();
        o.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
