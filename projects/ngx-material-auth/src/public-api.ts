/*
 * Public API Surface of ngx-material-auth
 */
export * from './components/confirm-reset-password/confirm-reset-password.component';
export * from './components/confirm-reset-password/confirm-reset-password.module';
export * from './components/error-dialog/error-dialog.component';
export * from './components/login/login.component';
export * from './components/login/login.module';
export * from './components/request-reset-password/request-reset-password.component';
export * from './components/request-reset-password/request-reset-password.module';

export * from './components/get-validation-error-message.function';

export * from './guards/jwt-belongs-to.guard';
export * from './guards/jwt-logged-in.guard';
export * from './guards/jwt-not-logged-in.guard';
export * from './guards/jwt-role.guard';

export * from './interceptors/http-error.interceptor';
export * from './interceptors/jwt.interceptor';

export * from './models/base-auth-data.model';
export * from './models/base-token.model';
export * from './models/error-data.model';
export * from './models/login-data.model';
export * from './models/base-role.model';

export * from './services/jwt-auth.service';