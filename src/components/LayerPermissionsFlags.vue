<template>
  <div class="flags f-row-ac">
    <v-btn
      v-for="flag in flags"
      :key="flag.name"
      class="icon flat"
      :color="flag.value ? 'primary' : '#aaa'"
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
          disabled: !this.capabilities.edit?.update,
          value: this.value.includes('update')
        }, {
          name: 'insert',
          icon: 'plus',
          disabled: !this.capabilities.edit?.insert,
          value: this.value.includes('insert')
        }, {
          name: 'delete',
          icon: 'delete_forever',
          disabled: !this.capabilities.edit?.delete,
          value: this.value.includes('delete')
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
