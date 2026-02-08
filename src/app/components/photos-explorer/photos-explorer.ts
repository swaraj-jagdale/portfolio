import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface PhotoItem {
  name: string;
  url: string;
}

interface PhotoManifest {
  files: string[];
}

@Component({
  selector: 'app-photos-explorer',
  templateUrl: './photos-explorer.html',
  styleUrl: './photos-explorer.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class PhotosExplorerComponent implements OnInit {
  @Output() minimize = new EventEmitter<void>();

  isOpen = false;
  isMinimized = false;
  isViewerOpen = false;
  photos: PhotoItem[] = [];
  currentIndex = 0;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
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

  openPhoto(index: number) {
    if (!this.photos.length) return;
    this.currentIndex = index;
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
