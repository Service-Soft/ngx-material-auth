import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InterceptorsComponent } from './interceptors.component';

const routes: Routes = [{ path: '', component: InterceptorsComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InterceptorsRoutingModule { }