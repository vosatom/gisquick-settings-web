<template>
  <div class="short-names-editor f-col">
    <div class="f-col">
    <!-- <div class="grid">
      <template v-for="(name, id) of names">
        <span :key="`label-${id}`" v-text="layers[id].title"/>
        <v-text-field
          :key="id"
          class="inline filled"
          :xlabel="layers[id].title"
          v-model="names[id]"
          lazy
        />
      </template>
    </div> -->
    <layers-table
      :collapsed.sync="collapsed"
      :columns="columns"
      :items="layersTree"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:leaf.name="{ item, value }">
        <v-text-field
          class="filled mx-0"
          v-model="names[item.id]"
          :error="invalidNames[item.id]"
          :validator="isValidLayerName"
          lazy
        >
          <template v-slot:append>
            <v-icon v-if="invalidNames[item.id]" name="warning" color="red" size="17"/>
          </template>
        </v-text-field>
      </template>

      <!-- eslint-disable-next-line -->
      <template v-slot:header.wfs>
        <th class="header">
          <div class="f-row-ac">
          <span class="mr-2">WFS</span>
          <v-icon name="visibility"/>
          <v-icon name="pencil"/>
          <v-icon name="plus"/>
          <v-icon name="delete_forever"/>
          </div>
        </th>
      </template>

      <!-- eslint-disable-next-line -->
      <template v-slot:leaf.wfs="{ item, value }">
        <div v-if="item.type === 'VectorLayer'" class="f-row-ac">
          <v-icon name="visibility"/>
          <v-icon name="pencil"/>
          <v-icon name="plus"/>
          <v-icon name="delete_forever"/>
        </div>
      </template>

    </layers-table>
    </div>

    <hr class="mt-2"/>
    <div class="toolbar f-row-ac f-justify-end m-2">
      <v-btn class="outlined" @click="generateNames">Generate names</v-btn>
      <v-btn color="primary" @click="updateProject">Update QGIS project</v-btn>
    </div>
  </div>
</template>

<script>
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'

import LayersTable from '@/components/LayersTable.vue'
import { isValidLayerName, transformLayersTree, transformLayersTree2 } from '@/utils/layers'
import { removeDiacritics } from '@/ui/utils/text'

const isAlphaNum = RegExp.prototype.test.bind(/[a-zA-Z0-9]/)

export function shortName (layername) {
  const normalized = removeDiacritics(layername).replace(/[^a-z0-9_\-\.]/gmi, ' ').replace(/\s+/g, ' ').trim()
  const parts = normalized.split(' ')
  let name = parts[0]
  parts.slice(1).forEach(p => {
    if (isAlphaNum(name.slice(-1)) && isAlphaNum(p.charAt(0))) {
      name += '_'
    }
    name += p
  })
  return name
}


export default {
  components: { LayersTable },
  props: {
    meta: Object
  },
  data () {
    return {
      collapsed: [],
      names: {}
    }
  },
  computed: {
    layers () {
      return this.meta.layers
    },
    layersTree () {
      const { layers_tree, layers } = this.meta
      return transformLayersTree2(layers_tree, id => layers[id], (name, layers) => ({ name, layers }))
    },
    columns () {
      return [
        {
          text: 'Short name',
          value: 'name'
        // }, {
        //   text: 'WFS',
        //   value: 'wfs',
        //   align: 'right'
        }
      ]
    },
    isValidLayerName () {
      return v => isValidLayerName(v) ? '' : new Error()
    },
    invalidNames () {
      return mapValues(this.names, name => !isValidLayerName(name))
    }
  },
  watch: {
    meta: {
      immediate: true,
      handler: 'initLayersList'
    }
  },
  methods: {
    initLayersList () {
      console.log('initLayersList')
      this.names = mapValues(this.layers, l => l.name)
    },
    generateNames () {
      Object.values(this.layers).forEach(l => {
        if (this.invalidNames[l.id]) {
          this.names[l.id] = shortName(l.name)
        }
      })
    },
    async updateProject () {
      const names = pickBy(this.names, (name, id) => name !== this.layers[id].name)
      await this.$ws.request('UpdateQgisProject', { short_names: names })
      this.$emit('project-update')
    }
  }
}
</script>

<style lang="scss" scoped>
// .grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   align-self: flex-start;
//   align-items: center;
// }
.layers-table {
  // align-self: flex-start;
  .text-field {
    margin: 0;
    height: 26px;
    width: 220px;
    &.i-field > ::v-deep .input {
      height: inherit;
    }
  }
}
</style>
