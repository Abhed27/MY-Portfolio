/* ============================================
   Abhed Tyagi Portfolio — Main JavaScript
   Mesh BG, Cloud Infra Viz, Data Stream,
   Parallax, Scroll Animations, Interactions
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // INTRO LOADER & GALAXY EFFECT
  // ============================================
  const introLoader = document.getElementById('intro-loader');
  const progressBar = document.getElementById('progress-bar');
  const galaxyContainer = document.getElementById('galaxy-container');

  if (introLoader) {
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    // Low-density Star Dust (Overlay fixed image)
    const starCount = 30;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star-particle';
      star.style.width = `${Math.random() * 2}px`;
      star.style.height = star.style.width;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = Math.random() * 0.5;
      star.style.animation = `float-star ${Math.random() * 5 + 3}s infinite alternate`;
      galaxyContainer.appendChild(star);
    }

    // Progress Bar Logic
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Brief pause at 100% then fade out
        setTimeout(() => {
          introLoader.classList.add('loaded');
          document.body.style.overflow = '';
          
          // Re-trigger any entrance animations
          if (typeof startCounter === 'function') startCounter();
        }, 500);
      }
      progressBar.style.width = `${progress}%`;
    }, 200);
  }

  // Keyframes for star floating (added via JS injection for simplicity if not in CSS)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-star {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px); opacity: 0.2; }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // MESH GRADIENT BACKGROUND (Moving Clouds)
  // ============================================
  const meshCanvas = document.getElementById('mesh-bg');
  const meshCtx = meshCanvas.getContext('2d');
  let meshW, meshH;

  const meshBlobs = [
    { x: 0.2, y: 0.3, r: 380, color: 'rgba(0, 240, 255, 0.12)', vx: 0.0003, vy: 0.0002 },
    { x: 0.7, y: 0.2, r: 420, color: 'rgba(139, 92, 246, 0.10)', vx: -0.0002, vy: 0.0003 },
    { x: 0.5, y: 0.7, r: 400, color: 'rgba(56, 189, 248, 0.09)', vx: 0.0004, vy: -0.0002 },
    { x: 0.1, y: 0.8, r: 320, color: 'rgba(139, 92, 246, 0.08)', vx: 0.0003, vy: 0.0001 },
    { x: 0.9, y: 0.6, r: 340, color: 'rgba(0, 240, 255, 0.07)', vx: -0.0003, vy: -0.0003 },
    { x: 0.4, y: 0.1, r: 300, color: 'rgba(56, 189, 248, 0.06)', vx: 0.0001, vy: 0.0004 },
  ];

  // Antigravity particles array
  let agParticles = [];

  function initAgParticles() {
    agParticles = [];
    const numParticles = Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 15000));
    for (let i = 0; i < numParticles; i++) {
      agParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(0, 240, 255, 0.5)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(56, 189, 248, 0.4)'
      });
    }
  }

  function resizeMesh() {
    meshW = meshCanvas.width = window.innerWidth;
    meshH = meshCanvas.height = window.innerHeight;
    initAgParticles();
  }

  function drawMesh(time) {
    meshCtx.clearRect(0, 0, meshW, meshH);
    // Dark base
    meshCtx.fillStyle = '#080b1a';
    meshCtx.fillRect(0, 0, meshW, meshH);

    for (const blob of meshBlobs) {
      blob.x += blob.vx;
      blob.y += blob.vy;
      if (blob.x < -0.2 || blob.x > 1.2) blob.vx *= -1;
      if (blob.y < -0.2 || blob.y > 1.2) blob.vy *= -1;

      const cx = blob.x * meshW;
      const cy = blob.y * meshH;
      const r = blob.r * (meshW / 1440);

      const grad = meshCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, blob.color);
      grad.addColorStop(1, 'transparent');
      meshCtx.fillStyle = grad;
      meshCtx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    // Antigravity particles
    for (let i = 0; i < agParticles.length; i++) {
        let p = agParticles[i];
        
        // Base velocity
        p.x += p.vx;
        p.y += p.vy;

        // Bounce edges
        if (p.x < 0 || p.x > meshW) p.vx *= -1;
        if (p.y < 0 || p.y > meshH) p.vy *= -1;

        // Anti-gravity from mouse
        const dx = p.x - realMouseX;
        const dy = p.y - realMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Force field radius
        const forceRadius = 180;
        if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius;
            // Push away (Antigravity)
            p.vx += (dx / dist) * force * 0.8;
            p.vy += (dy / dist) * force * 0.8;
        }

        // Friction / Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.5) {
            p.vx = (p.vx / speed) * 2.5;
            p.vy = (p.vy / speed) * 2.5;
        } else if (speed < 0.5) {
            // Give them a little kick to keep moving
            p.vx += (Math.random() - 0.5) * 0.2;
            p.vy += (Math.random() - 0.5) * 0.2;
        }

        // Draw particle
        meshCtx.beginPath();
        meshCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        meshCtx.fillStyle = p.color;
        meshCtx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < agParticles.length; j++) {
            const p2 = agParticles[j];
            const dx2 = p.x - p2.x;
            const dy2 = p.y - p2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            
            if (dist2 < 120) {
                const alpha = 0.15 * (1 - dist2 / 120);
                const grad = meshCtx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                grad.addColorStop(0, `rgba(0, 240, 255, ${alpha})`);
                grad.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
                meshCtx.beginPath();
                meshCtx.moveTo(p.x, p.y);
                meshCtx.lineTo(p2.x, p2.y);
                meshCtx.strokeStyle = grad;
                meshCtx.lineWidth = 1;
                meshCtx.stroke();
            }
        }
    }

    requestAnimationFrame(drawMesh);
  }

  resizeMesh();
  window.addEventListener('resize', resizeMesh);
  requestAnimationFrame(drawMesh);

  // ============================================
  // 3D CLOUD INFRASTRUCTURE VISUALIZATION
  // ============================================
  const infraCanvas = document.getElementById('cloud-infra');
  const infraCtx = infraCanvas.getContext('2d');
  let infraW, infraH;
  let mouseX = 0.5, mouseY = 0.5;

  // Cloud nodes: central hub + satellite services
  const cloudNodes = [];
  let cloudTime = 0;

  function initInfraNodes() {
    infraW = infraCanvas.width = infraCanvas.offsetWidth;
    infraH = infraCanvas.height = infraCanvas.offsetHeight;
    cloudNodes.length = 0;

    const labels = ['AWS', 'DB', 'CDN', 'API', 'K8s', 'Auth', 'λFn', 'S3', 'LB'];
    const colors = [
      '#00f0ff', '#8b5cf6', '#38bdf8', '#00f0ff', '#8b5cf6',
      '#38bdf8', '#00f0ff', '#8b5cf6', '#38bdf8'
    ];

    // Central hub
    cloudNodes.push({
      type: 'hub',
      x3: 0, y3: 0, z3: 0,
      orbitR: 0, orbitSpeed: 0, orbitAngle: 0, orbitTilt: 0,
      radius: 18,
      color: '#00f0ff',
      label: '☁',
      pulse: Math.random() * Math.PI * 2
    });

    // Orbit ring 1 — inner
    const innerCount = 4;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const tilt = 0.4;
      cloudNodes.push({
        type: 'service',
        orbitR: 0.35,
        orbitSpeed: 0.004 + i * 0.001,
        orbitAngle: angle,
        orbitTilt: tilt,
        orbitAxis: i % 2 === 0 ? 'xz' : 'yz',
        radius: 10,
        color: colors[i],
        label: labels[i],
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Orbit ring 2 — outer
    const outerCount = 5;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2 + 0.3;
      cloudNodes.push({
        type: 'service',
        orbitR: 0.65,
        orbitSpeed: 0.0025 + i * 0.0005,
        orbitAngle: angle,
        orbitTilt: -0.3,
        orbitAxis: i % 2 === 0 ? 'yz' : 'xz',
        radius: 7,
        color: colors[4 + i],
        label: labels[4 + i],
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function getNodePos(node, t) {
    if (node.type === 'hub') return { x: 0, y: 0, z: 0 };
    const a = node.orbitAngle + t * node.orbitSpeed * 60;
    const scl = Math.min(infraW, infraH) * node.orbitR * 0.48;
    const tilt = node.orbitTilt;
    if (node.orbitAxis === 'xz') {
      return {
        x: Math.cos(a) * scl,
        y: Math.sin(a) * scl * Math.sin(tilt),
        z: Math.sin(a) * scl * Math.cos(tilt)
      };
    } else {
      return {
        x: Math.sin(a) * scl * Math.cos(tilt),
        y: Math.cos(a) * scl,
        z: Math.sin(a) * scl * Math.sin(tilt)
      };
    }
  }

  function project(pos, cx, cy, fov) {
    const z = pos.z + fov;
    const scale = fov / z;
    return {
      sx: cx + pos.x * scale,
      sy: cy + pos.y * scale,
      scale
    };
  }

  // Data packets flying between nodes
  const dataPackets = [];
  function spawnPackets() {
    if (dataPackets.length < 20 && Math.random() < 0.08) {
      const from = Math.floor(Math.random() * cloudNodes.length);
      let to = Math.floor(Math.random() * cloudNodes.length);
      if (to === from) to = (from + 1) % cloudNodes.length;
      dataPackets.push({ from, to, t: 0, speed: 0.008 + Math.random() * 0.012 });
    }
  }

  function drawInfra(time) {
    if (!infraW) return;
    infraCtx.clearRect(0, 0, infraW, infraH);
    cloudTime = time * 0.001;

    const cx = infraW / 2;
    const cy = infraH / 2;
    const fov = Math.min(infraW, infraH) * 0.9;
    const rotY = (mouseX - 0.5) * 0.8 + cloudTime * 0.15;
    const rotX = (mouseY - 0.5) * 0.5;

    // Compute rotated positions for each node
    const positions = cloudNodes.map(node => {
      let pos = getNodePos(node, cloudTime);
      // Rotate around Y
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      let x2 = pos.x * cosY - pos.z * sinY;
      let z2 = pos.x * sinY + pos.z * cosY;
      // Rotate around X
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      let y2 = pos.y * cosX - z2 * sinX;
      let z3 = pos.y * sinX + z2 * cosX;
      return { x: x2, y: y2, z: z3 };
    });

    // Sort back-to-front for proper overlap
    const order = positions.map((_, i) => i).sort((a, b) => positions[a].z - positions[b].z);

    // Draw orbit ring outlines
    const ringConfig = [
      { r: 0.35 * Math.min(infraW, infraH) * 0.48, tilt: 0.4, axis: 'xz', color: 'rgba(0,240,255,0.06)' },
      { r: 0.65 * Math.min(infraW, infraH) * 0.48, tilt: -0.3, axis: 'yz', color: 'rgba(139,92,246,0.05)' }
    ];
    ringConfig.forEach(ring => {
      infraCtx.save();
      infraCtx.translate(cx, cy);
      const pts = [];
      for (let a = 0; a <= Math.PI * 2; a += 0.08) {
        let rx, ry, rz;
        if (ring.axis === 'xz') {
          rx = Math.cos(a) * ring.r;
          ry = Math.sin(a) * ring.r * Math.sin(ring.tilt);
          rz = Math.sin(a) * ring.r * Math.cos(ring.tilt);
        } else {
          rx = Math.sin(a) * ring.r * Math.cos(ring.tilt);
          ry = Math.cos(a) * ring.r;
          rz = Math.sin(a) * ring.r * Math.sin(ring.tilt);
        }
        // Apply camera rotations
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        let x2 = rx * cosY - rz * sinY;
        let z2 = rx * sinY + rz * cosY;
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        let y2 = ry * cosX - z2 * sinX;
        let z3 = ry * sinX + z2 * cosX;
        const p = project({ x: x2, y: y2, z: z3 }, 0, 0, fov);
        pts.push(p);
      }
      infraCtx.beginPath();
      pts.forEach((p, i) => i === 0 ? infraCtx.moveTo(p.sx, p.sy) : infraCtx.lineTo(p.sx, p.sy));
      infraCtx.closePath();
      infraCtx.strokeStyle = ring.color;
      infraCtx.lineWidth = 1;
      infraCtx.stroke();
      infraCtx.restore();
    });

    // Draw data beams (connections)
    cloudNodes.forEach((node, i) => {
      if (node.type === 'hub') return;
      const posA = project(positions[0], cx, cy, fov);
      const posB = project(positions[i], cx, cy, fov);
      const alpha = 0.06 + Math.abs(Math.sin(cloudTime * 0.5 + i)) * 0.08;
      const grad = infraCtx.createLinearGradient(posA.sx, posA.sy, posB.sx, posB.sy);
      grad.addColorStop(0, `rgba(0,240,255,${alpha})`);
      grad.addColorStop(1, `rgba(${node.color === '#8b5cf6' ? '139,92,246' : node.color === '#38bdf8' ? '56,189,248' : '0,240,255'},${alpha})`);
      infraCtx.beginPath();
      infraCtx.moveTo(posA.sx, posA.sy);
      infraCtx.lineTo(posB.sx, posB.sy);
      infraCtx.strokeStyle = grad;
      infraCtx.lineWidth = 1;
      infraCtx.stroke();
    });

    // Update & draw data packets
    spawnPackets();
    for (let i = dataPackets.length - 1; i >= 0; i--) {
      const pkt = dataPackets[i];
      pkt.t += pkt.speed;
      if (pkt.t >= 1) { dataPackets.splice(i, 1); continue; }
      const posA = project(positions[pkt.from], cx, cy, fov);
      const posB = project(positions[pkt.to], cx, cy, fov);
      const px = posA.sx + (posB.sx - posA.sx) * pkt.t;
      const py = posA.sy + (posB.sy - posA.sy) * pkt.t;
      const nodeColor = cloudNodes[pkt.to].color;
      const alpha = Math.sin(pkt.t * Math.PI);
      infraCtx.beginPath();
      infraCtx.arc(px, py, 3 * alpha + 1, 0, Math.PI * 2);
      infraCtx.fillStyle = nodeColor + Math.floor(alpha * 200).toString(16).padStart(2, '0');
      infraCtx.shadowColor = nodeColor;
      infraCtx.shadowBlur = 12 * alpha;
      infraCtx.fill();
      infraCtx.shadowBlur = 0;
    }

    // Draw nodes front-to-back
    order.forEach(i => {
      const node = cloudNodes[i];
      const pos = positions[i];
      const p = project(pos, cx, cy, fov);
      const sc = Math.max(0.5, p.scale);
      const r = node.radius * sc;
      const pulse = 0.8 + 0.2 * Math.sin(cloudTime * 2.5 + node.pulse);

      if (node.type === 'hub') {
        // Central glowing cloud hub
        const grd = infraCtx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 3.5);
        grd.addColorStop(0, 'rgba(0,240,255,0.25)');
        grd.addColorStop(0.5, 'rgba(56,189,248,0.12)');
        grd.addColorStop(1, 'rgba(0,240,255,0)');
        infraCtx.beginPath();
        infraCtx.arc(p.sx, p.sy, r * 3.5, 0, Math.PI * 2);
        infraCtx.fillStyle = grd;
        infraCtx.fill();

        // Cloud icon
        infraCtx.beginPath();
        infraCtx.arc(p.sx, p.sy, r * pulse, 0, Math.PI * 2);
        infraCtx.fillStyle = 'rgba(0,15,40,0.85)';
        infraCtx.fill();
        infraCtx.strokeStyle = '#00f0ff';
        infraCtx.lineWidth = 2;
        infraCtx.shadowColor = '#00f0ff';
        infraCtx.shadowBlur = 20;
        infraCtx.stroke();
        infraCtx.shadowBlur = 0;

        infraCtx.font = `bold ${r * 1.1}px Inter`;
        infraCtx.fillStyle = '#00f0ff';
        infraCtx.textAlign = 'center';
        infraCtx.textBaseline = 'middle';
        infraCtx.fillText('☁', p.sx, p.sy);

      } else {
        // Service node
        const hexColor = node.color;
        const glowGrd = infraCtx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 2.5);
        const rgb = hexColor === '#8b5cf6' ? '139,92,246' : hexColor === '#38bdf8' ? '56,189,248' : '0,240,255';
        glowGrd.addColorStop(0, `rgba(${rgb},0.2)`);
        glowGrd.addColorStop(1, `rgba(${rgb},0)`);
        infraCtx.beginPath();
        infraCtx.arc(p.sx, p.sy, r * 2.5, 0, Math.PI * 2);
        infraCtx.fillStyle = glowGrd;
        infraCtx.fill();

        // Hexagon shape
        infraCtx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2 - Math.PI / 6;
          const hx = p.sx + Math.cos(angle) * r * pulse;
          const hy = p.sy + Math.sin(angle) * r * pulse;
          j === 0 ? infraCtx.moveTo(hx, hy) : infraCtx.lineTo(hx, hy);
        }
        infraCtx.closePath();
        infraCtx.fillStyle = 'rgba(6,9,20,0.8)';
        infraCtx.fill();
        infraCtx.strokeStyle = hexColor;
        infraCtx.lineWidth = 1.5;
        infraCtx.shadowColor = hexColor;
        infraCtx.shadowBlur = 10;
        infraCtx.stroke();
        infraCtx.shadowBlur = 0;

        infraCtx.font = `bold ${Math.max(8, r * 0.9)}px Inter`;
        infraCtx.fillStyle = hexColor;
        infraCtx.textAlign = 'center';
        infraCtx.textBaseline = 'middle';
        infraCtx.fillText(node.label, p.sx, p.sy);
      }
    });

    requestAnimationFrame(drawInfra);
  }

  function handleInfraResize() {
    initInfraNodes();
  }

  let realMouseX = -1000;
  let realMouseY = -1000;

  // Mouse tracking for hero and antigravity
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
    realMouseX = e.clientX;
    realMouseY = e.clientY;
  });

  initInfraNodes();
  requestAnimationFrame(drawInfra);
  window.addEventListener('resize', handleInfraResize);

  // ============================================
  // PROJECT DIAGRAM CANVASES
  // ============================================
  function initProjectDiagrams() {
    const diagrams = [
      { id: 'proj-diagram-1', type: 'microservices' },
      { id: 'proj-diagram-2', type: 'pipeline' },
      { id: 'proj-diagram-3', type: 'docker' },
    ];

    diagrams.forEach(({ id, type }) => {
      const container = document.getElementById(id);
      if (!container) return;

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let w, h;

      function resize() {
        w = canvas.width = container.offsetWidth;
        h = canvas.height = container.offsetHeight;
      }

      resize();

      function draw(time) {
        ctx.clearRect(0, 0, w, h);
        const t = time * 0.001;

        if (type === 'microservices') {
          // Draw microservice boxes with connections
          const boxes = [];
          const cols = 4;
          const rows = 3;
          const bw = 40;
          const bh = 28;
          const gx = w / (cols + 1);
          const gy = h / (rows + 1);

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const x = gx * (c + 1) + Math.sin(t + r * 2 + c) * 4;
              const y = gy * (r + 1) + Math.cos(t * 0.8 + c * 2 + r) * 3;
              boxes.push({ x, y });

              ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + Math.sin(t + r + c) * 0.1})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 6);
              ctx.fill();
              ctx.stroke();

              // LED dot
              ctx.fillStyle = `rgba(0, 240, 255, ${0.5 + Math.sin(t * 3 + r * c) * 0.3})`;
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          // Connections
          for (let i = 0; i < boxes.length - 1; i++) {
            if ((i + 1) % cols !== 0) {
              ctx.beginPath();
              ctx.moveTo(boxes[i].x + bw / 2, boxes[i].y);
              ctx.lineTo(boxes[i + 1].x - bw / 2, boxes[i + 1].y);
              ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
              ctx.stroke();
            }
            if (i + cols < boxes.length) {
              ctx.beginPath();
              ctx.moveTo(boxes[i].x, boxes[i].y + bh / 2);
              ctx.lineTo(boxes[i + cols].x, boxes[i + cols].y - bh / 2);
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
              ctx.stroke();
            }
          }
        } else if (type === 'pipeline') {
          // Data pipeline flowing right
          const stages = 5;
          const stageW = w / (stages + 1);
          for (let i = 0; i < stages; i++) {
            const x = stageW * (i + 1);
            const y = h / 2 + Math.sin(t + i) * 15;
            const r = 18 + Math.sin(t * 2 + i) * 3;

            // Connection
            if (i < stages - 1) {
              const nx = stageW * (i + 2);
              const ny = h / 2 + Math.sin(t + i + 1) * 15;
              ctx.beginPath();
              ctx.moveTo(x + r, y);
              ctx.lineTo(nx - r, ny);
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Flowing dot
              const ft = (t * 0.5 + i * 0.3) % 1;
              const fx = x + r + (nx - r - x - r) * ft;
              const fy = y + (ny - y) * ft;
              ctx.beginPath();
              ctx.arc(fx, fy, 3, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(139, 92, 246, ${Math.sin(ft * Math.PI)})`;
              ctx.fill();
            }

            // Hexagon node
            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
              const angle = (j / 6) * Math.PI * 2 - Math.PI / 6;
              const px = x + Math.cos(angle) * r;
              const py = y + Math.sin(angle) * r;
              j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(139, 92, 246, 0.06)';
            ctx.fill();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 + Math.sin(t + i) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else if (type === 'mesh') {
          // Security mesh
          const points = [];
          const count = 20;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const layers = i % 3;
            const r = (0.2 + layers * 0.15) * Math.min(w, h);
            points.push({
              x: w / 2 + Math.cos(angle + t * 0.2) * r + Math.sin(t + i) * 5,
              y: h / 2 + Math.sin(angle + t * 0.2) * r + Math.cos(t + i) * 5,
            });
          }

          // Draw mesh lines
          for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
              const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
              if (d < 120) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - d / 120)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          }

          // Nodes
          points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 + Math.sin(t * 2 + i) * 1, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(139, 92, 246, 0.4)';
            ctx.fill();
          });

          // Central shield
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2 - 25);
          ctx.lineTo(w / 2 + 20, h / 2 - 10);
          ctx.lineTo(w / 2 + 20, h / 2 + 10);
          ctx.lineTo(w / 2, h / 2 + 25);
          ctx.lineTo(w / 2 - 20, h / 2 + 10);
          ctx.lineTo(w / 2 - 20, h / 2 - 10);
          ctx.closePath();
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 + Math.sin(t * 2) * 0.15})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
          ctx.fill();
        } else if (type === 'docker') {
          // Docker container stack visualization
          const containers = [
            { label: 'Tomcat', color: '#00f0ff', port: '8080' },
            { label: 'MySQL',  color: '#8b5cf6', port: '3306' },
            { label: 'App',    color: '#38bdf8', port: '8443' },
          ];
          const cW = Math.min(w * 0.55, 180);
          const cH = 36;
          const gap = 18;
          const totalH = containers.length * (cH + gap) - gap;
          const startY = (h - totalH) / 2;
          const startX = (w - cW) / 2;

          containers.forEach((c, i) => {
            const y = startY + i * (cH + gap);
            const pulse = 0.7 + 0.3 * Math.sin(t * 2.5 + i * 1.1);
            const rgb = c.color === '#8b5cf6' ? '139,92,246' : c.color === '#38bdf8' ? '56,189,248' : '0,240,255';

            // Connecting dashed line between containers
            if (i < containers.length - 1) {
              const ny = y + cH;
              ctx.beginPath();
              ctx.setLineDash([4, 4]);
              ctx.moveTo(startX + cW / 2, ny);
              ctx.lineTo(startX + cW / 2, ny + gap);
              ctx.strokeStyle = `rgba(${rgb}, 0.4)`;
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.setLineDash([]);
              // Flowing packet
              const ft = (t * 0.6 + i * 0.4) % 1;
              ctx.beginPath();
              ctx.arc(startX + cW / 2, ny + ft * gap, 3, 0, Math.PI * 2);
              ctx.fillStyle = c.color;
              ctx.fill();
            }

            // Glow
            ctx.shadowColor = c.color;
            ctx.shadowBlur = 10 * pulse;

            // Container box
            ctx.beginPath();
            ctx.roundRect(startX, y, cW, cH, 6);
            ctx.fillStyle = `rgba(${rgb}, 0.06)`;
            ctx.fill();
            ctx.strokeStyle = `rgba(${rgb}, ${0.35 + 0.2 * pulse})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = c.color;
            ctx.font = `600 12px Inter`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.label, startX + 12, y + cH / 2);

            // Port badge
            const badgeX = startX + cW - 54;
            ctx.beginPath();
            ctx.roundRect(badgeX, y + 8, 46, cH - 16, 4);
            ctx.fillStyle = `rgba(${rgb}, 0.12)`;
            ctx.fill();
            ctx.strokeStyle = `rgba(${rgb}, 0.3)`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = `rgba(${rgb}, 0.9)`;
            ctx.font = `bold 9px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(`:${c.port}`, badgeX + 23, y + cH / 2);

            // Live activity dot
            ctx.beginPath();
            ctx.arc(startX + cW - 10, y + 10, 4, 0, Math.PI * 2);
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 6;
            ctx.fillStyle = `rgba(34, 197, 94, ${0.5 + 0.5 * Math.sin(t * 4 + i)})`;
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }

        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);
      window.addEventListener('resize', resize);
    });
  }

  // Init after DOM
  initProjectDiagrams();


  // ============================================
  // NAVIGATION — Active state & scroll
  // ============================================
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Scroll detection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active section
    const sections = document.querySelectorAll('.section');
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.4 && rect.bottom > 0) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // ============================================
  // SCROLL ANIMATIONS — Intersection Observer
  // ============================================
  const animElements = document.querySelectorAll('.anim-fade-up');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animElements.forEach(el => observer.observe(el));

  // ============================================
  // PARALLAX on sections
  // ============================================
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      const rect = el.getBoundingClientRect();
      const y = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${y}px)`;
    });
  });

  // ============================================
  // TILT EFFECT on cards
  // ============================================
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    });
  });

  // ============================================
  // STAT COUNTER ANIMATION
  // ============================================
  const statNumbers = document.querySelectorAll('.stat-number');
  // Start counter animation
  const startCounter = () => {
    statNumbers.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const duration = 2000; // 2 seconds
      const frameRate = 1000 / 60; // 60 fps
      const totalFrames = duration / frameRate;
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease out
        const current = target * eased;

        if (target % 1 === 0) {
          el.textContent = Math.round(current);
        } else {
          el.textContent = current.toFixed(1);
        }

        if (frame >= totalFrames) {
          el.textContent = target; // Ensure it ends on exact target
          clearInterval(counter);
        }
      }, frameRate);
    });
  };

  // Run as soon as possible, but ensure window is loaded
  if (document.readyState === 'complete') {
    setTimeout(startCounter, 500);
  } else {
    window.addEventListener('load', () => setTimeout(startCounter, 500));
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const origHTML = btn.innerHTML;
    
    // Show sending state
    btn.innerHTML = '<span>Sending...</span>';
    
    // Collect form data and convert to JSON
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Send data using FormSubmit API
    console.log('Sending form data:', data);
    fetch('https://formsubmit.co/ajax/Tyagiabhed02@gmail.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('FormSubmit raw response:', response);
        return response.json();
    })
    .then(data => {
        console.log('FormSubmit JSON response:', data);
        // Success state
        btn.innerHTML = '<span>Message Sent! ✓</span>';
        btn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        setTimeout(() => {
          btn.innerHTML = origHTML;
          btn.style.background = '';
          contactForm.reset();
        }, 3000);
    })
    .catch(error => {
        // Error state
        console.error('Error submitting form:', error);
        btn.innerHTML = '<span>Error! Try Again</span>';
        btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
        setTimeout(() => {
          btn.innerHTML = origHTML;
          btn.style.background = '';
        }, 3000);
    });
  });

  // ============================================
  // SMOOTH SCROLL for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================
  // CUSTOM PLASMA TRAIL CURSOR
  // ============================================
  const cursor = document.getElementById('custom-cursor');
  const trail = document.getElementById('cursor-trail');
  
  if(cursor && trail) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let trailX = mouseX;
    let trailY = mouseY;
    
    // Set initial position
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update basic positions instantly
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      if (Math.random() > 0.6) {
        createParticle(mouseX, mouseY);
      }
    });

    function createParticle(x, y) {
      const p = document.createElement('div');
      p.className = 'cursor-particle';
      document.body.appendChild(p);
      
      const size = Math.random() * 4 + 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      
      // Random drift
      const vx = (Math.random() - 0.5) * 2;
      const vy = (Math.random() - 0.5) * 2;
      let opacity = 1;
      let scale = 1;

      function animateP() {
        opacity -= 0.02;
        scale -= 0.02;
        const currX = parseFloat(p.style.left) + vx;
        const currY = parseFloat(p.style.top) + vy;
        
        p.style.left = currX + 'px';
        p.style.top = currY + 'px';
        p.style.opacity = opacity;
        p.style.transform = `translate(-50%, -50%) scale(${scale})`;

        if (opacity > 0) {
          requestAnimationFrame(animateP);
        } else {
          p.remove();
        }
      }
      requestAnimationFrame(animateP);
    }

    function updateCursor() {
      // Smooth follow for main cursor
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';

      // Lagging trail
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      trail.style.left = trailX + 'px';
      trail.style.top = trailY + 'px';

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover interactions
    document.querySelectorAll('a, button, input, select, textarea, .tech-card, .project-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  // ============================================
  // SYNTHESIZED SOUND EFFECTS
  // ============================================
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
  }

  function playBeep(freq, type, duration, vol) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol || 0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playSwish() {
    initAudio();
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5s white noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter to sound like "swish"
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.3);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  }

  // Initialize audio on first click (browser policy)
  document.addEventListener('click', initAudio, { once: true });

  // Play beep on links
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => playBeep(800, 'sine', 0.1, 0.02));
    el.addEventListener('click', () => playBeep(1200, 'square', 0.1, 0.05));
  });

  // Hover sound on canvas is kept without mini-game
  // ============================================
  // LINUX TERMINAL LOGIC
  // ============================================
  const terminalCommands = {
    'help': 'Available commands: <br> - <span class="accent">whoami</span>: Display my bio<br> - <span class="accent">skills</span>: List technical skills<br> - <span class="accent">contact</span>: Show contact info<br> - <span class="accent">clear</span>: Clear terminal window',
    'whoami': 'Abhed Tyagi<br>B.Tech CS Student @ LPU | Cloud Computing Enthusiast | Aspiring Cloud Engineer',
    'skills': '<span class="accent">[Languages]</span> C/C++, JavaScript, HTML/CSS<br><span class="accent">[Systems]</span> Linux, Bash, Docker, Apache Cloud Stack<br><span class="accent">[Backend]</span> Node.js, Express, MySQL',
    'contact': 'Email: Tyagiabhed02@gmail.com<br>Phone: +91-9821731417<br>Instagram: @tyagi_abhed<br>GitHub: github.com/Abhedtyagi',
    'sudo': 'Nice try... this incident will be reported. 🚨'
  };

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      const input = e.target;
      const val = input.value.trim().toLowerCase();
      const termBody = document.getElementById('terminal-body');
      if (!termBody) return;
      
      console.log('Terminal Command:', val);
      
      if (val === 'clear') {
        termBody.innerHTML = `
          <div class="terminal-input-wrapper">
            <span class="prompt">abhedtyagi@cloud-server:~$</span>
            <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" autofocus />
          </div>
        `;
        const newInput = document.getElementById('terminal-input');
        setTimeout(() => newInput.focus(), 10);
        if (typeof playBeep === 'function') playBeep(400, 'square', 0.1, 0.05);
        return;
      }

      let response = '';
      if (val !== '') {
        response = terminalCommands[val] || `bash: ${val}: command not found. Type 'help'.`;
      }

      // Add history line
      const historyLine = document.createElement('div');
      historyLine.classList.add('terminal-line');
      historyLine.innerHTML = `<span class="prompt">abhedtyagi@cloud-server:~$</span> <span class="command">${val}</span>`;
      input.parentElement.before(historyLine);

      // Add output line
      if (response !== '') {
        const outputLine = document.createElement('div');
        outputLine.classList.add('terminal-output');
        outputLine.innerHTML = response;
        input.parentElement.before(outputLine);
      }

      input.value = '';
      termBody.scrollTop = termBody.scrollHeight;
      if (typeof playBeep === 'function') playBeep(600, 'square', 0.1, 0.05);
    }
  };

  const terminalInit = () => {
    console.log('Terminal Initializing...');
    const termBody = document.getElementById('terminal-body');
    if (termBody) {
      console.log('Terminal body found, attaching listener...');
      termBody.addEventListener('keydown', (e) => {
        if (e.target && e.target.id === 'terminal-input') {
          handleTerminalCommand(e);
        }
      });
      
      // Don't focus on load to avoid jumping scroll, focus is handled by click or nav instead
      // const termInput = document.getElementById('terminal-input');
      // if (termInput) {
      //   console.log('Terminal input found...');
      // }
    } else {
      console.error('Terminal body NOT found!');
    }
  };

  terminalInit();

})();
