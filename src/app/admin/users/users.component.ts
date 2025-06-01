import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {AuthService} from '@core/services/auth.service';
import {NavbarComponent} from '../../navbar/navbar.component';
import {User} from '@core/models/user.model';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MessageComponent} from '../../shared/message/message.component';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {FormUtilsService} from '../../shared/services/form-utils.service';

@Component({
  selector: 'app-users',
  imports: [
    NgForOf,
    NavbarComponent,
    FormsModule,
    NgIf,
    MessageComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  showForm: boolean = false;

  constructor(private router: Router, public auth: AuthService, private fb: FormBuilder,
              public formUtils: FormUtilsService, private cdr: ChangeDetectorRef, protected dialog: MatDialog) {
    this.userForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        userName: ['', Validators.required],
        phone: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        ],
        ],
        confirmPassword: ['', Validators.required],
        role: ['MEMBER']
      }, {
        validators: formUtils.passwordMatchValidator('password'),
      });
  }

  ngOnInit() {
    this.loadUsers();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  createUser(): void {
    this.errorMessage = null;
    this.successMessage = null;

    this.cdr.detectChanges();

    if (this.userForm.invalid) {
      const passwordControl = this.userForm.get('password');
      if (passwordControl?.errors?.['pattern']) {
        this.errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
        return;
      } else if (passwordControl?.errors?.['minlength']) {
        this.errorMessage = 'Password must be at least 8 characters long';
        return;
      }

      this.errorMessage = 'Please check the fields and try again';
      return;
    }

    const newUser = {
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      userName: this.userForm.value.userName,
      phone: this.userForm.value.phone,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      role: this.userForm.value.role
    };

    this.auth.createUser(newUser).subscribe({
      next: (createdUser) => {
        this.successMessage = `User ${createdUser.userName} created successfully`;
        this.userForm.reset();
        this.cdr.detectChanges();
        this.showForm = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.errorMessage = err;
        this.cdr.detectChanges();
      }
    });
  }

  private resetForm(): void {
    this.userForm.reset({
      role: 'MEMBER'
    });
  }

  loadUsers() {
    this.auth.getUsers().subscribe({
      next: (data) => this.users = data.content,
      error: (err) => console.error('Error loading users', err)
    });
  }

  onDeleteUser(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.auth.deleteUser(id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== id);
            this.router.navigate(['/admin/users']).then();
          },
          error: err => {
            this.errorMessage = 'An error occurred while deleting the user';
          }
        });
      }
    });
  }
}
