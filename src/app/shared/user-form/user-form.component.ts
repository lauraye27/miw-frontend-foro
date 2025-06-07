import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MessageComponent} from '../message/message.component';
import {NgClass, NgIf} from '@angular/common';
import {User} from '@core/models/user.model';
import {FormUtilsService} from '../services/form-utils.service';

export interface UserFormOptions {
  showRoleSelect?: boolean;
  submitButtonText?: string;
}

@Component({
  selector: 'app-user-form',
  imports: [
    FormsModule,
    MessageComponent,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  @Input() initialData: Partial<User> = {};
  @Input() options: UserFormOptions = {};
  @Output() submitted = new EventEmitter<Partial<User>>();

  @Input() showLoginLink: boolean = false;

  form: FormGroup;
  formSubmitted = false;

  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, public formUtils: FormUtilsService, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['MEMBER'],
    }, { validators: this.formUtils.passwordMatchValidator('password') });
  }

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  onSubmit() {
    this.cdr.detectChanges();
    this.formSubmitted = true;
    this.errorMessage = null;

    if (this.form.invalid) {
      this.errorMessage = 'Please check the fields and try again';
      return;
    }

    const value = this.form.value;
    const userPayload = {
      firstName: value.firstName,
      lastName: value.lastName,
      userName: value.userName,
      phone: value.phone,
      email: value.email,
      password: value.password,
      role: value.role || 'MEMBER'
    };

    this.submitted.emit(userPayload);
  }
}
