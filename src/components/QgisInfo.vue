<template>
  <div class="qgis-info p-2">
    <div class="item">
      <span class="label">Projection:</span>
      <span v-text="meta.projection"/>
    </div>
    <!-- <hr/> -->
    <div class="item">
      <span class="label">Map Units:</span>
      <span v-text="meta.units.map"/>
    </div>
    <!-- <hr/> -->
    <div class="item">
      <span class="label">Print Templates:</span>
      <span v-text="printTemplatesInfo"/>
    </div>
    <!-- <hr/> -->
    <div class="item">
      <span class="label">Client Info:</span>
      <span>QGIS Version: {{ meta.client_info.qgis_version }}, Plugin Version: {{ meta.client_info.plugin_version }}</span>
    </div>
    <div class="item">
      <span class="label">Project Directory:</span>
      <span v-text="meta.client_info.directory"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    meta: Object
  },
  computed: {
    printTemplatesInfo () {
      return this.meta.composer_templates.map(t => t.name).join(', ')
    }
  }
}
</script>

<style lang="scss" scoped>
.item {
  margin: 3px;
}
.label {
  font-weight: 500;
  margin-right: 6px;
}
</style>
