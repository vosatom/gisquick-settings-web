<script>
import isObject from 'lodash/isObject'

function flagsObject (diffs) {
  const flags = {}
  diffs.added.forEach(k => { flags[k] = 'added' })
  diffs.removed.forEach(k => { flags[k] = 'removed' })
  diffs.changed.forEach(k => { flags[k] = 'changed' })
  return flags
}

function createObjectTree (obj) {
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      inline: obj.every(i => !isObject(i)),
      collapsed: false,
      children: obj.map(v => createObjectTree(v)),
      flags: obj.$diff && flagsObject(obj.$diff)
    }
  } else if (isObject(obj)) {
    return {
      type: 'object',
      collapsed: false,
      flags: obj.$diff && flagsObject(obj.$diff),
      // children: Object.entries(obj).map(([k, v]) => [k, createObjectTree(v)])
      children: Object.entries(obj).filter(([k, _]) => k !== '$diff').map(([k, v]) => [k, createObjectTree(v)])
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
  name: 'ComplexValue',
  props: {
    depth: Number,
    obj: Object
  },
  computed: {
    indentStyle () {
      const width = `${this.depth * 20}px`
      return {
        // marginLeft: width, // // for background color starting after indent
        paddingLeft: width, // for full-width background color
        textIndent: '-' + width
      }
    }
  },
  methods: {
    renderIndent (depth) {
      if (depth > 0) {
        const items = new Array(depth)
        for (let i = 0; i < depth; i++) {
          // items[i] = <span class="indent"/>
          items[i] = <span class="indent">  </span>
        }
        return items
      }
    },
    renderLine (content, last) {
      return (
        <span class="line" style={this.indentStyle}>
          {this.renderIndent(this.depth)}
          {content}
          { last ? '' : ',' }
        </span>
      )
    },
    simpleFieldLine (field, content, last) {
      const flag = this.obj.flags?.[field]
      return (
        <span class={flag ? `line ${flag}` : 'line'} style={this.indentStyle}>
          {this.renderIndent(this.depth)}
          <span class="key">"{field}":</span>
          {content}
          { last ? '\n' : ',\n' }
        </span>
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
      const flag = this.obj.flags?.[field]
      const cls = flag && flag !== 'changed' ? `line ${flag}` : 'line'

      return [
        <span class={cls}>
          {this.renderIndent(this.depth)}
          {field && <span class="key">"{field}":</span>}
          <span class="toggle" onClick={toggle}>{parenthesis.open}</span>
          <br/>
        </span>,
        <ObjNode depth={this.depth + 1} obj={v}/>,
        <span class={cls}>
          {this.renderIndent(this.depth)}
          <span class="toggle" onClick={toggle}>{parenthesis.close}</span>
          { last ? '\n' : ',\n'}
        </span>
      ]
    },
    renderArrayValue (index, v, last) {
      const toggle = () => { v.collapsed = !v.collapsed }
      const parenthesis = Parenthesis[v.type]
      const flag = this.obj.flags?.[index]
      const cls = flag && flag !== 'changed' ? `line ${flag}` : 'line'

      return [
        <span class={cls}>
          {this.renderIndent(this.depth)}
          <span class="toggle" onClick={toggle}>{parenthesis.open}</span>
          <br/>
        </span>,
        <ObjNode depth={this.depth + 1} obj={v}/>,
        <span class={cls}>
          {this.renderIndent(this.depth)}
          <span class="toggle" onClick={toggle}>{parenthesis.close}</span>
          { last ? '\n' : ',\n'}
        </span>
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
          // return this.renderComplexValue(null, v, i === lastIndex)
          return this.renderArrayValue(i, v, i === lastIndex)
        } else if (v.type === 'array') {
          if (v.inline) {
            return this.renderLine(this.renderInlineArray(v), i === lastIndex)
          }
          // return this.renderComplexValue(null, v, i === lastIndex)
          return this.renderArrayValue(i, v, i === lastIndex)
        }
        return this.renderLine(this.simpleValue(v), i === lastIndex)
      })
    }
  },
  render () {
    const items = (this.obj.type === 'array') ? this.renderArray() : this.renderObject()
    return <span class="block">{items}</span>
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
    toggle () {
      this.root.collapsed = !this.root.collapsed
    }
  },
  render () {
    const parenthesis = Parenthesis[this.root.type]
    let content
    if (this.root.collapsed) {
      content = <span class="line toggle" onClick={this.toggle}>{parenthesis.collapsed}</span>
    } else {
      content = [
        <span class="line">
          <span class="toggle" onClick={this.toggle}>{parenthesis.open}</span>
          <br/>
        </span>,
        <obj-node depth={1} obj={this.root}/>,
        <span class="line">
          <span class="toggle" onClick={this.toggle}>{parenthesis.close}</span>
        </span>,
      ]
    }
    return <span class="json-diff-viewer">{content}</span>
  }
}
</script>

<style lang="scss">
.json-diff-viewer {
  font-family: monospace;
  font-size: 14px;
  display: flex;
  flex-direction: column;

  .block {
    display: flex;
    flex-direction: column;
  }
  .line {
    // https://bugs.webkit.org/show_bug.cgi?id=186224
    // display: flex; // optional
    // display: inline-block;

    // Hanging text indent
    // margin-left: 60px; // for background color starting after indent
    // padding-left: 20px; // for full-width background color
    // text-indent: -20px;

    padding-right: 6px;
    white-space: pre-line;
    // position: relative;
    &:hover {
      background-color: #eee;
    }
    &.changed {
      background-color: rgba(var(--color-orange-rgb), 0.2);
    }
    &.removed {
      background-color: rgba(var(--color-red-rgb), 0.2);
      + .block {
        background-color: rgba(var(--color-red-rgb), 0.2);
      }
    }
    &.added {
      background-color: rgba(var(--color-green-rgb), 0.13);
      + .block {
        background-color: rgba(var(--color-green-rgb), 0.13);
      }
    }
  }
  .value {
    word-break: break-all;
    text-indent: -20px;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
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
  }
  .key {
    margin-right: 6px;
  }
  .indent {
    // display: inline;
    // display: inline-block;
    // height: 100%;
    border-left: 1px dashed #ddd;
    white-space: pre;
    // float: left;
  }
  .toggle {
    padding: 0 2px;
    cursor: pointer;
  }
}
</style>
