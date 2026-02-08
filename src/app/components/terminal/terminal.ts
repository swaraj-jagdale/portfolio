import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XpWindowComponent } from '../xp-window/xp-window';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.html',
  styleUrl: './terminal.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, XpWindowComponent],
})
export class TerminalComponent implements AfterViewInit {
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @ViewChild('outputDiv') outputDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  output: string[] = ['Microsoft(R) Retro System Command Prompt [Version 95.0]', '(C) Microsoft Corp. Type "help" for commands.\n'];
  currentInput: string = '';
  isOpen = false;
  isMinimized = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.inputElement?.nativeElement?.focus();
      });
    }
  }

  minimizeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.isMinimized = true;
    this.minimize.emit();
  }

  restore() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.isMinimized = false;
    if (this.isBrowser) {
      setTimeout(() => {
        this.inputElement?.nativeElement?.focus();
      }, 0);
    }
  }

  executeCommand(cmd: string) {
    const trimmed = cmd.trim().toLowerCase();
    this.output.push(`C:\\> ${cmd}`);

    switch (trimmed) {
      case 'help':
        this.output.push('Commands: help, clear, time, date, echo, dir, whoami, system');
        break;
      case 'clear':
        this.output = [];
        break;
      case 'time':
        this.output.push(`Current time: ${new Date().toLocaleTimeString()}`);
        break;
      case 'date':
        this.output.push(`Current date: ${new Date().toLocaleDateString()}`);
        break;
      case 'whoami':
        this.output.push('swaraj');
        break;
      case 'dir':
        this.output.push('C:\\Users\\swaraj\\Documents');
        break;
      case 'system':
        this.output.push('Retro Desktop System v1.0\nProcessor: Intel Core i7-Retro\nMemory: 8 GB RAM');
        break;
      default:
        if (trimmed.startsWith('echo ')) {
          this.output.push(cmd.substring(5));
        } else if (trimmed) {
          this.output.push(`'${cmd}' is not recognized as an internal or external command.`);
        }
    }

    this.output.push('');
    this.currentInput = '';
    setTimeout(() => {
      this.outputDiv.nativeElement.scrollTop = this.outputDiv.nativeElement.scrollHeight;
      this.inputElement?.nativeElement?.focus();
    });
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.executeCommand(this.currentInput);
    }
  }

  closeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.close.emit();
  }

  open() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    setTimeout(() => this.inputElement?.nativeElement?.focus());
  }
}
