export class WelcomeDialogUI {
  constructor(audioSynth) {
    this.audioSynth = audioSynth;
    this.welcomeModal = document.getElementById('welcome-modal');
    this.btnEnter = document.getElementById('btn-welcome-enter');
    this.hasDismissed = false;

    this.init();
  }

  init() {
    if (!this.welcomeModal || !this.btnEnter) return;

    // Handle physical keyboard Enter key
    this.handleKeyDown = (e) => {
      if (e.key === 'Enter' && !this.hasDismissed) {
        e.preventDefault();
        this.dismiss();
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);

    // Handle click on on-screen Enter key
    this.btnEnter.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.hasDismissed) {
        this.dismiss();
      }
    });
  }

  dismiss() {
    if (this.hasDismissed) return;
    this.hasDismissed = true;

    // Keypress down feedback animation
    if (this.btnEnter) {
      this.btnEnter.classList.add('pressed');
    }

    // Initialize audio context on first interactive gesture
    if (this.audioSynth) {
      this.audioSynth.initAudio();
    }

    // Smooth fade out transition into campfire scene
    setTimeout(() => {
      if (this.welcomeModal) {
        this.welcomeModal.classList.add('dismissed');
      }

      // Cleanup keyboard listener
      window.removeEventListener('keydown', this.handleKeyDown);
    }, 150);
  }
}
