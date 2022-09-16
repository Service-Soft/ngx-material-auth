import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JwtLoggedInGuard, JwtRoleGuard } from 'ngx-material-auth';
import { BelongsToUserGuard } from './services/belongs-to.guard';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'request-reset-password',
        loadChildren: () => import('./pages/request-reset-password/request-reset-password.module').then(m => m.RequestResetPasswordModule)
    },
    {
        path: 'confirm-reset-password',
        loadChildren: () => import('./pages/confirm-reset-password/confirm-reset-password.module').then(m => m.ConfirmResetPasswordModule)
    },
    {
        path: 'guards/logged-in',
        loadChildren: () => import('./pages/guards/logged-in/logged-in.module').then(m => m.LoggedInModule),
        canActivate: [JwtLoggedInGuard]
    },
    {
        path: 'guards/role',
        loadChildren: () => import('./pages/guards/role/role.module').then(m => m.RoleModule),
        canActivate: [JwtRoleGuard],
        data: { allowedRoles: ['admin'] }
    },
    {
        path: 'guards/belongs-to',
        loadChildren: () => import('./pages/guards/belongs-to/belongs-to.module').then(m => m.BelongsToModule),
        canActivate: [BelongsToUserGuard],
        data: { allowedUserIds: ['2'] }
    },
    {
        path: 'interceptors',
        loadChildren: () => import('./pages/interceptors/interceptors.module').then(m => m.InterceptorsModule),
        canActivate: [JwtLoggedInGuard]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }