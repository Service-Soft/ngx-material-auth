import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmResetPasswordComponent } from './confirm-reset-password.component';

const routes: Routes = [{ path: '', component: ConfirmResetPasswordComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConfirmResetPasswordRoutingModule { }