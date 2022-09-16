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
}