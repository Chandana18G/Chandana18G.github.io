// Decide whether the device should get the WebGL hero or the static fallback.
// Kept separate from scene.ts so this check never pulls in Three.js.

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function canRunHero3D(): boolean {
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return false;
  // Phones and small tablets get the static visual.
  if (window.matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 1024px)').matches) return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return false;
  }
  return true;
}
