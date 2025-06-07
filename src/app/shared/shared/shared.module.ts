import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageComponent} from '../message/message.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {PaginationComponent} from '../pagination/pagination.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MessageComponent,
    ConfirmationDialogComponent,
    PaginationComponent
  ],
  exports: [MessageComponent, ConfirmationDialogComponent, PaginationComponent],
})
export class SharedModule { }
