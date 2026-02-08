import { Component, Output, EventEmitter, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface ProcessInfo {
  id: string;
  name: string;
  memory: string;
}

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class TaskManagerComponent {
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() killProcess = new EventEmitter<string>();

  @Input() processes: ProcessInfo[] = [];

  selectedId: string | null = null;
  isOpen = false;
  isMinimized = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  minimizeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.isMinimized = true;
    this.minimize.emit();
  }

  restore() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.isMinimized = false;
  }

  selectProcess(id: string) {
    this.selectedId = this.selectedId === id ? null : id;
  }

  endProcess() {
    if (this.selectedId) {
      this.killProcess.emit(this.selectedId);
      this.selectedId = null;
    }
  }

  closeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.close.emit();
  }

  open() {
    if (!this.isBrowser) return;
    this.isOpen = true;
  }
}
