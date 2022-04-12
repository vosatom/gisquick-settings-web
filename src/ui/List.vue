<template>
  <input-field
    class="list-field"
    :class="{focused}"
    :color="color"
    :focus="focusComponent"
    :error="error"
    :label="label"
  >
    <document-listener
      v-if="focused"
      stacked
      :key="_uid"
      src="list"
      @click="onDocumentClick"
      @keydown="keyHandler"
      @keydown.up.prevent="highlight(highlightIndex - 1)"
      @keydown.down.prevent="highlight(highlightIndex + 1)"
      @keydown.home.prevent="highlight(0)"
      @keydown.end.prevent="highlight(items.length)"
    />
    <div class="box">
      <slot name="prepend"/>
      <div
        ref="list"
        class="list"
        :aria-disabled="disabled"
        :disabled="disabled"
        :tabindex="disabled ? -1 : 0"
        @click="onClick"
        @xfocus="focused = true"
        @xblur="onBlur"
      >
        <div
          v-if="items && items.length > 0"
          tabindex="-1"
          role="listbox"
          class="popup-content popup-list"
          :style="colorVars"
        >
          <template v-for="(item, index) in renderItems">
            <div
              :key="index"
              ref="item"
              xtabindex="0"
              class="item"
              role="option"
              :class="{
                highlighted: highlightIndex === index
              }"
              @click="selectItem(item)"
              @mouseover="highlightIndex = index"
            >
              <slot v-if="item === appendItem" name="append-item"/>
              <slot
                v-else
                name="item"
                :item="item"
                :index="index"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </input-field>
</template>

<script>
import clamp from 'lodash/clamp'
import { colorVars } from './utils/colors'
import InputField from './InputField.vue'
import DocumentListener from './DocumentListener'

export default {
  components: { DocumentListener, InputField },
  props: {
    error: String,
    color: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean,
    items: Array,
    label: String
  },
  data () {
    return {
      // focused: false,
      highlightIndex: -1
    }
  },
  computed: {
    focused () {
      const activeEl = this.$ui.activeEl
      return this.$el?.contains(activeEl)
    },
    colorVars () {
      return this.color && colorVars(this.color)
    },
    renderItems () {
      return this.items || []
    },
    appendItem () {
      return this.$scopedSlots['append-item'] && {}
    }
  },
  methods: {
    highlight (index) {
      this.highlightIndex = clamp(index, 0, this.renderItems.length - 1)
      const el = this.$refs.item && this.$refs.item[this.highlightIndex]
      el && el.scrollIntoView({ block: 'nearest' })
    },
    focusComponent () {
      if (!this.disabled) {
        // this.$el.querySelector('[tabindex]').focus()
        this.$refs.list.focus()
      }
    },
    selectItem (item) {
      if (item === this.appendItem) {
        this.$emit('append-item:click')
      } else {
        // this.onInput(item)
      }
      this.focusComponent()
    },
    onClick (e) {
      if (!this.disabled) {
        this.focusComponent()
        this.$emit('click', e)
      }
    },
    onDocumentClick (e) {
      if (e.clientX < 0 || e.clientY < 0 || e.clientY > window.innerHeight) {
        return // outside of page, ignore (mouse drag with release/mouseup outside)
      }
      if (!this.$refs.list.contains(e.target)) {
        // this.focused = false
      } else {
        // this.$emit('click:in', e)
      }
    },
    keyHandler (e) {
      console.log(e)
      if (e.code === 'up') {

      }
    },
    onBlur (e) {
      // console.log(e)
      // console.log(document.activeElement)
      // setTimeout(() => {
      //   console.log(document.activeElement)
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.list-field {
  &.focused {
    .box {
      border-color: var(--color);
    }
  }
}
.box {
  border: 1px solid var(--border-color);
}
.list {
  // border: 1px solid var(--border-color);
  outline: none;
  .item {
    padding: 0 6px;
  }
}
</style>