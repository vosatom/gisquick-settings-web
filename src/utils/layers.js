export function layersList (items) {
  const list = []
  items.forEach(item => {
    if (item.layers) {
      list.push(...layersList(item.layers))
    } else {
      list.push(item)
    }
  })
  return list
}

export function filterLayers (items, test) {
  const list = []
  items.forEach(item => {
    if (item.layers) {
      const children = filterLayers(item.layers, test)
      if (children.length) {
        list.push({
          ...item,
          layers: children
        })
      }
    } else if (test(item)) {
      list.push(item)
    }
  })
  return list
}

export function layersGroups (items) {
  const list = []
  items.forEach(item => {
    if (item.layers) {
      list.push(item, ...layersGroups(item.layers))
    }
  })
  return list
}

export function mapLayers (items, fn) {
  return items.map(i => i.layers ? { ...i, layers: mapLayers(i.layers, fn) } : fn(i))
}

export function transformLayersTree (layers, transformLayer, transformGroup) {
  return layers.map(i => {
    if (i.layers) {
      const children = transformLayersTree(i.layers, transformLayer, transformGroup)
      return transformGroup(i, children)
    } else {
      return transformLayer(i)
    }
  })
}

export function transformLayersTree2 (tree, transformLayer, transformGroup) {
  return tree.map(n => {
    if (n.layers) {
      const children = transformLayersTree2(n.layers, transformLayer, transformGroup)
      return transformGroup(n.name, children)
    } else {
      return transformLayer(n.id)
    }
  })
}
