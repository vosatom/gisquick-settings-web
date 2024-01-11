<template>
  <div>
    <div>
      <layers-table
        key="overlays"
        label="Search attributes"
        :detail="attributesDetail"
        :items="overlays"
        :columns="overlaysColumns"
        :collapsed.sync="collapsedLayers"
        @click:row="toggleAttributes"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:header.perms="{ text }">
          <th class="header text-right" width="1">
            <v-btn @click="setNames">Prefill</v-btn>
          </th>
        </template>

        <!-- eslint-disable-next-line -->
        <template v-slot:leaf.perms="{ item }">
          <template v-if="item.attributes">
            {{ config.layers?.[item.name]?.attributes.length || '' }}

            <v-btn
              class="icon flat"
              :color="attributesDetail === item.id ? 'orange' : '#777'"
              @click="toggleAttributes(item)"
            >
              <v-icon name="arrow-down" size="12" class="ml-2" opacity="0.5" />
            </v-btn>
          </template>
          <div v-else class="end-padding" />
        </template>

        <!-- eslint-disable-next-line -->
        <template v-slot:detail="{ layer, indentStyle }">
          <tr :key="`header:${layer.id}`">
            <td class="detail-header" :style="indentStyle" :colspan="2">
              <span class="f-row-ac f-grow">Attributes</span>
            </td>
          </tr>
          <tr
            v-for="attr in layer.attributes.filter(
              (attr) => attr.type === 'text',
            )"
            :key="attr.name"
            class="detail"
          >
            <td>
              <div :style="indentStyle">
                <v-checkbox
                  :label="attr.alias || attr.name"
                  :value="
                    config.layers?.[layer.name]?.attributes.includes(
                      attr.name,
                    ) ?? false
                  "
                  @input="toggleLayer(layer, attr)"
                />
              </div>
            </td>
            <td>
              <div :style="indentStyle" class="f-row-ac f-justify-end">
                <v-btn
                  class="btn icon flat styled"
                  :color="
                    config.layers?.[layer.name]?.mainAttribute === attr.name
                      ? 'primary'
                      : '#777'
                  "
                  @click="setMainAttribute(layer, attr)"
                >
                  <v-icon name="visibility" />
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </layers-table>
    </div>
  </div>
</template>

<script>
// Based on src/views/ProjectAccess.vue
import LayersTable from '@/components/LayersTable.vue'

import Vue from 'vue'
import { transformLayersTree } from '@/utils/layers'

function isLayerSearchable(layer) {
  return (
    layer.flags?.includes('query') &&
    (layer.provider_type === 'postgres' ||
      layer.provider_type === 'ogr' ||
      layer.provider_type === 'spatialite')
  )
}

export default {
  name: 'ProjectAccess',
  components: {
    LayersTable,
  },
  props: {
    project: Object,
    settings: Object,
    config: Object,
  },
  data() {
    return {
      // auth: 'users',
      users: [],
      collapsedLayers: [],
      selectedIndex: 0,
      attributesDetail: null,
      linkedLayersGroup: null,
    }
  },
  computed: {
    overlays() {
      const meta = this.project.meta
      const overlaysTree = meta.layers_tree.filter(
        (i) => !this.settings.base_layers.includes(i.id || i.name),
      )
      return transformLayersTree(
        overlaysTree,
        (l) => ({ ...meta.layers[l.id] }),
        (g, layers) => ({
          name: g.name,
          layers: layers.filter(isLayerSearchable),
        }),
      )
    },
    overlaysColumns() {
      return [
        {
          text: '',
          value: 'perms',
          align: 'right',
          header: { width: 1 },
        },
      ]
    },
  },
  methods: {
    toggleAttributes(layer) {
      if (layer.attributes) {
        this.attributesDetail =
          this.attributesDetail === layer.id ? null : layer.id
      }
    },
    setNames() {
      const newValues = { ...this.config.layers }
      Object.entries(this.project.meta.layers).forEach(([layerId, layer]) => {
        if (!layer.flags?.includes('query')) return
        const layerMeta = this.project.meta.layers[layerId]
        const layerName = layerMeta.name
        if (!layerMeta || !isLayerSearchable(layerMeta)) return

        layerMeta.attributes?.forEach((attr) => {
          if (
            attr.type === 'text' &&
            (attr.name === 'name' ||
              attr.name === 'title' ||
              attr.name === 'text')
          ) {
            if (!newValues[layerName])
              newValues[layerName] = {
                mainAttribute: attr.name,
                attributes: [],
              }

            if (!newValues[layerName].attributes.includes(attr.name)) {
              newValues[layerName].attributes = newValues[
                layerName
              ].attributes.concat(attr.name)
            }
          }
        })
      })

      Vue.set(this.config, 'layers', newValues)
    },

    updateValue(layer, futureValue) {
      if (!this.config.layers) {
        Vue.set(this.config, 'layers', {})
      }
      const item = this.config.layers?.[layer.name]
      let newValue = {
        mainAttribute: futureValue.mainAttribute ?? item.mainAttribute ?? '',
        attributes: futureValue.attributes ?? item.attributes ?? [],
      }
      if (newValue.attributes.length) {
        Vue.set(this.config.layers, layer.name, newValue)
      } else {
        Vue.delete(this.config.layers, layer.name)
      }
    },

    toggleLayer(layer, attr) {
      let newValue = {
        attributes: this.config.layers?.[layer.name].attributes ?? [],
      }
      const exists = newValue.attributes.includes(attr.name)
      if (exists) {
        newValue.attributes = newValue.attributes.filter(
          (attrName) => attrName !== attr.name,
        )
      } else {
        newValue.attributes = newValue.attributes.concat(attr.name)
      }

      this.updateValue(layer, newValue)
    },
    setMainAttribute(layer, attr) {
      let newValue = {
        mainAttribute: attr.name,
      }
      this.updateValue(layer, newValue)
    },
  },
}
</script>

<style lang="scss" scoped>
.users-list {
  // max-width: 400px;
  display: flex;
  flex-direction: column;
}
.l-col2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  .switch {
    align-self: end;
    justify-self: start;
  }
}
// .l-col2 {
//   display: flex;
//   flex-direction: column;
//   max-width: 460px;
// }

.roles-settings {
  display: grid;
  grid-template-columns: 275px 1fr;
  gap: 6px;
  .roles-panel {
    grid-row: 1 / 3;
    align-self: start;
    grid-column: 1 / 2;
    position: sticky;
    top: 0;
    .label {
      font-weight: 500;
    }
  }
}
.access-settings {
  // border: 1px solid var(--border-color);
  // &.simple {
  //   display: flex;
  //   flex-direction: column;
  // }
  &.roles {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 6px;
    .roles-panel {
      grid-row: 1 / 3;
      align-self: start;
      grid-column: 1 / 2;
      position: sticky;
      top: 0;
      .label {
        font-weight: 500;
      }
    }
  }
}
.role-config {
  .i-field {
    max-width: 500px;
  }
}
.tabs {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  .tab {
    height: 32px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: #eee;
    &.active {
      background-color: var(--color-primary);
      color: #fff;
    }
  }
}
.toolbar {
  // position: sticky;
  // top: 0;
  background-color: #eee;
  border: 1px solid #ccc;
  border-bottom: none;
}
.error {
  color: var(--color-red);
  --icon-color: currentColor;
}
.tabs-header {
  background-color: #eee;
  height: 32px;
  .tab {
    padding-inline: 6px;
    height: inherit;
    // padding: 3px;
    display: flex;
    align-items: center;
    &.active {
      color: #fff;
      background-color: var(--color-primary);
    }
  }
}
.desc-text {
  opacity: 0.6;
  font-size: 13.5px;
}
.layers-table {
  margin: 6px;
  border: 1px solid #ddd;
  border-top: none;
  // .detail {
  //   .flags {
  //     margin-right: 39px;
  //   }
  // }
  :deep(tr.detail-header):hover {
    background-color: rgba(var(--color-orange-rgb), 0.05);
  }
  .group-link {
    margin-left: auto;
  }
}
.end-padding {
  width: 40px;
}
.detail-header {
  padding-right: 0 !important;
  font-size: 13px;
  font-weight: 500;
  > span {
    padding-inline: 6px;
    margin-left: 6px;
    height: inherit;
  }
}
.detail-header,
.attrs-flags-panel,
.geometry-panel {
  border-block: 1px solid #eee;
  background-color: rgba(var(--color-orange-rgb), 0.1);
  box-sizing: content-box;
}
</style>
