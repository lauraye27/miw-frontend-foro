import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageComponent} from '../message/message.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {QuestionsPaginationComponent} from '../questions-pagination/questions-pagination.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MessageComponent,
    ConfirmationDialogComponent,
    QuestionsPaginationComponent
  ],
  exports: [MessageComponent, ConfirmationDialogComponent, QuestionsPaginationComponent],
})
export class SharedModule { }
