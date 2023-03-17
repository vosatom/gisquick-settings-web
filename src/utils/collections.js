// like lodash's pull function, but works with Vue arrays reactivity
export function pull (list, ...values) {
  for (const v of values) {
    const i = list.indexOf(v)
    if (i !== -1) {
      list.splice(i, 1)
    }
  }
}

export function extend (list, ...values) {
  for (const v of values) {
    if (!list.includes(v)) {
      list.push(v)
    }
  }
}

export function hasAny (list1, ...values) {
  return list1.some(v => values.includes(v))
}
