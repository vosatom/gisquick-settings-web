export const UnitsExtentPrecision = {
  mm: 0,
  cm: 0,
  feet: 0,
  yd: 0, // yard
  meters: 0,
  km: 2,
  mi: 2, // miles
  'nautical miles': 2,
  degrees: 6
}

export function extentPrecision (unit, def) {
  const p = UnitsExtentPrecision[unit]
  return Number.isInteger(p) ? p : def
}
