import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CustomAuthService } from '../../services/custom-auth.service';

@Component({
    selector: 'app-interceptors',
    templateUrl: './interceptors.component.html',
    styleUrls: ['./interceptors.component.scss'],
    standalone: true,
    imports: [MatButtonModule]
})
export class InterceptorsComponent {

    get tokenExpired(): boolean {
        const tokenExpirationDate: Date = new Date(this.authService.authData?.accessToken.expirationDate as Date);
        const expirationInMs: number = tokenExpirationDate.getTime();
        return expirationInMs <= Date.now();
    }

    constructor(
        private readonly http: HttpClient,
        private readonly authService: CustomAuthService
    ) { }

    async produce404Error(): Promise<void> {
        await firstValueFrom(this.http.get(`${environment.apiUrl}/throw-404`));
    }

    async produce401Error(): Promise<void> {
        await firstValueFrom(this.http.get(`${environment.apiUrl}/throw-401`));
    }

    async sendRequestWithJwt(): Promise<void> {
        await firstValueFrom(this.http.get(`${environment.apiUrl}/request-with-jwt`));
    }

    async sendMultipleRequestsWithJwt(): Promise<void> {
        await Promise.all([
            this.sendRequestWithJwt(),
            this.sendRequestWithJwt(),
            this.sendRequestWithJwt(),
            this.sendRequestWithJwt(),
            this.sendRequestWithJwt()
        ]);
        // eslint-disable-next-line typescript/no-misused-promises
        setTimeout(() => this.sendRequestWithJwt(), 200);
        // eslint-disable-next-line typescript/no-misused-promises
        setTimeout(() => this.sendRequestWithJwt(), 500);
    }

    async sendRequestWithoutJwt(): Promise<void> {
        await firstValueFrom(this.http.get('http://www.google.de/request-without-jwt'));
    }
}