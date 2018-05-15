import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IGridController } from './IGridController';


export enum FilterOperator {
  Equals,
  DoesNotEqual,
  IsLessThan,
  IsLessThanOrEqualTo,
  IsGreaterThan,
  IsGreaterThanOrEqualTo,
  Between,
  BeginsWith,
  Contains,
  DoesNotContain,
  EndsWith,
}

@Injectable()
export class RemoteGridController implements IGridController {

  payload: any = {}

  url: string

  renderEmitter = new Subject()

  constructor(public http: HttpClient) {

  }

  setUrl(url: string) {

    this.url = url

    return this

  }

  filter(filters: any): this {

    this.payload.filters = filters.map(x => {

      if (x.operator === 'last') {

        const { duration, unit } = this.parseDuration(x.value)

        return Object.assign({}, x, {
          column: _.upperFirst(x.column),
          operator: this.convertOperators('bt'),
          values: [
            moment().startOf('day').add(-duration, unit).format('YYYY-MM-DD'),
            moment().startOf('day').format('YYYY-MM-DD')
          ]
        })

      }

      if (x.operator === 'next') {

        const { duration, unit } = this.parseDuration(x.value)

        return Object.assign({}, x, {
          column: _.upperFirst(x.column),
          operator: this.convertOperators('bt'),
          values: [
            moment().startOf('day').add(-duration, unit).format('YYYY-MM-DD'),
            moment().startOf('day').format('YYYY-MM-DD')
          ]
        })

      }

      if (x.datatype === 'date') {
        x.value = x.value.format('YYYY-MM-DD')
      }

      return {
        column: _.upperFirst(x.column),
        operator: this.convertOperators(x.operator),
        values: [x.value, x.value2]
      }

    })

    return this

  }

  sortBy(sorting: any[]): this {

    if (!sorting || !sorting.length) {
      return this
    }

    const [column, descending] = sorting

    this.payload.sorting = [{ column: _.upperFirst(column), ascending: !descending }]

    return this

  }

  paginate(page: any, perPage: any): this {

    this.payload.page = { number: page, itemsPerPage: perPage }

    return this

  }

  load(): Observable<any> {

    return this.http
      .post(this.url, _.omitBy(this.payload, _.isUndefined))

  }

  setData(data: any[]) {

    return this

  }

  resetData() {

    return this

  }

  render() {

    this.renderEmitter.next()

  }

  private parseDuration(str) {

    if (!str) {
      return { duration: 0, unit: 'd' }
    }

    const duration = parseInt(str, 10)
    let unit = str.replace(duration, '')

    unit = unit === 'm' ? 'M' : unit

    return { duration, unit }
  }

  private convertOperators(operator: string): number {
    const map = {
      'contains': FilterOperator.Contains,
      'not contains': FilterOperator.DoesNotContain,
      'eq': FilterOperator.Equals,
      'starts': FilterOperator.BeginsWith,
      'ends': FilterOperator.EndsWith,
      'neq': FilterOperator.DoesNotEqual,
      'gt': FilterOperator.IsGreaterThan,
      'gte': FilterOperator.IsGreaterThanOrEqualTo,
      'lt': FilterOperator.IsLessThan,
      'lte': FilterOperator.IsLessThanOrEqualTo,
      'bt': FilterOperator.Between,
    }

    return map[operator]
  }

}
