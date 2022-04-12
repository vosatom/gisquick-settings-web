<template>
  <div class="thumbnail-editor f-col">
    <!-- <div class="preview m-2" style="">
      <img v-if="src" :src="src" :style="previewStyle"/>
    </div> -->
    <image-viwer
      v-if="src"
      ref="imgViewer"
      :src="src"
      width="300"
      height="200"
      :zoom-levels="zoomLevels"
      @update:viewMatrix="onMatrixChange"
      @change="onViewerChange"
    />

    <div class="xgrid f-row-ac">
      <!-- <span class="label">Zoom</span> -->
      <v-slider
        label="Zoom"
        color="primary"
        class="inline f-grow xmy-0"
        min="0.25"
        max="1.5"
        :transform="roundScale"
        :value="scale"
        hide-range-labels
        @input="setZoom"
      />
      <!-- <span class="m-2 text-right" v-text="scale"/> -->
      <!-- <v-text-field
        class="filled"
        type="number"
        step="0.05"
        :value="scale"
        @input="setZoom"
      /> -->

    </div>

    <!-- <v-btn color="primary" :disabled="!src" @click="generateImage">Generate</v-btn>
    <img v-if="result" :src="result"/> -->
  </div>
</template>

<script>
import range from 'lodash/range'
import ImageViwer from '@/components/image/ImageViewer.vue'

export default {
  components: { ImageViwer },
  props: {
    src: String,
    width: {
      type: [String, Number],
      default: 400
    },
    heigth: {
      type: [String, Number],
      default: 400
    }
  },
  computed: {
    previewStyle () {
      const x = -this.offset[0] + 'px'
      const y = -this.offset[1] + 'px'
      return {
        transform: `translate(${x}, ${y}) scale(${this.scale}, ${this.scale})`
      }
    },
    zoomLevels () {
      return range(0.25, 1.5, 0.05)
    }
  },
  data () {
    return {
      offset: [0, 0],
      scale: 1,
      matrix: null,
      result: null
    }
  },
  methods: {
    roundScale (v) {
      let f = parseFloat(v.toFixed(2))
      const int = parseInt(v)
      const d = 100 * (f - int)
      return int + (Math.round(d / 5) * 5) / 100
    },
    onMatrixChange (m) {
      this.matrix = m
      this.scale = this.roundScale(m[0])
      console.log('onMatrixChange')
    },
    onViewerChange (m) {
      console.log('onViewerChange', m)
    },
    setZoom (z) {
      this.$refs.imgViewer.setZoom(z)
    },
    async getThumbnailImage () {
      const img = this.$el.querySelector('img')
      const { offsetWidth: iWidth, offsetHeight: iHeight } = this.$refs.imgViewer.$el
      const im = new DOMMatrix(this.matrix).invertSelf()
      const sp = im.transformPoint(new DOMPoint(0, 0))
      const ep = im.transformPoint(new DOMPoint(iWidth, iHeight))
      const scale = this.width / iWidth
      console.log(sp, ep)
      const params = [sp.x, sp.y, ep.x - sp.x, ep.y - sp.y, 0, 0, iWidth * scale, iHeight * scale].map(v => Math.round(v))
      const width = params[6]
      const height = params[7]
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, ...params)
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png')
      })
    },
    generateImage () {
      const img = this.$el.querySelector('img')
      const { offsetWidth: width, offsetHeight: height }= this.$refs.imgViewer.$el

      // Ver.1
      // const canvas = document.createElement('canvas')
      // canvas.width = width
      // canvas.height = height
      // const ctx = canvas.getContext('2d')
      // ctx.setTransform(...this.matrix)
      // ctx.drawImage(img, 0, 0)

      // Ver.2
      const im = new DOMMatrix(this.matrix).invertSelf()
      const sp = im.transformPoint(new DOMPoint(0, 0))
      const ep = im.transformPoint(new DOMPoint(width, height))
      console.log('drawImg', sp.x, sp.y, ep.x - sp.x, ep.y - sp.y)
      const scale = this.width / width
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, sp.x, sp.y, ep.x - sp.x, ep.y - sp.y, 0, 0, width * scale, height * scale)

      canvas.toBlob(data => {
        if (this.result) {
          URL.revokeObjectURL(this.result)
        }
        this.result = URL.createObjectURL(data)
      }, 'image/png')
    }
  }
}
</script>

<style lang="scss" scoped>
.preview {
  display: grid;
  // width: 300px;
  height: 200px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color, #ddd);
}
.image-viewer {
  height: 200px;
  border: 1px solid var(--border-color, #ddd);
  box-sizing: content-box;
}
.grid {
  display: grid;
  // grid-template-columns: 1fr 80px;
  grid-template-columns: auto 1fr;
  align-items: end;
}
</style>
