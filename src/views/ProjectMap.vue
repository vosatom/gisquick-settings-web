<template>
  <div class="page-content f-col f-grow light">

    <!-- <div class="menu f-row">
      <v-btn class="item">Scales</v-btn>
      <v-btn class="item">Extent</v-btn>
      <v-btn class="item">Thumbnail</v-btn>
    </div> -->

    <!-- <text-tabs-header :items="tabsMenu" v-model="tab"/> -->
    <div class="map-section f-grow">
      <div class="settings f-col">
        <text-tabs-header :items="tabsMenu" v-model="tab"/>
        <!-- <v-tabs-header :items="tabsMenu" v-model="tab"/> -->
        <v-scroll-area>
          <v-tabs :items="tabsMenu" v-model="tab">
            <template v-slot:scales>
              <scales-list
                label="Scales"
                :value="settings.scales"
                @input="updateScales"
                @click:scale="zoomToScale"
                class="scales-list"
              />
            </template>
            <template v-slot:extent>
              <!-- <div class="f-col">
                <div class="f-row-ac">
                  <span class="f-grow">Map Extent</span>
                  <v-btn
                    class="icon flat"
                    :color="drawExtent ? 'primary' : ''"
                    @click="drawExtent = !drawExtent"
                  >
                    <v-icon name="map-edit"/>
                  </v-btn>
                  <v-menu
                    aria-label="Menu"
                    transition="slide-y"
                    align="rr;bb,tt"
                    class="m-2"
                    content-class="popup-menu"
                    :items="extentMenu"
                  >
                    <template v-slot:activator="{ toggle }">
                      <v-btn aria-label="Menu" class="icon" @click="toggle">
                        <v-icon name="menu"/>
                      </v-btn>
                    </template>
                  </v-menu>
                </div>
                <v-text-field
                  v-for="(label, i) in ['X-Min', 'Y-Min', 'X-Max', 'Y-Max']"
                  :key="i"
                  :label="label"
                  class="filled"
                  type="number"
                  step="any"
                  :value="settings.extent[i]"
                  @change="updateExtentCoord($event, i)"
                />
              </div> -->
              <extent-field
                label="Map Extent"
                color="red"
                :edit="activeExtentEdit === 'extent'"
                :menu="extentMenu"
                :value="settings.extent"
                @input="settings.extent = roundExtent($event)"
                @update:edit="toggleExtentEdit('extent')"
                @zoomto="zoomToExtent"
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
                @zoomto="zoomToExtent"
              />
            </template>

            <template v-slot:thumbnail>
              <div class="m-2">
                <div class="f-row-ac f-justify-end">
                  <span class="label f-grow">Thumbnail image</span>
                  <!-- <v-btn v-if="project.thumbnail" class="icon" @click="deleteThumbnail">
                    <v-icon name="delete_forever"/>
                  </v-btn> -->
                  <div class="v-separator"/>
                  <input
                    ref="input"
                    type="file"
                    hidden
                    accept="image/*"
                    @input="setThumbnailFile"
                    @change="setThumbnailFile"
                  />
                  <v-btn class="icon" @click="$refs.input.click()">
                    <v-icon name="folder-open"/>
                  </v-btn>
                  <v-btn class="icon" @click="loadThumbnailFromMap">
                    <v-icon name="map"/>
                  </v-btn>
                  <!-- <v-menu
                    aria-label="Menu"
                    transition="slide-y"
                    align="rr;bb,tt"
                    content-class="popup-menu"
                    :items="thumbnailMenu"
                  >
                    <template v-slot:activator="{ toggle }">
                      <v-btn aria-label="Menu" class="icon" @click="toggle">
                        <v-icon name="menu"/>
                      </v-btn>
                    </template>
                  </v-menu> -->
                </div>
                <thumbnail-editor v-if="thumbnailSrc" ref="thumbnailEditor" :src="thumbnailSrc"/>
                <div v-else class="thumbnail f-col">
                  <img v-if="project.thumbnail" :src="`/api/project/thumbnail/${project.name}`"/>
                  <div v-else class="f-col-ac">
                    <map-img class="placeholder" width="110"/>
                    <small class="uppercase mb-2">No Thumbnail</small>
                  </div>
                </div>
                <div v-if="thumbnailSrc" class="f-row-ac light mb-2">
                  <v-btn color="green" class="f-grow" @click="saveThumbnail">
                    <v-icon name="save" class="mr-2"/>
                    <span>Save</span>
                  </v-btn>
                  <v-btn color="red" class="outlined f-grow" @click="removeLocalThumbnail">
                    <v-icon name="x" color="red" class="mr-2"/>
                    <span>Cancel</span>
                  </v-btn>
                </div>
              </div>
              <!-- <div class="f-row f-justify-center">
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
                  <span>Select</span>
                </v-btn>
                <v-btn color="#555" class="small outlined" @click="loadThumbnailFromMap">
                  <v-icon name="map" color="#555" class="mr-2"/>
                  <span>Map</span>
                </v-btn>
                <v-btn
                  v-if="project.thumbnail && thumbnailSrc"
                  class="icon"
                  :disabled="!project.thumbnail && !thumbnailSrc"
                  @click="removeLocalThumbnail"
                >
                  <v-icon name="delete_forever"/>
                </v-btn>
              </div> -->
            </template>
            <template v-slot:other>
              <v-checkbox
                label="Map Tiling"
                v-model="settings.map_tiling"
              />
              <small class="mx-2">
                Enables tiled rendering of overlay layers.
                Faster in most cases, but can cause visual artifacts in symbols and labels.
                It may be helpful to set the <strong>Tile buffer</strong> parameter in QGIS project properties (QGIS Server tab).
              </small>
            </template>
          </v-tabs>
        </v-scroll-area>
      </div>

      <map-view
        ref="map"
        class="m-2"
        :project="project.name"
        :layers="visibleLayers"
        :config="project.meta"
        :settings="settings"
      >
        <template v-slot:toolbar>
          <v-btn class="layers-toggle icon flat" :color="showLayers ? 'primary' : ''" @click="showLayers = !showLayers">
            <!-- <v-icon name="overlays"/> -->
            <v-icon size="24" name="layers"/>
          </v-btn>
        </template>
        <template v-slot:toolbar-end>
          <v-btn class="icon" @click="reloadProject">
            <v-tooltip slot="tooltip" text="Reload project on QGIS server"/>
            <v-icon name="server_reload" size="24"/>
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

        <div v-if="activeExtentEdit" class="f-row f-justify-center m-1">
          <small>Hold <strong>Shift</strong> key to modify extent area</small>
        </div>
      </map-view>

      <portal :to="panelTarget">
        <transition name="slide-left">
          <div class="layers-panel f-col light" v-if="pageVisible && showLayers">
            <div class="header">
              Layers
            </div>
            <v-scroll-area>
              <layers-tree :layers="layers" :legend-fetcher="legendFetcher"/>
            </v-scroll-area>
          </div>
        </transition>
      </portal>
    </div>
  </div>
</template>

<script>
import round from 'lodash/round'
import { extend, getCenter } from 'ol/extent'

import Page from '@/mixins/Page'
import LayersTree from '@/components/LayersTree.vue'
import ScalesList from '@/components/ScalesList.vue'
// import ExtentField from '@/components/ExtentField.vue'
import ExtentField from '@/components/ExtentField2.vue'
import ThumbnailEditor from '@/components/ThumbnailEditor.vue'
import TextTabsHeader from '@/ui/TextTabsHeader.vue'
import VTabsHeader from '@/ui/TabsHeader.vue'
import MapImg from '@/assets/map.svg?component'
import { layersList, layersGroups, transformLayersTree, filterLayers } from '@/utils/layers'
import { scalesToResolutions } from '@/utils/scales'
import { extentPrecision } from '@/utils/units'

function formatLegendData (data) {
  let { symbols, ...attrs } = data.nodes[0] || {}
  symbols = symbols?.filter(s => s.icon)
  return {
    ...attrs,
    symbols: symbols?.length ? symbols : null
  }
}

function LegendFetcher (http, url) {
  const cache = {}
  const baseParams = {
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
  return {
    async fetch (layer, forceFetch = false) {
      if (!forceFetch && cache[layer.name]) {
        return { data: cache[layer.name] }
      }
      const params = { ...baseParams, LAYER: layer.name}
      let { data } = await http.get(url, { params })
      data = formatLegendData(data)
      cache[layer.name] = data
      return { data } // format for watchTask
    }
  }
}

export default {
  name: 'ProjectMap',
  components: {
    LayersTree, MapImg, ExtentField, ScalesList, ThumbnailEditor, VTabsHeader, TextTabsHeader,
    MapView: async () => (await import('@/components/map-components')).Map,
    DrawExtent: async () => (await import('@/components/map-components')).DrawExtent
  },
  mixins: [ Page ],
  props: {
    project: Object,
    settings: Object
  },
  data () {
    return {
      tab: 'scales',
      layers: [],
      activeExtentEdit: null,
      showLayers: false,
      thumbnailSrc: null
    }
  },
  computed: {
    panelTarget () {
      return window.innerWidth > 1700 ? 'right-panel' : 'left-panel'
    },
    qgisMeta () {
      return this.project.meta
    },
    groups () {
      return layersGroups(this.qgisMeta.layers_tree)
    },
    flatLayers () {
      // return Object.values(this.qgisMeta.layers)
      const layersOrder = this.qgisMeta.layers_order.reduce((res, id, i) => (res[id] = i, res), {})
      return layersList(this.layers).sort((a, b) => (layersOrder[b.id] ?? 0) - (layersOrder[a.id] ?? 0))
      // return layersList(this.layers).sort((a, b) => (b.drawing_order || 0) - (a.drawing_order || 0))
    },
    hiddenLayers () {
      const hiddenGroups = layersGroups(this.layers).filter(g => !g.visible)
      return new Set([].concat(...hiddenGroups.map(g => layersList(g.layers))).map(l => l.id))
    },
    visibleLayers () {
      return this.flatLayers.filter(l => l.visible && !this.hiddenLayers.has(l.id)).map(l => l.name)
    },
    tabsMenu () {
      return [
        { key: 'scales', label: 'Scales' },
        { key: 'extent', label: 'Extent' },
        { key: 'thumbnail', label: 'Thumbnail' },
        { key: 'other', label: 'Other' }
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
    },
    thumbnailMenu () {
      return [
        { text: 'Input', separator: true },
        { text: 'Select File', action: () => this.$refs.input.click(), icon: 'folder-open' },
        { text: 'Import Map', action: this.loadThumbnailFromMap, icon: 'map' },
        { text: 'Actions', separator: true },
        { text: 'Remove', action: this.removeLocalThumbnail },

      ]
    }
  },
  created () {
    this.initLayersModel(this.qgisMeta)
    this.legendFetcher = LegendFetcher(this.$http, `/api/project/ows/${this.project.name}`)
  },
  methods: {
    initLayersModel (meta) {
      const layers = transformLayersTree(
        meta.layers_tree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ ...g, id: g.name, layers, visible: true, expanded: true })
      )
      // this.layers = filterLayers(layers, l => l.type !== 'VectorLayer' || l.options.wkb_type !== 'NoGeometry')
      this.layers = filterLayers(layers, l => meta.layers_order.includes(l.id))
      // this.layers = filterLayers(layers, l => meta.layers_order.includes(l.id) && !this.settings.layers[l.id].flags.includes('render_off'))
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
    zoomToExtent (extent) {
      const olMap = this.$refs.map.map
      olMap.getView().fit(extent, { padding: [50, 50, 50, 50] })
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
    loadThumbnailFromMap () {
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
    },
    async saveThumbnail () {
      const image = await this.$refs.thumbnailEditor.getThumbnailImage()
      const f = new FormData()
      f.append('image', image, 'thumbnail.png')

      try {
        await this.$http.post(`/api/project/thumbnail/${this.project.name}`, f)
        this.project.thumbnail = true
        this.$notify.success('Thumbnail was saved')
      } catch (err) {
        this.$notify.error('Failed to save thumbnail')
      }
      /*
      console.log('save', params)
      const width = params[6]
      const height = params[7]
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, sp.x, sp.y, ep.x - sp.x, ep.y - sp.y, 0, 0, width * scale, height * scale)

      canvas.toBlob(data => {
        if (this.result) {
          URL.revokeObjectURL(this.result)
        }
        this.result = URL.createObjectURL(data)
      }, 'image/png')
      */
    },
    async reloadProject () {
      // try {
      //   await this.$http.post(`/api/project/reload/${this.project.name}`)
      //   this.$notify.success('Success')
      // } catch (err) {
      //   this.$notify.error('Error')
      // }
      this.$http.post(`/api/project/reload/${this.project.name}`)
        .then(() => this.$notify.success('Success'))
        .catch(() => this.$notify.error('Error'))
    }
  }
}
</script>

<style lang="scss" scoped>
.page-content {
  overflow: hidden;
}
.header {
  background-color: #eee;
  border-bottom: 1px solid #ddd;
  font-weight: 500;
  padding: 4px 8px;
}
.map-section {
  display: grid;
  grid-template-columns: 302px 1fr;
  // grid-template-columns: 280px 720px;
  gap: 6px;
  height: 100%;

  // border: 1px solid #ddd;
  .map {
    grid-area: 1 / 2 / 2 / 3;
    align-self: start;
    justify-self: end;
    width: clamp(400px, 720px, 100%);
    // width: clamp(400px, 100%, 720px);
    ::v-deep {
      .map-canvas {
        height: 580px;
      }
    }
  }
}
.layers-panel {
  height: 100%;

  position: relative;
  background-color: #fff;
  overflow: hidden;
  // border-right: 1px solid #ddd;
  margin: 4px;
}
.layers-tree {
  overflow: auto;
}
// .layers-control {
//   position: absolute;
//   inset: 0;
//   z-index: 1;
//   display: grid;
//   justify-content: end;
//   .layers-tree {
//     width: 300px;
//     align-self: end;
//     justify-self: end;
//     background-color: #fff;
//   }
// }

.settings {
  // border-right: 3px solid #ddd;
  overflow: hidden;
}
.thumbnail {
  border: 1px dashed var(--border-color, #ddd);
  img {
    width: 100%;
  }
}
.label {
  font-weight: 500;
  font-size: 13px;
  opacity: 0.8;
}
</style>
