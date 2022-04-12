<template>
  <div class="extent-field f-col">
    <div class="f-row-ac">
      <span class="f-grow" v-text="label"/>
      <v-btn
        class="icon flat"
        :color="edit ? 'primary' : ''"
        @click="$emit('update:edit', !edit)"
      >
        <v-icon name="map-edit"/>
      </v-btn>
      <!-- <div class="f-grow"/> -->
      <v-menu
        v-if="menu"
        aria-label="Menu"
        transition="slide-y"
        align="rr;bb,tt"
        class="m-2"
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
</template>

<script>
// import round from 'lodash/round'

export default {
  props: {
    edit: Boolean,
    label: String,
    menu: Array,
    value: Array
  },
  computed: {
    fields () {
      return ['X-Min', 'Y-Min', 'X-Max', 'Y-Max']
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
