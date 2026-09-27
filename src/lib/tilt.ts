// Subtle 3D tilt + pointer glare for elements marked [data-tilt].
// Only on fine pointers, and disabled while motion is paused.
import { isMotionPaused, onMotionChange } from './motion';

const MAX_DEG = 6;

export function initTilt(root: ParentNode = document): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const els = root.querySelectorAll<HTMLElement>('[data-tilt]');
  els.forEach((el) => {
    if (el.dataset.tiltReady) return;
    el.dataset.tiltReady = 'true';

    el.addEventListener('pointermove', (e) => {
      if (isMotionPaused()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.transform = `rotateX(${(0.5 - py) * MAX_DEG}deg) rotateY(${(px - 0.5) * MAX_DEG}deg) translateY(-2px)`;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });

  onMotionChange((paused) => {
    if (paused) els.forEach((el) => (el.style.transform = ''));
  });
}
