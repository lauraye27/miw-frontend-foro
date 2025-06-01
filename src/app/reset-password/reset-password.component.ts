import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {MessageComponent} from '../shared/message/message.component';
import {FormUtilsService} from '../shared/services/form-utils.service';

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

export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string;
  loading = false;
  success = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private authService: AuthService,
              public formUtils: FormUtilsService) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),]],
      confirmPassword: ['', Validators.required]
    }, { validator: formUtils.passwordMatchValidator('newPassword') });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.router.navigate(['/questions']);
    }
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
    this.router.navigate(['/questions']);
  }
}
