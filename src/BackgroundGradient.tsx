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

export default function BackgroundGradient({ colours }: { colours: Colour[] }) {
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
    if (canvas && backgroundSettings) {
      resizeBackground(canvas, backgroundSettings.locations);
    }
  }, [backgroundSettings, windowSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    let i = 0;

    if (canvas && backgroundSettings && tabVisible && !lowPower) {
      const render = () => {
        if (i++ % FRAME_INTERVAL === 0) {
          renderBackground(canvas, colours, backgroundSettings, FRAME_INTERVAL);
        }
        frameRef = requestAnimationFrame(render);
      }
      let frameRef = requestAnimationFrame(render);
      return () => { cancelAnimationFrame(frameRef); }
    }
  }, [colours, backgroundSettings, tabVisible, lowPower]);

  return (
    <canvas className="background" ref={canvasRef}></canvas>
  );
}
