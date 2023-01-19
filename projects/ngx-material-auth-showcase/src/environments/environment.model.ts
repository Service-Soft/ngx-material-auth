/**
 * Defines how environment values are structured.
 */
export interface Environment {
    /**
     * Whether or not the current environment is in production.
     */
    production: boolean,
    /**
     * The url of the api.
     */
    apiUrl: string
}