<template>
  <div class="page-content f-col light">

    <div class="main-layout f-grow">
      <div class="map-container f-col">
        <map-view
          ref="map"
          :project="project.name"
          :layers="visibleLayers"
          :config="project.meta"
        >
          <template v-slot:toolbar>
            <v-btn class="layers-toggle icon flat" :color="showLayers ? 'primary' : ''" @click="showLayers = !showLayers">
              <v-icon name="overlays"/>
            </v-btn>
          </template>
          <draw-extent
            color="#EB5757"
            :edit="activeExtentEdit === 'extent'"
            :value="settings.extent"
            @input="updateExtent('extent', $event)"
          />
          <draw-extent
            v-if="!!settings.initial_extent"
            color="#1FCB7C"
            :edit="activeExtentEdit === 'initial_extent'"
            :value="settings.initial_extent"
            @input="settings.initial_extent = roundExtent($event)"
          />
        </map-view>
      </div>
      <div class="settings f-col">
        <scales-list
          label="Scales"
          :value="settings.scales"
          @input="updateScales"
          @click:scale="zoomToScale"
          class="scales-list"
        />
        <extent-field
          label="Map Extent"
          color="red"
          :edit="activeExtentEdit === 'extent'"
          :menu="extentMenu"
          :value="settings.extent"
          @input="settings.extent = roundExtent($event)"
          @update:edit="toggleExtentEdit('extent')"
        />
        <v-checkbox
          label="Enable initial view extent"
          :value="!!settings.initial_extent"
          @input="toggleDefaultViewExtent"
        />
        <extent-field
          v-if="!!settings.initial_extent"
          label="Initial Extent"
          color="green"
          :edit="activeExtentEdit === 'initial_extent'"
          :menu="extentMenu"
          :value="settings.initial_extent"
          @input="settings.initial_extent = roundExtent($event)"
          @update:edit="toggleExtentEdit('initial_extent')"
        />

        <thumbnail-editor v-if="thumbnailSrc" :src="thumbnailSrc"/>
        <div v-else class="thumbnail">
          <img v-if="project.thumbnail" :src="`/api/project/thumbnail/${project.name}`"/>
          <div v-else class="f-col-ac">
            <map-img class="placeholder" width="110"/>
            <small class="uppercase">No Thumbnail</small>
          </div>
        </div>
        <div class="f-row f-justify-center">
          <input
            ref="input"
            type="file"
            hidden
            accept="image/*"
            @input="setThumbnailFile"
            @change="setThumbnailFile"
          />
          <v-btn color="#555" class="small outlined" @click="$refs.input.click()">
            <v-icon name="folder-open" color="#555" class="mr-2"/>
            <span>Select File</span>
          </v-btn>
          <v-btn color="#555" class="small outlined" @click="loadThumbnail">
            <v-icon name="arrow-backward" color="#555" class="mr-2"/>
            <span>Map</span>
          </v-btn>
          <v-btn
            class="icon"
            :disabled="!project.thumbnail && !thumbnailSrc"
            @click="removeLocalThumbnail"
          >
            <v-icon name="delete_forever"/>
          </v-btn>
        </div>
      </div>

      <!-- </div> -->

      <!-- <v-btn class="layers-toggle icon flat" :color="showLayers ? 'primary' : ''" @click="showLayers = !showLayers">
        <v-icon name="overlays"/>
      </v-btn> -->

      <div class="panel f-col" v-if="showLayers">
        <div class="header dark">
          QGIS Layers
        </div>
        <div class="toolbar f-row-ac">
        </div>
        <v-scroll-area>

          <layers-tree
            :layers="layers"
            :expanded.sync="expanded"
          >
            <template v-slot:leaf-append="{ layer }">
              <div class="symbol f-row-ac">
                <img
                  v-if="legends[layer.id]"
                  :src="`data:image/png;base64, ${legends[layer.id]}`"
                />
              </div>
            </template>
          </layers-tree>

        </v-scroll-area>
      </div>
    </div>
  </div>
</template>

<script>
import round from 'lodash/round'
import mapValues from 'lodash/mapValues'
import { extend } from 'ol/extent'

import LayersTree from '@/components/LayersTree.vue'
import ScalesList from '@/components/ScalesList.vue'
// import ExtentField from '@/components/ExtentField.vue'
import ExtentField from '@/components/ExtentField2.vue'
import ThumbnailEditor from '@/components/ThumbnailEditor.vue'
import TextTabsHeader from '@/ui/TextTabsHeader.vue'
import VTabsHeader from '@/ui/TabsHeader.vue'
import MapImg from '@/assets/map.svg?inline'
const MapView = () => import(/* webpackChunkName: "olmap" */ '@/components/Map.vue')
const DrawExtent = () => import(/* webpackChunkName: "olmap" */ '@/components/DrawExtent.vue')

import { layersList, layersGroups, transformLayersTree } from '@/utils/layers'
import { scalesToResolutions } from '@/utils/scales'
import { extentPrecision } from '@/utils/units'

export default {
  name: 'ProjectMap',
  components: { LayersTree, MapView, MapImg, DrawExtent, ExtentField, ScalesList, ThumbnailEditor, VTabsHeader, TextTabsHeader },
  props: {
    project: Object,
    settings: Object
  },
  data () {
    return {
      tab: 'scales',
      legends: {},
      layers: [],
      expanded: {},
      activeExtentEdit: null,
      showLayers: false,
      thumbnailSrc: null
    }
  },
  computed: {
    qgisMeta () {
      return this.project.meta
    },
    groups () {
      // return layersGroups(this.qgisMeta.layers)
      return layersGroups(this.qgisMeta.layers_tree)
    },
    flatLayers () {
      // return Object.values(this.qgisMeta.layers)
      return layersList(this.layers).sort((a, b) => (b.drawing_order || 0) - (a.drawing_order || 0))
    },
    visibleLayers () {
      return this.flatLayers.filter(l => l.visible).map(l => l.server_name || l.name)
    },
    tabsMenu () {
      return [
        { key: 'scales', label: 'Scales' },
        { key: 'extent', label: 'Extent' },
        { key: 'thumbnail', label: 'Thumbnail' },
      ]
    },
    extentMenu () {
      const layers = this.flatLayers.filter(l => l.extent)
      const allLayersExtent = layers.slice(1).reduce((extent, l) => extend(extent, l.extent), layers[0].extent)
      return [
        { text: 'Extent of all layers', value: allLayersExtent },
        { separator: true, text: 'Layers' },
        ...layers.map(l => ({ text: l.title || l.name, value: l.extent }))
      ]
    },
    extentPrecision () {
      return extentPrecision(this.project.meta.units.map, 3)
    }
  },
  watch: {
    qgisMeta: {
      immediate: true,
      handler: 'initLayersModel'
    },
    flatLayers: {
      immediate: true,
      handler: 'fetchLegend'
    }
  },
  methods: {
    initLayersModel (meta) {
      this.layers = transformLayersTree(
        meta.layers_tree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ name: g.name, visible: true, layers })
      )
      this.expanded = this.groups.reduce((obj, g) => (obj[g.name] = true, obj), {})
    },
    updateExtent(key, extent) {
      this.settings[key] = extent?.map(v => round(v, this.extentPrecision))
    },
    roundExtent (extent) {
      extent?.forEach((v, i) => {
        extent[i] = round(v, this.extentPrecision)
      })
      return extent
    },
    toggleDefaultViewExtent (enabled) {
      if (enabled) {
        this.$set(this.settings, 'initial_extent', [...this.settings.extent])
      } else {
        this.$delete(this.settings, 'initial_extent')
      }
    },
    toggleExtentEdit (key) {
      this.activeExtentEdit = this.activeExtentEdit === key ? null : key
    },
    zoomToScale (scale) {
      const res = scalesToResolutions([scale], this.qgisMeta.units)[0]
      const olMap = this.$refs.map.map
      // olMap.getView().setCenter(getCenter(this.settings.extent))
      olMap.getView().setResolution(res)
    },
    resetZoom () {
      const olMap = this.$refs.map.map
      olMap.getView().setCenter(getCenter(this.settings.extent))
    },
    updateScales (scales) {
      // this.settings.scales = scales
      this.$set(this.settings, 'scales', scales)
      this.settings.tile_resolutions = scalesToResolutions(scales, this.qgisMeta.units)
    },
    async fetchLegend () {
      // const layers = this.flatLayers.map(l => l.serverName || l.name)
      const baseParams = {
        // MAP: this.project.name,
        // LAYER: layers.join(','),
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetLegendGraphic',
        EXCEPTIONS: 'application/vnd.ogc.se_xml',
        FORMAT: 'application/json',
        // SYMBOLHEIGHT: '20',
        // SYMBOLWIDTH: '20',
        // SCALE:
        // WIDTH: '50'
      }
      const tasks = this.flatLayers.map(l => {
        const params = { ...baseParams, LAYER: l.server_name || l.name}
        return this.$http
          .get(`/api/project/map/${this.project.name}`, { params })
          .then(resp => ({
            [l.id]: resp.data
          }))
      })
      const legends = await Promise.all(tasks)
      // const { data } = await this.$http.get('/api/project/map', { params })
      // const legends = {}
      // this.legends = mapValues(Object.assign({}, ...legends), l => l.nodes[0]?.symbols?.[0]?.icon)
      this.legends = mapValues(Object.assign({}, ...legends), l => l.nodes[0]?.icon)
    },
    loadThumbnail () {
      const img = this.$refs.map.getImage()
      const width = img.naturalWidth
      const height = img.naturalHeight

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      // return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      canvas.toBlob(data => {
        if (this.thumbnailSrc) {
          URL.revokeObjectURL(this.thumbnailSrc)
        }
        this.thumbnailSrc = URL.createObjectURL(data)
      }, 'image/png')
    },
    removeLocalThumbnail () {
      URL.revokeObjectURL(this.thumbnailSrc)
      this.thumbnailSrc = null
    },
    createThumbnail () {
      const img = this.$refs.map.getImage()
      const scale = 0.5
      const width = Math.round(img.naturalWidth * scale)
      const height = Math.round(img.naturalHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      // ctx.drawImage(img, 0, 0)

      // const sx = Math.round((img.naturalWidth - width) / 2)
      // const sy = Math.round((img.naturalHeight - height) / 2)
      // ctx.drawImage(img, sx, sy, width, height, 0, 0, width, height)

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, width, height)
      canvas.toBlob(data => {
        const f = new FormData()
        f.append('image', data, 'thumbnail.png')
        this.$http.post(`/api/project/thumbnail/${this.project.name}`, f)
      }, 'image/png')
    },
    async setThumbnailFile (e) {
      const file = e.target.files[0]
      e.target.value = ''
      if (!file) {
        return
      }
      const src = URL.createObjectURL(file)
      if (this.thumbnailSrc) {
        URL.revokeObjectURL(this.thumbnailSrc)
      }
      this.thumbnailSrc = src
    }
  }
}
</script>

<style lang="scss" scoped>
.page-content {
  overflow: hidden;
}
.header {
  background-color: var(--color-dark);
  font-weight: 500;
  padding: 3px 8px;
}
.main-layout {
  display: grid;
  grid-template-columns: 1fr 322px;
  gap: 6px;
  height: 100%;
}
.map-container {
  grid-area: 1 / 1 / 2 / 2;
  display: flex;
  .map {
    flex-grow: 1;
  }
}
.map {
  width: 720px;
  // height: 620px;
  // height: 100%;
  // height: 600px;
  // grid-area: 1 / 1 / 2 / 2;

  margin-bottom: 4px;
  border: 1px solid #ddd;
  box-sizing: content-box;
  // overflow: hidden;
}
.panel {
  height: 100%;
  grid-area: 1 / 1 / 2 / 2;
  justify-self: start;
  position: relative;
  background-color: #fff;
  overflow: hidden;
  z-index: 10;
}
.layers-tree {
  width: 300px;
  border-left: 1px solid #ddd;
  overflow: auto;
  .symbol {
    width: 20px;
    margin-left: 4px;
    img {
      max-width: 20px;
      max-height: 20px;
    }
  }
}
.settings {
  // border: 1px solid #ddd;
  // margin-right: 2px;
  min-height: 0;
  overflow: auto;
}
.thumbnail {
  border: 1px dashed var(--border-color, #ddd);
  img {
    width: 100%;
  }
}
</style>
