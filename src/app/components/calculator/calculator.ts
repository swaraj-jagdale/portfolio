import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.html',
  styleUrl: './calculator.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class CalculatorComponent {
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();

  display: string = '0';
  previousValue: number = 0;
  currentValue: string = '';
  operation: string | null = null;
  isMinimized: boolean = false;
  isOpen = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  appendNumber(num: string) {
    if (this.currentValue === '' && num !== '.') {
      this.currentValue = num;
    } else if (num === '.' && !this.currentValue.includes('.')) {
      this.currentValue += num;
    } else if (num !== '.') {
      this.currentValue += num;
    }
    this.display = this.currentValue;
  }

  appendOperation(op: string) {
    if (this.currentValue === '') return;
    
    if (this.operation !== null) {
      this.calculate();
    } else {
      this.previousValue = parseFloat(this.currentValue);
    }
    
    this.operation = op;
    this.currentValue = '';
  }

  calculate() {
    if (this.operation === null || this.currentValue === '') return;
    
    const curr = parseFloat(this.currentValue);
    let result = 0;
    
    switch (this.operation) {
      case '+':
        result = this.previousValue + curr;
        break;
      case '-':
        result = this.previousValue - curr;
        break;
      case '*':
        result = this.previousValue * curr;
        break;
      case '/':
        result = this.previousValue / curr;
        break;
    }
    
    this.display = result.toString();
    this.currentValue = result.toString();
    this.operation = null;
    this.previousValue = 0;
  }

  equals() {
    this.calculate();
  }

  clear() {
    this.display = '0';
    this.currentValue = '';
    this.previousValue = 0;
    this.operation = null;
  }

  backspace() {
    this.currentValue = this.currentValue.slice(0, -1);
    this.display = this.currentValue || '0';
  }

  toggleSign() {
    if (this.currentValue === '') return;
    this.currentValue = (parseFloat(this.currentValue) * -1).toString();
    this.display = this.currentValue;
  }

  closeWindow() {
    if (!this.isBrowser) return;
    this.isOpen = false;
    this.close.emit();
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
  }

  open() {
    if (!this.isBrowser) return;
    this.isOpen = true;
    this.isMinimized = false;
  }
}
