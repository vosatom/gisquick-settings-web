<template>
  <div
    class="list"
    :aria-disabled="disabled"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
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
    <slot name="prepend"/>
    <slot v-if="!items.length" name="empty"/>
    <div v-else class="scrollarea" @mouseout="highlightIndex = -1">
      <div
        v-if="items && items.length > 0"
        tabindex="-1"
        role="listbox"
        class="popup-list"
        :style="colorVars"
      >
        <template v-for="(item, index) in renderItems">
          <div
            :key="index"
            ref="item"
            class="item"
            role="option"
            :class="{
              selected: selectedItem === item,
              highlighted: highlightIndex === index
            }"
            @click="onItemClick(item, index)"
            @mouseover="highlightIndex = index"
          >
            <slot v-if="item === appendItem" name="append-item"/>
            <slot
              v-else
              name="item"
              :item="item"
              :index="index"
            >
              <span v-text="item[itemText]"/>
            </slot>
          </div>
        </template>
      </div>
    </div>
    <slot name="append"/>
  </div>
</template>

<script>
import clamp from 'lodash/clamp'
import { colorVars } from './utils/colors'
import InputField from './InputField.vue'
import DocumentListener from './DocumentListener'
import Focusable from './mixins/Focusable'

export default {
  components: { DocumentListener, InputField },
  mixins: [ Focusable ],
  props: {
    error: String,
    color: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean,
    items: Array,
    itemKey: String,
    itemText: String,
    label: String,
    selected: {}
  },
  data () {
    return {
      highlightIndex: -1
    }
  },
  computed: {
    colorVars () {
      return this.color && colorVars(this.color)
    },
    renderItems () {
      return this.items || []
    },
    appendItem () {
      return this.$scopedSlots['append-item'] && {}
    },
    selectedItem () {
      if (this.itemKey) {
        return this.renderItems?.find(i => i[this.itemKey] === this.selected)
      }
      return Number.isInteger(this.selected) ? this.renderItems[this.selected] : null
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
        // this.$refs.list.focus()
      }
    },
    onItemClick (item, index) {
      this.$emit('click-item', item, index)
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
      if (!this.$refs.list?.contains(e.target)) {
        // this.focused = false
      } else {
        // this.$emit('click:in', e)
      }
    },
    keyHandler (e) {
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
.list {
  display: flex;
  flex-direction: column;
  // border: 1px solid var(--border-color);
  outline: none;
  .item {
    padding: 0 6px;
  }
  .scrollarea {
    flex-grow: 1;
    overflow: auto;
  }
}
</style>