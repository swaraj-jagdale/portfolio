import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface Enemy {
  x: number;
  y: number;
  alive: boolean;
  cooldown: number;
}

@Component({
  selector: 'app-doom-game',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
  templateUrl: './doom-game.html',
  styleUrls: ['./doom-game.scss'],
})
export class DoomGameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() minimize = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private isBrowser: boolean;
  isOpen = false;
  isMinimized = false;

  private width = 640;
  private height = 360;

  private running = false;
  private rafId = 0;

  private keys: Record<string, boolean> = {};
  private firing = false;
  private muzzleFlash = 0;

  private gun!: HTMLImageElement;
  private enemySprite!: HTMLImageElement;

  private fov = Math.PI / 3;
  private depthBuffer: number[] = [];

  private health = 100;
  private dead = false;

  private map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  private player = { x: 2.5, y: 2.5, angle: 0.8 };

  private enemies: Enemy[] = [
    { x: 5.5, y: 5.5, alive: true, cooldown: 0 },
    { x: 7.5, y: 2.5, alive: true, cooldown: 0 },
    { x: 2.5, y: 6.5, alive: true, cooldown: 0 },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext('2d')!;

    this.gun = new Image();
    this.enemySprite = new Image();
    this.gun.src = '/public/doom-gun.png';
    this.enemySprite.src = '/public/enemy.png';

    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    window.addEventListener('mousedown', () => this.shoot());
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;
    cancelAnimationFrame(this.rafId);
  }

  open() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.running = true;
    this.loop();
  }

  minimizeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.isMinimized = true;
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.minimize.emit();
  }

  restore() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.isMinimized = false;
    this.running = true;
    this.loop();
  }

  close() {
    if (!this.isBrowser) return;
    this.running = false;
    this.isOpen = false;
    cancelAnimationFrame(this.rafId);
  }

  private loop = () => {
    if (!this.running) return;
    if (!this.dead) this.update();
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private keyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.code === 'Space') this.shoot();
  };

  private keyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  /* ---------------- GAME ---------------- */

  private update() {
    const move = 0.05;
    const rot = 0.04;

    if (this.keys['a'] || this.keys['arrowleft']) this.player.angle -= rot;
    if (this.keys['d'] || this.keys['arrowright']) this.player.angle += rot;

    const dx = Math.cos(this.player.angle) * move;
    const dy = Math.sin(this.player.angle) * move;

    if (this.keys['w'] || this.keys['arrowup']) {
      if (!this.map[Math.floor(this.player.y)][Math.floor(this.player.x + dx)]) this.player.x += dx;
      if (!this.map[Math.floor(this.player.y + dy)][Math.floor(this.player.x)]) this.player.y += dy;
    }

    if (this.keys['s'] || this.keys['arrowdown']) {
      if (!this.map[Math.floor(this.player.y)][Math.floor(this.player.x - dx)]) this.player.x -= dx;
      if (!this.map[Math.floor(this.player.y - dy)][Math.floor(this.player.x)]) this.player.y -= dy;
    }

    this.updateEnemies();
    if (this.muzzleFlash > 0) this.muzzleFlash--;
  }

  private updateEnemies() {
    for (const e of this.enemies) {
      if (!e.alive) continue;

      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.5) {
        e.x += (dx / dist) * 0.015;
        e.y += (dy / dist) * 0.015;
      } else if (e.cooldown <= 0) {
        this.health -= 10;
        e.cooldown = 60;
        if (this.health <= 0) this.dead = true;
      }

      if (e.cooldown > 0) e.cooldown--;
    }
  }

  /* ---------------- SHOOT ---------------- */

  private shoot() {
    if (this.firing || this.dead) return;
    this.firing = true;
    this.muzzleFlash = 6;

    for (let d = 0; d < 20; d += 0.05) {
      const tx = this.player.x + Math.cos(this.player.angle) * d;
      const ty = this.player.y + Math.sin(this.player.angle) * d;

      if (this.map[Math.floor(ty)]?.[Math.floor(tx)] === 1) break;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (Math.hypot(enemy.x - tx, enemy.y - ty) < 0.35) {
          enemy.alive = false;
          break;
        }
      }
    }

    setTimeout(() => (this.firing = false), 120);
  }

  /* ---------------- RENDER ---------------- */

  private render() {
    this.ctx.fillStyle = '#7aa2ff';
    this.ctx.fillRect(0, 0, this.width, this.height / 2);
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);

    this.depthBuffer = [];

    for (let x = 0; x < this.width; x++) {
      const rayAngle = this.player.angle - this.fov / 2 + (x / this.width) * this.fov;
      let dist = 0,
        hit = false;

      while (!hit && dist < 25) {
        dist += 0.03;
        const tx = this.player.x + Math.cos(rayAngle) * dist;
        const ty = this.player.y + Math.sin(rayAngle) * dist;
        if (this.map[Math.floor(ty)]?.[Math.floor(tx)] === 1) hit = true;
      }

      const corrected = Math.max(0.001, dist * Math.cos(rayAngle - this.player.angle));
      this.depthBuffer[x] = corrected;

      const h = Math.min(this.height * 2, this.height / corrected);
      const shade = Math.max(60, 220 - corrected * 20);
      this.ctx.fillStyle = `rgb(${shade},${shade - 30},${shade - 30})`;
      this.ctx.fillRect(x, this.height / 2 - h / 2, 1, h);
    }

    this.renderEnemies();
    this.renderHUD();
    this.renderCrosshair();
    this.renderGun();
  }

  private renderEnemies() {
    for (const e of this.enemies) {
      if (!e.alive) continue;

      const dx = e.x - this.player.x;
      const dy = e.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) - this.player.angle;

      if (Math.abs(angle) > this.fov / 2) continue;

      const size = Math.min(600 / dist, 180);
      const x = (angle / this.fov + 0.5) * this.width;

      const screenX = Math.floor(x);
      if (this.depthBuffer[screenX] < dist) continue;

      this.ctx.drawImage(this.enemySprite, x - size / 2, this.height / 2 - size / 2, size, size);
    }
  }

  private renderHUD() {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(20, this.height - 18, this.health * 2, 10);
    this.ctx.strokeStyle = 'white';
    this.ctx.strokeRect(20, this.height - 18, 200, 10);

    if (this.dead) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = 'red';
      this.ctx.font = '40px monospace';
      this.ctx.fillText('YOU DIED', this.width / 2 - 90, this.height / 2);
    }
  }

  private renderCrosshair() {
    this.ctx.strokeStyle = this.muzzleFlash ? 'yellow' : 'white';
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 2 - 8, this.height / 2);
    this.ctx.lineTo(this.width / 2 + 8, this.height / 2);
    this.ctx.moveTo(this.width / 2, this.height / 2 - 8);
    this.ctx.lineTo(this.width / 2, this.height / 2 + 8);
    this.ctx.stroke();
  }

  private renderGun() {
    const w = 220,
      h = 140;
    const kick = this.muzzleFlash ? 6 : 0;
    this.ctx.drawImage(this.gun, this.width / 2 - w / 2 + kick, this.height - h + kick, w, h);
  }

}
