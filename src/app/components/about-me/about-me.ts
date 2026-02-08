import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XpWindowComponent } from '../xp-window/xp-window';

interface SidebarLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.html',
  styleUrl: './about-me.scss',
  standalone: true,
  imports: [CommonModule, XpWindowComponent],
})
export class AboutMeComponent {
  @Output() minimize = new EventEmitter<void>();
  @Input() socialLinks: SidebarLink[] = [];

  isOpen = false;
  isMinimized = false;

  software: string[] = [
    'Angular',
    'TypeScript / JavaScript',
    'Go (Golang)',
    'Spring Boot / Java',
    'Python',
    'PyTorch / TensorFlow',
    'Cypress',
    'Docker',
    'Git',
  ];

  skills: string[] = [
    'Full-Stack Development',
    'Frontend & Backend Architecture',
    'REST API & Microservices',
    'Concurrent Programming (Go)',
    'Performance Optimization',
    'Test Automation',
    'AI & Deep Learning',
    'System Design',
  ];

  windowWidth: number | string = 980;
  windowHeight: number | string = 640;
  windowLeft: number | string = 90;
  windowTop: number | string = 80;

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.isMinimized = false;
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
}
