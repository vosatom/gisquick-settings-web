<template>
  <v-tree-view
    item-children="children"
    item-key="path"
    base-indent="4"
    :indent="selected ? 28 : 22"
    :items="tree"
    :expanded="expanded"
  >
    <template v-slot:group="{ group: folder, expanded, style }">
      <div
        class="item folder f-row-ac"
        :class="[folder.info.flag, {expanded}]"
        :style="style"
        @contextmenu="$emit('contextmenu', { evt: $event, item: folder })"
      >
        <v-checkbox
          v-if="selected"
          :disabled="selectedData[folder.path].disabled"
          :value="selectedData[folder.path].checked"
          :indeterminate="selectedData[folder.path].indeterminate"
          @input="setSelectedDir(folder, $event)"
        />
        <div class="icon-box">
          <v-icon
            size="24"
            role="button"
            :name="expanded ? 'folder-open' : 'folder'"
            @click="toggleFolder(folder)"
          />
          <slot name="folder-badge" :folder="folder"/>
        </div>
        <slot v-if="!folder.info.flag" name="folder-prepend" />
        <span v-text="folder.name" class="f-grow"/>
        <span class="info">{{ folder.info.filesCount }} files, {{ $format.filesize(folder.info.size) }}</span>
      </div>
    </template>
    <template v-slot:leaf="{ item, style }">
      <div
        class="item file f-row-ac"
        :class="flags && flags[item.path]"
        :style="style"
        @contextmenu="$emit('contextmenu', { evt: $event, item })"
      >
        <v-checkbox
          v-if="selected"
          :disabled="isDisabled(item)"
          :value="isSelected(item.path)"
          @input="setSelected(item, $event)"
        />
        <div class="icon-box">
          <slot name="file-icon" :file="item">
            <v-icon :name="iconsSet[item.ext] || 'file-outline'" size="24"/>
          </slot>
          <slot name="file-badge" :file="item"/>
        </div>
        <span v-text="item.name" class="f-grow"/>
        <span class="mtime" v-text="$format.udate(item.mtime)"/>
        <div
          class="size f-col f-align-end"
          :class="{progressbar: !!filesProgress[item.path]}"
        >
          <span v-text="$format.filesize(item.size)"/>
          <v-linear-progress
            v-if="filesProgress[item.path]"
            :value="filesProgress[item.path].progress"
          />
        </div>
      </div>
    </template>
  </v-tree-view>
</template>

<script>
import Path from 'path'
// import { win32 as dirname } from 'path-dirname'

import { pull } from '@/utils/collections'

function compareFiles (a, b) {
  if (a.children && b.children) {
    return a.name.localeCompare(b.name)
  } else if (a.children) {
    return -1
  } else if (b.children) {
    return 1
  }
  return a.name.localeCompare(b.name)
}

export function filesTree (files) {
  const root = { children: [] }

  files.forEach(f => {
    let parent = root
    const dir = Path.dirname(f.path)
    if (dir !== '.') {
      const parts = dir.split(Path.sep)
      parts.forEach((name, i) => {
        let node = parent.children.find(i => i.name === name)
        // create folder node if not exists yet
        if (!node) {
          node = { name: name, children: [], path: Path.join(...parts.slice(0, i + 1)) }
          parent.children.push(node)
        }
        parent = node
      })
    }
    const name = Path.basename(f.path)
    parent.children.push({
      ...f,
      name,
      ext: Path.extname(name).slice(1).toLowerCase()
    })
  })
  return root.children
}

export function collectFoldersInfo (tree, flags) {
  const info = {
    size: 0,
    filesCount: 0,
    flag: null,
    new: 0,
    changed: 0,
    deleted: 0
  }
  tree.forEach(n => {
    let flag
    if (n.children) {
      const nInfo = collectFoldersInfo(n.children, flags)
      info.size += nInfo.size
      info.filesCount += nInfo.filesCount
      n.info = nInfo
      flag = nInfo.flag
      info.new += nInfo.new
      info.changed += nInfo.changed
      info.deleted += nInfo.deleted
    } else {
      info.size += n.size
      info.filesCount += 1
      flag = flags?.[n.path]
      if (flag) {
        info[flag] += 1
      }
    }
  })
  if (info.new === info.filesCount) {
    info.flag = 'new'
  } else if (info.deleted === info.filesCount) {
    info.flag = 'deleted'
  }
  return info
}

export function sortTree (tree) {
  tree.sort(compareFiles)
  tree.forEach(i => {
    if (i.children) {
      sortTree(i.children)
    }
  })
  return tree
}

function createDirIndex (tree, index = {}) {
  tree.forEach(ch => {
    if (ch.children) {
      index[ch.path] = ch
      createDirIndex(ch.children, index)
    }
  })
  return index
}

const FileIconSet = {
  qgs: 'qgis',
  qgz: 'qgis',
  png: 'file-image-outline',
  jpg: 'file-image-outline',
  jpeg: 'file-image-outline',
  gif: 'file-image-outline',
  tif: 'file-image-outline',
  tiff: 'file-image-outline',
  svg: 'file-image-outline',
  sqlite: 'storage',
  gpkg: 'storage'
}

export default {
  props: {
    files: Array,
    flags: Object,
    progress: Object,
    selected: Array,
    disabled: Function
  },
  data () {
    return {
      expanded: {},
      selectedData: {}
    }
  },
  computed: {
    filesProgress () {
      return this.progress || {}
    },
    iconsSet () {
      return FileIconSet
    },
    tree () {
      if (this.files) {
        const tree = sortTree(filesTree(this.files))
        collectFoldersInfo(tree, this.flags)
        return tree
      }
      return []
    },
    dirsIndex () {
      return this.tree ? createDirIndex(this.tree) : {}
    }
  },
  watch: {
    dirsIndex: {
      immediate: true,
      handler: 'initSelectedData'
    },
    selected (n, o) {
      if (n !== o) {
        this.initSelectedData()
      }
    }
  },
  methods: {
    isDisabled (item) {
      return this.disabled?.(item)
    },
    toggleFolder (item) {
      this.expanded = { ...this.expanded, [item.path]: !this.expanded[item.path] }
    },
    // immutable
    // setSelected (item, val) {
    //   const selected = val
    //     ? [...this.selected, item.path]
    //     : this.selected.filter(p => item.path !== p)
    //   this.updateParentSelectedState(item, selected)
    //   this.$emit('update:selected', selected)
    // },
    // with data mutation
    setSelected (item, val) {
      if (val) {
        this.selected.push(item.path)
      } else {
        pull(this.selected, item.path)
      }
      this.updateParentSelectedState(item, this.selected)
    },
    getFolderFiles (path, predicate = () => true, list = []) {
      const dir = this.dirsIndex[path]
      dir?.children.forEach(ch => {
        if (ch.children) {
          this.getFolderFiles(ch.path, predicate, list)
        } else if (predicate(ch)) {
          list.push(ch.path)
        }
      })
      return list
    },
    // model with files only
    setSelectedDir (item, val) {
      const paths = this.getFolderFiles(item.path, i => !this.isDisabled(i))
      // immutable
      // let selected
      // if (val) {
      //   selected = [...this.selected, ...paths.filter(p => !this.selected.includes(p))]
      // } else {
      //   const exclude = new Set(paths)
      //   selected = this.selected.filter(p => !exclude.has(p))
      // }
      // this.$emit('update:selected', selected)

      // with data mutation
      if (val) {
        this.selected.push(...paths.filter(p => !this.selected.includes(p)))
      } else {
        pull(this.selected, ...paths)
      }
      const selected = this.selected

      // v1) simple but with unnecessary computations
      this.updateSelectedState(item, selected, true)

      // v2) slighty more effective update of folders subtree update
      // this.selectedData[item.path] = {
      //   checked: val,
      //   indeterminate: false
      // }
      // item.children.filter(i => i.children).forEach(dir => this.updateSelectedState(dir, selected, true))
      this.updateParentSelectedState(item, selected)
    },
    isSelected (path) {
      return this.selected.includes(path)
    },
    // with selection model v2 (files + dirs)
    // isParentSelected (path) {
    //   const dir = Path.dirname(path)
    //   if (dir !== '.') {
    //     return this.isSelected(dir)
    //   }
    //   return false
    // },
    // isSelected (path) {
    //   if (this.selected.includes(path)) {
    //     return true
    //   }
    //   return this.isParentSelected(path)
    // },
    updateSelectedState (folder, selected, recursive) {
      let checked = 0, indeterminate = 0, disabled = 0
      folder.children.forEach(ch => {
        if (ch.children) {
          if (recursive || !this.selectedData[ch.path]) {
            this.updateSelectedState(ch, selected, recursive)
          }
          const s = this.selectedData[ch.path]
          if (s.checked) {
            checked += 1
          }
          if (s.indeterminate) {
            indeterminate += 1
          }
          if (s.disabled) {
            disabled += 1
          }
        } else {
          if (this.isDisabled(ch)) {
            disabled += 1
          }
          if (selected.includes(ch.path)) {
            checked += 1
          }
        }
      })
      const state = {
        disabled: disabled === folder.children.length,
        checked: checked > 0,
        indeterminate: indeterminate > 0 || (checked > 0 && checked < folder.children.length)
      }
      this.selectedData[folder.path] = state
    },
    updateParentSelectedState (item, selected) {
      const dir = Path.dirname(item.path)
      if (dir !== '.') {
        const parent = this.dirsIndex[dir]
        this.updateSelectedState(parent, selected)
        this.updateParentSelectedState(parent, selected)
      }
    },
    initSelectedData () {
      this.selectedData = {}
      if (this.selected) {
        const tree = { path: '', children: this.tree }
        this.updateSelectedState(tree, this.selected)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.icon[role="button"] {
  cursor: pointer;
}
.folder {
  --gutter: 0;
  .info {
    font-size: 13px;
    opacity: 0.65;
  }
}
.item {
  height: 36px;
  padding-right: 6px;
  line-height: 1.2;
  // font-size: 14px;
  .icon {
    margin: 1px 2px;
    user-select: none;
  }
  &:hover {
    background-color: #eee;
  }
  &.changed {
    color: var(--color-orange);
    --icon-color: currentColor;
  }
  &.new {
    color: var(--color-green);
    --icon-color: currentColor;
  }
  &.deleted {
    color: var(--color-red);
    --icon-color: currentColor;
  }
  .checkbox {
    margin: 3px;
  }
}
.icon-box {
  position: relative;
  display: flex;
}
.size {
  &.progressbar {
    // font-size: 12px;
  }
  .linear-progress {
    width: 70px;
    margin: 3px 0;
  }
}
.size {
  width: 94px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.8;
}
.mtime {
  font-size: 13px;
  opacity: 0.8;
  margin: 0 6px;
  white-space: nowrap;
}
</style>
