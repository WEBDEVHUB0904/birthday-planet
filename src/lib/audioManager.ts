// /**
//  * Global singleton audio manager.
//  * Handles crossfade, mute, autoplay policy safely.
//  * Import anywhere — no React dependency.
//  */

// const FADE_STEPS = 20;
// const FADE_INTERVAL_MS = 50; // 1 second total fade

// class AudioManager {
//   private audio: HTMLAudioElement | null = null;
//   private currentSrc: string | null = null;
//   private muted: boolean = false;
//   private masterVolume: number = 0.35;
//   private fadeTimer: ReturnType<typeof setInterval> | null = null;
//   private userInteracted: boolean = false;

//   /** Call this once on first user click (landing page Enter button) */
//   unlock() {
//     this.userInteracted = true;
//   }

//   play(src: string, volume = this.masterVolume) {
//     if (this.currentSrc === src) return; // already playing this track

//     this.fadeOutCurrent(() => {
//       const audio = new Audio(src);
//       audio.loop = true;
//       audio.volume = 0;
//       audio.muted = this.muted;
//       this.audio = audio;
//       this.currentSrc = src;

//       const tryPlay = () => {
//         audio.play().then(() => {
//           this.fadeIn(volume);
//         }).catch(() => {
//           // Autoplay blocked — wait for next interaction
//           const resume = () => {
//             audio.play().then(() => this.fadeIn(volume));
//             window.removeEventListener("click", resume);
//             window.removeEventListener("keydown", resume);
//           };
//           window.addEventListener("click", resume, { once: true });
//           window.addEventListener("keydown", resume, { once: true });
//         });
//       };

//       tryPlay();
//     });
//   }

//   private fadeIn(targetVolume: number) {
//     if (!this.audio) return;
//     this.clearFade();
//     const step = targetVolume / FADE_STEPS;
//     let current = 0;
//     this.fadeTimer = setInterval(() => {
//       if (!this.audio) { this.clearFade(); return; }
//       current = Math.min(current + step, targetVolume);
//       this.audio.volume = this.muted ? 0 : current;
//       if (current >= targetVolume) this.clearFade();
//     }, FADE_INTERVAL_MS);
//   }

//   private fadeOutCurrent(callback?: () => void) {
//     if (!this.audio) { callback?.(); return; }
//     this.clearFade();
//     const audio = this.audio;
//     const startVol = audio.volume;
//     const step = startVol / FADE_STEPS;
//     this.fadeTimer = setInterval(() => {
//       audio.volume = Math.max(0, audio.volume - step);
//       if (audio.volume <= 0) {
//         this.clearFade();
//         audio.pause();
//         audio.src = "";
//         callback?.();
//       }
//     }, FADE_INTERVAL_MS);
//   }

//   private clearFade() {
//     if (this.fadeTimer) {
//       clearInterval(this.fadeTimer);
//       this.fadeTimer = null;
//     }
//   }

//   toggleMute() {
//     this.muted = !this.muted;
//     if (this.audio) this.audio.muted = this.muted;
//     return this.muted;
//   }

//   stop() {
//     this.fadeOutCurrent();
//     this.currentSrc = null;
//   }

//   isMuted() { return this.muted; }
// }

// export const audioManager = new AudioManager();



const FADE_STEPS = 20;
const FADE_INTERVAL_MS = 50;

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  private muted: boolean = false;
  private masterVolume: number = 0.35;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private userInteracted: boolean = false;
  private pendingSrc: string | null = null;
  private pendingVolume: number = 0.35;

  unlock() {
    this.userInteracted = true;
  }

  hasPending() {
    return !!this.pendingSrc;
  }

  resumePending() {
    if (!this.pendingSrc || !this.audio) return;
    this.audio.play().then(() => {
      this.fadeIn(this.pendingVolume);
      this.pendingSrc = null;
    }).catch(() => {});
  }

  play(src: string, volume = this.masterVolume) {
    if (this.currentSrc === src) return;

    this.fadeOutCurrent(() => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0;
      audio.muted = this.muted;
      this.audio = audio;
      this.currentSrc = src;

      audio.play().then(() => {
        this.fadeIn(volume);
        this.pendingSrc = null;
      }).catch(() => {
        // Store intent — resume on next interaction
        this.pendingSrc = src;
        this.pendingVolume = volume;
      });
    });
  }

  private fadeIn(targetVolume: number) {
    if (!this.audio) return;
    this.clearFade();
    const step = targetVolume / FADE_STEPS;
    let current = 0;
    this.fadeTimer = setInterval(() => {
      if (!this.audio) { this.clearFade(); return; }
      current = Math.min(current + step, targetVolume);
      this.audio.volume = this.muted ? 0 : current;
      if (current >= targetVolume) this.clearFade();
    }, FADE_INTERVAL_MS);
  }

  private fadeOutCurrent(callback?: () => void) {
    if (!this.audio) { callback?.(); return; }
    this.clearFade();
    const audio = this.audio;
    const startVol = audio.volume;
    const step = startVol / FADE_STEPS;
    this.fadeTimer = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - step);
      if (audio.volume <= 0) {
        this.clearFade();
        audio.pause();
        audio.src = "";
        callback?.();
      }
    }, FADE_INTERVAL_MS);
  }

  private clearFade() {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.audio) this.audio.muted = this.muted;
    return this.muted;
  }

  stop() {
    this.fadeOutCurrent();
    this.currentSrc = null;
  }

  isMuted() { return this.muted; }
}

export const audioManager = new AudioManager();