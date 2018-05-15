import { Component, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import 'rxjs/add/operator/combineLatest';

@Component({
  selector: 'filter-string',
  template: `
    <form #f="ngForm">

      <select name="operator" [(ngModel)]="model.operator" class="operator">
        <option *ngFor="let op of operators" [value]="op[0]">{{ op[1] }}</option>
      </select>

      <input type="text" name="value" [(ngModel)]="model.value" required>

    </form>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FilterStringComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: FilterStringComponent,
      multi: true
    }
  ],
})
export class FilterStringComponent implements ControlValueAccessor, Validator {

  disabled = false

  defaultModel = {
    operator: 'contains'
  }

  model: any = {}

  operators = [
    ['contains', 'contains'],
    ['eq', 'is equal to'],
    ['starts', 'starts with'],
    ['ends', 'ends with'],
    ['neq', 'is not equal to'],
    ['not contains', 'does not contain'],
  ]

  @ViewChild('f') form: FormGroup

  onChange = (_: any) => { }

  onTouched = (_: any) => { }

  onValidatorChange = () => { }

  ngOnInit() {

    this.form.valueChanges
      .subscribe(values => {

        this.onChange(Object.assign({}, this.model, { datatype: 'string' }))

      })

  }

  writeValue(obj: any): void {
    this.model = _.defaultsDeep({}, obj, this.defaultModel)
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

    if (!this.model || !this.model.value) {

      return { required: true }

    }

    return null

  }

}
