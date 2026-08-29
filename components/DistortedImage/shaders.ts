// Scroll-pull image distortion — adapted from the concept in
// github.com/olivierlarose/mouse-image-distortion, driven by scroll velocity
// instead of the mouse, and biased so the deformation lives on the top and
// bottom edges: the rectangle "feels the pull" as you scroll and returns flat
// as velocity approaches zero. No idle animation.

export const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uCanvasSize;
  uniform vec2 uImageSize;
  uniform float uVelocity;          // smoothed, normalised scroll velocity (-1..1)
  uniform float uVelocityResponse;  // per-instance multiplier
  uniform vec2 uMouse;              // smoothed pointer, 0..1, y up
  uniform float uHover;             // 0..1 smoothed
  uniform float uIntensity;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 canvas, vec2 image) {
    float canvasRatio = canvas.x / canvas.y;
    float imageRatio = image.x / image.y;
    vec2 scale = canvasRatio > imageRatio
      ? vec2(1.0, imageRatio / canvasRatio)
      : vec2(canvasRatio / imageRatio, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float vel = clamp(uVelocity, -1.0, 1.0) * uVelocityResponse;

    // Edge weight: 0 at the vertical centre, 1 at the top and bottom edges.
    float edge = pow(abs(vUv.y - 0.5) * 2.0, 1.35);
    // Curved bow across x (sin -> zero at the corners, max mid-edge).
    float bow = sin(vUv.x * 3.14159265) * vel * 0.13 * uIntensity;

    vec2 uv = coverUv(vUv, uCanvasSize, uImageSize);
    uv.y -= bow * edge;

    // faint pointer lens carried over from the source effect
    vec2 toMouse = uv - uMouse;
    float lens = smoothstep(0.5, 0.0, length(toMouse)) * uHover;
    uv -= normalize(toMouse + 1e-4) * lens * 0.02 * uIntensity;

    // tiny chromatic split tied to |velocity|
    float ca = (abs(vel) * 0.6 + uHover * 0.3) * uIntensity * 0.0038;
    vec3 col;
    col.r = texture2D(uTexture, uv + vec2(ca, 0.0)).r;
    col.g = texture2D(uTexture, uv).g;
    col.b = texture2D(uTexture, uv - vec2(ca, 0.0)).b;

    // mask any sample that ran past the image instead of smearing the edge
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      col = mix(col, vec3(0.05, 0.045, 0.04), 0.75);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;
