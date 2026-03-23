import { useEffect, useState } from "react";

const defaultDebounceDelayMs = 300;

export function useDebounce(value, delay = defaultDebounceDelayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}