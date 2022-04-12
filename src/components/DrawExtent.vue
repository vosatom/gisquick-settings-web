<script>
import debounce from 'lodash/debounce'
import ExtentInteraction from 'ol/interaction/Extent'
import MultiPoint from 'ol/geom/MultiPoint'

import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import { fromExtent } from 'ol/geom/Polygon'
import { shiftKeyOnly } from 'ol/events/condition'

// const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path d="m13.406 0 3.545 3.546-4.824 4.824 3.503 3.503 4.824-4.824L24 10.594V0zM8.37 12.127l-4.824 4.824L0 13.406V24h10.594l-3.545-3.546 4.824-4.824z" fill="#fff" stroke="#000" stroke-width="1"/></svg>`

const angles = {
  lt: -90,
  rt: 0,
  rb: 90,
  lb: 180,
  l: 45,
  r: 45,
  t: -45,
  b: -45
}
const cursors = {
  lt: 'nwse-resize',
  rt: 'nesw-resize',
  rb: 'nwse-resize',
  lb: 'nesw-resize',
  l: 'ew-resize',
  r: 'ew-resize',
  t: 'ns-resize',
  b: 'ns-resize'
}

class Handler1 extends ExtentInteraction {
  constructor(opts) {
    super(opts)
    this.style_ = opts.pointerStyle
  }

  // snapToVertex_(pixel, map) {
  //   this.snappedVertex_ = super.snapToVertex_(pixel, map)
  //   return this.snappedVertex_
  // }

  handleEvent (e) {
    if (!this.condition_(e)) {
      document.body.style.cursor = ''
      return super.handleEvent(e)
    }
    const pixel = e.pixel
    const map = e.map
    const vertex = this.snapToVertex_(pixel, map)

    const extent = this.getExtentInternal()
    if (extent && e.type === 'pointerup') {
      this._drawing = false
    }
    // const vertex = this.snappedVertex_

    let style = ''
    if (vertex !== null && extent !== null) {
      const x = vertex[0] === extent[0] ? 'l' : vertex[0] === extent[2] ? 'r' : ''
      const y = vertex[1] == extent[1] ? 'b' : vertex[1] == extent[3] ? 't' : ''
      style = x + y
    }
    // console.log('style', style, vertex, extent)
    if (!this._drawing && style) {
      this.style_.getImage().setRotation((angles[style] || 0) * (Math.PI / 180))
      this.style_.getImage().setOpacity(0.05)
    } else {
      this.style_.getImage().setOpacity(0)
      document.body.style.cursor = ''
    }
    if (style && e.originalEvent.shiftKey) {
      document.body.style.cursor = cursors[style]
    } else {
      document.body.style.cursor = ''
    }
    return super.handleEvent(e)
  }

  handleDownEvent(mapBrowserEvent) {
    const pixel = mapBrowserEvent.pixel
    const map = mapBrowserEvent.map

    // console.log(this.snappedToVertex_)
    const extent = this.getExtentInternal()
    let vertex = this.snapToVertex_(pixel, map)
    if (vertex === null) {
      this._drawing = true
    }
    // if (extent !== null && vertex === null) {
    //   return false
    // }
    return super.handleDownEvent(mapBrowserEvent)
  }
}

class Handler extends ExtentInteraction {

  handleEvent (e) {
    if (!this.condition_(e)) {
      document.body.style.cursor = ''
      return super.handleEvent(e)
    }
    const pixel = e.pixel
    const map = e.map
    const vertex = this.snapToVertex_(pixel, map)

    const extent = this.getExtentInternal()
    if (extent && e.type === 'pointerup') {
      this._drawing = false
    }

    let style = ''
    if (vertex !== null && extent !== null) {
      const x = vertex[0] === extent[0] ? 'l' : vertex[0] === extent[2] ? 'r' : ''
      const y = vertex[1] == extent[1] ? 'b' : vertex[1] == extent[3] ? 't' : ''
      style = x + y
    }
    if (this._drawing || !style) {
      document.body.style.cursor = ''
    }
    if (style && e.originalEvent.shiftKey) {
      document.body.style.cursor = cursors[style]
    } else {
      document.body.style.cursor = ''
    }
    return super.handleEvent(e)
  }

  handleDownEvent(mapBrowserEvent) {
    const pixel = mapBrowserEvent.pixel
    const map = mapBrowserEvent.map

    const vertex = this.snapToVertex_(pixel, map)
    if (vertex === null) {
      this._drawing = true
    }
    return super.handleDownEvent(mapBrowserEvent)
  }

  setActive (active) {
    this.extentOverlay_?.setVisible(active)
    return super.setActive(active)
  }
}

export default {
  name: 'DrawExtent',
  props: {
    color: [Array, String],
    edit: Boolean,
    value: Array
  },
  computed: {
    layerExtent () {
      return !this.edit && this.value
    }
  },
  watch: {
    value (extent) {
      // console.log('extent changed')
      // console.log(this.handler.getExtent(), extent, this.editedExtent === extent)
      if (this.editedExtent !== extent) {
        // console.log('setting extent!')
        this.handler.setExtent(extent)
      }
    },
    color (color) {
      this.normalStyle.getStroke().setColor(color)
      this.layer.changed()
    },
    edit: 'updateVisibility',
    layerExtent (extent) {
      this.feature.setGeometry(extent ? fromExtent(extent) : null)
    }
  },
  created () {
    this.feature = new Feature({ geometry: this.value && fromExtent(this.value) })
    this.source = new VectorSource({
      features: [this.feature]
    })
    this.normalStyle = new Style({
      stroke: new Stroke({
        color: this.color,
        width: 2
      })
    })
    this.layer = new VectorLayer({
      source: this.source,
      style: [
        new Style({
          stroke: new Stroke({
            color: '#fff',
            width: 4
          })
        }),
        this.normalStyle
      ]
    })
  },
  beforeDestroy () {
    if (this.map) {
      this.map.removeLayer(this.layer)
      this.map.removeInteraction(this.handler)
    }
  },
  mounted () {
    this.map = this.$parent.map
    const strokeStyle = new Style({
      stroke: new Stroke({
        color: [ 46, 108, 158, 0.9 ],
        width: 2
      })
    })
    const nodesStyle = new Style({
      image: new Circle({
        radius: 4.5,
        fill: new Fill({ color: [46, 108, 158] })
      }),
      geometry (feature) {
        // return the coordinates of the first ring of the polygon
        const coordinates = feature.getGeometry().getCoordinates()[0]
        return new MultiPoint(coordinates)
      }
    })
    const strokeBg = new Style({
      stroke: new Stroke({
        color: '#fff',
        width: 4
      })
    })
    this.handler = new Handler({
      extent: this.value,
      condition: shiftKeyOnly,
      // condition: e => {
      //   const active = this.edit && e.originalEvent.shiftKey
      //   if (!active && this.handler.vertexOverlay_.getStyle()) {
      //     this.handler.vertexOverlay_.setStyle(null)
      //   }
      //   if (active && !this.handler.vertexOverlay_.getStyle()) {
      //     this.handler.vertexOverlay_.setStyle(this.handler.style_)
      //   }
      //   return active
      // },
      boxStyle: [strokeBg, strokeStyle, nodesStyle],
      pointerStyle: []
      // pointerStyle: new Style({
      //   image: new Icon({
      //     src: 'data:image/svg+xml;utf8,' + escape(svg),
      //     color: [200, 0, 0]
      //   })
      // })
    })

    this.updateVisibility()
    this.map.addLayer(this.layer)
    this.map.addInteraction(this.handler)

    this.handler.on('extentchanged', debounce(evt => {
      // this.editedExtent = evt.extent.map(v => round(v, 2))
      if (this.value !== evt.extent) {
        this.editedExtent = evt.extent
        this.$emit('input', evt.extent)
      }
    }), 50)

    // draw.on('drawend', evt => this.$emit('draw', evt.feature.getGeometry().getExtent()))
    // this.$once('hook:beforeDestroy', () => this.map.removeInteraction(draw))
  },
  methods: {
    updateVisibility () {
      this.layer.setVisible(!this.edit)
      this.handler.setActive(this.edit)
    }
  },
  render: h => null
}
</script>
