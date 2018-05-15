import { Component, Input, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';

@Component({
  selector: 'filter-multiple',
  template: `
    <form #f="ngForm">
      <select name="value" [(ngModel)]="model.value" class="operator">
        <option *ngFor="let option of options" [ngValue]="option.value">{{ option.label }}</option>
      </select>
    </form>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FilterMultipleComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: FilterMultipleComponent,
      multi: true
    }
  ]
})
export class FilterMultipleComponent implements ControlValueAccessor, Validator {

  disabled = false

  defaultModel = {
  }

  @Input() options

  model: any = {}

  @ViewChild('f') form: FormGroup

  onChange = (_: any) => { }

  onTouched = (_: any) => { }

  ngOnInit() {

    this.form.valueChanges
      .subscribe(values => {

        this.onChange(Object.assign({}, this.model, {
          operator: 'eq',
          datatype: 'string'
        }))

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
    // make sure the input have value
    return (this.model && this.model.value !== undefined) ? null : {
      required: true
    }
  }

}
