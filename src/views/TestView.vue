<template>
  <div class="f-col light">
    <!-- <v-multi-select
      label="Multi"
      placeholder="Select"
      :items="selectItems"
      v-model="selection"
    /> -->
    <v-text-field disabled class="filled" placeholder="Enter text"/>
    <v-select
      class="filled"
      label="Single"
      placeholder="Select"
      :items="longList"
      v-model="selected"
    />
    <v-select2
      xdisabled
      class="filled"
      label="Single"
      placeholder="Simple"
      :items="simpleItems"
      v-model="selected"
    />
    <v-select2
      multiple
      class="filled"
      label="Multi2"
      placeholder="Select"
      :items="selectItems"
      v-model="selection"
    />
    <v-select2
      multiple
      class="filled chips"
      label="Chips"
      placeholder="Select"
      :items="selectItems"
      v-model="selection"
    >
      <template v-slot:selection="{ items, toggle }">
        <v-badge v-for="(item, key) in items" :key="key" class="dark small m-0">
          <span v-text="item.text"/>
          <v-icon name="close-circle" @click.stop="toggle(item)"/>
        </v-badge>
      </template>
    </v-select2>
    <v-menu :items="menuItems">
      <template v-slot:activator="{ toggle }">
        <v-btn aria-label="Menu" class="icon" @click="toggle">
          <v-icon name="menu"/>
        </v-btn>
      </template>
    </v-menu>
    <v-btn class="outlined" @click="test">Button</v-btn>
  </div>
</template>

<script>
import VMultiSelect from '@/ui/MultiSelect.vue'
import VSelect2 from '@/ui/Select2.vue'
export default {
  components: { VMultiSelect, VSelect2 },
  data () {
    return {
      selection: [],
      selected: null
    }
  },
  computed: {
    simpleItems () {
      return ['Apple', 'Avocado', 'Banana', 'Orange', 'Cherry']
    },
    selectItems () {
      return [
        { text: 'Fruits', separator: true },
        { text: 'Apple', value: 0 },
        { text: 'Avocado', value: 1 },
        { text: 'Banana', value: 2, disabled: true },
        { text: 'Cherry', value: 3 },
        { text: 'Orange', value: 4 },
        { text: 'Vegetable', separator: true },
        { text: 'Broccoli', value: 5 },
        { text: 'Carrot', value: 6 },
      ]
    },
    longList () {
      return new Array(30).fill(0).map((_, i) => ({
        text: `Item ${i}`,
        value: i
      }))
    },
    menuItems () {
      return [
        { text: 'Auth', separator: true },
        { text: 'Login', action: () => { console.log('Login') } },
        { text: 'Logout', action: () => { console.log('Logout') } },
        { text: 'Secret', separator: true },
        { text: 'Destroy', disabled: true, action: () => { console.log('Logout') } },
        { text: 'Help', separator: true },
        { text: 'About' },
      ]
    }
  },
  methods: {
    test () {
      const selIndexes = [100, 200, 300, 400, 500, 600, 700, 800, 3000, 45000, 49000, 90000]
      console.time('data')
      const data = new Array(90000).fill(0).map((_, i) => ({ text: `Item ${i}`, value: i }))
      console.timeEnd('data')
      // const as = selIndexes.map(i => data[i])
      const as = data.slice(70000)
      const ss = new Set(as)
      // const s2 = new Set(selIndexes)
      const s2 = new Set(as.map((_, i) => i + 70000))
      console.log(s2)

      console.time('set')
      console.log(data.filter(i => ss.has(i)))
      console.timeEnd('set')

      console.time('set2')
      console.log(data.filter((_, index) => s2.has(index)))
      console.timeEnd('set2')

      console.time('array')
      console.log(data.filter(i => as.includes(i)))
      console.timeEnd('array')
    }
  }
}
</script>

<style lang="scss" scoped>
.select.chips {
  ::v-deep .input {
    height: 36px;
  }
}
// .input {
//   .badge {
//     height: 24px;
//   }
// }
</style>
