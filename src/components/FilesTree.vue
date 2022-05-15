<template>
  <v-tree-view
    item-children="children"
    item-key="path"
    indent="22"
    :items="tree"
    :expanded="expanded"
  >
    <template v-slot:group="{ group: folder, expanded, style }">
      <div
        class="item folder f-row-ac"
        :class="folder.info.flag"
        :style="style"
        @contextmenu="$emit('contextmenu', { evt: $event, item: folder })"
      >
        <v-icon
          size="24"
          role="button"
          :name="expanded ? 'folder-open' : 'folder'"
          @click="toggleFolder(folder)"
        />
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
        <v-icon :name="iconsSet[item.ext] || 'file-outline'" size="24"/>
        <span v-text="item.name" class="f-grow"/>
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
import findKey from 'lodash/findKey'
import Path from 'path'
// import { win32 as dirname } from 'path-dirname'

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
    flag: null
  }
  const state = {
    new: true, // will be updated
    deleted: true,
    changed: false
  }
  tree.forEach(n => {
    let flag
    if (n.children) {
      const nInfo = collectFoldersInfo(n.children, flags)
      info.size += nInfo.size
      info.filesCount += nInfo.filesCount
      n.info = nInfo
      flag = nInfo.flag
    } else {
      info.size += n.size
      info.filesCount += 1
      flag = flags?.[n.path]
    }
    if (flags) {
      if (flag !== 'new') {
        state.new = false
      }
      if (flag !== 'deleted') {
        state.deleted = false
      }
      if (flag) {
        state.changed = true
      }
    }
  })
  info.flag = flags && findKey(state, s => s)
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
  sqlite: 'storage'
}

export default {
  props: {
    files: Array,
    flags: Object,
    progress: Object
  },
  data () {
    return {
      expanded: {}
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
    }
  },
  methods: {
    toggleFolder (item) {
      this.expanded = { ...this.expanded, [item.path]: !this.expanded[item.path] }
    },
    showMenu (e) {
      console.log(e)
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
    font-size: 13.5px;
    opacity: 0.6;
  }
}
.item {
  height: 36px;
  padding-right: 6px;
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
</style>
