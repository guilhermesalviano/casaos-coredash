import { useEffect, useRef } from 'react';

export function useDayChange(onDayChange: (newDay: string) => void) {
  const lastDate = useRef(new Date().toDateString());
  const onDayChangeRef = useRef(onDayChange);

  useEffect(() => {
    onDayChangeRef.current = onDayChange;
  }, [onDayChange]);

  useEffect(() => {
    function scheduleAtMidnight() {
      const now = new Date();
      const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

      const timeout = setTimeout(() => {
        const today = new Date().toDateString();
        lastDate.current = today;
        onDayChangeRef.current(today);
        scheduleAtMidnight();
        console.log("[log]: day changed.")
      }, msUntilMidnight);

      return timeout;
    }

    const timeout = scheduleAtMidnight();
    return () => clearTimeout(timeout);
  }, []);
}