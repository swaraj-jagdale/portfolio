import { Component, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface RecycledItem {
  id: number;
  name: string;
  type: 'file' | 'folder';
  deletedDate: string;
}

@Component({
  selector: 'app-recycle-bin',
  templateUrl: './recycle-bin.html',
  styleUrl: './recycle-bin.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class RecycleBinComponent {
  @Output() minimize = new EventEmitter<void>();

  isOpen = false;
  isEmpty = false;
  isEmptying = false;
  isMinimized = false;
  private isBrowser: boolean;

  items: RecycledItem[] = [
    { id: 1, name: 'old_project.zip', type: 'file', deletedDate: '01/20/2026' },
    { id: 2, name: 'backup_2025', type: 'folder', deletedDate: '01/15/2026' },
    { id: 3, name: 'draft.txt', type: 'file', deletedDate: '01/18/2026' },
    { id: 4, name: 'temp_files', type: 'folder', deletedDate: '01/22/2026' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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

  emptyBin() {
    if (this.items.length === 0) return;

    this.isEmptying = true;

    if (this.isBrowser) {
      setTimeout(() => {
        this.items = [];
        this.isEmpty = true;
        this.isEmptying = false;
      }, 1500);
    }
  }

  restoreItem(item: RecycledItem) {
    this.items = this.items.filter((i) => i.id !== item.id);
    if (this.items.length === 0) {
      this.isEmpty = true;
    }
  }

  deleteItemPermanently(item: RecycledItem) {
    this.items = this.items.filter((i) => i.id !== item.id);
    if (this.items.length === 0) {
      this.isEmpty = true;
    }
  }
}
