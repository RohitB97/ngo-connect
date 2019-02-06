import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForumDetailComponent } from './forum-detail/forum-detail.component';
import { ForumListComponent } from './forum-list/forum-list.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
	{path: 'details/:id', component: ForumDetailComponent},
	{path: 'profile/:id', component: ProfileComponent},
	{path: '', component: ForumListComponent},
	{path: '**', redirectTo:'/'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
