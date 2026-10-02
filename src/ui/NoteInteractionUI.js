export class NoteInteractionUI {
  constructor(burningPaperNote, sceneManager, audioSynth) {
    this.burningPaperNote = burningPaperNote;
    this.sceneManager = sceneManager;
    this.audioSynth = audioSynth;

    this.paperTrigger = document.getElementById('paper-slip-trigger');
    this.noteModal = document.getElementById('note-modal');
    this.btnClose = document.getElementById('btn-close-note');
    this.btnCloseDot = document.getElementById('btn-close-note-dot');
    this.btnBurn = document.getElementById('btn-burn-note');
    this.textarea = document.getElementById('note-input');
    this.charNum = document.getElementById('char-num');

    // Mute / Unmute Button
    this.btnMute = document.getElementById('btn-audio-mute');
    this.iconAudioOn = document.getElementById('icon-audio-on');
    this.iconAudioOff = document.getElementById('icon-audio-off');

    this.bindEvents();
  }

  bindEvents() {
    // 0. Audio Mute Toggle Button
    if (this.btnMute && this.audioSynth) {
      this.btnMute.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.audioSynth.toggleMute();
        this.updateMuteUI(isMuted);
      });
    }

    // Click physical paper slip in bottom-left corner
    if (this.paperTrigger) {
      this.paperTrigger.addEventListener('click', () => {
        if (this.audioSynth) {
          this.audioSynth.initAudio();
        }
        this.openModal();
      });
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.btnCloseDot) {
      this.btnCloseDot.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.noteModal) {
      this.noteModal.addEventListener('click', (e) => {
        if (e.target === this.noteModal) {
          this.closeModal();
        }
      });
    }

    if (this.textarea && this.charNum) {
      this.textarea.addEventListener('input', () => {
        this.charNum.textContent = this.textarea.value.length;
      });
    }

    // Cast into Flames action
    if (this.btnBurn) {
      this.btnBurn.addEventListener('click', () => {
        const text = this.textarea ? this.textarea.value.trim() : '';
        const message = text.length > 0 ? text : 'A quiet wish into the night...';

        // Close note writing modal
        this.closeModal();

        // Clear textarea
        if (this.textarea) this.textarea.value = '';
        if (this.charNum) this.charNum.textContent = '0';

        // Trigger 3D paper flight & burn sequence
        if (this.burningPaperNote && this.sceneManager) {
          this.burningPaperNote.castNoteIntoFire(message, this.sceneManager.camera.position);
        }

        // Play burn sizzle audio effect after short delay matching flight arrival (~3.4s)
        if (this.audioSynth) {
          setTimeout(() => {
            this.audioSynth.playPaperBurnSizzle();
          }, 3400);
        }
      });
    }
  }

  openModal() {
    if (this.noteModal) {
      this.noteModal.classList.remove('hidden');
      if (this.textarea) {
        setTimeout(() => this.textarea.focus(), 180);
      }
    }
  }

  closeModal() {
    if (this.noteModal) {
      this.noteModal.classList.add('hidden');
    }
  }

  updateMuteUI(isMuted) {
    if (this.btnMute) {
      if (isMuted) {
        this.btnMute.classList.add('muted');
        if (this.iconAudioOn) this.iconAudioOn.classList.add('hidden');
        if (this.iconAudioOff) this.iconAudioOff.classList.remove('hidden');
      } else {
        this.btnMute.classList.remove('muted');
        if (this.iconAudioOn) this.iconAudioOn.classList.remove('hidden');
        if (this.iconAudioOff) this.iconAudioOff.classList.add('hidden');
      }
    }
  }
}
