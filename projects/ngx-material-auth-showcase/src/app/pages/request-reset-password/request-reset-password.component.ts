import { Component } from '@angular/core';
import { NgxMatAuthRequestResetPasswordComponent } from 'ngx-material-auth';

@Component({
    selector: 'app-request-reset-password',
    templateUrl: './request-reset-password.component.html',
    styleUrls: ['./request-reset-password.component.scss'],
    standalone: true,
    imports: [
        NgxMatAuthRequestResetPasswordComponent
    ]
})
export class RequestResetPasswordComponent { }