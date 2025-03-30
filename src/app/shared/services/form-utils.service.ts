import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormUtilsService {
  isTouched(form: FormGroup, fieldName: string): boolean {
    return form.get(fieldName)?.touched ?? false;
  }

  isPristine(form: FormGroup, fieldName: string): boolean {
    return form.get(fieldName)?.pristine ?? false;
  }
}
