<template>
  <div class="content f-row">
    <div class="f-col">
      <span class="px-4">Object 1</span>
      <json-viewer :data="obj1" class="p-4"/>
    </div>
    <div class="f-col">
      <span class="px-4">Object 2</span>
      <json-viewer :data="obj2" class="p-4"/>
    </div>
    <div class="f-col">
      <span class="px-4">Diff 1</span>
      <json-viewer :data="diff1" class="p-4"/>
    </div>
    <div class="f-col">
      <span class="px-4">Diff 2</span>
      <json-viewer :data="diff2" class="p-4"/>
    </div>
  </div>
</template>

<script>
import { objectDiff } from '@/utils/diff'
import JsonViewer from '@/components/JsonDiffViewer.vue'

const v1 = {
  layer: {
    name: 'Layer',
    title: 'Pretty Layer',
    flags: {
      wfs: true,
      edit: false
    },
    client_info: {
      directory: '/media/marcel/data/GIS/forest_gardening',
      platform: ["Linux", "x86_64"],
      plugin_version: "2.1.4",
      qgis_version: "3.16.11-Hannover"
    },
    items: [
      {
        text: 'Item 1',
        value: 1
      }, {
        text: 'Item 2',
        value: 2
      }
    ],
    values: [1, 2, 4]
  }
}
const v2 = {
  layer: {
    name: 'Layer',
    flags: {
      wfs: false,
      searchable: false
    },
    client_info: {
      directory: '/home/marcel/data/GIS/forest_gardening',
      platform: [ "Linux", "x86_64" ],
      plugin_version: "2.1.4",
      qgis_version: "3.16.11-Hannover"
    },
    config: {
      key: 'secretKey',
      params: {
        a: 1,
        b: 2
      },
      list: [1, 6, 0, 9]
    }
  }
}


const v3 = {
  layer: {
    name: 'points',
    attributes: [
      {
        name: 'id',
        type: 'int',
        widget: 'TextField'
      }, {
        name: 'count',
        type: 'int',
        widget: 'TextEdit',
        config: {
          default: 10,
          min: 1,
          max: 1000
        }
      }
    ],
    flags: ['identifiable', 'readonly']
  }
}

const v4 = {
  layer: {
    name: 'points',
    attributes: [
      {
        name: 'id',
        type: 'int',
        widget: 'TextField',
        config: {}
      }, {
        name: 'count',
        type: 'int',
        widget: 'TextEdit',
        config: {
          min: 0,
          max: 1000
        }
      }, {
        name: 'url',
        type: 'string'
      }
    ],
    flags: ['identifiable', 'readonly', 'searchable']
  }
}

// console.log(objDiff2(v1, v2))
// console.log(objDiff2(v2, v1))
// console.log(deepDiff3(v1, v2))
// console.log(deepDiff3(v2, v1))
// console.log(objectDiff(v2, v1))

export default {
  components: { JsonViewer },
  computed: {
    // obj1 () {
    //   return v2
    // },
    // obj2 () {
    //   return v1
    // },
    obj1 () {
      return v3
    },
    obj2 () {
      return v4
    },
    diff1 () {
      return objectDiff(this.obj2, this.obj1)
    },
    diff2 () {
      return objectDiff(this.obj1, this.obj2)
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  grid-column:  1 / 4;
  .json-viewer, .json-diff-viewer {
    min-width:  240px;
    // max-width: 400px;
  }
}
</style>