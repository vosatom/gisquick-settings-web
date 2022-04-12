const SizeUnits = {
  GB: value => (value / 1073741824),
  MB: value => (value / 1048576),
  kB: value => (value / 1024),
  B: value => value
}

export function formatFileSize (value, unit) {
  if (!value) {
    return value
  }
  if (!unit) {
    if (value > 1073741824) {
      unit = 'GB'
    } else if (value > 1048576) {
      unit = 'MB'
    } else if (value > 1024) {
      unit = 'kB'
    } else {
      unit = 'B'
    }
  }
  return `${SizeUnits[unit](value)} ${unit}`
}

export function preformatFilesize (value, unit) {
  if (!Number.isFinite(value)) {
    return value
  }
  if (!unit) {
    if (value > 1073741824) {
      unit = 'GB'
    } else if (value > 1048576) {
      unit = 'MB'
    } else if (value > 1024) {
      unit = 'kB'
    } else {
      unit = 'B'
    }
  }
  return {
    unit,
    value: SizeUnits[unit](value)
  }
}