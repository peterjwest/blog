import { times } from 'lodash';
import MersenneTwister from 'mersenne-twister';

interface WaveSettingLocation {
  intensity: WebGLUniformLocation
  frequency: WebGLUniformLocation,
  offset: WebGLUniformLocation,
  components: WebGLUniformLocation,
}

interface Locations {
  waveSettings: WaveSettingLocation[]
  colours: WebGLUniformLocation[]
  resolution: WebGLUniformLocation
  maxIntensity: WebGLUniformLocation
}

type Colour = [number, number, number];

const DOWNSCALE = 3;

export interface WaveSettings {
  angle: number;
  components: { x: number, y: number };
  intensity: number;
  frequency: number;
  offset: number;
  movement: number;
}

export interface BackgroundSettings {
  waveSettings: WaveSettings[];
  locations: Locations;
}

function createWaveSettings(generator: { random: () => number }): WaveSettings {
  const angle = generator.random() * Math.PI * 2;
  return {
    angle: angle,
    components: { x: Math.cos(angle), y: Math.sin(angle) },
    intensity: 0.75 + generator.random() * 0.25,
    frequency: 2.5 - generator.random() * 1.25,
    offset: generator.random(),
    movement: generator.random() * 0.6 / 100,
  };
}

/** Verticies for a square composed of two triangles */
const SQUARE_VERTICES = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
]);

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main(void) {
    // Transform the [-1, 1] clip-space square into [0,1] UV
    v_uv = a_position * 0.5 + 0.5;
    // Standard full-screen quad in clip-space
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

function getFragmentShaderSource(waveCount: number, colourCount: number) {
  return `
    precision highp float;

    const float TWO_PI = 6.28318530;
    const float INV_ROOT_3 = 0.57735026;
    const vec3 HUE_SHIFT = vec3(INV_ROOT_3, INV_ROOT_3, INV_ROOT_3);
    const float COLOUR_SEGMENT = 1.0 / (${colourCount}.0 - 1.0);

    struct Wave {
      float intensity;
      float frequency;
      float offset;
      vec2 components; // wave direction = (cos(angle), sin(angle))
    };

    uniform Wave waves[${waveCount}];
    uniform vec3 colours[${colourCount}];
    uniform float maxIntensity;

    // We also want the resolution (for pixel coords)
    uniform vec2 resolution;

    // Normalises output of sin from [-1,1] to [0,1]
    float normaliseSin(float value) {
      return (value + 1.0) * 0.5;
    }

    vec3 intensityToGradient(float intensity) {
      float lerp = mod(intensity, COLOUR_SEGMENT) / COLOUR_SEGMENT;

      for (int i = 0; i < ${colourCount}; i++) {
        if (int(intensity / COLOUR_SEGMENT) <= i) {
          return mix(colours[i], colours[i + 1], lerp);
        }
      }
      return colours[${colourCount} - 1];
    }

    vec3 hueShift(vec3 color, float shift) {
      float cosAngle = cos(shift);
      return vec3(color * cosAngle + cross(HUE_SHIFT, color) * sin(shift) + HUE_SHIFT * dot(HUE_SHIFT, color) * (1.0 - cosAngle));
    }

    varying vec2 v_uv;

    void main(void) {
      // Get pixel space coord from UV
      vec2 coord = v_uv * resolution;

      float maxScale = max(resolution.x, resolution.y);

      // Accumulate wave values
      float sum = 0.0;
      for (int i = 0; i < ${waveCount}; i++) {
        Wave settings = waves[i];
        vec2 components = settings.components;
        float magnitude = coord.x * components.x + coord.y * components.y;

        float wave = sin((magnitude * settings.frequency / maxScale + settings.offset) * TWO_PI);
        sum += settings.intensity * normaliseSin(wave);
      }

      float shift = mod((coord.x + resolution.y - coord.y) * 0.4 * TWO_PI / (resolution.x + resolution.y), TWO_PI);
      gl_FragColor = vec4(hueShift(intensityToGradient(sum / maxIntensity), shift), 1.0);
    }
  `;
}

/** Compiles a shader, checking for errors */
function compileShader(webgl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = webgl.createShader(type);

  if (!shader) {
    throw new Error('Could not compile shader');
  }

  webgl.shaderSource(shader, source);
  webgl.compileShader(shader);

  // Check for errors
  if (!webgl.getShaderParameter(shader, webgl.COMPILE_STATUS)) {
    const infoLog = webgl.getShaderInfoLog(shader);
    webgl.deleteShader(shader);
    throw new Error('Could not compile shader:\n' + infoLog);
  }
  return shader;
}

function createProgram(webgl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = webgl.createProgram();
  webgl.attachShader(program, vertexShader);
  webgl.attachShader(program, fragmentShader);
  webgl.linkProgram(program);

  // Check linking errors
  if (!webgl.getProgramParameter(program, webgl.LINK_STATUS)) {
    const infoLog = webgl.getProgramInfoLog(program);
    webgl.deleteProgram(program);
    throw new Error('Could not link program:\n' + infoLog);
  }
  return program;
}

/** Updates the colour and wave settings uniforms */
function updateUniforms(
  webgl: WebGLRenderingContext,
  colours: Colour[],
  waveSettings: WaveSettings[],
  locations: Locations,
) {
  for (let i = 0; i < waveSettings.length; i++) {
    const settings = waveSettings[i];
    webgl.uniform1f(locations.waveSettings[i].intensity, settings.intensity);
    webgl.uniform1f(locations.waveSettings[i].frequency, settings.frequency);
    webgl.uniform1f(locations.waveSettings[i].offset, settings.offset);
    webgl.uniform2f(locations.waveSettings[i].components, settings.components.x, settings.components.y);
  }

  for (let i = 0; i < colours.length; i++) {
    const colour = colours[i].map((component) => component / 256) as Colour;
    webgl.uniform3f(locations.colours[i], ...colour);
  }
}

function getWebgl(canvas: HTMLCanvasElement) {
  const webgl = canvas.getContext('webgl');
  if (!webgl) {
    throw new Error('WebGL not supported');
  }
  return webgl;
}

/** Creates wave settings, initialises the WebGL program and uniform locations */
export function initialiseBackground(canvas: HTMLCanvasElement, colourCount: number): BackgroundSettings {
  const webgl = getWebgl(canvas);

  const seed = 42; //Math.floor(Math.random() * 1000000);
  console.log('SEED', seed);
  const generator = new MersenneTwister(seed);

  const waveSettings = times(6, () => createWaveSettings(generator));
  const maxIntensity = waveSettings.reduce((sum, settings) => sum + settings.intensity, 0);

  const fragmentShaderSource = getFragmentShaderSource(waveSettings.length, colourCount);
  const vertexShader = compileShader(webgl, webgl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compileShader(webgl, webgl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(webgl, vertexShader, fragmentShader);
  webgl.useProgram(program);

  webgl.bindBuffer(webgl.ARRAY_BUFFER, webgl.createBuffer());
  webgl.bufferData(webgl.ARRAY_BUFFER, SQUARE_VERTICES, webgl.STATIC_DRAW);

  const positionAttributeLocation = webgl.getAttribLocation(program, 'a_position');
  webgl.enableVertexAttribArray(positionAttributeLocation);
  webgl.vertexAttribPointer(positionAttributeLocation, 2, webgl.FLOAT, false, 0, 0);

  const locations: Locations = {
    waveSettings: [],
    colours: [],
    resolution: webgl.getUniformLocation(program, 'resolution')!,
    maxIntensity: webgl.getUniformLocation(program, 'maxIntensity')!,
  }

  for (let i = 0; i < waveSettings.length; i++) {
    locations.waveSettings.push({
      intensity: webgl.getUniformLocation(program, `waves[${i}].intensity`)!,
      frequency: webgl.getUniformLocation(program, `waves[${i}].frequency`)!,
      offset: webgl.getUniformLocation(program, `waves[${i}].offset`)!,
      components: webgl.getUniformLocation(program, `waves[${i}].components`)!,
    });
  }

  for (let i = 0; i < colourCount; i++) {
    locations.colours.push(webgl.getUniformLocation(program, `colours[${i}]`)!);
  }

  webgl.uniform1f(locations.maxIntensity, maxIntensity);

  return { waveSettings, locations };
}

/** Resize the background, to be called when the window resizes */
export function resizeBackground(canvas: HTMLCanvasElement, locations: Locations) {
  const webgl = getWebgl(canvas);

  const width = Math.floor(window.innerWidth / DOWNSCALE);
  const height = Math.floor(window.innerHeight / DOWNSCALE);
  canvas.width = width;
  canvas.height = height;

  webgl.viewport(0, 0, width, height);
  webgl.uniform2f(locations.resolution, width, height);
}

/** Render the next frame of the background */
export function renderBackground(
  canvas: HTMLCanvasElement, colours: Colour[], { waveSettings, locations }: BackgroundSettings, frames: number,
) {
  const webgl = getWebgl(canvas);

  for (const settings of waveSettings) {
    settings.offset += settings.movement * frames;
  }

  updateUniforms(webgl, colours, waveSettings, locations);

  webgl.clearColor(0.0, 0.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT);
  webgl.drawArrays(webgl.TRIANGLES, 0, 6);
}
