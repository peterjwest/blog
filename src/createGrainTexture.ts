import { createNoise2D } from 'simplex-noise';

export default function createGrainTexture(size = 400) {
  const noise2D = createNoise2D(Math.random);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error('Cannot get canvas context');
  }
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  let i = 0;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = Math.floor(noise2D(x, y) * 150);
      i += 4;
    }
  }

  context.putImageData(imageData, 0, 0);
  const texture = canvas.toDataURL();
  canvas.remove();
  return texture;
}
