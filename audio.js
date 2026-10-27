(function (root) {
const audioSystem = {
      ctx: null, master: null, playing: false, nodes: [], bellTimer: null,
      currentTrackIdx: 0,
      isTense: false,

      // Soundtrack Profiles (Base Frequencies & Waveforms)
      tracks: [
        { name: "Default Ambient", freqs: [55, 110, 165, 220, 261, 330], gains: [0.09, 0.07, 0.045, 0.035, 0.025, 0.018], type: 'sine' },
        { name: "Clockwork Pressure", freqs: [60, 120, 180, 240, 300, 360], gains: [0.12, 0.08, 0.05, 0.04, 0.03, 0.02], type: 'triangle' },
        { name: "Imperial Resonance", freqs: [40, 80, 120, 160, 200, 240], gains: [0.15, 0.10, 0.06, 0.05, 0.04, 0.03], type: 'sawtooth' },
        { name: "Digital Void", freqs: [100, 200, 300, 400, 500, 600], gains: [0.06, 0.04, 0.03, 0.02, 0.015, 0.01], type: 'square' }, { name: 'The Permanent Record', freqs: [45, 90, 135, 180, 225, 270], gains: [0.08, 0.05, 0.03, 0.02, 0.01, 0.005], type: 'sine' }
      ],

      init() {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.master = this.ctx.createGain();
          this.master.gain.value = 0;
          this.master.connect(this.ctx.destination);
        } catch (e) { }
      },

      toggle() {
        if (!this.ctx) this.init();
        if (!this.ctx) return false;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (this.playing) {
          this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
          this.playing = false;
        } else {
          this._rebuild();
          this.master.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 2);
          this.playing = true;
          this._scheduleBell();
        }
        return this.playing;
      },

      setTrack(idx) {
        this.currentTrackIdx = parseInt(idx);
        if (this.playing) this._rebuild();
      },

      updateAtmosphere(tense) {
        this.isTense = tense;
        if (typeof gs !== 'undefined' && gs.activeArc && gs.activeArc.id === 'legacy') {
          this.currentTrackIdx = 4;
          this.isTense = false; // ensure sine wave
        } else {
          const sel = document.getElementById('track-select');
          if (sel) this.currentTrackIdx = parseInt(sel.value) || 0;
        }
        if (this.playing) this._rebuild();
      },

      _rebuild() {
        // Stop current nodes
        this.nodes.forEach(n => { try { n.stop(); } catch (e) { } });
        this.nodes = [];

        const track = this.tracks[this.currentTrackIdx];
        const freqs = track.freqs;
        const gains = track.gains;
        const type = this.isTense ? 'sawtooth' : track.type; // Force tense waveform

        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const filt = this.ctx.createBiquadFilter();

          osc.type = type;
          // Apply tension: Higher pitch and slight detune dissonance
          osc.frequency.value = this.isTense ? f * 1.05 : f;
          osc.detune.value = this.isTense ? (Math.random() - .5) * 25 : (Math.random() - .5) * 10;

          filt.type = 'lowpass';
          filt.frequency.value = this.isTense ? 800 + i * 150 : 350 + i * 80;

          g.gain.value = this.isTense ? gains[i] * 1.2 : gains[i];

          // Tremolo
          const lfo = this.ctx.createOscillator();
          const lg = this.ctx.createGain();
          lfo.frequency.value = this.isTense ? 0.2 + i * 0.1 : 0.08 + i * 0.04;
          lg.gain.value = gains[i] * 0.25;
          lfo.connect(lg); lg.connect(g.gain); lfo.start();

          osc.connect(filt); filt.connect(g); g.connect(this.master);
          osc.start();
          this.nodes.push(osc, lfo);
        });
      },

      _scheduleBell() {
        if (!this.playing) return;
        const notes = this.isTense ? [880, 1046, 783] : [440, 523, 392, 494, 659];
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(this.isTense ? 0.08 : 0.055, this.ctx.currentTime + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4);
        osc.connect(g); g.connect(this.master);
        osc.start(); osc.stop(this.ctx.currentTime + 4.5);
        this.bellTimer = setTimeout(() => this._scheduleBell(), this.isTense ? 3000 + Math.random() * 4000 : 7000 + Math.random() * 9000);
      }
    };

    // ═══════════════════════════════════════════════════════════
    
root.TheOvalAudio = audioSystem;
if (typeof module !== 'undefined' && module.exports) module.exports = audioSystem;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
