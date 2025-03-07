import {Component, OnInit} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {

  isAuthenticated = false;
  userName: string = '';

  constructor(protected authService: AuthService) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.firstName;
      }
    });
  }

  get userNameInitial(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : '?';
  }

  logout() {
    this.authService.logout();
  }

}
