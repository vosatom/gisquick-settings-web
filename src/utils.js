
export function lookupTable (items) {
  // return items.reduce((lookup, v) => ({...lookup, [v]: true }), {})
  return items?.reduce((lookup, v) => {
    return lookup[v] = true, lookup
  }, {})
}
