// Interactive 3D viewer for CAD models exported from STEP (see assets/models/*.json).
// Usage: <div class="model-viewer" data-model="assets/models/anchor-1.json"></div>
// Needs the "three" import map from the page's <head>.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

async function mount(el) {
  const data = await fetch(el.dataset.model).then(r => r.json());

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2, 3, 4);
  scene.add(key);

  const group = new THREE.Group();
  const color = getComputedStyle(document.documentElement).getPropertyValue('--model').trim() || '#c9ced6';
  for (const m of data.meshes) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(m.p, 3));
    geo.setIndex(m.i);
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(geo, mat));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0x16202e, transparent: true, opacity: 0.45 }));
    group.add(edges);
  }

  // Centre the part and stand its longest axis upright.
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  group.position.sub(box.getCenter(new THREE.Vector3()));
  const pivot = new THREE.Group();
  pivot.add(group);
  if (size.z >= size.x && size.z >= size.y) pivot.rotation.x = -Math.PI / 2;
  else if (size.x >= size.y) pivot.rotation.z = Math.PI / 2;
  scene.add(pivot);

  const radius = size.length() / 2;
  const camera = new THREE.PerspectiveCamera(35, 1, radius / 100, radius * 100);
  camera.position.set(radius * 1.8, radius * 1.2, radius * 2.8);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.6;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(el);
  resize();

  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
  el.classList.add('ready');
}

document.querySelectorAll('.model-viewer').forEach(el => mount(el).catch(err => {
  el.textContent = 'Could not load 3D model.';
  console.error(err);
}));
