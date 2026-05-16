
// ════════════════════════════════════════════
//  CURSOR
// ════════════════════════════════════════════
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let cx = 0, cy = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
(function moveCursor() {
  cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
  rx += (cx - rx) * 0.12; ry += (cy - ry) * 0.12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(moveCursor);
})();
document.querySelectorAll('a,button,.sv-item,.mitem,.tc,.wcard,.exp-block').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-grow'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-grow'));
});

// ════════════════════════════════════════════
//  PRELOADER
// ════════════════════════════════════════════
const preLogo = document.getElementById('pre-logo');
const preCount = document.getElementById('pre-count');
const preBar = document.getElementById('pre-bar');
setTimeout(() => preLogo.classList.add('show'), 200);
let pct = 0;
const preInterval = setInterval(() => {
  pct += Math.random() * 2.8 + 0.5;
  if (pct >= 100) { pct = 100; clearInterval(preInterval); showSite(); }
  preCount.textContent = Math.floor(pct);
  preBar.style.width = pct + '%';
}, 45);
function showSite() {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    pre.style.transition = 'transform 1.2s cubic-bezier(.76,0,.24,1)';
    pre.style.transform = 'translateY(-100%)';
    setTimeout(revealHero, 500);
  }, 300);
}

// ════════════════════════════════════════════
//  HERO REVEAL
// ════════════════════════════════════════════
function revealHero() {
  document.querySelectorAll('#hero .rl .ri').forEach(el => {
    el.style.transform = 'translateY(0)';
  });
  document.querySelectorAll('#hero .fade-up').forEach(el => {
    el.classList.add('in-view');
  });
}

// ════════════════════════════════════════════
//  NAVBAR
// ════════════════════════════════════════════
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => { nav.classList.toggle('stuck', window.scrollY > 80); });

// ════════════════════════════════════════════
//  THREE.JS — SCENE 1: HERO ORB
// ════════════════════════════════════════════
(function initHeroScene() {
  const canvas = document.getElementById('three-hero');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  renderer.setSize(W, H);
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.set(0, 0, 7);

  // Particle field (background)
  const pGeo = new THREE.BufferGeometry();
  const pCount = 600;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 22;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xC8A96B, size: 0.025, transparent: true, opacity: 0.5 })));

  // Metallic orb
  const orbGeo = new THREE.IcosahedronGeometry(2, 5);
  const orbMat = new THREE.MeshStandardMaterial({ color: 0xC8A96B, metalness: 1.0, roughness: 0.05 });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.set(2.2, -0.1, 0);
  scene.add(orb);

  // Wireframe cage (outer shell)
  const cageGeo = new THREE.IcosahedronGeometry(2.12, 2);
  const cage = new THREE.Mesh(cageGeo, new THREE.MeshBasicMaterial({ wireframe: true, color: 0xC8A96B, transparent: true, opacity: 0.18 }));
  cage.position.copy(orb.position);
  scene.add(cage);

  // Slow outer cage (different frequency)
  const cageGeo2 = new THREE.IcosahedronGeometry(2.4, 1);
  const cage2 = new THREE.Mesh(cageGeo2, new THREE.MeshBasicMaterial({ wireframe: true, color: 0x7A5CFF, transparent: true, opacity: 0.08 }));
  cage2.position.copy(orb.position);
  scene.add(cage2);

  // Ring around orb
  const ringGeo = new THREE.TorusGeometry(3, 0.008, 8, 120);
  const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xC8A96B, transparent: true, opacity: 0.3 }));
  ringMesh.position.copy(orb.position);
  ringMesh.rotation.x = Math.PI / 2.5;
  scene.add(ringMesh);

  // Lights
  scene.add(new THREE.AmbientLight(0x111111, 1));
  const goldLight = new THREE.PointLight(0xC8A96B, 6, 15);
  goldLight.position.set(4, 3, 3);
  scene.add(goldLight);
  const violetLight = new THREE.PointLight(0x7A5CFF, 4, 15);
  violetLight.position.set(-3, -2, 4);
  scene.add(violetLight);
  const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  rimLight.position.set(-5, 5, -3);
  scene.add(rimLight);

  // Mouse
  let mxN = 0, myN = 0;
  document.addEventListener('mousemove', e => {
    mxN = (e.clientX / window.innerWidth - 0.5) * 2;
    myN = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // Orb breathing + rotation
    const breathe = 1 + Math.sin(t * 1.2) * 0.025;
    orb.scale.set(breathe, breathe, breathe);
    orb.rotation.y += 0.004;
    orb.rotation.x += (myN * 0.4 - orb.rotation.x) * 0.04;

    // Cage rotates opposite / different speed
    cage.rotation.y -= 0.003;
    cage.rotation.x -= 0.002;
    cage.scale.set(breathe, breathe, breathe);
    cage2.rotation.y += 0.0015;
    cage2.rotation.z -= 0.001;

    // Ring
    ringMesh.rotation.z += 0.002;

    // Orbit lights
    goldLight.position.x = orb.position.x + Math.sin(t * 0.7) * 4;
    goldLight.position.y = Math.cos(t * 0.5) * 3;
    violetLight.position.x = orb.position.x + Math.cos(t * 0.6) * 4;
    violetLight.position.z = Math.sin(t * 0.4) * 5;

    // Camera gentle sway following mouse
    camera.position.x += (mxN * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (-myN * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(orb.position);

    renderer.render(scene, camera);
  }
  animate();
})();

// ════════════════════════════════════════════
//  THREE.JS — SCENE 2: WAVE DIVIDER
// ════════════════════════════════════════════
(function initWaveScene() {
  const canvas = document.getElementById('three-wave');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  function getSize() { return { W: canvas.offsetWidth, H: canvas.offsetHeight }; }
  let { W, H } = getSize();
  renderer.setSize(W, H);
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 5, 8);
  camera.lookAt(0, 0, 0);

  // Gold wireframe wave
  const wGeo = new THREE.PlaneGeometry(22, 14, 90, 55);
  wGeo.rotateX(-Math.PI / 2);
  const origPos = wGeo.attributes.position.array.slice();
  const wMat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xC8A96B, transparent: true, opacity: 0.22 });
  const wave = new THREE.Mesh(wGeo, wMat);
  scene.add(wave);

  // Second wave layer (violet)
  const wGeo2 = new THREE.PlaneGeometry(22, 14, 45, 28);
  wGeo2.rotateX(-Math.PI / 2);
  const origPos2 = wGeo2.attributes.position.array.slice();
  const wave2 = new THREE.Mesh(wGeo2, new THREE.MeshBasicMaterial({ wireframe: true, color: 0x7A5CFF, transparent: true, opacity: 0.08 }));
  wave2.position.y = -0.05;
  scene.add(wave2);

  // Ambient glow
  scene.add(new THREE.AmbientLight(0xC8A96B, 0.3));

  window.addEventListener('resize', () => {
    const { W, H } = getSize();
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  });

  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const sec = document.getElementById('wave-section');
    const rect = sec.getBoundingClientRect();
    scrollProgress = Math.max(0, Math.min(1, 1 - (rect.top + rect.height) / (window.innerHeight + rect.height)));
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012;
    const intensity = 0.35 + scrollProgress * 0.4;

    // Displace wave vertices
    const pos = wGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = origPos[i], z = origPos[i + 2];
      pos[i + 1] = Math.sin(x * 0.5 + t * 1.4) * intensity
                 + Math.sin(z * 0.6 + t * 1.1) * intensity * 0.7
                 + Math.sin((x + z) * 0.3 + t * 0.8) * intensity * 0.5;
    }
    wGeo.attributes.position.needsUpdate = true;

    const pos2 = wGeo2.attributes.position.array;
    for (let i = 0; i < pos2.length; i += 3) {
      const x = origPos2[i], z = origPos2[i + 2];
      pos2[i + 1] = Math.sin(x * 0.4 + t * 1.0) * intensity * 0.8
                  + Math.sin(z * 0.5 + t * 0.9) * intensity * 0.5;
    }
    wGeo2.attributes.position.needsUpdate = true;

    // Camera gentle float
    camera.position.y = 5 + Math.sin(t * 0.3) * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();

// ════════════════════════════════════════════
//  THREE.JS — SCENE 3: CTA TORUS KNOT
// ════════════════════════════════════════════
(function initCtaScene() {
  const canvas = document.getElementById('three-cta');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  let W = canvas.offsetWidth, H = canvas.offsetHeight;
  renderer.setSize(W, H);
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Solid torus knot
  const kGeo = new THREE.TorusKnotGeometry(2.2, 0.55, 250, 50, 2, 3);
  const kMat = new THREE.MeshStandardMaterial({ color: 0xC8A96B, metalness: 0.95, roughness: 0.08 });
  const knot = new THREE.Mesh(kGeo, kMat);
  scene.add(knot);

  // Wireframe overlay
  const kWire = new THREE.Mesh(kGeo, new THREE.MeshBasicMaterial({ wireframe: true, color: 0xC8A96B, transparent: true, opacity: 0.15 }));
  scene.add(kWire);

  // Particle halo
  const haloGeo = new THREE.BufferGeometry();
  const hCount = 400;
  const hPos = new Float32Array(hCount * 3);
  for (let i = 0; i < hCount; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = 4 + Math.random() * 4;
    hPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    hPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    hPos[i * 3 + 2] = r * Math.cos(theta);
  }
  haloGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
  scene.add(new THREE.Points(haloGeo, new THREE.PointsMaterial({ color: 0xC8A96B, size: 0.03, transparent: true, opacity: 0.6 })));

  // Lights
  scene.add(new THREE.AmbientLight(0x0a0808, 2));
  const gl1 = new THREE.PointLight(0xC8A96B, 8, 20);
  gl1.position.set(4, 4, 3);
  scene.add(gl1);
  const gl2 = new THREE.PointLight(0x7A5CFF, 5, 20);
  gl2.position.set(-4, -3, 4);
  scene.add(gl2);
  const gl3 = new THREE.PointLight(0xFFB800, 3, 15);
  gl3.position.set(0, -5, 2);
  scene.add(gl3);

  let mxN = 0, myN = 0;
  document.addEventListener('mousemove', e => {
    mxN = (e.clientX / window.innerWidth - 0.5);
    myN = (e.clientY / window.innerHeight - 0.5);
  });

  window.addEventListener('resize', () => {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.006;
    knot.rotation.x += 0.004;
    knot.rotation.y += 0.007;
    knot.rotation.z += 0.002;
    kWire.rotation.x = knot.rotation.x + 0.01;
    kWire.rotation.y = knot.rotation.y - 0.005;
    kWire.rotation.z = knot.rotation.z;

    // Orbit lights
    gl1.position.x = Math.sin(t * 0.6) * 6;
    gl1.position.y = Math.cos(t * 0.4) * 4;
    gl2.position.x = Math.cos(t * 0.5) * 6;
    gl2.position.z = Math.sin(t * 0.3) * 5;

    // Mouse tilt camera
    camera.position.x += (mxN * 2 - camera.position.x) * 0.05;
    camera.position.y += (-myN * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();

// ════════════════════════════════════════════
//  EXPERIENCE CANVASES (2D)
// ════════════════════════════════════════════
document.querySelectorAll('.exp-canvas').forEach(canvas => {
  const ctx = canvas.getContext('2d');
  const c1 = canvas.dataset.c1, c2 = canvas.dataset.c2, bg = canvas.dataset.c3 || '#0a0a12';
  let W, H, t = Math.random() * 100;
  const pts = Array.from({ length: 70 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - .5) * .0015, vy: (Math.random() - .5) * .0015
  }));
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize(); new ResizeObserver(resize).observe(canvas);
  function draw() {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      const r = 2 + 2 * (0.5 + 0.5 * Math.sin(t * .04 + p.x * 8));
      ctx.beginPath(); ctx.arc(p.x * W, p.y * H, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.sin(t * .03) > 0 ? c1 + '55' : c2 + '55'; ctx.fill();
    });
    // Connect nearby
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = (pts[i].x - pts[j].x) * W, dy = (pts[i].y - pts[j].y) * H;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          ctx.beginPath();
          ctx.strokeStyle = c1 + Math.floor((1 - d / 80) * 40).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x * W, pts[i].y * H);
          ctx.lineTo(pts[j].x * W, pts[j].y * H);
          ctx.stroke();
        }
      }
    }
    t++; requestAnimationFrame(draw);
  }
  draw();
});

// ════════════════════════════════════════════
//  GALLERY CANVASES
// ════════════════════════════════════════════
document.querySelectorAll('.gc').forEach((canvas, idx) => {
  const ctx = canvas.getContext('2d');
  const c1 = canvas.dataset.c1, c2 = canvas.dataset.c2;
  const bgs = ['#0d0a1e','#1a0e00','#0a1a0e','#0a0a1a','#1a0a0a','#0e1a0a','#0a0e1a','#1a0e1a'];
  const bg = bgs[idx % bgs.length];
  let W, H, t = idx * 20;
  const bars = Array.from({ length: 16 }, (_, i) => ({ h: Math.random(), phase: i * 0.4 + Math.random() }));
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width; H = canvas.height = rect.height;
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);
  function draw() {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    bars.forEach((b, i) => {
      b.h = 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(t * 0.035 + b.phase));
      const bw = W / bars.length;
      const bh = b.h * H * 0.55;
      const g = ctx.createLinearGradient(0, H - bh, 0, H);
      g.addColorStop(0, c1 + 'AA'); g.addColorStop(0.5, c2 + '55'); g.addColorStop(1, c1 + '11');
      ctx.fillStyle = g;
      ctx.fillRect(i * bw + 1, H - bh, bw - 2, bh);
    });
    // Scan line
    const scanY = (H * (0.5 + 0.5 * Math.sin(t * 0.02)));
    const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, c1 + '20');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 30, W, 60);
    t++; requestAnimationFrame(draw);
  }
  draw();
});

// ════════════════════════════════════════════
//  HORIZONTAL STORY SCROLL
// ════════════════════════════════════════════
const storySection = document.getElementById('story');
const storyTrack = document.getElementById('story-track');
const storyDots = document.querySelectorAll('.sp-dot');
function updateStory() {
  const rect = storySection.getBoundingClientRect();
  const totalScroll = storySection.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
  const maxX = storyTrack.scrollWidth - window.innerWidth;
  storyTrack.style.transform = `translateX(${-maxX * progress}px)`;
  const activeIndex = Math.round(progress * 4);
  storyDots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
}
window.addEventListener('scroll', updateStory);
updateStory();

// ════════════════════════════════════════════
//  TIMELINE SCROLL
// ════════════════════════════════════════════
const tlProg = document.getElementById('tl-prog');
const tlSteps = document.querySelectorAll('.tl-step');
function updateTimeline() {
  const tlSection = document.getElementById('timeline');
  if (!tlSection) return;
  const rect = tlSection.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, (-rect.top + window.innerHeight * .5) / (rect.height * .65)));
  tlProg.style.width = (p * 100) + '%';
  tlSteps.forEach((step, i) => {
    step.classList.toggle('lit', p > i / tlSteps.length);
  });
}
window.addEventListener('scroll', updateTimeline);

// ════════════════════════════════════════════
//  INTERSECTION OBSERVER (reveals)
// ════════════════════════════════════════════
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.12 });
document.querySelectorAll('.rl,.fade-up,.sv-item').forEach(el => {
  if (!el.closest('#hero') && !el.closest('#cta')) obs.observe(el);
});
// CTA hero lines reveal when section enters view
const ctaObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('#cta .ri').forEach(ri => ri.style.transform = 'translateY(0)');
  }
}, { threshold: 0.3 });
const ctaSection = document.getElementById('cta');
if (ctaSection) ctaObs.observe(ctaSection);

// ════════════════════════════════════════════
//  COUNTERS
// ════════════════════════════════════════════
let counted = false;
const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('.stat-n[data-target]').forEach(el => {
      const target = +el.dataset.target, isLarge = target >= 1000;
      let val = 0;
      const step = target / 70;
      const timer = setInterval(() => {
        val += step;
        if (val >= target) { val = target; clearInterval(timer); }
        el.textContent = isLarge ? Math.round(val).toLocaleString() + '+' : Math.round(val) + '+';
      }, 22);
    });
  }
}, { threshold: 0.4 });
const whySec = document.getElementById('why');
if (whySec) statsObs.observe(whySec);

// ════════════════════════════════════════════
//  MAGNETIC BUTTONS
// ════════════════════════════════════════════
document.querySelectorAll('.mag').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    el.style.transition = 'transform 0.1s linear';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0,0)';
    el.style.transition = 'transform 0.6s cubic-bezier(.16,1,.3,1)';
  });
});
