<template>
  <field-wrapper
    :class="{focused}"
    :focus="focus"
    :label="label"
    :style="colorVars"
  >
  <div
    class="text-field"
    :class="{focused, multiline}"
    :aria-disabled="disabled"
    :disabled="disabled"
    :style="colorVars"
    :tabindex="disabled ? -1 : 0"
    @click="onClick"
    @focus="focus"
  >
    <slot name="prepend"/>
    <component
      :is="inputTag"
      tabindex="-1"
      ref="inputEl"
      v-bind="$attrs"
      :name="name"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :readonly="readonly === undefined ? !focused : readonly"
      @pointerup="updateCaretPosition"
      @input="onInput"
      @change="onChange"
      @focus="onInputFocus"
      @blur="onInputBlur"
      @ontouchstart="focused = true"
      @keyup="updateCaretPosition"
      @keydown="$emit('keydown', $event)"
    />
    <slot name="append"/>
  </div>
  </field-wrapper>
</template>

<script>
import { colorVars } from './utils/colors'
import FieldWrapper from './InputField.vue'

const FormatSymbols = {
  N: /[0-9]/,
  S: /[a-zA-Z]/,
  A: /[0-9a-zA-Z]/
}

function cleanValue (value, mask) {
  const extraChars = {}
  const validators = []
  mask.split('').forEach(ms => {
    const regex = FormatSymbols[ms]
    if (regex) {
      validators.push(regex)
    } else {
      extraChars[ms] = true
    }
  })
  let validator = validators.shift()
  return value.split('').filter(ch => {
    if (!extraChars[ch] && validator && validator.test(ch)) {
      validator = validators.shift()
      return true
    }
  }).join('')
}

function formatValue (value, mask) {
  const chars = value.toString().split('')
  let val = ''
  let pos = 0
  let replaced = 0
  while (replaced < chars.length) {
    while (pos < mask.length && !FormatSymbols[mask[pos]]) {
      val += mask[pos]
      pos++
    }
    if (pos >= mask.length) {
      break
    }
    val += chars[replaced]
    replaced++
    pos++
  }
  return val
}
/*
function formatValue2 (value, mask) {
  const max = mask.split('').filter(c => !!FormatSymbols[c]).length
  const chars = value.toString().split('').slice(0, max)
  const output = []
  let pos = 0
  chars.forEach(ch => {
    while (!FormatSymbols[mask[pos]]) {
      output.push(mask[pos])
      pos++
    }
    output.push(ch)
    pos++
  })
  return output.join('')
}
*/

export default {
  components: { FieldWrapper },
  inheritAttrs: false,
  props: {
    autofocus: Boolean,
    value: [String, Number],
    name: String,
    autocomplete: String,
    error: String,
    color: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean,
    label: String,
    lazy: Boolean,
    readonly: Boolean,
    trim: Boolean,
    multiline: Boolean,
    displayFormat: String,
    validChars: String
    // valueFormat: String
  },
  data () {
    return {
      focused: false
    }
  },
  computed: {
    inputTag () {
      return this.multiline ? 'textarea' : 'input'
    },
    colorVars () {
      return this.color && colorVars(this.color)
    },
    inputValue () {
      const value = this.value || ''
      if (this.displayFormat) {
        return formatValue(value, this.displayFormat)
      }
      return value
    },
    cleanFn () {
      if (this.validChars) {
        const re = new RegExp(this.validChars)
        return text => text.split('').filter(ch => re.test(ch)).join('')
      }
      return null
    }
  },
  watch: {
    focused (v) {
      this.$emit(v ? 'focus' : 'blur')
    },
    inputValue (v) {
      this.$refs.inputEl.value = v
    }
  },
  mounted () {
    this.$refs.inputEl.value = this.inputValue
    if (this.autofocus) {
      this.focus()
    }
  },
  methods: {
    focus () {
      if (this.disabled || !this.$refs.inputEl) {
        return
      }
      if (!this.focused) {
        this.focused = true
        this.$refs.inputEl.value = this.inputValue
      }
      this.$refs.inputEl.focus()
      if (this.blurTimer) {
        clearTimeout(this.blurTimer)
        this.blurTimer = null
      }
    },
    onInputFocus () {
      if (!this.focused) {
        this.focused = true
      }
      if (this.blurTimer) {
        clearTimeout(this.blurTimer)
        this.blurTimer = null
      }
    },
    onInputBlur () {
      this.blurTimer = setTimeout(() => {
        this.focused = false
        this.blurTimer = null
        if (!this._isDestroyed) {
          this.$refs.inputEl.value = this.inputValue
        }
      }, 100)
    },
    onClick (e) {
      if (!this.disabled) {
        this.focus()
        this.$emit('click', e)
      }
    },
    updateCaretPosition (e) {
      this.lastCaretPosition = e.target.selectionStart
    },
    onInput (e) {
      let value = e.target.value
      if (this.cleanFn) {
        const cleaned = this.cleanFn(value)
        if (cleaned !== value) {
          e.target.value = cleaned
          value = cleaned
        }
      }
      const mask = this.displayFormat
      if (mask) {
        value = cleanValue(value, mask)
        let pos = e.target.selectionStart
        if (e.inputType === 'insertText' || e.inputType === 'insertFromPaste') {
          const offset = mask.slice(this.lastCaretPosition, pos).split('').filter(c => !FormatSymbols[c]).length
          pos += offset
        }
        e.target.value = formatValue(value, mask)
        e.target.setSelectionRange(pos, pos)
        this.lastCaretPosition = pos // helps when writing with long holding of single key
      }
      if (this.trim) {
        value = value.trim()
      }
      if (value !== this.value && !this.lazy) {
        this.$emit('input', value)
      }
    },
    onChange (e) {
      this.$emit(this.lazy ? 'input' : 'change', e.target.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.text-field {
  height: 32px;
  margin: var(--gutter);
  display: flex;
  align-items: center;
  min-width: 0;

  // border: solid #bbb;
  // border-width: 0 0 1px 0;

  transition: all .4s cubic-bezier(.25,.8,.25,1);
  background-color: var(--fill-color);

  outline: none;
  &.multiline {
    height: 200px;
  }
  &.focused {
    border-color: var(--status-color, var(--color));
  }

  input, textarea {
    display: inline-block;
    border: none;
    font-size: inherit;
    outline: none;
    // padding: 8px;
    background-color: transparent;
    flex: 1;
    min-width: 0;
    height: inherit;
    color: inherit;
    text-align: inherit;
    font-family: inherit;
  }
  // input[type=number] {
  //   -moz-appearance: textfield;
  //   &::-webkit-inner-spin-button {
  //     -webkit-appearance: none;
  //   }
  // }
  textarea {
    resize: none;
    min-height: 100%;
  }

  // Variants
  &.flat {
    border: solid #bbb;
    border-width: 0 0 1px 0;
    &[disabled] {
      background-color: #EAEAEA;
      border-style: dashed;
    }
  }
  &.filled {
    border: 1px solid var(--status-color, #bbb);
    border-radius: 3px;
    transition: all .4s cubic-bezier(.25,.8,.25,1);
    background-color: var(--fill-color);
    position: relative;
    &::after {
      content: "";
      position: absolute;
      // bottom: -2px;
      bottom: 0;
      right: 0;
      width: 0;
      height: 1px;
      background-color: var(--status-color, var(--color));
      transition: width .3s cubic-bezier(.25,.8,.25,1);
      z-index: 1;
    }
    &.focused {
      border-color: var(--status-color, var(--color));
      &::after {
        width: 100%;
      }
    }
    &[disabled] {
      --fill-color: transparent;
      // border-style: dashed;
    }
  }
}
</style>
