import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-xp-window',
  templateUrl: './xp-window.html',
  styleUrl: './xp-window.scss',
  standalone: true,
  imports: [CommonModule],
})
export class XpWindowComponent implements OnChanges {
  @ViewChild('windowEl') windowEl!: ElementRef<HTMLDivElement>;

  @Input() title = '';
  @Input() isOpen = false;
  @Input() width: number | string = 420;
  @Input() height?: number | string;
  @Input() left?: number | string;
  @Input() top?: number | string;
  @Input() centered = false;
  @Input() showMinimize = true;
  @Input() showMaximize = false;
  @Input() showClose = true;

  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private isBrowser: boolean;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private pointerId?: number;
  isMaximizedInternal = false;
  private dragOverride = false;
  private dragLeft = 0;
  private dragTop = 0;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue && this.isBrowser) {
      setTimeout(() => this.bringToFront(), 0);
    }
  }

  get windowStyle(): Record<string, string> {
    if (this.isMaximizedInternal) {
      return {
        left: '0',
        top: '0',
        right: '0',
        bottom: '40px',
        width: 'auto',
        height: 'auto',
        '--window-transform': 'none',
      };
    }

    if (this.isMobileLayout()) {
      const widthValue = this.normalizeSize(this.width);
      const heightValue = this.height !== undefined ? this.normalizeSize(this.height) : '';
      return {
        width: widthValue ? `min(${widthValue}, calc(100vw - 24px))` : 'auto',
        maxWidth: 'calc(100vw - 24px)',
        height: heightValue
          ? `min(${heightValue}, calc(100vh - var(--xp-taskbar-height) - var(--xp-safe-bottom) - 24px))`
          : 'auto',
        maxHeight: 'calc(100vh - var(--xp-taskbar-height) - var(--xp-safe-bottom) - 24px)',
        left: '12px',
        top: 'calc(var(--xp-safe-top) + 12px)',
        '--window-transform': 'none',
      };
    }

    const widthValue = this.normalizeSize(this.width);
    const heightValue = this.height !== undefined ? this.normalizeSize(this.height) : '';
    const leftValue = this.dragOverride
      ? `${this.dragLeft}px`
      : this.centered
        ? '50%'
        : this.normalizePosition(this.left, '140px');
    const topValue = this.dragOverride
      ? `${this.dragTop}px`
      : this.centered
        ? '50%'
        : this.normalizePosition(this.top, '120px');
    const transformValue = this.dragOverride ? 'none' : this.centered ? 'translate(-50%, -50%)' : 'none';

    return {
      width: widthValue ? `min(${widthValue}, calc(100vw - 24px))` : 'auto',
      maxWidth: 'calc(100vw - 24px)',
      height: heightValue ? `min(${heightValue}, calc(100vh - 80px))` : 'auto',
      maxHeight: 'calc(100vh - 80px)',
      left: leftValue,
      top: topValue,
      '--window-transform': transformValue,
    };
  }

  onTitlePointerDown(event: PointerEvent) {
    if (!this.isBrowser || this.isMobileLayout() || event.button !== 0) return;

    const windowEl = this.windowEl?.nativeElement;
    if (!windowEl) return;

    this.bringToFront();

    const rect = windowEl.getBoundingClientRect();
    this.dragOverride = true;
    this.dragLeft = rect.left;
    this.dragTop = rect.top;
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
    this.isDragging = true;
    this.pointerId = event.pointerId;

    const target = event.currentTarget as HTMLElement | null;
    try {
      target?.setPointerCapture(event.pointerId);
    } catch {}

    const onMove = (moveEvent: PointerEvent) => this.onPointerMove(moveEvent);
    const onUp = (upEvent: PointerEvent) => {
      this.isDragging = false;
      try {
        target?.releasePointerCapture(upEvent.pointerId);
      } catch {}
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  onMinimize(event: PointerEvent) {
    event.stopPropagation();
    this.minimize.emit();
  }

  onMaximize(event: PointerEvent) {
    event.stopPropagation();
    this.isMaximizedInternal = !this.isMaximizedInternal;
    this.maximize.emit();
  }

  onClose(event: PointerEvent) {
    event.stopPropagation();
    this.close.emit();
  }

  bringToFront() {
    if (!this.isBrowser || !this.windowEl) return;
    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach((win) => {
      (win as HTMLElement).style.zIndex = '10';
    });
    this.windowEl.nativeElement.style.zIndex = '1000';
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.isBrowser || !this.isDragging || !this.windowEl) return;
    const windowEl = this.windowEl.nativeElement;
    const x = event.clientX - this.offsetX;
    const y = event.clientY - this.offsetY;
    this.dragLeft = x;
    this.dragTop = y;
    windowEl.style.left = `${x}px`;
    windowEl.style.top = `${y}px`;
  }

  private normalizeSize(value: number | string): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  }

  private normalizePosition(value: number | string | undefined, fallback: string): string {
    if (value === undefined || value === null) {
      return fallback;
    }
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  }

  private isMobileLayout(): boolean {
    return this.isBrowser && window.matchMedia('(max-width: 900px)').matches;
  }

}
