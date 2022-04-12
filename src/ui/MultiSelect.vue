<template>
  <div
    role="button"
    class="multiselect"
    :class="{focus, open}"
    :style="colorVars"
    :disabled="disabled"
    aria-haspopup="listbox"
    :aria-disabled="disabled"
    :aria-expanded="open ? 'true' : 'false'"
    :aria-owns="listId"
    :tabindex="disabled ? -1 : 0"
    @focus="focus = true"
    @blur="onBlur"
    @click="openPopup"
  >
    <div
      v-if="value && value.length > 0"
      class="selection"
    >
      <template v-for="item in selectedItems">
        <slot name="selection" :item="item">
          <div
            :key="item[itemKey]"
            class="item f-row-ac"
          >
            <v-tooltip v-if="itemTooltip">
              <span v-text="item[itemTooltip]"/>
            </v-tooltip>
            <span class="mr-2" v-text="item[itemText]"/>
            <v-icon name="close-circle" size="16" @click.stop="toggleSelected(item, false)"/>
          </div>
        </slot>
      </template>
    </div>
    <span v-else class="placeholder">{{ placeholder }}</span>

    <span class="f-grow"/>
    <document-listener
      v-if="focus && !open && !disabled"
      @keydown.space.prevent="openPopup"
    />
    <popup-content
      ref="popup"
      backhandler
      origin="multiselect"
      transition="slide-y"
      :open.sync="open"
      :bounds="bounds"
      :align="align"
      :popup-class="contentClass"
      :popup-style="popupStyle"
      @click:out="popupClick"
      @keydown.esc="closePopup(true)"
      @keydown.tab.prevent="closePopup(true)"
      @keydown.space.stop=""
    >
      <slot
        name="popup"
        :is-open="open"
        :close="closePopup"
        :id="listId"
      >
        <div class="popup-content f-col">
          <slot
            name="options"
            :is-open="open"
            :close="closePopup"
            :id="listId"
          >
            <div
              class="options scrollable f-col py-2"
              role="listbox"
              tabindex="-1"
              :id="listId"
              :style="colorVars"
            >
              <template v-for="(item, index) in items">
                <slot
                  name="item"
                  :item="item"
                  :index="index"
                  :selected="selected.item === item"
                >
                  <v-checkbox
                    class="px-2"
                    :color="color"
                    :label="item[itemText]"
                    :value="selected[item[itemKey]]"
                    @input="toggleSelected(item, $event)"
                  />
                </slot>
              </template>
            </div>
          </slot>
          <hr/>
          <v-btn :color="color" @click="closePopup(true)">
            Potvrdiť
          </v-btn>
        </div>
      </slot>
    </popup-content>
  </div>
</template>

<script>
import VBtn from './Button.vue'
import VCheckbox from './Checkbox.vue'
import VIcon from './Icon.vue'
import VTooltip from './Tooltip.vue'
import PopupContent from './PopupContent.vue'
import DocumentListener from './DocumentListener.js'
import { elementBounds } from './utils/popup'
import { colorVars } from './utils/colors'

export default {
  name: 'MultiSelect',
  components: { VBtn, VIcon, VCheckbox, VTooltip, PopupContent, DocumentListener },
  props: {
    align: String,
    color: {
      type: String,
      default: 'primary'
    },
    contentClass: {
      type: String,
      default: 'popup-multiselect'
    },
    disabled: Boolean,
    items: Array,
    itemText: {
      type: String,
      default: 'text'
    },
    itemKey: {
      type: String,
      default: 'value'
    },
    itemTooltip: String,
    placeholder: String,
    value: Array
  },
  data () {
    return {
      open: false,
      bounds: null,
      focus: false,
      listId: null // todo
    }
  },
  computed: {
    popupStyle () {
      return this.bounds && { width: this.bounds.width + 'px' }
    },
    colorVars () {
      return colorVars(this.color)
    },
    selected () {
      const key = this.itemKey
      return this.value?.reduce((obj, item) => (obj[item[key]] = true, obj), {}) || {}
    },
    selectedItems () {
      return this.items?.filter(i => this.selected[i[this.itemKey]])
    }
  },
  watch: {
    focus (v) {
      this.$emit(v ? 'focus' : 'blur')
    },
    value () {
      this.$nextTick(() => {
        this.bounds = elementBounds(this.$el)
        this.$nextTick(() => {
          this.$refs.popup.updatePosition()
        })
      })
    }
  },
  created () {
    this.listId = this._uid
  },
  methods: {
    focusComponent () {
      if (!this.disabled) {
        this.$el.focus()
      }
    },
    onBlur () {
      if (!this.open) {
        this.focus = false
      }
    },
    openPopup () {
      if (!this.disabled) {
        this.bounds = elementBounds(this.$el)
        this.open = true
      }
    },
    closePopup (focus) {
      this.open = false
      if (focus === true) {
        this.focusComponent()
      }
    },
    popupClick (e) {
      if (!this.$el.contains(e.target)) {
        this.closePopup()
        this.focus = false
      }
    },
    toggleSelected (item, value) {
      if (value) {
        const isAllSelected = this.selectedItems?.find(i => i.all)
        if (isAllSelected) {
          // remove ALL option
          this.$emit('input', [...this.selectedItems.filter(i => !i.all), item])
        } else if (item.all) {
          // select only ALL option
          this.$emit('input', [item])
        } else {
          this.$emit('input', [...this.selectedItems, item])
        }
      } else {
        let val = this.selectedItems.filter(i => i[this.itemKey] !== item[this.itemKey])
        if (val.length === 0) {
          val = this.items.filter(i => i.all)
        }
        this.$emit('input', val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.multiselect {
  display: flex;
  align-items: center;
  margin: 6px;
  padding: 2px 8px;
  min-height: 50px;
  border: 1px solid #ddd;
  border-radius: 3px;
  transition: all .4s cubic-bezier(.25,.8,.25,1);
  outline: none;
  cursor: default;
  background-color: #fff;

  &.focus {
    border-color: var(--status-color, var(--color));
  }
  &[disabled] {
    opacity: 0.5;
    // pointer-events: none;
    cursor: not-allowed;
    user-select: none;
  }

  .placeholder {
    opacity: 0.6;
    user-select: none;
  }
  .selection {
    display: flex;
    flex-wrap: wrap;
    .item {
      color: #fff;
      background-color: var(--color);
      border-radius: 6px;
      // margin: 3px;
      margin: 3px 6px 3px 0;
      padding: 4px 8px;
    }
  }
}
.popup-content {
  max-height: 100%;
  &,.options {
    min-height: 0;
    flex-shrink: 1;
  }
  .options {
    outline: none;
  }
  .btn {
    height: 40px;
    flex-shrink: 0;
  }
}
</style>
