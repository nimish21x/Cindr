import * as THREE from 'three';

export class ForestVillage {
  constructor(scene) {
    this.scene = scene;
    this.envGroup = new THREE.Group();
    this.scene.add(this.envGroup);

    // Reusable Materials
    this.woodMat = new THREE.MeshStandardMaterial({ color: 0x54361c, roughness: 0.8 });
    this.darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x331f11, roughness: 0.85 });
    this.cushionMat = new THREE.MeshStandardMaterial({ color: 0xc94a29, roughness: 0.7 });
    this.blanketMat = new THREE.MeshStandardMaterial({ color: 0x3b6e8c, roughness: 0.75 });
    this.leafMat = new THREE.MeshStandardMaterial({ color: 0x224e2b, roughness: 0.65, flatShading: true });
    this.autumnLeafMat = new THREE.MeshStandardMaterial({ color: 0xd9641d, roughness: 0.7, flatShading: true });
    this.stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a6068, roughness: 0.75 });
    this.metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 });
    this.roofMat = new THREE.MeshStandardMaterial({ color: 0x472f23, roughness: 0.8 });
    this.windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffbb44 });

    // Build components
    this.createTerrain();
    this.createSeatingArea();
    this.createTrees();
    this.createVillageCabins();
    this.createFencesAndDecor();
    this.createPathLanterns();
    this.createWeatherParticles();
  }

  // --- 1. Terrain & Hearth Dirt ---
  createTerrain() {
    // Main Ground
    const groundGeo = new THREE.PlaneGeometry(85, 85, 52, 52);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter > 3.5) {
        const height = (Math.sin(x * 0.15) * Math.cos(y * 0.15) * 0.45) + (Math.sin(x * 0.35) * 0.12);
        pos.setZ(i, height);
      }
    }
    groundGeo.computeVertexNormals();

    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0x253520,
      roughness: 0.85,
      metalness: 0.02
    });

    const ground = new THREE.Mesh(groundGeo, this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.envGroup.add(ground);

    // Inner Hearth Soil & Stone Circle
    const hearthGeo = new THREE.CircleGeometry(3.0, 32);
    const hearthMat = new THREE.MeshStandardMaterial({ color: 0x2e1e12, roughness: 0.9 });
    const hearth = new THREE.Mesh(hearthGeo, hearthMat);
    hearth.rotation.x = -Math.PI / 2;
    hearth.position.y = 0.01;
    hearth.receiveShadow = true;
    this.envGroup.add(hearth);
  }

  // --- 2. Circular Inward-Facing Seating Area Around Campfire ---
  createSeatingArea() {
    const seatingGroup = new THREE.Group();

    // A. Circular Stone Hearth Ring around fire base
    const stoneRingCount = 18;
    for (let i = 0; i < stoneRingCount; i++) {
      const angle = (i / stoneRingCount) * Math.PI * 2;
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.22 + Math.random() * 0.05, 1),
        this.stoneMat
      );
      stone.position.set(Math.cos(angle) * 1.3, 0.1, Math.sin(angle) * 1.3);
      stone.rotation.set(Math.random(), Math.random(), Math.random());
      stone.castShadow = true;
      stone.receiveShadow = true;
      seatingGroup.add(stone);
    }

    // B. Cozy Wooden Benches with Backrests (4 benches facing center)
    const benchAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    benchAngles.forEach((angle, idx) => {
      const bench = new THREE.Group();

      // Main Log Seat (local +Z is front facing fire, local -Z is backrest facing out)
      const seatGeo = new THREE.BoxGeometry(1.8, 0.14, 0.52);
      const seat = new THREE.Mesh(seatGeo, this.woodMat);
      seat.position.y = 0.35;
      seat.castShadow = true;
      seat.receiveShadow = true;
      bench.add(seat);

      // Backrest (at local -Z)
      const backGeo = new THREE.BoxGeometry(1.8, 0.45, 0.1);
      const back = new THREE.Mesh(backGeo, this.woodMat);
      back.position.set(0, 0.65, -0.22);
      back.rotation.x = -0.15; // sloped backward away from fire
      back.castShadow = true;
      bench.add(back);

      // Armrests
      for (const armX of [-0.85, 0.85]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.55), this.woodMat);
        arm.position.set(armX, 0.55, 0.02);
        arm.castShadow = true;
        bench.add(arm);

        const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8), this.darkWoodMat);
        armPost.position.set(armX, 0.44, 0.22);
        armPost.castShadow = true;
        bench.add(armPost);
      }

      // Support Legs
      for (const legX of [-0.75, 0.75]) {
        for (const legZ of [-0.18, 0.18]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.35, 8), this.darkWoodMat);
          leg.position.set(legX, 0.175, legZ);
          leg.castShadow = true;
          bench.add(leg);
        }
      }

      // Cushion pad on seat
      const cushionMat = idx % 2 === 0 ? this.cushionMat : this.blanketMat;
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.44), cushionMat);
      cushion.position.set((idx % 2 === 0 ? -0.35 : 0.35), 0.43, 0.02);
      cushion.castShadow = true;
      bench.add(cushion);

      // Position in circle and rotate so local +Z (front) faces center (0,0,0)
      const dist = 2.3;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      bench.position.set(x, 0, z);

      // Exact Y-rotation so front of seat (+Z) faces (0,0,0)
      bench.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));

      seatingGroup.add(bench);
    });

    // C. Handcrafted Wooden Camp Chairs (4 chairs nested between benches, facing center)
    const chairAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    chairAngles.forEach((angle) => {
      const chairGroup = new THREE.Group();

      // Slatted Wooden Chair Seat (local +Z front, local -Z backrest)
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.6), this.woodMat);
      seat.position.y = 0.32;
      seat.castShadow = true;
      seat.receiveShadow = true;
      chairGroup.add(seat);

      // Slanted Chair Backrest (at local -Z)
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.08), this.woodMat);
      back.position.set(0, 0.62, -0.26);
      back.rotation.x = -0.22;
      back.castShadow = true;
      chairGroup.add(back);

      // Chair Legs
      for (const lx of [-0.3, 0.3]) {
        for (const lz of [-0.22, 0.22]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.32, 8), this.darkWoodMat);
          leg.position.set(lx, 0.16, lz);
          leg.castShadow = true;
          chairGroup.add(leg);
        }
      }

      // Seat Cushion
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.52), this.cushionMat);
      pad.position.set(0, 0.38, 0.02);
      pad.castShadow = true;
      chairGroup.add(pad);

      // Position chair and rotate facing center (0,0,0)
      const dist = 2.65;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      chairGroup.position.set(x, 0, z);

      // Exact Y-rotation so seat (+Z) faces center (0,0,0)
      chairGroup.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));

      seatingGroup.add(chairGroup);

      // D. Log Slice Side Table next to each chair
      const tableGroup = new THREE.Group();
      const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.42, 10), this.darkWoodMat);
      sideTable.position.y = 0.21;
      sideTable.castShadow = true;
      tableGroup.add(sideTable);

      // Tin Mug on Table
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.11, 8), this.metalMat);
      mug.position.set(0.02, 0.47, 0.02);
      mug.castShadow = true;
      tableGroup.add(mug);

      // Position table slightly to the side of the chair
      const tableAngle = angle + 0.18;
      const tableDist = 2.95;
      tableGroup.position.set(Math.cos(tableAngle) * tableDist, 0, Math.sin(tableAngle) * tableDist);
      seatingGroup.add(tableGroup);
    });

    this.envGroup.add(seatingGroup);
  }

  // --- 3. Surrounding Forest Trees ---
  createTrees() {
    this.treesGroup = new THREE.Group();

    const treePositions = [];
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5.5 + Math.random() * 26;
      treePositions.push({ x: Math.cos(angle) * dist, z: Math.sin(angle) * dist, scale: 0.85 + Math.random() * 0.75 });
    }

    treePositions.forEach((pos) => {
      const tree = new THREE.Group();

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.22 * pos.scale, 0.38 * pos.scale, 3.8 * pos.scale, 8);
      const trunk = new THREE.Mesh(trunkGeo, this.darkWoodMat);
      trunk.position.y = (3.8 * pos.scale) / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // Multi-layer Pine Cones
      const foliageMat = Math.random() > 0.2 ? this.leafMat : this.autumnLeafMat;
      const layers = 4;
      for (let l = 0; l < layers; l++) {
        const coneRadius = (1.5 - l * 0.28) * pos.scale;
        const coneHeight = (2.2 - l * 0.25) * pos.scale;
        const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
        const cone = new THREE.Mesh(coneGeo, foliageMat);
        cone.position.y = (2.0 * pos.scale) + (l * 1.15 * pos.scale);
        cone.castShadow = true;
        cone.receiveShadow = true;
        tree.add(cone);
      }

      tree.position.set(pos.x, 0, pos.z);
      this.treesGroup.add(tree);
    });

    this.envGroup.add(this.treesGroup);
  }

  // --- 4. Village Cabins ---
  createVillageCabins() {
    const cabinPositions = [
      { x: -12, z: -8, rot: 0.5 },
      { x: 14, z: -6, rot: -0.6 },
      { x: -9, z: 12, rot: 2.2 },
      { x: 11, z: 13, rot: -2.1 }
    ];

    cabinPositions.forEach((c) => {
      const cabin = new THREE.Group();

      const wallGeo = new THREE.BoxGeometry(4.8, 3.2, 4.0);
      const wall = new THREE.Mesh(wallGeo, this.darkWoodMat);
      wall.position.y = 1.6;
      wall.castShadow = true;
      wall.receiveShadow = true;
      cabin.add(wall);

      const roofGeo = new THREE.ConeGeometry(3.8, 2.4, 4);
      const roof = new THREE.Mesh(roofGeo, this.roofMat);
      roof.position.y = 4.4;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.25, 1.0, 1.15);
      roof.castShadow = true;
      cabin.add(roof);

      const doorGeo = new THREE.BoxGeometry(1.0, 2.0, 0.1);
      const door = new THREE.Mesh(doorGeo, this.woodMat);
      door.position.set(0, 1.0, 2.05);
      cabin.add(door);

      for (const offset of [-1.3, 1.3]) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), this.windowGlowMat);
        win.position.set(offset, 1.9, 2.02);
        cabin.add(win);

        const winLight = new THREE.PointLight(0xffbb44, 4, 8, 1.8);
        winLight.position.set(offset, 1.9, 2.3);
        cabin.add(winLight);
      }

      cabin.position.set(c.x, 0, c.z);
      cabin.rotation.y = c.rot;
      this.envGroup.add(cabin);
    });
  }

  // --- 5. Fences & Woodpile ---
  createFencesAndDecor() {
    const woodpile = new THREE.Group();
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 6 - r; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8), this.woodMat);
        log.rotation.z = Math.PI / 2;
        log.position.set(0, 0.1 + r * 0.18, (i - 3) * 0.22);
        log.castShadow = true;
        woodpile.add(log);
      }
    }
    woodpile.position.set(-4.5, 0, -2.5);
    woodpile.rotation.y = 0.4;
    this.envGroup.add(woodpile);
  }

  // --- 6. Pathway Lanterns ---
  createPathLanterns() {
    const lanternPositions = [
      { x: -5, z: 4 },
      { x: 5, z: -3 },
      { x: -6, z: -5 },
      { x: 7, z: 6 }
    ];

    lanternPositions.forEach((pos) => {
      const lanternGroup = new THREE.Group();

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 8), this.darkWoodMat);
      post.position.y = 1.2;
      post.castShadow = true;
      lanternGroup.add(post);

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.32), this.windowGlowMat);
      box.position.set(0, 2.3, 0);
      lanternGroup.add(box);

      const light = new THREE.PointLight(0xffaa22, 5, 10, 1.6);
      light.position.set(0, 2.3, 0);
      light.castShadow = true;
      lanternGroup.add(light);

      lanternGroup.position.set(pos.x, 0, pos.z);
      this.envGroup.add(lanternGroup);
    });
  }

  // --- 7. Weather Particles ---
  createWeatherParticles() {
    this.weatherCount = 300;
    this.weatherGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.weatherCount * 3);
    this.weatherData = [];

    for (let i = 0; i < this.weatherCount; i++) {
      const data = {
        x: (Math.random() - 0.5) * 45,
        y: 0.5 + Math.random() * 14,
        z: (Math.random() - 0.5) * 45,
        speedY: - (0.4 + Math.random() * 0.8),
        swirlPhase: Math.random() * Math.PI * 2
      };
      this.weatherData.push(data);

      positions[i * 3] = data.x;
      positions[i * 3 + 1] = data.y;
      positions[i * 3 + 2] = data.z;
    }

    this.weatherGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.weatherMat = new THREE.PointsMaterial({
      size: 0.16,
      color: 0xffea88,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.weatherMesh = new THREE.Points(this.weatherGeo, this.weatherMat);
    this.envGroup.add(this.weatherMesh);
  }

  setPreset(presetName) {
    if (presetName === 'snow') {
      this.weatherMat.color.setHex(0xffffff);
      this.weatherMat.size = 0.22;
    } else {
      this.weatherMat.color.setHex(0xffea88);
      this.weatherMat.size = 0.16;
    }
  }

  update(delta, elapsedTime) {
    const pos = this.weatherGeo.attributes.position.array;
    for (let i = 0; i < this.weatherCount; i++) {
      const d = this.weatherData[i];

      d.y += d.speedY * delta * 0.3;
      d.x += Math.sin(elapsedTime * 1.2 + d.swirlPhase) * delta * 0.4;
      d.z += Math.cos(elapsedTime * 1.2 + d.swirlPhase) * delta * 0.4;

      if (d.y < 0.2) {
        d.y = 14;
      }

      pos[i * 3] = d.x;
      pos[i * 3 + 1] = d.y;
      pos[i * 3 + 2] = d.z;
    }
    this.weatherGeo.attributes.position.needsUpdate = true;
  }
}
