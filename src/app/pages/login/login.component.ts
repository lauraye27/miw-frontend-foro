import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '@core/services/auth.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  imports: [NavbarComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService, private readonly dialog: MatDialog) {
  }

  login() {
    this.authService.login(this.email, this.password).subscribe(
      () => {
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/']).then().finally(() => this.dialog.closeAll());
        } else {
          this.dialog.closeAll();
        }
      }
    );
  }
}

