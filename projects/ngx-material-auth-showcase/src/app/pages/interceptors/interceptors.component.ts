/* eslint-disable jsdoc/require-jsdoc */
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'projects/ngx-material-auth-showcase/src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-interceptors',
    templateUrl: './interceptors.component.html',
    styleUrls: ['./interceptors.component.scss']
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