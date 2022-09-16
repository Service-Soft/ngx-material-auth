import { BaseToken } from './base-token.model';
import { Role } from './role.model';

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