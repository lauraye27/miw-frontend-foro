import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '@core/services/auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [NavbarComponent, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService) {}

  register() {
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const user = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        alert('Registro exitoso');
        console.log(response);
      },
      error: (err) => {
        alert('Error en el registro');
        console.error(err);
      },
    });
  }
}
