import { useState, useEffect, useRef, useMemo } from 'react';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useCountUp(target, duration = 1500, enabled = true) {
  const skipAnimation = useMemo(() => prefersReducedMotion(), []);
  const [value, setValue] = useState(skipAnimation && enabled ? (target ?? 0) : 0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled || target == null || skipAnimation) return;

    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled, skipAnimation]);

  if (skipAnimation && enabled && target != null) {
    return target;
  }

  return value;
}
