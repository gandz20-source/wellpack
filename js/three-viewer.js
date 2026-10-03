// ==========================================================
// VISOR 3D INTERACTIVO - BOLSA AL VACÍO INDUSTRIAL
// Three.js + Scroll-Triggered Rotation
// ==========================================================

export function initThreeViewer(containerId, config = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const THREE = window.THREE;
  if (!THREE) {
    console.warn('Three.js no está cargado');
    return null;
  }

  // 1. Configuración de Escena y Cámara
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 4.2);

  // 2. Renderer con alta calidad
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 3. Luces de estudio industrial
  const ambientLight = new THREE.AmbientLight(0xdff4fc, 0.9);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
  mainLight.position.set(5, 5, 4);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x06b6d4, 3.0);
  rimLight.position.set(-5, -3, -2);
  scene.add(rimLight);

  const topLight = new THREE.PointLight(0xffffff, 1.8, 10);
  topLight.position.set(0, 3, 2);
  scene.add(topLight);

  // 4. Construcción del modelo 3D Procedural de Bolsa al Vacío
  const pouchGroup = new THREE.Group();
  scene.add(pouchGroup);

  // Material de polímero multicapa (barrera EVOH / polietileno de alta densidad)
  const pouchMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1e3a5f,
    metalness: 0.15,
    roughness: 0.22,
    transmission: 0.65, // Efecto translúcido de polímero al vacío
    opacity: 0.92,
    transparent: true,
    ior: 1.48,
    reflectivity: 0.8,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
    wireframe: false
  });

  // Cuerpo principal de la bolsa al vacío (forma comprimida)
  const bodyGeo = new THREE.BoxGeometry(1.7, 2.3, 0.38, 24, 32, 8);
  
  // Deformar los vértices para simular el efecto de succión al vacío y bordes termosellados
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Bordes termosellados exteriores (los 3 lados y pestaña superior)
    const isEdgeX = Math.abs(x) > 0.72;
    const isEdgeY = Math.abs(y) > 0.98;

    if (isEdgeX || isEdgeY) {
      pos.setZ(i, z * 0.12); // Aplastamiento en bordes termosellados
    } else {
      // Arrugas orgánicas de empaque al vacío
      const wrinkle = Math.sin(y * 8) * Math.cos(x * 6) * 0.04;
      pos.setZ(i, z * 1.1 + wrinkle);
    }
  }
  bodyGeo.computeVertexNormals();
  const pouchMesh = new THREE.Mesh(bodyGeo, pouchMaterial);
  pouchGroup.add(pouchMesh);

  // Borde de sellado estriado (crimp seal) superior e inferior
  const sealMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.7
  });
  const sealTopGeo = new THREE.BoxGeometry(1.82, 0.16, 0.06);
  const sealTop = new THREE.Mesh(sealTopGeo, sealMaterial);
  sealTop.position.set(0, 1.18, 0);
  pouchGroup.add(sealTop);

  const sealBottomGeo = new THREE.BoxGeometry(1.82, 0.12, 0.06);
  const sealBottom = new THREE.Mesh(sealBottomGeo, sealMaterial);
  sealBottom.position.set(0, -1.18, 0);
  pouchGroup.add(sealBottom);

  // Etiqueta holográfica / Sello de Grado Alimentario FDA interior
  const labelGeo = new THREE.PlaneGeometry(1.1, 0.7);
  const labelMaterial = new THREE.MeshBasicMaterial({
    color: 0x0e7490,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
  labelMesh.position.set(0, 0.25, 0.21);
  pouchGroup.add(labelMesh);

  // Indicador de "BIOBÍO SEAFOOD PACK"
  const tagGeo = new THREE.BoxGeometry(0.8, 0.18, 0.02);
  const tagMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    roughness: 0.2
  });
  const tagMesh = new THREE.Mesh(tagGeo, tagMat);
  tagMesh.position.set(0, -0.35, 0.22);
  pouchGroup.add(tagMesh);

  // 5. Interacción de Scroll y Rotación ("scroll_rotate")
  let targetRotationY = 0;
  let targetRotationX = 0;
  let currentScrollY = window.scrollY;

  function onScroll() {
    currentScrollY = window.scrollY;
    // Rotar proporcionalmente al scroll
    targetRotationY = (currentScrollY * 0.0035);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // 6. Interacción sutil con el puntero del mouse
  let mouseX = 0;
  let mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 0.8;
    mouseY = ((e.clientY - rect.top) / container.clientHeight - 0.5) * 0.6;
  });

  container.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  // 7. Bucle de Animación
  let animationFrameId;
  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Flotación suave
    const floatOffset = Math.sin(elapsedTime * 1.5) * 0.08;
    pouchGroup.position.y = floatOffset;

    // Suavizado e interpolación de rotación (Damping)
    pouchGroup.rotation.y += (targetRotationY + mouseX - pouchGroup.rotation.y) * 0.07;
    pouchGroup.rotation.x += (mouseY + Math.cos(elapsedTime * 1.2) * 0.04 - pouchGroup.rotation.x) * 0.07;
    pouchGroup.rotation.z = Math.sin(elapsedTime * 1.0) * 0.03;

    renderer.render(scene, camera);
  }
  animate();

  // 8. Responsividad ante cambio de tamaño
  function onResize() {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onResize);

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    }
  };
}
