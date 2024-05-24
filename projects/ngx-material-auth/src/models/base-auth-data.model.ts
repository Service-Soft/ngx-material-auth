import { BaseRole } from './base-role.model';
import { BaseToken } from './base-token.model';

/**
 * Helper type for the base64 string.
 */
// eslint-disable-next-line jsdoc/require-jsdoc
type Opaque<T, K extends string> = T & { __typename: K };

/**
 * Type for a base64 string. This does not apply any type checking and is just programmatic sugar.
 */
export type Base64UrlString = Opaque<string, 'base64'>;

/**
 * Biometric credentials of an user.
 */
export interface BiometricCredentials {
    /**
     * The id of the credentials.
     */
    id: string,
    /**
     * The public key as a base64 string.
     */
    publicKey: Base64UrlString,
    /**
     * The webauthn credential id as a base64 string.
     */
    credentialId: Base64UrlString,
    /**
     * The webauthn challenge as a base64 string.
     */
    challenge: Base64UrlString,
    /**
     * How many times the credentials have been used for this website.
     * Is used internally to prohibit replay attacks.
     */
    counter: number,
    /**
     * The user that this credentials belong to.
     */
    baseUserId: string
}

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
    userId: string,
    /**
     * Whether or not two factor authentication is enabled.
     */
    twoFactorEnabled?: boolean,
    /**
     * All added biometric credentials from different devices.
     */
    biometricCredentials?: BiometricCredentials[]
}