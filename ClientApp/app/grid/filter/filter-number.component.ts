import { Component, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';

@Component({
  selector: 'filter-number',
  template: `
    <form #f="ngForm">
      <select name="operator" [(ngModel)]="model.operator" class="operator">
        <option *ngFor="let op of operators" [value]="op[0]">{{ op[1] }}</option>
      </select>

      <ng-container [ngSwitch]="model.operator">

        <span *ngSwitchCase="'bt'" class="single visible">
          <input type="number" step="0.01" placeholder="min" [(ngModel)]="model.value" required name="value">
          <input type="number" step="0.01" placeholder="max" [(ngModel)]="model.value2" required name="value2">
        </span>

        <span *ngSwitchDefault class="single visible">
          <input type="number" step="0.01" [(ngModel)]="model.value" required name="value">
        </span>

      </ng-container>

    </form>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FilterNumberComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: FilterNumberComponent,
      multi: true,
    }
  ]
})
export class FilterNumberComponent implements ControlValueAccessor, Validator {

  disabled = false

  defaultModel = {
    operator: 'eq'
  }

  model: any = {}

  operators = [
    ['eq', 'is equal to'],
    ['gt', 'is greater than'],
    ['lt', 'is lower than'],
    ['neq', 'is not equal to'],
    ['bt', 'is between'],
  ]

  @ViewChild('f') form: FormGroup

  onChange = (_: any) => { }

  onTouched = (_: any) => { }

  ngOnInit() {

    this.form.valueChanges
      .subscribe(values => {

        this.onChange(Object.assign({}, this.model, { datatype: 'number' }))

      })

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

    if (!this.model) {
      return { required: true }
    }

    if (this.model.operator === 'bt') {
      if (!this.model.value || !this.model.value2) {
        return {
          message: 'Invalid values provided',
          operator: this.model.operator,
          value: this.model.value,
          value2: this.model.value2,
        }
      }

      if (this.model.value >= this.model.value2) {
        return {
          message: 'The `max` value must be greater than the `min` value',
          operator: this.model.operator,
          value: this.model.value
        }
      }

    } else {

      if (!this.model.value) {
        return { required: true }
      }

    }

    return null

  }

}
