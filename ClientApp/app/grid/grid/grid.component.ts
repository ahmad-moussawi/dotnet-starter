import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { normalizeColumns } from '../normalize-columns';
import { IMenuContext } from './menuContext';

@Component({
  selector: 'grid',
  template: `
    <div class="grid-list-rows">

      <div class="grid-list-nodata grid-list-overlay" [hidden]="rows?.length">
        <div class="message">No data available</div>
      </div>

       <div class="grid-list-row grid-list-row--header">

        <span *ngFor="let col of columns"
          class="grid-list-cell type-{{col.datatype}}"
          [ngStyle]="col.styles"
          [class.sort-asc]="col.name === sorting[0] && !sorting[1]"
          [class.sort-desc]="col.name === sorting[0] && sorting[1]"
          [ngClass]="col.cssClass"
          (click)="sortBy(col)">
            {{ col.label }} <i class="fa fa-sort-up"></i>
        </span>



        <span class="grid-list-cell"></span>
      </div>
      <a class="grid-list-row" *ngFor="let row of rows" (click)="rowClicked.emit(row)">

        <span
          class="grid-list-cell grid-list-cell-body type-{{col.datatype}}"
          [ngClass]="col.cssClass"
          [ngStyle]="col.styles"
          [title]="col.tooltip(row[col.name], row)"
          [innerHtml]="col.render(row[col.name], row)"
          *ngFor="let col of columns"
          >
          <!-- {{ row[col.name] }} -->
          <!-- {{ col.render(row[col.name], row) }} -->
        </span>


        <span class="grid-list-cell grid-list-cell-body cell-shrink">
          <div class="grid-list-actions">

            <div class="btn-group" *ngIf="menuContext?.primary || menuContext?.dropdown" role="group" aria-label="...">

              <button
                *ngIf="menuContext.primary" type="button"
                class="btn btn-default grid-list-btn-secondary"
                (click)="menuContext.primary.handler($event, row)"
                [title]="menuContext.primary.label">
                <i [class]="menuContext.primary.icon"></i>
              </button>

              <button
                type="button"
                *ngIf="menuContext.dropdown?.length"
                class="btn btn-default dropdown-toggle"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fa fa-ellipsis-h"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-right">

                <li *ngFor="let r of menuContext.dropdown" [class.divider]="r.separator" [hidden]="r.disabled(row)">
                  <a *ngIf="!r.separator" (click)="r.handler($event, row)">
                    {{ r.label }}
                  </a>
                </li>

              </ul>
            </div>

          </div>
        </span>

      </a>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {

  currentPage: any
  totalPages: any

  rows: any[] = []

  @Output() rowClicked = new EventEmitter()

  _menuContext: IMenuContext = {}

  @Input() set menuContext(val: IMenuContext) {

    // prevent event propagation

    function stopPropagation(handler) {

      return (ev: Event, row: any) => {
        ev.stopPropagation()
        handler(row, ev)
      }

    }

    if (val.primary && val.primary.handler) {

      val.primary.handler = stopPropagation(val.primary.handler)

    }

    if (val.dropdown && val.dropdown.length) {

      val.dropdown = val.dropdown.map(x => {

        x.handler = stopPropagation(x.handler)
        x.disabled = x.disabled || ((_: any) => false)

        return x

      })

    }

    this._menuContext = val
  }

  get menuContext(): IMenuContext {
    return this._menuContext
  }

  /**
   * Grid columns
   */
  _columns: any[]

  @Input() set columns(val) {

    if (val) {
      this._columns = normalizeColumns(val, this.renderers)
    }

  }

  get columns() {
    return this._columns
  }

  /**
   * Columns renderers
   */
  renderers: { [key: string]: (v) => {} } = {

  }

  sorting = []

  /**
   * Data stream
   */

  @Input() set data(val) {

    if (!val) { return }

    this.rows = val.data

    this.totalPages = val.totalPages

    this.currentPage = val.currentPage

    this.cdr.markForCheck()
  }

  @Output() sort = new EventEmitter()

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {

  }

  ngOnViewInit() {
    this.cdr.detach()
  }

  setRenderers(renderers) {

    this.renderers = renderers

    if (this.columns) {
      this.columns = normalizeColumns(this.columns, renderers)
    }

  }

  sortBy(col) {

    // tslint:disable-next-line:prefer-const
    let [old, desc] = this.sorting

    desc = old === col.name ? !desc : false

    this.sorting = [col.name, desc]

    this.sort.emit(this.sorting)

  }

  ngAfterViewChecked() {
    try {
      setTimeout(() => {
        $(this.el.nativeElement).find('.dropdown-toggle').dropdown()
      }, 200)
    } catch (err) {
      console.error(err)
    }
  }

}
