import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  template: `
    <div class="top-bar">
      <a class="back-link" (click)="goHome()">←</a>
      <span class="date">{{ date }}</span>
    </div>
  `,
  standalone: true,
  styleUrls: ['./top-bar.scss'],
})
export class TopBarComponent {
  @Input() date = 'may 28 2026';
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['/']);
  }
}
