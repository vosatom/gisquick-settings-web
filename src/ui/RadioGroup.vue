<template>
  <input-field
    class="radio-group"
    :class="{focused}"
    :color="color"
    :error="error"
    :label="label"
  >
    <v-radio-btn
      v-for="item in items"
      :key="item[itemValue]"
      :color="color"
      :label="item[itemText]"
      :val="item[itemValue]"
      :value="value"
      @input="$emit('input', $event)"
    >
      <template v-slot:append>
        <slot name="item-append" :item="item"/>
      </template>
    </v-radio-btn>
  </input-field>
</template>

<script>
import InputField from './InputField.vue'
import Focusable from './mixins/Focusable'

export default {
  components: { InputField },
  mixins: [ Focusable ],
  props: {
    items: Array,
    itemValue: {
      type: String,
      default: 'value'
    },
    itemText: {
      type: String,
      default: 'text'
    },
    color: String,
    value: {},
    error: String,
    label: String
  }
}
</script>

<style lang="scss" scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  &.two-line {
    .radio-btn {
      display: grid;
      grid-template-columns: auto 1fr;
      ::v-deep {
        .radio {
          grid-row: 1 / 3;
          align-self: start;
        }
      }
    }
  }
}
</style>
