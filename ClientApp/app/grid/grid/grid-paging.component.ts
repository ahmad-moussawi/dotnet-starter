import { Component, EventEmitter, Input, Output } from '@angular/core';
import { pagination } from './pagination';

@Component({
  selector: 'grid-paging',
  template: `

  <div *ngIf="pages.length > 1" class="btn-group" role="group" aria-label="...">

  <button type="button"
    [disabled]="current === 1" class="btn"
    (click)="pageChanged.emit(current - 1)"><i class="fa fa-chevron-left"></i></button>

  <button type="button"
    [disabled]="row.page === '...'" class="btn" [ngClass]="{'active':row.active}"
    (click)="pageChanged.emit(row.page)" *ngFor="let row of pages">{{ row.page }}</button>

  <button type="button" [disabled]="current === last" class="btn" (click)="pageChanged.emit(current + 1)">
  <i class="fa fa-chevron-right"></i>
  </button>


  </div>

  `
})
export class GridPaging {

  current = 1
  last = null

  pages: any[] = []

  _data

  @Input() set data(val) {

    if (!val) { return }

    this._data = val

    this.current = val.currentPage
    this.last = val.totalPages

    this.pages = pagination(val.currentPage, val.totalPages)
      .map(p => ({ page: p, active: p === val.currentPage }))
  }

  get data() {
    return this._data
  }

  @Output() pageChanged = new EventEmitter()

}
