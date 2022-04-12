<template>
  <div class="flags f-row-ac">
    <v-btn
      v-for="flag in flags"
      :key="flag.name"
      :disabled="flag.disabled"
      class="icon flat"
      :color="flag.value ? 'primary' : '#ccc'"
      @click="toggle(flag)"
    >
      <v-icon :name="flag.icon"/>
    </v-btn>
  </div>
</template>

<script>

export default {
  props: {
    attributeMeta: Object,
    layerCapabilities: Object,
    layerPermissions: Array,
    value: Array
  },
  computed: {
    readonlyConstrain () {
      return this.attributeMeta.constrains?.includes('readonly')
    },
    flags () {
      const attrVisible = this.value.includes('view')
      const layerVisible = this.layerPermissions.includes('view')
      const layerEditable = layerVisible && (this.layerPermissions.includes('update') || this.layerPermissions.includes('insert'))
      const layerExportable = layerVisible && this.layerPermissions.includes('export')
      return [
        {
          name: 'view',
          icon: 'visibility',
          disabled: !this.layerCapabilities.view || !layerVisible,
          value: attrVisible
        }, {
          name: 'edit',
          icon: 'pencil',
          disabled: this.readonlyConstrain || !this.layerCapabilities.edit || !layerEditable || !attrVisible,
          value: this.value.includes('edit')
        }, {
          name: 'export',
          icon: 'download',
          disabled: !this.layerCapabilities.export || !layerExportable || !attrVisible,
          value: this.value.includes('export')
        }
      ]
    }
  },
  methods: {
    toggle (flag) {
      const { name, value } = flag
      if (name === 'view' && value) {
        // this.$emit('input', [])
        this.value.splice(0, this.value.length)
      } else {
        if (value) {
          this.value.splice(this.value.indexOf(name), 1)
        } else {
          this.value.push(name)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.flags {
  > * {
    margin: 0 4px;
  }
}
</style>
