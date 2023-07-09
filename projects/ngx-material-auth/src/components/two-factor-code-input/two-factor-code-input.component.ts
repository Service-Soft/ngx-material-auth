import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

const allowedValues: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * A component that displays an input for a 6 digit numeric two factor code.
 * You can receive the code by listening to the "codeChangeEvent".
 */
@Component({
    selector: 'ngx-mat-auth-two-factor-code-input',
    templateUrl: './two-factor-code-input.component.html',
    styleUrls: ['./two-factor-code-input.component.scss'],
    standalone: true,
    imports: [
        MatInputModule,
        FormsModule
    ]
})
export class NgxMatAuthTwoFactorCodeInputComponent {
    // eslint-disable-next-line jsdoc/require-jsdoc
    one!: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    two!: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    three!: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    four!: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    five!: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    six!: string;

    /**
     * Returns the code whenever the user inputs or removes something.
     */
    @Output()
    codeChangeEvent: EventEmitter<string> = new EventEmitter<string>();

    private readonly keyCodesToIgnore: string[] = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight'
    ];

    constructor() { }

    /**
     * When the user uses the backspace, the previous input is selected (if it exists).
     * When he types anything else, the next input is selected (if it exists).
     *
     * @param event - The keyboard event contains eg. The key that was pressed.
     * @param step - At which step the input happened.
     */
    keyup(event: KeyboardEvent, step: number): void {
        if (this.keyCodesToIgnore.includes(event.key)) {
            return;
        }
        const prevElement: HTMLElement | null = document.getElementById(`code${step - 1}`);
        const nextElement: HTMLElement | null = document.getElementById(`code${step + 1}`);
        const value: string = `${this.one ?? ''}${this.two ?? ''}${this.three ?? ''}${this.four ?? ''}${this.five ?? ''}${this.six ?? ''}`;
        this.codeChangeEvent.emit(value);
        if (event.code === 'Backspace' && prevElement) {
            prevElement.focus();
            return;
        }
        if (nextElement) {
            nextElement.focus();
        }
    }

    /**
     * Sets all code inputs to the first six digits provided by the pasted content.
     *
     * @param event - The clipboard event with all relevant information.
     */
    paste(event: ClipboardEvent): void {
        const clipboardData: DataTransfer = event.clipboardData as DataTransfer;
        const pastedText: string = clipboardData.getData('text');
        for (const char of pastedText) {
            if (!allowedValues.includes(char)) {
                return;
            }
        }
        this.one = pastedText.charAt(0);
        this.two = pastedText.charAt(1);
        this.three = pastedText.charAt(2);
        this.four = pastedText.charAt(3);
        this.five = pastedText.charAt(4);
        this.six = pastedText.charAt(5);
        const value: string = `${this.one ?? ''}${this.two ?? ''}${this.three ?? ''}${this.four ?? ''}${this.five ?? ''}${this.six ?? ''}`;
        this.codeChangeEvent.emit(value);
    }

    private isDigitValid(value: string): boolean {
        return allowedValues.includes(value);
    }

    /**
     * Automatically moves the cursor to the correct input.
     * If eg. The first value hasn't been provided yet the user can't click on the input for the last value.
     *
     * @param step - The step that the user tries to focus.
     */
    focused(step: number): void {
        switch (step) {
            case 1:
                if (this.two || this.three || this.four || this.five || this.six) {
                    document.getElementById('code2')?.focus();
                }
                return;
            case 2:
                if (this.three || this.four || this.five || this.six) {
                    document.getElementById('code3')?.focus();
                }
                if (!this.one) {
                    document.getElementById('code1')?.focus();
                }
                return;
            case 3:
                if (this.four || this.five || this.six) {
                    document.getElementById('code4')?.focus();
                }
                if (!this.one || !this.two) {
                    document.getElementById('code2')?.focus();
                }
                return;
            case 4:
                if (this.five || this.six) {
                    document.getElementById('code5')?.focus();
                }
                if (!this.one || !this.two || !this.three) {
                    document.getElementById('code3')?.focus();
                }
                return;
            case 5:
                if (this.six) {
                    document.getElementById('code6')?.focus();
                }
                if (!this.one || !this.two || !this.three || !this.four) {
                    document.getElementById('code4')?.focus();
                }
                return;
            case 6:
                if (!this.one || !this.two || !this.three || !this.four || !this.five) {
                    document.getElementById('code5')?.focus();
                }
                return;
            default:
                break;
        }
    }
}