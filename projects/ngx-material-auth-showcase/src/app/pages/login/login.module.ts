import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxMatAuthLoginComponent } from 'ngx-material-auth';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
    imports: [
        CommonModule,
        NgxMatAuthLoginComponent,
        LoginRoutingModule,
        MatButtonModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule { }