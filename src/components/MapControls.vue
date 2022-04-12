<template>
  <div class="map-controls dark">
    <transition name="fade">
      <div v-if="compassVisible">
        <v-btn
          class="compass icon"
          @click="resetNorth"
        >
          <v-icon
            name="compass"
            size="30"
            :style="compassStyle"
          />
        </v-btn>
      </div>
    </transition>
    <v-btn
      class="zoom-in icon"
      @click="zoomIn"
    >
      <v-icon name="plus"/>
    </v-btn>
    <v-btn
      class="zoom-out icon"
      @click="zoomOut"
    >
      <v-icon name="minus"/>
    </v-btn>
    <v-btn
      class="icon"
      @click="zoomToMax"
    >
      <v-icon name="zoom-max"/>
    </v-btn>
  </div>
</template>

<script>
import ZoomControl from 'ol/control/Zoom'
import { unByKey } from 'ol/Observable'

export default {
  name: 'map-control',
  data () {
    return {
      rotation: 0
    }
  },
  computed: {
    compassVisible () {
      return this.rotation !== 0
    },
    compassStyle () {
      return {
        transform: `rotate(${this.rotation}rad)`
      }
    }
  },
  created () {
    this.$map = this.$parent.map
    this.zoom = Object.create(ZoomControl.prototype)
    Object.assign(this.zoom, {
      duration_: 250,
      getMap: () => this.$map
    })
  },
  mounted () {
    const listener = this.$map.getView().on('change:rotation', (e) => {
      this.rotation = e.target.get(e.key)
    })
    this.$once('hook:beforeDestroy', () => {
      unByKey(listener)
    })
  },
  methods: {
    zoomIn (evt) {
      this.zoom.handleClick_(1, evt)
    },
    zoomOut (evt) {
      this.zoom.handleClick_(-1, evt)
    },
    zoomToMax () {
      this.$emit('reset-zoom')
      // const extent = this.project.config.project_extent
      // const padding = this.$map.ext.visibleAreaPadding()
      // this.$map.getView().fit(extent, { duration: 400, padding })
    },
    resetNorth () {
      this.$map.getView().animate({ rotation: 0, duration: 300 })
    }
  }
}
</script>

<style lang="scss" scoped>
.map-controls {
  .btn {
    // background-color: var(--color-dark);
    background-color: var(--color-primary);
    // background-color: #555;
    width: 26px;
    height: 26px;
    margin: 2px;
    border-radius: 4px;
    // opacity: 0.9;
  }
  &.f-col {
    .btn {
      &.zoom-in {
        border-bottom-left-radius: 1px;
        border-bottom-right-radius: 1px;
        margin-bottom: 1px;
      }
      &.zoom-out {
        border-top-left-radius: 1px;
        border-top-right-radius: 1px;
        margin-top: 0;
      }
    }
  }
  &.f-row {
    .btn {
      &.zoom-in {
        border-top-right-radius: 1px;
        border-bottom-right-radius: 1px;
        margin-right: 1px;
      }
      &.zoom-out {
        border-top-left-radius: 1px;
        border-bottom-left-radius: 1px;
        margin-left: 1px;
      }
    }
  }
}
</style>
