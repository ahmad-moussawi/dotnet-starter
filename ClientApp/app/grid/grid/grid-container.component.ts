import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/merge';
import { FilterComponent } from '../filter/filter.component';
import { LocalGridController } from './LocalGridController';
import { GridPaging } from './grid-paging.component';
import { GridComponent } from './grid.component';
import { IMenuContext } from './menuContext';

@Component({
  selector: 'grid-container',
  template: `
    <div class="grid-container">

        <div class="clearfix grid-actions">

          <div class="fr">
            <ng-content></ng-content>
          </div>

          <div class="filter-trigger fl">

            <button class="btn" [class.highlight]="filterCount()" (click)="filterOpen = !filterOpen">
              <i class="fa fa-filter"></i> Filter
              <span class="filter-count">
                {{ filterCount() }}
              </span>
            </button>

            <filter [ngClass]="{opened: filterOpen, closed: !filterOpen}"
            [columns]="columns" [(ngModel)]="model" (onClose)="filterOpen = false"></filter>
          </div>

        </div>

        <div class="grid-progress" *ngIf="progress.enabled">
          <mat-progress-bar
              [color]="progress.color"
              [mode]="progress.mode"
              [value]="progress.value"
              [bufferValue]="progress.bufferValue">
          </mat-progress-bar>
        </div>

        <grid [menuContext]="menuContext" [columns]="columns" (rowClicked)="rowClicked.emit($event)"></grid>

        <div class="flex-spacer"></div>

        <div class="grid-footer">

          <div class="pages-count" [hidden]="!data">
            <span class="page-start">{{ data?.start }}</span> -
            <span class="page-end">{{ data?.end }}</span> of
            <span class="page-count">{{ data?.count }}</span>
          </div>

          <grid-paging></grid-paging>

        </div>

    </div>

  `
})
export class GridContainer {

  @ViewChild(FilterComponent, { read: NgModel }) filterModel: NgModel
  @ViewChild(GridPaging) paging: GridPaging
  @ViewChild(GridComponent) grid: GridComponent

  defaultRenderers = {
    string: v => v,
    integer: v => v,
    number: v => String(v).replace(/(.)(?=(\d{3})+$)/g, '$1,'),
    date: v => v ? moment(v).format('YYYY-MM-DD') : v,
    boolean: v => v ? 'Yes' : 'No'
  }

  progress = {
    value: 10,
    bufferValue: 40,
    mode: 'indeterminate',
    color: 'primary',
    enabled: false,
  }

  ctrl: LocalGridController

  @Input() set controller(ctrl) {
    this.ctrl = ctrl
  }

  @Input() columns

  @Input() menuContext: IMenuContext = {}

  @Output() rowClicked = new EventEmitter()

  @Output() onChange = new EventEmitter()

  data: any

  model = []

  filterOpen = false

  constructor() { }

  ngAfterViewInit() {

    this.grid.setRenderers(this.defaultRenderers)

    const filter$ = this.filterModel.valueChanges.map(x => ({ event: 'filter', value: x }))
    const sort$ = this.grid.sort.map(x => ({ event: 'sorting', value: x }))
    const paging$ = this.paging.pageChanged.startWith(1).map(x => ({ event: 'paging', value: x }))
    const render$ = this.ctrl.renderEmitter.debounceTime(100).map(x => ({ event: 'render' }))

    // filter$.subscribe(x => console.log('filter', x))
    // sort$.subscribe(x => console.log('sort', x))
    // paging$.subscribe(x => console.log('paging', x))
    // render$.subscribe(x => console.log('render', x))

    Observable.merge(filter$, sort$, paging$, render$)
      .scan((acc: any, current) => {

        // Nothing todo in case just the developer want to re-render the grid
        if (current.event === 'render') {
          return acc
        }

        acc[current.event] = current.value

        // reset paging if filter has changed
        if (current.event === 'filter') {
          acc.paging = 1
        }

        return acc
      }, {})

      .debounceTime(200)
      // .distinctUntilChanged()
      .switchMap(events => {

        this.progress.enabled = true

        // console.time('load start')

        return this.ctrl
          .resetData()
          .filter(events.filter)
          .sortBy(events.sorting)
          .paginate(events.paging, 10)
          .load()
          .catch(err => {
            console.log(err)
            return Observable.empty()
          })

      })
      .subscribe(data => {

        // console.timeEnd('load start')

        setTimeout(() => {
          this.progress.enabled = false
        }, 550)

        this.data = data

        this.grid.data = data
        this.paging.data = data
        // setTimeout(() => {
        //   // this.grid.loading = true
        // }, 10)

      })
  }

  filterCount() {
    return Object.keys(this.model).length
  }

}
