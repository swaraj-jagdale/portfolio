import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { BlackFolderComponent } from './pages/black-folder/black-folder';
import { GreyFolderComponent } from './pages/step/grey-folder';
import { NuThoughtsComponent } from './pages/nuthoughts/nuthoughts';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'black-folder', component: BlackFolderComponent },
  { path: 'grey-folder', component: GreyFolderComponent },
  { path: 'nuthoughts', component: NuThoughtsComponent },
];
