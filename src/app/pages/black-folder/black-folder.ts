import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../components/top-bar/top-bar';

@Component({
  selector: 'app-master',
  templateUrl: './black-folder.html',
  standalone: true,
  styleUrls: ['./black-folder.scss'],
  imports: [TopBarComponent],
})
export class BlackFolderComponent {
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['/']);
  }
}
