import { Component, Output, EventEmitter, AfterViewInit, Inject, PLATFORM_ID, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface TetrisPiece {
  shape: number[][];
  x: number;
  y: number;
  color: number;
}

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.html',
  styleUrl: './tetris.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class TetrisComponent implements AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();

  width = 10;
  height = 20;
  grid: number[][] = [];
  score = 0;
  gameOver = false;
  gameStarted = false;
  isOpen = false;
  isMinimized = false;
  currentPiece: TetrisPiece | null = null;
  nextPiece: TetrisPiece | null = null;
  Math = Math;
  private gameInterval: any;
  private dropSpeed = 500;
  private isBrowser: boolean;
  private keyHandler = (event: KeyboardEvent) => this.handleKeyPress(event);

  private pieces = [
    { shape: [[1, 1, 1, 1]], color: 1 }, // I
    { shape: [[1, 1], [1, 1]], color: 2 }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: 3 }, // T
    { shape: [[1, 0, 0], [1, 1, 1]], color: 4 }, // L
    { shape: [[0, 0, 1], [1, 1, 1]], color: 5 }, // J
    { shape: [[0, 1, 1], [1, 1, 0]], color: 6 }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: 7 }, // Z
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initGame();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      document.addEventListener('keydown', this.keyHandler);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  minimizeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.isMinimized = true;
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    this.minimize.emit();
  }

  restore() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.isMinimized = false;
    if (this.gameStarted && !this.gameOver) {
      this.startGameLoop();
    }
  }

  initGame() {
    this.grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
  }

  startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.gameOver = false;
    this.spawnPiece();
    this.startGameLoop();
  }

  private startGameLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.ngZone.runOutsideAngular(() => {
      this.gameInterval = window.setInterval(() => {
        this.ngZone.run(() => {
          this.dropPiece();
          this.cdr.markForCheck();
        });
      }, this.dropSpeed);
    });
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece || this.randomPiece();
    this.nextPiece = this.randomPiece();

    if (!this.canPlace(this.currentPiece)) {
      this.gameOver = true;
      this.gameStarted = false;
      this.currentPiece = null;
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  randomPiece(): TetrisPiece {
    const template = this.pieces[Math.floor(Math.random() * this.pieces.length)];
    return {
      shape: template.shape.map(row => [...row]),
      x: 3,
      y: 0,
      color: template.color,
    };
  }

  canPlace(piece: TetrisPiece, offsetX = 0, offsetY = 0): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const gridX = piece.x + x + offsetX;
          const gridY = piece.y + y + offsetY;
          if (gridX < 0 || gridX >= this.width || gridY >= this.height) return false;
          if (gridY >= 0 && this.grid[gridY][gridX]) return false;
        }
      }
    }
    return true;
  }

  placePiece(piece: TetrisPiece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const gridY = piece.y + y;
          const gridX = piece.x + x;
          if (gridY >= 0) this.grid[gridY][gridX] = piece.color;
        }
      }
    }
  }

  dropPiece() {
    if (!this.currentPiece) return;

    if (this.canPlace(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
    } else {
      this.placePiece(this.currentPiece);
      this.clearLines();
      this.spawnPiece();
    }
  }

  clearLines() {
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell !== 0)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.width).fill(0));
        this.score += 100;
      }
    }
  }

  movePiece(offsetX: number) {
    if (!this.currentPiece || !this.gameStarted) return;
    if (this.canPlace(this.currentPiece, offsetX, 0)) {
      this.currentPiece.x += offsetX;
    }
  }

  rotatePiece() {
    if (!this.currentPiece || !this.gameStarted) return;
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece!.shape.map(row => row[i]).reverse()
    );
    const original = this.currentPiece.shape;
    this.currentPiece.shape = rotated;
    if (!this.canPlace(this.currentPiece)) {
      this.currentPiece.shape = original;
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (!this.gameStarted || this.gameOver) return;
    switch (event.key) {
      case 'ArrowLeft':
        this.movePiece(-1);
        break;
      case 'ArrowRight':
        this.movePiece(1);
        break;
      case 'ArrowUp':
        this.rotatePiece();
        break;
      case 'ArrowDown':
        this.dropPiece();
        break;
    }
  }

  getCellClass(x: number, y: number): string {
    if (this.currentPiece) {
      for (let py = 0; py < this.currentPiece.shape.length; py++) {
        for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
          if (this.currentPiece.shape[py][px] && this.currentPiece.x + px === x && this.currentPiece.y + py === y) {
            return `color-${this.currentPiece.color}`;
          }
        }
      }
    }
    return this.grid[y][x] ? `color-${this.grid[y][x]}` : '';
  }

  closeWindow() {
    if (!this.isBrowser) return;
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    this.isOpen = false;
    this.close.emit();
  }

  open() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.initGame();
  }
}
