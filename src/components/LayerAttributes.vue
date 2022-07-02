<template>
  <div class="f-col">
    <v-dialog ref="formattersDialog" title="Formatters">
      <template v-slot="{ data }">
        <formatters-editor :settings="data"/>
      </template>
    </v-dialog>
    <section class="card">
      <div class="header f-row-ac px-2 dark">
        <span class="title">Attributes</span>
        <div class="f-grow"/>
        <v-select
          v-if="orderLayout"
          class="inline filled"
          color="orange"
          label="Layout"
          :items="orderLayouts"
          v-model="orderLayout"
        />
        <v-checkbox
          color="orange"
          label="Hide excluded"
          v-model="filterExcluded"
        />
        <div class="v-separator"/>
        <v-menu
          aria-label="Project actions"
          transition="slide-y"
          align="rr;bb,tt"
          content-class="popup-menu"
          :items="attributesMenu"
        >
          <template v-slot:activator="{ toggle }">
            <v-btn aria-label="Menu" class="icon" @click="toggle">
              <v-icon name="menu-dots"/>
            </v-btn>
          </template>
        </v-menu>
      </div>
      <v-table
        :columns="columns"
        :items="displayAttributes"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:header(visibility)="{ column }">
          <div class="f-row-ac">
            <span v-text="column.label"/>
            <v-btn
              class="icon flat"
              :color="linkedVisibility ? 'primary' : ''"
              @click="linkedVisibility = !linkedVisibility"
            >
              <v-icon name="link-chain" size="18"/>
            </v-btn>
          </div>
        </template>

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
        <!-- <template v-slot:cell(widget)="{ item }">
          <div class="f-row-ac f-space-between">
            <span v-text="(attrsSettings[item.name] && attrsSettings[item.name].widget) || item.widget"/>
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
        </template> -->

        <!-- eslint-disable-next-line -->
        <template v-slot:cell(name)="{ item }">
          <div
            class="f-col py-2"
            v-text="item.name"
            draggable="true"
            @dragstart="attrDragHandlers.dragstart($event, item)"
            @dragover.prevent="attrDragHandlers.dragover($event, item)"
            @drop="attrDragHandlers.drop($event, item)"
          />
        </template>

        <!-- eslint-disable-next-line -->
        <template v-slot:cell(widget)="{ item }">
          <v-select
            class="widget-select"
            :items="widgets"
            :value="attrsSettings[item.name] && attrsSettings[item.name].widget"
            @input="selectWidget(item, $event)"
          >
            <template v-slot:selection="{ item: option, text }">
              <template v-if="option && !option.value">
                <v-icon name="qgis"/>
                <span class="f-grow">{{ item.widget || 'Not configured' }}</span>
              </template>
              <span v-else class="f-grow" v-text="text || 'Invalid value'"/>
            </template>
            <template v-slot:item="{ item: option }">
              <span class="f-grow m-2" v-text="option.value ? option.text : item.widget || 'Not configured'"/>
              <v-icon v-if="option.icon" :name="option.icon" class="m-2"/>
            </template>
          </v-select>
        </template>

        <!-- eslint-disable-next-line -->
        <template v-slot:cell(format)="{ item }">
          <v-select
            v-if="item.type === 'int' || item.type === 'float'"
            placeholder="—"
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
        <template v-slot:cell(visibility)="{ item }">
          <div class="f-row-ac">
            <v-btn
              class="icon flat"
              :color="excludedTableFields.has(item.name) ? '#aaa' : 'primary'"
              @click="toggleFieldVisibility('table', item.name)"
            >
              <v-icon name="attribute-table" size="18"/>
            </v-btn>
            <v-btn
              class="icon flat"
              :color="excludedInfopanelFields.has(item.name) ? '#aaa' : 'primary'"
              @click="toggleFieldVisibility('infopanel', item.name)"
            >
              <v-icon name="circle-i-outline" size="18"/>
            </v-btn>

            <!-- <v-btn
              class="icon flat"
              :color="attrTableMap[item.name] ? 'primary' : '#aaa'"
              @click="toggleAttribute('attr_table_fields', item.name, !attrTableMap[item.name])"
            >
              <v-icon name="attribute-table" size="18"/>
            </v-btn>
            <v-btn
              class="icon flat"
              :color="infoPanelSet.has(item.name) ? 'primary' : '#aaa'"
              @click="toggleAttribute('info_panel_fields', item.name, !infoPanelSet.has(item.name))"
            >
              <v-icon name="circle-i-outline" size="18"/>
            </v-btn> -->
          </div>
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
    </section>

    <section class="card f-col">
      <div class="header f-row-ac px-2 dark">
        <span class="title">Data Preview</span>
        <v-spinner v-if="loading" class="m-2" size="18" width="2"/>
        <div class="f-grow"/>
        <v-btn
          class="flat icon"
          :color="previewMode === 'table' ? 'orange' : ''"
          @click="previewMode = 'table'">
          <v-icon name="attribute-table2"/>
        </v-btn>
        <v-btn
          class="flat icon"
          :color="previewMode === 'infopanel' ? 'orange' : ''"
          @click="previewMode = 'infopanel'"
        >
          <v-icon name="circle-i-outline"/>
        </v-btn>
      </div>

      <template v-if="previewMode === 'table'">
        <v-table
          :columns="attributeTableColumns"
          item-key="_id"
          :items="tableData"
          :selected="selectedFeatureId"
          @row-click="(f, row) => selectedRow = row"
        >
          <template v-slot:header(default)="{ column }">
            <div
              draggable="true"
              :class="{drop: dragOver === column}"
              v-text="column.label"
              @dragstart="onDragStart($event, column)"
              @dragover.prevent="onDragOver($event, column)"
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
        <div v-if="pagination" class="pagination f-row-ac">
          <v-btn
            class="icon"
            :disabled="pagination.page === 1"
            @click="fetchFeatures(1)"
          >
            <v-icon name="navigate_last" class="r-180"/>
          </v-btn>
          <v-btn
            class="icon"
            :disabled="pagination.page === 1"
            @click="fetchFeatures(pagination.page - 1)"
          >
            <v-icon name="navigate_arrow" class="r-180"/>
          </v-btn>
          <span v-text="paginationRangeText" class="mx-1"/>
          <v-btn
            class="icon"
            :disabled="pagination.page === lastPage"
            @click="fetchFeatures(pagination.page + 1)"
          >
            <v-icon name="navigate_arrow"/>
          </v-btn>
          <v-btn
            class="icon"
            :disabled="pagination.page === lastPage"
            @click="fetchFeatures(lastPage)"
          >
            <v-icon name="navigate_last"/>
          </v-btn>
          <div class="v-separator"/>
          <v-select
            class="inline filled"
            :label="tr.PageSize"
            :items="[5, 10, 20, 50]"
            v-model="limit"
            @input="fetchFeatures(1, true)"
          />
        </div>
      </template>

      <div v-else class="info-panel-settings">
        <div v-if="pagination" class="pagination f-row-ac">
          <v-btn
            class="icon"
            :disabled="selectedFeatureIndex < 1"
            @click="showPrevFeature"
          >
            <v-icon name="navigate_arrow" class="r-180"/>
          </v-btn>
          <span>{{ selectedFeatureIndex + 1 }} / {{ pagination.totalItems }}</span>
          <v-btn
            class="icon"
            :disabled="selectedFeatureIndex >= pagination.totalItems - 1"
            @click="showNextFeature"
          >
            <v-icon name="navigate_arrow"/>
          </v-btn>
        </div>
        <component
          v-if="selectedFeature"
          :is="infoPanelComponent"
          class="info-panel f-grow"
          :feature="selectedFeature"
          :layer="layer"
          :project="infopanelProject"
        />
        <div class="scripts f-col">
          <v-select
            label="Component"
            class="filled xinline"
            :items="scriptsItems"
            :value="layerSettings.infopanel_component"
            @input="setInfopanelComponent"
          />
          <div class="my-2"/>
          <p class="note my-4 mx-2">
            You can completely customize appearance of layer's Info Panel by creating your own Vue.js component.
            For more information, wait for official documentation. 
          </p>
          
          <!-- <div class="f-grow"/> -->
          <v-list label="Modules" :items="scriptsList" empty-text="No script modules uploaded">
            <!-- <template v-slot:empty>
              <span>No script modules loaded</span>
            </template> -->
            <template v-slot:item="{ item }">
              <div class="f-col f-grow">
                <span class="title" v-text="item.module"/>
                <div>Components: {{ item.components.join(', ') }}</div>
                <small>File: <a target="_blank" :href="`/api/project/media/${project.name}/${item.path}`" v-text="item.path"/></small>
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
    </section>
  </div>
</template>

<script>
import intersection from 'lodash/intersection'
import isEqual from 'lodash/isEqual'
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import GeoJSON from 'ol/format/GeoJSON'

import FormattersEditor, { createFormatter } from '@/components/FormattersEditor.vue'
import GenericInfoPanel, { DateWidget, ValueMapWidget } from '@/components/GenericInfopanel.vue'
import { layerFeaturesQuery } from '@/map/featureinfo'
import { excludedFieldsSet } from '@/adapters/attributes'
import { externalComponent } from '@/components-loader'
import { TaskState, watchTask } from '@/tasks'
import { pull } from '@/utils/collections'

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

function formatFeatures (features, formatters) {
  formatters = pickBy(formatters, f => f)
  features.forEach(f => {
    f._formattedProperties = mapValues(formatters, (formetter, name) => formetter.format(f.get(name)))

    Object.defineProperty(f, 'getFormatted', {
      // configurable: true,
      value: function (key) {
        return this._formattedProperties[key] ?? this.get(key)
      }
    })
  })
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
      orderLayout: null,
      previewMode: 'table',
      linkedVisibility: true,
      filterExcluded: false,
      features: [],
      selectedRow: 0,
      limit: 5,
      pagination: null,
      dragSource: null,
      dragOver: null,
      loadedScript: null,
      scriptTask: TaskState()
    }
  },
  computed: {
    attributesMenu () {
      let layoutOption
      if (this.orderLayout) {
        layoutOption = {
          text: 'Disable separate order layouts',
          action: () => {
            console.log(this.layerSettings.fields_order)
            this.layerSettings.fields_order = {
              global: this.layoutAttributes.map(a => a.name)
            }
            this.orderLayout = null
          }
        }
      } else {
        layoutOption = {
          text: 'Enable separate order layouts',
          action: () => {
            const order = {
              infopanel: this.layoutAttributes.map(a => a.name),
              table: this.layoutAttributes.map(a => a.name)
            }
            this.$set(this.layerSettings, 'fields_order', order)
            this.orderLayout = 'infopanel'
          }
        }
      }
      return [
        layoutOption, {
          text: 'Reset Visibility',
          action: () => {
            this.$delete(this.layerSettings, 'excluded_fields')
          }
        }
      ]
    },
    orderLayouts () {
      return [
        { text: 'Info Panel', value: 'infopanel' },
        { text: 'Attributes Table', value: 'table' }
      ]
    },
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
          label: 'Widget',
          header: { width: 1 }
        }, {
          key: 'format',
          label: 'Formatting',
          header: { width: 1 }
        }, {
          key: 'visibility',
          label: 'Visibility',
          header: { width: 1 },
          align: 'center'
        // }, {
        //   key: 'attr_table',
        //   label: 'Attribute Table',
        //   header: { width: 1 }
        //   // header: { align: 'center', width: 1 }
        // }, {
        //   key: 'info_panel',
        //   label: 'Info Panel',
        //   header: { align: 'center', width: 1 }
        }, this.capabilities.export && {
          key: 'export',
          label: 'Export',
          header: { align: 'center', width: 1 }
        }
      ].filter(c => c)
    },
    numericFormatters () {
      const defined = this.settings.formatters ?? []
      return [
        { text: '—', value: undefined },
        ...defined.map(i => ({ text: i.name, value: i.name })),
        { text: 'Actions', separator: true },
        // { text: 'Remove formatting', value: '__remove__' },
        { text: 'Manage formatters', value: '__manage__', icon: 'settings' }
      ]
    },
    widgets () {
      return [
        { text: 'QGIS', value: undefined, icon: 'qgis' },
        { text: 'Gisquick', separator: true },
        { text: 'Hyperlink', value: 'Hyperlink' },
        { text: 'Image', value: 'Image' },
        { text: 'Media Image', value: 'MediaImage' }
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
    layoutAttributes () {
      if (this.layerSettings.fields_order) {
        const fields = this.layerSettings.fields_order[this.orderLayout || 'global']
        return fields.map(name => this.attrsMap[name])
      }
      return this.attributes
    },
    displayAttributes () {
      if (this.filterExcluded) {
        const excluded = this.orderLayout
          ? this.orderLayout === 'table' ? this.excludedTableFields : this.excludedInfopanelFields
          : new Set([...this.excludedTableFields].filter(n => this.excludedInfopanelFields.has(n)))
        return this.layoutAttributes.filter(a => !excluded.has(a.name))
      }
      return this.layoutAttributes
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
    selectedFeature () {
      return this.features[this.selectedRow]
    },
    selectedFeatureIndex () {
      const { pagination, selectedRow } = this
      return (pagination.page - 1) * pagination.rowsPerPage + selectedRow 
    },
    selectedFeatureId () {
      return this.selectedFeature?.getId()
    },
    infopanelProject () {
      return {
        name: this.project.name,
        ows_project: this.project.name,
        ows_url:  `/api/map/ows/${this.project.name}`
        // formatter: name => formatters[name]
      }
    },
    projectFormatters () {
      const formatters = keyBy(this.settings.formatters, 'name')
      return mapValues(formatters, f => createFormatter(f))
    },
    layerFormatters () {
      return mapValues(
        keyBy(this.finalAttributes.filter(attr => attr.format), 'name'),
        attr => this.projectFormatters[attr.format]
      )
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
    excludedTableFields () {
      return excludedFieldsSet(this.layerSettings, 'table')
    },
    excludedInfopanelFields () {
      return excludedFieldsSet(this.layerSettings, 'infopanel')
    },
    infoPanelComponent () {
      const componentName = this.layerSettings.infopanel_component
      if (componentName) {
        return this.loadedScript?.components[componentName] || externalComponent(this.project, componentName)
      }
      return GenericInfoPanel
    },
    attributeTableColumns () {
      // old API
      // const attrsNames = this.layerSettings.attr_table_fields || []

      let fields
      if (this.layerSettings.fields_order) {
        fields = this.layerSettings.fields_order.table || this.layerSettings.fields_order.global
      } else {
        fields = this.attributes.map(a => a.name)
      }
      const excluded = this.excludedTableFields
      const attributes = fields.filter(n => !excluded.has(n)).map(n => this.attrsMap[n])
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
      // return this.features?.map(f => ({ _id: f.getId(), ...f.getProperties() }))

      const attrsNames = this.finalAttributes.map(a => a.name)
      return this.features?.map(f => ({
        _id: f.getId(),
        ...attrsNames.reduce((obj, name) => (obj[name] = f.getFormatted(name), obj), {})
        // ...f.getProperties(),
        // ...f.getFormattedProperties()
      }))

      const data = this.features?.map(f => ({ _id: f.getId(), ...f.getProperties() }))
      this.finalAttributes.forEach(attr => {
        if (attr.format) {
          const formatter = this.infopanelProject.formatter(attr.format)
          data.forEach(f => {
            f[attr.name] = formatter.format(f[attr.name])
          })
        }
      })
      return data
    },
    attrTableSlots () {
      const slots = {}
      this.finalAttributes.forEach(attr => {
        let widget
        if (attr.widget === 'ValueMap') {
          widget = ValueMapWidget
        } else if (attr.type === 'date') { // and also attr.widget === 'DateTime' ?
          widget = DateWidget
        }
        if (widget) {
          slots[attr.name] = { component: widget, attribute: attr }
        }
      })
      return slots
    },
    lastPage () {
      const { rowsPerPage, totalItems } = this.pagination
      return Math.ceil(totalItems / rowsPerPage)
    },
    paginationRangeText () {
      const { page, rowsPerPage, totalItems } = this.pagination
      if (totalItems === 0) {
        return '-'
      }
      const sIndex = (page - 1) * rowsPerPage + 1
      const eIndex = Math.min(sIndex + rowsPerPage - 1, totalItems)
      return `${sIndex} - ${eIndex} of ${totalItems}`
    },
    tr () {
      return {
        FilterVisibleLabel: this.$gettext('Filter to visible area'),
        PageSize: this.$gettext('Page size')
      }
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
    },
    attrDragHandlers () {
      let dragSrc
      return {
        dragstart: (e, attr) => {
          dragSrc = attr.name
          e.dataTransfer.effectAllowed = 'move'
        },
        dragover: (e, attr) => {
          e.dataTransfer.dropEffect = dragSrc !== attr.name ? 'move' : 'none'
        },
        drop: (e, attr) => {
          const target = attr.name
          if (!this.orderLayout && !this.layerSettings.fields_order) {
            this.$set(this.layerSettings, 'fields_order', { global: this.attributes.map(a => a.name) })
          }
          const layout = this.layerSettings.fields_order[this.orderLayout || 'global']

          // v3
          const sIndex = layout.indexOf(dragSrc)
          const dIndex = layout.indexOf(target)
          layout.splice(sIndex, 1)
          layout.splice(dIndex, 0, dragSrc)
        }
      }
    }
  },
  mounted () {
    // this.fetchFeatures()
  },
  watch: {
    layerSettings: {
      immediate: true,
      handler (ls) {
        // if (!ls.attr_table_fields) {
        //   this.$set(ls, 'attr_table_fields', this.attributes.map(a => a.name))
        // }
        // if (!ls.info_panel_fields) {
        //   this.$set(ls, 'info_panel_fields', this.attributes.map(a => a.name))
        // }
        this.attributes.forEach(attr => {
          if (!ls.attributes?.[attr.name]) {
            // console.log('missing attributes settings', attr.name)
            // this.$set(ls.attributes, attr.name, { widget: null })
            // this.$set(ls.attributes, attr.name, { widget: undefined })
          }
        })
        if (ls.excluded_fields) {
          const { infopanel, table } = ls.excluded_fields
          this.linkedVisibility = isEqual(infopanel, table)
        }
        this.orderLayout = ls.fields_order?.infopanel ? 'infopanel' : null
      }
    },
    layerId: {
      immediate: true,
      handler () {
        this.fetchFeatures()
      }
    },
    layerFormatters () {
      if (this.features) {
        const features = this.features.map(f => f.clone())
        formatFeatures(features, this.layerFormatters)
        this.features = Object.freeze(features)
      }
    }
  },
  methods: {
    async fetchFeatures (page = 1) {
      const mapProjection = this.project.meta.projection.code
      // fetch only attributes, without geometry
      const query = layerFeaturesQuery(this.layer, null, null, this.attributes.map(a => a.name))

      const baseParams = {
        VERSION: '1.1.0',
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        OUTPUTFORMAT: 'GeoJSON'
      }

      const url = `/api/project/map/${this.project.name}`
      const headers = { 'Content-Type': 'text/xml' }
      let geojson, featuresCount
      this.loading = true
      // await new Promise(resolve => setTimeout(resolve, 2000))
      try {
        let params = { ...baseParams, resultType: 'hits' }
        let resp = await this.$http.post(url, query, { params, headers })
        // fix invalid geojson from QGIS server (missing ',')
        featuresCount = JSON.parse(resp.data.replace(/"\n/g, '",\n')).numberOfFeatures

        params = {
          ...baseParams,
          STARTINDEX: (page - 1) * this.limit,
          MAXFEATURES: this.limit
        }
        resp = await this.$http.post(url, query, { params, headers })
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
      formatFeatures(features, this.layerFormatters)
      this.features = features
      this.pagination = {
        query,
        page,
        rowsPerPage: this.limit,
        totalItems: featuresCount
      }
      this.selectedRow = 0
    },
    async showPrevFeature () {
      this.selectedRow -= 1
      if (this.selectedRow < 0) {
        await this.fetchFeatures(this.pagination.page - 1)
        this.selectedRow = this.features.length - 1
      }
    },
    showNextFeature () {
      if (this.selectedRow + 1 >= this.pagination.rowsPerPage) {
        this.fetchFeatures(this.pagination.page + 1)
      } else {
        this.selectedRow += 1
      }
    },
    onDragStart (e, col) {
      this.dragSource = col
      e.dataTransfer.effectAllowed = 'move'
    },
    onDragOver (e, col) {
      if (col !== this.dragSource) {
        this.dragOver = col
      }
      e.dataTransfer.dropEffect = col !== this.dragSource ? 'move' : 'none'
    },
    onDragEnd (col) {
      this.dragSource = null
      this.dragOver = null
    },
    onDrop (col) {
      if (col === this.dragSource) {
        return
      }
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
    addExcludedField (key, name) {
      const excluded = this.layerSettings.excluded_fields
      if (!excluded[key]) {
        this.$set(excluded, key, [name])
      } else {
        excluded[key].push(name)
      }
    },
    removeExcludedField (key, name) {
      const excluded = this.layerSettings.excluded_fields

    },
    toggleFieldVisibility (model, name) {
      const isExcluded = this[model === 'table' ? 'excludedTableFields' : 'excludedInfopanelFields'].has(name)
      const excluded = this.layerSettings.excluded_fields ?? {}
      let { global = [], table = [], infopanel = [] } = excluded
      // 'extract' globally excluded fields
      const newExcluded = {
        infopanel: infopanel.concat(global),
        table: table.concat(global)
      }
      if (isExcluded) {
        if (this.linkedVisibility) {
          Object.values(newExcluded).forEach(model => pull(model, name))
        } else {
          pull(newExcluded[model], name)
        }
      } else {
        if (this.linkedVisibility) {
          Object.values(newExcluded).forEach(model => model.push(name))
        } else {
          newExcluded[model].push(name)
        }
      }
      // compute new globally excluded fields
      const mutual = intersection(newExcluded.infopanel, newExcluded.table)
      newExcluded.global = mutual
      if (mutual.length) {
        newExcluded.infopanel = newExcluded.infopanel.filter(n => !mutual.includes(n))
        newExcluded.table = newExcluded.table.filter(n => !mutual.includes(n))
      }
      this.$set(this.layerSettings, 'excluded_fields', newExcluded)
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
    setFormatter (attr, value) {
      if (value === '__manage__') {
        this.$refs.formattersDialog.show(this.settings)
      } else {
        this.setAttributeSetting(attr, 'format', value)
      }
    },
    selectWidget (attr, widget) {
      this.setAttributeSetting(attr, 'widget', widget)
    },
    setWidget (attr, widget) {
      // if (item.value) {
      //   this.$set(this.attrsSettings[attr.name], 'widget', item.value)
      // } else {
      //   this.$delete(this.attrsSettings[attr.name], 'widget')
      // }
      this.setAttributeSetting(attr, 'widget', item.value)
    },
    setInfopanelComponent (item) {
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

.table-container {
  border: 1px solid var(--border-color);
  .select {
    min-width: 150px;
    margin: 3px 0;
    ::v-deep .input {
      height: 30px;
    }
    &.widget-select {
      width: 180px;
    }
  }
}
.drop {
  // background-color: var(--color-primary);
  opacity: 0.3;
}
.info-panel-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  .info-panel {
    // grid-area: 2 / 1 / 3 / 2;
    grid-area: 1 / 1 / 2 / 2;
  }
  .scripts {
    // grid-area: 2 / 2 / 3 / 3;
    grid-area: 1 / 2 / 2 / 3;
    .btn {
      height: 32px;
    }
  }
  .pagination {
    grid-area: 2 / 1 / 3 / 2;
    margin: 0 6px 3px 6px;
    // margin-right: 6px;
    // border-top: 1px solid #ddd;
    background-color: #fff;
  }
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
.pagination {
  // align-self: center;
  // justify-self: center;
  font-size: 14px;
  line-height: normal;
  background-color: #fafafa;
  justify-content: center;

  .btn {
    max-height: 28px;
    &.icon {
      width: 24px;
      height: 24px;
      margin: 2px;
    }
  }
  .i-field ::v-deep .input {
    height: 24px;
  }
}
.note {
  font-size: 14px;
  opacity: 0.7;
}
</style>
