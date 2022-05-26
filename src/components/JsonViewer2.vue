<script>
import isObject from 'lodash/isObject'

function createObjectTree (obj) {
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      inline: obj.every(i => !isObject(i)),
      collapsed: false,
      children: obj.map(v => createObjectTree(v))
    }
  } else if (isObject(obj)) {
    return {
      type: 'object',
      collapsed: false,
      children: Object.entries(obj).map(([k, v]) => [k, createObjectTree(v)])
    }
  }
  const t = obj != null ? typeof obj : 'null'
  return { type: t, value: obj }
}

const Parenthesis = {
  object: {
    open: '{',
    close: '}',
    collapsed: '{...}',
    empty: '{ }'
  },
  array: {
    open: '[',
    close: ']',
    collapsed: '[...]',
    empty: '[ ]'
  }
}
const ObjNode = {
  name: 'NestedContent',
  props: {
    depth: Number,
    obj: Object
  },
  methods: {
    renderIndent (depth) {
      if (depth > 0) {
        const items = new Array(depth)
        for (let i = 0; i < depth; i++) {
          items[i] = <span class="indent"/>
        }
        return items
      }
    },
    renderLine (content, last) {
      return (
        <div class="line">
          {this.renderIndent(this.depth)}
          {content}
          { last ? '' : ',' }
        </div>
      )
    },
    simpleFieldLine (field, content, last) {
      return (
        <div class="line">
          {this.renderIndent(this.depth)}
          <span class="key">"{field}":</span>
          {content}
          { last ? '' : ',' }
        </div>
      )
    },
    simpleValue (item) {
      const value = item.type === 'string' ? '"' + item.value + '"' : '' + item.value
      return <span class={['value', item.type]}>{value}</span>
    },
    renderInlineArray1 (item) {
      const toggle = () => { item.collapsed = !item.collapsed }
      const lastIndex = item.children.length - 1
      const values = item.children.map((v, i) => i === lastIndex ? this.simpleValue(v) : [this.simpleValue(v), ', '])
      return (
        <span class="value array inline">
          <span class="toggle" onClick={toggle}>{Parenthesis[item.type].open} </span>
          {values}
          <span class="toggle" onClick={toggle}> {Parenthesis[item.type].close}</span>
        </span>
      )
    },
    renderInlineArray (item) {
      const lastIndex = item.children.length - 1
      const values = item.children.map((v, i) => i === lastIndex ? this.simpleValue(v) : [this.simpleValue(v), ', '])
      return (
        <span class="value array inline">
          {Parenthesis[item.type].open} {values} {Parenthesis[item.type].close}
        </span>
      )
    },
    renderComplexValue (field, v, last) {
      const toggle = () => { v.collapsed = !v.collapsed }
      const parenthesis = Parenthesis[v.type]
      return [
        <div class="line">
          {this.renderIndent(this.depth)}
          {field !== null && <span class="key">"{field}":</span>}
          <span class="toggle" onClick={toggle}>{parenthesis.open}</span>
        </div>,
        <ObjNode depth={this.depth + 1} obj={v}/>,
        <div class="line">
          {this.renderIndent(this.depth)}
          <span class="toggle" onClick={toggle}>{parenthesis.close}</span>
          { last ? '' : ','}
        </div>
      ]
    },
    renderCollapsed (v) {
      const toggle = () => { v.collapsed = !v.collapsed }
      return <span class="toggle" onClick={toggle}>{Parenthesis[v.type].collapsed}</span>
    },
    renderObject () {
      const lastIndex = this.obj.children.length - 1
      return this.obj.children.map(([k, v], i) => {
        if (v.children?.length === 0) {
          return this.simpleFieldLine(k, Parenthesis[v.type].empty, i === lastIndex)
        }
        if (v.collapsed) {
          return this.simpleFieldLine(k, this.renderCollapsed(v), i === lastIndex)
        }
        if (v.type === 'object') {
          return this.renderComplexValue(k, v, i === lastIndex)
        } else if (v.type === 'array') {
          if (v.inline) {
            return this.simpleFieldLine(k, this.renderInlineArray(v), i === lastIndex)
          }
          return this.renderComplexValue(k, v, i === lastIndex)
        }
        return this.simpleFieldLine(k, this.simpleValue(v), i === lastIndex)
      })
    },
    renderArray () {
      const lastIndex = this.obj.children.length - 1
      return this.obj.children.map((v, i) => {
        if (v.children?.length === 0) {
          return this.renderLine(Parenthesis[v.type].empty, i === lastIndex)
        }
        if (v.collapsed) {
          return this.renderLine(this.renderCollapsed(v), i === lastIndex)
        }
        if (v.type === 'object') {
          return this.renderComplexValue(null, v, i === lastIndex)
        } else if (v.type === 'array') {
          if (v.inline) {
            return this.renderLine(this.renderInlineArray(v), i === lastIndex)
          }
          return this.renderComplexValue(null, v, i === lastIndex)
        }
        return this.renderLine(this.simpleValue(v), i === lastIndex)
      })
    }
  },
  render () {
    const items = (this.obj.type === 'array') ? this.renderArray() : this.renderObject()
    return <div class="obj">{items}</div>
  }
}

export default {
  components: { ObjNode },
  props: {
    data: [Object, Array]
  },
  data () {
    return {
      root: null
    }
  },
  watch: {
    data: {
      immediate: true,
      handler (data) {
        this.root = createObjectTree(data)
      }
    }
  },
  methods: {
    renderIndent (depth) {
      if (depth > 0) {
        const items = new Array(depth)
        for (let i = 0; i < depth; i++) {
          items[i] = <span class="indent"/>
        }
        return items
      }
    },
    toggle () {
      this.root.collapsed = !this.root.collapsed
    }
  },
  render () {
    const parenthesis = Parenthesis[this.root.type]
    let content
    if (this.root.collapsed) {
      content = <span class="toggle" onClick={this.toggle}>{parenthesis.collapsed}</span>
    } else {
      content = [
        <span class="toggle" onClick={this.toggle}>{parenthesis.open}</span>,
        <obj-node depth={1} obj={this.root}/>,
        <span class="toggle" onClick={this.toggle}>{parenthesis.close}</span>,
      ]
    }
    return <div class="json-viewer">{content}</div>
  }
}
</script>

<style lang="scss">
.json-viewer {
  .line {
    display: flex;
    &:hover {
      background-color: #eee;
    }
  }
  .value {
    &.string {
      color: var(--color-green);
    }
    &.boolean {
      color: var(--color-orange);
    }
    &.number {
      color: var(--color-red);
    }
    &.null {
      color: #999;
      // opacity: 0.7;
    }
    &.array.inline {
      // white-space: pre-wrap;
    }
  }
  .key {
    margin-right: 6px;
  }
  .indent {
    display: inline-block;
    width: 16px;
    border-left: 1px dashed #ddd;
    flex-shrink: 0;
  }
  .toggle {
    padding: 0 2px;
    cursor: pointer;
  }
}
</style>
