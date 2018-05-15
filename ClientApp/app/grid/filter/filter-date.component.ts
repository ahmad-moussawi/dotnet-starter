import { Component, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';




@Component({
  selector: 'filter-date',
  template: `
    <form #f="ngForm">

      <select name="operator" [(ngModel)]="model.operator" class="operator">
        <option *ngFor="let op of operators" [value]="op[0]">{{ op[1] }}</option>
      </select>

      <ng-container [ngSwitch]="model.operator">

        <span *ngSwitchCase="'last'" class="single visible">

          <select name="value" required [(ngModel)]="model.value">
            <option value="15d">15d</option>
            <option value="30d">30d</option>
            <option value="60d">60d</option>
            <option value="3m">3m</option>
            <option value="9m">9m</option>
            <option value="12m">12m</option>
          </select>

        </span>

        <span *ngSwitchCase="'next'" class="single visible">

          <select name="value" required [(ngModel)]="model.value">
            <option value="15d">15d</option>
            <option value="30d">30d</option>
            <option value="60d">60d</option>
            <option value="3m">3m</option>
            <option value="9m">9m</option>
            <option value="12m">12m</option>
          </select>

        </span>

        <span *ngSwitchCase="'bt'" class="single visible">
          <input type="date" [(ngModel)]="model.value" required name="value">
          <input type="date" [(ngModel)]="model.value2" required name="value2">
        </span>

        <span *ngSwitchDefault class="single visible">
          <input type="date" [(ngModel)]="model.value" required name="value">
        </span>

      </ng-container>
    </form>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FilterDateComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: FilterDateComponent,
      multi: true
    }
  ]
})
export class FilterDateComponent implements ControlValueAccessor, Validator {

  disabled = false

  defaultModel = {
    operator: 'last'
  }

  model: any = {}

  @ViewChild('f') form: FormGroup

  // Check if is a valid date
  isDate = (value) => Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())

  // Check if is a duration of the form 30d, or 2m ...
  isDuration = (value) => /^\d{1,2}(m|d)$/.test(value)

  // tslint:disable-next-line:member-ordering
  operators = [
    ['last', 'is in the last', this.isDuration],
    ['next', 'is in the next', this.isDuration],
    ['bt', 'is between', (value1, value2) => this.isDate(value1) && this.isDate(value2)],
    ['eq', 'is equal to', this.isDate],
    ['gt', 'is after', this.isDate],
    ['lt', 'is before', this.isDate],
  ]

  onChange = (_: any) => { }

  onTouched = (_: any) => { }

  ngOnInit() {

    this.form.valueChanges
      .subscribe(values => {

        this.onChange(Object.assign({}, this.model, { datatype: 'date' }))

      })

  }

  ngOnDestroy() {

  }

  writeValue(obj: any): void {
    this.model = Object.assign({}, this.defaultModel, obj)
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

    const row = this.operators.find(x => x[0] === this.model.operator)

    const validator = row[2] as any

    if (this.model.operator === 'bt') {

      const from = new Date(this.model.value)
      const to = new Date(this.model.value2)

      if (!validator(from, to)) {
        return {
          message: 'Invalid values provided',
          operator: this.model.operator,
          value: this.model.value,
          value2: this.model.value2,
        }
      }

      if (from >= to) {
        return {
          message: 'The `to` value must be greater than the `from` value',
          operator: this.model.operator,
          value: this.model.value
        }
      }

      return null
    }

    if (this.model.operator === 'last' || this.model.operator === 'next') {

      return validator(this.model.value) ? null : {
        valid: false,
        operator: this.model.operator,
        value: this.model.value
      }

    }

    return validator(new Date(this.model.value)) ? null : {
      valid: false,
      operator: this.model.operator,
      value: this.model.value
    }

  }

}
