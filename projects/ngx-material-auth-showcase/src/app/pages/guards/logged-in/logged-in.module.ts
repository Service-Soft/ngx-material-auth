import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggedInComponent } from './logged-in.component';
import { LoggedInRoutingModule } from './logged-in-routing.module';

@NgModule({
    imports: [
        CommonModule,
        LoggedInRoutingModule
    ],
    declarations: [LoggedInComponent]
})
export class LoggedInModule { }