import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class CampfireModel {
  constructor(scene, onProgress, onLoadComplete) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    this.loadModel(onProgress, onLoadComplete);
  }

  loadModel(onProgress, onLoadComplete) {
    // Primary path
    const modelPath = '/assets/campfire.glb';

    this.loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // Auto calculate bounding box to center & scale model cleanly
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model at ground level
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;

        // Scale if needed (making sure it sits comfortably at ~1.5m radius base)
        const maxDim = Math.max(size.x, size.z);
        const desiredSize = 1.6;
        const scaleFactor = desiredSize / maxDim;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Enhance materials & shadow flags
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.material.roughness = Math.max(0.6, child.material.roughness || 0.7);
              child.material.metalness = Math.min(0.2, child.material.metalness || 0.1);
              child.material.shadowSide = THREE.DoubleSide;
            }
          }
        });

        this.modelGroup.add(model);

        if (onLoadComplete) onLoadComplete();
      },
      (xhr) => {
        if (xhr.lengthComputable && onProgress) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          onProgress(percent);
        }
      },
      (error) => {
        console.warn('Failed to load GLTF model, generating fallback wooden hearth logs:', error);
        this.createFallbackLogs();
        if (onLoadComplete) onLoadComplete();
      }
    );
  }

  createFallbackLogs() {
    // Emergency procedural logs in case GLTF loader path has issue
    const logGroup = new THREE.Group();
    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.85 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });

    // Stone ring
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.05, 1),
        stoneMat
      );
      stone.position.set(Math.cos(angle) * 0.8, 0.1, Math.sin(angle) * 0.8);
      stone.castShadow = true;
      stone.receiveShadow = true;
      logGroup.add(stone);
    }

    // Crossed logs
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const log = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 0.9, 8),
        logMat
      );
      log.rotation.x = Math.PI / 2;
      log.rotation.z = angle + 0.2;
      log.position.set(Math.cos(angle) * 0.2, 0.15 + (i * 0.04), Math.sin(angle) * 0.2);
      log.castShadow = true;
      log.receiveShadow = true;
      logGroup.add(log);
    }

    this.modelGroup.add(logGroup);
  }

  update(delta, elapsedTime) {
    // Optional micro animation
  }
}
