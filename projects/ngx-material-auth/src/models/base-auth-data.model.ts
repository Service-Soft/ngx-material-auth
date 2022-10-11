import { BaseToken } from './base-token.model';
import { BaseRole } from './base-role.model';

/**
 * The minimum values for authData.
 */
export interface BaseAuthData<Token extends BaseToken, RoleValue extends string, Role extends BaseRole<RoleValue>> {
    /**
     * The access token used for authenticating requests.
     * Consists of the string value and the expiration date.
     */
    accessToken: Token,
    /**
     * The refresh token used for refreshing access tokens.
     * Consists of the string value and the expiration date.
     */
    refreshToken: Token,
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