import { Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgForm, NgModel, Validator } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { normalizeColumns } from '../normalize-columns';

@Component({
  selector: 'filter',
  template: `
<form #f="ngForm" class="filter-view">
    <div class="header">
        <div class="buttons">
            <a (click)="clear()" class="left grey clear"><span>Clear</span></a>
            <a (click)="done()" class="right blue filter"><span>Done</span></a>
        </div>
        <h2>Filters</h2>
    </div>
    <div class="filters" *ngIf="hasValue">

      <div class="filter-row" name="captured" *ngFor="let col of columns">

          <label>
            <input class="enabled" type="checkbox"
            [(ngModel)]="model[col.name].enabled" [ngModelOptions]="{standalone: true}">
            <span>{{ col.label }}</span>
          </label>

          <div [class]="'filter-' + col.datatype + ' row-content animated fadeIn'" *ngIf="model[col.name].enabled">

              <ng-container [ngSwitch]="col.datatype">

                  <filter-date *ngSwitchCase="'date'"
                  #name="ngModel" [name]="col.name" [(ngModel)]="model[col.name]">
                  </filter-date>

                  <filter-string *ngSwitchCase="'string'"
                  #name="ngModel" [name]="col.name" [(ngModel)]="model[col.name]">
                  </filter-string>

                  <filter-number *ngSwitchCase="'number'"
                  #name="ngModel" [name]="col.name" [(ngModel)]="model[col.name]">
                  </filter-number>

                  <filter-multiple *ngSwitchCase="'multiple'"
                  #name="ngModel" [name]="col.name" [(ngModel)]="model[col.name]"
                  [options]="col.options">
                  </filter-multiple>

              </ng-container>


          </div>

      </div>

    </div>
</form>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FilterComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: FilterComponent,
      multi: true,
    }
  ],
})
export class FilterComponent implements ControlValueAccessor, Validator {

  model: any

  enabled: any = {}

  hasValue = false

  disabled = false

  _columns = []

  @Output() onClose = new EventEmitter()

  @ViewChild('f') form: NgForm

  @Input() set columns(val) {
    if (!val) {
      return
    }

    this._columns = normalizeColumns(val.filter(x => x.filter === undefined || x.filter === true), {}).map(x => {

      // map boolean to multiple
      if (x.datatype === 'boolean') {
        return Object.assign({}, x, {
          datatype: 'multiple',
          options: [{
            label: 'Yes',
            value: true,
          },
          {
            label: 'No',
            value: false,
          }]
        })
      }

      if (x.datatype === 'integer') {
        return Object.assign({}, x, { datatype: 'number' })
      }

      return x

    })
  }

  get columns() {
    return this._columns
  }

  @ViewChildren('name') inputs: QueryList<NgModel>

  constructor() { }

  onChange = (_: any) => { }

  onTouched = (_: any) => { }

  ngAfterViewInit() {

    this.form.valueChanges.map(() => _(this.form.controls)
      .pickBy(x => x.valid)
      .map((control, column) => ({
        column,
        ...control.value
      })).value()
    )
      .debounceTime(500)
      .distinctUntilChanged((x, y) => _.isEqual(x, y))
      .subscribe(values => {

        this.onChange(values)

      })

  }

  normalizeModel(model, columns) {

    if (!model) { return {} }

    const result = _.cloneDeep(model)

    columns.forEach(col => {
      result[col.name] = _.defaultsDeep({}, result[col.name], { enabled: false })
    })

    return result
  }

  writeValue(obj: any): void {

    this.model = this.normalizeModel(obj, this.columns)

    this.hasValue = Object.keys(this.model).length > 0

  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  validate(c: AbstractControl): { [key: string]: any; } {

    if (!this.inputs) {
      return
    }

    const invalid = this.inputs.filter(x => !x.valid)

    if (invalid.length === 0) {
      return null
    }

    const errors = {}

    invalid.forEach(ngModel => {
      errors[ngModel.name] = ngModel.errors
    })

    return errors

  }

  clear() {
    this.model = this.normalizeModel({}, this.columns)
    this.done()
  }

  done() {
    this.onClose.emit(this.model)
  }

}
