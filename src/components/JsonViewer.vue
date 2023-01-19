<script lang="jsx">
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
    // Object.entries(obj).map(([key, val]) => )
    return {
      type: 'object',
      collapsed: false,
      children: Object.entries(obj).map(([k, v]) => [k, createObjectTree(v)])
    }
  }
  const t = typeof obj
  if (t === 'object') {
    console.log('!!value obj, type', t, obj)
  }
  return { type: t, value: obj }
}

export default {
  props: {
    data: [Object, Array]
  },
  data () {
    return {
      tree: null
    }
  },
  watch: {
    data: {
      immediate: true,
      handler (data) {
        this.tree = createObjectTree(data)
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
        // items.fill(<span class="indent"/>)
        return items
      }
    },
  //   renderItem (item, depth) {
  //     if (Array.isArray(item)) {
  //       return this.renderArray(item, depth)
  //     } else if (isObject(item)) {
  //       return this.renderObject(item, depth)
  //     }
  //     const t = typeof item
  //     return <span class={['value', t]}>{item}</span>
  //   },
  //   renderArray (items, depth) {
  //     const values = []
  //     items.forEach(i => values.push(this.renderItem(i, depth + 1), ', '))
  //     values.pop()
  //     return ['[', ...values, ']']
  //   },
  //   renderObject (obj, depth) {
  //     // const attrs = { staticClass: 'key', attrs: { depth: depth?.toString() } }
  //     const children = Object.entries(obj).map(([k, v]) => [
  //       ...this.renderIndent(depth),
  //       // <span {...attrs}>"{k}":</span>,
  //       <span class="key">"{k}":</span>,
  //       this.renderItem(v, depth + 1),
  //       <br/>
  //     ])
  //     if (depth > 1) {
  //       children.push(...this.renderIndent(depth - 1))
  //     }

  //     const obr = '{'
  //     const cbr = '}'
  //     return [<span>{obr}</span>, <br/>, ...children, <span>{cbr}</span>]
  //   }
  // },

  // Ver.2
    renderItem (item, depth) {
      if (item.type === 'array') {
        return this.renderArray(item, depth)
      } else if (item.type === 'object' && item.children) {
        return this.renderObject(item, depth)
      }
      const value = item.type === 'string' ? '"' + item.value + '"' : '' + item.value
      return <span class={['value', item.type]}>{value}</span>
    },
    renderArray (obj, depth) {
      const toggle = () => { obj.collapsed = !obj.collapsed }
      if (obj.collapsed) {
        return <span class="toggle" onClick={toggle}>{ '[ ... ]' }</span>
      }
      const nodes = []
      obj.children.forEach(i => nodes.push(this.renderItem(i, depth), ', '))
      nodes.pop()
      return [
        <span class="toggle" onClick={toggle}>[</span>,
        ...nodes,
        <span class="toggle" onClick={toggle}>]</span>
      ]
    },
    renderObject (obj, depth) {
      const toggle = () => { obj.collapsed = !obj.collapsed }
      if (obj.collapsed) {
        return <span class="toggle" onClick={toggle}>{ '{ ... }' }</span>
      }
      const children = obj.children?.map(([k, v]) => [
        ...this.renderIndent(depth),
        <span class="key">"{k}":</span>,
        this.renderItem(v, depth + 1),
        <br/>
      ])
      if (depth > 1) {
        children.push(...this.renderIndent(depth - 1))
      }
      return [
        <span class="toggle" onClick={toggle}>{'{'}</span>, <br/>,
        ...children,
        <span class="toggle" onClick={toggle}>{'}'}</span>
      ]
    },

    // Ver 3.
    formatLine (depth, ...children) {
      return depth > 0 ? [...this.renderIndent(depth), ...children] : children
    },
    insert (lines, item, depth) {
      if (item.type === 'array') {
        return this.insertArray(lines, item, depth)
      } else if (item.type === 'object' && item.children) {
        return this.insertObject(lines, item, depth)
      }
      const value = item.type === 'string' ? '"' + item.value + '"' : '' + item.value
      lines[lines.length - 1].push(<span class={['value', item.type]}>{value}</span>)
    },
    insertArray (lines, obj, depth) {
      if (!obj.children?.length) {
        lines[lines.length - 1].push(['[ ]'])
        return
      }
      const toggle = () => { obj.collapsed = !obj.collapsed }
      if (obj.collapsed) {
        lines[lines.length - 1].push(<span class="toggle" onClick={toggle}>{ '[ ... ]' }</span>)
      } else {
        if (obj.inline) {
          lines[lines.length - 1].push([<span class="value">{ `[ ${obj.children.map(i => i.value).join(', ')} ]` }</span>])
          return
        }
        lines[lines.length - 1].push(<span class="toggle" onClick={toggle}>[</span>)
        obj.children.forEach((ch, i) => {
          lines.push(this.renderIndent(depth + 1))
          this.insert(lines, ch, depth + 1)
          if (i !== obj.children.length - 1) {
            lines[lines.length - 1].push(', ')
          }
        })
        lines.push(this.formatLine(depth, <span class="toggle" onClick={toggle}>]</span>))
      }
    },
    insertObject (lines, obj, depth) {
      if (!obj.children?.length) {
        lines[lines.length - 1].push(['{ }'])
        return
      }
      const toggle = () => { obj.collapsed = !obj.collapsed }
      if (obj.collapsed) {
        lines[lines.length - 1].push(<span class="toggle" onClick={toggle}>{'{ ... }'}</span>)
      } else {
        lines[lines.length - 1].push(<span class="toggle" onClick={toggle}>{'{'}</span>)
        obj.children?.forEach(([k, v], i) => {
          lines.push(this.formatLine(depth + 1, <span class="key">"{k}":</span>))
          this.insert(lines, v, depth + 1)
          if (i !== obj.children.length - 1) {
            lines[lines.length - 1].push(', ')
          }
        })
        lines.push(this.formatLine(depth, <span class="toggle" onClick={toggle}>{'}'}</span>))
      }
    },

    // Ver. 4
    processValue (item, depth) {
      if (item.type === 'array') {
        return this.processArray(item, depth)
      } else if (item.type === 'object' && item.children) {
        return this.processObject(item, depth)
      }
      return '??'
    },
    simpleValue (item) {
      const value = item.type === 'string' ? '"' + item.value + '"' : '' + item.value
      return <span class={['value', item.type]}>{value}</span>
    },
    processArray (obj, deph) {
      if (obj.inline) {
        return <span class="value array">{obj.children.map(i => i.value).join(', ')}</span>
      }
      return obj.children.map(i => <div class="line">{this.processValue(i)}</div>)
    },
    processObject (obj, depth) {
      return obj.children?.map(([k, v], i) => {
        if (v.type === 'object') {
          const toggle = () => v.collapsed = !v.collapsed
          if (v.collapsed) {
            return (
              <div class="line">
                {this.renderIndent(depth)}
                <span class="key">"{k}":</span>
                <span class="toggle" onClick={toggle}>{'{ ... }'}</span>
              </div>)
          }
          return [
            <div class="line">
              {this.renderIndent(depth)}
              <span class="key">"{k}":</span>
              <span class="toggle" onClick={toggle}>{'{'}</span>
            </div>,
            this.processObject(v, depth + 1),
            <div class="line">
              {this.renderIndent(depth)}
              <span class="toggle" onClick={toggle}>{'}'}</span>
            </div>
          ]
        } else if (v.type === 'array') {
          return <div class="line">
            {this.renderIndent(depth)}
            <span class="key">"{k}":</span>
            <span class="toggle">[</span>
            {this.processArray(v, depth + 1)}
            <span class="toggle">]</span>
            {i !== obj.children.length - 1 ? ', ' : ''}
          </div>
        } else {
          return <div class="line">
            {this.renderIndent(depth)}
            <span class="key">"{k}":</span>
            {this.simpleValue(v)}
            {i !== obj.children.length - 1 ? ', ' : ''}
          </div>
        }
      })
    }
  },

  render () {
    // v2
    // return this.tree && <div class="json-viewer">{this.renderItem(this.tree, 1)}</div>

    // v3
    let lines = [[]]
    this.insert(lines, this.tree, 0)
    const content = lines.map(c => <div class="line">{c}</div>)
    return this.tree && <div class="json-viewer">{content}</div>

    // v4
    // return this.tree && <div class="json-viewer">{this.processValue(this.tree, 1)}</div>
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
