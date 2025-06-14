import {RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { foroComponent } from './pages/foro/foro.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {QuestionFormComponent} from './pages/question-form/question-form.component';
import {MyQuestionsComponent} from './pages/my-questions/my-questions.component';
import {QuestionComponent} from './pages/question/question.component';
import {UsersComponent} from './admin/users/users.component';
import {TagComponent} from './pages/tag/tag.component';
import {TagsComponent} from './admin/tags/tags.component';
import {Role} from '@core/models/role.model';
import {RoleGuardService} from '@core/services/role-guard.service';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {AnswerFormComponent} from './pages/answer-form/answer-form.component';
import {MyAnswersComponent} from './pages/my-answers/my-answers.component';
import {AuthRedirectGuard} from '@core/services/auth-redirect-guard.service';

export const routes: Routes = [
  { path: 'questions', component: foroComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthRedirectGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [AuthRedirectGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'question-form', component: QuestionFormComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  { path: 'question-form/:id', component: QuestionFormComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  { path: 'my-questions', component: MyQuestionsComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  { path: 'question', component: QuestionComponent },
  { path: 'question/:id', component: QuestionComponent },
  { path: 'tags', component: TagComponent },
  { path: 'answer-form', component: AnswerFormComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  { path: 'answer-form/:id', component: AnswerFormComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  { path: 'my-answers', component: MyAnswersComponent, canActivate: [RoleGuardService], data: { roles: [Role.MEMBER, Role.ADMIN] } },
  {
    path: 'admin',
    canActivate: [RoleGuardService],
    data: { roles: [Role.ADMIN] },
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'tags', component: TagsComponent },
      { path: '**', redirectTo: '/not-found' }
    ]
  },

  { path: 'not-found', component: NotFoundComponent },
  { path: '', redirectTo: 'questions', pathMatch: 'full' },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
