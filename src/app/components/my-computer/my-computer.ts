import { Component, Inject, OnInit, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface DriveInfo {
  id: 'system' | 'photos' | 'games';
  letter: string;
  label: string;
  usedGB: number;
  totalGB: number;
}

interface PhotoItem {
  name: string;
  url: string;
}

interface PhotoManifest {
  files: string[];
}

@Component({
  selector: 'app-my-computer',
  templateUrl: './my-computer.html',
  styleUrl: './my-computer.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class MyComputerComponent implements OnInit {
  @Output() minimize = new EventEmitter<void>();
  @Output() openGamesDrive = new EventEmitter<void>();
  @Output() openPhotosDrive = new EventEmitter<void>();

  isOpen = false;
  isMinimized = false;
  isViewerOpen = false;
  photos: PhotoItem[] = [];
  currentIndex = 0;
  viewerWidth: number | string = 520;
  viewerHeight: number | string = 420;
  private isBrowser: boolean;

  drives: DriveInfo[] = [
    { id: 'system', letter: 'C:', label: 'System', usedGB: 87.4, totalGB: 250 },
    { id: 'photos', letter: 'D:', label: 'Photos', usedGB: 423.8, totalGB: 500 },
    { id: 'games', letter: 'S:', label: 'Games', usedGB: 156.2, totalGB: 1000 },
  ];

  systemInfo = {
    os: 'Windows 95',
    processor: 'Intel Pentium II 233MHz',
    ram: '64 MB',
    graphics: 'ATI Rage Pro'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.loadPhotos();
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
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

  onCloseClick(event: Event) {
    event.stopPropagation();
    this.close();
  }

  onDriveOpen(drive: DriveInfo) {
    if (drive.id === 'games') {
      this.openGamesDrive.emit();
    }
    if (drive.id === 'photos') {
      this.openPhotosDrive.emit();
    }
  }

  getDrivePercent(drive: DriveInfo) {
    if (!drive.totalGB) return 0;
    const raw = (drive.usedGB / drive.totalGB) * 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  openPhoto(index: number) {
    if (!this.photos.length) return;
    this.currentIndex = index;
    this.viewerWidth = 520;
    this.viewerHeight = 420;
    this.isViewerOpen = true;
  }

  closeViewer() {
    this.isViewerOpen = false;
  }

  nextPhoto() {
    if (!this.photos.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
  }

  prevPhoto() {
    if (!this.photos.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
  }

  get currentPhoto(): PhotoItem | null {
    return this.photos[this.currentIndex] ?? null;
  }

  onPhotoLoad(event: Event) {
    if (!this.isBrowser) return;
    const img = event.target as HTMLImageElement;
    if (!img?.naturalWidth || !img?.naturalHeight) return;

    const chromeWidth = 32;
    const chromeHeight = 120;
    const maxContentWidth = 420;
    const maxContentHeight = 300;

    const scale = Math.min(
      1,
      maxContentWidth / img.naturalWidth,
      maxContentHeight / img.naturalHeight
    );

    const targetWidth = Math.round(img.naturalWidth * scale + chromeWidth);
    const targetHeight = Math.round(img.naturalHeight * scale + chromeHeight);

    this.viewerWidth = targetWidth;
    this.viewerHeight = targetHeight;
  }

  private async loadPhotos() {
    try {
      const response = await fetch('/public/myPhotos/manifest.json');
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as PhotoManifest;
      this.photos = (data.files ?? []).map((file) => ({
        name: this.formatName(file),
        url: `/public/myPhotos/${file}`,
      }));
    } catch {
      this.photos = [];
    }
  }

  private formatName(file: string) {
    const base = file.replace(/\.[^/.]+$/, '');
    return base.replace(/[-_]+/g, ' ');
  }
}
