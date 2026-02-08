import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../components/top-bar/top-bar';

@Component({
  selector: 'app-nuthoughts',
  templateUrl: './nuthoughts.html',
  styleUrls: ['./nuthoughts.scss'],
  standalone: true,
  imports: [TopBarComponent],
})
export class NuThoughtsComponent {
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['/']);
  }
}
