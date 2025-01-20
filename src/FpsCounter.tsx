import { useEffect, useState } from 'react';

const FPS_SMOOTHING = 0.7;
const FPS_SAMPLE_RATE = 200;

function initialiseFps() {
  let startTime = performance.now();
  let frameCount = 0;
  let fps: number | undefined = undefined;

  return function calculateFps() {
    const currentTime = performance.now();
    const duration = currentTime - startTime
    if (duration > FPS_SAMPLE_RATE) {
      if (fps === undefined) fps = (frameCount - 1) * 1000 / duration;
      else fps = fps * FPS_SMOOTHING + frameCount * 1000 / duration * (1 - FPS_SMOOTHING);
      frameCount = 0;
      startTime = currentTime;
    }
    frameCount++;
    return fps;
  }
}

export default function FpsCounter() {
  const [fps, setFps] = useState<number | undefined>(undefined);

  useEffect(() => {
    const calculateFps = initialiseFps();
    const render = () => {
      setFps(calculateFps());
      frameRef = requestAnimationFrame(render);
    }
    let frameRef = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frameRef); }
  }, [])

  if (fps === undefined) return;
  return (
    <p className="FpsCounter"><span>{fps.toFixed(2)}</span> fps</p>
  );
}
