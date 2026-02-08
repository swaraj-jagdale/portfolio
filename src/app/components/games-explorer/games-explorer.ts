import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface GameShortcut {
  id: 'snake' | 'doom' | 'minesweeper' | 'memory' | 'tetris';
  name: string;
  icon: string;
}

@Component({
  selector: 'app-games-explorer',
  templateUrl: './games-explorer.html',
  styleUrl: './games-explorer.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class GamesExplorerComponent {
  @Output() minimize = new EventEmitter<void>();
  @Output() openSnakeGame = new EventEmitter<void>();
  @Output() openDoomGame = new EventEmitter<void>();
  @Output() openMinesweeper = new EventEmitter<void>();
  @Output() openMemoryGame = new EventEmitter<void>();
  @Output() openTetris = new EventEmitter<void>();

  isOpen = false;
  isMinimized = false;

  games: GameShortcut[] = [
    { id: 'snake', name: 'Snake', icon: '/public/games.png' },
    { id: 'doom', name: 'DOOM', icon: '/public/games.png' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '/public/games.png' },
    { id: 'memory', name: 'Memory Game', icon: '/public/games.png' },
    { id: 'tetris', name: 'Tetris', icon: '/public/games.png' },
  ];

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

  launchGame(id: GameShortcut['id']) {
    switch (id) {
      case 'snake':
        this.openSnakeGame.emit();
        break;
      case 'doom':
        this.openDoomGame.emit();
        break;
      case 'minesweeper':
        this.openMinesweeper.emit();
        break;
      case 'memory':
        this.openMemoryGame.emit();
        break;
      case 'tetris':
        this.openTetris.emit();
        break;
    }
  }
}
