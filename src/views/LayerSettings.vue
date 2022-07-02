<template>
  <div class="page-content">
    <portal v-if="pageVisible" to="left-panel">
      <div class="nav-header f-row-ac dark">
        <div class="f-row-ac f-grow m-1">
          <v-icon name="layers2" size="24" color="yellow"/>
          <!-- <strong class="f-grow mx-2">Layer properties - {{ layerMeta.title }}</strong> -->
          <!-- Layer properties - <strong class="mx-2">{{ layerMeta.title }}</strong> -->
          <span class="title f-grow mx-2" v-text="layerMeta.title"/>
        </div>
        <router-link class="f-row-ac mx-2" :to="{name: 'layers'}">
          <v-icon name="upward_arrow" class="mr-2"/>
          <!-- <span>Layers</span> -->
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

    <!-- <portal to="menu">
      <v-btn class="flat" :to="{name: 'layers'}">
        <v-icon name="arrow-backward" class="mr-2"/>
        <span>Layers</span>
      </v-btn>
    </portal> -->

    <!-- <div class="header f-row-ac p-2 mb-2">
      <v-icon name="layers2" class="mr-2"/>
      <span class="active" v-text="layerMeta.title"/>
      <div class="f-grow"/>
      <router-link class="f-row-ac mx-2" :to="{name: 'layers'}"><v-icon name="arrow-backward" class="mr-2"/>Back to Layers</router-link>
    </div> -->

    <!-- <div class="header f-row-ac p-2 mb-2">
      <span>
        <span class="active" v-text="layerMeta.title"/>
      </span>
       <v-icon name="layers2" class="ml-2"/>
      <div class="f-grow"/>
      <router-link class="f-row-ac mx-2" :to="{name: 'layers'}"><v-icon name="arrow-backward" class="mr-2"/>Back to Layers</router-link>
    </div> -->

    <div v-if="false" class="header p-2 mb-2">
      <router-link class="f-row-ac mx-2" :to="{name: 'layers'}"><v-icon name="arrow-backward" class="mr-2"/>Back to Layers</router-link>
      <div class="f-row-ac">
        <v-icon name="layers2"/>
        <!-- <strong class="mx-2">Layer properties - {{ layerMeta.title }}</strong> -->
        <!-- Layer properties - <strong class="mx-2">{{ layerMeta.title }}</strong> -->
        <strong class="mx-2">{{ layerMeta.title }}</strong>
      </div>
    </div>

    <section ref="general" class="card f-col">
      <div class="header f-row-ac px-2 dark">
        <span class="title">Genaral</span>
      </div>
      <div class="info-grid">
        <span class="label">Name</span>
        <span v-text="layerMeta.name"/>
        <span class="label">Type</span>
        <span v-text="layerMeta.type"/>
        <span class="label">Provider</span>
        <span v-text="layerMeta.provider_type"/>
        <span class="label">Source</span>
        <table class="source-table">
          <tbody>
            <tr v-for="(v, k) in layerMeta.source_params" :key="k">
              <td class="label" v-text="k" width="1"/>
              <td v-text="v"/>
            </tr>
          </tbody>
        </table>
        <span class="label">Extent</span>
        <span v-text="layerMeta.extent.join(', ')"/>
        <span class="label">Projection</span>
        <span v-text="layerMeta.projection"/>
        <span class="label">Legend</span>
        <!-- <v-checkbox label="Legend"/> -->
      </div>
    </section>
    <div class="f-col">
      <!-- <div class="f-row">
        <span class="m-2">Server name: <strong>{{ layerMeta.name }}</strong></span>
        <v-checkbox label="Legend"/>
      </div> -->
      <layer-attributes
        v-if="layerMeta.attributes"
        :project="project"
        :settings="settings"
        :layer-id="layerId"
      />
    </div>
  </div>
</template>

<script>
import LayerAttributes from '@/components/LayerAttributes.vue'
import Page from '@/mixins/Page'

export default {
  name: 'LayerSettings',
  mixins: [ Page ],
  components: { LayerAttributes },
  props: {
    project: Object,
    settings: Object,
    layerId: String
  },
  data () {
    return {
    }
  },
  computed: {
    layerMeta () {
      return this.project.meta.layers[this.layerId]
    },
    layerSettings () {
      return this.settings.layers[this.layerId]
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
    menuItems () {
      return [
        {
          key: 'general',
          icon: 'settings',
          text: 'General'
        }, {
          key: 'attributes',
          icon: 'attribute-table2',
          text: 'Attributes'
        }, {
          key: 'preview',
          icon: 'visibility',
          text: 'Data Preview'
        }
      ]
    }
  },
  methods: {
    scrollToSection (item) {
      const sections = this.$el.querySelectorAll('section')
      const index = this.menuItems.indexOf(item)
      sections[index]?.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/card.scss';

.header {
  // background-color: #5f5f5f;
  background-color: #e2e2e2;
  border: 1px solid #ccc;
  // background-color: var(--color-primary);

  display: grid;
  grid-template-columns: 1fr auto 1fr;

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
.info-grid {
  align-self: flex-start;
  display: grid;
  grid-template-columns: auto auto;
  // align-items: center;
  > * {
    margin: 6px;
  }
  .label {
    font-weight: 500;
    &::after {
      content: ":";
    }
  }
}
.source-table {
  border-collapse: collapse;
  align-self: flex-start;
  border-radius: 3px;
  overflow: hidden;
  // border: 1px solid #ddd;

  td {
    border: 1px solid #ddd;
    padding: 2px 8px;
    &.label {
      font-weight: 500;
      background-color: #eee;
    }
  }
}
</style>
