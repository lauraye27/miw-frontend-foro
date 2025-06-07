import {ChangeDetectorRef, Component} from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MessageComponent} from '../../shared/message/message.component';
import {UserFormComponent} from '../../shared/user-form/user-form.component';
import {User} from '@core/models/user.model';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, ReactiveFormsModule, MessageComponent, UserFormComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
  }

  onRegister(user: Partial<User>) {
    this.errorMessage = '';

    this.authService.register(user).subscribe({
      next: () => {
        this.errorMessage = '';
        this.successMessage = 'Registration successful';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/login']).then();
        }, 1000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'An error occurred';
        this.cdr.detectChanges();
      },
    });
  }
}
