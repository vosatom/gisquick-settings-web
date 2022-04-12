<template>
  <popup-content
    backhandler
    portal="overlay"
    :open.sync="open"
    :transition="transition"
    :popup-class="['mobile-dialog', contentClass]"
    :popup-style="popupStyle"
    @click:out="close"
    @keydown.esc="close"
    v-on="$listeners"
  >
    <slot name="header" :close="close">
      <div class="header f-row-ac light">
        <v-btn @click="close">
          <v-icon class="mr-2" name="arrow-backward"/>
          <translate>Back</translate>
        </v-btn>
        <slot name="header-apend" :close="close"/>
      </div>
    </slot>
    <slot :close="close"/>
  </popup-content>
</template>

<script>
import PopupContent from './PopupContent.vue'

const FullscreenSwitch = {
  enter () {
    let scrollY = document.scrollingElement.scrollTop
    this._scroll = scrollY
    document.body.classList.add('overlay', 'enter-active')
    setTimeout(() => {
      document.body.classList.remove('enter-active')
    }, 500)
  },
  leave () {
    document.body.classList.add('leave-active')
    document.scrollingElement.scrollTop = this._scroll
    setTimeout(() => {
      document.body.classList.remove('overlay', 'leave-active')
    }, 500)
  }
}

export default {
  components: { PopupContent },
  props: {
    contentClass: {
      type: String,
      default: 'light'
    },
    title: String,
    transition: {
      type: [String, Object],
      default: 'slide-y'
    },
    value: Boolean
  },
  data () {
    return {
      open: false
    }
  },
  computed: {
    popupStyle () {
      return {
        backgroundColor: '#fff',
        width: '100%',

        // for scrolling pages
        // position: 'static',
        // minHeight: '100vh',

        // for "fullscreen apps"
        position: 'fixed',
        inset: '0'
        // height: window.innerHeight + 'px'
      }
    }
  },
  watch: {
    open (open) {
      open ? FullscreenSwitch.enter() : FullscreenSwitch.leave()
    },
    value: {
      immediate: true,
      handler (open) {
        open ? this.show() : this.close()
      }
    }
  },
  beforeDestroy () {
    if (this.open) {
      FullscreenSwitch.leave()
    }
  },
  methods: {
    show () {
      this.open = true
    },
    close (res) {
      this.open = false
      this.$emit('close', res)
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  background-color: #eee;
  position: sticky;
  top: 0;
  z-index: 1;
  // border-bottom: 1px solid #eee;
}
</style>