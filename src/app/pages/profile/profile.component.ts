import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {Router} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';
import {filter, take} from 'rxjs';
import {User} from '@core/models/user.model';
import {MessageComponent} from "../../shared/message/message.component";
import { FormUtilsService } from '../../shared/services/form-utils.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    MessageComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent  implements OnInit {
  userProfileForm: FormGroup;
  user: User = null;
  isEditMode: boolean = false;

  showPasswordSection: boolean = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder,
              public formUtils: FormUtilsService, protected dialog: MatDialog) {
    this.userProfileForm = this.fb.group(
        {
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          userName: ['', Validators.required],
          phone: [''],
          email: ['', [Validators.required, Validators.email]],
          currentPassword: [''],
          newPassword: ['', [
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
          ]],
          confirmPassword: ['']
        }, {
      validators: formUtils.passwordMatchValidator('newPassword'),
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
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          phone: user.phone,
          email: user.email
        });
      },
      error => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.isEditMode) {
      this.resetForm();
    }
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.userProfileForm.get('currentPassword')?.reset();
      this.userProfileForm.get('newPassword')?.reset();
      this.userProfileForm.get('confirmPassword')?.reset();

      this.userProfileForm.get('currentPassword')?.setErrors(null);
      this.userProfileForm.get('newPassword')?.setErrors(null);
      this.userProfileForm.get('confirmPassword')?.setErrors(null);
      this.userProfileForm.setErrors(null);
    }
  }

  resetForm(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userProfileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        phone: user.phone,
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

  saveChanges(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

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

  openDeleteConfirmation(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Account',
        message: 'Are you sure you want to delete the account? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteAccount();
      }
    });
  }

  deleteAccount() {
    const userId = this.authService.getUser()?.id;
    if (!userId) {
      this.errorMessage = 'Error in getting user';
      return;
    }

    this.authService.deleteUser(userId).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']).then(() => {
          this.successMessage = 'Account eliminated successfully';
        });
      },
      error: (err) => {
        console.error('Error deleting account:', err);
        if (err.status === 404) {
          this.errorMessage = 'User not found';
        } else if (err.status === 401) {
          this.errorMessage = 'No permission to delete';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again';
        }
      }
    });
  }

  private validateForm(): { isValid: boolean, data: any, errorMessage: string } {
    if (this.userProfileForm.invalid) {
      return {
        isValid: false,
        data: null,
        errorMessage: 'Please check the fields'
      };
    }
    const { firstName, lastName, userName, phone, email, newPassword, confirmPassword, currentPassword } = this.userProfileForm.value;
    const updatedUser: any = { firstName, lastName, userName, phone, email };
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
    this.authService.updateUser(updatedUser).subscribe({
      next: () => {
        this.successMessage = 'Changes saved successfully';
        this.errorMessage = null;
        this.submitted = false;
        this.toggleEdit();
        this.loadUserDetails();

        setTimeout(() => {
          this.successMessage = null;
        }, 2000);
      },
      error: error => {
        this.errorMessage = error.error.message;
      }
    });
  }
}
