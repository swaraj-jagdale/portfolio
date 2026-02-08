import { Component, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { XpWindowComponent } from '../xp-window/xp-window';

interface WebPage {
  url: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-internet-explorer',
  templateUrl: './internet-explorer.html',
  styleUrl: './internet-explorer.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, XpWindowComponent],
})
export class InternetExplorerComponent {
  @Output() minimize = new EventEmitter<void>();

  isOpen = false;
  currentUrl = 'www.retroweb.com';
  addressBarUrl = 'www.retroweb.com';
  isLoading = false;
  canGoBack = false;
  canGoForward = false;
  isMinimized = false;
  
  private isBrowser: boolean;
  private history: string[] = ['www.retroweb.com'];
  private historyIndex = 0;

  pages: { [key: string]: WebPage } = {
    'www.retroweb.com': {
      url: 'www.retroweb.com',
      title: 'RetroWeb 95 - Your Digital Gateway',
      content: `
        <div style="background: white; color: black; font-family: 'Courier New', monospace; min-height: 500px;">
          <div style="background: black; color: white; padding: 24px; border-bottom: 4px solid black;">
            <center>
              <h1 style="margin: 0; font-size: 48px; letter-spacing: 4px;">
                ▓▒░ RETROWEB 95 ░▒▓
              </h1>
              <p style="font-size: 14px; margin: 8px 0; letter-spacing: 2px;">
                » YOUR DIGITAL GATEWAY TO THE INFORMATION SUPERHIGHWAY «
              </p>
              <div style="margin-top: 12px;">
                <span style="background: white; color: black; padding: 4px 12px; margin: 0 4px;">Est. 1995</span>
                <span style="background: white; color: black; padding: 4px 12px; margin: 0 4px;">${new Date().toLocaleDateString()}</span>
                <span style="background: white; color: black; padding: 4px 12px; margin: 0 4px;">${new Date().toLocaleTimeString()}</span>
              </div>
            </center>
          </div>
          
          <div style="max-width: 800px; margin: 0 auto; padding: 24px;">
            <div style="border: 4px solid black; padding: 20px; margin-bottom: 20px; background: white;">
              <h2 style="margin-top: 0; border-bottom: 4px solid black; padding-bottom: 8px; letter-spacing: 2px;">
                ░▒▓ TODAY'S HEADLINES ▓▒░
              </h2>
              <div style="border-left: 8px solid black; padding-left: 12px; margin: 16px 0; background: #f0f0f0; padding: 12px;">
                <strong>▶</strong> The World Wide Web expands by 10,000 pages daily!
              </div>
              <div style="border-left: 8px solid black; padding-left: 12px; margin: 16px 0; background: #f0f0f0; padding: 12px;">
                <strong>▶</strong> Scientists predict everyone will have email by the year 2000
              </div>
              <div style="border-left: 8px solid black; padding-left: 12px; margin: 16px 0; background: #f0f0f0; padding: 12px;">
                <strong>▶</strong> Virtual reality gaming: The future is NOW!
              </div>
            </div>
            
            <div style="border: 4px solid black; padding: 20px; margin-bottom: 20px; background: white;">
              <h2 style="margin-top: 0; border-bottom: 4px solid black; padding-bottom: 8px; letter-spacing: 2px;">
                ░▒▓ CYBER QUICK LINKS ▓▒░
              </h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                <div style="border: 3px solid black; padding: 16px; text-align: center; background: #f0f0f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">📧</div>
                  <strong>E-MAIL</strong><br>
                  <span style="font-size: 11px;">Check messages</span>
                </div>
                <div style="border: 3px solid black; padding: 16px; text-align: center; background: #f0f0f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">💬</div>
                  <strong>CHAT ROOMS</strong><br>
                  <span style="font-size: 11px;">Connect now!</span>
                </div>
                <div style="border: 3px solid black; padding: 16px; text-align: center; background: #f0f0f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">🎮</div>
                  <strong>GAMES</strong><br>
                  <span style="font-size: 11px;">Play online</span>
                </div>
                <div style="border: 3px solid black; padding: 16px; text-align: center; background: #f0f0f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                  <strong>SEARCH</strong><br>
                  <span style="font-size: 11px;">Find anything</span>
                </div>
              </div>
            </div>
            
            <div style="border: 4px solid black; padding: 20px; margin-bottom: 20px; background: black; color: white;">
              <h2 style="margin-top: 0; border-bottom: 4px solid white; padding-bottom: 8px; letter-spacing: 2px;">
                ▓▒░ INTERNET WISDOM ░▒▓
              </h2>
              <marquee style="background: white; color: black; padding: 12px; margin: 16px 0; font-weight: bold; border: 2px solid white;">
                ★ NEW! Download files at 56K speeds! ★ Join thousands online! ★ The future is digital! ★
              </marquee>
              <div style="background: white; color: black; padding: 16px; border: 3px solid white;">
                <p style="margin: 0 0 12px 0; font-weight: bold;">⚡ POWER USER TIPS:</p>
                <ul style="margin: 0; padding-left: 20px; line-height: 2;">
                  <li>Press Ctrl+D to bookmark cool sites</li>
                  <li>Hit F5 to refresh your page</li>
                  <li>Use Alt+← to go back in history</li>
                  <li>Ctrl+P prints the current page</li>
                </ul>
              </div>
            </div>
            
            <div style="border: 4px solid black; padding: 20px; background: white;">
              <h2 style="margin-top: 0; border-bottom: 4px solid black; padding-bottom: 8px; letter-spacing: 2px;">
                ░▒▓ SITE STATISTICS ▓▒░
              </h2>
              <div style="background: #f0f0f0; padding: 16px; border: 3px solid black; margin-top: 16px; text-align: center;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div style="border-right: 2px solid black; padding: 8px;">
                    <div style="font-size: 32px; font-weight: bold;">1,337</div>
                    <div style="font-size: 12px;">VISITORS TODAY</div>
                  </div>
                  <div style="padding: 8px;">
                    <div style="font-size: 32px; font-weight: bold;">42</div>
                    <div style="font-size: 12px;">COUNTRIES</div>
                  </div>
                </div>
                <div style="margin-top: 16px; border-top: 2px solid black; padding-top: 16px;">
                  <div style="font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace;">
                    ${new Date().toLocaleTimeString()}
                  </div>
                  <div style="font-size: 12px; margin-top: 4px;">CURRENT TIME</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: black; color: white; text-align: center; padding: 24px; border-top: 4px solid black; margin-top: 24px;">
            <p style="font-size: 12px; margin: 0; letter-spacing: 2px;">
              ▓▒░ © 1995-${new Date().getFullYear()} RETROWEB 95 • ALL RIGHTS RESERVED ░▒▓
            </p>
            <p style="font-size: 10px; margin: 12px 0 0 0;">
              Best viewed in Internet Explorer 5.5+ • 800x600 resolution • Optimized for 56K modems
            </p>
            <div style="margin-top: 12px;">
              <span style="background: white; color: black; padding: 2px 8px; margin: 0 4px; font-size: 10px;">COUNTER: 000${Math.floor(Math.random() * 1000)}</span>
            </div>
          </div>
        </div>
      `
    }
  };

  currentPage: WebPage = this.pages['www.retroweb.com'];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getSafeContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.currentPage.content);
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  minimizeWindow() {
    this.isOpen = false;
    this.isMinimized = true;
    this.minimize.emit();
  }

  restore() {
    this.isOpen = true;
    this.isMinimized = false;
  }

  goBack() {
    if (this.canGoBack) {
      this.historyIndex -= 1;
      this.navigate(this.history[this.historyIndex], false);
    }
  }

  goForward() {
    if (this.canGoForward) {
      this.historyIndex += 1;
      this.navigate(this.history[this.historyIndex], false);
    }
  }

  refresh() {
    this.isLoading = true;
    if (this.isBrowser) {
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    } else {
      this.isLoading = false;
    }
  }

  navigate(url?: string, pushHistory = true) {
    const target = (url ?? this.addressBarUrl).trim();
    if (!target) return;

    this.isLoading = true;
    this.currentUrl = target;
    this.addressBarUrl = target;

    if (pushHistory) {
      if (this.history[this.historyIndex] !== target) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(target);
        this.historyIndex = this.history.length - 1;
      }
    }

    const page = this.pages[target];
    if (page) {
      this.currentPage = page;
    } else {
      this.currentPage = {
        url: target,
        title: 'Address not found',
        content: `<div style="padding: 24px; font-family: Tahoma, Arial, sans-serif;">Page not found: ${target}</div>`,
      };
    }

    this.updateNavigationButtons();

    if (this.isBrowser) {
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    } else {
      this.isLoading = false;
    }
  }

  private updateNavigationButtons() {
    this.canGoBack = this.historyIndex > 0;
    this.canGoForward = this.historyIndex < this.history.length - 1;
  }
}
