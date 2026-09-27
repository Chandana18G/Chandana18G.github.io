// "Latent Graph" — the home-page hero.
// A cloud of nodes lying on a slowly morphing surface, linked to their nearest
// neighbours like a neural network / data manifold. Reacts to pointer (tilt +
// local glow) and scroll (flattens and fades). This module is dynamically
// imported by Hero.astro, so Three.js never blocks first paint.

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

export interface HeroHandle {
  setPaused(paused: boolean): void;
  dispose(): void;
}

const NODE_COUNT = 190;
const NEIGHBOURS = 3;
const RADIUS = 2.4;

const COLOR_BASE = new Color('#8b5cf6');
const COLOR_HOT = new Color('#f0d9ff');
const COLOR_LINE = new Color('#b794ff');

/** Deterministic PRNG so the graph looks the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Height of the morphing surface at (x, z) and time t. Sum of drifting waves. */
function surface(x: number, z: number, t: number): number {
  return (
    0.38 * Math.sin(x * 1.3 + t * 0.55) * Math.cos(z * 1.1 - t * 0.4) +
    0.22 * Math.sin((x + z) * 1.9 - t * 0.7) +
    0.12 * Math.cos(Math.hypot(x, z) * 2.6 - t * 0.9)
  );
}

const pointVertex = /* glsl */ `
  attribute float size;
  attribute float heat;
  varying float vHeat;
  uniform float uPixelRatio;
  void main() {
    vHeat = heat;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uPixelRatio * (1.0 + heat * 0.9) * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uHot;
  uniform float uOpacity;
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 2.2);
    vec3 col = mix(uBase, uHot, clamp(vHeat + glow * 0.35, 0.0, 1.0));
    gl_FragColor = vec4(col, glow * uOpacity);
  }
`;

export function createHero(container: HTMLElement, opts: { paused: boolean }): HeroHandle {
  const rand = mulberry32(18);

  // ----- Renderer / camera -------------------------------------------------
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 2.6, 6.2);
  camera.lookAt(0, 0, 0);

  const graph = new Group();
  graph.rotation.set(-0.1, 0.4, 0.12);
  scene.add(graph);

  // ----- Nodes: sampled on a disc (denser toward the centre) --------------
  const base = new Float32Array(NODE_COUNT * 2); // (x, z) on the disc
  const positions = new Float32Array(NODE_COUNT * 3);
  const sizes = new Float32Array(NODE_COUNT);
  const heat = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) {
    const r = RADIUS * Math.pow(rand(), 0.62);
    const a = rand() * Math.PI * 2;
    base[i * 2] = Math.cos(a) * r;
    base[i * 2 + 1] = Math.sin(a) * r;
    sizes[i] = 7 + rand() * 11 + (rand() > 0.93 ? 12 : 0); // a few "hub" nodes
  }

  const pointGeo = new BufferGeometry();
  pointGeo.setAttribute('position', new BufferAttribute(positions, 3));
  pointGeo.setAttribute('size', new BufferAttribute(sizes, 1));
  pointGeo.setAttribute('heat', new BufferAttribute(heat, 1));
  const pointMat = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: {
      uBase: { value: COLOR_BASE },
      uHot: { value: COLOR_HOT },
      uOpacity: { value: 1 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  graph.add(new Points(pointGeo, pointMat));

  // ----- Edges: fixed k-nearest-neighbour topology on the disc -------------
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const dists: [number, number][] = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const dx = base[i * 2] - base[j * 2];
      const dz = base[i * 2 + 1] - base[j * 2 + 1];
      dists.push([dx * dx + dz * dz, j]);
    }
    dists.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < NEIGHBOURS; k++) {
      const j = dists[k][1];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([i, j]);
      }
    }
  }
  const linePositions = new Float32Array(edges.length * 6);
  const lineColors = new Float32Array(edges.length * 6);
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', new BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new BufferAttribute(lineColors, 3));
  const lineMat = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  graph.add(new LineSegments(lineGeo, lineMat));

  // ----- Interaction state --------------------------------------------------
  const pointerNdc = new Vector2(0, 0);
  const tilt = new Vector2(0, 0); // smoothed
  let pointerActive = false;
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const localHit = new Vector3(999, 0, 999);
  let scrollProgress = 0; // 0 at top, 1 once the hero has scrolled away

  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointerNdc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    pointerActive = e.clientY >= rect.top && e.clientY <= rect.bottom;
  };
  const onPointerLeave = () => {
    pointerActive = false;
  };
  const onScroll = () => {
    const rect = container.getBoundingClientRect();
    scrollProgress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('scroll', onScroll, { passive: true });

  // ----- Frame update -------------------------------------------------------
  let time = 0;
  const tmpColor = new Color();

  function update(dt: number) {
    time += dt;
    const flatten = 1 - scrollProgress * 0.85;

    // Tilt toward the pointer (smoothed).
    const tx = pointerActive ? pointerNdc.x : 0;
    const ty = pointerActive ? pointerNdc.y : 0;
    tilt.x += (tx - tilt.x) * Math.min(1, dt * 2.5);
    tilt.y += (ty - tilt.y) * Math.min(1, dt * 2.5);
    graph.rotation.x = -0.1 - tilt.y * 0.18 + scrollProgress * 0.5;
    graph.rotation.y = 0.4 + time * 0.05 + tilt.x * 0.3;

    // Pointer position on the graph plane, in graph-local space.
    if (pointerActive) {
      raycaster.setFromCamera(pointerNdc, camera);
      graph.updateMatrixWorld();
      plane.normal.set(0, 1, 0).applyQuaternion(graph.quaternion);
      plane.constant = 0;
      if (raycaster.ray.intersectPlane(plane, hit)) localHit.copy(graph.worldToLocal(hit.clone()));
    } else {
      localHit.set(999, 0, 999);
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      let x = base[i * 2];
      let z = base[i * 2 + 1];
      const dx = x - localHit.x;
      const dz = z - localHit.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      const target = Math.max(0, 1 - d / 1.1);
      heat[i] += (target - heat[i]) * Math.min(1, dt * 6);
      // Nodes near the pointer gather slightly toward it.
      const pull = heat[i] * 0.18;
      x -= dx * pull;
      z -= dz * pull;
      positions[i * 3] = x;
      positions[i * 3 + 1] = surface(x, z, time) * flatten + heat[i] * 0.25;
      positions[i * 3 + 2] = z;
    }

    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      linePositions.set(positions.subarray(a * 3, a * 3 + 3), e * 6);
      linePositions.set(positions.subarray(b * 3, b * 3 + 3), e * 6 + 3);
      tmpColor.copy(COLOR_LINE).multiplyScalar(0.35 + heat[a] * 0.9);
      lineColors.set([tmpColor.r, tmpColor.g, tmpColor.b], e * 6);
      tmpColor.copy(COLOR_LINE).multiplyScalar(0.35 + heat[b] * 0.9);
      lineColors.set([tmpColor.r, tmpColor.g, tmpColor.b], e * 6 + 3);
    }

    pointGeo.attributes.position.needsUpdate = true;
    pointGeo.attributes.heat.needsUpdate = true;
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    const fade = 1 - scrollProgress;
    pointMat.uniforms.uOpacity.value = fade;
    lineMat.opacity = 0.55 * fade;
  }

  function renderFrame() {
    update(0.016);
    renderer.render(scene, camera);
  }

  // ----- Sizing ---------------------------------------------------------------
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back on narrow viewports so the graph stays in frame.
    camera.position.z = w / h < 1 ? 8.2 : 6.2;
    camera.updateProjectionMatrix();
    if (paused) renderFrame();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ----- Loop (runs only when visible, tab active and not paused) -----------
  let paused = opts.paused;
  let visible = true;
  let raf = 0;
  let last = 0;

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    update(dt);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    const shouldRun = !paused && visible && !document.hidden;
    if (shouldRun && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!shouldRun && raf) {
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
  renderFrame(); // always draw one frame, so a paused hero is still a picture
  sync();

  return {
    setPaused(p: boolean) {
      paused = p;
      if (p) renderFrame();
      sync();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', sync);
      pointGeo.dispose();
      lineGeo.dispose();
      pointMat.dispose();
      lineMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
