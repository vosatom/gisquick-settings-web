<template>
  <div class="page-content">
    <!-- <portal to="menu">
      <v-btn class="flat" :to="{name: 'layers'}">
        <v-icon name="arrow-backward" class="mr-2"/>
        <span>Layers</span>
      </v-btn>
    </portal> -->
    <v-dialog ref="formattersDialog" title="Formatters">
      <template v-slot="{ data }">
        <formatters-editor :settings="data"/>
      </template>
    </v-dialog>
    <div class="header xdark f-row-ac p-2 mb-2">
      <!-- <strong>Layer:</strong> {{ layerMeta.title }} -->
      <router-link :to="{name: 'layers'}">Layers</router-link>
      <v-icon name="arrow-right" class="mx-2" size="12" fill-opacity="0.7"/>
      <span class="active" v-text="layerMeta.title"/>
      <!-- <strong>capabilities:</strong> {{ capabilities }} -->
    </div>

    <v-table
      :columns="columns"
      :items="attributes"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:header(info_panel)="{ column }">
        <v-checkbox
          :label="column.label"
          class="f-justify-center"
          :value="layerSettings.info_panel_fields.length > 0"
          @input="toggleAll('info_panel_fields')"
        />
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:header(attr_table)="{ column }">
        <v-checkbox
          :label="column.label"
          class="xf-justify-center"
          :value="layerSettings.attr_table_fields.length > 0"
          @input="toggleAll('attr_table_fields')"
        />
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:header(export)="{ column }">
        <v-checkbox
          :label="column.label"
          class="xf-justify-center"
          :value="layerSettings.export_fields && layerSettings.export_fields.length > 0"
          @input="toggleAll('export_fields')"
        />
      </template>

      <!-- eslint-disable-next-line -->
      <template v-slot:cell(widget)="{ item }">
        <div class="f-row-ac f-space-between">
          <span v-if="attrsSettings[item.name] && attrsSettings[item.name].widget">
            {{ widgetMap[attrsSettings[item.name].widget].text }}
          </span>
          <span v-else class="mr-2">{{ item.widget }}</span>
          <v-menu
            aria-label="Settings"
            transition="slide-y"
            align="rr;bb,tt"
            :items="widgets"
            @confirm="setWidget(item, $event)"
          >
            <template v-slot:activator="{ toggle }">
              <v-btn aria-label="Menu" class="icon" @click="toggle">
                <v-icon name="settings"/>
              </v-btn>
            </template>
          </v-menu>
        </div>
      </template>

      <!-- eslint-disable-next-line -->
      <!-- <template v-slot:cell(widget)="{ item }">
        <v-select
          v-if="item.type === 'text'"
          class="filled"
          :items="contentTypes"
          v-model="attrsSettings[item.name].widget"
        />
      </template> -->

      <!-- eslint-disable-next-line -->
      <template v-slot:cell(format)="{ item }">
        <v-select
          v-if="item.type === 'int' || item.type === 'float'"
          placeholder="-"
          :items="numericFormatters"
          :value="attrsSettings[item.name] && attrsSettings[item.name].format"
          @input="setFormatter(item, $event)"
        >
          <template v-slot:append="">
            <span>Add formatter</span>
          </template>
        </v-select>
      </template>

      <!-- eslint-disable-next-line -->
      <template v-slot:cell(attr_table)="{ item }">
        <v-checkbox
          class="xf-justify-center"
          :value="attrTableMap[item.name]"
          @input="toggleAttribute('attr_table_fields', item.name, $event)"
        />
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:cell(info_panel)="{ item }">
        <v-checkbox
          class="f-justify-center"
          :value="infoPanelSet.has(item.name)"
          @input="toggleAttribute('info_panel_fields', item.name, $event)"
        />
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:cell(export)="{ item }">
        <v-checkbox
          class="f-justify-center"
          :value="exportFieldsSet.has(item.name)"
          @input="toggleAttribute('export_fields', item.name, $event)"
        />
      </template>
    </v-table>
    <div class="card">
      <div class="header f-row-ac px-2 dark">
        <span class="title">Info Panel</span>
      </div>
      <div class="info-panel-settings">
        <div class="f-row-ac mx-2">
          <v-select
            label="Component"
            class="filled inline"
            :items="scriptsItems"
            :value="layerSettings.infopanel_component"
            @input="setInfopanelComponent"
          />
          <!-- <span v-text="layerSettings.infopanel_component || 'Generic Info Panel'"/>
          <v-menu
            transition="slide-y"
            align="rr;bb,tt"
            :items="scriptsItems"
            @confirm="setInfopanelComponent"
          >
            <template v-slot:activator="{ toggle }">
              <v-btn aria-label="Menu" class="icon" @click="toggle">
                <v-icon name="settings"/>
              </v-btn>
            </template>
          </v-menu> -->
        </div>
        <component
          v-if="features.length > 0"
          :is="infoPanelComponent"
          class="info-panel f-grow"
          :feature="features[0]"
          :layer="layer"
        />
        <!-- <generic-info-panel
          v-if="features.length > 0"
          class="info-panel f-grow"
          :feature="features[0]"
          :layer="layer"
        /> -->
        <div class="scripts f-col">
          <v-list label="Modules" :items="scriptsList">
            <template v-slot:empty>
              <span>No script modules loaded</span>
            </template>
            <template v-slot:item="{ item }">
              <div class="f-col f-grow">
                <span class="title" v-text="item.module"/>
                <div>Components: {{ item.components.join(', ') }}</div>
                <small>File: <a target="_blank" :href="`/api/project/file/${project.name}/web/${item.path}`" v-text="item.path"/></small>
              </div>
              <v-btn class="icon" @click="deleteScript(item)">
                <v-icon name="delete_forever"/>
              </v-btn>
            </template>
          </v-list>
          <div class="new-script f-row">
            <!-- <v-text-field readonly class="filled" accept=".js" xtype="file" placeholder="Select File" value="name" @input="scriptSelected"/> -->
            <v-file-field
              class="filled"
              accept=".js"
              placeholder="Select File"
              :error="scriptTask.error"
              :value="loadedScript && loadedScript.file"
              @input="scriptSelected"
            >
              <!-- <v-icon slot="prepend" color="#777" name="file-js" size="24" class="mr-1"/> -->
            </v-file-field>
            <v-btn
              class="outlined round"
              xcolor="primary"
              :disabled="!loadedScript"
              @click="uploadScript"
            >
              <!-- <v-icon name="upload" class="mr-2"/> -->
              <span>Upload</span>
            </v-btn>
          </div>
        </div>

      </div>
    </div>
    <div class="card">
      <div class="header f-row-ac px-2 dark">
        <span class="title">Attribute Table</span>
      </div>
      <v-table
        :columns="attributeTableColumns"
        item-key="_id"
        :items="tableData"
      >
        <template v-slot:header(default)="{ column }">
          <div
            draggable="true"
            :class="{drop: dragOver === column}"
            v-text="column.label"
            @dragstart="onDragStart($event, column)"
            @dragover.prevent="onDragOver(column)"
            @dragend="onDragEnd(column)"
            @drop="onDrop(column)"
          />
        </template>
        <template v-for="(slot, name) in attrTableSlots" v-slot:[`cell(${name})`]="{ item }">
          <component
            :key="name"
            :is="slot.component"
            :attribute="slot.attribute"
            :value="item[name]"
          />
        </template>
      </v-table>
    </div>
  </div>
</template>

<script>
import keyBy from 'lodash/keyBy'
import GeoJSON from 'ol/format/GeoJSON'

import FormattersEditor from '@/components/ForrmatersEditor.vue'
import GenericInfoPanel from '@/components/GenericInfopanel.vue'
import { layerFeaturesQuery } from '@/map/featureinfo'
import { valueMapItems } from '@/adapters/attributes'
import { externalComponent } from '@/components-loader'
import { TaskState, watchTask } from '@/tasks'

export async function loadUmdScript (url, filename) {
  return new Promise((resolve, reject) => {
    const name = filename.match(/^(.*?)\.umd\.(.+\.)?js$/)?.[1]
    if (!name) {
      reject('Invalid JavaScript module, expected UMD module')
    }
    const script = document.createElement('script')
    script.async = true
    script.addEventListener('load', () => {
      resolve({
        moduleName: name,
        element: script,
        module: window[name]
      })
    })
    script.addEventListener('error', () => {
      const err = new Error(`Error loading ${url}`)
      reject(err)
    })
    script.src = url
    document.head.appendChild(script)
  })
}

const ValueMapWidget = {
  props: {
    attribute: Object,
    value: {}
  },
  computed: {
    map () {
      const items = valueMapItems(this.attribute)
      return items.reduce((data, item) => (data[item.value] = item.text, data), {})
    }
  },
  render () {
    return <span>{this.value} - {this.map[this.value]}</span>
  }
}

export default {
  name: 'LayerAttributes',
  components: { FormattersEditor },
  props: {
    project: Object,
    settings: Object,
    layerId: String
  },
  data () {
    return {
      features: [],
      dragSource: null,
      dragOver: null,
      loadedScript: null,
      scriptTask: TaskState()
    }
  },
  computed: {
    layerMeta () {
      return this.project.meta.layers[this.layerId]
    },
    layerSettings () {
      return this.settings.layers[this.layerId]
    },
    capabilities () {
      const lmeta = this.layerMeta
      const metaFlags = new Set(lmeta.flags)
      const flagsSet = new Set(this.layerSettings.flags || [])
      const layerVisible = !flagsSet.has('excluded') && !flagsSet.has('hidden')
      const isVectorLayer = lmeta.type === 'VectorLayer'

      const queryable = layerVisible && metaFlags.has('query') && flagsSet.has('query')
      return {
        identify: queryable,
        export: queryable && isVectorLayer && lmeta.options.wfs.includes('query') && flagsSet.has('export')
      }
    },
    columns () {
      return [
        {
          key: 'name',
          label: 'Name'
        }, {
          key: 'alias',
          label: 'Alias'
        }, {
          key: 'type',
          label: 'Type'
        }, {
          key: 'widget',
          label: 'Widget'
        }, {
          key: 'format',
          label: 'Formatting'
        }, {
          key: 'attr_table',
          label: 'Attribute Table',
          header: { width: 1 }
          // header: { align: 'center' }
        }, {
          key: 'info_panel',
          label: 'Info Panel',
          header: { align: 'center', width: 1 }
        }, this.capabilities.export && {
          key: 'export',
          label: 'Export',
          header: { align: 'center', width: 1 }
        }
      ].filter(c => c)
    },
    contentTypes () {
      return [
        {
          text: 'Text',
          value: null
        }, {
          text: 'Hyperlink',
          value: 'url'
        }, {
          text: 'Image',
          value: 'image/*'
        }, {
          text: 'Media image file',
          value: 'media;image/*'
        }
      ]
    },
    numericFormatters () {
      const defined = this.settings.formatters ?? []
      return [
        ...defined.map(i => ({ text: i.name, value: i.name })),
        // { separator: true, text: 'Action' },
        { separator: true },
        { text: 'Manage formatters', value: '__manage__', icon: 'settings' }
      ]
    },
    widgets () {
      return [
        { text: 'QGIS', value: null },
        { text: 'Gisquick', separator: true },
        { text: 'Hyperlink', value: 'url' },
        { text: 'Image', value: 'image/*' },
        { text: 'Media Image', value: 'media;image/*' }
      ]
    },
    widgetMap () {
      return keyBy(this.widgets.filter(w => !w.separator), 'value')
    },
    attributes () {
      return this.project.meta.layers[this.layerId].attributes
    },
    attrsMap () {
      return keyBy(this.attributes, 'name')
    },
    attrsSettings () {
      return this.layerSettings.attributes ?? {}
    },
    finalAttributes () {
      return this.attributes.map(attr => ({
        ...attr,
        ...this.attrsSettings[attr.name]
      }))
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
    attrTableMap () {
      return this.attributes.reduce((data, attr) => (data[attr.name] = this.layerSettings.attr_table_fields.includes(attr.name), data), {})
    },
    infoPanelSet () {
      return new Set(this.layerSettings.info_panel_fields)
    },
    exportFieldsSet () {
      return new Set(this.layerSettings.export_fields)
    },
    infoPanelComponent () {
      const componentName = this.layerSettings.infopanel_component
      if (componentName) {
        return this.loadedScript?.components[componentName] || externalComponent(this.project, componentName)
      }
      return GenericInfoPanel
    },
    attributeTableColumns () {
      const attrsNames = this.layerSettings.attr_table_fields || []
      const attributes = attrsNames.map(n => this.attrsMap[n])
      return attributes.map(attr => ({
        label: attr.alias || attr.name,
        type: attr.type.toLowerCase(),
        key: attr.name,
        header: {
          slot: 'default',
        },
        align: 'left',
        sortable: false
      }))
    },
    tableData () {
      return this.features?.map(f => ({ _id: f.getId(), ...f.getProperties() }))
    },
    attrTableSlots () {
      const slots = {}
      this.finalAttributes.forEach(attr => {
        if (attr.widget === 'ValueMap') {
          slots[attr.name] = {
            component: ValueMapWidget,
            attribute: attr
          }
        }
      })
      return slots
    },
    scriptsList () {
      const { scripts } = this.project
      if (scripts) {
        return Object.entries(scripts).map(([mod, info]) => ({ module: mod, ...info }))
      }
      return []
    },
    scriptsItems () {
      const items = [{ text: 'Generic Info Panel', value: undefined }]
      const { scripts } = this.project
      if (scripts) {
        Object.entries(scripts).forEach(([mod, info]) => {
          items.push({ text: mod, separator: true })
          items.push(...info.components.map(n => ({ text: n, value: n })))
        })
      }
      if (this.loadedScript) {
        items.push({ text: 'Loaded script', separator: true })
        items.push(...this.loadedScript.componentsNames.map(n => ({ text: n, value: n })))
      }
      return items
    }
  },
  mounted () {
    // this.fetchFeatures()
  },
  watch: {
    layerSettings: {
      immediate: true,
      handler (ls) {
        if (!ls.attr_table_fields) {
          this.$set(ls, 'attr_table_fields', this.attributes.map(a => a.name))
        }
        if (!ls.info_panel_fields) {
          this.$set(ls, 'info_panel_fields', this.attributes.map(a => a.name))
        }
        this.attributes.forEach(attr => {
          if (!ls.attributes?.[attr.name]) {
            // console.log('missing attributes settings', attr.name)
            // this.$set(ls.attributes, attr.name, { widget: null })
            // this.$set(ls.attributes, attr.name, { widget: undefined })
          }
        })
      }
    },
    layerId: {
      immediate: true,
      handler: 'fetchFeatures'
    }
  },
  methods: {
    async fetchFeatures () {
      console.log('fetchFeatures', this.layer.name)
      const mapProjection = this.project.meta.projection.code
      const query = layerFeaturesQuery(this.layer)

      const baseParams = {
        VERSION: '1.1.0',
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        OUTPUTFORMAT: 'GeoJSON'
      }

      const headers = { 'Content-Type': 'text/xml' }
      let geojson, featuresCount
      this.loading = true
      try {
        const params = {
          ...baseParams,
          STARTINDEX: 0,
          MAXFEATURES: 5
        }
        const resp = await this.$http.post(`/api/project/map/${this.project.name}`, query, { params, headers })
        geojson = resp.data
      } catch (e) {
        console.error(e)
        return
      } finally {
        this.loading = false
      }

      const parser = new GeoJSON()

      // const features = ShallowArray(parser.readFeatures(geojson, { featureProjection: mapProjection }))
      const features = Object.freeze(parser.readFeatures(geojson, { featureProjection: mapProjection }))
      this.features = features
    },
    onDragStart (e, col) {
      this.dragSource = col
      e.dataTransfer.effectAllowed = 'move'
    },
    onDragOver (col) {
      if (col !== this.dragSource) {
        this.dragOver = col
      }
    },
    onDragEnd (col) {
      this.dragSource = null
      this.dragOver = null
    },
    onDrop (col) {
      const attrs = this.layerSettings.attr_table_fields
      // v1 - swap columns
      // const sIndex = attrs.indexOf(this.dragSource.key)
      // const dIndex = attrs.indexOf(col.key)
      // this.$set(attrs, sIndex, col.key)
      // this.$set(attrs, dIndex, this.dragSource.key)

      // v2
      const sIndex = attrs.indexOf(this.dragSource.key)
      attrs.splice(sIndex, 1)
      const dIndex = attrs.indexOf(col.key)
      attrs.splice(sIndex === dIndex ? dIndex + 1 : dIndex, 0, this.dragSource.key)
    },
    toggleAttribute (field, name, val) {
      if (!this.layerSettings[field]) {
        this.$set(this.layerSettings, field, [])
      }
      const list = this.layerSettings[field]
      if (val) {
        list.push(name)
      } else {
        list.splice(list.indexOf(name), 1)
      }
    },
    setAttributeSetting (attr, key, value) {
      if (!this.layerSettings.attributes) {
        this.$set(this.layerSettings, 'attributes', {})
      }
      if (!this.attrsSettings[attr.name]) {
        this.$set(this.attrsSettings, attr.name, { [key]: value })
      } else {
        this.$set(this.attrsSettings[attr.name], key, value)
      }
    },
    toggleAll (field) {
      if (!this.layerSettings[field]) {
        this.$set(this.layerSettings, field, [])
      }
      this.layerSettings[field] = this.layerSettings[field].length === 0
        ? this.attributes.map(a => a.name)
        : []
    },
    setFormatter (attr, name) {
      if (name === '__manage__') {
        this.$refs.formattersDialog.show(this.settings)
      } else {
        this.setAttributeSetting(attr, 'format', name)
        // if (!this.attrsSettings[attr.name]) {
        //   this.$set(this.attrsSettings, attr.name, { format: name })
        // } else {
        //   this.$set(this.attrsSettings[attr.name], 'format', name)
        // }
      }
    },
    setWidget (attr, item) {
      // this.$set(this.attrsSettings[attr.name], 'widget', item.value)

      // if (item.value) {
      //   this.$set(this.attrsSettings[attr.name], 'widget', item.value)
      // } else {
      //   this.$delete(this.attrsSettings[attr.name], 'widget')
      // }
      this.setAttributeSetting(attr, 'widget', item.value)
      // this.attrsSettings[attr.name].widget = item.value
    },
    setInfopanelComponent (item) {
      console.log('setInfopanelComponent', item)
      this.$set(this.layerSettings, 'infopanel_component', item)

      // this.$set(this.layerSettings, 'infopanel_component', item.value)
    },
    scriptSelected (file) {
      if (this.script) {
        URL.revokeObjectURL(this.script.element.src)
        this.script.element.remove()
        this.script = null
      }
      if (file) {
        const t = this.loadScript(file)
        watchTask(t, this.scriptTask)
      } else {
        this.loadedScript = null
        this.scriptTask = TaskState()
      }
    },
    async loadScript (f) {
      console.log('loadScript', f)
      const objectURL = URL.createObjectURL(f)
      const script = await loadUmdScript(objectURL, f.name)
      let components = script.module.__esModule ? script.module.default : [script.module]
      components = components.filter(c => c.name)
      if (!script.moduleName || components.length < 1) {
        throw new Error('Invalid script module')
      }
      this.script = script
      this.loadedScript = Object.freeze({
        file: f,
        moduleName: script.moduleName,
        components: keyBy(components, 'name'),
        componentsNames: components.map(c => c.name)
      })
    },
    async uploadScript () {
      const { file, moduleName, componentsNames: components } = this.loadedScript
      const form = new FormData()
      const info = { module: moduleName, path: file.name, components }
      form.append('info', JSON.stringify(info))
      form.append('script', file, file.name)
      const t = this.$http.post(`/api/project/script/${this.project.name}`, form)
      const { data: scripts } = await watchTask(t, this.scriptTask, { errorHandler: err => err.response?.data?.message || 'Failed to upload file' })
      if (this.scriptTask.success) {
        this.project.scripts = scripts
        this.loadedScript = null
      }
      // try {
      //   const { data: scripts } = this.$http.post(`/api/project/script/${this.project.name}`, form)
      //   this.project.scripts = scripts
      //   this.loadedScript = null
      //   this.uploadError = null
      // } catch (err) {
      //   this.uploadError = 'Failed to upload file'
      // }
    },
    async deleteScript (item) {
      const { data: scripts } = await this.$http.delete(`/api/project/script/${this.project.name}`, { data: [item.module] })
      this.project.scripts = scripts
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/card.scss';

.card {
  margin-block: 12px;
  margin-inline: 4px;
}
.table-container {
  border: 1px solid var(--border-color);
  .select {
    margin: 3px 0;
    ::v-deep .input {
      height: 30px;
    }
  }
}
.header {
  // background-color: #5f5f5f;
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
}
.drop {
  // background-color: var(--color-primary);
  opacity: 0.3;
}
.info-panel-settings {
  display: grid;
  grid-template-columns: minmax(0, 500px) 1fr;
  grid-template-rows: auto 1fr;
  .scripts {
    grid-area: 1 / 2 / 3 / 3;
  }
}
.info-panel {
  max-width: 500px;
}
.scripts {
  ::v-deep .item {
    display: grid;
    grid-template-columns: 1fr auto;
  }
  .title {
    font-size: 18px;
    font-weight: 500;
  }
  a {
    color: var(--color-primary);
  }
}
.formatters {
  min-width: 400px;
  max-width: calc(100vw - 24px);
  width: 700px;
  // width: clamp(100px, 600px, 90vw);
}
</style>
