<template>
  <div
    role="checkbox"
    class="switch"
    :class="{focused, checked}"
    :disabled="disabled"
    :aria-disabled="disabled"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="label"
    :style="colorVars"
    :tabindex="disabled ? -1 : 0"
    @focus="focused = !disabled"
    @blur="focused = false"
    @click="toggleValue"
    @keydown.space.prevent="toggleValue"
  >
    <div class="box">
      <div class="toggle"/>
    </div>
    <slot name="tooltip"/>
    <slot>
      <span v-text="label"/>
    </slot>
  </div>
</template>

<script>
import { colorVars } from './utils/colors'

export default {
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean,
    falseValue: {
      default: false
    },
    label: String,
    trueValue: {
      default: true
    },
    val: {},
    value: [Boolean, Array]
  },
  data () {
    return {
      focused: false
    }
  },
  computed: {
    colorVars () {
      return colorVars(this.color)
    },
    arrayModel () {
      return Array.isArray(this.value)
    },
    checked () {
      if (this.arrayModel) {
        return this.value.includes(this.val)
      }
      return this.value === this.trueValue
    }
  },
  methods: {
    toggleValue () {
      if (!this.disabled) {
        let value
        if (this.arrayModel) {
          if (this.checked) {
            value = this.value.filter(v => v !== this.val)
          } else {
            value = this.value.concat(this.val)
          }
        } else {
          value = this.checked ? this.falseValue : this.trueValue
        }
        this.$emit('input', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.switch {
  display: flex;
  align-items: center;
  margin: 6px;
  outline: none;
  cursor: pointer;
  user-select: none;
  gap: 6px;
  &[disabled] {
    opacity: 0.75;
    cursor: not-allowed;
  }
  &.focused, &:hover:not([disabled]) {
    .box {
      box-shadow: 2px 2px 6px rgba(var(--color-rgb), 0.25);
    }
  }
  .box {
    height: 15px;
    width: 28px;
    background-color: #777;
    border-radius: inherit;
    position: relative;
    display: flex;
  }
  &.checked {
    .box {
      background-color: var(--color);
    }
    .toggle {
      transform: translate(13px, 0);
    }
  }
  .toggle {
    transition: all 0.4s cubic-bezier(.25,.8,.25,1);
    background-color: #fff;
    border-radius: inherit;
    width: 13px;
    margin: 1px;
  }
  &.round {
    border-radius: 8px;
  }
}
</style>
