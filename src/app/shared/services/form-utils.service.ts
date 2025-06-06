import { Injectable } from '@angular/core';
import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormUtilsService {
  showPasswords: { [key: string]: boolean } = {};

  togglePasswordVisibility(fieldId: string): void {
    this.showPasswords[fieldId] = !this.showPasswords[fieldId];
    const field = document.getElementById(fieldId) as HTMLInputElement;
    if (field) field.type = this.showPasswords[fieldId] ? 'text' : 'password';
  }

  passwordMatchValidator(passwordField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordField)?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { mismatch: true };
    };
  }

  isTouched(form: FormGroup, fieldName: string): boolean {
    return form.get(fieldName)?.touched ?? false;
  }

  isPristine(form: FormGroup, fieldName: string): boolean {
    return form.get(fieldName)?.pristine ?? false;
  }
}
