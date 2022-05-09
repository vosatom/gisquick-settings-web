<template>
  <!-- <popup-content
    persistent
    type="Notification"
    :transition="transition"
    :open.sync="open"
    :backdrop="backdrop"
    :align="align"
    :popup-class="contentClass"
    :popup-style="popupStyle"
    @closed="afterClosed"
  >
    <div class="notification">
      <slot
        :is-open="open"
        :close="close"
      >
        <span>Notification</span>
      </slot>
    </div>
  </popup-content> -->
  <portal to="popup">
    <transition :name="transition">
      <div v-if="open" class="popup-container" :style="popupStyle">
        <slot
          :is-open="open"
          :close="close"
          v-bind="data"
        >
          <div class="notification" :class="data.class">
            <v-icon v-if="data.icon" :name="data.icon" class="mr-2"/>
            <span v-text="data.msg"/>
          </div>
        </slot>
      </div>
    </transition>
  </portal>
</template>

<script>
import PopupContent from '@/ui/PopupContent.vue'

export default {
  components: { PopupContent },
  props: {
    align: String,
    backdrop: Boolean,
    closeOnClick: Boolean,
    contentClass: {
      type: String,
      default: 'notification light'
    },
    transition: {
      type: [String, Object],
      default: 'slide-y-rev'
    },
    timeout: {
      type: Number,
      default: 2000
    }
  },
  data () {
    return {
      data: null,
      open: false
    }
  },
  computed: {
    popupStyle () {
      return {
        alignSelf: 'end',
        justifySelf: 'end'
      }
    }
  },
  methods: {
    show (opts) {
      const { timeout, ...data } = opts
      this.open = true
      this.data = data
      setTimeout(this.close, timeout ?? this.timeout)
    },
    close () {
      this.open = false
      this.$emit('close')
      this.$emit('input', false)
    },
    showSuccess (msg, opts) {
      const params = {
        class: 'success dark',
        icon: 'check',
        msg,
        ...opts
      }
      this.show(params)
    },
    showError (msg, opts) {
      const params = {
        class: 'error dark',
        icon: 'warning',
        msg,
        ...opts
      }
      this.show(params)
    },
    afterClosed () {
      this.data = null
      this.$emit('closed')
    }
  }
}
</script>

<style lang="scss" scoped>
.notification {
  margin: 16px;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  &.success {
    background-color: var(--color-green);
  }
  &.error {
    background-color: var(--color-red);
  }
}
</style>
