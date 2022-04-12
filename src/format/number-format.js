const Configs = {
  num: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  shortNum: {
    minimumFractionDigits: 0,
    maximumSignificantDigits: 3,
    notation: 'compact'
  },
  percent: {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  },
  percent2: {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  currency: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    style: 'currency'
  },
  shortCurrency: {
    maximumSignificantDigits: 3,
    notation: 'compact',
    style: 'currency'
  },
  price: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency'
  }
}

function isNil (v) {
  return v === undefined || v === null
}

function _format (fn, intl, ...args) {
  let v = args[0]
  const { pre, post, empty } = fn.config
  if (Number.isFinite(v)) {
    if (pre) {
      v = pre(...args)
    }
    v = intl.format(v)
    if (post) {
      v = post(v, args, fn.config)
    }
  } else if (empty) {
    // if (typeof fn.config.empty === 'function') { }
    v = empty
  }
  return v
}

const cache = {}

export default function numberFormat (type, args) {
  let fn
  if (args) {
    fn = (...fArgs) => {
      const a = fArgs.slice(1)
      const argsVals = args.map((name, i) => [name, !isNil(a[i]) ? a[i] : fn.config.opts[name]])
      const paramsKey = argsVals.map(parts => `,${parts.join('=')}`).join('')
      const key = `${fn.type}:${fn.config.locale || 'default'}${paramsKey}`
      let intl = cache[key]
      if (!intl) {
        const opts = { ...Configs[fn.type] }
        argsVals.forEach(([k, v]) => {
          opts[k] = v
        })
        intl = new Intl.NumberFormat(fn.config.locale, opts)
        cache[key] = intl
      }
      return _format(fn, intl, ...fArgs)
    }
    fn.locale = (locale) => fn.clone({ locale })
    args.forEach(arg => {
      fn[arg] = param => fn.clone({ opts: { ...fn.config.opts, [arg]: param } })
    })
  } else {
    fn = (...fArgs) => _format(fn, fn.intl, ...fArgs)
    fn.locale = (locale) => {
      const newFn = fn.clone({ locale })
      const key = `${fn.type}:${locale || 'default'}`
      let intl = cache[key]
      if (!intl) {
        intl = new Intl.NumberFormat(locale, Configs[fn.type])
        cache[key] = intl
      }
      newFn.intl = intl
      return newFn
    }
  }

  // (...args) => ...
  fn.pre = pre => fn.clone({ pre })
  // (result, args, config) => ...
  fn.post = post => fn.clone({ post })
  fn.empty = empty => fn.clone({ empty })

  fn.clone = (cfg = {}) => {
    const newFn = numberFormat(fn.type, args)
    if (!args) {
      newFn.intl = fn.intl
    }
    newFn.config = { ...fn.config, ...cfg }
    return newFn
  }
  fn.type = type
  fn.config = { opts: {} }
  return fn
}
