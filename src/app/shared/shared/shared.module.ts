import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageComponent} from '../message/message.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MessageComponent
  ],
  exports: [MessageComponent],
})
export class SharedModule { }
