import omit from 'lodash/omit'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import difference from 'lodash/difference'
import transform from 'lodash/transform'
import isObject from 'lodash/isObject'

import has from 'lodash/has'
import get from 'lodash/has'
import isUndefined from 'lodash/isUndefined'
import isObjectLike from 'lodash/isObjectLike'
import keys from 'lodash/keys'
import intersection from 'lodash/intersection'
import mapValues from 'lodash/mapValues'

import keyBy from 'lodash/keyBy'


/**
 * Deep diff between two object, using lodash
 * Source: https://gist.github.com/Yimiprod/7ee176597fef230d1451
 */
export function objDiff (object, base) {
	function changes (object, base) {
		return transform(object, (result, value, key) => {
      // if (key === 'metadata') {
      //   console.log('metadata', value, base[key], isEqual(value, base[key]))
      // }
			if (!isEqual(value, base[key])) {
				result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value
			}
		})
	}
	return changes(object, base)
}

export function objDiff2 (object, base) {
	function changes (object, base) {
		return transform(object, (result, value, key) => {
      // if (key === 'metadata') {
      //   console.log('metadata', value, base[key], isEqual(value, base[key]))
      // }
			if (!isEqual(value, base[key])) {
        // console.log(key, value, base[key])
        const val = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value
        // Object.defineProperty(val, 'flag', { value: 'todo', enumerable: false })
				result[key] = val
			}
		})
	}
	return changes(object, base)
}

function simpleArrayDiff (target, base) {
  return target
}

function arrayDiff1 (target, base, key) {
  const t = keyBy(target, key)
  const b = keyBy(base, key)
  const { $diff, ...items } = objectDiff(t, b)
  const keyToIndex = Object.keys(items).reduce((map, k, i) => (map[k] = i, map), {})
  const res = Object.values(items)
  res.$diff = mapValues($diff, keys => keys.map(k => keyToIndex[k]))
  return res
}

function arrayDiff (target, base, key) {
  const t = keyBy(target, key)
  const b = keyBy(base, key)
  const { $diff, ...items } = objectDiff(t, b)
  const keyToIndex = Object.keys(items).reduce((map, k, i) => (map[k] = i, map), {})

  $diff.changed.forEach(k => {
    // all fields in changed object item
    // const tObj = target[keyToIndex[k]]
    // Object.keys(tObj).forEach(field => {
    //   if (field !== '$diff' && items[k][field] === undefined) {
    //     items[k][field] = tObj[field]
    //   }
    // })
    //

    // key field + changes
    items[k] = {
      [key]: target[keyToIndex[k]][key],
      ...items[k]
    }
  })
  const res = Object.values(items)
  res.$diff = mapValues($diff, keys => keys.map(k => keyToIndex[k]))
  return res
}

export function objectDiff (object, base, path = []) {
  const oKeys = Object.keys(object)
  const bKeys = Object.keys(base)
  const added = difference(oKeys, bKeys)
  const removed = difference(bKeys, oKeys)
  const common = intersection(oKeys, bKeys)
  const $diff = { added, removed, changed: [] }
  const diffObj = {}
  common.forEach(k => {
    const v1 = object[k]
    const v2 = base[k]
    if (!isEqual(v1, v2)) {
      path = [...path, k]
      $diff.changed.push(k)
      if (Array.isArray(v1) && Array.isArray(v2)) {
        console.log('compare arrays', path, k)
        if (k === 'attributes') {
          diffObj[k] = arrayDiff(v1, v2, 'name')
        } else {
          diffObj[k] = simpleArrayDiff(v1, v2)
        }
      } else if (isObject(v1) && isObject(v2)) {
        diffObj[k] = objectDiff(v1, v2, path)
      } else {
        diffObj[k] = object[k]
      }
    }
  })
  removed.forEach(k => {
    diffObj[k] = base[k]
  })
  added.forEach(k => {
    diffObj[k] = object[k]
  })
  diffObj.$diff = $diff
  return diffObj
}
