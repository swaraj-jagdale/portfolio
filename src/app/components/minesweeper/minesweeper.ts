import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.html',
  styleUrl: './minesweeper.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class MinesweeperComponent {
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();

  grid: Cell[][] = [];
  gridSize = 10;
  mineCount = 15;
  gameOver = false;
  gameWon = false;
  flagCount = 0;
  isOpen = false;
  isMinimized = false;
  Math = Math;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initGame();
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

  initGame() {
    this.grid = Array(this.gridSize)
      .fill(null)
      .map(() =>
        Array(this.gridSize)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    // Place mines
    let placed = 0;
    while (placed < this.mineCount) {
      const x = Math.floor(Math.random() * this.gridSize);
      const y = Math.floor(Math.random() * this.gridSize);
      if (!this.grid[y][x].isMine) {
        this.grid[y][x].isMine = true;
        placed++;
      }
    }

    // Calculate adjacent mines
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (!this.grid[y][x].isMine) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < this.gridSize && nx >= 0 && nx < this.gridSize && this.grid[ny][nx].isMine) {
                count++;
              }
            }
          }
          this.grid[y][x].adjacentMines = count;
        }
      }
    }

    this.gameOver = false;
    this.gameWon = false;
    this.flagCount = 0;
  }

  revealCell(x: number, y: number) {
    if (this.gameOver || this.gameWon || this.grid[y][x].isRevealed || this.grid[y][x].isFlagged) return;

    this.grid[y][x].isRevealed = true;

    if (this.grid[y][x].isMine) {
      this.gameOver = true;
      return;
    }

    if (this.grid[y][x].adjacentMines === 0) {
      // Flood fill
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < this.gridSize && nx >= 0 && nx < this.gridSize && !this.grid[ny][nx].isRevealed) {
            this.revealCell(nx, ny);
          }
        }
      }
    }

    this.checkWin();
  }

  toggleFlag(event: MouseEvent, x: number, y: number) {
    event.preventDefault();
    if (this.gameOver || this.gameWon || this.grid[y][x].isRevealed) return;

    this.grid[y][x].isFlagged = !this.grid[y][x].isFlagged;
    this.flagCount += this.grid[y][x].isFlagged ? 1 : -1;
  }

  checkWin() {
    let revealed = 0;
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x].isRevealed && !this.grid[y][x].isMine) {
          revealed++;
        }
      }
    }
    if (revealed === this.gridSize * this.gridSize - this.mineCount) {
      this.gameWon = true;
    }
  }

  revealAll() {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x].isRevealed = true;
      }
    }
  }

  getCellClass(cell: Cell): string {
    if (!cell.isRevealed) return 'unrevealed';
    if (cell.isMine) return 'mine';
    if (cell.adjacentMines === 0) return 'empty';
    return 'number';
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
