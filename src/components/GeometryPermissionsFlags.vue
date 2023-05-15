<template>
  <div class="flags f-row-ac">
    <v-btn
      class="icon flat"
      :color="geomEditable ? 'primary' : '#777'"
      :disabled="!layerEditable"
      @click="toggle"
    >
      <v-icon name="pencil"/>
    </v-btn>
  </div>
</template>

<script>
import { hasAny, pull } from '@/utils/collections'

export default {
  props: {
    attributeMeta: Object,
    layerCapabilities: Object,
    layerPermissions: Array,
    layerSettings: Object,
    value: Array
  },
  computed: {
    layerEditable () {
      const layerQueryable = this.layerPermissions.includes('view') && this.layerPermissions.includes('query')
      return layerQueryable && this.layerCapabilities.edit && hasAny(this.layerPermissions, 'update', 'insert', 'delete')
    },
    geomEditable () {
      return this.value.includes('edit')
    }
  },
  methods: {
    toggle () {
      if (!this.geomEditable) {
        this.value.push('edit')
      } else {
        pull(this.value, 'edit')
      }
    }
  }
}
</script>
