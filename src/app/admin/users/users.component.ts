import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {AuthService} from '@core/services/auth.service';
import {NavbarComponent} from '../../navbar/navbar.component';
import {User} from '@core/models/user.model';
import {Role} from '@core/models/role.model';
import {FormsModule} from '@angular/forms';
import {MessageComponent} from '../../shared/message/message.component';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [
    NgForOf,
    NavbarComponent,
    FormsModule,
    NgIf,
    MessageComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  errorMessage: string | null = null;
  successMessage: string | null = null;

  newUser: Partial<User> = {
    firstName: '',
    lastName: '',
    userName: '',
    phone: '',
    email: '',
    password: '',
    role: Role.MEMBER
  };

  showForm: boolean = false;

  constructor(private router: Router, public auth: AuthService, protected dialog: MatDialog) {}

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
    if (!this.validateUser()) {
      return;
    }

    this.auth.createUser(this.newUser).subscribe({
      next: (createdUser) => {
        this.successMessage = `User ${createdUser.userName} created successfully`;
        this.resetForm();
        this.showForm = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.errorMessage = 'Error creating user';
      }
    });
  }

  validateUser(): boolean {
    return !!this.newUser.firstName && !!this.newUser.lastName && !!this.newUser.userName &&
      !!this.newUser.email && !!this.newUser.password;
  }

  private resetForm(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      userName: '',
      phone: '',
      email: '',
      password: '',
      role: Role.MEMBER
    };
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
