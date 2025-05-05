import { Component } from '@angular/core';
import {NavbarComponent} from '../navbar/navbar.component';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {MessageComponent} from '../shared/message/message.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    NavbarComponent,
    FormsModule,
    ReactiveFormsModule,
    MessageComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      return;
    }

    this.successMessage = null;
    this.errorMessage = null;

    this.authService.requestPasswordReset(this.resetForm.value.email).subscribe({
      next: () => this.successMessage = 'Reset link sent to your email',
      error: (err) => this.errorMessage = err.message
    });
  }
}
