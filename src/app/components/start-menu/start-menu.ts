import {
  Component,
  signal,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.html',
  styleUrl: './start-menu.scss',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class StartMenuComponent implements OnDestroy {
  isOpen = signal(false);
  isSubmenuOpen = signal(false);
  isGamesSubmenuOpen = signal(false);
  isWallpaperSubmenuOpen = signal(false);
  isUtilitiesSubmenuOpen = signal(false);
  isVolumePopupOpen = signal(false);
  volume = signal(75);
  isBluetoothOn = signal(true);
  isWifiOn = signal(true);
  batteryLevel = signal(92);
  isDarkMode = signal(false);
  private timeInterval: any;
  
  @Input() minimizedApps: Array<{id: string; name: string; component: any}> = [];
  @Input() socialLinks: Array<{label: string; url: string}> = [];
  @Output() restoreApp = new EventEmitter<string>();
  
  @Output() openSnakeGame = new EventEmitter<void>();
  @Output() openDoomGame = new EventEmitter<void>();
  @Output() openCalculator = new EventEmitter<void>();
  @Output() openMinesweeper = new EventEmitter<void>();
  @Output() openMemoryGame = new EventEmitter<void>();
  @Output() openTetris = new EventEmitter<void>();
  @Output() openTaskManager = new EventEmitter<void>();
  @Output() openTerminal = new EventEmitter<void>();
  @Output() openMyComputer = new EventEmitter<void>();
  @Output() openRecycleBin = new EventEmitter<void>();
  @Output() openInternetExplorer = new EventEmitter<void>();
  @Output() openWinamp = new EventEmitter<void>();
  @Output() openAboutMe = new EventEmitter<void>();
  @Output() wallpaperChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<'light' | 'dark'>();
  @Output() logOffClick = new EventEmitter<void>();

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  toggleBluetooth() {
    this.isBluetoothOn.update(v => !v);
  }

  toggleWifi() {
    this.isWifiOn.update(v => !v);
  }

  toggleVolumePopup() {
    this.isVolumePopupOpen.update(v => !v);
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    this.themeChange.emit(this.isDarkMode() ? 'dark' : 'light');
  }

  setVolume(event: Event) {
    const target = event.target as HTMLInputElement;
    this.volume.set(Number(target.value));
  }

  toggleMenu() {
    this.isOpen.update((val) => !val);
    this.isSubmenuOpen.set(false);
    this.isGamesSubmenuOpen.set(false);
    this.isWallpaperSubmenuOpen.set(false);
    this.isUtilitiesSubmenuOpen.set(false);
  }

  closeMenu() {
    this.isOpen.set(false);
    this.isSubmenuOpen.set(false);
    this.isGamesSubmenuOpen.set(false);
    this.isWallpaperSubmenuOpen.set(false);
    this.isUtilitiesSubmenuOpen.set(false);
  }

  toggleSubmenu() {
    this.isSubmenuOpen.update((val) => !val);
    this.isGamesSubmenuOpen.set(false);
    this.isWallpaperSubmenuOpen.set(false);
    this.isUtilitiesSubmenuOpen.set(false);
  }

  toggleGamesSubmenu() {
    this.isGamesSubmenuOpen.update((val) => !val);
    this.isSubmenuOpen.set(false);
    this.isWallpaperSubmenuOpen.set(false);
    this.isUtilitiesSubmenuOpen.set(false);
  }

  toggleWallpaperSubmenu() {
    this.isWallpaperSubmenuOpen.update((val) => !val);
    this.isSubmenuOpen.set(false);
    this.isGamesSubmenuOpen.set(false);
    this.isUtilitiesSubmenuOpen.set(false);
  }

  toggleUtilitiesSubmenu() {
    this.isUtilitiesSubmenuOpen.update((val) => !val);
    this.isSubmenuOpen.set(false);
    this.isGamesSubmenuOpen.set(false);
    this.isWallpaperSubmenuOpen.set(false);
  }

  openSocialLink(url: string) {
    window.open(url, '_blank');
  }

  changeWallpaper(wallpaper: string) {
    this.wallpaperChange.emit(wallpaper);
    this.closeMenu();
  }

  launchSnakeGame() {
    this.openSnakeGame.emit();
    this.closeMenu();
  }

  launchDoomGame() {
    this.openDoomGame.emit();
    this.closeMenu();
  }

  launchCalculator() {
    this.openCalculator.emit();
    this.closeMenu();
  }

  launchMinesweeper() {
    this.openMinesweeper.emit();
    this.closeMenu();
  }

  launchMemoryGame() {
    this.openMemoryGame.emit();
    this.closeMenu();
  }

  launchTetris() {
    this.openTetris.emit();
    this.closeMenu();
  }

  launchTaskManager() {
    this.openTaskManager.emit();
    this.closeMenu();
  }

  launchTerminal() {
    this.openTerminal.emit();
    this.closeMenu();
  }

  launchMyComputer() {
    this.openMyComputer.emit();
    this.closeMenu();
  }

  launchRecycleBin() {
    this.openRecycleBin.emit();
    this.closeMenu();
  }

  launchInternetExplorer() {
    this.openInternetExplorer.emit();
    this.closeMenu();
  }

  launchWinamp() {
    this.openWinamp.emit();
    this.closeMenu();
  }

  launchAboutMe() {
    this.openAboutMe.emit();
    this.closeMenu();
  }

  logOff() {
    this.logOffClick.emit();
    this.closeMenu();
  }
}
