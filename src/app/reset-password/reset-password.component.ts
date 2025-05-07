import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {MessageComponent} from '../shared/message/message.component';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MessageComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
// export class ResetPasswordComponent {
//   token: string = '';
//   newPassword: string = '';
//   confirmPassword: string = '';
//   message: string = '';
//   error: string = '';
//
//   constructor(
//     private route: ActivatedRoute,
//     private http: HttpClient
//   ) {}
//
//   ngOnInit() {
//     this.route.queryParams.subscribe(params => {
//       this.token = params['token'];
//     });
//   }
//
//   onSubmit() {
//     if (this.newPassword !== this.confirmPassword) {
//       this.error = 'Passwords do not match';
//       return;
//     }
//
//     this.http.post('/user/reset-password', {
//       token: this.token,
//       newPassword: this.newPassword
//     }).subscribe({
//       next: () => {
//         this.message = 'Password has been reset successfully. You can now login with your new password.';
//         this.error = '';
//       },
//       error: (err) => {
//         this.error = err.error || 'An error occurred.';
//         this.message = '';
//       }
//     });
//   }
// }

export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string;
  loading = false;
  success = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid link';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) {
      return;
    }

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { newPassword } = this.resetForm.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.success = true;
        this.successMessage = 'Your password has been reset successfully';
        this.resetForm.disable();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to reset password';
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
