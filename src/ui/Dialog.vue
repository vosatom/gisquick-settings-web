<template>
  <popup-content
    backhandler
    type="dialog"
    :backdrop="modal"
    :open.sync="open"
    :transition="transition"
    :popup-class="popupClass"
    @update:open="close"
    @click:out="closeIfAllowed"
    @keydown.esc="closeIfAllowed"
    @closed="$emit('closed')"
    @opened="$emit('opened')"
  >
    <slot name="header">
      <div v-if="title" class="header dark">
        <slot name="title">
          <span class="title" v-text="title"/>
        </slot>
        <v-btn class="icon" @click="close">
          <v-icon name="x"/>
        </v-btn>
      </div>
    </slot>
    <slot
      v-if="open"
      :close="close"
      :data="data"
    />
  </popup-content>
</template>

<script>
import PopupContent from './PopupContent.vue'

export default {
  components: { PopupContent },
  props: {
    contentClass: {
      type: String,
      default: 'light'
    },
    modal: {
      type: Boolean,
      default: true
    },
    title: String,
    transition: {
      type: [String, Object],
      default: 'slide-y'
    },
    persistent: Boolean,
    value: Boolean
  },
  data () {
    return {
      data: null,
      open: false
    }
  },
  computed: {
    popupClass () {
      return ['dialog', 'popup-content', this.contentClass]
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        if (val !== this.open) {
          val ? this.show() : this.close()
        }
      }
    }
  },
  methods: {
    show (data) {
      this.open = true
      this.data = data
    },
    close () {
      this.open = false
      this.$emit('close')
      this.$emit('input', false)
    },
    closeIfAllowed () {
      !this.persistent && this.close()
    }
  }
}
</script>

<style lang="scss">
.dialog {
  text-align: left;
  font-size: 14px;
  > .header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    // padding: 12px;
    text-align: center;
    background-color: var(--color-dark);
    .title {
      grid-area: 1 / 1 / 2 / 3;
      margin: 0 6px;
      font-size: 20px;
      justify-self: center;
      max-width: calc(100% - 100px);
    }
    .btn {
      grid-area: 1 / 2 / 2 / 3;
      min-width: 26px;
      width: 26px;
      height: 26px;
      align-self: start;
    }
  }
}
</style>
