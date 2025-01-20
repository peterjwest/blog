import { useEffect, useLayoutEffect, useState } from 'react';

import { delay } from './util.ts';
import detectPowerSaving from './detectPowerSaving';

type Battery = EventSource & { charging: boolean };

const POWER_SAVING_CHECK_DELAY = 2000;
const POWER_SAVING_CHECK_INTERVAL = 30 * 1000;

/** React hook to return the current Window dimensions */
export function useWindowSize() {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

export function useVisibilityChange(onChange: () => void) {
  useEffect(() => {
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [onChange]);
}

export function useIsCharging() {
  const [battery, setBattery] = useState<Battery | undefined>(undefined);
  const [isCharging, setIsCharging] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if ((navigator as any).getBattery) {
        const battery: Battery = await (navigator as any).getBattery()
        setBattery(battery);
        setIsCharging(battery.charging);
      }
    })();
  }, []);

  useEffect(() => {
    if (battery) {
      const onChange = () => setIsCharging(battery.charging);
      battery.addEventListener("chargingchange", onChange);
      return () => battery.removeEventListener("chargingchange", onChange);
    }
  }, [battery]);

  return isCharging;
}

export function useDelay(time: number) {
  const [delayed, setDelayed] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      await delay(time);
      setDelayed(true);
    })();
  }, [time]);
  return delayed;
}

export function useIsPowerSaving() {
  const delayed = useDelay(POWER_SAVING_CHECK_DELAY);
  const [powerSaving, setPowerSaving] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (delayed) {
      const check = async () => setPowerSaving(await detectPowerSaving());
      check();
      const interval = setInterval(check, POWER_SAVING_CHECK_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [delayed]);

  return powerSaving;
}
