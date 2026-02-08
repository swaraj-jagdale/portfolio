import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionStateService {
  hasBooted = false;
  isLoggedIn = false;
}
