<template>
  <input-field
    label="Scales"
    color="primary"
    class="scales-field f-col"
    :class="{focused}"
  >
    <!-- <label slot="label">Scales</label> -->
    <div class="f-col box" tabindex="-1">
      <div class="list f-col">
        <div v-if="!value || !value.length" class="empty f-row-ac f-justify-center p-2">Empty List</div>
        <div
          v-for="(scale, index) in value"
          :key="index"
          class="item f-row-ac"
          :class="{selected: selectedIndex === index}"
          @click="selectedIndex = index"
        >
          <span class="prefix">1:</span>
          <span
            v-if="index !== editingIndex"
            class="value f-grow"
            v-text="scale"
            @dblclick="setEditable(index)"
          />
          <v-text-field
            v-else
            ref="editField"
            class="filled f-grow"
            type="number"
            v-model.number="editValue"
            @blur="finishEdit"
            @keydown.enter="finishEdit"
          />
          <v-btn class="icon" tabindex="-1" @click="$emit('click:scale', scale)">
            <v-icon name="search"/>
          </v-btn>
        </div>
      </div>
      <hr/>
      <div class="f-row f-shrink">
        <v-btn class="flex f-grow m-0" @click="add">
          <v-icon name="plus"/>
          <span class="ml-2">Add</span>
        </v-btn>
        <v-btn
          class="flex f-grow m-0"
          :disabled="selectedIndex === null"
          @click="removeAt(selectedIndex)"
        >
          <v-icon name="minus"/>
          <span class="ml-2">Remove</span>
        </v-btn>
      </div>
    </div>
  </input-field>
</template>

<script>
import InputField from '@/ui/InputField.vue'
import Focusable from '@/ui/mixins/Focusable'

export default {
  mixins: [Focusable],
  components: { InputField },
  props: {
    value: Array,
    rules: Array,
    label: String
  },
  data () {
    return {
      selectedIndex: null,
      editingIndex: null,
      editValue: 1 
    }
  },
  methods: {
    add () {
      // this.$emit('input', this.value?.concat(1) || [1])
      this.$emit('input', Array.isArray(this.value) ? [...this.value, 1] : [1])
    },
    removeAt (index) {
      const scales = this.value.filter((s, i) => i !== index)
      this.$emit('input', scales)
    },
    setEditable (index) {
      this.editValue = this.value[index]
      this.editingIndex = index
      this.$nextTick(() => {
        this.$refs.editField[0].focus()
      })
    },
    finishEdit () {
      const scales = this.value.slice()
      scales[this.editingIndex] = this.editValue
      scales.sort((a, b) => b - a)
      this.$emit('input', scales)
      this.editingIndex = null
    },
    onKeyDown (evt) {
      if (evt.target.tagName === 'INPUT') {
        return
      }
      if (evt.key === 'Delete') {
        this.removeAt(this.selectedIndex)
        evt.preventDefault()
      } else if (evt.key === 'ArrowUp') {
        if (this.selectedIndex > 0) {
          this.selectedIndex--
        }
        evt.preventDefault()
      } else if (evt.key === 'ArrowDown') {
        if (this.selectedIndex < this.value.length - 1) {
          this.selectedIndex++
        }
        evt.preventDefault()
      }
    },
    _clickOutsideTest (e) {
      if (!this.$el.contains(e.target)) {
        // this.focus = false
      }
    }
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keydown', this._clickOutsideTest)
  },
  watch: {
    focused (focus) {
      if (focus) {
        document.addEventListener('keydown', this.onKeyDown, false)
        document.addEventListener('click', this._clickOutsideTest)
      } else {
        document.removeEventListener('keydown', this.onKeyDown)
        document.removeEventListener('click', this._clickOutsideTest)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// .scales-field {
//   &.error--text, &.focused {
//     .box {
//       border-color: var(--color-primary);
//     }
//     label {
//       // color: inherit;
//       color: var(--color-primary);
//     }
//   }
// }
.box {
  border: 1px solid var(--border-color);
  width: 100%;
  outline: none;
  margin-top: 3px;
}
.list {
  // flex: 1 1 0;
  // flex-shrink: 1;
  // max-height: 60%;
  overflow: auto;
  .item {
    height: 36px;
    cursor: default;
    .prefix {
      padding-inline: 6px 3px;
    }
    .value {
      padding: 0 5px;
      cursor: text;
    }
    .text-field {
      margin: 0;
      ::v-deep &.i-field .input {
        height: 26px;
      }
    }
    .btn {
      margin: 0 4px;
      opacity: 0;
      transition: 0.25s opacity ease;
      will-change: opacity;
      .icon {
        padding: 3px;
      }
    }
    &.selected {
      // background-color: var(--color-yellow);
      background-color: rgba(var(--color-yellow-rgb), 0.5);
    }
    &:hover {
      .btn {
        opacity: 1;
      }
    }
  }
  .empty {
    opacity: 0.55;
    text-transform: uppercase;
    font-size: 13px;
    font-weight: 500;
  }
}
</style>