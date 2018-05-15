export function normalizeColumns(columns: any[], renderers: any) {

  return columns.map(x => {

    let col: any = {}

    if (typeof x === 'string') {

      col = {
        name: x,
      }

    } else {

      col = Object.assign({}, x)

    }

    if (!col.name) {

      throw Error('The name property of the column is required')

    }

    // parse "col as columnName" syntax

    if (col.name.includes(' as ') && !col.label) {

      const [name, label] = col.name.split(' as ')

      col.name = name
      col.label = label

    }

    const datatype = col.datatype || 'string'

    const defaultRender = v => v

    if (!col.render || col.usingDefaultRender) {
      col.render = renderers[datatype] || defaultRender
    }

    const label = col.label || col.name

    const usingDefaultRender = col.render === defaultRender

    col.usingDefaultRender = undefined

    const tooltip = col.tooltip || (() => '')

    const result = _.defaults(col, {
      datatype,
      label,
      tooltip,
      usingDefaultRender,
      styles: {}
    })

    return result

  })
}
