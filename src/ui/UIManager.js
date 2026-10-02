export class UIManager {
  constructor(sceneManager, lighting, fireParticles, forestVillage, audioSynth) {
    this.sceneManager = sceneManager;
    this.lighting = lighting;
    this.fireParticles = fireParticles;
    this.forestVillage = forestVillage;
    this.audioSynth = audioSynth;

    this.bindDOM();
  }

  bindDOM() {
    // 1. Audio Toggle Header Button
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const iconSoundOn = document.getElementById('icon-sound-on');
    const iconSoundOff = document.getElementById('icon-sound-off');

    btnAudioToggle.addEventListener('click', () => {
      const isSoundActive = this.audioSynth.toggleSound();
      if (isSoundActive) {
        iconSoundOn.classList.remove('hidden');
        iconSoundOff.classList.add('hidden');
        btnAudioToggle.classList.add('active');
      } else {
        iconSoundOn.classList.add('hidden');
        iconSoundOff.classList.remove('hidden');
        btnAudioToggle.classList.remove('active');
      }
    });

    // Initialize audio context on first user click
    const initAudioOnce = () => {
      this.audioSynth.initAudio();
      window.removeEventListener('click', initAudioOnce);
    };
    window.addEventListener('click', initAudioOnce);

    // 2. Control Panel Drawer Toggle
    const controlPanel = document.getElementById('control-panel');
    const btnTogglePanel = document.getElementById('btn-toggle-panel');
    const btnClosePanel = document.getElementById('btn-close-panel');

    const togglePanel = () => {
      controlPanel.classList.toggle('collapsed');
      btnTogglePanel.classList.toggle('active');
    };

    btnTogglePanel.addEventListener('click', togglePanel);
    btnClosePanel.addEventListener('click', togglePanel);

    // 3. Environment Presets (Pill bar & Cards)
    const presetPills = document.querySelectorAll('.preset-pill');
    const envCards = document.querySelectorAll('.env-card');

    const applyPreset = (presetName) => {
      presetPills.forEach((pill) => {
        pill.classList.toggle('active', pill.getAttribute('data-preset') === presetName);
      });
      envCards.forEach((card) => {
        card.classList.toggle('active', card.getAttribute('data-preset') === presetName);
      });

      this.lighting.setEnvironmentPreset(presetName, this.sceneManager);
      this.forestVillage.setPreset(presetName);
    };

    presetPills.forEach((pill) => {
      pill.addEventListener('click', () => applyPreset(pill.getAttribute('data-preset')));
    });

    envCards.forEach((card) => {
      card.addEventListener('click', () => applyPreset(card.getAttribute('data-preset')));
    });

    // 4. Camera View Buttons
    const camBtns = document.querySelectorAll('.cam-btn');
    camBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        camBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const camPreset = btn.getAttribute('data-cam');
        this.sceneManager.setCameraPreset(camPreset);
      });
    });

    // Auto-Rotate Switch
    const chkAutoRotate = document.getElementById('chk-autorotate');
    chkAutoRotate.addEventListener('change', (e) => {
      this.sceneManager.setAutoRotate(e.target.checked);
    });

    // Fog Density Slider
    const sliderFogDensity = document.getElementById('slider-fog-density');
    const valFogDensity = document.getElementById('val-fog-density');

    sliderFogDensity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valFogDensity.textContent = val === 0 ? 'Off' : val > 0.02 ? 'Heavy' : 'Medium';
      this.sceneManager.setFogDensity(val);
    });

    // 5. Audio Mixer Sliders
    const bindAudioSlider = (sliderId, valId, callback) => {
      const slider = document.getElementById(sliderId);
      const valSpan = document.getElementById(valId);
      if (slider && valSpan) {
        slider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          valSpan.textContent = val + '%';
          callback(val);
        });
      }
    };

    bindAudioSlider('slider-vol-master', 'val-vol-master', (val) => this.audioSynth.setMasterVolume(val));
    bindAudioSlider('slider-vol-crackle', 'val-vol-crackle', (val) => this.audioSynth.setCrackleVolume(val));
    bindAudioSlider('slider-vol-wind', 'val-vol-wind', (val) => this.audioSynth.setWindVolume(val));
    bindAudioSlider('slider-vol-crickets', 'val-vol-crickets', (val) => this.audioSynth.setCricketVolume(val));

    // 6. Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });

    // 7. Snapshot Photo Capture
    const btnSnapshot = document.getElementById('btn-snapshot');
    btnSnapshot.addEventListener('click', () => {
      const dataUrl = this.sceneManager.takeSnapshot();
      const link = document.createElement('a');
      link.download = `Forest_Village_Snapshot_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });

    // 8. Model Info Modal
    const btnInfo = document.getElementById('btn-info');
    const modalInfo = document.getElementById('modal-info');
    const btnCloseModal = document.getElementById('btn-close-modal');

    btnInfo.addEventListener('click', () => modalInfo.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => modalInfo.classList.add('hidden'));
    modalInfo.addEventListener('click', (e) => {
      if (e.target === modalInfo) modalInfo.classList.add('hidden');
    });
  }

  updateLoadingProgress(percent) {
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (loadingText) loadingText.textContent = `${percent}%`;
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      this.updateLoadingProgress(100);
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
      }, 400);
    }
  }
}
