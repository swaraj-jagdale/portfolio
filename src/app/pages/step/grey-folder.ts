import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../components/top-bar/top-bar';

@Component({
  selector: 'app-grey-folder',
  templateUrl: './grey-folder.html',
  styleUrls: ['./grey-folder.scss'],
  standalone: true,
  imports: [TopBarComponent],
})
export class GreyFolderComponent {
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['/']);
  }
}
