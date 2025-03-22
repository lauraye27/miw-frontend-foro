import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '@core/services/auth.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [NavbarComponent, FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  // firstName: string = '';
  // lastName: string = '';
  // email: string = '';
  // password: string = '';
  // confirmPassword: string = '';
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // register() {
  //   if (this.password !== this.confirmPassword) {
  //     alert('Las contraseñas no coinciden');
  //     return;
  //   }
  //
  //   const user = {
  //     firstName: this.firstName,
  //     lastName: this.lastName,
  //     email: this.email,
  //     password: this.password,
  //   };
  //
  //   this.authService.register(user).subscribe({
  //     next: (response) => {
  //       alert('Registro exitoso');
  //       console.log(response);
  //     },
  //     error: (err) => {
  //       alert('Error en el registro');
  //       console.error(err);
  //     },
  //   });
  // }

  register() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please check the fields and try again';
      return;
    }

    const user = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log(response);
        this.errorMessage = null;
        this.registerForm.reset();
        this.successMessage = 'Registration successful...';
        setTimeout(() => {
          this.router.navigate(['/login']).then(r => {
            console.log('Redirected to login page');
          });
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Registration failed. Please try again';
      },
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}
