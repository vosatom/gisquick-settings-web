<template>
  <topics-editor
    :layers="overlays"
    :settings="settings"
  />
</template>

<script>
import TopicsEditor from '@/components/TopicsEditor.vue'
import { filterLayers, transformLayersTree } from '@/utils/layers'

export default {
  components: { TopicsEditor },
  props: {
    project: Object,
    settings: Object
  },
  computed: {
    overlays () {
      const meta = this.project.meta
      let tree = meta.layers_tree.filter(i => !this.settings.base_layers.includes(i.id || i.name))
      tree = filterLayers(tree, l => !this.settings.layers[l.id].flags?.includes('excluded')) // TODO: flags
      return transformLayersTree(
        tree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ name: g.name, layers })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.topics {
  min-height: 0;
  height: 100%;
  flex-shrink: 1;
  overflow: auto;
}
</style>
