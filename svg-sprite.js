const fs = require('fs')
const path = require('path')
const { optimize } = require('svgo')
const { parseSvg } = require('svgo/lib/parser')
const { stringifySvg } = require('svgo/lib/stringifier')
const JsAPI = require('svgo/lib/svgo/jsAPI')

const opts = {
  plugins: [
    'preset-default',
    { name: 'removeDoctype', active: true },
    { name: 'removeDesc', active: true },
    { name: 'mergePaths', active: true },
    { name: 'removeDimensions', active: true } // important
  ]
}

async function buildSprite (dirPath) {
  const svgs = fs.readdirSync(dirPath)
  const symbols = []
  for (const filename of svgs) {
    const svgPath = path.join(dirPath, filename)
    const data = fs.readFileSync(svgPath, 'utf8') 
    const result = await optimize(data, opts)
    const el = parseSvg(result.data)
    const svg = el.children[0]
    svg.name = 'symbol'
    svg.attributes = {
      id: path.basename(filename, '.svg'),
      viewBox: svg.attributes.viewBox
    }
    symbols.push(svg)
  }
  const svg = new JsAPI({
    type: 'root',
    children: [new JsAPI({
      type: 'element',
      name: 'svg',
      attributes: {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'width': 0,
        'height': 0,
        'style': 'position: absolute'
      },
      children: [new JsAPI({
        type: 'element',
        name: 'defs',
        children: symbols
      })]
    })]
  })
  return stringifySvg(svg).data
}

export default () => {
  return {
    name: 'html-transform',
    async transformIndexHtml (html, ctx) {
      const sprite = await buildSprite('./icons')
      return html.replace('<!-- svg-sprite -->', sprite)
    }
  }
}
