<script>
export default {
  // functional: true,
  // render (h, ctx) {
  //   const cls = 'scroll-container'
  //   if (ctx.data.staticClass) {
  //     ctx.data.staticClass += ' ' + cls
  //   } else {
  //     ctx.data.staticClass = cls
  //   }
  //   return h('div', ctx.data, ctx.children)
  // }
  render (h) {
    return h('div', { staticClass: 'scroll-container' }, this.$slots.default)
  }
}
</script>

<style lang="scss" scoped>
.scroll-container {
  overflow: auto;

  scrollbar-width: none;  /* Firefox */
  // mask-image: linear-gradient( black calc(100% - 16px), rgba(0,0,0,0.5) 100%);
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background-color: #eee;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #777;
    border-radius: 4px;
    // border: 1px solid #eee;
  }
}
</style>
