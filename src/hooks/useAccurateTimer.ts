import { useState, useMemo, useRef, useEffect } from "react";

const useAccurateTimer = () => {
  const [time, setTime] = useState(0); // 毫秒为单位
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 格式化时间，只在 time 变化时才重新计算
  const formattedTime = useMemo(() => {
    const seconds = Math.floor(time / 1000);
    const milliseconds = time % 1000;
    return `${seconds}.${Math.floor(milliseconds / 100)
      .toString()
      .padStart(1, "0")}s`;
  }, [time]);

  // 使用 useCallback 优化 start 和 stop 函数，避免不必要的 re-render
  const start = () => {
    if (time > 0) setTime(0);
    if (!isRunning && !timerRef.current) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - time; // 记录开始时间，考虑暂停的情况

      const tick = () => {
        if (startTimeRef.current !== null) {
          setTime(Date.now() - startTimeRef.current);
          timerRef.current = requestAnimationFrame(tick); // 使用 requestAnimationFrame
        }
      };

      timerRef.current = requestAnimationFrame(tick); // 启动动画帧循环
    }
  };

  const stop = () => {
    if (isRunning && timerRef.current) {
      setIsRunning(false);
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
      setTime(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  return {
    time,
    formattedTime,
    isRunning,
    start,
    stop,
  };
};

export default useAccurateTimer;
