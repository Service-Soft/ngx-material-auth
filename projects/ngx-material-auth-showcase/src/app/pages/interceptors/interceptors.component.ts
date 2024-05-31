import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-interceptors',
    templateUrl: './interceptors.component.html',
    styleUrls: ['./interceptors.component.scss'],
    standalone: true,
    imports: [MatButtonModule]
})
export class InterceptorsComponent {

    constructor(
        private readonly http: HttpClient
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

    async sendRequestWithoutJwt(): Promise<void> {
        await firstValueFrom(this.http.get('http://www.google.de/request-without-jwt'));
    }
}