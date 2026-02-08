import { Component, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

type PetState = 'idle' | 'walking' | 'running' | 'sleeping';

@Component({
  selector: 'app-desktop-pet',
  templateUrl: './desktop-pet.html',
  styleUrl: './desktop-pet.scss',
  standalone: true,
  imports: [CommonModule],
})
export class DesktopPetComponent implements OnDestroy {
  x = 100;
  y = 100;
  state: PetState = 'idle';
  facingRight = true;
  currentFrame = 0;
  
  private isBrowser: boolean;
  private animationInterval?: number;
  private stateInterval?: number;
  private moveInterval?: number;
  private speedX = 0;
  private speedY = 0;

  // Pet sprites using emoji
  sprites = {
    idle: ['🐈', '🐈'],
    walking: ['🐈', '🐈‍⬛'],
    running: ['🐱', '🐱'],
    sleeping: ['😴', '💤']
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.startAnimation();
      this.startBehavior();
    }
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.stateInterval) {
      clearInterval(this.stateInterval);
    }
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
    }
  }

  private startAnimation() {
    this.animationInterval = window.setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % 2;
    }, 300);
  }

  private startBehavior() {
    // Change state randomly
    this.stateInterval = window.setInterval(() => {
      const rand = Math.random();
      
      if (rand < 0.3) {
        this.state = 'idle';
        this.speedX = 0;
        this.speedY = 0;
      } else if (rand < 0.6) {
        this.state = 'walking';
        this.setRandomDirection(2);
      } else if (rand < 0.85) {
        this.state = 'running';
        this.setRandomDirection(4);
      } else {
        this.state = 'sleeping';
        this.speedX = 0;
        this.speedY = 0;
      }
    }, 3000);

    // Move the pet
    this.moveInterval = window.setInterval(() => {
      if (this.state === 'walking' || this.state === 'running') {
        this.x += this.speedX;
        this.y += this.speedY;

        // Keep within screen bounds
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;

        if (this.x < 0) {
          this.x = 0;
          this.speedX *= -1;
          this.facingRight = this.speedX > 0;
        }
        if (this.x > maxX) {
          this.x = maxX;
          this.speedX *= -1;
          this.facingRight = this.speedX > 0;
        }
        if (this.y < 0) {
          this.y = 0;
          this.speedY *= -1;
        }
        if (this.y > maxY) {
          this.y = maxY;
          this.speedY *= -1;
        }
      }
    }, 50);
  }

  private setRandomDirection(speed: number) {
    const angle = Math.random() * Math.PI * 2;
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;
    this.facingRight = this.speedX > 0;
  }

  onPetClick() {
    // Make pet jump or react
    if (this.state !== 'sleeping') {
      this.y -= 30;
      setTimeout(() => {
        this.y += 30;
      }, 200);
    }
  }

  getCurrentSprite(): string {
    return this.sprites[this.state][this.currentFrame];
  }
}
