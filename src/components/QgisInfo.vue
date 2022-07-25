<template>
  <div class="info-grid">
    <span class="label">QGIS Project</span>
    <span>{{ meta.client_info.directory }}/{{ meta.file }}</span>
    <!-- <span v-text="meta.client_info.directory"/> -->
    <span class="label">Projection</span>
    <span v-text="meta.projection"/>
    <span class="label">Map Units</span>
    <span v-text="meta.units.map"/>
    <span class="label">Print Templates</span>
    <span v-text="printTemplatesInfo || '—'"/>
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
@import '@/info-grid.scss';

.info-grid {
  margin: 4px;
  border: 1px solid #eee;
  border-width: 1px 1px 0 1px;
}
</style>
