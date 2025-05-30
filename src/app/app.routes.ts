import {RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { foroComponent } from './pages/foro/foro.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {QuestionFormComponent} from './pages/question-form/question-form.component';
import {NotificationComponent} from './notification/notification.component';
import {MyQuestionsComponent} from './pages/my-questions/my-questions.component';
import {QuestionComponent} from './pages/question/question.component';
import {UsersComponent} from './admin/users/users.component';
import {TagComponent} from './pages/tag/tag.component';
import {TagsComponent} from './admin/tags/tags.component';

export const routes: Routes = [
  { path: 'questions', component: foroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'question-form', component: QuestionFormComponent },
  { path: 'question-form/:id', component: QuestionFormComponent },
  { path: 'my-questions', component: MyQuestionsComponent },
  { path: 'question', component: QuestionComponent },
  { path: 'question/:id', component: QuestionComponent },
  { path: 'tags', component: TagComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'admin/tags', component: TagsComponent },
{ path: '**', redirectTo: 'questions' },

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
