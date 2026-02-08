import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface MemoryCard {
  id: number;
  value: string;
  isRevealed: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class MemoryGameComponent {
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();

  cards: MemoryCard[] = [];
  score = 0;
  moves = 0;
  gameWon = false;
  isOpen = false;
  isMinimized = false;
  private firstCard: MemoryCard | null = null;
  private secondCard: MemoryCard | null = null;
  private isChecking = false;
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
    const values = ['🌟', '🎮', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'];
    const shuffled = [...values, ...values].sort(() => Math.random() - 0.5);
    this.cards = shuffled.map((value, index) => ({
      id: index,
      value,
      isRevealed: false,
      isMatched: false,
    }));
    this.score = 0;
    this.moves = 0;
    this.gameWon = false;
    this.firstCard = null;
    this.secondCard = null;
  }

  clickCard(card: MemoryCard) {
    if (this.isChecking || card.isMatched || card.isRevealed) return;

    card.isRevealed = true;
    this.moves++;

    if (!this.firstCard) {
      this.firstCard = card;
    } else {
      this.secondCard = card;
      this.isChecking = true;

      if (this.firstCard.value === this.secondCard.value) {
        this.firstCard.isMatched = true;
        this.secondCard.isMatched = true;
        this.score++;
        this.firstCard = null;
        this.secondCard = null;
        this.isChecking = false;

        if (this.cards.every(c => c.isMatched)) {
          this.gameWon = true;
        }
      } else {
        setTimeout(() => {
          this.firstCard!.isRevealed = false;
          this.secondCard!.isRevealed = false;
          this.firstCard = null;
          this.secondCard = null;
          this.isChecking = false;
        }, 600);
      }
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
