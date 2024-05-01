import { InjectionToken } from '@angular/core';

import { JwtBelongsToGuardConfig } from './jwt-belongs-to.guard';
import { JwtLoggedInGuardConfig } from './jwt-logged-in.guard';
import { JwtNotLoggedInGuardConfig } from './jwt-not-logged-in.guard';
import { JwtRoleGuardConfig } from './jwt-role.guard';

/**
 * Configuration for the ngx guards.
 * E.g. The route that the user gets redirected to when he logs out.
 */
export interface NgxGuardConfig {
    /**
     * Configuration for the JwtLoggedInGuard.
     */
    loggedInGuard: Partial<JwtLoggedInGuardConfig>,
    /**
     * Configuration for the JwtLoggedInGuard.
     */
    notLoggedInGuard: Partial<JwtNotLoggedInGuardConfig>,
    /**
     * Configuration for the JwtGuardConfig.
     */
    roleGuard: Partial<JwtRoleGuardConfig<string>>,
    /**
     * Configuration for the JwtBelongsToConfig.
     */
    belongsToGuard: Partial<JwtBelongsToGuardConfig> & Pick<JwtBelongsToGuardConfig, 'getBelongsToForRoute'>
}

/**
 * Injection Token for the auth service.
 */
export const NGX_GUARD_CONFIG: InjectionToken<Partial<NgxGuardConfig>> = new InjectionToken<Partial<NgxGuardConfig>>(
    'Provider for guard configuration.',
    {
        providedIn: 'root',
        factory: () => {
            return {};
        }
    }
);