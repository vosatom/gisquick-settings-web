<template>
  <div
    class="scroll-container"
    @mouseenter="recalculate"
  >
    <div
      ref="scrollContent"
      class="scroll-content"
      :style="containerStyle"
      @scroll="recalculate"
    >
      <div
        :class="contentWrapperClass"
        :style="wrapperStyle"
      >
        <slot/>
      </div>
    </div>

    <div ref="trackY" class="scrollbar-track vertical">
      <div
        class="scrollbar"
        :class="{active: activeScroll}"
        :style="scrollbarStyleY"
        @mousedown="dragStart"
      />
    </div>
    <div ref="trackX" class="scrollbar-track horizontal">
      <div
        class="scrollbar"
        :class="{active: activeScroll}"
        :style="scrollbarStyleX"
        @mousedown="dragStart2"
      />
    </div>
  </div>
</template>

<script>
import { DragHandler, eventCoord } from '@/events'

let scrollBarWidth = null
function getScrollBarWidth () {
  if (scrollBarWidth !== null) {
    return scrollBarWidth
  }
  const inner = document.createElement('p')
  inner.style.width = '100%'
  inner.style.height = '200px'
  const outer = document.createElement('div')
  outer.style.position = 'absolute'
  outer.style.top = 0
  outer.style.left = 0
  outer.style.visibility = 'hidden'
  outer.style.width = '200px'
  outer.style.height = '150px'
  outer.style.overflow = 'hidden'
  outer.appendChild(inner)
  document.body.appendChild(outer)
  const w1 = inner.offsetWidth
  outer.style.overflow = 'scroll'
  let w2 = inner.offsetWidth
  if (w1 === w2) {
    w2 = outer.clientWidth
  }
  document.body.removeChild(outer)
  scrollBarWidth = w1 - w2
  return scrollBarWidth
}

export default {
  props: {
    contentWrapperClass: [String, Object, Array]
  },
  data () {
    return {
      scrollbarSize: getScrollBarWidth(),
      activeScroll: false,
      scrollbarStyleY: {
        top: 0,
        height: 0,
        display: 'none'
      },
      scrollbarStyleX: {
        left: 0,
        width: 0,
        display: 'none'
      }
    }
  },
  computed: {
    containerStyle () {
      return {
        paddingRight: `${this.scrollbarSize}px`,
        paddingBottom: `${this.scrollbarSize}px`
      }
    },
    wrapperStyle () {
      return {
        marginRight: `${-this.scrollbarSize}px`,
        marginBottom: `${-this.scrollbarSize}px`
      }
    }
  },
  mounted () {
    this.recalculate()

    if (typeof MutationObserver !== 'undefined') {
      // create an observer instance
      this.mutationObserver = new MutationObserver(mutations => this.recalculate())

      this.mutationObserver.observe(
        this.$refs.scrollContent,
        // { childList: true, subtree: true }
        { attributes: true, childList: true, characterData: true, subtree: true }
      )
    }
  },
  methods: {
    recalculate () {
      // console.log('recalculate')
      if (!this.$refs.scrollContent) {
        return
      }
      const { offsetHeight, scrollHeight, scrollTop } = this.$refs.scrollContent
      const trackSize = this.$refs.trackY.offsetHeight
      const scrollbarSize = Math.round((offsetHeight / scrollHeight) * trackSize)
      const position = scrollTop / (scrollHeight - offsetHeight)

      this.scrollRatioY = (scrollHeight - offsetHeight) / (trackSize - scrollbarSize)
      this.scrollbarStyleY.top = ((trackSize - scrollbarSize) * position) + 'px'
      this.scrollbarStyleY.height = scrollbarSize + 'px'
      this.scrollbarStyleY.display = scrollHeight > offsetHeight ? '' : 'none'

      // horizontal
      const { offsetWidth, scrollWidth, scrollLeft } = this.$refs.scrollContent
      const trackSizeX = this.$refs.trackX.offsetWidth
      const scrollbarSizeX = Math.round((offsetWidth / scrollWidth) * trackSizeX)
      const positionX = scrollLeft / (scrollWidth - offsetWidth)

      this.scrollRatioX = (scrollWidth - offsetWidth) / (trackSizeX - scrollbarSizeX)
      this.scrollbarStyleX.left = ((trackSizeX - scrollbarSizeX) * positionX) + 'px'
      this.scrollbarStyleX.width = scrollbarSizeX + 'px'
      this.scrollbarStyleX.display = scrollWidth > offsetWidth ? '' : 'none'
    },
    dragStart (evt) {
      this.dragOrigin = {
        x: evt.screenX,
        y: evt.screenY,
        scrollTop: this.$refs.scrollContent.scrollTop
      }
      this.activeScroll = true
      document.addEventListener('mousemove', this.dragMove)
      document.addEventListener('mouseup', this.dragEnd, { once: true })
      evt.preventDefault()
    },
    dragMove (evt) {
      const mouseOffset = (evt.screenY - this.dragOrigin.y) * this.scrollRatioY
      this.$refs.scrollContent.scrollTop = this.dragOrigin.scrollTop + mouseOffset
    },
    dragEnd () {
      this.activeScroll = false
      document.removeEventListener('mousemove', this.dragMove)
    },
    dragStart2 (evt) {
      const origin = {
        pos: eventCoord(evt),
        scrollStart: this.$refs.scrollContent.scrollLeft
      }
      this.activeScroll = true
      DragHandler(evt, {
        onMove: e => {
          const offset = (eventCoord(e)[0] - origin.pos[0]) * this.scrollRatioX
          this.$refs.scrollContent.scrollLeft = origin.scrollStart + offset
        },
        onEnd: e => {
          this.activeScroll = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-container {
  position: relative;
  overflow: hidden!important;
  display: flex;
}

.scrollbar-track {
  position: absolute;
  z-index: 1;
  &.vertical {
    top: 0;
    right: 0;
    bottom: 0;
    width: 11px;
    .scrollbar {
      min-height: 10px;
      right: 0;
      width: 6px;
    }
  }
  &.horizontal {
    left: 0;
    right: 0;
    bottom: 0;
    height: 11px;
    .scrollbar {
      min-width: 10px;
      bottom: 0;
      height: 6px;
    }
  }
}

.scrollbar-track {
  .scrollbar.active {
    opacity: 0.5;
  }
}
.scroll-container:hover > .scrollbar-track {
  .scrollbar {
    opacity: 0.5;
  }
}

.scrollbar {
  position: absolute;
  opacity: 0;
  border-radius: 3px;
  background-color: #222;
  transition: opacity 0.2s linear;
  user-select: none;
}

.scroll-content {
  // overflow-x: hidden;
  overflow-x: scroll;
  overflow-y: scroll;
  box-sizing: content-box;
  min-width: 100%;
  min-height: 100%;
}
</style>
