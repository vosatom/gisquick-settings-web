const ConversionFunctions = {
  INTEGER: v => parseInt(v),
  DOUBLE: v => parseFloat(v),
  BOOL: v => Boolean(v)
}

export function valueMapItems (attr) {
  const transformValue = ConversionFunctions[attr.type] || (v => v)
  return attr.config.map.map(obj => ({
    text: Object.keys(obj)[0],
    value: transformValue(Object.values(obj)[0])
  }))
}

export function excludedFieldsSet (layerSettings, key) {
  if (layerSettings.excluded_fields) {
    const { global = [], [key]: keyFields = [] } = layerSettings.excluded_fields
    try {
      return new Set([...global, ...keyFields])
    } catch (err) {}
  }
  return new Set()
}
