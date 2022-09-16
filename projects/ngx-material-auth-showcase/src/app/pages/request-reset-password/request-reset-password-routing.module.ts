import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestResetPasswordComponent } from './request-reset-password.component';

const routes: Routes = [{ path: '', component: RequestResetPasswordComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestResetPasswordRoutingModule { }