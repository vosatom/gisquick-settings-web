<template>
  <div class="page-content light">
    <files-tree v-if="files" :files="files" @contextmenu="showContextMenu"/>
    <v-menu ref="menu" transition="fade" :items="menuItems"/>
    <router-view/>
  </div>
</template>

<script>
import Path from 'path'
import _keyBy from 'lodash/keyBy'
import _mapValues from 'lodash/mapValues'

import FilesTree from '@/components/FilesTree.vue'
import { pointBounds } from '@/ui/utils/popup'

export default {
  name: 'ProjectFiles',
  components: { FilesTree },
  props: {
    project: Object
  },
  data () {
    return {
      expanded: {}
    }
  },
  computed: {
    task () {
      return this.project.files
    },
    files () {
      return this.task.data?.files
    },
    menuItems () {
      return [
        { text: 'Download', action: this.download },
        { text: 'Copy Link', action: this.copyLink },
        { text: 'Delete', action: this.delete }
      ]
    }
  },
  mounted () {
    this.fetchFiles()
  },
  methods: {
    fetchFiles () {
      this.task.fetch()
    },
    showContextMenu (e) {
      e.evt.preventDefault()
      const { clientX, clientY } = e.evt
      this.$refs.menu.openMenu({ bounds: pointBounds(clientX, clientY, 1, 1) })
      this.contextMenuItem = e.item
    },
    async delete () {
      const item = this.contextMenuItem
      const files = [item.path]
      const resp = await this.$http.delete(`/api/project/files/${this.project.name}`, { data: { files } })
      this.task.data = resp.data
    },
    download () {
      const filePath = this.contextMenuItem.path
      // const link = `${location.origin}/api/project/file/${this.project.name}/${filePath}`
      const link = `${location.origin}/api/project/download/${this.project.name}/${filePath}`
      const a = document.createElement('a')
      a.href = link
      // a.setAttribute('download', Path.basename(filePath))
      a.click()
    },
    copyLink () {
      // const link = `/api/project/${this.project.name}/file/${this.contextMenuItem.path}`
      const link = `${location.origin}/api/project/file/${this.project.name}/${this.contextMenuItem.path}`
      // console.log('copyLink', link)
      navigator.clipboard.writeText(link)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
