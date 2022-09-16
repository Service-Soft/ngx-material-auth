import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BelongsToComponent } from './belongs-to.component';
import { BelongsToRoutingModule } from './belongs-to-routing.module';

@NgModule({
    imports: [
        CommonModule,
        BelongsToRoutingModule
    ],
    declarations: [BelongsToComponent]
})
export class BelongsToModule { }