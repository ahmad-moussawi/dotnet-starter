import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import { IGridController } from './IGridController';

export class LocalGridController implements IGridController {

  data: any

  conditions: any

  dataQuery

  sorting = null

  paging = null

  renderEmitter = new Subject()

  operators = {
    'eq': (v1, v2) => v1 === v2,
    'lt': (v1, v2) => v1 < v2,
    'gt': (v1, v2) => v1 > v2,
    'bt': (v, min, max) => v > min && v < max,
    'contains': (v1, v2) => v1.includes(v2),
    'starts': (v1, v2) => v1.startsWith(v2),
    'ends': (v1, v2) => v1.endsWith(v2),
    'neq': (v1, v2) => v1 !== v2,
    'not contains': (v1, v2) => !v1.includes(v2),
  }

  casting = _({
    string: v => (v + '').toLowerCase(),
    date: v => moment(v).startOf('day'),
    number: v => Number(v)
  }).mapValues((fn, datatype) => v => {

    // omit casting if falsy
    if (!v) { return v }

    // proceed with the casting
    return fn(v)

  }).value()

  constructor(public minTime = 50, public maxTime = 150) {

  }

  setData(data) {

    this.paging = { page: 1, perPage: 25 }

    this.data = data

    this.dataQuery = _(_.cloneDeep(this.data))

    return this

  }

  resetData() {

    this.dataQuery = _(_.cloneDeep(this.data))

    return this

  }

  filter(conditions) {

    // make sure only enabled and valid conditions are taken into consideration
    conditions = _.omitBy(conditions, x => x.enable && x.valid)

    conditions = _.map(conditions, (condition, column) => this.transformer(column, condition))

    this.conditions = conditions

    return this

  }

  sortBy(sorting: any[]) {

    if (sorting && sorting.length) {

      const [column, desc] = sorting

      if (column) {
        this.sorting = [column, desc]
      }

    }

    return this

  }

  paginate(page = 1, perPage = 25) {

    this.paging = { page, perPage }

    return this

  }

  load() {

    if (!this.dataQuery) {

      return Observable.empty()

    }

    if (this.conditions) {
      this.dataQuery = this.dataQuery.filter(row => this.reduceFilter(this.conditions, row))
    }

    if (this.sorting && this.sorting[0]) {

      const [column, desc] = this.sorting

      this.dataQuery = this.dataQuery.orderBy(x => x[column], [desc ? 'desc' : 'asc'])

    }

    const count = this.dataQuery.size()

    if (this.paging) {

      const { page, perPage } = this.paging
      const pagesCount = Math.ceil(count / perPage)

      this.dataQuery = this.dataQuery.drop((page - 1) * perPage).take(perPage).thru(x => ({
        data: x,
        start: (page - 1) * perPage,
        end: page * perPage,
        count,
        currentPage: page,
        totalPages: pagesCount,
      }))

    } else {

      this.dataQuery = this.dataQuery.thru(x => ({
        data: x,
        start: 0,
        end: count,
        count,
        currentPage: 1,
        totalPages: 1,
      }))

    }

    return Observable.from([this.dataQuery.value()])// .delay(_.random(this.minTime, this.maxTime))
  }

  render() {
    this.renderEmitter.next()
  }

  private reduceFilter(conditions, row) {

    return _(conditions).reduce((prev, current) => {

      // short-circuit asap
      if (prev === false) {
        return false
      }

      const compare = this.operators[current.operator]

      // console.log(
      //   current.caster(row[current.column]).format('YYYY-MM-DD'),
      //   current.value.format('YYYY-MM-DD'),
      //   current.value2.format('YYYY-MM-DD'),
      //   compare(current.caster(row[current.column]), current.caster(current.value), current.caster(current.value2))
      // )

      // current.value2 get ignored on functions that take one param only
      return prev && compare(
        current.caster(row[current.column]),
        current.caster(current.value),
        current.caster(current.value2)
      )

    }, true)

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

  private transformer(column, originalCondition) {

    const condition = Object.assign({ column }, originalCondition)

    condition.caster = this.casting[condition.datatype] || (v => v)

    if (condition.datatype === 'date') {

      if (condition.operator === 'last') {

        const { duration, unit } = this.parseDuration(condition.value)

        return Object.assign({}, condition, {
          operator: 'bt',
          value: moment().startOf('day').add(-duration, unit),
          value2: moment().startOf('day')
        })

      } else if (condition.operator === 'next') {

        const { duration, unit } = this.parseDuration(condition.value)

        return Object.assign({}, condition, {
          operator: 'bt',
          value: moment().startOf('day'),
          value2: moment().startOf('day').add(duration, unit),
        })

      } else {

        return Object.assign({}, condition, {
          value: moment(condition.value).startOf('day')
        })

      }

    }

    return condition

  }

}
