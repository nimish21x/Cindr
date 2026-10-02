import * as THREE from 'three';

export class FireParticles {
  constructor(scene) {
    this.scene = scene;

    this.flameScaleMultiplier = 1.0;
    this.sparkDensityMultiplier = 1.0;
    this.smokeVolumeMultiplier = 1.0;

    // Create particle textures procedurally using HTML5 canvas
    this.flameTexture = this.createFlameTexture();
    this.sparkTexture = this.createSparkTexture();
    this.smokeTexture = this.createSmokeTexture();

    // Init systems
    this.initFlames();
    this.initSparks();
    this.initSmoke();
  }

  createFlameTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0.0, 'rgba(255, 245, 200, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 170, 0, 0.95)');
    grad.addColorStop(0.5, 'rgba(255, 60, 0, 0.6)');
    grad.addColorStop(0.8, 'rgba(200, 20, 0, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createSparkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.3, 'rgba(255, 210, 100, 0.9)');
    grad.addColorStop(0.7, 'rgba(255, 100, 0, 0.4)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0.0, 'rgba(180, 185, 195, 0.4)');
    grad.addColorStop(0.4, 'rgba(100, 110, 125, 0.2)');
    grad.addColorStop(0.8, 'rgba(50, 55, 65, 0.05)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // --- 1. Flame System ---
  initFlames() {
    this.flameCount = 70;
    this.flameGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.flameCount * 3);
    const sizes = new Float32Array(this.flameCount);
    const alphas = new Float32Array(this.flameCount);

    this.flameData = [];

    for (let i = 0; i < this.flameCount; i++) {
      const x = (Math.random() - 0.5) * 0.35;
      const y = 0.3 + Math.random() * 0.6;
      const z = (Math.random() - 0.5) * 0.35;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      sizes[i] = 0.6 + Math.random() * 0.4;
      alphas[i] = Math.random();

      this.flameData.push({
        baseX: x,
        baseZ: z,
        speed: 0.8 + Math.random() * 1.2,
        life: Math.random(),
        maxLife: 0.8 + Math.random() * 0.6,
        size: sizes[i]
      });
    }

    this.flameGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.flameGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.flameMat = new THREE.PointsMaterial({
      size: 0.7,
      map: this.flameTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.flameMesh = new THREE.Points(this.flameGeo, this.flameMat);
    this.scene.add(this.flameMesh);
  }

  // --- 2. Spark/Ember System ---
  initSparks() {
    this.sparkCount = 200;
    this.sparkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.sparkCount * 3);
    this.sparkData = [];

    for (let i = 0; i < this.sparkCount; i++) {
      const data = {
        x: (Math.random() - 0.5) * 0.4,
        y: 0.3 + Math.random() * 3.5,
        z: (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.6 + Math.random() * 1.4,
        vz: (Math.random() - 0.5) * 0.4,
        life: Math.random(),
        maxLife: 1.5 + Math.random() * 2.5,
        size: 0.04 + Math.random() * 0.06
      };
      this.sparkData.push(data);

      positions[i * 3] = data.x;
      positions[i * 3 + 1] = data.y;
      positions[i * 3 + 2] = data.z;
    }

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      map: this.sparkTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.sparkMesh = new THREE.Points(this.sparkGeo, this.sparkMat);
    this.scene.add(this.sparkMesh);
  }

  // --- 3. Smoke System ---
  initSmoke() {
    this.smokeCount = 40;
    this.smokeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.smokeCount * 3);
    this.smokeData = [];

    for (let i = 0; i < this.smokeCount; i++) {
      const data = {
        x: (Math.random() - 0.5) * 0.4,
        y: 0.8 + Math.random() * 4.0,
        z: (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 0.2,
        vy: 0.4 + Math.random() * 0.6,
        vz: (Math.random() - 0.5) * 0.2,
        life: Math.random(),
        maxLife: 3.0 + Math.random() * 3.0,
        size: 0.8 + Math.random() * 0.8
      };
      this.smokeData.push(data);

      positions[i * 3] = data.x;
      positions[i * 3 + 1] = data.y;
      positions[i * 3 + 2] = data.z;
    }

    this.smokeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.smokeMat = new THREE.PointsMaterial({
      size: 1.2,
      map: this.smokeTexture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.smokeMesh = new THREE.Points(this.smokeGeo, this.smokeMat);
    this.scene.add(this.smokeMesh);
  }

  // Setters for UI controls
  setFlameHeight(val) {
    this.flameScaleMultiplier = val;
    this.flameMat.size = 0.7 * val;
  }

  setEmberDensity(valPercent) {
    this.sparkDensityMultiplier = valPercent / 100;
    this.sparkMat.size = 0.08 * Math.sqrt(this.sparkDensityMultiplier);
  }

  setSmokeVolume(val) {
    this.smokeVolumeMultiplier = val;
    this.smokeMat.opacity = 0.3 * val;
  }

  update(delta, elapsedTime) {
    // 1. Update Flames
    const flamePositions = this.flameGeo.attributes.position.array;
    for (let i = 0; i < this.flameCount; i++) {
      const d = this.flameData[i];
      d.life += delta * d.speed;

      if (d.life > d.maxLife) {
        d.life = 0;
        d.baseX = (Math.random() - 0.5) * 0.3;
        d.baseZ = (Math.random() - 0.5) * 0.3;
      }

      const progress = d.life / d.maxLife;
      const swirl = Math.sin(elapsedTime * 4 + i) * 0.08 * progress;

      flamePositions[i * 3] = d.baseX + swirl;
      flamePositions[i * 3 + 1] = 0.3 + progress * (1.2 * this.flameScaleMultiplier);
      flamePositions[i * 3 + 2] = d.baseZ + Math.cos(elapsedTime * 3 + i) * 0.08 * progress;
    }
    this.flameGeo.attributes.position.needsUpdate = true;

    // 2. Update Sparks/Embers
    const sparkPositions = this.sparkGeo.attributes.position.array;
    for (let i = 0; i < this.sparkCount; i++) {
      const d = this.sparkData[i];
      d.life += delta;

      if (d.life > d.maxLife) {
        d.life = 0;
        d.x = (Math.random() - 0.5) * 0.3;
        d.y = 0.35;
        d.z = (Math.random() - 0.5) * 0.3;
        d.vx = (Math.random() - 0.5) * 0.5;
        d.vy = 0.8 + Math.random() * 1.5;
        d.vz = (Math.random() - 0.5) * 0.5;
      }

      // Wind drift turbulence
      d.x += (d.vx + Math.sin(elapsedTime * 2 + i) * 0.3) * delta;
      d.y += d.vy * delta;
      d.z += (d.vz + Math.cos(elapsedTime * 2 + i) * 0.3) * delta;

      sparkPositions[i * 3] = d.x;
      sparkPositions[i * 3 + 1] = d.y;
      sparkPositions[i * 3 + 2] = d.z;
    }
    this.sparkGeo.attributes.position.needsUpdate = true;

    // 3. Update Smoke
    const smokePositions = this.smokeGeo.attributes.position.array;
    for (let i = 0; i < this.smokeCount; i++) {
      const d = this.smokeData[i];
      d.life += delta;

      if (d.life > d.maxLife) {
        d.life = 0;
        d.x = (Math.random() - 0.5) * 0.4;
        d.y = 0.8;
        d.z = (Math.random() - 0.5) * 0.4;
      }

      d.x += (d.vx + Math.sin(elapsedTime * 0.8 + i) * 0.2) * delta;
      d.y += d.vy * delta;
      d.z += (d.vz + Math.cos(elapsedTime * 0.8 + i) * 0.2) * delta;

      smokePositions[i * 3] = d.x;
      smokePositions[i * 3 + 1] = d.y;
      smokePositions[i * 3 + 2] = d.z;
    }
    this.smokeGeo.attributes.position.needsUpdate = true;
  }
}
