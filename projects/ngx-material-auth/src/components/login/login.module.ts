import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMatAuthLoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        RouterModule,
        MatInputModule,
        MatButtonModule
    ],
    declarations: [NgxMatAuthLoginComponent],
    exports: [NgxMatAuthLoginComponent]
})
export class NgxMatAuthLoginModule { }