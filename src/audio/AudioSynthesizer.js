export class AudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.isMuted = false;

    // Gain Nodes
    this.masterGain = null;
    this.crackleGain = null;
    this.windGain = null;
    this.cricketGain = null;

    // Default volume levels (0 - 1)
    this.masterVolume = 0.75;
    this.crackleVolume = 0.8;
    this.windVolume = 0.4;
    this.cricketVolume = 0.5;
  }

  toggleMute() {
    if (!this.audioCtx) {
      this.initAudio();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      const targetVol = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setValueAtTime(targetVol, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }

  initAudio() {
    if (this.audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Master Output Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);

    // Setup Sub-Synthesizers
    this.setupCrackleSynth();
    this.setupWindSynth();
    this.setupCricketSynth();

    this.isPlaying = true;
  }

  setupCrackleSynth() {
    // 1. Continuous Fire Hiss/Crackle (Filtered Noise)
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
    bandpass.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

    this.crackleGain = this.audioCtx.createGain();
    this.crackleGain.gain.setValueAtTime(this.crackleVolume * 0.4, this.audioCtx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.crackleGain);
    this.crackleGain.connect(this.masterGain);
    whiteNoise.start();

    // 2. Random Snap & Pop Burst Loop
    this.triggerWoodPopLoop();
  }

  triggerWoodPopLoop() {
    if (!this.isPlaying) return;

    const delay = 150 + Math.random() * 600;
    setTimeout(() => {
      this.playSinglePop();
      this.triggerWoodPopLoop();
    }, delay);
  }

  playSinglePop() {
    if (!this.audioCtx || this.isMuted || this.crackleVolume === 0) return;

    const popOsc = this.audioCtx.createOscillator();
    const popGain = this.audioCtx.createGain();

    const freq = 300 + Math.random() * 800;
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    popOsc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.04);

    const popVol = (0.3 + Math.random() * 0.7) * this.crackleVolume;
    popGain.gain.setValueAtTime(popVol, this.audioCtx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain);

    popOsc.start();
    popOsc.stop(this.audioCtx.currentTime + 0.05);
  }

  playPaperBurnSizzle() {
    if (!this.audioCtx) return;

    // High frequency sizzle noise
    const bufferSize = this.audioCtx.sampleRate * 1.2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.4));
    }

    const sizzle = this.audioCtx.createBufferSource();
    sizzle.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

    sizzle.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    sizzle.start();
  }

  setupWindSynth() {
    const bufferSize = this.audioCtx.sampleRate * 4;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
    }

    const windNoise = this.audioCtx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const lowpass = this.audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(350, this.audioCtx.currentTime);

    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime);

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(150, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    lfo.start();

    this.windGain = this.audioCtx.createGain();
    this.windGain.gain.setValueAtTime(this.windVolume * 0.25, this.audioCtx.currentTime);

    windNoise.connect(lowpass);
    lowpass.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windNoise.start();
  }

  setupCricketSynth() {
    this.cricketGain = this.audioCtx.createGain();
    this.cricketGain.gain.setValueAtTime(this.cricketVolume * 0.15, this.audioCtx.currentTime);
    this.cricketGain.connect(this.masterGain);

    this.triggerCricketChirpLoop();
  }

  triggerCricketChirpLoop() {
    if (!this.isPlaying) return;

    const delay = 1200 + Math.random() * 2500;
    setTimeout(() => {
      this.playCricketChirp();
      this.triggerCricketChirpLoop();
    }, delay);
  }

  playCricketChirp() {
    if (!this.audioCtx || this.isMuted || this.cricketVolume === 0) return;

    const pulses = 4 + Math.floor(Math.random() * 4);
    const pulseLen = 0.03;
    const now = this.audioCtx.currentTime;

    for (let i = 0; i < pulses; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(4500 + Math.random() * 300, now + i * pulseLen * 1.5);

      gain.gain.setValueAtTime(0.08 * this.cricketVolume, now + i * pulseLen * 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * pulseLen * 1.5 + pulseLen);

      osc.connect(gain);
      gain.connect(this.cricketGain);

      osc.start(now + i * pulseLen * 1.5);
      osc.stop(now + i * pulseLen * 1.5 + pulseLen);
    }
  }
}
