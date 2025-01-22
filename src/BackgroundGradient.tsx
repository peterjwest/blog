import { useRef, useEffect, useState, MutableRefObject } from 'react';

import { Colour } from './util.ts';
import { useWindowSize, useVisibilityChange, useIsCharging, useIsPowerSaving } from './hooks.ts';
import {
  initialiseBackground,
  resizeBackground,
  renderBackground,
  BackgroundSettings,
} from './backgroundGradient.ts'

/** Number of frames per render */
const FRAME_INTERVAL = 1;

interface BackgroundGradientProps {
  colours: Colour[];
  paused: boolean;
}

export default function BackgroundGradient({ colours, paused }: BackgroundGradientProps) {
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);

  const windowSize = useWindowSize();
  const colourCount = colours.length;
  const [
    backgroundSettings,
    setBackgroundSettings,
  ] = useState<BackgroundSettings | undefined>(undefined);

  const [tabVisible, setTabVisible] = useState(true);
  useVisibilityChange(() => setTabVisible(!document.hidden));

  const isCharging = useIsCharging();
  const isPowerSaving = useIsPowerSaving();
  const lowPower = !isCharging && isPowerSaving;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setBackgroundSettings(initialiseBackground(canvas, colourCount));
    }
  }, [colourCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && backgroundSettings && !lowPower && !paused) {
      resizeBackground(canvas, backgroundSettings.locations);
    }
  }, [backgroundSettings, windowSize, lowPower, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    let i = 0;

    if (canvas && backgroundSettings && tabVisible && !lowPower && !paused) {
      const render = () => {
        if (i++ % FRAME_INTERVAL === 0) {
          renderBackground(canvas, colours, backgroundSettings, FRAME_INTERVAL);
        }
        frameRef = requestAnimationFrame(render);
      }
      let frameRef = requestAnimationFrame(render);
      return () => { cancelAnimationFrame(frameRef); }
    }
  }, [colours, backgroundSettings, tabVisible, lowPower, paused]);

  return (
    <canvas className="background" ref={canvasRef}></canvas>
  );
}
