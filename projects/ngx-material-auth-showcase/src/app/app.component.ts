import { AfterContentChecked, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { FooterRow, NavbarRow, NgxMatNavigationFooterComponent, NgxMatNavigationNavbarComponent } from 'ngx-material-navigation';

import { footerRows, navbarRows } from './routes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        MatSnackBarModule,
        NgxMatNavigationFooterComponent,
        NgxMatNavigationNavbarComponent,
        RouterModule
    ]
})
export class AppComponent implements AfterContentChecked {
    navbarRows: NavbarRow[] = navbarRows;
    footerRows: FooterRow[] = footerRows;

    @ViewChild('footer', { read: ElementRef })
    footer?: ElementRef<HTMLElement>;

    footerHeight!: number;

    ngAfterContentChecked(): void {
        this.onResize();
    }

    @HostListener('window:resize', ['$event'])
    onResize(): void {
        if (this.footer) {
            this.footerHeight = this.footer.nativeElement.offsetHeight;
        }
    }
}