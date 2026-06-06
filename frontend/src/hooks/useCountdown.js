import { useState, useEffect } from "react";

export default function useCountdown(initialValue = 0) {
  const [countdown, setCountdown] = useState(initialValue);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return [countdown, setCountdown];
}
