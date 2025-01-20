/** Frame rate threshold to decide if low power mode is active */
const FRAME_RATE_THRESHOLD = 34;
/** Set interval threshold to decide if low power mode is active on iPhone/iPad/iPod */
const SET_INTERVAL_THRESHOLD = 1.3;
/** Interval (milliseconds) between frames at 60fps */
const FRAME_INTERVAL = 1000 / 60;
/** Number of frames to test */
const TEST_FRAMES = 20;

/** Returns the average time for a repeated interval  */
async function averageIntervalTime(times: number, interval: number) {
  const startTime = performance.now();
  const endTime = await new Promise<number>((resolve) => {
    let i = 0;
    const handle = setInterval(() => {
      if (i > times) {
        clearInterval(handle);
        return resolve(performance.now());
      }
      i++;
    }, interval);
  });

  return (endTime - startTime) / times;
}

async function detectFrameRate() {
  const startTime = performance.now();
  const endTime = await new Promise<number>((resolve) => {
    let i = 0;
    const tick = () => {
      if (i > TEST_FRAMES) return resolve(performance.now());
      i++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return TEST_FRAMES / ((endTime - startTime) / 1000);
}

/**
 * Detect iPhone/iPad/iPod Low Power Mode or Chromium Energy Saver Mode
 * Adapted from https://gist.github.com/fuweichin/f7b675c7a5bab86dd1488962e646c6cc
 */
export default async function detectPowerSaving(): Promise<boolean | undefined> {
  if (navigator.userAgent.match(/(iPhone|iPad|iPod)/)) {
    // In Low Power Mode, setInterval incurs a cumulative delay
    const averageTime = await averageIntervalTime(TEST_FRAMES, FRAME_INTERVAL);
    console.log(averageTime, FRAME_INTERVAL)
    return (averageTime / FRAME_INTERVAL) > SET_INTERVAL_THRESHOLD;
  }
  // For Safari and Chromium, Battery Saver Mode frameRate will be about 30fps or 20fps
  // otherwise frameRate will be close to monitor refresh rate (typically 60Hz).
  const frameRate = await detectFrameRate();
  if (frameRate < FRAME_RATE_THRESHOLD) return true;

  // Otherwise we can't determine power saving;
  return undefined;
}
