import Vue from 'vue'
import mapValues from 'lodash/mapValues'

import numberFormat from './number-format'
import datetimeFormaters from './datetime'
import { preformatFilesize } from './filesize'

const numeric = mapValues({
  perc: numberFormat('percent'),
  perc2: numberFormat('percent2'),
  num: numberFormat('num'),
  shortNum: numberFormat('shortNum'),
  currency: numberFormat('currency', ['currency']).currency('EUR').pre(Math.trunc),
  shortCurrency: numberFormat('shortCurrency', ['currency']).currency('EUR'),
  price: numberFormat('price', ['currency']).currency('EUR'),
}, fn => fn.locale('en-US'))



export default Vue.observable({
  // date: v => v && format(utcToLocalDate(toDate(v)), 'dd.MM.yyyy'), // string ISO or Date in UTC
  // datetime: v => v && format(toDate(v), 'dd.MM.yyyy HH:mm'),
  ...datetimeFormaters,

  ...numeric,
  roundNum: numeric.num.pre(Math.round),
  truncNum: numeric.num.pre(Math.trunc),

  filesize: v => {
    if (Number.isFinite(v)) {
      const { value, unit } = preformatFilesize(v)
      return `${numeric.num(value)} ${unit}`
    }
    return v
  }
  // sortString,
  // localToUtcDate,
  // utcToLocalDate,
})
