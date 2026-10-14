/* =====================================================================
   FLUID CURSOR — WebGL Fluid Simulation
   Compact WebGL fluid simulation (after Pavel Dobryakov, MIT).
   Pastel splats trail the pointer on the #fluid canvas.
   ===================================================================== */
(function fluidCursor(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('fluid');
  if (!canvas) return;
  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
  let gl = canvas.getContext('webgl2', params);
  const isGL2 = !!gl;
  if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
  if (!gl) return;

  let halfFloat, supportLinear;
  if (isGL2) {
    gl.getExtension('EXT_color_buffer_float');
    supportLinear = true; // half-float linear filtering is core in WebGL2
  } else {
    halfFloat = gl.getExtension('OES_texture_half_float');
    supportLinear = !!gl.getExtension('OES_texture_half_float_linear');
    if (!halfFloat) return;
  }
  const HALF = isGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;

  const config = {
    SIM_RES: 128, DYE_RES: 1024,
    DENSITY_DISSIPATION: 1.6, VELOCITY_DISSIPATION: 3.5,
    PRESSURE: 0.8, PRESSURE_ITER: 20, CURL: 3, SPLAT_RADIUS: 0.2, SPLAT_FORCE: 600
  };

  let glFailed = false;
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('fluid shader:', gl.getShaderInfoLog(s));
      glFailed = true;
    }
    return s;
  }
  const baseVS = compile(gl.VERTEX_SHADER, `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
    uniform vec2 texelSize;
    void main(){
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`);
  const FS = {
    copy: `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; uniform sampler2D uTexture;
      void main(){ gl_FragColor = texture2D(uTexture, vUv); }`,
    display: `precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uTexture;
      void main(){ vec3 c = texture2D(uTexture, vUv).rgb; float a = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c, a); }`,
    splat: `precision highp float; precision highp sampler2D; varying vec2 vUv;
      uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
      void main(){
        vec2 p = vUv - point; p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
      }`,
    advection: `precision highp float; precision highp sampler2D; varying vec2 vUv;
      uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform vec2 dyeTexelSize;
      uniform float dt; uniform float dissipation; uniform bool linearFilter;
      vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize){
        vec2 st = uv / tsize - 0.5; vec2 iuv = floor(st); vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main(){
        vec2 coord = vUv - dt * (linearFilter ? texture2D(uVelocity, vUv) : bilerp(uVelocity, vUv, texelSize)).xy * texelSize;
        vec4 result = linearFilter ? texture2D(uSource, coord) : bilerp(uSource, coord, dyeTexelSize);
        gl_FragColor = result / (1.0 + dissipation * dt);
      }`,
    divergence: `precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`,
    curl: `precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`,
    vorticity: `precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main(){
        float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`,
    pressure: `precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main(){
        float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }`,
    gradient: `precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`,
    clear: `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv;
      uniform sampler2D uTexture; uniform float value;
      void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`
  };

  function Program(fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, baseVS);
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(p, 0, 'aPosition');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('fluid link:', gl.getProgramInfoLog(p));
      glFailed = true;
    }
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i).name; uniforms[u] = gl.getUniformLocation(p, u); }
    return { program: p, uniforms, bind(){ gl.useProgram(p); } };
  }
  const progs = {
    copy: Program(FS.copy), display: Program(FS.display), splat: Program(FS.splat),
    advection: Program(FS.advection), divergence: Program(FS.divergence), curl: Program(FS.curl),
    vorticity: Program(FS.vorticity), pressure: Program(FS.pressure), gradient: Program(FS.gradient),
    clear: Program(FS.clear)
  };
  if (glFailed) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  const blit = target => {
    if (target) { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  function fmt(internal, format) { return { internalFormat: internal, format }; }
  const RGBA16F = isGL2 ? gl.RGBA16F : gl.RGBA;
  const RG16F = isGL2 ? gl.RG16F : gl.RGBA;
  const R16F = isGL2 ? gl.R16F : gl.RGBA;
  const RG = isGL2 ? gl.RG : gl.RGBA;
  const RED = isGL2 ? gl.RED : gl.RGBA;

  function supported(internal, format) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, HALF, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.deleteFramebuffer(fbo); gl.deleteTexture(t);
    return ok;
  }
  function pick(internal, format) {
    // fallback chain: requested -> RG16F -> RGBA16F, each verified
    const chain = [[internal, format]];
    if (internal !== RG16F) chain.push([RG16F, RG]);
    if (internal !== RGBA16F) chain.push([RGBA16F, gl.RGBA]);
    for (const [i, f] of chain) if (supported(i, f)) return fmt(i, f);
    return null;
  }
  const fmtDye = pick(RGBA16F, gl.RGBA);
  const fmtVel = pick(RG16F, RG);
  const fmtScalar = pick(R16F, RED);
  if (!fmtDye || !fmtVel || !fmtScalar) return;
  const FILTER = supportLinear ? gl.LINEAR : gl.NEAREST;

  function createFBO(w, h, f, filter) {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, f.internalFormat, w, h, 0, f.format, HALF, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach(id){ gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; } };
  }
  function createDoubleFBO(w, h, f, filter) {
    let a = createFBO(w, h, f, filter), b = createFBO(w, h, f, filter);
    return {
      width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
      get read(){ return a; }, get write(){ return b; },
      swap(){ const t = a; a = b; b = t; }
    };
  }
  function getResolution(base) {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(base), max = Math.round(base * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
  }

  let dye, velocity, divergence, curl, pressure;
  function carryOver(oldFBO, newFBO) {
    // copy the previous field into the resized buffers so trails survive a resize
    gl.disable(gl.BLEND);
    progs.copy.bind();
    gl.uniform1i(progs.copy.uniforms.uTexture, oldFBO.read.attach(0));
    blit(newFBO.write);
    newFBO.swap();
  }
  function initFramebuffers() {
    const sim = getResolution(config.SIM_RES), dyeRes = getResolution(config.DYE_RES);
    const newDye = createDoubleFBO(dyeRes.width, dyeRes.height, fmtDye, FILTER);
    const newVel = createDoubleFBO(sim.width, sim.height, fmtVel, FILTER);
    if (dye) carryOver(dye, newDye);
    if (velocity) carryOver(velocity, newVel);
    dye = newDye;
    velocity = newVel;
    divergence = createFBO(sim.width, sim.height, fmtScalar, gl.NEAREST);
    curl = createFBO(sim.width, sim.height, fmtScalar, gl.NEAREST);
    pressure = createDoubleFBO(sim.width, sim.height, fmtScalar, gl.NEAREST);
  }
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width === w && canvas.height === h) return false;
    // ignore small height-only changes (mobile address bar) so the sim isn't wiped mid-scroll
    if (coarsePointer && canvas.width === w && Math.abs(canvas.height - h) < 160 * dpr) return false;
    canvas.width = w; canvas.height = h;
    return true;
  }
  resizeCanvas();
  initFramebuffers();

  function HSVtoRGB(h, s, v) {
    const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    const m = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i % 6];
    return { r: m[0], g: m[1], b: m[2] };
  }
  function generateColor() {
    const c = HSVtoRGB(Math.random(), 1.0, 1.0);
    return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
  }

  const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, primed: false, color: generateColor() };
  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width, y = 1 - (clientY - rect.top) / rect.height;
    if (!pointer.primed) { pointer.primed = true; pointer.x = x; pointer.y = y; return; }
    pointer.dx = (x - pointer.x) * 6; pointer.dy = (y - pointer.y) * 6;
    pointer.x = x; pointer.y = y;
    pointer.moved = Math.abs(pointer.dx) > 0.0001 || Math.abs(pointer.dy) > 0.0001;
  }
  let lastColorTime = 0;
  window.addEventListener('pointermove', e => {
    updatePointer(e.clientX, e.clientY);
    const now = performance.now();
    if (now - lastColorTime > 600) { pointer.color = generateColor(); lastColorTime = now; }
    canvas.classList.add('on');
  }, { passive: true });

  function splat(x, y, dx, dy, color) {
    gl.disable(gl.BLEND);
    progs.splat.bind();
    gl.uniform1i(progs.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(progs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(progs.splat.uniforms.point, x, y);
    gl.uniform3f(progs.splat.uniforms.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0);
    gl.uniform1f(progs.splat.uniforms.radius, (config.SPLAT_RADIUS / 100) * (canvas.width / canvas.height > 1 ? canvas.width / canvas.height : 1));
    blit(velocity.write); velocity.swap();
    gl.uniform1i(progs.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(progs.splat.uniforms.color, color.r, color.g, color.b);
    blit(dye.write); dye.swap();
  }

  function step(dt) {
    gl.disable(gl.BLEND);
    progs.curl.bind();
    gl.uniform2f(progs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progs.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    progs.vorticity.bind();
    gl.uniform2f(progs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progs.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(progs.vorticity.uniforms.curl, config.CURL);
    gl.uniform1f(progs.vorticity.uniforms.dt, dt);
    blit(velocity.write); velocity.swap();

    progs.divergence.bind();
    gl.uniform2f(progs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progs.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    progs.clear.bind();
    gl.uniform1i(progs.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(progs.clear.uniforms.value, config.PRESSURE);
    blit(pressure.write); pressure.swap();

    progs.pressure.bind();
    gl.uniform2f(progs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progs.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITER; i++) {
      gl.uniform1i(progs.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    progs.gradient.bind();
    gl.uniform2f(progs.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progs.gradient.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(progs.gradient.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    progs.advection.bind();
    gl.uniform2f(progs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform2f(progs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progs.advection.uniforms.linearFilter, supportLinear ? 1 : 0);
    const velId = velocity.read.attach(0);
    gl.uniform1i(progs.advection.uniforms.uVelocity, velId);
    gl.uniform1i(progs.advection.uniforms.uSource, velId);
    gl.uniform1f(progs.advection.uniforms.dt, dt);
    gl.uniform1f(progs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write); velocity.swap();

    gl.uniform2f(progs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(progs.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progs.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(progs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write); dye.swap();
  }

  function render() {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    progs.display.bind();
    gl.uniform1i(progs.display.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  }

  let lastTime = performance.now(), fluidRaf = 0;
  function frame() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 1 / 60);
    lastTime = now;
    if (resizeCanvas()) initFramebuffers();
    if (pointer.moved) {
      splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
      pointer.moved = false;
    }
    step(dt);
    render();
    fluidRaf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(fluidRaf);
    else { lastTime = performance.now(); fluidRaf = requestAnimationFrame(frame); }
  });
  // a gentle intro splat so the canvas isn't empty before the first move
  pointer.color = generateColor();
  splat(0.5, 0.55, 0.004, 0.002, pointer.color);
  canvas.classList.add('on');
  fluidRaf = requestAnimationFrame(frame);
})();
