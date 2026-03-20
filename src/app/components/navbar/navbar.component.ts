import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  toolsOpen = false;

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }
  closeMenu() {
    this.menuOpen = false;
    this.toolsOpen = false;
  }
  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);
    }
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  toggleTools() {
    this.toolsOpen = !this.toolsOpen;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar')) {
      this.closeMenu();
    }
  }
}