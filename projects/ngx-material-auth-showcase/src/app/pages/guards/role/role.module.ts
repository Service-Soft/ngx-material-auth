import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleComponent } from './role.component';
import { RoleRoutingModule } from './role-routing.module';

@NgModule({
    imports: [
        CommonModule,
        RoleRoutingModule
    ],
    declarations: [RoleComponent]
})
export class RoleModule { }