import { Component, ElementRef, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

const allowedValues: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * The value a step index might have. Ranges from 0 - 5.
 */
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * The value that can be set to a step input.
 */
type StepValue = '' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

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
    readonly steps: [StepValue, StepValue, StepValue, StepValue, StepValue, StepValue] = ['', '', '', '', '', ''];

    /**
     * The two factor input html elements.
     */
    @ViewChildren('code1,code2,code3,code4,code5,code6')
    stepElements!: QueryList<ElementRef>;

    /**
     * Returns the code whenever the user inputs or removes something.
     */
    @Output()
    readonly codeChangeEvent: EventEmitter<string> = new EventEmitter<string>();

    private readonly keyCodesToIgnore: string[] = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight'
    ];

    /**
     * When the user uses the backspace, the previous input is selected (if it exists).
     * When he types anything else, the next input is selected (if it exists).
     * @param event - The keyboard event contains eg. The key that was pressed.
     * @param stepIndex - At which step the input happened.
     */
    keyup(event: KeyboardEvent, stepIndex: StepIndex): void {
        if (this.keyCodesToIgnore.includes(event.key)) {
            return;
        }
        const prevElement: ElementRef<HTMLElement> | undefined = this.stepElements.toArray()[stepIndex - 1] as ElementRef | undefined;
        const nextElement: ElementRef<HTMLElement> | undefined = this.stepElements.toArray()[stepIndex + 1] as ElementRef | undefined;
        if (event.code === 'Backspace' && prevElement) {
            this.steps[stepIndex - 1] = '';
            prevElement.nativeElement.focus();
            const value: string = this.steps.join('');
            this.codeChangeEvent.emit(value);
            return;
        }
        if (nextElement) {
            if (allowedValues.includes(event.key)) {
                this.steps[stepIndex] = event.key as StepValue;
            }
            const value: string = this.steps.join('');
            this.codeChangeEvent.emit(value);
            nextElement.nativeElement.focus();
        }
    }

    /**
     * Sets all code inputs to the first six digits provided by the pasted content.
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
        for (let i: number = 0; i < this.steps.length; i++) {
            this.steps[i] = pastedText.charAt(i) as StepValue;
        }
        const value: string = this.steps.join('');
        this.codeChangeEvent.emit(value);
    }

    /**
     * Automatically moves the cursor to the correct input.
     * If eg. The first value hasn't been provided yet the user can't click on the input for the last value.
     * @param stepIndex - The step index that the user tries to focus.
     */
    focused(stepIndex: StepIndex): void {
        const firstEmptyInputIndex: number = this.steps.findIndex(s => !s);
        if (stepIndex === firstEmptyInputIndex) {
            return;
        }
        if (firstEmptyInputIndex === -1) {
            (this.stepElements.toArray()[5] as ElementRef<HTMLElement>).nativeElement.focus();
        }
        (this.stepElements.toArray()[firstEmptyInputIndex] as ElementRef<HTMLElement>).nativeElement.focus();

        // let firstEmptyInputIndex: number | undefined = undefined;
        // for (let i: number = 0; i < this.steps.length; i++) {
        //     // The first time an empty input is reached
        //     if (!this.steps[i] && firstEmptyInputIndex == undefined) {
        //         if (stepIndex === i) {
        //             // the cursor is at the correct input already, nothing needs to be done
        //             return;
        //         }
        //         firstEmptyInputIndex = i;
        //     }
        //     // If an input with a value is reached after an empty input.
        //     if (this.steps[i] && firstEmptyInputIndex != undefined) {
        //         this.steps[i] = '';
        //     }
        // }
        // firstEmptyInputIndex = firstEmptyInputIndex ?? 5;
        // (this.stepElements.toArray()[firstEmptyInputIndex] as ElementRef<HTMLElement>).nativeElement.focus();
    }
}