import {ChangeDetectorRef, Component} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NgClass, NgIf} from '@angular/common';
import {MessageComponent} from '../../shared/message/message.component';
import {FormUtilsService} from '../../shared/services/form-utils.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, MessageComponent, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  submitted = false;
  errorMessage: string | null = null;

  constructor(private router: Router, private authService: AuthService, private readonly dialog: MatDialog,
              public formUtils: FormUtilsService, private cdr: ChangeDetectorRef) {}

  login() {
    this.cdr.detectChanges();
    this.submitted = true;
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
      },
    });
  }

  openForgotPassword() {
    window.open('/forgot-password', '_blank');
  }
}

