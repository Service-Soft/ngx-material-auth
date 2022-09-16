import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterceptorsComponent } from './interceptors.component';
import { InterceptorsRoutingModule } from './interceptors-routing.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        InterceptorsRoutingModule,
        MatButtonModule
    ],
    declarations: [InterceptorsComponent]
})
export class InterceptorsModule { }