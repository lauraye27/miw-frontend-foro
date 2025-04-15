import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    NgIf
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
  token: string;
  newPassword: string;
  confirmPassword: string;
  message: string;
  error: string;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe(
      () => this.message = 'Password updated successfully',
      err => this.error = err.error || 'Error resetting password'
    );
  }
}
