export interface IMenuContextItem {
  icon?: string,
  label?: string,
  handler?: (row: any, ev: Event) => any,
  disabled?: (row) => boolean
}
export interface IMenuContext {
  primary?: IMenuContextItem,
  dropdown?: IMenuContextItem[],
}
