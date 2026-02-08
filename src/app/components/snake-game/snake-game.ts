import {
  Component,
  signal,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
  templateUrl: './snake-game.html',
  styleUrls: ['./snake-game.scss'],
})
export class SnakeGameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('snakeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() minimize = new EventEmitter<void>();

  score = signal(0);
  gameOver = signal(false);
  gameStarted = signal(false);
  isOpen = false;
  isMinimized = false;

  private ctx!: CanvasRenderingContext2D;
  private gameInterval: any;

  private readonly gridSize = 20;
  private readonly cellSize = 20;
  private readonly size = 400;

  private snake: Position[] = [];
  private food!: Position;
  private direction: string = 'RIGHT';
  private nextDirection: string = 'RIGHT';

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /* -------------------- INIT -------------------- */

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.size;
    canvas.height = this.size;

    this.ctx = canvas.getContext('2d')!;
    this.resetGame();
    this.draw();
  }

  ngOnDestroy() {
    this.stopGame();
    this.safeDocument((doc) => doc.removeEventListener('keydown', this.keyHandler));
  }

  /* -------------------- WINDOW CONTROL -------------------- */

  private safeDocument(action: (doc: Document) => void) {
    if (this.isBrowser) {
      action(document);
    }
  }

  open() {
    if (!this.isBrowser) return;
    this.isOpen = true;

    this.resetGame();
    this.draw();

    this.safeDocument((doc) => doc.removeEventListener('keydown', this.keyHandler));
    this.safeDocument((doc) => doc.addEventListener('keydown', this.keyHandler));
  }

  close() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.stopGame();
    this.safeDocument((doc) => doc.removeEventListener('keydown', this.keyHandler));
  }

  minimizeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.stopGame();
    this.isMinimized = true;
    this.minimize.emit();
  }

  restore() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.isMinimized = false;
  }

  /* -------------------- GAME CORE -------------------- */

  private resetGame() {
    this.stopGame();

    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.score.set(0);
    this.gameOver.set(false);
    this.gameStarted.set(false);

    this.spawnFood();
  }

  private startGame() {
    this.stopGame();
    this.gameInterval = setInterval(() => this.gameLoop(), 100);
  }

  private stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  private gameLoop() {
    if (!this.gameStarted() || this.gameOver()) return;

    this.direction = this.nextDirection;
    this.moveSnake();
    this.checkCollision();
    this.checkFood();
    this.draw();
  }

  /* -------------------- INPUT -------------------- */

  private keyHandler = (e: KeyboardEvent) => {
    if (!e.key.startsWith('Arrow')) return;

    e.preventDefault();

    if (this.gameOver()) {
      this.resetGame();
      this.startGame();
      this.gameStarted.set(true);
      return;
    }

    this.gameStarted.set(true);

    if (e.key === 'ArrowUp' && this.direction !== 'DOWN') this.nextDirection = 'UP';
    if (e.key === 'ArrowDown' && this.direction !== 'UP') this.nextDirection = 'DOWN';
    if (e.key === 'ArrowLeft' && this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
    if (e.key === 'ArrowRight' && this.direction !== 'LEFT') this.nextDirection = 'RIGHT';

    if (!this.gameInterval) this.startGame();
  };

  /* -------------------- MECHANICS -------------------- */

  private moveSnake() {
    const head = { ...this.snake[0] };

    if (this.direction === 'UP') head.y--;
    if (this.direction === 'DOWN') head.y++;
    if (this.direction === 'LEFT') head.x--;
    if (this.direction === 'RIGHT') head.x++;

    this.snake.unshift(head);
    this.snake.pop();
  }

  private checkCollision() {
    const head = this.snake[0];

    if (head.x < 0 || head.y < 0 || head.x >= this.gridSize || head.y >= this.gridSize) {
      this.endGame();
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.endGame();
      }
    }
  }

  private checkFood() {
    const head = this.snake[0];

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score.set(this.score() + 10);
      this.snake.push({ ...this.snake[this.snake.length - 1] });
      this.spawnFood();
    }
  }

  private endGame() {
    this.gameOver.set(true);
    this.stopGame();
  }

  private spawnFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      };
    } while (this.snake.some((s) => s.x === this.food.x && s.y === this.food.y));
  }

  /* -------------------- DRAW -------------------- */

  private draw() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.size, this.size);

    this.ctx.strokeStyle = '#e0e0e0';
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.size);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.size, i * this.cellSize);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'black';
    this.snake.forEach((p) =>
      this.ctx.fillRect(p.x * this.cellSize + 1, p.y * this.cellSize + 1, 18, 18),
    );

    this.ctx.fillStyle = '#DC143C';
    this.ctx.fillRect(this.food.x * this.cellSize + 1, this.food.y * this.cellSize + 1, 18, 18);
  }

}
