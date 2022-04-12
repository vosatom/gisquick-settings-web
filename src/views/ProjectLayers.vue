<template>
  <div class="layers-settings page-content light">
    <!-- <portal to="menu">
      <span>Layers</span>
    </portal> -->
    <span class="label">Base Layers</span>
    <v-btn
      class="switch small m-0"
      color="yellow"
      :disabled="!selected"
      @click="swapSelectedLayer"
    >
      <v-icon name="swap"/>
      <!-- <span class="ml-2">Swap</span> -->
    </v-btn>
    <span class="label">Overlays</span>
    <layers-table
      class="base-layers"
      :items="baseLayers"
      :columns="[]"
      :collapsed.sync="collapsed.baseLayers"
      :selected="selected"
      @click:row="onClick"
    />
    <layers-table
      class="overlays"
      :items="overlays"
      :columns="overlaysHeaders"
      :collapsed.sync="collapsed.overlays"
      :selected="selected"
      @click:row="onClick"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:leaf.flags="{ item }">
        <layer-flags
          class="flags m-0"
          :layer-meta="item"
          :layer-settings="settings.layers[item.id]"
        />
      </template>

      <!-- eslint-disable-next-line -->
      <template v-slot:leaf.attributes="{ item }">
        <!-- <router-link
          v-if="item.attributes"
          :disabled="!item.flags.includes('query')"
          class="f-row-ac f-justify-center"
          :to="`layers/attributes/${item.id}`"
        >
          <v-icon name="attribute-table" size="18"/>
        </router-link> -->

        <v-btn
          v-if="item.attributes"
          class="icon flat mx-auto"
          :disabled="!item.flags.includes('query')"
          :to="`layers/attributes/${item.id}`"
        >
          <v-icon name="attribute-table" size="18"/>
        </v-btn>
      </template>

      <!-- eslint-disable-next-line -->
      <!-- <template v-slot:leaf.publish="{ item }">
        <v-checkbox
          class="f-justify-center"
          v-model="settings.layers[item.id].publish"
        />
      </template> -->
    </layers-table>
  </div>
</template>

<script>
import LayerFlags from '@/components/LayerFlags.vue'
import LayersTable from '@/components/LayersTable.vue'
import { layersGroups, transformLayersTree } from '@/utils/layers'

// like lodash's pull function, but works with Vue arrays reactivity
function pull (list, ...values) {
  for (const v of values) {
    const i = list.indexOf(v)
    if (i !== -1) {
      list.splice(i, 1)
    }
  }
}

export default {
  name: 'ProjectLayers',
  components: { LayerFlags, LayersTable },
  props: {
    project: Object,
    settings: Object
  },
  data () {
    return {
      opened: {
        baseLayers: [],
        overlays: []
      },
      collapsed: {
        baseLayers: [],
        overlays: []
      },
      selected: null
    }
  },
  computed: {
    // baseLayersHeaders () {
    //   return [
    //     {
    //       text: 'Publish',
    //       value: 'publish'
    //     }
    //   ]
    // },
    overlaysHeaders () {
      return [
        {
        //   text: 'Publish',
        //   value: 'publish'
        // }, {
        //   text: 'Hidden',
        //   value: 'hidden'
        // }, {
          text: 'Flags',
          value: 'flags',
          align: 'right'
        }, {
          text: 'Attributes',
          value: 'attributes'
        }
      ]
    },
    baseLayers () {
      const meta = this.project.meta
      const tree = meta.layers_tree.filter(i => this.settings.base_layers.includes(i.id || i.name))
      return transformLayersTree(
        tree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ name: g.name, layers })
      )
    },
    // overlays () {
    //   const meta = this.project.meta
    //   const overlaysTree = meta.layers_tree.filter(i => this.settings.overlays.includes(i.id || i.name))
    //   return transformLayersTree(
    //     overlaysTree,
    //     l => ({ ...meta.layers[l.id] }),
    //     (g, layers) => ({ name: g.name, layers })
    //   )
    // },
    overlays () {
      const meta = this.project.meta
      const overlaysTree = meta.layers_tree.filter(i => !this.settings.base_layers.includes(i.id || i.name))
      return transformLayersTree(
        overlaysTree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ name: g.name, layers })
      )
    },
    groupsInfo () {
      const tree = this.project.meta.layers_tree
      return tree
        .filter(n => n.layers)
        .reduce((data, g) => (data[g.name] = layersGroups(g.layers).map(sg => sg.name), data), {})
    }
  },
  methods: {
    onClick (item) {
      const key = item.id || item.name
      if (this.project.meta.layers_tree.some(i => (i.id || i.name) === key)) {
        this.selected = key
      }
    },
    // swapSelectedLayer () {
    //   const { base_layers: base, overlays } = this.settings
    //   const selector = i => (i.id || i.name) === this.selected
    //   const isOverlay = this.overlays.some(selector)
    //   const [ src, dest ] = isOverlay ? [overlays, base] : [base, overlays]
    //   dest.push(this.selected)
    //   pull(src, this.selected)

    //   // update opened groups models
    //   const isGroup = !!this.project.meta.layers_tree.find(selector).layers
    //   if (isGroup) {
    //     const [sOpen, dOpen] = isOverlay ? Object.values(this.opened).reverse() : Object.values(this.opened)
    //     const opened = sOpen.filter(name => name === this.selected || this.groupsInfo[this.selected].includes(name))
    //     dOpen.push(...opened)
    //     pull(sOpen, ...opened)
    //   }
    // },
    swapSelectedLayer () {
      const { base_layers: base } = this.settings
      const isBaseLayer = base.includes(this.selected)
      if (isBaseLayer) {
        pull(base, this.selected)
      } else {
        base.push(this.selected)
      }

      // update opened groups models
      // const isGroup = !!this.project.meta.layers_tree.find(i => (i.id || i.name) === this.selected)?.layers
      // if (isGroup) {
      //   const [sOpen, dOpen] = isBaseLayer ? Object.values(this.opened) : Object.values(this.opened).reverse()
      //   const opened = sOpen.filter(name => name === this.selected || this.groupsInfo[this.selected].includes(name))
      //   dOpen.push(...opened)
      //   pull(sOpen, ...opened)
      // }

      // update collapsed groups models
      const isGroup = !!this.project.meta.layers_tree.find(i => (i.id || i.name) === this.selected)?.layers
      if (isGroup) {
        const [sList, dList] = isBaseLayer ? Object.values(this.collapsed) : Object.values(this.collapsed).reverse()
        const collapsed = sList.filter(name => name === this.selected || this.groupsInfo[this.selected].includes(name))
        dList.push(...collapsed)
        pull(sList, ...collapsed)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.layers-settings {
  display: grid;
  grid-template-columns: 1fr auto auto 1fr;
  gap: 6px;
}
.switch {
  grid-column: 2 / 4;
}
.base-layers {
  grid-column: 1 / 3;
}
.overlays {
  grid-column: 3 / 5;
}
.layers-table {
  border: solid #ddd;
  border-width: 0 1px 1px 1px;
}
.label {
  text-align: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  align-self: center;
  // opacity: 0.7;

  font-size: 13px;
  background-color: #555;
  color: #fff;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flags {
  // min-width: 80px;
  ::v-deep .select {
    // flex-grow: 1;
    // width: 100%;
  }
}
</style>
