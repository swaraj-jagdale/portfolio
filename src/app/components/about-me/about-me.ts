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
    'Java',
    'Python',
    'TypeScript / JavaScript',
    'C++',
    'Go (Golang)',
    'Angular',
    'Spring Boot',
    'LangGraph / LangChain',
    'MCP (Model Context Protocol)',
    'PyTorch / TensorFlow',
    'Jenkins / CI/CD',
    'Cypress',
    'Docker',
    'Git / Linux',
  ];

  skills: string[] = [
    'Agentic AI & LLM Workflows',
    'System Design & Distributed Systems',
    'Backend Engineering (Java / Python)',
    'REST APIs & Microservices',
    'Full-Stack Development',
    'Frontend Architecture (Angular)',
    'RAG & Vector Databases',
    'Performance Optimization',
    'CI/CD Automation',
    'Test Automation (Cypress / JUnit)',
    'Deep Learning & Computer Vision',
    'Research & Applied ML',
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

  openResume() {
    window.open('/public/Resume.pdf', '_blank');
  }
}
