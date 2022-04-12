<template>
  <div class="list">
    <document-listener
      v-if="focused"
      src="list"
      @keydown.up.prevent="highlightPrev"
      @keydown.down.prevent="highlightNext"
      @keydown.enter.prevent="confirmSelected"
      @keydown.space.prevent="onSpace"
    />
    <template v-for="(item, index) in items">
      <nuxt-link
        ref="item"
        v-if="item.link && !item.disabled"
        :key="index"
        :to="item.link"
        role="menuitem"
        class="item"
        :class="{
          expanded: expanded === item.key,
          highlighted: highlighted.index === index && highlighted.sindex === undefined
        }"
        @click.native="$emit('confirm', item)"
        @mouseover.native="highlighted = { index }"
      >
        <render-func :slots="$scopedSlots" :item="item"/>
      </nuxt-link>
      <div
        v-else
        ref="item"
        :key="index"
        role="menuitem"
        tabindex="0"
        class="item"
        :class="{
          expanded: expanded === item.key,
          highlighted: highlighted.index === index && highlighted.sindex === undefined
        }"
        :aria-disabled="item.disabled"
        @click="onClick(item)"
        @mouseover="highlighted = { index }"
      >
        <render-func :slots="$scopedSlots" :item="item"/>
      </div>
      <v-collapsible
        v-if="item.items"
        :key="`submenu-${index}`"
      >
        <div
          v-show="item.key === expanded"
          class="accordion f-col"
        >
          <template v-for="(subitem, sindex) in item.items">
            <nuxt-link
              v-if="subitem.link && !subitem.disabled"
              :key="sindex"
              :to="subitem.link"
              class="subitem"
              :class="{
                highlighted: highlighted.index === index && highlighted.sindex === sindex
              }"
              @mouseover.native="highlighted = { index, sindex }"
              @click.native="$emit('confirm', item)"
            >
              <slot name="subitem" :item="subitem"/>
            </nuxt-link>
            <div
              v-else
              :key="sindex"
              role="menuitem"
              tabindex="0"
              class="subitem"
              :class="{
                highlighted: highlighted.index === index && highlighted.sindex === sindex
              }"
              :aria-disabled="subitem.disabled"
              @click="onClick(subitem)"
              @mouseover="highlighted = { index, sindex }"
            >
              <slot name="subitem" :item="subitem"/>
            </div>
          </template>
        </div>
      </v-collapsible>
    </template>
    <slot name="append"/>
  </div>
</template>

<script>
import DocumentListener from './DocumentListener.js'
import VCollapsible from './Collapsible.vue'

const RenderFunc = {
  functional: true,
  props: {
    slots: Object,
    item: {}
  },
  render (h, ctx) {
    const { item, slots } = ctx.props
    const slot = slots[`item(${item.key})`] || slots.item
    return slot && slot({ item })
  }
}

export default {
  components: { DocumentListener, RenderFunc, VCollapsible },
  props: {
    focused: Boolean,
    items: Array,
    expanded: null
  },
  data () {
    return {
      highlighted: { index: -1 }
    }
  },
  watch: {
    focused (focused) {
      if (!focused) {
        this.highlighted = { index: -1 }
      }
    }
  },
  methods: {
    // getTargetElement () {
    //   const index = this.items.findIndex(i => i.key === this.highlighted)
    //   const cmp = this.$refs.item[index]
    //   return cmp._isVue ? cmp.$el : cmp
    // },
    // highlightPrev () {
    //   const index = this.items.findIndex(i => i.key === this.highlighted)
    //   this.highlighted = this.items[Math.max(0, index - 1)].key
    //   const el = this.getTargetElement()
    //   el.scrollIntoView({ block: 'nearest' })
    // },
    // highlightNext () {
    //   const max = this.items.length - 1
    //   const index = this.items.findIndex(i => i.key === this.highlighted)
    //   this.highlighted = this.items[Math.min(max, index + 1)].key
    //   const el = this.getTargetElement()
    //   el.scrollIntoView({ block: 'nearest' })
    // },

    getTargetElement () {
      const cmp = this.$refs.item[this.highlighted.index]
      return cmp && cmp._isVue ? cmp.$el : cmp
    },
    highlightPrev () {
      const index = this.highlighted.index
      this.highlighted = { index: Math.max(0, index - 1) }
      const el = this.getTargetElement()
      el.scrollIntoView({ block: 'nearest' })
    },
    highlightNext () {
      const max = this.items.length - 1
      const index = this.highlighted.index
      this.highlighted = { index: Math.min(max, index + 1) }
      const el = this.getTargetElement()
      el.scrollIntoView({ block: 'nearest' })
    },

    confirmSelected () {
      const el = this.getTargetElement()
      if (el) {
        el.click()
        // 'confirm' event will be triggered by click handler
      }
    },
    onSpace () {
      const item = this.items[this.highlighted?.index]
      if (!item.disabled) {
        if (item?.items) {
          this.$emit('change-expanded', item.key === this.expanded ? null : item.key)
        } else {
          this.confirmSelected()
        }
      }
    },
    onClick (item) {
      if (!item.disabled) {
        item.action?.()
        this.$emit('confirm', item)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  .item, .subitem {
    &.highlighted:not([aria-disabled]) {
      background-color: var(--color-primary);
      color: #fff;
    }
    &[aria-disabled] {
      opacity: 0.65;
      cursor: not-allowed;
      &.highlighted {
        background-color: rgba(#777, 0.15);
      }
    }
  }
  .subitem {
    min-height: 50px;
    display: flex;
    align-items: center;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    // color: inherit;
  }
}
.dark {
  .list {
    .item, .subitem {
      font-weight: bold;
    }
  }
}
</style>
