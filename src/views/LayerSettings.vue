<template>
  <div class="page-content">
    <portal v-if="pageVisible" to="left-panel">
      <div class="nav-header f-row-ac dark">
        <div class="f-row-ac f-grow m-1">
          <v-icon name="layers2" size="24" color="yellow"/>
          <span class="title f-grow mx-2" v-text="layerMeta.title"/>
        </div>
        <router-link class="f-row-ac mx-2" :to="{name: 'layers'}">
          <v-icon name="upward_arrow" class="mr-2"/>
        </router-link>
      </div>
      <v-list
        class="nav-panel dark flat f-grow m-0"
        :items="menuItems"
        @click-item="scrollToSection"
      >
        <template v-slot:item="{ item }">
          <div class="v-separator"/>
          <v-icon class="mx-2" :name="item.icon"/>
          <span v-text="item.text"/>
        </template>
      </v-list>
    </portal>
    <section ref="general" class="card info f-col">
      <div class="header f-row-ac px-2 dark">
        <span class="title">General</span>
      </div>
      <div class="info-layout">
        <div class="f-col">
          <span class="subheader">Information</span>
          <div class="info-grid i-card shadow-1 m-2">
            <span class="label">Name</span>
            <span v-text="layerMeta.name"/>
            <span class="label">Type</span>
            <span v-if="layerMeta.type === 'VectorLayer'">
              {{ layerMeta.type }} ({{ layerMeta.options.wkb_type }})
            </span>
            <span v-else v-text="layerMeta.type"/>
            <span class="label">Projection</span>
            <span v-text="layerMeta.projection"/>
            <span class="label">Provider</span>
            <span v-text="layerMeta.provider_type"/>
            <template v-if="layerWFS">
              <span class="label">WFS</span>
              <div class="wfs-flags f-row-ac">
                <v-icon name="visibility" :color="layerWFS.query ? '' : 'grey'"/>
                <v-icon name="pencil" :color="layerWFS.update ? '' : 'grey'"/>
                <v-icon name="plus" :color="layerWFS.insert ? '' : 'grey'"/>
                <v-icon name="delete_forever" :color="layerWFS.delete ? '' : 'grey'"/>
              </div>
            </template>
            <div class="separator text">Data source</div>
            <div class="separator line"/>
            <template v-for="(v, k) in sourceParams">
              <span :key="`spl-${k}`" class="label" v-text="k"/>
              <span :key="`spv-${k}`" v-text="v"/>
            </template>
          </div>

          <div v-if="hasCustomConfig" class="custom-config f-col my-2">
            <!-- <div class="subheader">Settings</div> -->
            <!-- <v-checkbox label="Legend visible" :value="true"/> -->
            <!-- <v-switch class="round" :value="true" label="Map legend"/> -->

            <!-- <div class="legend-field f-row-ac">
              <span class="mx-2 f-grow">Map legend</span>
              <v-switch class="round" :value="true"/>
            </div> -->

            <v-text-field
              v-if="layerMeta.provider_type === 'vectortile'"
              class="filled"
              label="Style URL"
              lazy
              :value="layerConfig.style_url"
              @input="setOptSetting(layerSettings, 'custom.style_url', $event)"
            />
          </div>
        </div>

        <div class="f-col f-grow">
          <span class="subheader">Flags</span>
          <layer-flags
            :is-base-layer="isBaseLayer"
            class="i-card shadow-1 m-2 light"
            :layer-meta="layerMeta"
            :layer-settings="settings.layers[layerId]"
          />
          <div class="i-card shadow-1 f-row-ac mx-2 my-2 light">
            <v-icon class="mx-2 ml-4" name="legend"/>
            <span class="mx-2 f-grow">Map legend</span>
            <v-switch
              class="round"
              :value="!layerSettings.legend_disabled"
              @input="setLegendVisibility"
            />
          </div>
        </div>
      </div>
    </section>
    <div class="f-col">
      <layer-attributes
        v-if="layerMeta.attributes && isLayerQueryable"
        :key="layerId"
        :project="project"
        :settings="settings"
        :layer-id="layerId"
      />
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import has from 'lodash/has'
import pickBy from 'lodash/pickBy'
import LayerAttributes from '@/components/LayerAttributes.vue'
import LayerFlags from '@/components/LayerFlagsList.vue'
import Page from '@/mixins/Page'
import { lookupTable } from '@/utils'
import { layersList } from '@/utils/layers'

window.isEmpty = isEmpty
export default {
  name: 'LayerSettings',
  mixins: [ Page ],
  components: { LayerAttributes, LayerFlags },
  props: {
    project: Object,
    settings: Object,
    layerId: String
  },
  computed: {
    layerMeta () {
      return this.project.meta.layers[this.layerId]
    },
    layerSettings () {
      return this.settings.layers[this.layerId]
    },
    hasCustomConfig () {
      const { provider_type } = this.layerMeta
      if (provider_type === 'vectortile') {
        return true
      }
      return false
    },
    layerConfig () {
      return this.layerSettings?.custom ?? {}
    },
    layerWFS () {
      return lookupTable(this.layerMeta.options?.wfs)
    },
    layer () {
      const { id, name } = this.project.meta.layers[this.layerId]
      const { attributes: _, ...settings } = this.layerSettings
      return {
        id,
        name,
        attributes: this.finalAttributes,
        ...settings
      }
    },
    isBaseLayer () {
      const tree = this.project.meta.layers_tree.filter(i => this.settings.base_layers.includes(i.id || i.name))
      return layersList(tree).some(l => l.id === this.layerId)
    },
    sourceParams () {
      // return this.layerMeta.source_params
      return pickBy(this.layerMeta.source_params)
    },
    menuItems () {
      const items = [{
        key: 'general',
        icon: 'settings',
        text: 'General'
      }]
      if (this.layerMeta.attributes) {
        items.push({
          key: 'attributes',
          icon: 'attribute-table2',
          text: 'Attributes'
        }, {
          key: 'preview',
          icon: 'visibility',
          text: 'Data Preview'
        })
      }
      return items
    },
    isLayerQueryable () {
      return this.layerMeta.flags.includes('query')
    }
  },
  methods: {
    scrollToSection (item) {
      const sections = this.$el.querySelectorAll('section')
      const index = this.menuItems.indexOf(item)
      sections[index]?.scrollIntoView({ behavior: 'smooth' })
    },
    setSetting (obj, path, value) {
      if (path.includes('.')) {
        const paths = path.split('.')
        const lastPath = paths.pop()
        let parent = obj
        for (const key of paths) {
          if (!has(parent, key)) {
            this.$set(parent, key, {})
          }
          parent = parent[key]
        }
        this.$set(parent, lastPath, value)
      } else {
        this.$set(obj, path, value)
      }
    },
    setOptSetting (obj, path, value) {
      if (!value || (typeof value === 'object' && isEmpty(value))) {
        if (path.includes('.')) {
          const lastDot = path.lastIndexOf('.')
          const parentPath = path.substr(0, lastDot)
          const lastPath = path.substr(lastDot + 1)
          this.$delete(get(obj, parentPath), lastPath)
        } else {
          this.$delete(obj, path)
        }
      } else {
        this.setSetting(obj, path, value)
      }
    },
    setLegendVisibility (visible) {
      this.setOptSetting(this.layerSettings, 'legend_disabled', !visible)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/card.scss';
@import '@/info-grid.scss';

::v-deep .card {
  // margin: 6px 1px;
  margin: 0 1px 12px 1px;
}
.header {
  // background-color: #5f5f5f;
  border-top: 1px solid #ccc;
  // background-color: var(--color-primary);

  a {
    color: inherit;
    // color: var(--color-primary);

    text-decoration: none;
    font-weight: 500;
  }
  .active {
    // color: var(--color-yellow);
    color: var(--color-primary);
    font-weight: 500;
  }
  .title {
    margin: 0 4px;
  }
}
.list.nav-panel {
  padding: 4px;
  background-color: #444;
  // color: #fff;
  ::v-deep {
    .item {
      padding-left: 0;
      .v-separator {
        width: 4px;
        // width: 2px;
        opacity: 0.25;
      }
    }
  }
}
.nav-header {
  height: 43px;
  border-bottom: 1px solid #333;
  color: var(--color-yellow);
  .title {
    font-size: 16px;
    // font-weight: 500;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
}
.info-layout {
  display: grid;
  grid-template-columns: 3fr minmax(200px, 1fr);
  // grid-template-columns: 3fr 1fr;
  padding: 6px;
  gap: 12px;
  // background-color: #E4DCCF;
  // background-color: #FDF6EC;
  padding-bottom: 12px;
}
.label {
  font-weight: 500;
  // text-transform: uppercase;
}
.subheader {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
  padding: 0 6px;
  line-height: 1;
  text-transform: uppercase;
}

section.info {
  // background-color: rgb(102, 11, 23);
  // background-color: #f3f3f3;
  // background-color: rgba(var(--color-primary-rgb), 0.1);
  margin-bottom: 0;
}
.i-card {
  background-color: #fff;
  border: 1px solid #d0d0d0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  &.dark {
    background-color: rgb(76, 97, 96);
  }
  &.light {
    background-color: #f7f7f7;
    // background-color: #FDF6EC;
    // background-color: rgba(var(--color-primary-rgb), 0.065);
  }
}
.card.info {
  box-shadow: none;
}
.source-table {
  border-collapse: collapse;
  align-self: flex-start;
  border-radius: 3px;
  overflow: hidden;
  // border: 1px solid #ddd;
  min-width: 300px;

  td {
    border: 1px solid #ddd;
    padding: 2px 8px;
    &.label {
      font-weight: 500;
      background-color: #eee;
      text-align: left;
    }
  }
}
.wfs-flags {
  .icon {
    margin-right: 3px;
  }
}
.legend-field {
  max-width: 360px;
}
</style>
