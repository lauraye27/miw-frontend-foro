import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '@core/services/auth.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [NavbarComponent, ReactiveFormsModule, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private router: Router, private authService: AuthService, private readonly dialog: MatDialog) {
  }

  login() {
    this.errorMessage = null;
    this.authService.login(this.email, this.password).subscribe(
      () => {
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/']).then().finally(() => this.dialog.closeAll());
        } else {
          this.errorMessage = 'Error credentials';
        }
      },
      error => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid credentials. Please try again';
      }
    );
  }
}

