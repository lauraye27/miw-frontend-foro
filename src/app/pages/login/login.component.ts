import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '@core/services/auth.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NgIf} from '@angular/common';
import {MessageComponent} from '../../shared/message/message.component';

@Component({
  selector: 'app-login',
  imports: [NavbarComponent, ReactiveFormsModule, FormsModule, MessageComponent, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private router: Router, private authService: AuthService, private readonly dialog: MatDialog) {}

  login() {
    this.errorMessage = null;

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/']).then().finally(() => this.dialog.closeAll());
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Incorrect password';
        } else if (err.status === 404) {
          this.errorMessage = 'Email not valid';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again';
        }
        this.successMessage = null;
      },
    });
  }
}

