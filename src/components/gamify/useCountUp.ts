import { useEffect, useState } from 'react';

/** Animates a number from 0 up to `value` (instantly when the OS asks for reduced motion). */
export function useCountUp(value: number, ms = 900): number {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const dur = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = dur ? Math.min(1, (t - start) / dur) : 1;
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}
