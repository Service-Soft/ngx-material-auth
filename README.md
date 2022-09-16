# NgxMaterialAuth

Provides functionality around authentication and authorization in angular.
This includes:
- A generic JwtAuthService that can easily be extended from
- Multiple Guards and HttpInterceptors that work right out of the box
- Ready to work with but highly customizable components for login, reset-password etc.

# Table of Contents
- [NgxMaterialAuth](#ngxmaterialauth)
- [Table of Contents](#table-of-contents)
- [Requirements](#requirements)
- [JwtAuthService](#jwtauthservice)
  - [Usage](#usage)
    - [Define your AuthService](#define-your-authservice)
    - [Override the injection token](#override-the-injection-token)
  - [Api](#api)
    - [JwtAuthService](#jwtauthservice-1)
    - [BaseToken](#basetoken)
    - [BaseAuthData](#baseauthdata)
- [Jwt Interceptor](#jwt-interceptor)
  - [Usage](#usage-1)
  - [Api](#api-1)
- [HTTP-Error Interceptor](#http-error-interceptor)
  - [Usage](#usage-2)
  - [Api](#api-2)
- [JwtLoggedInGuard](#jwtloggedinguard)
  - [Usage](#usage-3)
  - [Api](#api-3)
- [JwtNotLoggedInGuard](#jwtnotloggedinguard)
  - [Usage](#usage-4)
  - [Api](#api-4)
- [JwtRoleGuard](#jwtroleguard)
  - [Usage](#usage-5)
  - [Api](#api-5)
- [JwtBelongsToGuard](#jwtbelongstoguard)
  - [Usage](#usage-6)
    - [Implement your BelongsToGuard](#implement-your-belongstoguard)
    - [Add it to your route](#add-it-to-your-route)
  - [Api](#api-6)
- [NgxMatAuthLoginComponent](#ngxmatauthlogincomponent)
  - [Usage](#usage-7)
  - [Api](#api-7)
- [NgxMatAuthRequestResetPasswordComponent](#ngxmatauthrequestresetpasswordcomponent)
  - [Usage](#usage-8)
  - [Api](#api-8)
- [NgxMatAuthConfirmResetPasswordComponent](#ngxmatauthconfirmresetpasswordcomponent)
  - [Usage](#usage-9)
  - [Api](#api-9)
- [NgxMatAuthErrorDialogComponent](#ngxmatautherrordialogcomponent)
  - [Error Data](#error-data)
  - [Usage](#usage-10)
  - [Api](#api-10)

# Requirements
This package relies on the [angular material library](https://material.angular.io/guide/getting-started) to render its components.

It also uses [fontawesome-icons](https://fontawesome.com/start) in some components.

# JwtAuthService
The JwtAuthService provides functionality for most of the auth requirements:
- It handles syncing authentication data from and to localstorage
- It provides methods for login, logout, resetting the password, but also more advanced things like refreshing the current token
- Using generics you can change the type of the auth data and token data saved in local storage

It is also used in most of the other parts of the library.

In order to use it you need to extend your own service from it and register it in your app.module.ts provider array.
## Usage
### Define your AuthService
```typescript
import { BaseAuthData, BaseToken, JwtAuthService } from 'ngx-material-auth';

@Injectable({ providedIn: 'root' })                  // ↓ Can be customized ↓
export class CustomAuthService extends JwtAuthService<BaseAuthData, BaseToken> {
    readonly API_LOGIN_URL: string = `${environment.apiUrl}/login`;
    readonly API_REFRESH_TOKEN_URL: string = `${environment.apiUrl}/refresh-token`;
    readonly API_REQUEST_RESET_PASSWORD_URL: string = `${environment.apiUrl}/request-reset-password`;
    readonly API_CONFIRM_RESET_PASSWORD_URL: string = `${environment.apiUrl}/confirm-reset-password`;
    readonly API_VERIFY_RESET_PASSWORD_TOKEN_URL: string = `${environment.apiUrl}/verify-password-reset-token`;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly matSnackBar: MatSnackBar,
        private readonly ngZone: NgZone
    ) {
        super(httpClient, matSnackBar, ngZone);
    }
}
```
As you can see, you only have to override a few urls that are used in the services login/reset-password etc. methods.

You can however also customize [all other parts of the JwtAuthService](#jwtauthservice).

### Override the injection token
Everything else is already dealt with, all parts of NgxMaterialAuth already use that service. Now you need to provide it to them by overriding the injection token. Add the following to your app.module.ts:

```typescript
import { NGX_AUTH_SERVICE } from 'ngx-material-auth';
...
providers: [
    ...
    {
        provide: NGX_AUTH_SERVICE,
        useExisting: CustomAuthService
    }
    ...
],
...
```

That's it! Now you are ready to use all the parts NgxMaterialAuth has to offer:
## Api
### JwtAuthService
```typescript
/**
 * The base class for an authentication service.
 */
export abstract class JwtAuthService<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken
> {

    /**
     * The subject of the currently stored authData.
     */
    authDataSubject: BehaviorSubject<AuthDataType | undefined>;

    /**
     * The key for the authData saved in local storage.
     */
    readonly AUTH_DATA_KEY = 'authData';

    /**
     * The duration of the token in milliseconds.
     *
     * @default 86400000 // 1 day
     */
    readonly TOKEN_DURATION_IN_MS: number = DAY_IN_MS;

    /**
     * The message to display inside a snackbar when the mail for resetting a password was sent successfully.
     */
    readonly REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'A Mail for changing your password is on its way';

    /**
     * The message to display inside a snackbar when password was reset successfully.
     */
    readonly CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'Password changed successfully!';

    /**
     * The default url for login requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_LOGIN_URL: string;
    /**
     * The default url for refresh token requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_REFRESH_TOKEN_URL: string;
    /**
     * The default url for request reset password requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_REQUEST_RESET_PASSWORD_URL: string;
    /**
     * The default url for confirm reset password requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_CONFIRM_RESET_PASSWORD_URL: string;
    /**
     * The default url for verify password reset token requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_VERIFY_RESET_PASSWORD_TOKEN_URL: string;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The currently stored authData value.
     * Contains at least the token.
     */
    get authData(): AuthDataType | undefined {
        return this.authDataSubject.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set authData(authData: AuthDataType | undefined) {
        localStorage.setItem(this.AUTH_DATA_KEY, JSON.stringify(authData));
        this.authDataSubject.next(authData);
    }

    constructor(
        private readonly http: HttpClient,
        private readonly snackbar: MatSnackBar,
        private readonly zone: NgZone
    ) {
        const stringData = localStorage.getItem(this.AUTH_DATA_KEY);
        const authData = stringData ? JSON.parse(stringData) as AuthDataType : undefined;
        this.authDataSubject = new BehaviorSubject(authData);
    }

    /**
     * Login a user.
     *
     * @param loginData - The data that is sent to the server to login the user.
     * @returns A promise of the received authData.
     */
    async login(loginData: LoginData): Promise<AuthDataType> {
        this.authData = await firstValueFrom(this.http.post<AuthDataType>(this.API_LOGIN_URL, loginData));
        return this.authData;
    }

    /**
     * Logout the current user.
     */
    logout(): void {
        localStorage.removeItem(this.AUTH_DATA_KEY);
        this.authDataSubject.next(null as unknown as AuthDataType);
    }

    /**
     * Refreshes the token.
     * No data is sent to the server as the jwt in the header already contains the necessary information.
     */
    async refreshToken(): Promise<void> {
        if (!this.authData) {
            return;
        }
        // Updates the date of the token instantly. That way it is ensured that refreshToken is called only once.
        const newInvalidAfter = new Date();
        newInvalidAfter.setMilliseconds(newInvalidAfter.getMilliseconds() + this.TOKEN_DURATION_IN_MS);
        this.authData.token.expirationDate = newInvalidAfter;
        this.authData = this.authData; // refreshes subject and local storage

        const token: TokenType = await firstValueFrom(this.http.post<TokenType>(this.API_REFRESH_TOKEN_URL, {}));
        this.authData.token = token;
        this.authData = this.authData;
    }

    /**
     * Requests a new password from the server.
     * Should sent a reset-link to the given email with a one time short lived (~5 minutes) token.
     *
     * @param email - The email of the user that wants to reset his password.
     */
    async requestResetPassword(email: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(this.API_REQUEST_RESET_PASSWORD_URL, { email: email }));
        this.zone.run(() => {
            this.snackbar.open(this.REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE);
        });
    }

    /**
     * Confirms the reset of the password.
     *
     * @param newPassword - The new password.
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     */
    async confirmResetPassword(newPassword: string, resetToken: string): Promise<void> {
        const body = {
            password: newPassword,
            token: resetToken
        };
        await firstValueFrom(this.http.post<void>(this.API_CONFIRM_RESET_PASSWORD_URL, body));
        this.zone.run(() => {
            this.snackbar.open(this.CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE);
        });
    }

    /**
     * Checks if the given reset token is valid.
     *
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     * @returns Whether or not the given token is valid.
     */
    async isResetTokenValid(resetToken: string): Promise<boolean> {
        return await firstValueFrom(
            this.http.post<boolean>(this.API_VERIFY_RESET_PASSWORD_TOKEN_URL, { token: resetToken })
        );
    }

    /**
     * Checks whether or not the currently logged in user has one of the provided roles.
     *
     * @param allowedRoles - All roles that are allowed to do a certain thing.
     * @returns Whether or not the user has one of the provided allowed roles.
     */
    hasRole(allowedRoles: Role[]): boolean {
        if (!this.authData) {
            return false;
        }
        if (allowedRoles.find(r => this.authData?.roles.includes(r))) {
            return true;
        }
        return false;
    }
}
```

### BaseToken
Can be used either directly or be extended from if your token has additional values.

```typescript
/**
 * The minimum values for a token.
 */
export interface BaseToken {
    /**
     * The token itself.
     */
    value: string,
    /**
     * The timestamp at which the token becomes invalid.
     * Is needed to determine if the token needs to be refreshed.
     */
    expirationDate: Date
}
```

### BaseAuthData
Can be used either directly or be extended from if your authData has additional values.

```typescript
/**
 * The minimum values for authData.
 */
export interface BaseAuthData<Token extends BaseToken> {
    /**
     * The token used for authenticating requests.
     * Consists of the string value and the expirationDate value.
     */
    token: Token,
    /**
     * All roles of the currently logged in user.
     * Consists of an displayName and the actual string value.
     */
    roles: Role[],
    /**
     * The id of the currently logged in user.
     */
    userId: string
}
```

# Jwt Interceptor
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

This interceptor automatically adds the token from your AuthService to the authorization http header of every request (If a token exists).

It also handles the refreshing of your token if it going to run out. By default starting at 6 hours before the token expirationDate.
## Usage
Add this to your app.module.ts:
```typescript
...
providers: [
    ...
    {
        provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true
    }
    ...
]
...
```
## Api
```typescript
/**
 * Interceptor that sets the authorization header to the current token on every request.
 * Does nothing when the user isn't logged in.
 */
@Injectable({ providedIn: 'root' })
export class JwtInterceptor<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements HttpInterceptor {

    /**
     * The maximum amount of milliseconds before the expiration date to refresh the token.
     * If the token still has more time than this left, it will not get refreshed.
     */
    protected readonly MAXIMUM_MS_BEFORE_EXPIRATION_FOR_REFRESH: number = SIX_HOURS_IN_MS;

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        private readonly authService: AuthServiceType
    ) { }

    /**
     * The main method used by angular to intercept any http-requests and append the jwt.
     *
     * @param request - The http-request that was intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns An Observable that is used by angular in the intercept chain.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (!this.authService.authData?.token) {
            return next.handle(request);
        }
        if (this.tokenNeedsToBeRefreshed()) {
            void this.authService.refreshToken();
        }
        request = request.clone({
            setHeaders: {
                authorization: `Bearer ${this.authService.authData.token.value}`
            }
        });
        return next.handle(request);
    }

    /**
     * Checks whether or not the token needs to be refreshed.
     *
     * @returns Whether or not the token needs to be refreshed.
     */
    protected tokenNeedsToBeRefreshed(): boolean {
        const tokenExpirationDate: Date = new Date(this.authService.authData?.token.expirationDate as Date);
        const expirationInMs: number = tokenExpirationDate.getTime();
        return (expirationInMs - Date.now()) <= this.MAXIMUM_MS_BEFORE_EXPIRATION_FOR_REFRESH;
    }
}
```

# HTTP-Error Interceptor
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

This interceptor catches any error that comes from http and displays it inside of an dialog.

If the error has a specific status code (eg. 401 Unauthorized) the current user is logged out.

> :warning:
> <br>
> This does not handle CORS-Errors as these come directly from the browser.

## Usage
Add this to your app.module.ts:
```typescript
...
providers: [
    ...
    {
        provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true
    }
    ...
]
...
```
## Api
```typescript
/**
 * Interceptor that does error handling for every error that isn't treated locally.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements HttpInterceptor {

    /**
     * The route to which the user gets redirected to after he triggers an error which should log him out (eg. 401 Unauthorized).
     */
    protected readonly ROUTE_AFTER_LOGOUT = '/';

    /**
     * All error codes for which the user should be logged out.
     */
    protected readonly logoutStatuses: number[] = [
        HttpStatusCode.Unauthorized,
        HttpStatusCode.Forbidden
    ];

    /**
     * Any api urls for which the user shouldn't be logged out.
     * Eg. The login page.
     */
    protected readonly apiUrlsWithNoLogout: string[] = [];

    constructor(
        protected readonly router: Router,
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        protected readonly dialog: MatDialog
    ) { }

    /**
     * The main method used by angular to intercept any http-requests with errors.
     * Displays an error message to the user and logs him out if requested.
     *
     * @param request - The http-request that was intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns An Observable that is used by angular in the intercept chain.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (this.userShouldBeLoggedOut(error, request)) {
                    this.authService.logout();
                    void this.router.navigate([this.ROUTE_AFTER_LOGOUT], {});
                }
                if (this.errorDialogShouldBeDisplayed(error, request)) {
                    const errorData: ErrorData = { name: 'HTTP-Error', message: this.getErrorDataMessage(error) };
                    this.dialog.open(ErrorDialogComponent, { data: errorData, autoFocus: false, restoreFocus: false });
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Checks if the user should be logged out after triggering the provided error.
     *
     * @param error - The http-error that came from the api.
     * @param request - Data about the request that caused the error.
     * @returns Whether or not the current user should be logged out.
     */
    protected userShouldBeLoggedOut(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
        if (this.apiUrlsWithNoLogout.find(url => url === request.url)) {
            return false;
        }
        return !!this.logoutStatuses.find(s => s === error.status);
    }

    /**
     * Checks if an dialog for the given error should be displayed to the user.
     *
     * @param error - The http-error that was thrown.
     * @param request - Data about the request that caused the error.
     * @returns Whether or not an dialog should be displayed for the error.
     */
    protected errorDialogShouldBeDisplayed(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
        if (request.url === this.authService.API_REFRESH_TOKEN_URL) {
            return false;
        }
        return true;
    }

    /**
     * Gets the message from the HttpError.
     * Prefers the most nested one.
     *
     * @param error - The http-error that was thrown.
     * @returns The message of the http-error.
     */
    protected getErrorDataMessage(error: HttpErrorResponse): string {
        if (error.error != null) {
            return this.getErrorDataMessage(error.error as HttpErrorResponse);
        }

        if (typeof error === 'string') {
            return error as string;
        }
        if (error.message) {
            return error.message;
        }
        return JSON.stringify(error);
    }
}
```

# JwtLoggedInGuard
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

A guard that simply checks if the user is logged in or not.

## Usage
Just add the guard to any route that you want to protect:
```typescript
canActivate: [JwtLoggedInGuard]
```

## Api
```typescript
/**
 * Checks if the user is currently logged in.
 */
@Injectable({ providedIn: 'root' })
export class JwtLoggedInGuard<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements CanActivate {

    /**
     * When the user tries to access a route for which he doesn't have the permission he is logged out.
     * This is the route to which he is redirected afterwards.
     */
    protected readonly REDIRECT_ROUTE = '/login';

    constructor(
        private readonly router: Router,
        @Inject(NGX_AUTH_SERVICE)
        private readonly authService: AuthServiceType
    ) { }


    /**
     * The main method used by angular to determine if a user can access a certain route.
     *
     * @returns Whether or not the user can access the provided route.
     */
    canActivate(): boolean {
        if (this.authService.authData == null) {
            this.authService.logout();
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }
}
```

# JwtNotLoggedInGuard
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

This is just the inverse of the JwtLoggedInGuard.

## Usage
Just add the guard to any route that you want to protect:
```typescript
canActivate: [JwtLoggedInGuard]
```

## Api
```typescript
/**
 * Checks if the user is currently NOT logged in.
 * This can be useful if you want to disable already logged in user to access the login page etc.
 */
@Injectable({ providedIn: 'root' })
export class JwtNotLoggedInGuard<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements CanActivate {

    /**
     * The route to which the user is redirected if he is already logged in.
     */
    protected readonly REDIRECT_ROUTE = '/';

    constructor(
        protected readonly router: Router,
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType
    ) { }


    /**
     * The main method used by angular to determine if a user can access a certain route.
     *
     * @returns Whether or not the user can access the provided route.
     */
    canActivate(): boolean {
        if (this.authService.authData != null) {
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }
}
```

# JwtRoleGuard
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

A guard that checks if the logged in user has one of the allowed roles.

Tries to get the allowed roles from the routes data object by default.

## Usage
Just add the guard to any route that you want to protect:
```typescript
canActivate: [JwtRoleGuard]
```

## Api
```typescript
/**
 * Contains the necessary base information for an angular role guard.
 * Checks if the currently logged in user has the role required for a specific route.
 */
@Injectable({ providedIn: 'root' })
export class JwtRoleGuard<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements CanActivate {

    /**
     * When the user tries to access a route for which he doesn't have the permission he is logged out.
     * This is the route to which he is redirected afterwards.
     */
    protected readonly REDIRECT_ROUTE = '/login';

    constructor(
        private readonly router: Router,
        @Inject(NGX_AUTH_SERVICE)
        private readonly authService: AuthServiceType
    ) { }


    /**
     * The main method used by angular to determine if a user can access a certain route.
     *
     * @param route - The route that the user tries to access.
     * @param state - State data of the route.
     * @returns Whether or not the user can access the provided route.
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const allowedRoles = this.getAllowedRolesForRoute(route, state);
        if (!this.authService.hasRole(allowedRoles)) {
            this.authService.logout();
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }

    /**
     * Gets all allowed roles for the provided route.
     *
     * By default this method tries to get these from the routes data property.
     *
     * @see https://angular.io/api/router/Route#data
     * @param route - The route that the user tries to navigate to.
     * @param state - State data of the route.
     * @returns The allowed roles for the provided route as an array.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getAllowedRolesForRoute(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Role[] {
        return route.data['allowedRoles'] as Role[] ?? [];
    }
}
```

# JwtBelongsToGuard
Contains base functionality to check if a user is associated with the provided route.

Needs to be overriden.

> :warning:
> <br>
> If the accessed route already requests some data from the api which throws an Unauthorized/Forbidden Error
> this can also be handled by the http-error-interceptor.

## Usage
### Implement your BelongsToGuard
Here you only need to override the method that decides if a user belongs to a route or not.
```typescript
import { JwtBelongsToGuard } from 'ngx-material-auth';

@Injectable({ providedIn: 'root' })
export class BelongsToUserGuard extends JwtBelongsToGuard<CustomAuthData, CustomToken, CustomAuthService> {

    constructor(
        private readonly angularRouter: Router,
        private readonly customAuthService: CustomAuthService
    ) {
        super(angularRouter, customAuthService);
    }

    protected getBelongsToForRoute(route: ActivatedRouteSnapshot): boolean {
        // your custom logic here
    }
}
```
### Add it to your route
Just add the guard to any route that you want to protect:
```typescript
canActivate: [BelongsToUserGuard]
```

## Api
```typescript
/**
 * Contains the necessary base information for an angular belongs to guard.
 * Checks if the user is in any way associated with the provided route.
 *
 * This can be useful when eg. The user is allowed to display his own user-profile but not the user-profiles of others.
 */
export abstract class JwtBelongsToGuard<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements CanActivate {

    /**
     * When the user tries to access a route for which he doesn't have the permission he is logged out.
     * This is the route to which he is redirected afterwards.
     */
    protected readonly REDIRECT_ROUTE = '/login';

    constructor(
        private readonly router: Router,
        private readonly authService: AuthServiceType
    ) { }

    /**
     * The main method used by angular to determine if a user can access a certain route.
     *
     * @param route - The route that the user tries to access.
     * @param state - State data of the route.
     * @returns Whether or not the user can access the provided route.
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!this.getBelongsToForRoute(route, state)) {
            this.authService.logout();
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }

    /**
     * Gets all allowed roles for the provided route.
     *
     * @param route - The route that the user tries to navigate to.
     * @param state - State data of the route.
     */
    protected abstract getBelongsToForRoute(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean;
}
```

# NgxMatAuthLoginComponent
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

This component provides a simple login box which is highly customizable.

It uses the login method of your auth service.

## Usage
1. Import NgxMatAuthLoginModule
2. Use in your html:
```html
<!-- All configuration is optional -->
<ngx-mat-auth-login [loginTitle]="'Custom Login'"></ngx-mat-auth-login>
```

## Api
```typescript
/**
 * The interface for the login functionality.
 */
@Component({
    selector: 'ngx-mat-auth-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class NgxMatAuthLoginComponent<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements OnInit {

    /**
     * (optional) A custom function to generate the error-message for invalid inputs.
     */
    @Input()
    getValidationErrorMessage!: (model: NgModel) => string;

    /**
     * A custom title of the login box.
     *
     * @default 'Login'
     */
    @Input()
    loginTitle!: string;

    /**
     * A custom label for the email input.
     *
     * @default 'Email'
     */
    @Input()
    emailInputLabel!: string;

    /**
     * A custom label for the password input.
     *
     * @default 'Password'
     */
    @Input()
    passwordInputLabel!: string;

    /**
     * A custom label for the login button.
     *
     * @default 'Login'
     */
    @Input()
    loginButtonLabel!: string;

    /**
     * Data for the forgot password link.
     *
     * @default {
     * displayName: 'Forgot your password?',
     * route: '/reset-password'
     * }
     */
    @Input()
    forgotPasswordLinkData!: ForgotPasswordLinkData;

    /**
     * The route to which the user gets redirected after he logs in successful.
     *
     * @default '/'
     */
    @Input()
    routeAfterLogin!: string;

    /**
     * The password input by the user.
     */
    password?: string;
    /**
     * The email input by the user.
     */
    email?: string;

    /**
     * Whether or not the password input is hidden.
     */
    hide: boolean = true;

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        private readonly authService: AuthServiceType,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? getValidationErrorMessage;
        this.loginTitle = this.loginTitle ?? 'Login';
        this.emailInputLabel = this.emailInputLabel ?? 'Email';
        this.passwordInputLabel = this.passwordInputLabel ?? 'Password';
        this.loginButtonLabel = this.loginButtonLabel ?? 'Login';
        this.forgotPasswordLinkData = this.forgotPasswordLinkData ?? { displayName: 'Forgot your password?', route: '/reset-password' };
        this.routeAfterLogin = this.routeAfterLogin ?? '/';
    }

    /**
     * The method that gets called when the user tries to login.
     */
    onSubmit(): void {
        if (!this.email || !this.password) {
            return;
        }
        this.authService.login({ email: this.email, password: this.password })
            .then(() => {
                this.email = undefined;
                this.password = undefined;
                void this.router.navigate([this.routeAfterLogin]);
            })
            .catch(err => {
                this.email = undefined;
                this.password = undefined;
                throw err;
            });
    }
}
```

# NgxMatAuthRequestResetPasswordComponent
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

This component provides a simple box for users to request the reset of their password.

It uses the requestResetPassword-method of your auth service.

## Usage
1. Import NgxMatAuthRequestResetPasswordModule
2. Use in your html:
```html
<!-- All configuration is optional -->
<ngx-mat-auth-request-reset-password [requestResetPasswordTitle]="'Custom'">
</ngx-mat-auth-request-reset-password>
```

## Api
```typescript
/**
 * The interface for the request reset password functionality.
 */
@Component({
    selector: 'ngx-mat-auth-request-reset-password',
    templateUrl: './request-reset-password.component.html',
    styleUrls: ['./request-reset-password.component.scss']
})
export class NgxMatAuthRequestResetPasswordComponent<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements OnInit {

    /**
     * (optional) A custom function to generate the error-message for invalid inputs.
     */
    @Input()
    getValidationErrorMessage!: (model: NgModel) => string;

    /**
     * The title of the request reset password box.
     *
     * @default 'Forgot Password'
     */
    @Input()
    requestResetPasswordTitle!: string;

    /**
     * A custom label for the email input.
     *
     * @default 'Email'
     */
    @Input()
    emailInputLabel!: string;

    /**
     * A custom label for the send email button.
     *
     * @default 'Send Email'
     */
    @Input()
    sendEmailButtonLabel!: string;

    /**
     * A custom label for the cancel button.
     *
     * @default 'Cancel'
     */
    @Input()
    cancelButtonLabel!: string;

    /**
     * The route to navigate to after the user successfully requests the reset of his password.
     *
     * @default '/login'
     */
    @Input()
    routeAfterRequest!: string;

    /**
     * The email for the account which password should be reset.
     */
    email?: string;

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        protected readonly router: Router
    ) { }

    ngOnInit(): void {
        this.requestResetPasswordTitle = this.requestResetPasswordTitle ?? 'Forgot Password';
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? getValidationErrorMessage;
        this.emailInputLabel = this.emailInputLabel ?? 'Email';
        this.sendEmailButtonLabel = this.sendEmailButtonLabel ?? 'Send Email';
        this.cancelButtonLabel = this.cancelButtonLabel ?? 'Cancel';
        this.routeAfterRequest = this.routeAfterRequest ?? '/login';
    }

    /**
     * Cancels the password reset.
     */
    cancel(): void {
        void this.router.navigate([this.routeAfterRequest]);
    }

    /**
     * Requests the reset of the password for the user with the given email.
     */
    onSubmit(): void {
        if (!this.email) {
            return;
        }
        this.authService.requestResetPassword(this.email)
            .then(() => {
                this.email = undefined;
                void this.router.navigate([this.routeAfterRequest]);
            })
            .catch(err => {
                this.email = undefined;
                throw err;
            });
    }
}
```

# NgxMatAuthConfirmResetPasswordComponent
This can be used straight out of the box if you have [registered your authService](#override-the-injection-token).

This component provides a simple box for users input their new password after it has been requested.
This also checks if the provided reset token is correct. The reset token needs to be available from `route.params['token']`.

It uses the requestResetPassword-method of your auth service.

## Usage
1. Import NgxMatAuthConfirmResetPasswordModule
2. Use in your html:
```html
<!-- All configuration is optional -->
<ngx-mat-auth-confirm-reset-password [confirmResetPasswordTitle]="'Custom Title'">
</ngx-mat-auth-confirm-reset-password>
```

## Api
```typescript
/**
 * The interface for the confirm reset password functionality.
 *
 * !!!
 * Also checks if the provided reset token is valid.
 * This tries to get the reset token from theActivatedRoute.params['token'].
 * You have to make sure that your reset password link and the routing makes that possible.
 * !!!
 */
@Component({
    selector: 'ngx-mat-auth-confirm-reset-password',
    templateUrl: './confirm-reset-password.component.html',
    styleUrls: ['./confirm-reset-password.component.scss']
})
export class NgxMatAuthConfirmResetPasswordComponent<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements OnInit {

    /**
     * (optional) A custom function to generate the error-message for invalid inputs.
     */
    @Input()
    getValidationErrorMessage!: (model: NgModel) => string;

    /**
     * The title of the confirm reset password box.
     *
     * @default 'New Password'
     */
    @Input()
    confirmResetPasswordTitle!: string;

    /**
     * The label for the password input.
     *
     * @default 'Password'
     */
    @Input()
    passwordInputLabel!: string;

    /**
     * The label for the confirm password input.
     *
     * @default 'Confirm Password'
     */
    @Input()
    confirmPasswordInputLabel!: string;

    /**
     * The label for the change password button.
     *
     * @default 'Change Password'
     */
    @Input()
    changePasswordButtonLabel!: string;

    /**
     * A custom label for the cancel button.
     *
     * @default 'Cancel'
     */
    @Input()
    cancelButtonLabel!: string;

    /**
     * The route to which the user gets redirected when he clicks on the cancel button.
     *
     * @default routeAfterReset
     */
    @Input()
    routeForCancel!: string;

    /**
     * The route to which the user gets redirected after the password has been changed successfully.
     *
     * @default '/login'
     */
    @Input()
    routeAfterReset!: string;

    /**
     * The route to which the user gets redirected if the reset token is not correct.
     *
     * @default '/'
     */
    @Input()
    routeIfResetTokenInvalid!: string;

    /**
     * The error data to display in an dialog when the provided reset token doesn't exist or is invalid.
     *
     * @default
     *{
     * name: 'Error',
     * message: '<p>The provided link is no longer active.</p><p>Please check if the url is correct or request a new link.</p>'
     *}
     */
    @Input()
    invalidResetTokenErrorData!: ErrorData;

    /**
     * The password input by the user.
     */
    password?: string;

    /**
     * The confirm password input by the user.
     */
    confirmPassword?: string;

    /**
     * Whether or not the password input is hidden.
     */
    hide: boolean = true;

    /**
     * Whether or not the confirm password input is hidden.
     */
    hideConfirm: boolean = true;

    private resetToken?: string;

    private readonly defaultInvalidResetTokenErrorData: ErrorData = {
        name: 'Error',
        message: '<p>The provided link is no longer active.</p><p>Please check if the url is correct or request a new link.</p>'
    };

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        protected readonly router: Router,
        protected readonly route: ActivatedRoute,
        protected readonly zone: NgZone,
        protected readonly dialog: MatDialog
    ) { }

    async ngOnInit(): Promise<void> {
        this.initDefaultValues();
        this.resetToken = (await firstValueFrom(this.route.params))['token'] as string | undefined;
        if (
            !this.resetToken
            || !(await this.authService.isResetTokenValid(this.resetToken))
        ) {
            await this.router.navigate([this.routeIfResetTokenInvalid]);
            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, { data: this.invalidResetTokenErrorData, autoFocus: false, restoreFocus: false });
            });
            return;
        }
    }

    private initDefaultValues(): void {
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? getValidationErrorMessage;
        this.confirmResetPasswordTitle = this.confirmResetPasswordTitle ?? 'New Password';
        this.passwordInputLabel = this.passwordInputLabel ?? 'Password';
        this.confirmPasswordInputLabel = this.confirmPasswordInputLabel ?? 'Confirm Password';
        this.changePasswordButtonLabel = this.changePasswordButtonLabel ?? 'Change Password';
        this.cancelButtonLabel = this.cancelButtonLabel ?? 'Cancel';
        this.routeAfterReset = this.routeAfterReset ?? '/login';
        this.routeIfResetTokenInvalid = this.routeIfResetTokenInvalid ?? '/';
        this.routeForCancel = this.routeForCancel ?? this.routeAfterReset;
        this.invalidResetTokenErrorData = this.invalidResetTokenErrorData ?? this.defaultInvalidResetTokenErrorData;
    }

    /**
     * Checks if the user input is invalid.
     *
     * @returns If the user input is invalid.
     */
    inputInvalid(): boolean {
        if (!this.password) {
            return true;
        }
        if (this.password !== this.confirmPassword) {
            return true;
        }
        return false;
    }

    /**
     * Cancels the password reset.
     */
    cancel(): void {
        void this.router.navigate([this.routeForCancel]);
    }

    /**
     * Changes the password.
     */
    onSubmit(): void {
        if (!this.password) {
            return;
        }
        if (this.password !== this.confirmPassword) {
            return;
        }
        this.authService.confirmResetPassword(this.password, this.resetToken as string)
            .then(() => {
                this.resetInputFields();
                void this.router.navigate([this.routeAfterReset]);
            })
            .catch(() => {
                this.resetInputFields();
                void this.router.navigate([this.routeAfterReset]);
            });
    }

    private resetInputFields(): void {
        this.password = '';
        this.confirmPassword = '';
        this.resetToken = '';
    }
}
```

# NgxMatAuthErrorDialogComponent
This can be used straight out of the box.

This component provides a generic dialog to display error messages.
It is used internally by the framework eg. to display error messages from the http-error-interceptor.

## Error Data
You need to provide an errorData-object to the dialog in order for it to work.
This is a really simple model:

```typescript
/**
 * Data about an error.
 * Is used to display it inside a dialog.
 */
export interface ErrorData {
    /**
     * The name of the error.
     */
    name: string,
    /**
     * The message of the error.
     * This is treated as html.
     *
     * CAUTION: Some things are removed by the angular sanitizer.
     */
    message: string
```

## Usage
Wherever you want to display the dialog:
```typescript
import { NgxMatAuthErrorDialogComponent, ErrorData } from 'ngx-material-auth';
...
constructor(
    private readonly dialog: MatDialog
) { }
...
this.dialog.open(NgxMatAuthErrorDialogComponent, { data: errorData });
```

## Api
```typescript
/**
 * A generic Error Dialog that displays ErrorData.
 */
@Component({
    selector: 'ngx-material-auth-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule
    ]
})
export class NgxMatAuthErrorDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<NgxMatAuthErrorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public error: ErrorData,
    ) { }

    /**
     * Closes the dialog.
     */
    close(): void {
        this.dialogRef.close();
    }
}
```