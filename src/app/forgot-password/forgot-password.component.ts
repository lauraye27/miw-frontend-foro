import { Component } from '@angular/core';
import {NavbarComponent} from '../navbar/navbar.component';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    NavbarComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private http: HttpClient, private fb: FormBuilder, private authService: AuthService) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // onSubmit() {
  //   this.http.post('/user/forgot-password', { email: this.email })
  //     .subscribe({
  //       next: () => {
  //         this.message = 'Password reset link has been sent to your email.';
  //         this.error = '';
  //       },
  //       error: (err) => {
  //         this.error = err.error || 'An error occurred.';
  //         this.message = '';
  //       }
  //     });
  // }

  onSubmit() {
    if (this.resetForm.invalid) {
      return;
    }

    this.authService.requestPasswordReset(this.resetForm.value.email).subscribe({
      next: () => this.message = 'Reset link sent to your email',
      error: (err) => this.error = err.error?.message || 'Error sending request'
    });
  }
}
