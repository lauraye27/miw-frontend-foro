import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {Router} from '@angular/router';
import {NavbarComponent} from '../../navbar/navbar.component';
import {NgClass, NgIf} from '@angular/common';
import {filter, take} from 'rxjs';
import {User} from '@core/models/user.model';
import {MessageComponent} from "../../shared/message/message.component";
import { FormUtilsService } from '../../shared/services/form-utils.service';
import {MatDialog, MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    NavbarComponent,
    NgIf,
    NgClass,
    MessageComponent,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButton,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent  implements OnInit {
  userProfileForm: FormGroup;
  user: User = null;
  isEditMode: boolean = false;
  showPasswords: { [key: string]: boolean } = {
    password: false,
    newPassword: false,
    confirmPassword: false
  };
  showPasswordSection: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  @ViewChild('deleteConfirmationTemplate') deleteConfirmationTemplate!: TemplateRef<any>;

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
            Validators.minLength(6),
            Validators.maxLength(12),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/),
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

      this.userProfileForm.get('newPassword')?.setErrors(null);
      this.userProfileForm.get('confirmPassword')?.setErrors(null);
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
        this.toggleEdit();
        this.loadUserDetails();

        setTimeout(() => {
          this.successMessage = null;
        }, 2000);
      },
      error: error => {
        console.error('Error en la actualización:', error);
        this.errorMessage = error.status === 400 ? 'Validation failed'
          : error?.status === 403 ? 'Permission denied' : 'Error updating user';
      }
    });
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

  openDeleteConfirmation() {
    const dialogRef = this.dialog.open(this.deleteConfirmationTemplate, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete the account? This action cannot be undone'
      }
    });

    dialogRef.afterClosed().subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
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
}
