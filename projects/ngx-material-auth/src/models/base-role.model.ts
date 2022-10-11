/**
 * Provides base information about a user role.
 */
export interface BaseRole<RoleValue extends string> {
    /**
     * The name of the role which can be used to display it in the ui.
     * This is NOT used to determine if the user can access certain thing.
     */
    displayName: string,
    /**
     * The actual string value of the role.
     * This is used to determine whether or not the user can access certain things.
     */
    value: RoleValue
}