import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CustomAuthService } from '../../../services/custom-auth.service';

@Component({
    selector: 'app-logged-in',
    templateUrl: './logged-in.component.html',
    styleUrls: ['./logged-in.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule
    ]
})
export class LoggedInComponent {

    constructor(
        readonly authService: CustomAuthService,
        private readonly http: HttpClient
    ) { }

    markAccessTokenAsExpired(): void {
        if (!this.authService.authData) {
            return;
        }
        this.authService.authData.accessToken.expirationDate = new Date();
    }

    markRefreshTokenAsExpired(): void {
        if (!this.authService.authData) {
            return;
        }
        this.authService.authData.refreshToken.expirationDate = new Date();
    }

    async getCurrentUserData(): Promise<void> {
        const userData: string = await firstValueFrom(this.http.get(`${environment.apiUrl}/user-data`, { responseType: 'text' }));
        alert(`Got the user data: ${userData}`);
    }
}