// Decide whether this device should render the WebGL objects or the static fallbacks.
// Kept separate from objects.ts so this check never pulls in Three.js.

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

let cached: boolean | undefined;

export function canRun3D(): boolean {
  if (cached !== undefined) return cached;
  cached = check();
  return cached;
}

function check(): boolean {
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return false;

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
