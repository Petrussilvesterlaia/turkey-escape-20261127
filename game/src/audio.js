// Gobble Dash — synthesized sound with plain WebAudio.
// One clear job: every beep, gobble and jingle is built from oscillators
// at run time. No audio file is loaded, so the game stays fully offline.
export function createAudio() {
  let context = null;
  let muted = false;
  let alarmTimer = null;

  function ensureContext() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone(frequency, duration, type, volume, slideTo) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function gobble() {
    // Two quick descending clucks, like a turkey clearing its throat.
    tone(340, 0.09, 'square', 0.12, 210);
    setTimeout(() => tone(300, 0.1, 'square', 0.12, 180), 90);
  }

  return {
    unlock() {
      ensureContext();
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopAlarm();
      return muted;
    },
    isMuted() {
      return muted;
    },
    jump() {
      tone(320, 0.16, 'sine', 0.14, 620);
    },
    doubleJump() {
      tone(420, 0.14, 'sine', 0.12, 780);
    },
    pickup() {
      tone(660, 0.09, 'triangle', 0.16);
      setTimeout(() => tone(880, 0.12, 'triangle', 0.16), 80);
    },
    feather() {
      tone(523, 0.1, 'triangle', 0.16);
      setTimeout(() => tone(659, 0.1, 'triangle', 0.16), 90);
      setTimeout(() => tone(784, 0.16, 'triangle', 0.16), 180);
    },
    life() {
      [523, 659, 784, 1047].forEach((note, i) => {
        setTimeout(() => tone(note, 0.14, 'triangle', 0.15), i * 100);
      });
    },
    hit() {
      tone(160, 0.28, 'sawtooth', 0.2, 70);
      gobble();
    },
    caught() {
      [392, 330, 262, 196].forEach((note, i) => {
        setTimeout(() => tone(note, 0.22, 'sawtooth', 0.16), i * 170);
      });
    },
    win() {
      [523, 659, 784, 1047, 1319].forEach((note, i) => {
        setTimeout(() => tone(note, 0.2, 'triangle', 0.16), i * 130);
      });
    },
    click() {
      tone(500, 0.05, 'square', 0.08);
    },
    startAlarm() {
      if (alarmTimer !== null || muted) return;
      alarmTimer = setInterval(() => tone(980, 0.07, 'square', 0.05, 920), 420);
    },
    stopAlarm() {
      if (alarmTimer !== null) {
        clearInterval(alarmTimer);
        alarmTimer = null;
      }
    },
  };
}
