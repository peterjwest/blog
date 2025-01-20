/** RGB colour tuple array */
export type Colour = [number, number, number];

/** Converts an RGB array to a hex string */
export function rgbToHex(colour: Colour) {
  return '#' + colour.map((component) => component.toString(16).padStart(2, '0')).join('');
}

/** Converts a hex string to an RGB array */
export function hexToRgb(hex: string): Colour {
  const value = parseInt(hex.replace(/^#/, ''), 16);
  return [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ]
}

/** Async delay */
export async function delay(time: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, time));
}
