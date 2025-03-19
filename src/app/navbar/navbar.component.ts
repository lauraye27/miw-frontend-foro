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
  firstName: string = '';
  lastName: string = '';

  constructor(protected authService: AuthService) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
      }
    });
  }

  get userNameInitials(): string {
    const firstInitial = this.firstName ? this.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
    return (firstInitial + lastInitial) || '?';
  }

  logout() {
    this.authService.logout();
  }

}
