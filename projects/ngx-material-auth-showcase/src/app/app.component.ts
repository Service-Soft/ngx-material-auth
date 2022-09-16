/* eslint-disable jsdoc/require-jsdoc */
import { AfterContentChecked, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { footerRows, navbarRows } from './routes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentChecked {
    navbarRows = navbarRows;
    footerRows = footerRows;

    @ViewChild('footer', { read: ElementRef })
    footer?: ElementRef<HTMLElement>;

    footerHeight!: number;

    ngAfterContentChecked(): void {
        if (this.footer) {
            this.footerHeight = this.footer.nativeElement.offsetHeight;
        }
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    @HostListener('window:resize', ['$event'])
    onResize(): void {
        if (this.footer) {
            this.footerHeight = this.footer.nativeElement.offsetHeight;
        }
    }
}