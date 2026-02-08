import { Component, AfterViewInit, ChangeDetectorRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StartMenuComponent } from '../../components/start-menu/start-menu';
import { SnakeGameComponent } from '../../components/snake-game/snake-game';
import { DoomGameComponent } from '../../components/doom-game/doom-game';
import { CalculatorComponent } from '../../components/calculator/calculator';
import { MinesweeperComponent } from '../../components/minesweeper/minesweeper';
import { MemoryGameComponent } from '../../components/memory-game/memory-game';
import { TetrisComponent } from '../../components/tetris/tetris';
import { TaskManagerComponent } from '../../components/task-manager/task-manager';
import { TerminalComponent } from '../../components/terminal/terminal';
import { MyComputerComponent } from '../../components/my-computer/my-computer';
import { RecycleBinComponent } from '../../components/recycle-bin/recycle-bin';
import { InternetExplorerComponent } from '../../components/internet-explorer/internet-explorer';
import { WinampComponent } from '../../components/winamp/winamp';
import { WeatherWidgetComponent } from '../../components/weather-widget/weather-widget';
import { AboutMeComponent } from '../../components/about-me/about-me';
import { GamesExplorerComponent } from '../../components/games-explorer/games-explorer';
import { PhotosExplorerComponent } from '../../components/photos-explorer/photos-explorer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StartMenuComponent,
    SnakeGameComponent,
    DoomGameComponent,
    CalculatorComponent,
    MinesweeperComponent,
    MemoryGameComponent,
    TetrisComponent,
    TaskManagerComponent,
    TerminalComponent,
    MyComputerComponent,
    RecycleBinComponent,
    InternetExplorerComponent,
    WinampComponent,
    WeatherWidgetComponent,
    AboutMeComponent,
    GamesExplorerComponent,
    PhotosExplorerComponent,
  ],
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild(SnakeGameComponent) snakeGame!: SnakeGameComponent;
  @ViewChild(DoomGameComponent) doomGame!: DoomGameComponent;
  @ViewChild(CalculatorComponent) calculator!: CalculatorComponent;
  @ViewChild(MinesweeperComponent) minesweeper!: MinesweeperComponent;
  @ViewChild(MemoryGameComponent) memoryGame!: MemoryGameComponent;
  @ViewChild(TetrisComponent) tetris!: TetrisComponent;
  @ViewChild(TaskManagerComponent) taskManager!: TaskManagerComponent;
  @ViewChild(TerminalComponent) terminal!: TerminalComponent;
  @ViewChild(MyComputerComponent) myComputer!: MyComputerComponent;
  @ViewChild(RecycleBinComponent) recycleBin!: RecycleBinComponent;
  @ViewChild(InternetExplorerComponent) internetExplorer!: InternetExplorerComponent;
  @ViewChild(WinampComponent) winamp!: WinampComponent;
  @ViewChild(AboutMeComponent) aboutMe!: AboutMeComponent;
  @ViewChild(GamesExplorerComponent) gamesExplorer!: GamesExplorerComponent;
  @ViewChild(PhotosExplorerComponent) photosExplorer!: PhotosExplorerComponent;

  currentWallpaper: string = 'photo';
  currentTime: string = '12:00:00';
  isBooting = true;
  isLoggedIn = false;
  loginPassword = '';
  socialLinks = [
    { label: 'linkedin', url: 'https://www.linkedin.com/in/swaraj-jagdale' },
    { label: 'instagram', url: 'https://www.instagram.com/swaraj.jagdale/' },
    { label: 'github', url: 'https://github.com/swaraj-jagdale' },
  ];
  private timeInterval?: number;
  private isBrowser: boolean;
  private static wallpaperInitialized = false;
  // Add fade state
  isBootFading = false;

  // Taskbar minimized apps
  minimizedApps: Array<{
    id: string;
    name: string;
    component: any;
  }> = [];

  private appProcesses = [
    { id: 'taskManager', name: 'taskmgr.exe', memory: '6.2 MB', getComponent: () => this.taskManager },
    { id: 'terminal', name: 'cmd.exe', memory: '4.1 MB', getComponent: () => this.terminal },
    { id: 'myComputer', name: 'explorer.exe', memory: '8.7 MB', getComponent: () => this.myComputer },
    { id: 'recycleBin', name: 'recycle.exe', memory: '2.3 MB', getComponent: () => this.recycleBin },
    { id: 'internetExplorer', name: 'iexplore.exe', memory: '10.4 MB', getComponent: () => this.internetExplorer },
    { id: 'winamp', name: 'winamp.exe', memory: '9.1 MB', getComponent: () => this.winamp },
    { id: 'aboutMe', name: 'aboutme.exe', memory: '3.7 MB', getComponent: () => this.aboutMe },
    { id: 'gamesExplorer', name: 'explorer.exe', memory: '6.8 MB', getComponent: () => this.gamesExplorer },
    { id: 'photosExplorer', name: 'explorer.exe', memory: '6.1 MB', getComponent: () => this.photosExplorer },
    { id: 'snake', name: 'snake.exe', memory: '5.3 MB', getComponent: () => this.snakeGame },
    { id: 'doom', name: 'doom.exe', memory: '18.9 MB', getComponent: () => this.doomGame },
    { id: 'calculator', name: 'calc.exe', memory: '3.2 MB', getComponent: () => this.calculator },
    { id: 'minesweeper', name: 'minesweeper.exe', memory: '3.5 MB', getComponent: () => this.minesweeper },
    { id: 'memoryGame', name: 'memory.exe', memory: '4.6 MB', getComponent: () => this.memoryGame },
    { id: 'tetris', name: 'tetris.exe', memory: '4.9 MB', getComponent: () => this.tetris },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  ngOnInit() {
    if (this.isBrowser) {
      const hasBooted = sessionStorage.getItem('hasBooted') === 'true';
      this.isBooting = !hasBooted;
      this.updateClock();
      this.ngZone.runOutsideAngular(() => {
        this.timeInterval = window.setInterval(() => {
          this.ngZone.run(() => {
            this.updateClock();
            this.cdr.markForCheck();
          });
        }, 1000);
      });
      if (!hasBooted) {
        window.setTimeout(() => {
          this.isBootFading = true;
          this.cdr.markForCheck();
          window.setTimeout(() => {
            this.isBooting = false;
            this.isBootFading = false;
            sessionStorage.setItem('hasBooted', 'true');
            this.cdr.markForCheck();
          }, 350);
        }, 2000);
      }
    }
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.enableDragging();
      this.initNotepad();
      this.loadWallpaper();
      this.setupKeyboardShortcuts();
    }
  }

  onLogin() {
    if (!this.isBrowser || this.isLoggedIn) return;
    this.isLoggedIn = true;
    this.playStartupSound();
  }

  onLogOff() {
    if (!this.isBrowser) return;
    this.isBooting = false;
    this.isLoggedIn = false;
    this.loginPassword = '';
    this.cdr.markForCheck();
  }

  private playStartupSound() {
    const audio = new Audio('/public/startup.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Autoplay can be blocked; allow it to fail silently.
    });
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Alt+Delete for Task Manager
      if (e.ctrlKey && e.altKey && e.key === 'Delete') {
        e.preventDefault();
        this.taskManager?.open();
      }
      // Win + R for Terminal (using Alt+R as browser doesn't allow Win key access)
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        this.terminal?.open();
      }
    });
  }

  private enableDragging() {
    const icons = document.querySelectorAll<HTMLElement>('[data-drag="true"]');

    icons.forEach((icon) => {
      let offsetX = 0;
      let offsetY = 0;
      let dragging = false;
      let wasDragged = false;
      let pointerId: number;
      let lastDragEnd = 0;

      icon.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        icons.forEach((other) => other.classList.remove('selected'));
        icon.classList.add('selected');
        dragging = true;
        wasDragged = false;
        pointerId = e.pointerId;
        icon.setPointerCapture(pointerId);
        offsetX = e.clientX - icon.offsetLeft;
        offsetY = e.clientY - icon.offsetTop;
        icon.style.zIndex = '10';
        icon.style.cursor = 'grabbing';
      });

      icon.addEventListener('pointermove', (e: PointerEvent) => {
        if (!dragging) return;
        wasDragged = true;
        icon.style.left = e.clientX - offsetX + 'px';
        icon.style.top = e.clientY - offsetY + 'px';
      });

      const stopDrag = () => {
        if (!dragging) return;
        dragging = false;
        icon.releasePointerCapture(pointerId);
        icon.style.zIndex = '1';
        icon.style.cursor = 'pointer';
        if (wasDragged) {
          lastDragEnd = Date.now();
        }
      };

      icon.addEventListener('pointerup', stopDrag);
      icon.addEventListener('pointercancel', stopDrag);

      icon.addEventListener('click', (e: MouseEvent) => {
        if (wasDragged || Date.now() - lastDragEnd < 300) {
          e.preventDefault();
          e.stopPropagation();
          wasDragged = false;
        }
      }, true);
    });
  }
  private initNotepad() {
    const icon = document.getElementById('notesIcon') as HTMLElement;
    const windowEl = document.getElementById('notepadWindow') as HTMLElement;
    const header = document.getElementById('notepadHeader') as HTMLElement;
    const closeBtn = document.getElementById('closeNotepad') as HTMLElement;
    const textarea = document.getElementById('notepadContent') as HTMLTextAreaElement;

    if (!icon || !windowEl || !header || !closeBtn || !textarea) return;

    textarea.value = 'some thoughts were never meant to be solved.\nonly sat with.';

    /* OPEN - single click */
    icon.addEventListener('click', (e: MouseEvent) => {
      windowEl.classList.remove('hidden');
      windowEl.style.zIndex = String(Date.now());
      textarea.focus();
    });

    /* CLOSE (force safe close) */
    closeBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      windowEl.classList.add('hidden');
    });

    /* BRING TO FRONT */
    windowEl.addEventListener('pointerdown', () => {
      windowEl.style.zIndex = String(Date.now());
    });

    /* DRAG WINDOW */
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      isDragging = true;

      offsetX = e.clientX - windowEl.offsetLeft;
      offsetY = e.clientY - windowEl.offsetTop;

      header.setPointerCapture(e.pointerId);
      windowEl.style.zIndex = String(Date.now());
    });

    header.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;

      windowEl.style.left = e.clientX - offsetX + 'px';
      windowEl.style.top = e.clientY - offsetY + 'px';
    });

    const stopDrag = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        header.releasePointerCapture(e.pointerId);
      } catch {}
    };

    header.addEventListener('pointerup', stopDrag);
    header.addEventListener('pointercancel', stopDrag);
  }

  onOpenSnakeGame() {
    this.snakeGame.open();
  }

  onOpenDoomGame() {
    this.doomGame.open();
  }

  onOpenCalculator() {
    this.calculator.open();
  }

  onOpenMinesweeper() {
    this.minesweeper.open();
  }

  onOpenMemoryGame() {
    this.memoryGame.open();
  }

  onOpenTetris() {
    this.tetris.open();
  }

  onOpenTaskManager() {
    this.taskManager.open();
  }

  onOpenTerminal() {
    this.terminal.open();
  }

  onOpenMyComputer() {
    this.myComputer.open();
  }

  onOpenRecycleBin() {
    this.recycleBin.open();
  }

  onOpenInternetExplorer() {
    this.internetExplorer.open();
  }

  onOpenAboutMe() {
    this.aboutMe.open();
  }

  onOpenWinamp() {
    this.winamp.open();
  }

  onOpenGamesExplorer() {
    this.gamesExplorer.open();
  }

  onOpenPhotosExplorer() {
    this.photosExplorer.open();
  }

  getTaskProcesses() {
    return this.appProcesses
      .map((proc) => {
        const component = proc.getComponent();
        if (!component) {
          return null;
        }
        const isOpen = component.isOpen === true;
        const isMinimized = component.isMinimized === true;
        if (!isOpen && !isMinimized) {
          return null;
        }
        return {
          id: proc.id,
          name: proc.name,
          memory: proc.memory,
        };
      })
      .filter((proc) => proc !== null) as Array<{ id: string; name: string; memory: string }>;
  }

  onKillProcess(id: string) {
    const proc = this.appProcesses.find((item) => item.id === id);
    const component = proc?.getComponent() as {
      closeWindow?: () => void;
      close?: () => void;
      isOpen?: boolean;
    } | undefined;
    if (!component) {
      return;
    }

    if ('closeWindow' in component && typeof component.closeWindow === 'function') {
      component.closeWindow();
      return;
    }

    if ('close' in component && typeof component.close === 'function') {
      component.close();
      return;
    }

    if ('isOpen' in component && typeof component.isOpen === 'boolean') {
      component.isOpen = false;
    }
  }

  onCloseMyComputer() {
    this.myComputer.close();
  }

  onCloseRecycleBin() {
    this.recycleBin.close();
  }

  onCloseInternetExplorer() {
    this.internetExplorer.close();
  }

  onCloseWinamp() {
    this.winamp.close();
  }

  onCloseTaskManager() {
    this.taskManager.closeWindow();
  }

  onCloseTerminal() {
    this.terminal.closeWindow();
  }

  onCloseMemoryGame() {
    this.memoryGame.closeWindow();
  }

  onCloseTetris() {
    this.tetris.closeWindow();
  }

  // Minimize/Restore methods
  minimizeApp(id: string, name: string, component: any) {
    if (!this.minimizedApps.find(app => app.id === id)) {
      this.minimizedApps.push({ id, name, component });
    }
  }

  restoreApp(id: string) {
    const app = this.minimizedApps.find(a => a.id === id);
    if (app && app.component) {
      if (app.component.restore) {
        app.component.restore();
      } else if (app.component.open) {
        app.component.open();
      }
      this.minimizedApps = this.minimizedApps.filter(a => a.id !== id);
    }
  }

  onWallpaperChange(wallpaper: string) {
    if (!this.isBrowser) return;
    
    const desktop = document.querySelector('.desktop') as HTMLElement;
    if (!desktop) return;

    // Remove all wallpaper classes
    const wallpaperClasses = [
      'wallpaper-photo', 'wallpaper-windows', 'wallpaper-black', 'wallpaper-grid',
      'wallpaper-dots', 'wallpaper-stripes', 'wallpaper-sunset', 'wallpaper-ocean', 'wallpaper-forest',
      'wallpaper-rainbow', 'wallpaper-purple-haze', 'wallpaper-neon-grid',
      'wallpaper-retro-wave', 'wallpaper-cherry-blossom', 'wallpaper-matrix', 'wallpaper-fire'
    ];
    desktop.classList.remove(...wallpaperClasses);
    
    // Add new wallpaper class
    desktop.classList.add(`wallpaper-${wallpaper}`);
    this.currentWallpaper = wallpaper;
  }

  onThemeChange(theme: 'light' | 'dark') {
    if (!this.isBrowser) return;
    
    const desktop = document.querySelector('.desktop') as HTMLElement;
    if (!desktop) return;

    if (theme === 'dark') {
      desktop.classList.add('dark-mode');
      // Change wallpaper to black in dark mode
      this.onWallpaperChange('black');
    } else {
      desktop.classList.remove('dark-mode');
      // Change wallpaper to photo in light mode
      this.onWallpaperChange('photo');
    }
  }

  private loadWallpaper() {
    if (!this.isBrowser) return;
    if (HomeComponent.wallpaperInitialized) return;
    HomeComponent.wallpaperInitialized = true;
    
    setTimeout(() => {
      const wallpapers = [
        'photo', 'windows', 'white', 'black', 'grid', 'dots', 'stripes',
        'sunset', 'ocean', 'forest', 'rainbow', 'purple-haze',
        'neon-grid', 'retro-wave', 'cherry-blossom', 'matrix', 'fire'
      ];
      
      // Pick 7 random wallpapers to flash through
      const flashSequence: string[] = [];
      for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * wallpapers.length);
        flashSequence.push(wallpapers[randomIndex]);
      }
      
      // Flash through wallpapers quickly over ~1.4 seconds (200ms per wallpaper)
      let currentIndex = 0;
      const interval = setInterval(() => {
        this.onWallpaperChange(flashSequence[currentIndex]);
        currentIndex++;
        
        if (currentIndex >= flashSequence.length) {
          clearInterval(interval);
          // Always settle on wallpaper.jpg
          this.onWallpaperChange('photo');
        }
      }, 200);
    }, 0);
  }
}
