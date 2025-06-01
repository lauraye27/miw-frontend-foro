import {ChangeDetectorRef, Component} from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '@core/services/auth.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {MessageComponent} from '../../shared/message/message.component';
import { FormUtilsService } from '../../shared/services/form-utils.service';

@Component({
  selector: 'app-registro',
  imports: [NavbarComponent, FormsModule, ReactiveFormsModule, NgIf, MessageComponent, NgClass],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,
              public formUtils: FormUtilsService, private cdr: ChangeDetectorRef) {
    this.registerForm = this.fb.group(
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
      }, {
        validators: formUtils.passwordMatchValidator('password'),
      });
  }

  register() {
    this.errorMessage = null;
    this.cdr.detectChanges();

    if (this.registerForm.invalid) {
      const passwordControl = this.registerForm.get('password');
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

    const user = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      userName: this.registerForm.value.userName,
      phone: this.registerForm.value.phone,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log(response);
        this.errorMessage = '';
        this.registerForm.reset();
        this.successMessage = 'Registration successful';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/login']).then();
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err;
        this.cdr.detectChanges();
      },
    });
  }
}
