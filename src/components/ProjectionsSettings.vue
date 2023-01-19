<template>
  <div v-if="meta && settings" class="projections-settings f-col p-2">
    <v-select
      class="filled"
      label="Projection"
      :items="projections"
      v-model="projection"
    />
    <v-text-field
      multiline
      readonly
      :disabled="hasProjSetting"
      rows="3"
      class="filled"
      label="Proj4"
      :value="proj4"
    />
    <p class="m-2 f-row">
      <v-icon name="circle-i-outline" class="mr-2"/>
      <span>If vector geometry in the web application doesn't match with rendered map image, you may need to adjust proj4 definition</span>
    </p>
    <div class="f-row">
      <v-checkbox
        label="Override proj4 definition"
        :value="hasProjSetting"
        @input="toggleProj4Editing"
      />
    </div>
    <v-text-field
      v-if="hasProjSetting"
      lazy
      multiline
      rows="3"
      class="filled"
      label="Proj4 (Web)"
      v-model="settings.proj4[projection]"
    />
  </div>
</template>

<script>
export default {
  props: {
    meta: Object,
    settings: Object
  },
  data () {
    return {
      projection: null
    }
  },
  computed: {
    projections () {
      return Object.keys(this.meta.projections)
    },
    proj4 () {
      return this.meta.projections[this.projection].proj4
    },
    hasProjSetting () {
      return !!this.settings.proj4?.[this.projection]
    }
  },
  created () {
    this.projection = this.meta.projection
  },
  methods: {
    toggleProj4Editing (enabled) {
      if (enabled) {
        if (!this.settings.proj4) {
          this.$set(this.settings, 'proj4', { [this.projection]: this.proj4})
        } else {
          this.$set(this.settings.proj4, this.projection, this.proj4)
        }
      } else {
        this.$delete(this.settings.proj4, this.projection)
      }
    }
  }
}
</script>
