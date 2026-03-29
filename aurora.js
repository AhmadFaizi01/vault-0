/* ============================================================
   aurora.js — WebGL aurora background renderer
   Exposes: window.auroraSetColor(r, g, b)
   ============================================================ */
(function () {
  const canvas = document.getElementById('aurora-canvas');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!gl) return;

  let C = { r: 0.545, g: 0.431, b: 0.961 };
  let tC = { ...C };

  window.auroraSetColor = (r, g, b) => {
    tC = { r, g, b };
  };

  const vertexShaderSrc = `
    attribute vec2 p;
    void main() {
      gl_Position = vec4(p, 0., 1.);
    }
  `;

  const fragmentShaderSrc = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_t;
    uniform vec3 u_col;

    float hash(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
      return mix(
        mix(hash(i), hash(i + vec2(1, 0)), u.x),
        mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0., a = .5;
      mat2 r = mat2(.866, .5, -.5, .866);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = r * p * 2.1 + vec2(1.7, 9.2);
        a *= .5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      uv.y = 1. - uv.y;
      float t = u_t * .12;
      vec2 q = vec2(fbm(uv + t * .5), fbm(uv + vec2(5.2, 1.3) + t * .4));
      vec2 r = vec2(fbm(uv + 4. * q + vec2(1.7, 9.2) + t * .3), fbm(uv + 4. * q + vec2(8.3, 2.8) + t * .35));
      vec2 s = vec2(fbm(uv + 3.5 * r + vec2(3.1, 7.4) + t * .25), fbm(uv + 3.5 * r + vec2(6.4, 4.1) + t * .28));
      float f = fbm(uv + 3. * s);
      float plasma = pow(clamp(f * f * f + .7 * f * f + .3 * f, 0., 1.), 1.4)
        * smoothstep(1., -.2, uv.y * 1.6 - .2);
      float band = pow(clamp(fbm(uv * vec2(1., 2.) + s + t * .2), 0., 1.), 2.5)
        * smoothstep(-.2, .5, uv.y) * smoothstep(1., .4, uv.y) * .5;
      float total = plasma + band;
      vec3 col1 = u_col * 1.6;
      vec3 col2 = u_col * .4 + vec3(0., .05, .2);
      vec3 color = mix(mix(vec3(0.), col2, smoothstep(0., .4, total)), col1, smoothstep(.3, .8, total));
      color += col1 * smoothstep(.7, 1., fbm(uv + s * .5 + vec2(.012, 0.))) * .18
             + vec3(.2, .4, 1.) * smoothstep(.72, 1., fbm(uv + s * .5 - vec2(.012, 0.))) * .12;
      gl_FragColor = vec4(color, clamp(total * .72, 0., 1.));
    }
  `;

  function compileShader(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSrc));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSrc));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTime = gl.getUniformLocation(program, 'u_t');
  const uCol = gl.getUniformLocation(program, 'u_col');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  addEventListener('resize', resize);
  resize();

  const lerp = (a, b, t) => a + (b - a) * t;
  const startTime = performance.now();

  (function frame(now) {
    C.r = lerp(C.r, tC.r, 0.03);
    C.g = lerp(C.g, tC.g, 0.03);
    C.b = lerp(C.b, tC.b, 0.03);
    const t = (now - startTime) / 1000;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform3f(uCol, C.r, C.g, C.b);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  })();
})();
