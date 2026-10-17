/* The fresco in particles.
   16k points sampled from the two reaching arms of the Creation of Adam (tools/hands.py).
   The arms never touch: the gap between the fingertips is the air gap, and packets cross it.
   Scroll moves the scene between three states — hands (hero), field (reading), touch (today's flag). */
(function () {
  'use strict';
  var canvas = document.getElementById('stage');
  if (!canvas || !window.THREE || !window.HANDS) return;
  var THREE = window.THREE;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = innerWidth < 700;
  var GAP_X = -0.19, GAP_Y = -0.01;   // the gap between the fingertips, in fresco units

  /* ---------- decode the points ---------- */
  var bin = atob(window.HANDS), bytes = new Uint8Array(bin.length);
  for (var b = 0; b < bin.length; b++) bytes[b] = bin.charCodeAt(b);
  var raw = new Int16Array(bytes.buffer);
  var total = raw.length / 4, stride = small ? 3 : 1, count = Math.floor(total / stride);
  var pos = new Float32Array(count * 3), scat = new Float32Array(count * 3);
  var tone = new Float32Array(count), rnd = new Float32Array(count);
  var seed = 1512;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (var i = 0; i < count; i++) {
    var j = i * stride * 4;
    pos[i * 3] = raw[j] / 32767;
    pos[i * 3 + 1] = raw[j + 1] / 32767;
    pos[i * 3 + 2] = raw[j + 2] / 32767;
    tone[i] = raw[j + 3] / 32767;
    rnd[i] = rand();
    // the reading field: a wide, shallow drift of points, like dust in a chapel
    var r = Math.pow(rand(), 0.6) * 1.7, a = rand() * Math.PI * 2;
    scat[i * 3] = Math.cos(a) * r * 1.6;
    scat[i * 3 + 1] = Math.sin(a) * r * 0.9;
    scat[i * 3 + 2] = (rand() - 0.6) * 1.6;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aScatter', new THREE.BufferAttribute(scat, 3));
  geo.setAttribute('aTone', new THREE.BufferAttribute(tone, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));

  var uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uGap: { value: 0.012 }, uTouch: { value: 0 },
    uSize: { value: small ? 2.4 : 2.2 }, uPR: { value: Math.min(devicePixelRatio || 1, 1.75) },
    uMouse: { value: new THREE.Vector3(9, 9, 0) }, uMouseOn: { value: 0 }, uGapX: { value: GAP_X },
    uColor: { value: new THREE.Color('#eeede9') }, uOpacity: { value: 0 }, uInvert: { value: 0 }, uSafe: { value: -2 }
  };

  var mat = new THREE.ShaderMaterial({
    uniforms: uniforms, transparent: true, depthWrite: false,
    vertexShader: [
      'attribute vec3 aScatter; attribute float aTone; attribute float aRand;',
      'uniform float uTime, uMorph, uGap, uTouch, uSize, uPR, uMouseOn, uGapX, uInvert, uSafe;',
      'uniform vec3 uMouse;',
      'varying float vA;',
      'void main(){',
      '  vec3 p = position;',
      '  float side = p.x < uGapX ? -1.0 : 1.0;',
      '  p.x += side * (uGap - uTouch * (uGap + 0.009));',
      '  p.z += sin(uTime * 0.6 + aRand * 6.283) * 0.012;',
      '  p.y += cos(uTime * 0.5 + aRand * 12.0) * 0.004;',
      '  float m = clamp(uMorph * 1.5 - aRand * 0.5, 0.0, 1.0);',
      '  m = m * m * (3.0 - 2.0 * m);',
      '  vec3 s = aScatter + vec3(sin(uTime * 0.07 + aRand * 20.0), cos(uTime * 0.09 + aRand * 9.0), sin(uTime*0.05 + aRand*3.0)) * 0.08;',
      '  p = mix(p, s, m);',
      '  vec2 d = p.xy - uMouse.xy; float l = length(d);',
      '  float f = uMouseOn * (1.0 - smoothstep(0.0, 0.14, l)) * (1.0 - m);',
      '  p.xy += (d / max(l, 0.0001)) * f * 0.06;',
      '  p.z += f * 0.08;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  float t = mix(aTone, 1.0 - aTone, uInvert);',
      '  gl_PointSize = uSize * uPR * (0.6 + t * 0.7) * (10.0 / -mv.z);',
      '  vA = mix(0.5 + 0.5 * t, 0.42, m);',
      '  float sx = gl_Position.x / gl_Position.w;',
      '  vA *= mix(0.18, 1.0, smoothstep(uSafe, uSafe + 0.35, sx));',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; uniform float uOpacity;',
      'varying float vA;',
      'void main(){',
      '  float d = length(gl_PointCoord - 0.5);',
      '  if (d > 0.5) discard;',
      '  gl_FragColor = vec4(uColor, smoothstep(0.5, 0.32, d) * vA * uOpacity);',
      '}'
    ].join('\n')
  });

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  var group = new THREE.Group();
  var cloud = new THREE.Points(geo, mat);
  group.add(cloud);
  scene.add(group);

  /* ---------- packets crossing the gap ---------- */
  var NP = 28, ppos = new Float32Array(NP * 3), poff = new Float32Array(NP);
  for (var k = 0; k < NP; k++) poff[k] = rand();
  var pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  pgeo.setAttribute('aOff', new THREE.BufferAttribute(poff, 1));
  var pmat = new THREE.ShaderMaterial({
    uniforms: { uColor: uniforms.uColor, uOpacity: { value: 0 }, uPR: uniforms.uPR, uTime: uniforms.uTime, uSpan: { value: 0.03 }, uTouch: uniforms.uTouch },
    transparent: true, depthWrite: false,
    vertexShader: [
      'attribute float aOff; uniform float uPR, uTime, uSpan, uTouch;',
      'varying float vA;',
      'void main(){',
      '  float k = fract(uTime * (0.35 + aOff * 0.4) + aOff);',
      '  float dir = aOff > 0.5 ? 1.0 : -1.0;',
      '  vec3 p = vec3((k - 0.5) * uSpan * dir, sin(k * 3.1416 + aOff * 6.0) * 0.006 + (aOff - 0.5) * 0.01, 0.02);',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = uPR * (2.2 + uTouch * 2.5) * (10.0 / -mv.z);',
      '  vA = sin(k * 3.1416);',
      '}'
    ].join('\n'),
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(uColor, vA*uOpacity); }'
  });
  var packets = new THREE.Points(pgeo, pmat);
  packets.frustumCulled = false;
  packets.position.set(GAP_X, GAP_Y, 0);
  cloud.frustumCulled = false;
  group.add(packets);

  /* ---------- layouts ---------- */
  var W = 1, H = 1, visH = 1, visW = 1;
  // where the gap sits on screen (fractions) and how wide the fresco is (multiples of the viewport width)
  var LAYOUTS = {
    hero:   function () { return small ? { gx: 0.5, gy: 0.8, w: 3.2 } : { gx: 0.64, gy: 0.6, w: 1.7 }; },
    inner:  function () { return small ? { gx: 0.62, gy: 0.86, w: 3.0 } : { gx: 0.72, gy: 0.74, w: 1.25 }; },
    touch:  function () { return small ? { gx: 0.5, gy: 0.2, w: 3.6 } : { gx: 0.5, gy: 0.2, w: 1.45 }; },
    field:  function () { return { gx: 0.5, gy: 0.5, w: small ? 1.6 : 1.1 }; }
  };
  var STATES = {
    hands: { morph: 0, opacity: 1, layout: 'hero' },
    inner: { morph: 0, opacity: 0.9, layout: 'inner' },
    field: { morph: 1, opacity: 0.5, layout: 'field' },
    touch: { morph: 0, opacity: 1, layout: 'touch' }
  };
  var state = STATES[canvas.getAttribute('data-start') || 'hands'];
  var cur = { morph: state.morph, opacity: 0, x: 0, y: 0, s: 1, rotY: 0, rotX: 0, dolly: 0 };
  var heroP = 0, touchTarget = 0, mouse = { x: 0, y: 0, on: 0, nx: 0, ny: 0 };

  function target() {
    var L = LAYOUTS[state.layout]();
    var s = (L.w * visW) / 2;
    var x = visW * (L.gx - 0.5) - GAP_X * s;
    var y = -visH * (L.gy - 0.5) - GAP_Y * s;
    return { s: s, x: x, y: y };
  }

  function resize() {
    W = innerWidth; H = innerHeight; small = W < 700;
    renderer.setPixelRatio(uniforms.uPR.value);
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    visW = visH * camera.aspect;
    uniforms.uSize.value = small ? 2.4 : 2.2;
    var t = target(); cur.x = t.x; cur.y = t.y; cur.s = t.s;
  }
  addEventListener('resize', resize);
  resize();

  /* ---------- pointer: the particles under the hand part ---------- */
  var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), v2 = new THREE.Vector2();
  if (!reduce) {
    addEventListener('pointermove', function (e) {
      mouse.nx = (e.clientX / W) * 2 - 1; mouse.ny = -(e.clientY / H) * 2 + 1; mouse.on = 1;
    }, { passive: true });
    document.addEventListener('pointerleave', function () { mouse.on = 0; });
  }

  /* ---------- colour follows the field ---------- */
  var col = new THREE.Color(), colTarget = new THREE.Color('#eeede9'), invTarget = 0;
  function readColor() {
    var cs = getComputedStyle(document.documentElement);
    var ink = cs.getPropertyValue('--ink').trim(), bg = cs.getPropertyValue('--bg').trim();
    try { colTarget.set(ink || '#eeede9'); } catch (e) {}
    var c = new THREE.Color(); try { c.set(bg || '#030303'); } catch (e) {}
    invTarget = (c.r + c.g + c.b) / 3 > 0.5 ? 1 : 0;
  }
  readColor();
  uniforms.uColor.value.copy(colTarget); uniforms.uInvert.value = invTarget;

  /* ---------- loop ---------- */
  var clock = new THREE.Clock(), running = true, intro = 0;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    var dt = Math.min(clock.getDelta(), 0.05);
    if (!reduce) uniforms.uTime.value += dt;
    var k = reduce ? 1 : 1 - Math.pow(0.0018, dt);         // ~frame-rate independent ease

    var t = target();
    cur.x = lerp(cur.x, t.x, k); cur.y = lerp(cur.y, t.y, k); cur.s = lerp(cur.s, t.s, k);
    cur.morph = lerp(cur.morph, state.morph, k * 0.7);
    cur.opacity = lerp(cur.opacity, state.opacity * intro, k);
    uniforms.uTouch.value = lerp(uniforms.uTouch.value, touchTarget, k * 0.6);
    uniforms.uMorph.value = cur.morph;
    uniforms.uOpacity.value = cur.opacity;
    uniforms.uColor.value.lerp(colTarget, k);
    uniforms.uInvert.value = lerp(uniforms.uInvert.value, invTarget, k);
    pmat.uniforms.uOpacity.value = cur.opacity * (1 - cur.morph) * (0.7 + uniforms.uTouch.value * 0.3);
    pmat.uniforms.uSpan.value = 0.03 + (uniforms.uGap.value - 0.012) * 2;

    // the hero: as you leave it the camera turns toward the gap and leans in
    var hp = state.layout === 'hero' ? heroP : 0;
    var rY = (reduce ? 0 : mouse.nx * 0.12 * mouse.on) - hp * 0.5 + (state.morph ? uniforms.uTime.value * 0.02 % (Math.PI * 2) : 0);
    var rX = (reduce ? 0 : -mouse.ny * 0.08 * mouse.on) + hp * 0.12;
    cur.rotY = lerp(cur.rotY, state.morph ? Math.sin(uniforms.uTime.value * 0.05) * 0.4 : rY, k * 0.6);
    cur.rotX = lerp(cur.rotX, rX, k * 0.6);
    cur.dolly = lerp(cur.dolly, hp * 2.2, k);
    uniforms.uGap.value = 0.012 + hp * 0.02;
    // keep the hero text readable: points behind the left column fade
    uniforms.uSafe.value = lerp(uniforms.uSafe.value, (state.layout === 'hero' || state.layout === 'inner') && !small ? -0.36 : -2, k);

    group.position.set(cur.x, cur.y, cur.dolly);
    group.scale.setScalar(cur.s);
    group.rotation.set(cur.rotX, cur.rotY, 0);

    // pointer into the fresco's own coordinates
    if (mouse.on) {
      v2.set(mouse.nx, mouse.ny); ray.setFromCamera(v2, camera);
      group.updateMatrixWorld();
      if (ray.ray.intersectPlane(plane.set(new THREE.Vector3(0, 0, 1), -cur.dolly), hit)) {
        group.worldToLocal(hit); uniforms.uMouse.value.copy(hit);
      }
    }
    uniforms.uMouseOn.value = lerp(uniforms.uMouseOn.value, mouse.on, k);
    renderer.render(scene, camera);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false; else if (!running) { running = true; clock.getDelta(); frame(); }
  });
  frame();

  window.Scene = {
    set: function (name) { if (STATES[name]) state = STATES[name]; },
    hero: function (p) { heroP = Math.max(0, Math.min(1, p)); },
    touch: function (on) { touchTarget = on ? 1 : 0; },
    color: readColor,
    reveal: function () { intro = 1; }
  };
})();
