import { useEffect, useState } from 'react';

import createGrainTexture from './createGrainTexture.ts';

export default function BackgroundGrain() {
  const [grainTexture, setGrainTexture] = useState<string | undefined>(undefined);

  useEffect(() => setGrainTexture(createGrainTexture()), []);

  return (
    <div className="grain" style={{ backgroundImage: 'url(' + grainTexture + ')'}}></div>
  );
}
