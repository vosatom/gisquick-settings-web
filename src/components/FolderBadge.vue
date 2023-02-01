<template>
  <div v-if="changes" class="folder-badge">
    <!-- <div
      v-for="i in bars"
      :key="i.type"
      :class="i.type"
      :style="{flex: `0 0 ${i.width}%`}"
    /> -->
    <div
      v-for="i in items"
      :key="i"
      class="item"
      :class="i"
    />
  </div>
</template>

<script>
export default {
  props: {
    new: Number,
    changed: Number,
    deleted: Number
  },
  computed: {
    changes () {
      return this.new + this.changed + this.deleted
    },
    bars () {
      const items = []
      const keys = ['new', 'changed', 'deleted']
      keys.forEach(k => {
        if (this[k]) {
          items.push({ type: k, width: 100 * (this[k] / this.changes) })
        } 
      })
      return items
    },
    items () {
      const keys = ['new', 'changed', 'deleted']
      return keys.filter(k => this[k] > 0)
    }
  }
}
</script>
<style lang="scss" scoped>
.folder-badge {
  position: relative;
  overflow: hidden;
  gap: 1px;
  padding: 1px;
}
.new {
  background-color: var(--color-green);
}
.deleted {
  background-color: var(--color-red);
}
.changed {
  background-color: var(--color-orange);
}
// .item {
//   border-radius: 50%;
//   width: 6px;
//   height: 6px;
// }
.item {
  flex-grow: 1;
}
</style>