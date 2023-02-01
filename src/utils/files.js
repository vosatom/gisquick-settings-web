import path from 'path'

export function filesDiff (base, target) {
  const newFiles = target.list.filter(f => !base.map[f.path])
  const updatedFiles = target.list.filter(f => base.map[f.path] && base.map[f.path].hash !== f.hash)
  const removedFiles = base.list.filter(f => !target.map[f.path] && !f.path.startsWith('web/components'))

  const newPaths = new Set(newFiles.map(f => f.path))
  const updatedPaths = new Set(updatedFiles.map(f => f.path))
  const removedPaths = new Set(removedFiles.map(f => f.path))

  const files = [...base.list, ...newFiles]

  const flags = files.reduce((flags, f) => {
    if (newPaths.has(f.path)) {
      flags[f.path] = 'new'
    }
    if (updatedPaths.has(f.path)) {
      flags[f.path] = 'changed'
    }
    if (removedPaths.has(f.path)) {
      flags[f.path] = 'deleted'
    }
    return flags
  }, {})
  return {
    files,
    flags,
    new: newFiles,
    updated: updatedFiles,
    removed: Array.from(removedPaths)
  }
}

export function findDirtyFiles (files, temporary) {
  const dirty = temporary?.filter(f => f.size > 0 && f.path.endsWith('.gpkg-wal'))
    .map(f => path.parse(f.path).name + '.gpkg')
    .filter(fname => files.find(f => f.path === fname))
  return dirty?.length ? dirty : null
}
