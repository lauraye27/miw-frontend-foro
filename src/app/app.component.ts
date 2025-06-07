import { Component } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';
import {NavbarComponent} from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'miw-frontend-foro';

  constructor(private readonly router: Router) { }

  hideFooter(): boolean {
    return this.router.url.includes('login') || this.router.url.includes('registro') ||
      this.router.url.includes('profile') || this.router.url.includes('forgot-password');
  }
}
