<template>
  <div class="formatters f-row">
    <v-list
      label="Formatters"
      empty-text="Empty list"
      item-text="name"
      :items="settings.formatters || []"
      :selected="selectedIndex"
      @click-item="(_, index) => selectedIndex = index"
    >
      <template v-slot:append>
        <div class="toolbar f-row-ac mt-1">
          <v-btn class="icon m-0 p-1" @click="addFormatter">
            <v-icon name="plus"/>
          </v-btn>
          <v-btn class="icon m-0 p-1" :disabled="!selected" @click="removeFormatter">
            <v-icon name="delete_forever"/>
          </v-btn>
        </div>
      </template>
    </v-list>
    <div v-if="selected" class="form f-col f-grow">
      <v-text-field
        label="Name"
        class="filled"
        :value="selected.name"
        @input="renameFormatter"
        lazy
      />
      <v-text-field
        label="Locale"
        class="filled"
        spellcheck="false"
        v-model="selected.locale"
        lazy
      />
      <v-text-field
        label="JSON configuration"
        class="config filled f-grow"
        :error="configError || formatter.error"
        :value="configText"
        @input="updateConfig"
        height="150"
        spellcheck="false"
        multiline
        lazy
      />
      <small class="mx-2 mb-2">
        See <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat">
          Intl.NumberFormat Reference</a>
        for more information
      </small>
      <div class="text-separator f-row-ac mx-2">
        <hr class="f-grow"/>
        <span class="mx-4">Preview</span>
        <hr class="f-grow"/>
      </div>
      <!-- <hr class="m-2"/> -->
      <div class="f-row-ac">
        <v-text-field class="filled" v-model="testValue"/>
        <strong class="mx-2">Formatted:</strong>
        <span v-text="formattedValue"/>
        <!-- <span class="mx-2">Formatted: {{ formattedValue }}</span> -->
      </div>
    </div>
  </div>
</template>

<script>
import has from 'lodash/has'
import isObject from 'lodash/isObject'

export function createFormatter (params) {
  let { locale, config } = params
  // return new Intl.NumberFormat(locale, config instanceof String ? config.toJSON() : config)f
  // return new Intl.NumberFormat(locale, config.toJSON?.() ?? config)
  if (!locale) {
    locale = navigator.language || navigator.languages[0]
    // or (new Intl.NumberFormat()).resolvedOptions().locale
    // https://stackoverflow.com/questions/673905/how-to-determine-users-locale-within-browser
  }
  const nf = new Intl.NumberFormat(locale, config)
  return {
    format: v => Number.isFinite(v) ? nf.format(v) : ''
  }
}

export default {
  name: 'FormattersEditor',
  props: {
    settings: Object
  },
  data () {
    return {
      selectedIndex: 0,
      configError: null,
      testValue: 1234.567
    }
  },
  computed: {
    selected () {
      return this.settings.formatters?.[this.selectedIndex]
    },
    formatterAttributes () {
      return [].concat(...Object.values(this.settings.layers)
        .filter(l => l.attributes)
        .map(l => Object.values(l.attributes).filter(a => a.format)))
    },
    configText () {
      const { config } = this.selected
      if (isObject(config) && !has(config, 'toString')) {
        const json = JSON.stringify(config, null, 2)
        Object.defineProperty(config, 'toString', { value: () => json })
      }
      return config?.toString() ?? ''
    },
    formatter () {
      try {
        return createFormatter(this.selected)
      } catch (err) {
        return { error: err.message }
      }
    },
    formattedValue () {
      const value = parseFloat(this.testValue)
      if (this.formatter && !this.formatter.error) {
        return this.formatter?.format(value)
      }
      return ''
    }
  },
  methods: {
    addFormatter () {
      if (!this.settings.formatters) {
        this.$set(this.settings, 'formatters', [])
      }
      this.settings.formatters.push({ name: 'New', locale: '', config: {} })
    },
    removeFormatter () {
      this.formatterAttributes
        .filter(a => a.format === this.selected.name)
        .forEach(a => this.$delete(a, 'format'))

      const index = this.settings.formatters.indexOf(this.selected)
      this.settings.formatters.splice(index, 1)
    },
    toggleFormatters (enabled) {
      if (enabled) {
        this.$set(this.settings, 'formatters', [])
      } else {
        this.$delete(this.settings, 'formatters')
      }
    },
    renameFormatter (name) {
      const currentName = this.selected.name
      this.formatterAttributes
        .filter(a => a.format === currentName)
        .forEach(a => this.$set(a, 'format', name))
      this.selected.name = name
    },
    updateConfig (val) {
      let config
      try {
        config = JSON.parse(val)
        this.configError = null
      } catch (err) {
        this.configError = `Invalid JSON: ${err.message}`
        config = {}
      }
      Object.defineProperty(config, 'toString', { value: () => val })
      this.selected.config = config
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  min-width: 200px;
  min-height: 360px;
}
.form {
  a[href] {
    color: var(--color-primary);
  }
  small {
    font-size: 13px;
  }
}
.text-separator {
  font-size: 13px;
  opacity: 0.6;
}
</style>