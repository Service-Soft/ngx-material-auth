import { browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON, AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

import { BiometricCredentials } from '../models/base-auth-data.model';

/**
 * A variant of PublicKeyCredentialCreationOptions suitable for JSON transmission to the browser to
 * (eventually) get passed into navigator.credentials.create(...) in the browser.
 *
 * This should eventually get replaced with official TypeScript DOM types when WebAuthn L3 types
 * eventually make it into the language:
 *
 * https://w3c.github.io/webauthn/#dictdef-publickeycredentialcreationoptionsjson.
 */
export type PublicKeyCredentialCreationOptions = PublicKeyCredentialCreationOptionsJSON;

/**
 * A slightly-modified RegistrationCredential to simplify working with ArrayBuffers that
 * are Base64URL-encoded in the browser so that they can be sent as JSON to the server.
 *
 * Https://w3c.github.io/webauthn/#dictdef-registrationresponsejson.
 */
export type BiometricRegistrationResponse = RegistrationResponseJSON;

/**
 * A slightly-modified RegistrationCredential to simplify working with ArrayBuffers that
 * are Base64URL-encoded in the browser so that they can be sent as JSON to the server.
 *
 * Https://w3c.github.io/webauthn/#dictdef-registrationresponsejson.
 */
export type AuthenticationResponse = AuthenticationResponseJSON;

/**
 * A variant of PublicKeyCredentialRequestOptions suitable for JSON transmission to the browser to
 * (eventually) get passed into navigator.credentials.get(...) in the browser.
 */
export type PublicKeyCredentialRequestOptions = PublicKeyCredentialRequestOptionsJSON;

/**
 * The response when confirming the registration of a new biometric credential.
 */
export interface ConfirmBiometricRegistrationResponse {
    /**
     * All biometric credentials of the user, including the new one if everything was successful.
     */
    biometricCredentials: BiometricCredentials[],
    /**
     * Whether or not everything was successful.
     */
    verified: boolean
}

/**
 * Encapsulates functionality of the '@simplewebauthn' package.
 */
export abstract class WebauthnUtilities {
    /**
     * Starts the registration of a new biometric credential.
     * @param options - Options for generating the credential, including a challenge and domain of the RP (relaying party).
     * @returns The confirmed registration that needs to be sent to the backend.
     */
    static async startRegistration(options: PublicKeyCredentialCreationOptions): Promise<BiometricRegistrationResponse> {
        return startRegistration({ optionsJSON: options });
    }

    /**
     * Starts the login process with the provided credential options.
     * @param options - The options, which could include a list of possible biometric logins.
     * @param useBrowserAutofill - Whether or not to use browser autofill.
     * @returns The resolved or rejected biometric login.
     */
    static async startAuthentication(
        options: PublicKeyCredentialRequestOptions,
        useBrowserAutofill?: boolean
    ): Promise<AuthenticationResponse> {
        return startAuthentication({
            optionsJSON: options,
            useBrowserAutofill
        });
    }

    /**
     * Whether or not the browser actually supports webauthn.
     * @returns True if the browser supports it, false otherwise.
     */
    static browserSupportsWebAuthn(): boolean {
        return browserSupportsWebAuthn();
    }
}