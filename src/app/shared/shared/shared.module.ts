import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageComponent} from '../message/message.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MessageComponent,
    ConfirmationDialogComponent
  ],
  exports: [MessageComponent, ConfirmationDialogComponent],
})
export class SharedModule { }
