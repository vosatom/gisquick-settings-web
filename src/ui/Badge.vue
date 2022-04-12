<template>
  <div
    class="badge"
    :class="{top, glow}"
    :style="colorVar"
  >
    <slot>{{ value }}</slot>
  </div>
</template>

<script>
import { colorVars } from './utils/colors'

export default {
  props: {
    color: String,
    top: Boolean,
    glow: Boolean,
    value: {}
  },
  computed: {
    colorVar () {
      return this.color && colorVars(this.color)
    }
  }
}
</script>

<style lang="scss" scoped>
.badge {
  background-color: var(--color);
  gap: 3px;
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  &:not(.top) {
    border-radius: 3px;
    margin: 6px;
    padding: 3px 5px;
  }
  &.top {
    position: absolute;
    left: calc(100% - 8px);
    top: -5px;
    font-size: 11px;
    min-width: 14px;
    padding: 0 3px;
    border-radius: 7px;
  }
  &.glow {
    box-shadow: 1px 4px 9px rgba(var(--color-rgb), 0.4);
  }
}
</style>
