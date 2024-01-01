<template>
  <div>
    <h2 class="subheader px-2">MNK settings</h2>

    <div>
      <v-checkbox
        label="Tiled QGIS layer"
        v-model="settings.custom.tiled_overlay"
      />
    </div>

    <v-checkbox
      label="Show 'Report an issue' button"
      v-model="settings.custom.report_issue"
    />

    <v-text-field
      v-if="settings.custom.report_issue"
      class="filled"
      label="'Report an issue' layer name"
      v-model="settings.custom.report_issue_layer_name"
    />

    <v-checkbox label="Show embed" v-model="settings.custom.show_embed" />
  </div>
</template>

<script>
export default {
  inject: ['project', 'settings'],
}
</script>
