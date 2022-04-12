import round from 'lodash/round'

const factor = {
  feet: 12.0,
  meters: 39.37,
  miles: 63360.0,
  degrees: 4374754.0
}

/* Converts array of map scales to tile resolutions. */
export function scalesToResolutions(scales, units, dpi = 96) {
  const f = units.factor
  // const f = factor[units.map]
  return scales.map(scale => parseInt(scale) / (dpi * f))
}

export function scaleToResolution(scale, units, dpi = 96) {
  return parseInt(scale) / (dpi * factor[units])
}

function generateLinearScale (maxValue, count) {
  return new Array(count).fill(0).map((_, i) => maxValue / Math.pow(2, i))
}

function dynamicDecimalPrecision (val, digits) {
  const intDigits = parseInt(val).toString().length
  const precision = Math.max(0, digits - intDigits)
  return round(val, precision)
}

export const ProjectionsScales = {
  // Source: https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/
  'EPSG:3857': {
    scales: generateLinearScale(591658710.90, 24).map(v => round(v, 2)),
    tile_resolutions: generateLinearScale(156543.0339, 24).map(v => dynamicDecimalPrecision(v, 10))
  },
  'EPSG:5514': {
    scales: generateLinearScale(7315200.0000000019, 20).map(v => round(v, 2)),
    tile_resolutions: generateLinearScale(scaleToResolution(7315200.0000000019, 'meters'), 20).map(v => dynamicDecimalPrecision(v, 10))
  }
}
