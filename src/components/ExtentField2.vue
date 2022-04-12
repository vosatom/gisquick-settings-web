<template>
  <input-field
    color="primary"
    class="extent-field"
    :class="{focused}"
    :label="label"
    :style="markColor"
  >
    <div class="actions f-row-ac">
      <v-btn
        class="icon flat my-0"
        :color="edit ? 'primary' : ''"
        @click="$emit('update:edit', !edit)"
      >
        <v-icon name="map-edit"/>
      </v-btn>
      <v-menu
        v-if="menu"
        aria-label="Menu"
        transition="slide-y"
        align="rr;bb,tt"
        content-class="popup-menu"
        :items="menu"
        @confirm="menuHandler"
      >
        <template v-slot:activator="{ toggle }">
          <v-btn aria-label="Menu" class="icon" @click="toggle">
            <v-icon name="menu"/>
          </v-btn>
        </template>
      </v-menu>
    </div>
    <div class="fields f-col">
      <v-text-field
        v-for="(label, i) in fields"
        :key="i"
        :label="label"
        class="filled"
        type="number"
        step="any"
        :value="value[i]"
        @change="updateExtentCoord($event, i)"
      />
    </div>
  </input-field>
</template>

<script>
import InputField from '@/ui/InputField.vue'
import Focusable from '@/ui/mixins/Focusable'
import { colorVars } from '@/ui/utils/colors'

export default {
  mixins: [Focusable],
  components: { InputField },
  props: {
    color: String,
    edit: Boolean,
    label: String,
    menu: Array,
    value: Array
  },
  computed: {
    fields () {
      return ['X-Min', 'Y-Min', 'X-Max', 'Y-Max']
    },
    markColor () {
      return this.color ? colorVars(this.color, 'mark-color') : {}
    }
  },
  methods: {
    updateExtentCoord (val, index) {
      const value = [...this.value]
      value[index] = val
      this.$emit('input', value)
    },
    menuHandler (item) {
      this.$emit('input', item.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.i-field.extent-field {
  > ::v-deep label {
    grid-area: 1 / 1 / 2 / 2;
    align-self: center;
  }
  .actions {
    grid-area: 1 / 1 / 2 / 2;
    justify-self: end;
  }
}
.fields {
  position: relative;
  padding-left: 3px;
  &::before {
    content: "";
    position: absolute;
    inset-block: 4px;
    left: 0;
    width: 3px;
    background-color: var(--mark-color);
  }
}
</style>
