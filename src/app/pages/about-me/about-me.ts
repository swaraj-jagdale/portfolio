import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SidebarLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.html',
  styleUrls: ['./about-me.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AboutMeComponent {
  socialLinks: SidebarLink[] = [
    { label: 'Instagram', url: 'https://www.instagram.com/' },
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
  ];

  skills: string[] = [
    'Graphic Design',
    'Web Design',
    'Social Graphics',
    'Video Production',
    'UI/UX Design',
    'Attention to Detail',
    'Creative Thinking',
    'Problem Solving',
  ];

  software: string[] = [
    'Adobe CC',
    'VS Code',
    'Figma',
    'GitHub',
    'Docker',
    'WordPress',
    'Blender',
  ];

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
