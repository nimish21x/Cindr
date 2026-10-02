import * as THREE from 'three';

export class Lighting {
  constructor(scene) {
    this.scene = scene;

    // 1. Dynamic Campfire Main Point Light
    this.fireLight = new THREE.PointLight(0xff6b00, 16, 22, 1.4);
    this.fireLight.position.set(0, 0.7, 0);
    this.fireLight.castShadow = true;
    this.fireLight.shadow.mapSize.width = 1024;
    this.fireLight.shadow.mapSize.height = 1024;
    this.fireLight.shadow.camera.near = 0.2;
    this.fireLight.shadow.camera.far = 30;
    this.fireLight.shadow.bias = -0.002;
    this.fireLight.shadow.radius = 2.5;
    this.scene.add(this.fireLight);

    // 2. Inner Fire Glow Core
    this.innerGlowLight = new THREE.PointLight(0xffdd44, 9, 10, 2.0);
    this.innerGlowLight.position.set(0, 0.4, 0);
    this.scene.add(this.innerGlowLight);

    // 3. Bright Hemisphere Light for Sky/Ground Forest Fill
    this.hemiLight = new THREE.HemisphereLight(0x3a567c, 0x1e2e22, 1.4);
    this.scene.add(this.hemiLight);

    // 4. Directional Moonlight / Sunlight (Increased intensity to make trees visible)
    this.dirLight = new THREE.DirectionalLight(0x6a96cd, 2.6);
    this.dirLight.position.set(-18, 28, -14);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 60;
    this.dirLight.shadow.camera.left = -25;
    this.dirLight.shadow.camera.right = 25;
    this.dirLight.shadow.camera.top = 25;
    this.dirLight.shadow.camera.bottom = -25;
    this.dirLight.shadow.bias = -0.0008;
    this.scene.add(this.dirLight);

    // 5. Forest Treeline Ambient Fill Lights (Ensures trees & foliage pop visually)
    this.forestLight1 = new THREE.PointLight(0x4a7dbd, 8, 35, 1.2);
    this.forestLight1.position.set(-15, 8, -15);
    this.scene.add(this.forestLight1);

    this.forestLight2 = new THREE.PointLight(0x3b6ea5, 8, 35, 1.2);
    this.forestLight2.position.set(16, 9, 14);
    this.scene.add(this.forestLight2);

    this.forestLight3 = new THREE.PointLight(0xffaa55, 5, 25, 1.5);
    this.forestLight3.position.set(0, 6, -18);
    this.scene.add(this.forestLight3);

    // Light Flicker parameters
    this.baseFireIntensity = 16;
    this.flickerSpeedMultiplier = 1.0;
    this.flickerTime = 0;

    // Current environment preset theme
    this.currentPreset = 'night';
  }

  setEnvironmentPreset(presetName, sceneManager) {
    this.currentPreset = presetName;

    const presets = {
      night: {
        background: 0x091222,
        fog: 0x0e1b30,
        fogDensity: 0.01,
        hemiSky: 0x3d5b80,
        hemiGround: 0x1b2b1d,
        hemiIntensity: 1.4,
        dirColor: 0x6a96cd,
        dirIntensity: 2.6,
        dirPos: [-18, 28, -14],
        forest1: 0x4a7dbd,
        forest2: 0x3b6ea5
      },
      sunset: {
        background: 0x2a1424,
        fog: 0x301829,
        fogDensity: 0.008,
        hemiSky: 0xff8844,
        hemiGround: 0x251426,
        hemiIntensity: 1.6,
        dirColor: 0xffbb66,
        dirIntensity: 3.2,
        dirPos: [-22, 12, -18],
        forest1: 0xff7744,
        forest2: 0xdd6633
      },
      mist: {
        background: 0x141d26,
        fog: 0x1a2530,
        fogDensity: 0.02,
        hemiSky: 0x4a5d73,
        hemiGround: 0x16201e,
        hemiIntensity: 1.3,
        dirColor: 0x7c98b3,
        dirIntensity: 2.0,
        dirPos: [-12, 22, -12],
        forest1: 0x5a7694,
        forest2: 0x4a6582
      },
      snow: {
        background: 0x111c2e,
        fog: 0x18263c,
        fogDensity: 0.014,
        hemiSky: 0x5c7cfa,
        hemiGround: 0x203046,
        hemiIntensity: 1.5,
        dirColor: 0x90b8de,
        dirIntensity: 2.8,
        dirPos: [-14, 30, -8],
        forest1: 0x6b95c4,
        forest2: 0x5a83b2
      }
    };

    const p = presets[presetName] || presets.night;

    if (sceneManager) {
      sceneManager.scene.background.setHex(p.background);
      sceneManager.fog.color.setHex(p.fog);
      sceneManager.fog.density = p.fogDensity;
    }

    this.hemiLight.color.setHex(p.hemiSky);
    this.hemiLight.groundColor.setHex(p.hemiGround);
    this.hemiLight.intensity = p.hemiIntensity;

    this.dirLight.color.setHex(p.dirColor);
    this.dirLight.intensity = p.dirIntensity;
    this.dirLight.position.set(...p.dirPos);

    this.forestLight1.color.setHex(p.forest1);
    this.forestLight2.color.setHex(p.forest2);
  }

  update(delta, elapsedTime) {
    // Dynamic noise-like organic flicker for campfire light
    this.flickerTime += delta * 12 * this.flickerSpeedMultiplier;
    const noise1 = Math.sin(this.flickerTime * 0.7) * 0.4;
    const noise2 = Math.cos(this.flickerTime * 1.9) * 0.35;
    const noise3 = Math.sin(this.flickerTime * 3.4) * 0.25;

    const flickerFactor = 1.0 + (noise1 + noise2 + noise3) * 0.22;
    this.fireLight.intensity = this.baseFireIntensity * flickerFactor;
    this.innerGlowLight.intensity = (this.baseFireIntensity * 0.6) * flickerFactor;

    // Slight position shift mimicking dancing coals
    this.fireLight.position.x = Math.sin(elapsedTime * 3.0) * 0.04;
    this.fireLight.position.z = Math.cos(elapsedTime * 2.5) * 0.04;
    this.fireLight.position.y = 0.65 + Math.sin(elapsedTime * 4.0) * 0.05;
  }
}
