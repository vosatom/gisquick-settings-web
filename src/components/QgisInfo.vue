<template>
  <div class="qgis-info p-2">
    <div class="item">
      <span class="label">Projection:</span>
      {{ meta.projection.code }}
    </div>
    <!-- <hr/> -->
    <div class="item">
      <span class="label">Map Units:</span>
      {{ meta.units.map }}
    </div>
    <!-- <hr/> -->
    <div class="item">
      <span class="label">Print Templates:</span>
      {{ printTemplatesInfo }}
    </div>
    <!-- <hr/> -->
    <div class="item">
      <span class="label">Client Info:</span>
      QGIS Version: {{ meta.client_info.qgis_version }}, Plugin Version: {{ meta.client_info.plugin_version }}
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
}
</style>
