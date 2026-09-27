// Shared motion state. The initial value is set by an inline script in
// BaseLayout (to avoid a flash); this module reads/writes it at runtime.
//   html[data-motion="paused" | "running"]
// Default: paused if the OS asks for reduced motion, otherwise running.
// The user's explicit choice is stored in localStorage and wins.

export const MOTION_EVENT = 'motionchange';
const STORAGE_KEY = 'motion';

export function isMotionPaused(): boolean {
  return document.documentElement.dataset.motion === 'paused';
}

export function setMotionPaused(paused: boolean): void {
  document.documentElement.dataset.motion = paused ? 'paused' : 'running';
  try {
    localStorage.setItem(STORAGE_KEY, paused ? 'paused' : 'running');
  } catch {
    /* storage unavailable: state still applies for this page */
  }
  document.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: { paused } }));
}

export function onMotionChange(cb: (paused: boolean) => void): () => void {
  const handler = () => cb(isMotionPaused());
  document.addEventListener(MOTION_EVENT, handler);
  return () => document.removeEventListener(MOTION_EVENT, handler);
}
