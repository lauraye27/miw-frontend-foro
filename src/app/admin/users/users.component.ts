import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {AuthService} from '@core/services/auth.service';
import {User} from '@core/models/user.model';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessageComponent} from '../../shared/message/message.component';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {PaginationComponent} from '../../shared/pagination/pagination.component';
import {UserFormComponent} from '../../shared/user-form/user-form.component';

@Component({
  selector: 'app-users',
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
    MessageComponent,
    ReactiveFormsModule,
    PaginationComponent,
    UserFormComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  showForm: boolean = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private router: Router, public auth: AuthService, protected dialog: MatDialog, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.loadUsers();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onCreateUser(user: Partial<User>): void {
    this.errorMessage = '';
    this.auth.createUser(user).subscribe({
      next: createdUser => {
        this.errorMessage = '';
        this.successMessage = `User ${createdUser.userName} created successfully`;
        this.cdr.detectChanges();
        this.showForm = false;
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'An error occurred';
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(page: number = 0): void {
    this.auth.getUsers(page).subscribe({
      next: (data) => {
        this.users = data.content;
        this.currentPage = data.page.number;
        this.totalPages = data.page.totalPages;
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages && newPage !== this.currentPage) {
      this.loadUsers(newPage);
    }
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
          error: () => {
            this.errorMessage = 'An error occurred while deleting the user';
          }
        });
      }
    });
  }
}
