<template>
  <div class="page-content f-col f-grow light">
    <div class="f-row">
      <v-checkbox
        class="mt-4"
        label="Search by WGS84 (GPS) coordinates"
        v-model="settings.search_by_coords"
      />
      <div class="f-grow"/>
      <div class="toolbar f-row-ac">
        <div class="header f-row-ac">
          <v-icon name="settings" class="m-1" color="#fff"/>
        </div>
        <v-btn
          class="small"
          :disabled="!hasSearchConfig"
          @click="copySettings"
        >
          <v-icon name="copy" class="mr-2"/>
          <small>Copy</small>
        </v-btn>
        <v-btn
          class="small"
          :disabled="pasteDisabled"
          @click="pasteSettings"
        >
          <v-icon name="paste" class="mr-2"/>
          <small>Paste</small>
        </v-btn>
        <v-btn
          class="small"
          :disabled="!hasSearchConfig"
          @click="clearSettings"
        >
          <v-icon name="disabled" class="mr-2"/>
          <small>Clear</small>
        </v-btn>
      </div>
    </div>
    <div class="l-col2">
      <v-select
        label="Geocoding Service"
        class="filled"
        placeholder="No service"
        :items="services"
        :value="service"
        @input="setService"
      />
    </div>
    <template v-if="service">
      <v-text-field
        class="filled"
        label="URL"
        v-model="settings.geocoding.url"
      />
      <div
        v-for="(param, i) in params"
        :key="i"
        class="f-row f-align-end"
      >
        <v-text-field
          class="filled"
          label="URL Path"
          placeholder="Optional"
          v-model="param.path"
        />
        <v-text-field
          class="filled"
          label="Parameter name"
          v-model="param.name"
        />
        <v-text-field
          class="filled f-grow"
          label="Parameter value"
          v-model="param.value"
        />
        <v-btn class="icon p-1" @click="removeParam(i)">
          <v-icon name="delete_forever"/>
        </v-btn>
      </div>
      <div>
        <v-btn class="n-case round" color="green" @click="addParameter">
          <v-icon name="plus" class="mr-2"/>
          <span>Add Query Parameter</span>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

const Services = {
  arcgis: {
    url: 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/',
    params: [{ path: '', name: 'token', value: '' }]
  },
  geoapify: {
    url: 'https://api.geoapify.com/v1/geocode/',
    params: [{ path: '', name: 'apiKey', value: '' }]
  }
}

export default {
  name: 'SearchSettings',
  components: {
  },
  props: {
    project: Object,
    settings: Object
  },
  data () {
    return {
      pasteDisabled: true
    }
  },
  computed: {
    services () {
      return [{
        text: 'None',
        value: null
      }, {
        text: 'Arcgis',
        value: 'arcgis'
      }, {
        text: 'Geoapify',
        value: 'geoapify'
      }]
    },
    service () {
      return this.settings?.geocoding?.service
    },
    params () {
      return this.settings.geocoding.query_params
    },
    hasSearchConfig () {
      const { search_by_coords, geocoding } = this.settings
      return Boolean(search_by_coords || geocoding?.service)
    }
  },
  mounted () {
    window.addEventListener('focus', this.checkClipboardState)
    this.checkClipboardState()
  },
  beforeDestroy () {
    window.removeEventListener('focus', this.checkClipboardState)
  },
  methods: {
    setService (service) {
      if (service) {
        if (service === this.service) return
        this.settings.geocoding = {
          service,
          url: Services[service].url,
          query_params: cloneDeep(Services[service].params)
        }
      } else {
        this.settings.geocoding = null
      }
    },
    addParameter () {
      this.params.push({ path: '', name: '', value: '' })
    },
    removeParam (index) {
      this.params.splice(index, 1)
    },
    copySettings () {
      const { search_by_coords, geocoding } = this.settings
      const data = { search_by_coords, geocoding }
      navigator.clipboard.writeText(JSON.stringify(data))
      this.pasteDisabled = false
    },
    async pasteSettings () {
      const content = await navigator.clipboard.readText()
      if (content) {
        try {
          const { search_by_coords, geocoding } = JSON.parse(content)
          this.settings.search_by_coords = Boolean(search_by_coords)
          this.settings.geocoding = geocoding
        } catch (err) {
          this.$notify.error('Invalid search settings')
        }
      }
    },
    clearSettings () {
      this.settings.geocoding = null
      this.settings.search_by_coords = false
    },
    async checkClipboardState () {
      try {
        let content = await navigator.clipboard.readText()
        content = content?.trim()
        this.pasteDisabled = !content
      } catch (err) {
        this.pasteDisabled = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.l-col2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  .switch {
    align-self: end;
    justify-self: start;
  }
}
.error {
  color: var(--color-red);
  --icon-color: currentColor;
}
.desc-text {
  opacity: 0.6;
  font-size: 13.5px;
}
.toolbar {
  height: 30px;
  background-color: #eee;
  border-bottom: 1px solid #bbb;
  --gutter: 2px;
  .header {
    height: 100%;
    background-color: #555;
  }
}
</style>
