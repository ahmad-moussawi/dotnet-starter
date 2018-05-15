import { Observable } from 'rxjs/Observable';

export interface IGridController {

  filter(conditions: any): this

  sortBy(sorting: any[]): this

  paginate(page, perPage): this

  load(): Observable<any>

  setData(data: any[]): this

  resetData(): this

  render(): void

}
