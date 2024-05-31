
import { Component } from '@angular/core';
import { NgxMatAuthConfirmResetPasswordComponent } from 'ngx-material-auth';

@Component({
    selector: 'app-confirm-reset-password',
    templateUrl: './confirm-reset-password.component.html',
    styleUrls: ['./confirm-reset-password.component.scss'],
    standalone: true,
    imports: [NgxMatAuthConfirmResetPasswordComponent]
})
export class ConfirmResetPasswordComponent { }