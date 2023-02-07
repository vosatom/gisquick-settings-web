<template>
  <div class="f-row-ac">
    <v-select
      class="f-grow m-0"
      :items="widgets"
      :value="widget"
      @input="selectWidget"
    >
      <template v-slot:selection="{ text }">
        <span :class="{default: !widget}" class="f-grow" v-text="text || defaultWidget"/>
      </template>
      <template v-slot:item="{ item: option }">
        <span class="f-grow m-2" v-text="option.value ? option.text : attr.widget || 'Not configured'"/>
        <v-icon v-if="option.icon" :name="option.icon" class="m-2"/>
      </template>
    </v-select>
    <v-btn
      v-if="isConfigurable"
      :disabled="!isConfigurable"
      class="icon m-0 p-1"
      @click="$refs.dialog.show()"
    >
      <v-icon name="settings"/>
    </v-btn>
    <v-dialog ref="dialog" :title="`Widget Settings (${attr.name})`">
      <div class="widget-config f-col light">
        <template v-if="widget === 'Autofill'">
          <v-select
            class="filled"
            label="Value"
            :items="autofillOptions"
            :value="config.value"
            @input="updateConfig('value', $event)"
          />
          <span class="field-label mx-2 mt-2">Operations</span>
          <!-- <v-checkbox label="Insert" :value="config.insert" @input="updateConfig('insert', $event)"/> -->
          <div class="f-row-ac">
            <v-checkbox
              label="Insert"
              :value="config.operations || []"
              val="insert"
              @input="updateConfig('operations', $event)"
            />
            <v-checkbox
              label="Update"
              :value="config.operations || []"
              val="update"
              @input="updateConfig('operations', $event)"
            />
          </div>
        </template>
        <template v-if="widget === 'ValueMap'">
          <v-table :columns="valueMapColumns" :items="valueMapItems"/>
        </template>
        <template v-if="widget === 'MediaImage'">
          <v-text-field
            class="filled"
            label="Directory"
            placeholder="web/<layername>"
            :value="config.directory"
            @input="updateConfig('directory', $event)"
          />
          <div class="desc">
            Currently ony <strong>web/*</strong> paths are supported
          </div>
          <v-text-field
            class="filled"
            label="Filename"
            placeholder="<random>"
            :value="config.filename"
            @input="updateConfig('filename', $event)"
          />
          <div class="desc">
            Special values: <strong v-text="'<timestamp>, <filename>, <hash>, <random>'"/>
          </div>
          <v-select
            label="Store path relative to"
            class="filled"
            :items="relativeDepths"
            :value="config.relative_depth || 0"
            @input="updateConfig('relative_depth', $event)"
          >
            <template v-slot:item="{ item }">
              <div class="f-row-ac f-grow">
                <span class="f-grow" v-text="item.text"/>
                <span class="item-desc mx-2" v-text="item.desc"/>
              </div>
            </template>
          </v-select>
          <v-text-field
            class="filled"
            label="Max. resolution in megapixels"
            type="number"
            step="0.1"
            min="0"
            max="100"
            :value="config.max_resolution"
            @input="updateConfig('max_resolution', $event)"
          />
        </template>
      </div>
    </v-dialog>
  </div>
</template>

<script>

import { valueMapItems } from '@/adapters/attributes'

export default {
  props: {
    attr: Object,
    attrSettings: Object
  },
  computed: {
    widget () {
      if (this.attr.widget === 'ValueMap') {
        return this.attr.widget
      }
      return this.attrSettings?.widget
    },
    allWidgets () {
      return [
        { text: 'TextField', value: 'TextField' },
        { text: 'Autofill', value: 'Autofill', configurable: true },
        { text: 'Checkbox', value: 'Checkbox' },
        { text: 'DateField', value: 'DateField' },
        { text: 'Hyperlink', value: 'Hyperlink' },
        { text: 'Image', value: 'Image' },
        { text: 'Media Image', value: 'MediaImage', configurable: true },
        { text: 'ValueMap', value: 'ValueMap', icon: 'qgis', configurable: true }
      ]
    },
    widgets () {
      const { type } = this.attr
      // const pick = values => this.allWidgets.filter(i => values.includes(i.value))
      const pick = values => values.map(v => this.allWidgets.find(i => i.value === v))

      if (this.widget === 'ValueMap') {
        return pick(['ValueMap'])
      }
      if (type === 'bool') {
        return pick(['Checkbox'])
      } else if (type === 'int' || type === 'uint') {
        return pick(['TextField', 'Hyperlink', 'Image', 'Autofill'])
      } else if (type === 'date') {
        return pick(['DateField', 'Autofill', 'TextField'])
      } else if (type === 'datetime') {
        return pick(['TextField', 'Autofill'])
      } else if (type === 'text') {
        return pick(['TextField', 'Hyperlink', 'Image', 'MediaImage', 'Autofill'])
      }
      return pick(['TextField'])
    },
    isConfigurable () {
      return this.widgets.find(w => w.value === this.widget)?.configurable
    },
    config () {
      return this.attrSettings?.config ?? {}
    },
    defaultWidget () {
      return this.widgets[0]?.value || 'TextField'
    },
    valueMapItems () {
      return this.widget === 'ValueMap' && valueMapItems(this.attr)
    },
    valueMapColumns () {
      return [
        {
          label: 'Value',
          key: 'value'
        }, {
          label: 'Label',
          key: 'text'
        }
      ]
    },
    autofillOptions () {
      const opts = [{
        text: 'Autogenerated',
        value: ''
      }]
      if (this.attr.type === 'text') {
        opts.push({
            text: 'User',
            value: 'user'
        })
      } else if (this.attr.type === 'date') {
        opts.push({
          text: 'Current Date',
          value: 'current_date'
        })
      } else if (this.attr.type === 'datetime') {
        opts.push({
          text: 'Current Time',
          value: 'current_datetime'
        })
      }
      return opts
    },
    // relativeDepths () {
    //   if (this.widget === 'MediaImage') {
    //     const dir = this.config.directory || 'web/<layername>'
    //     const parts = ['', ...dir.trim().split('/').filter(v => v)]
    //     return parts.map((_, i) => ({
    //       text: '/' + parts.slice(1, i + 1).join('/'),
    //       value: i
    //     }))
    //   }
    //   return []
    // }
    relativeDepths () {
      if (this.widget === 'MediaImage') {
        const dir = this.config.directory || 'web/<layername>'
        // [web, layername] => /web, /web/layername
        const parts = dir.trim().split('/').filter(v => v)
        return [
          { text: '/', desc: "(project's root directory)", value: 0 },
          ...parts.map((_, i) => ({
            text: '/' + parts.slice(0, i + 1).join('/'),
            value: i + 1
          }))
        ]
      }
      return []
    }
  },
  methods: {
    selectWidget (widget) {
      this.$emit('input', { widget })
      if (this.attrSettings?.config) {
        this.$delete(this.attrSettings, 'config')
      }
    },
    updateConfig (key, value) {
      if (!this.attrSettings.config) {
        this.$set(this.attrSettings, 'config', { [key]: value })
      } else {
        this.$set(this.attrSettings.config, key, value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.default {
  opacity: 0.6;
}
.widget-config {
  min-width: 440px;
  padding: 8px 4px;
  .desc {
    font-size: 13px;
    opacity: 0.7;
    margin: 0 6px 6px;
  }
}
.field-label {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 11.5px;
  opacity: 0.75;
}
.item-desc {
  color: #909090;
}
</style>