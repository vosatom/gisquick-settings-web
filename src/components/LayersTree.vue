<template>
  <v-tree-view
    class="layers-tree"
    item-key="id"
    item-children="layers"
    :items="layers"
    :items-data="legends"
    expanded-key="expanded"
    :group-content-attrs="groupContentAttributes"
  >
    <template v-slot:group="{ group, depth, style }">
      <div class="item group f-row-ac" :depth="depth" :style="style">
        <svg
          width="16"
          viewBox="0 0 16 16"
          role="button"
          class="toggle icon"
          :class="{expanded: group.expanded}"
          @click="toggleGroup(group)"
        >
          <path d="M 8,1 L 8,15"/>
          <path class="tr" :d="group.expanded ? 'M 8,8 L 8,8' : 'M 1,8 L 15,8'"/>
        </svg>
        <span class="label f-grow" v-text="group.name"/>
        <v-switch
          class="round"
          :value="group.visible"
          @input="setGroupVisibility(group, $event)"
        />
      </div>
    </template>
    <template v-slot:leaf="{ item, group, style, data: legend }">
      <!-- <div class="f-col"> -->
        <div
          class="item layer f-row-ac"
          :class="{expanded: expandedLayer === item}"
          :style="style"
        >
          <v-spinner v-if="legend.pending" size="16" width="2" class="mx-2"/>
          <v-icon v-else-if="legend.error" name="circle-error" color="red" class="mx-2"/>
          <template v-else-if="legend.data">
            <div class="symbol" v-if="legend.data.icon">
              <img :src="`data:image/png;base64, ${legend.data.icon}`"/>
            </div>
            <v-btn v-else-if="legend.data.symbols" class="icon flat small" @click="toggleLayerInfo(item)">
              <v-icon
                class="toggle"
                name="arrow-down"
                size="12"
              />
            </v-btn>
            <div v-else class="symbol"/>
          </template>

          <v-checkbox
            class="f-grow"
            :label="item.title"
            :value="item.visible"
            @input="setLayerVisibility(item, group, $event)"
          />
          <!-- <v-btn class="icon flat small" @click="toggleLayerInfo(item)">
            <v-icon
              class="toggle"
              name="arrow-down"
              size="12"
            />
          </v-btn> -->
        </div>
        <v-collapsible>
          <div v-if="expandedLayer === item" class="metadata" :style="style">
            <v-spinner v-if="legend.pending" size="16" width="2" class="mx-2"/>
            <div v-else-if="legend.data && legend.data.symbols" class="f-col my-2">
              <div
                v-for="(symbol, i) in legend.data.symbols"
                :key="i"
                class="legend f-row-ac"
              >
                <div class="symbol">
                  <img :src="`data:image/png;base64, ${symbol.icon}`"/>
                </div>
                <span class="title" v-text="symbol.title"/>
              </div>
            </div>
            <!-- <div class="px-2 py-1">
              <span class="label">Abstract</span>
              <span>{{ item.metadata.abstract }}</span>
              <br/>
              <span class="label">Keywords list</span>
              <span>{{ item.metadata.keyword_list }}</span>
            </div> -->
          </div>
        </v-collapsible>
      <!-- </div> -->
    </template>
  </v-tree-view>
</template>

<script>
import { layersList } from '@/utils/layers'
import { TaskState, watchTask } from '@/tasks'

export default {
  props: {
    expanded: Object,
    layers: Array,
    legendFetcher: Object
  },
  data () {
    return {
      expandedLayer: null,
      legends: {}
    }
  },
  computed: {
    layersList () {
      return layersList(this.layers)
    }
  },
  watch: {
    layersList: {
      immediate: true,
      handler (layers) {
        if (this.legendFetcher) {
          const legends = {}
          layers.forEach(l => {
            legends[l.id] = TaskState()
            const t = this.legendFetcher.fetch(l)
            watchTask(t, legends[l.id])
          })
          this.legends = legends
        }
      }
    }
  },
  methods: {
    toggleGroup (group) {
      group.expanded = !group.expanded
    },
    toggleLayerInfo (layer) {
      this.expandedLayer = this.expandedLayer !== layer ? layer : null
    },
    setGroupVisibility (group, visible) {
      group.visible = visible
    },
    setLayerVisibility (layer, group, visible) {
      if (group?.mutually_exclusive) {
        const offLayers = group.layers.filter(l => l.visible && l !== layer)
        offLayers.forEach(l => {
          l.visible = false
        })
      }
      layer.visible = visible
    },
    groupContentAttributes (item) {
      return { class: { disabled: !item.visible } }
    }
  }
}
</script>

<style lang="scss" scoped>
.layers-tree {
  .item {
    padding-right: 6px;
    &.group {
      &[depth="0"] {
        background-color: #bbb;
        border: solid #999;
        border-width: 1px 0;
      }
      &[depth="1"] {
        background-color: #ddd;
        border: solid #bbb;
        border-width: 1px 0;
      }
      .label {
        font-weight: 500;
      }
      .toggle {
        padding: 6px 8px;
        stroke: #555;
        stroke-width: 2;
        transition: .3s cubic-bezier(.25,.8,.5,1);
        cursor: pointer;
        &.expanded {
          transform: rotate(90deg);
        }
        .tr {
          transition: inherit;
        }
      }
    }
    &.layer {
      &:hover {
        background-color: #eee;
      }
      .toggle {
        transition: .3s cubic-bezier(.25,.8,.5,1);
      }
      &.expanded {
        background-color: rgba(25, 118, 210, 0.15);
        .toggle {
          transform: rotate(180deg);
        }
      }
      .checkbox {
        margin-left: 2px;
      }
      .btn {
        // color: #999;
        margin: 0px;
        width: 32px;

      }
    }
  }
  ::v-deep .group-items {
    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    // &:not(.visible) {
    //   opacity: 0.5;
    //   pointer-events: none;
    // }
  }
}
.symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3px 6px;
  flex-shrink: 0;
  width: 20px;
  img {
    max-width: 20px;
    max-height: 20px;
  }
}
.metadata {
  background-color: rgba(25, 118, 210, 0.05);
  .legend {
    user-select: none;
    .title {
      margin-inline: 1px 6px;
      user-select: text;
    }
  }
  .label {
    font-weight: bold;
    margin-right: 6px;
    &::after {
      content: ":";
    }
  }
}
</style>
