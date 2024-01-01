<template>
  <div>
    <v-text-field
      class="filled code"
      label="Legend items"
      lazy
      :value="JSON.stringify(value, null, '  ')"
      @input="setLegendItems"
      :error="!isValid ? 'Items config not valid' : undefined"
      multiline
    />
  </div>
</template>

<script>
export default {
  props: {
    project: Object,
    settings: Object,
    layerSettings: Object,
    layerConfig: Object,
    value: Object,
  },

  data() {
    return { isValid: true }
  },
  computed: {},
  methods: {
    setLegendItems(value) {
      try {
        const parsed = JSON.parse(value)
        this.$emit('input', parsed)
        this.isValid = true
      } catch (err) {
        this.isValid = false
      }
    },
  },
}
</script>

<style scoped>
.code :deep(.input textarea) {
  font-family: monospace;
  height: 150px;
}
</style>
