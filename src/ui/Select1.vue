<template>
  <field-wrapper
    :class="{focused}"
    :focus="focusComponent"
    :label="label"
    :style="colorVars"
  >
  <div
    ref="select"
    role="button"
    class="select"
    :class="{focused, open}"
    :disabled="disabled"
    :style="!label && colorVars"
    aria-haspopup="true"
    :aria-disabled="disabled"
    :aria-expanded="open ? 'true' : 'false'"
    :aria-owns="listId"
    :tabindex="disabled ? -1 : 0"
    @focus="onFocus"
    @blur="onBlur"
    @click="toggle"
  >
    <slot
      name="selection"
      v-if="selected && selected.item"
      v-bind="selected"
    >
      <span class="value f-grow">{{ simpleItems ? selected.item : selected.item[itemText] }}</span>
    </slot>
    <span v-else class="placeholder">{{ placeholder }}</span>
    <svg
      class="toggle"
      width="11"
      height="11"
      viewBox="0 0 10 10"
      @click.stop="toggle"
    >
      <path d="M 1,3 L 5,7 L 9,3"/>
    </svg>
    <document-listener
      v-if="focused && !open && !disabled"
      @keydown.space.prevent="openPopup"
      @keydown.up.prevent="select(selected.index - 1)"
      @keydown.down.prevent="select(selected.index + 1)"
      @keydown="keyHandler"
    />
    <popup-content
      backhandler
      transition="slide-y"
      :open.sync="open"
      :bounds="bounds"
      :align="align"
      :popup-class="contentClass"
      :popup-style="popupStyle"
      @click:out="popupClick"
      @click:in="closePopup"
      @keydown.esc="closePopup"
      @keydown.tab.prevent="closePopup"
      @keydown.up.prevent="highlight(highlightIndex - 1)"
      @keydown.down.prevent="highlight(highlightIndex + 1)"
      @keydown.enter="onEnter"
      @keydown.space.prevent=""
      @keydown="keyHandler"
      @opened="highlight(selected.index)"
    >
      <div
        class="popup-content popup-list"
        role="listbox"
        tabindex="-1"
        :id="listId"
        :style="colorVars"
      >
        <template v-for="(item, index) in items">
          <div
            :key="index"
            ref="item"
            tabindex="0"
            role="option"
            class="item"
            :class="{
              highlighted: highlightIndex === index,
              selected: selected.item === item
            }"
            @click="selectItem(item)"
            @mouseover="highlightIndex = index"
          >
            <slot
              name="item"
              :item="item"
              :index="index"
              :selected="selected.item === item"
            >
              <span v-text="simpleItems ? item : item[itemText]" class="f-grow m-2"/>
            </slot>
          </div>
        </template>
      </div>
    </popup-content>
  </div>
  </field-wrapper>
</template>

<script>
import debounce from 'lodash/debounce'
// import FieldWrapper from './FieldWrapper2.vue'
import PopupContent from './PopupContent.vue'
import DocumentListener from './DocumentListener.js'
import { escapeRegExp, removeDiacritics } from './utils/text'
import { elementBounds } from './utils/popup'
import { colorVars } from './utils/colors'

const FieldWrapper = {
  functional: true,
  props: {
    label: String,
    focus: Function
  },
  render (h, ctx) {
    const { label, focus } = ctx.props
    if (label) {
      return <div class="field" {...ctx.data}><label onClick={focus}>{label}</label>{ctx.children}</div>
    }
    return ctx.children
  }
}

// const FieldWrapper = {
//   props: {
//     label: String
//   },
//   render () {
//     const { label } = this
//     if (label) {
//       return <div class="field f-col"><label>{label}</label>{this.$slots.default}</div>
//     }
//     return this.$slots.default
//   }
// }

let counter = 1
export default {
  components: { FieldWrapper, PopupContent, DocumentListener },
  props: {
    align: {
      type: String,
      // default: 'rr;bb,tt'
    },
    color: {
      type: String,
      default: 'primary'
    },
    contentClass: {
      type: String,
      default: 'popup-select'
    },
    disabled: Boolean,
    items: Array,
    itemText: {
      type: String,
      default: 'text'
    },
    itemValue: {
      type: String,
      default: 'value'
    },
    label: String,
    placeholder: String,
    value: {}
  },
  data () {
    return {
      open: false,
      bounds: null,
      highlightIndex: -1,
      focused: false,
      search: '',
      listId: null
    }
  },
  computed: {
    popupStyle () {
      return this.bounds && { minWidth: this.bounds.width + 'px' }
    },
    colorVars () {
      return colorVars(this.color)
    },
    selected () {
      const index = this.items.findIndex(item => this._itemValue(item) === this.value)
      const item = this.items[index]
      return { index, item }
    },
    simpleItems () {
      return this.items.some(i => i[this.itemText] === undefined)
    }
  },
  watch: {
    focused (v) {
      this.$emit(v ? 'focus' : 'blur')
    }
  },
  created () {
    this.listId = `select-list-${counter++}`
  },
  methods: {
    _itemValue (item) {
      return !this.itemValue || this.simpleItems ? item : item[this.itemValue]
    },
    onFocus () {
      console.log('onFocus')
      if (!this.disabled) {
        this.focused = true
      }
    },
    onBlur () {
      console.log('onBlur', 'open:', this.open)
      if (!this.open) {
        this.focused = false
      }
    },
    openPopup () {
      if (!this.disabled) {
        this.bounds = elementBounds(this.$el)
        this.open = true
      }
    },
    closePopup () {
      this.open = false
    },
    toggle () {
      if (!this.disabled) {
       this.open ? this.closePopup() : this.openPopup()
      }
    },
    popupClick (e) {
      if (!this.$el.contains(e.target)) {
        this.closePopup()
        this.focused = false
      }
    },
    highlight (index) {
      this.highlightIndex = Math.max(0, Math.min(this.items.length - 1, index))
      const el = this.$refs.item && this.$refs.item[this.highlightIndex]
      el && el.scrollIntoView({ block: 'nearest' })
    },
    onEnter () {
      if (this.highlightIndex !== -1) {
        this.select(this.highlightIndex)
        this.closePopup()
      }
    },
    focusComponent () {
      if (!this.disabled) {
        // this.$el.focus()
        this.$refs.select.focus()
      }
    },
    select (index) {
      const item = this.items[index]
      item && this.selectItem(item)
    },
    selectItem (item) {
      console.log('selectItem')
      this.$emit('input', this._itemValue(item))
      this.focusComponent()
    },
    _clearSearch: debounce(function () {
      this.search = ''
    }, 400),
    keyHandler (e) {
      if (e.key.length === 1) {
        this.search += e.key
        this._clearSearch()
        const action = this.open ? this.highlight : this.select
        const currentIndex = this.open ? this.highlightIndex : this.selected.index
        const re = new RegExp('^' + escapeRegExp(removeDiacritics(this.search)), 'i')
        const testItem = item => {
          const value = this._itemValue(item)?.toString()
          return re.test(removeDiacritics(value))
        }
        if (this.search.length === 1 && currentIndex !== -1) {
          const next = this.items[currentIndex + 1]
          if (next && testItem(this.items[currentIndex]) && testItem(next)) {
            action(currentIndex + 1)
            return
          }
        }
        const index = this.items.findIndex(testItem)
        if (index !== -1) {
         action(index)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.select {
  display: flex;
  align-items: center;
  margin: var(--gutter);
  padding: 0 8px;
  height: 32px;
  // border: 1px solid #ddd;
  // border-radius: 2px;

  border: solid #bbb;
  border-width: 0 0 1px 0;
  border-radius: 0;
  padding: 0 1px;
  
  transition: all .4s cubic-bezier(.25,.8,.25,1);
  outline: none;
  cursor: default;
  // background-color: rgba(#fff, 0.8);
  background-color: var(--fill-color);

  // box-shadow: 2px 4px 8px rgba(#000, 0.05);
  // box-shadow: 2px 4px 10px rgba(#000, 0.15);
  // border-top-left-radius: 4px;
  // border-top-right-radius: 4px;

  &.focused {
    border-color: var(--status-color, var(--color));
    // box-shadow: 2px 4px 10px rgba(var(--color-rgb), 0.15);

    .toggle {
      color: var(--status-color, var(--color));
      
    }
  }
  &[disabled] {
    opacity: 0.5;
    // pointer-events: none;
    cursor: not-allowed;
    user-select: none;
    border-style: dashed;
  }
  .placeholder {
    opacity: 0.6;
  }
  .toggle {
    padding: 4px;
    margin-left: 8px;
    transition: 0.25s transform ease;
    box-sizing: content-box;
    path {
      stroke: none;
      fill: currentColor;
      // fill: var(--color, currentColor);
    }
  }
  &.open {
    .toggle {
      transform: rotate(180deg);
    }
  }
}
// .field {
//   margin: 6px;
//   display: grid;
//   &.inline {
//     align-items: center;
//     grid-auto-flow: column;
//     gap: 6px;
//     .select {
//       border-width: 1px;
//       padding-left: 6px;
//     }
//   }
//   &.focused {
//     ::v-deep {
//       label {
//         opacity: 1;
//         color: var(--color);
//       }
//     }
//   }
//   ::v-deep label {
//     text-transform: uppercase;
//     font-size: 11.5px;
//     font-weight: bold;
//     line-height: 1;
//     opacity: 0.6;
//   }
//   .select {
//     margin: 0;
//   }
// }
</style>
