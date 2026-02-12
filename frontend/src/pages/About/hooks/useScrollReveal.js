import { useState, useEffect, useRef, useMemo } from 'react';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const skipAnimation = useMemo(() => prefersReducedMotion(), []);
  const [isVisible, setIsVisible] = useState(skipAnimation);

  useEffect(() => {
    if (skipAnimation) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, skipAnimation]);

  return [ref, isVisible];
}
