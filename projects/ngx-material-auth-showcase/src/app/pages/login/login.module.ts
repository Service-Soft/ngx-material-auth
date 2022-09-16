import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { NgxMatAuthLoginModule } from 'ngx-material-auth';
import { LoginRoutingModule } from './login-routing.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        NgxMatAuthLoginModule,
        LoginRoutingModule,
        MatButtonModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule { }