<template>
  <div class="flags-list">
    <!-- <v-list :items="options">
      <template v-slot:item="{ item: flag }">
        <v-btn
          :key="`k-${flag.value}`"
          class="icon flat"
          :color="flag.disabled ? '#ddd' : flagsSet.has(flag.value) ? 'primary' : '#888'"
          @click="toggleFlag(flag)"
        >
          <v-icon :name="flag.icon"/>
        </v-btn>
        <span :key="`v-${flag.value}`" class="label" v-text="flag.text"/>
      </template>
    </v-list> -->

    <template v-for="(flag, index) in displayedOptions">
      <template v-if="!flag.separator">
        <v-btn
          :key="`k-${flag.value}`"
          class="icon flat"
          :color="flag.disabled ? '#ddd' : flagsSet.has(flag.value) ? 'primary' : '#888'"
          @click="toggleFlag(flag)"
        >
          <v-icon :name="flag.icon"/>
        </v-btn>
        <span :key="`v-${flag.value}`" class="label" v-text="flag.text"/>
      </template>
      <!-- <div v-else :key="index" class="separator"/> -->
      <template v-else>
        <div v-if="flag.text" :key="index" class="separator f-row-ac">
          <hr class="f-grow"/>
          <span class="separator mx-2" v-text="flag.text"/>
          <hr class="xf-grow" style="width: 16px"/>
        </div>
        <hr v-else :key="index"/>
      </template>
    </template>
  </div>
</template>

<script>
import LayerFlags from './LayerFlags.vue'
import { pull } from '@/utils/collections'

export default {
  extends: LayerFlags,
  props: {
    isBaseLayer: Boolean
  },
  computed: {
    displayedOptions () {
      const options = this.isBaseLayer ? this.options.slice(0, 1) : this.options
      return options
      // return options.concat([
      //   { text: 'Other', separator: true },
      //   { text: 'Map Legend', icon: 'legend' }
      // ])
    }
  },
  methods: {
    toggleFlag (flag) {
      if (!flag.disabled) {
        if (this.flagsSet.has(flag.value)) {
          pull(this.layerSettings.flags, flag.value)
        } else {
          this.layerSettings.flags.push(flag.value)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.flags-list {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  font-size: 14px;
  .label {
    padding: 2px 6px;
  }
  .btn {
    margin: 2px;
    padding: 4px 8px;
  }
  .separator {
    grid-column: 1 / -1;
    font-size: 12px;
    opacity: 0.7;
    line-height: 1;
    margin: 0 6px;
    hr {
      opacity: 0.45;
    }
  }
}
</style>