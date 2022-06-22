// like lodash's pull function, but works with Vue arrays reactivity
export function pull (list, ...values) {
  for (const v of values) {
    const i = list.indexOf(v)
    if (i !== -1) {
      list.splice(i, 1)
    }
  }
}
