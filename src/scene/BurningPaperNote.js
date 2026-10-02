import * as THREE from 'three';

export class BurningPaperNote {
  constructor(scene, fireParticles) {
    this.scene = scene;
    this.fireParticles = fireParticles;
    this.activeNotes = [];
  }

  // Create text texture on a canvas with high 1024x768 resolution for ultra clarity
  createPaperTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Warm vintage parchment paper background
    const grad = ctx.createLinearGradient(0, 0, 1024, 768);
    grad.addColorStop(0, '#f7eee1');
    grad.addColorStop(1, '#e5d4b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 768);

    // Subtle paper grain noise
    ctx.fillStyle = 'rgba(160, 130, 90, 0.07)';
    for (let i = 0; i < 1800; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 768, 3, 3);
    }

    // Vintage inner border
    ctx.strokeStyle = '#d4c2a5';
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 24, 976, 720);

    // Handwritten message
    ctx.fillStyle = '#2c2016';
    ctx.font = '36px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';

    const words = text.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = 840;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const startY = 384 - (lines.length * 24);
    lines.forEach((l, index) => {
      ctx.fillText(l.trim(), 512, startY + (index * 48));
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Spawn note in 3D space near camera and throw into fire
  castNoteIntoFire(text, cameraPosition) {
    const texture = this.createPaperTexture(text || 'A quiet wish into the night...');

    // Paper Mesh (larger geometry 0.72 x 0.54 for clear visibility)
    const geo = new THREE.PlaneGeometry(0.72, 0.54, 12, 12);
    // Subtle curl in geometry
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 3) * 0.04);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.05,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
      transparent: true,
      opacity: 1.0
    });

    const mesh = new THREE.Mesh(geo, mat);

    // Spawn starting position (closer in front of camera view)
    const startPos = new THREE.Vector3(
      cameraPosition.x * 0.42,
      Math.max(1.3, cameraPosition.y * 0.55),
      cameraPosition.z * 0.42
    );
    mesh.position.copy(startPos);
    mesh.rotation.set(0.15, Math.atan2(-cameraPosition.x, -cameraPosition.z), 0.08);
    mesh.castShadow = true;

    this.scene.add(mesh);

    // Target campfire center
    const targetPos = new THREE.Vector3(0, 0.55, 0);

    const noteObj = {
      mesh,
      mat,
      startPos,
      targetPos,
      progress: 0,
      phase: 'flight', // 'flight' -> 'burning' -> 'finished'
      burnProgress: 0,
      rotSpeedX: 0.35 + Math.random() * 0.4,
      rotSpeedY: 0.5 + Math.random() * 0.4
    };

    this.activeNotes.push(noteObj);
  }

  update(delta, elapsedTime) {
    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      const note = this.activeNotes[i];

      if (note.phase === 'flight') {
        note.progress += delta * 0.28; // ~3.5s smooth, visible flight duration

        if (note.progress >= 1.0) {
          note.progress = 1.0;
          note.phase = 'burning';
        }

        // Smooth cubic ease-in-out flight path with wind float flutter
        const t = note.progress;
        const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        note.mesh.position.lerpVectors(note.startPos, note.targetPos, easeT);
        
        // Add gentle fluttering sway
        note.mesh.position.y += Math.sin(t * Math.PI * 2.5) * 0.16 * (1 - t);
        note.mesh.position.x += Math.cos(t * Math.PI * 2.0) * 0.10 * (1 - t);

        note.mesh.rotation.x += delta * note.rotSpeedX;
        note.mesh.rotation.z += delta * note.rotSpeedY;

      } else if (note.phase === 'burning') {
        note.burnProgress += delta * 0.35; // ~2.8s slow, detailed burning duration

        const bp = note.burnProgress;

        // Glowing fire edges & charred paper transition
        note.mat.emissive.setHSL(0.08, 1.0, Math.min(1.0, bp * 1.5));
        note.mat.emissiveIntensity = Math.sin(bp * Math.PI) * 4.5;
        
        // Darken base paper texture color to ash black
        const charColor = Math.max(0.02, 1.0 - bp * 1.2);
        note.mat.color.setRGB(charColor, charColor * 0.8, charColor * 0.6);

        // Shrink and dissolve into smoke/flames
        const scale = Math.max(0.001, 1.0 - bp * 0.85);
        note.mesh.scale.set(scale, scale, scale);
        note.mesh.position.y += delta * 0.18; // Rise gracefully with heat

        note.mat.opacity = Math.max(0, 1.0 - bp * 0.88);

        // Trigger extra sparks/ember burst from fire particles
        if (this.fireParticles && Math.random() > 0.35) {
          this.fireParticles.setEmberDensity(200);
        }

        if (bp >= 1.0) {
          this.scene.remove(note.mesh);
          note.mesh.geometry.dispose();
          note.mesh.material.dispose();
          this.activeNotes.splice(i, 1);
        }
      }
    }
  }
}
