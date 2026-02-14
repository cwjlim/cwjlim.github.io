/* ========================================
   Three.js — Subtle 3D Animated Background
   Floating geometric particles with connections
   ======================================== */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // Mouse tracking for parallax
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // ---- Floating Particles ----
  const particleCount = 80;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const spread = 50;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

    velocities.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.004,
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x64ffda,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ---- Connection Lines ----
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x64ffda,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
  });

  let linesGeometry = new THREE.BufferGeometry();
  const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lines);

  // ---- Floating Geometric Shapes ----
  const shapes = [];
  const shapeMaterial = new THREE.MeshBasicMaterial({
    color: 0x64ffda,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });

  // Icosahedrons
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.IcosahedronGeometry(Math.random() * 1.5 + 0.5, 1);
    const mesh = new THREE.Mesh(geo, shapeMaterial.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 10 - 8
    );
    mesh.material.opacity = 0.04 + Math.random() * 0.06;
    mesh.userData = {
      rotSpeed: { x: (Math.random() - 0.5) * 0.003, y: (Math.random() - 0.5) * 0.003 },
      floatSpeed: Math.random() * 0.002 + 0.001,
      floatOffset: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Octahedrons
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.OctahedronGeometry(Math.random() * 1.2 + 0.4, 0);
    const mesh = new THREE.Mesh(geo, shapeMaterial.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 10 - 8
    );
    mesh.material.opacity = 0.04 + Math.random() * 0.06;
    mesh.userData = {
      rotSpeed: { x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.004 },
      floatSpeed: Math.random() * 0.002 + 0.001,
      floatOffset: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Torus
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.TorusGeometry(Math.random() * 1 + 0.5, 0.15, 8, 20);
    const mesh = new THREE.Mesh(geo, shapeMaterial.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 10 - 10
    );
    mesh.material.opacity = 0.03 + Math.random() * 0.05;
    mesh.userData = {
      rotSpeed: { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005 },
      floatSpeed: Math.random() * 0.002 + 0.0005,
      floatOffset: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  // ---- Update Connection Lines ----
  function updateLines() {
    const connectionDistance = 8;
    const linePositions = [];
    const pos = particleGeometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          linePositions.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          linePositions.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
        }
      }
    }

    lines.geometry.dispose();
    const newGeo = new THREE.BufferGeometry();
    newGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lines.geometry = newGeo;
  }

  // ---- Animation Loop ----
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Smooth mouse parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Animate particles
    const pos = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      // Wrap around bounds
      const halfSpread = spread / 2;
      if (pos[i * 3] > halfSpread) pos[i * 3] = -halfSpread;
      if (pos[i * 3] < -halfSpread) pos[i * 3] = halfSpread;
      if (pos[i * 3 + 1] > halfSpread) pos[i * 3 + 1] = -halfSpread;
      if (pos[i * 3 + 1] < -halfSpread) pos[i * 3 + 1] = halfSpread;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Update connection lines every few frames for performance
    if (Math.floor(time * 100) % 3 === 0) {
      updateLines();
    }

    // Animate floating shapes
    shapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotSpeed.x;
      shape.rotation.y += shape.userData.rotSpeed.y;
      shape.position.y += Math.sin(time + shape.userData.floatOffset) * shape.userData.floatSpeed;
    });

    // Camera parallax based on mouse
    camera.position.x = mouse.x * 2;
    camera.position.y = -mouse.y * 2;
    camera.lookAt(scene.position);

    // Subtle scene rotation
    scene.rotation.y = Math.sin(time * 0.1) * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  // ---- Event Listeners ----
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ========================================
     Navbar scroll effect
     ======================================== */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  /* ========================================
     Scroll Reveal — Intersection Observer
     ======================================== */
  const revealElements = document.querySelectorAll(
    '.exp-card, .project-card, .about-content, #contact, .section-title'
  );

  revealElements.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));

  /* ========================================
     Subtle 3D Card Tilt Effect
     ======================================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    const inner = card.querySelector('.exp-card-inner, .project-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });

  /* ========================================
     Smooth scroll for nav links
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
