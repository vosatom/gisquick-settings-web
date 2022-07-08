export default {
  data () {
    return {
      pageVisible: false
    }
  },
  activated () {
    this.pageVisible = true
  },
  deactivated () {
    this.pageVisible = false
  }
}
