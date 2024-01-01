export function getInternalLayers(project) {
  return project.meta.layers_tree.find((layer) => layer.name === 'Internal')
    ?.layers
}
