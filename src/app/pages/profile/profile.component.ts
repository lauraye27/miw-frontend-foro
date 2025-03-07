import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {HttpService} from '@core/services/http.service';
import {Router} from '@angular/router';
import {environment} from '@env';
import {NavbarComponent} from '../../navbar/navbar.component';
import {NgIf} from '@angular/common';
import {tap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    NavbarComponent,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent  implements OnInit {
  userProfileForm: FormGroup;
  userId: number;
  isEditMode: boolean = false;
  showPasswordSection: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userProfileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      // password: ['', [Validators.minLength(6), Validators.maxLength(12)]],
      // confirmPassword: ['']
      currentPassword: [''],
      newPassword: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(formGroup: FormGroup): any {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsDontMatch: true };
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.id;
      this.userProfileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    } else {
      this.authService.getUserDetails().subscribe(
        user => {
          this.userId = user.id!;
          this.userProfileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
        },
        error => {
          console.error('Error fetching user details:', error);
        }
      );
    }
  }

  toggleEdit(): void {
    if (this.isEditMode) {
      this.resetForm();
    }
    this.isEditMode = !this.isEditMode;
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
  }

  resetForm(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userProfileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    }
    this.userProfileForm.markAsPristine();
    this.userProfileForm.markAsUntouched();
    this.errorMessage = '';
    this.showPasswordSection = false;
  }

  saveChanges(): void {
    if (this.userProfileForm.invalid) {
      this.errorMessage = 'Check the fields';
      return;
    }

    const { firstName, lastName, email, newPassword, confirmPassword, currentPassword } = this.userProfileForm.value;

    if (this.showPasswordSection) {
      if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
        this.errorMessage = 'Passwords do not match or current password is missing';
        return;
      }
    }

    const updatedUser = { firstName, lastName, email };
    if (this.showPasswordSection) {
      updatedUser['password'] = newPassword;
    }

    this.httpService.put(`${environment.REST_USER}/user/${this.userId}`, updatedUser)
      .pipe(
        tap(() => {
          alert('Changes saved');
          this.toggleEdit();
        }),
        catchError(error => {
          if (error.status === 400) {
            this.errorMessage = 'Validation failed';
          } else {
            this.errorMessage = 'Error updating user';
          }
          return throwError(() => error);
        })
      )
      .subscribe();

  }
}
