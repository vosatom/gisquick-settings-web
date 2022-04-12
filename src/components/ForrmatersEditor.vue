<template>
  <div class="formatters f-row">
    <v-list
      label="Formatters"
      empty-text="No formatters defined"
      :items="settings.formatters || []"
      :selected="selected"
      @click-item="selected = $event"
    >
      <template v-slot:item="{ item }">
        <span v-text="item.name"/>
      </template>
      <template v-slot:append>
        <div class="toolbar f-row-ac">
          <v-btn class="icon" @click="addFormatter">
            <v-icon name="plus"/>
          </v-btn>
          <v-btn class="icon" :disabled="!selected" @click="removeFormatter">
            <v-icon name="delete_forever"/>
          </v-btn>
        </div>
      </template>
    </v-list>
    <div v-if="selected" class="form">
      <v-text-field
        label="Name"
        class="filled"
        v-model="selected.name"
        lazy
      />
      <v-text-field
        label="JSON configuration"
        class="filled"
        v-model="selected.config"
        multiline
        rows="4"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    settings: Object
  },
  data () {
    return {
      selected: null
    }
  },
  methods: {
    addFormatter () {
      if (!this.settings.formatters) {
        this.$set(this.settings, 'formatters', [])
      }
      this.settings.formatters.push({ name: 'New', config: '' })
    },
    removeFormatter () {

    },
    toggleFormatters (enabled) {
      if (enabled) {
        this.$set(this.settings, 'formatters', [])
      } else {
        this.$delete(this.settings, 'formatters')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  min-width: 200px;
}
</style>