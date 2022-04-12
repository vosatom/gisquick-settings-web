<template>
  <input-field
    class="file-field"
    :class="{focused}"
    :color="color"
    :error="error"
    :label="label"
  >
    <div
      class="input"
      :aria-disabled="disabled"
      :disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @click="onClick"
      @keydown.stop="onKeydown"
    >
      <slot name="prepend"/>
      <span v-if="placeholder && !valueText" class="placeholder" v-text="placeholder"/>
      <span v-else v-text="valueText"/>
      <input
        v-bind="$attrs"
        :disabled="disabled"
        ref="inputEl"
        hidden
        type="file"
        tabindex="-1"
        :multiple="multiple"
        @input="onUpdateEvent"
        @change="onUpdateEvent"
      />
      <v-icon name="x" @click.stop="clear"/>
      <slot name="append"/>
    </div>
  </input-field>
</template>

<script>
import { colorVars } from './utils/colors'
import InputField from './InputField.vue'
import Focusable from './mixins/Focusable'

function FilesList (files) {
  return Object.freeze(Array.from(files))
}

export default {
  mixins: [Focusable],
  components: { InputField },
  inheritAttrs: false,
  props: {
    value: [Array, File],
    name: String,
    error: [String, Error],
    color: {
      type: String,
      default: 'primary'
    },
    disabled: Boolean,
    label: String,
    placeholder: String,
    multiple: Boolean
  },
  computed: {
    colorVars () {
      return this.color && colorVars(this.color)
    },
    valueText () {
      const text = this.multiple ? this.value?.map(f => f.name).join(', ') : this.value?.name
      return text || ''
    }
  },
  watch: {
    focused (v) {
      this.$emit(v ? 'focus' : 'blur')
    },
    value () {
      if (this.$refs.inputEl) { // or this._isMounted ??
        // or clear only when input value is null?
        this.$refs.inputEl.value = null
      }
    }
  },
  methods: {
    onClick (e) {
      if (!this.disabled) {
        this.$refs.inputEl.click()
        // this.focus()
        // this.$emit('click', e)
      }
    },
    clear () {
      this.$refs.inputEl.value = null
      this.$emit('input', null)
      this.$emit('change', null)
    },
    onUpdateEvent (e) {
      const { files } = e.target
      if (files.length) {
        this.$emit(e.type, this.multiple ? FilesList(files) : files[0])
      }
    },
    onKeydown (e) {
      // console.log('onKeydown', e)
      if (e.code === 'Enter' || e.code === 'Space') {
        this.$refs.inputEl.click()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.input {
  display: flex;
  align-items: center;
  min-width: 0;
  // min-width: 200px;
  line-height: normal; // (nice center alignment of span and input elements)
  outline: none;
  input {
    display: inline-block;
    // display: none;
    // opacity: 0;
    visibility: hidden;
    flex: 1;
  }
}
</style>
