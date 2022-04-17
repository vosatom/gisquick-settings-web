<template>
  <layers-table
    label="Name"
    :items="layers"
    :collapsed.sync="collapsed"
    :columns="columns"
  >
    <!-- eslint-disable-next-line -->
    <template v-slot:leaf.queryable="{ item }">
      <div class="f-row-ac f-justify-center">
        <v-icon :name="flags[item.id].has('query') ? 'check' : 'dash'"/>
      </div>
    </template>
    <!-- eslint-disable-next-line -->
    <template v-slot:leaf.wfs="{ item }">
      <template v-if="item.type === 'VectorLayer'">
      <!-- <div v-if="item.type === 'VectorLayer'" class="f-row-ac f-justify-center"> -->
        <v-icon name="visibility" :color="wfsFlags[item.id].has('query') ? '' : 'grey'"/>
        <!-- <v-icon name="pencil" :color="item.options.wfs.update ? '' : 'grey'"/> -->
        <v-icon name="pencil" :color="wfsFlags[item.id].has('update') ? '' : 'grey'"/>
        <!-- <v-icon name="plus" :color="item.options.wfs.insert ? '' : 'grey'"/> -->
        <v-icon name="plus" :color="wfsFlags[item.id].has('insert') ? '' : 'grey'"/>
        <!-- <v-icon name="delete_forever" :color="item.options.wfs.delete ? '' : 'grey'"/> -->
        <v-icon name="delete_forever" :color="wfsFlags[item.id].has('delete') ? '' : 'grey'"/>
      <!-- </div> -->
      </template>
    </template>

    <!-- eslint-disable-next-line -->
    <template v-slot:leaf.projection="{ item, value }">
      <span v-if="item.projection" v-text="item.projection"/>
      <v-icon v-else name="warning" color="orange"/>
    </template>

    <!-- eslint-disable-next-line -->
    <template v-slot:leaf.source="{ item }">
      <template v-if="sourceInfo[item.id]">
        <v-icon size="24" :name="sourceIcons[sourceInfo[item.id].type]"/>
        <span class="single-line">{{ sourceInfo[item.id].text }}</span>

        <div v-if="sourceInfo[item.id].error" class="f-row-ac mx-2">
          <v-icon name="warning" color="red"/>
          <v-tooltip align="c;bb">
            <span v-text="sourceInfo[item.id].error"/>
          </v-tooltip>
        </div>
      </template>
    </template>
  </layers-table>
</template>

<script>
import path from 'path'
import mapValues from 'lodash/mapValues'
import LayersTable from '@/components/LayersTable.vue'
import { transformLayersTree, transformLayersTree2 } from '@/utils/layers'

const SourceIcons = {
  file: 'hdd',
  postgres: 'storage',
  url: 'globe',
}

export default {
  components: { LayersTable },
  props: {
    meta: Object
  },
  data () {
    return {
      collapsed: []
    }
  },
  computed: {
    columns () {
      return [
        {
          text: 'Queryable',
          value: 'queryable',
          align: 'center'
        },
        {
          text: 'WFS',
          value: 'wfs',
          align: 'center'
        },
        {
          text: 'CRS',
          value: 'projection',
          align: 'left'
        },
        {
          text: 'Provider',
          value: 'provider_type',
          align: 'left'
        },
        {
          text: 'Source',
          value: 'source',
          align: 'left'
        }
      ]
    },
    layers () {
      if (this.meta) {
        const { layers_tree, layers } = this.meta
        return transformLayersTree2(layers_tree, id => layers[id], (name, layers) => ({ name, layers }))
        // return transformLayersTree(layers_tree, l => layers[l.id], (g, layers) => ({ name: g.name, layers }))
      }
      return []
    },
    sourceIcons () {
      return SourceIcons
    },
    sourceInfo () {
      return mapValues(this.meta.layers, l => {
        let info
        const { provider_type: provider, source_params: source } = l
        if (provider === 'wms') {
          info = {
            type: 'url',
            text: source.url
          }
        } else if (provider === 'postgres') {
          const hostname = source.host + (source.port ? `:${source.port}` : '')
          info = {
            type: 'postgres',
            text: `${hostname}, dbname=${source.dbname}, table=${source.table}`
          }
        // } else if (provider === 'gdal' || provider === 'ogr' || provider === 'spatialite') {
        } else if (source.file) {
          info = {
            type: 'file',
            text: source.file
          }
          if (source.file.startsWith('..')) {
            info.error = "Data file is located outside of project's directory"
          }
        } else {
          info = {
            type: '',
            text: 'Unknown'
          }
        }
        return info
      })
    },
    flags () {
      return mapValues(this.meta.layers, l => new Set(l.flags))
    },
    wfsFlags () {
      return mapValues(this.meta.layers, l => new Set(l.options?.wfs ?? []))
    }
  }
}
</script>

<style lang="scss" scoped>
td .icon {
  margin: 0 2px;
}
</style>
