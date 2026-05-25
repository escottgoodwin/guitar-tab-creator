/**
 * Web Audio Playback Engine for Guitar Tab & Chord Creator
 * Synthesizes plucked guitar sounds and schedules note events precisely.
 */

// Standard open string frequencies: 0 (high e) to 5 (low E)
const STRING_OPEN_FREQS = [
  329.63, // String 0: e (E4)
  246.94, // String 1: B (B3)
  196.00, // String 2: G (G3)
  146.83, // String 3: D (D3)
  110.00, // String 4: A (A2)
  82.41   // String 5: E (E2)
];

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    
    // Playback State
    this.isPlaying = false;
    this.bpm = 120;
    this.tempoSpeed = 1.0; // multiplier
    
    // Sequencer Timing Clocks
    this.schedulerTimerId = null;
    this.nextNoteTime = 0.0;
    this.currentBeatIndex = 0;
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // sec
    
    // Tab data reference
    this.songData = null;
    this.onBeatCallback = null;
    this.onPlaybackStopCallback = null;
    
    // Synth Settings
    this.volume = 0.8;
    this.synthStyle = 'acoustic'; // 'acoustic' or 'electric'
  }

  /**
   * Lazy initializer for AudioContext
   */
  initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setBpm(val) {
    this.bpm = Math.max(40, Math.min(240, val));
  }

  setSynthStyle(style) {
    this.synthStyle = style; // 'acoustic' (Karplus-Strong-like) or 'electric' (FM/Additive)
  }

  /**
   * Calculates pitch frequency for a given string and fret
   */
  getFrequency(stringIndex, fret, tuningArray = null) {
    if (fret === -1 || fret === null) return 0;
    const freqs = tuningArray || STRING_OPEN_FREQS;
    const openFreq = freqs[stringIndex];
    return openFreq * Math.pow(2, fret / 12);
  }

  /**
   * Generates a single guitar pluck sound at a specific time
   */
  playNote(stringIndex, fret, time = 0, tuningArray = null) {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const freq = this.getFrequency(stringIndex, fret, tuningArray);
    if (freq === 0) return;
    
    const playTime = time === 0 ? this.ctx.currentTime : time;
    
    if (this.synthStyle === 'acoustic') {
      this.triggerAcousticPluck(freq, playTime);
    } else {
      this.triggerElectricFM(freq, playTime);
    }
  }

  /**
   * Nylon Acoustic Pluck model: Uses Additive Oscillators & Low-Pass Sweep
   * Formats a crisp, realistic, warm pluck sound.
   */
  triggerAcousticPluck(freq, time) {
    // We construct a primary body oscillator (Triangle) and a transient pluck noise (Sine harmonic)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    // Waveform shape for warm wood pluck
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);
    
    // Bright transient octave harmonic (simulates the metal edge of plucking)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);
    
    // Dynamic Filter envelope (high cutoff at pluck, sweeps down to mute string body)
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(4, time);
    filter.frequency.setValueAtTime(2800, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + 0.9);
    
    // Amplitude envelope
    gainNode.gain.setValueAtTime(0.0, time);
    // Instant attack (pluck click)
    gainNode.gain.linearRampToValueAtTime(0.65, time + 0.005);
    // Decay: decays quickly for higher frequencies, rings out longer for lower bass strings
    const isBassFreq = freq < 100;
    const decayDuration = Math.max(0.5, Math.min(isBassFreq ? 3.5 : 2.5, 150 / freq)); 
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + decayDuration);
    
    // Pluck transient gain (high-frequency initial hit)
    const pluckGain = this.ctx.createGain();
    pluckGain.gain.setValueAtTime(0.35, time);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);
    
    // Connections
    osc1.connect(filter);
    
    osc2.connect(pluckGain);
    pluckGain.connect(filter);
    
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Start/Stop
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + decayDuration + 0.1);
    osc2.stop(time + 0.1);
  }

  /**
   * Electric FM Pluck: Metal chime-like pluck with long sustain
   */
  triggerElectricFM(freq, time) {
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const ampGain = this.ctx.createGain();
    
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, time);
    
    modulator.type = 'sine';
    // Harmonics modulation
    modulator.frequency.setValueAtTime(freq * 1.5, time);
    
    // Modulation depth decay (FM index)
    modGain.gain.setValueAtTime(freq * 3.0, time);
    modGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
    
    // Amp envelope
    ampGain.gain.setValueAtTime(0.0, time);
    ampGain.gain.linearRampToValueAtTime(0.5, time + 0.004);
    // Long sustain ring
    const isBassFreq = freq < 100;
    const decayDuration = Math.max(0.8, Math.min(isBassFreq ? 4.0 : 3.2, 250 / freq));
    ampGain.gain.exponentialRampToValueAtTime(0.0001, time + decayDuration);
    
    // Connections: Modulator -> modGain -> Carrier Frequency
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    
    carrier.connect(ampGain);
    ampGain.connect(this.masterGain);
    
    // Play
    modulator.start(time);
    carrier.start(time);
    modulator.stop(time + 0.5);
    carrier.stop(time + decayDuration + 0.1);
  }

  /**
   * Synthesize a whole chord chord shape
   */
  playChord(chord, time = 0, tuningArray = null) {
    this.initContext();
    const playTime = time === 0 ? this.ctx.currentTime : time;
    
    // Strumming delay: slightly delay strings to simulate a realistic pick sweep!
    // This gives a beautiful realistic strum roll.
    const strumSpeed = 0.025; // 25ms delay between string hits
    let playOffset = 0;
    
    const numStrings = tuningArray ? tuningArray.length : 6;
    for (let s = numStrings - 1; s >= 0; s--) {
      // Safely access chord frets
      const fret = chord.frets[s];
      if (fret !== undefined && fret !== -1 && fret !== null) {
        this.playNote(s, fret, playTime + playOffset, tuningArray);
        playOffset += strumSpeed;
      }
    }
  }

  /**
   * Schedule tab events using a lookahead scheduler
   */
  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNextBeat(this.currentBeatIndex, this.nextNoteTime);
      this.advanceBeat();
    }
  }

  /**
   * Schedule notes for a specific tab beat column index
   */
  scheduleNextBeat(beatIndex, time) {
    if (!this.songData || !this.songData.tracks) return;
    
    // Play notes for all tracks at this beat in sync
    this.songData.tracks.forEach(track => {
      const beat = track.beats[beatIndex];
      if (beat && beat.notes) {
        beat.notes.forEach((fret, stringIndex) => {
          if (fret !== null && fret !== -1) {
            this.playNote(stringIndex, fret, time, track.tuning);
          }
        });
      }
    });
    
    // 2. Notify the editor UI to move visual cursor/highlight beat
    if (this.onBeatCallback) {
      // Schedule visual update aligned with Web Audio timeline
      const delayMs = (time - this.ctx.currentTime) * 1000;
      setTimeout(() => {
        if (this.isPlaying) {
          this.onBeatCallback(beatIndex);
        }
      }, Math.max(0, delayMs));
    }
  }

  /**
   * Advance sequencer beat index
   */
  advanceBeat() {
    if (!this.songData || !this.songData.tracks) return;
    
    const activeTrack = this.songData.tracks[this.songData.activeTrackIndex || 0] || this.songData.tracks[0];
    if (!activeTrack) return;
    
    // Duration calculation based on active track's beat metadata (defaults to 0.25 (quarter note))
    const currentBeat = activeTrack.beats[this.currentBeatIndex];
    const duration = currentBeat ? (currentBeat.duration || 0.25) : 0.25;
    
    // 60 seconds / BPM = time of one quarter note.
    const beatDuration = (60.0 / this.bpm) * (duration * 4.0);
    this.nextNoteTime += beatDuration;
    
    // Increment beat index
    this.currentBeatIndex++;
    
    // Handle loop or end of song
    const totalBeatsLength = activeTrack.beats.length;
    if (this.currentBeatIndex >= totalBeatsLength) {
      if (this.songData.loop) {
        this.currentBeatIndex = 0;
      } else {
        this.stop();
      }
    }
  }

  /**
   * Start playback of current active song
   */
  start(songData, startBeatIndex = 0, onBeat, onStop) {
    this.initContext();
    if (this.isPlaying) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.songData = songData;
    this.currentBeatIndex = startBeatIndex;
    this.onBeatCallback = onBeat;
    this.onPlaybackStopCallback = onStop;
    
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    
    // Run the scheduler tick loop
    this.schedulerTimerId = setInterval(() => this.scheduler(), this.lookahead);
  }

  /**
   * Stop sequencer playback
   */
  stop() {
    if (!this.isPlaying) return;
    
    clearInterval(this.schedulerTimerId);
    this.schedulerTimerId = null;
    this.isPlaying = false;
    
    if (this.onPlaybackStopCallback) {
      this.onPlaybackStopCallback();
    }
  }
}

export const audioEngine = new AudioEngine();
export default audioEngine;
