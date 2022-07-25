<template>
  <div class="err-msg f-col-ac" :style="colorVar">
    <div class="title f-row-ac m-2">
      <v-icon name="warning"/>
      <span class="uppercase" v-text="title"/>
    </div>
    <p class="text-center p-2">
      <slot/>
    </p>
  </div>
</template>

<script>
import { colorVars } from '@/ui/utils/colors'

export default {
  props: {
    color: {
      type: String,
      default: 'red'
    },
    title: {
      type: String,
      default: 'Error'
    }
  },
  computed: {
    colorVar () {
      return this.color && colorVars(this.color)
    }
  }
}
</script>

<style lang="scss" scoped>
.err-msg {
  .title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color);
    --icon-color: var(--color);
    border: 2px solid currentColor;
    padding: 0 10px;
    border-radius: 16px;
    .icon {
      margin-right: 4px;
    }
  }
  p {
    font-size: 17px;
  }
}
</style>
