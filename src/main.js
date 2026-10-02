import { SceneManager } from './scene/SceneManager.js';
import { Lighting } from './scene/Lighting.js';
import { CampfireModel } from './scene/CampfireModel.js';
import { FireParticles } from './scene/FireParticles.js';
import { ForestVillage } from './scene/ForestVillage.js';
import { BurningPaperNote } from './scene/BurningPaperNote.js';
import { AudioSynthesizer } from './audio/AudioSynthesizer.js';
import { NoteInteractionUI } from './ui/NoteInteractionUI.js';
import { WelcomeDialogUI } from './ui/WelcomeDialogUI.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');

  // 1. Core 3D Scene Manager
  const sceneManager = new SceneManager(container);

  // 2. Lighting System
  const lighting = new Lighting(sceneManager.scene);

  // 3. Fire & Smoke Particle Systems
  const fireParticles = new FireParticles(sceneManager.scene);

  // 4. Forest Village Environment & Seating
  const forestVillage = new ForestVillage(sceneManager.scene);

  // 5. 3D Burning Paper Note Manager
  const burningPaperNote = new BurningPaperNote(sceneManager.scene, fireParticles);

  // Register updatables for render loop animation
  sceneManager.addUpdatable(lighting);
  sceneManager.addUpdatable(fireParticles);
  sceneManager.addUpdatable(forestVillage);
  sceneManager.addUpdatable(burningPaperNote);

  // 6. Load GLTF 3D Campfire Model
  const campfireModel = new CampfireModel(sceneManager.scene);
  sceneManager.addUpdatable(campfireModel);

  // 7. Ambient Audio Engine (Auto-starts on first user gesture)
  const audioSynth = new AudioSynthesizer();
  const initAudioOnce = () => {
    audioSynth.initAudio();
    window.removeEventListener('click', initAudioOnce);
  };
  window.addEventListener('click', initAudioOnce);

  // 8. Note Interaction UI Controller
  new NoteInteractionUI(burningPaperNote, sceneManager, audioSynth);

  // 9. Minimal Landing Welcome Dialog Controller
  new WelcomeDialogUI(audioSynth);

  // 10. Start Three.js Animation Render Loop
  sceneManager.startRenderLoop();
});
