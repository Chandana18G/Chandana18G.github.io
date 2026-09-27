// 3D objects drawn in the fixed page background (see Background3D.astro).
// One full-viewport renderer per page holds two objects that drift with scroll
// and lean toward the pointer. The loop runs only while the tab is visible and
// motion is not paused; when paused a single still frame is shown. This module
// is dynamically imported, so Three.js never lands in the initial bundle.

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

export interface BackgroundHandle {
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
    gl_PointSize = size * uPixelRatio * (9.0 / -mv.z);
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

// ----- Background mount ---------------------------------------------------------------

/**
 * Screen placement for each slot, as fractions of the viewport. `y` moves from `from` to `to`
 * as the page scrolls top → bottom, so the two objects cross paths while reading.
 */
const SLOTS = [
  { x: 0.8, from: 0.3, to: 0.72, size: 0.55, spin: 1 },
  { x: 0.14, from: 0.82, to: 0.3, size: 0.36, spin: -1 },
] as const;

export function mountBackground(
  container: HTMLElement,
  variants: readonly Variant[],
  opts: { paused: boolean },
): BackgroundHandle {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  const pr = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(0, 0, 10);

  const items = variants.slice(0, SLOTS.length).map((variant, i) => {
    const built = builders[variant](pr);
    const holder = new Group(); // position, scale, pointer lean
    holder.add(built.group);
    scene.add(holder);
    return { built, holder, slot: SLOTS[i] };
  });

  // Viewport ↔ world conversion at z = 0.
  let vw = 1, vh = 1, worldH = 1;
  const resize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    worldH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    if (paused) frame(0);
  };

  const pointer = { x: 0.5, y: 0.5, active: false };
  const onPointer = (e: PointerEvent) => {
    pointer.x = e.clientX / vw;
    pointer.y = e.clientY / vh;
    pointer.active = e.pointerType === 'mouse';
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  let time = 1.2; // start slightly into the animation so the still frame looks composed
  let lx = 0, ly = 0;

  function frame(dt: number) {
    time += dt;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const worldW = worldH * camera.aspect;
    const minSide = Math.min(vw, vh);

    const tx = pointer.active ? pointer.x - 0.5 : 0;
    const ty = pointer.active ? pointer.y - 0.5 : 0;
    lx += (tx - lx) * Math.min(1, dt * 2 || 1);
    ly += (ty - ly) * Math.min(1, dt * 2 || 1);

    for (const { built, holder, slot } of items) {
      const sy = slot.from + (slot.to - slot.from) * progress;
      holder.position.set((slot.x - 0.5) * worldW, (0.5 - sy) * worldH, 0);
      // Each object's radius is ~1.2 world units; scale it to the slot's share of the viewport.
      const px = minSide * slot.size;
      holder.scale.setScalar(((px / vh) * worldH) / 2.4);
      holder.rotation.set(ly * 0.5 + progress * 1.2 * slot.spin, lx * 0.7 + progress * 2 * slot.spin, 0);
      built.update(time);
    }
    renderer.render(scene, camera);
  }

  let paused = opts.paused;
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    frame(Math.min(0.05, (now - last) / 1000 || 0.016));
    last = now;
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    const run = !paused && !document.hidden;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  // While paused, still follow scroll so the objects stay where the reader expects them.
  const onScroll = () => {
    if (paused) frame(0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', sync);

  resize();
  frame(0);
  sync();

  return {
    setPaused(p) {
      paused = p;
      if (p) frame(0);
      sync();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
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
