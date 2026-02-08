import { Component, Inject, PLATFORM_ID, OnDestroy, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  src: string;
}

@Component({
  selector: 'app-winamp',
  templateUrl: './winamp.html',
  styleUrl: './winamp.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class WinampComponent implements OnDestroy {
  @Output() minimize = new EventEmitter<void>();

  isOpen = false;
  isPlaying = false;
  volume = 75;
  currentTrack = 0;
  currentTime = '00:00';
  seekValue = 0;
  isMinimized = false;
  
  private isBrowser: boolean;
  private visualizerRafId?: number;
  private audio?: HTMLAudioElement;
  private currentAudioSrc = '';
  private audioContext?: AudioContext;
  private audioSource?: MediaElementAudioSourceNode;
  private analyser?: AnalyserNode;
  private analyserData?: Uint8Array<ArrayBuffer>;

  private readonly trackFiles = [
    'Aero Chord & Anuka - Incomplete  Electronic  NCS - Copyright Free Music.mp3',
    'Aero Chord feat. DDARK - Shootin Stars  Trap  NCS - Copyright Free Music.mp3',
    'Conro - Let Go  House  NCS - Copyright Free Music.mp3',
    'SUPXR - TRANSFER  Electronic  NCS - Copyright Free Music.mp3',
  ];

  tracks: Track[] = this.trackFiles.map((fileName, index) => {
    const baseName = fileName.replace(/\.mp3$/i, '');
    const parts = baseName.split(' - ');
    const artist = parts.length > 1 ? parts[0] : 'Unknown Artist';
    const title = parts.length > 1 ? parts.slice(1).join(' - ') : baseName;
    return {
      id: index + 1,
      title,
      artist,
      duration: '--:--',
      src: `/public/winampMusic/${encodeURIComponent(fileName)}`,
    };
  });

  visualizerBars: number[] = Array(16).fill(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnDestroy() {
    if (this.visualizerRafId) {
      cancelAnimationFrame(this.visualizerRafId);
    }
    if (this.audio) {
      this.audio.pause();
    }
    if (this.audioSource) {
      this.audioSource.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.pause();
  }

  minimizeWindow() {
    this.isOpen = false;
    this.isMinimized = true;
    this.minimize.emit();
  }

  restore() {
    this.isOpen = true;
    this.isMinimized = false;
  }

  play() {
    this.isPlaying = true;
    this.ensureAudioForTrack(true);
    this.resumeAudioContext();
    this.startVisualizer();
  }

  pause() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  previous() {
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.currentTime = '00:00';
    this.seekValue = 0;
    this.ensureAudioForTrack(this.isPlaying);
  }

  next() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.currentTime = '00:00';
    this.seekValue = 0;
    this.ensureAudioForTrack(this.isPlaying);
  }

  selectTrack(index: number) {
    this.currentTrack = index;
    this.currentTime = '00:00';
    this.seekValue = 0;
    this.ensureAudioForTrack(this.isPlaying);
  }

  seekTo(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.seekValue = value;

    if (this.audio && Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
      this.audio.currentTime = (value / 100) * this.audio.duration;
      this.currentTime = this.formatTime(this.audio.currentTime || 0);
    }
  }

  private startVisualizer() {
    if (!this.isBrowser || this.visualizerRafId) return;

    const tick = () => {
      if (this.analyser && this.analyserData) {
        if (this.isPlaying) {
          const data = this.analyserData as Uint8Array<ArrayBuffer>;
          this.analyser.getByteFrequencyData(data);
          const bucketCount = this.visualizerBars.length;
          const bucketSize = Math.max(1, Math.floor(data.length / bucketCount));
          this.visualizerBars = this.visualizerBars.map((_, index) => {
            let sum = 0;
            const start = index * bucketSize;
            const end = Math.min(start + bucketSize, data.length);
            for (let i = start; i < end; i += 1) {
              sum += data[i];
            }
            const avg = sum / Math.max(1, end - start);
            const normalized = Math.pow(avg / 255, 0.55);
            const boosted = Math.min(1, normalized * 2.8);
            return Math.max(2, boosted * 100);
          });
        } else {
          this.visualizerBars = this.visualizerBars.map(() => 0);
        }

        if (this.audio) {
          this.currentTime = this.formatTime(this.audio.currentTime || 0);
          if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
            this.seekValue = (this.audio.currentTime / this.audio.duration) * 100;
          } else {
            this.seekValue = 0;
          }
        }
      }

      this.visualizerRafId = requestAnimationFrame(tick);
    };

    this.visualizerRafId = requestAnimationFrame(tick);
  }

  getCurrentTrack(): Track {
    return this.tracks[this.currentTrack];
  }

  private ensureAudioForTrack(autoplay: boolean) {
    if (!this.isBrowser) return;

    const track = this.tracks[this.currentTrack];
    const needsNewAudio = !this.audio || this.currentAudioSrc !== track.src;

    if (needsNewAudio) {
      if (this.audio) {
        this.audio.pause();
      }

      if (this.audioSource) {
        this.audioSource.disconnect();
      }
      if (this.analyser) {
        this.analyser.disconnect();
      }

      this.audio = new Audio(track.src);
      this.audio.crossOrigin = 'anonymous';
      this.currentAudioSrc = track.src;
      this.audio.preload = 'metadata';
      this.audio.volume = this.volume / 100;

      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.05;
      this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      this.audioSource = this.audioContext.createMediaElementSource(this.audio);
      this.audioSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.startVisualizer();

      this.audio.onloadedmetadata = () => {
        if (!Number.isNaN(this.audio?.duration)) {
          track.duration = this.formatTime(this.audio?.duration ?? 0);
        }
      };

      this.audio.ontimeupdate = () => {
        this.currentTime = this.formatTime(this.audio?.currentTime ?? 0);
      };

      this.audio.onended = () => {
        this.next();
      };
    } else if (this.audio) {
      this.audio.volume = this.volume / 100;
    }

    if (autoplay && this.audio) {
      this.resumeAudioContext();
      this.audio.play().catch(() => {
        this.isPlaying = false;
      });
    }
  }

  private resumeAudioContext() {
    if (!this.audioContext || this.audioContext.state === 'running') return;
    this.audioContext.resume().catch(() => {
      // Autoplay policies can block resume; ignore silently.
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  

  onCloseClick(event: Event) {
    event.stopPropagation();
    this.close();
  }
}
