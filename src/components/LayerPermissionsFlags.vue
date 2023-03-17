<template>
  <div class="flags f-row-ac">
    <v-btn
      v-for="flag in flags"
      :key="flag.name"
      class="icon flat"
      :color="flag.value ? 'primary' : '#777'"
      :disabled="flag.disabled"
      @click="toggle(flag)"
    >
      <v-icon :name="flag.icon"/>
    </v-btn>
  </div>
</template>

<script>

export default {
  props: {
    capabilities: Object,
    value: Array
  },
  computed: {
    flags () {
      const visible = this.value.includes('view')
      return [
        {
          name: 'view',
          icon: 'visibility',
          disabled: !this.capabilities.view,
          value: visible
        }, {
          name: 'query',
          icon: 'identification',
          disabled: !this.capabilities.query,
          value: this.value.includes('query')
        }, {
          name: 'export',
          icon: 'download',
          disabled: !this.capabilities.export,
          value: this.value.includes('export')
        }, {
          name: 'update',
          icon: 'pencil',
          disabled: !this.capabilities.update,
          value: this.value.includes('update')
        }, {
          name: 'insert',
          icon: 'plus',
          disabled: !this.capabilities.insert,
          value: this.value.includes('insert')
        }, {
          name: 'delete',
          icon: 'delete_forever',
          disabled: !this.capabilities.delete,
          value: this.value.includes('delete')
        }
      ]
    }
  },
  methods: {
    toggle (flag) {
      const { name, value } = flag
      this.$emit('change', { flag: name, value: !value })
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
