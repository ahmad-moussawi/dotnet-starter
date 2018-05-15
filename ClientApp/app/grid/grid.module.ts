import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { FilterDateComponent } from './filter/filter-date.component';
import { FilterMultipleComponent } from './filter/filter-multiple.component';
import { FilterNumberComponent } from './filter/filter-number.component';
import { FilterStringComponent } from './filter/filter-string.component';
import { FilterComponent } from './filter/filter.component';
import { RemoteGridController } from './grid/RemoteGridController';
import { GridContainer } from './grid/grid-container.component';
import { GridPaging } from './grid/grid-paging.component';
import { GridComponent } from './grid/grid.component';

@NgModule({
  declarations: [
    FilterComponent,
    FilterDateComponent,
    FilterStringComponent,
    FilterNumberComponent,
    FilterMultipleComponent,
    GridComponent,
    GridPaging,
    GridContainer,
  ],
  entryComponents: [
    FilterDateComponent,
    FilterStringComponent,
    FilterNumberComponent,
    FilterMultipleComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatProgressBarModule,
  ],
  exports: [
    GridContainer,
    FilterComponent,
    GridComponent,
    GridPaging,
  ],
  providers: [
    RemoteGridController,
  ],
})
export class GridModule { }
