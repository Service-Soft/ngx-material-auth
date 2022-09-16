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