import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {HttpService} from '@core/services/http.service';
import {Router} from '@angular/router';
import {environment} from '@env';
import {NavbarComponent} from '../../navbar/navbar.component';
import {NgClass, NgIf} from '@angular/common';
import {filter, take, tap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {User} from '@core/models/user.model';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    NavbarComponent,
    NgIf,
    NgClass
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent  implements OnInit {
  userProfileForm: FormGroup;
  user: User = null;
  userId: number;
  isEditMode: boolean = false;
  showPasswords: { [key: string]: boolean } = {
    password: false,
    newPassword: false,
    confirmPassword: false
  };
  showPasswordSection: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private fb: FormBuilder
  ) {
    this.userProfileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
      ]],
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.authService.user$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.loadUserDetails();
    });
  }

  loadUserDetails(): void {
    this.authService.getUserDetails().subscribe(
      user => {
        this.user = user;
        this.userProfileForm.patchValue({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
        console.log('User details:', user);
      },
      error => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  togglePasswordVisibility(field: string): void {
    this.showPasswords[field] = !this.showPasswords[field];
    const passwordField = document.getElementById(field) as HTMLInputElement;
    passwordField.type = this.showPasswords[field] ? 'text' : 'password';
  }

  passwordMatchValidator(formGroup: FormGroup): any {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsDontMatch: true };
  }

  toggleEdit(): void {
    if (this.isEditMode) {
      this.resetForm();
    }
    this.isEditMode = !this.isEditMode;
    this.errorMessage = '';
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.userProfileForm.get('currentPassword')?.reset();
      this.userProfileForm.get('newPassword')?.reset();
      this.userProfileForm.get('confirmPassword')?.reset();
    }
  }

  resetForm(): void {
    const user = this.authService.getUser();
    console.log('Current user:', this.authService.getUser());
    if (user) {
      this.userProfileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    this.userProfileForm.markAsPristine();
    this.userProfileForm.markAsUntouched();
    this.errorMessage = '';
    this.showPasswordSection = false;
  }

  private validateForm(): { isValid: boolean, data: any, errorMessage: string } {
    if (this.userProfileForm.invalid) {
      return {
        isValid: false,
        data: null,
        errorMessage: 'Please check the fields'
      };
    }
    const { firstName, lastName, email, newPassword, confirmPassword, currentPassword } = this.userProfileForm.value;
    const updatedUser: any = { firstName, lastName, email };
    if (this.showPasswordSection) {
      if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
        return {
          isValid: false,
          data: null,
          errorMessage: 'Passwords do not match or current password is missing'
        };
      }
    }
    return {
      isValid: true,
      data: { updatedUser, currentPassword, newPassword },
      errorMessage: ''
    };
  }

  private updateUserWithPasswordVerification(updatedUser: any, currentPassword: string, newPassword: string): void {
    this.authService.verifyCurrentPassword(currentPassword).subscribe(
      isValid => {
        if (isValid) {
          updatedUser['password'] = newPassword;
          this.updateUser(updatedUser);
        } else {
          this.errorMessage = 'Current password is incorrect';
        }
      },
      error => {
        this.errorMessage = 'Error verifying current password';
      }
    );
  }

  private updateUser(updatedUser: any): void {
    this.httpService.put(`${environment.REST_USER}/user/${this.authService.getUser()?.id}`, updatedUser).pipe(
      tap(() => {
        this.successMessage = 'Changes saved successfully';
        this.errorMessage = null;
        this.toggleEdit();
        this.loadUserDetails();

        setTimeout(() => {
          this.successMessage = null;
        }, 2000);
      }),
      catchError(error => {
        if (error.status === 400) {
          this.errorMessage = 'Validation failed';
        } else {
          this.errorMessage = 'Error updating user';
        }
        return throwError(() => error);
      })
    ).subscribe();
  }

  saveChanges(): void {
    const validationResult = this.validateForm();
    if (!validationResult.isValid) {
      this.errorMessage = validationResult.errorMessage;
      return;
    }

    const { updatedUser, currentPassword, newPassword } = validationResult.data;
    if (this.showPasswordSection) {
      this.updateUserWithPasswordVerification(updatedUser, currentPassword, newPassword);
    } else {
      this.updateUser(updatedUser);
    }
  }
}
