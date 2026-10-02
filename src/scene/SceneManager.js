import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060911);

    // Fog
    this.fog = new THREE.FogExp2(0x0a101d, 0.012);
    this.scene.fog = this.fog;

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 150);
    this.camera.position.set(0, 3.6, 5.0); // Cozy isometric angle

    // Orbit Controls (interactive dragging/orbiting on canvas)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.01;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 35;
    this.controls.target.set(0, 0.4, 0);
    this.controls.update();

    // Clock
    this.clock = new THREE.Clock();

    // Updatables array
    this.updatables = [];

    // Resize Listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  addUpdatable(object) {
    this.updatables.push(object);
  }

  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();

      // Update controls
      this.controls.update();

      // Update all updatables
      for (const item of this.updatables) {
        if (typeof item.update === 'function') {
          item.update(delta, elapsedTime);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
