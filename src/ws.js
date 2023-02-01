const minSupportedVersion = '2.5.0'

function compareVersions (v1, v2) {
  const p1 = v1.split('.').map(v => parseInt(v))
  const p2 = v2.split('.').map(v => parseInt(v))
  let d = p2[0] - p1[0]
  if (d === 0) {
    d = p2[1] - p1[1]
  }
  if (d === 0) {
    d = p2[2] - p1[2]
  }
  return d
}

export default function WebsocketMessenger (url) {
  let closed = false
  let listeners = []
  let openListeners = []
  const activeRequests = {}
  let socket = new WebSocket(url)
  let timer = null
  const ws = {
    connected: false,
    pluginConnected: false,
    pluginVersion: null,
    clientInfo: '',
    pluginUpdateRequired: false,

    bind (type, callback) {
      listeners.push({ type, callback })
      return () => this.unbind(type, callback)
    },
    unbind (type, callback) {
      listeners = listeners.filter(l => l.type !== type || l.callback !== callback)
    },
    send (name, data, opts = {}) {
      if (socket.readyState === socket.OPEN) {
        const msg = { type: name, ...opts, data }
        socket.send(JSON.stringify(msg))
      } else {
        console.warn('ws:send readyState', socket.readyState)
      }
    },
    request (name, data) {
      const id = Math.random().toString(36).substring(2, 7)
      return new Promise((resolve, reject) => {
        activeRequests[`${name}:${id}`] = { resolve, reject }
        this.send(name, data, { id })
      })
    },
    close () {
      closed = true
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      socket.close()
    },
    onopen () {
      return new Promise(resolve => {
        if (ws.connected) {
          resolve()
        } else {
          openListeners.push(resolve)
        }
      })
    }
  }

  const init = () => {
    socket.onopen = () => {
      ws.connected = true
      openListeners.forEach(cb => cb())
      openListeners = []
      // console.log('sending PluginStatus (init)', new Date().toLocaleTimeString())
      ws.send('PluginStatus')
      if (timer != null) {
        console.error('previous timer still running!')
      }
      timer = setInterval(() => {
        // console.log('sending PluginStatus', new Date().toLocaleTimeString())
        ws.send('PluginStatus')
      }, 30 * 1000)
    }
    socket.onclose = () => {
      ws.connected = false
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      // reconnect
      if (!closed) {
        setTimeout(() => {
          // console.log('ws:reconnecting...')
          socket = new WebSocket(url)
          init()
        }, 5000)
      }
    }
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'PluginStatus') {
        const connected = msg.status === 200
        ws.pluginConnected = connected
        const clientInfo = connected ? msg.data.client : null
        if (clientInfo !== ws.clientInfo) {
          ws.clientInfo = clientInfo
          if (clientInfo) {
            const pluginVersion = clientInfo.split(' ')[0]?.split('/')[1]
            ws.pluginVersion = pluginVersion
            ws.pluginUpdateRequired = compareVersions(minSupportedVersion, pluginVersion) < 0
          } else {
            ws.pluginVersion = null
            ws.pluginUpdateRequired = null
          }
        }
      }
      // temporary compatibility with older version (without id)
      const key = msg.id ? `${msg.type}:${msg.id}` : Object.keys(activeRequests).find(k => k.split(':')[0] === msg.type)
      const req = activeRequests[key]
      if (req) {
        if (msg.status && msg.status >= 400) {
          req.reject(msg)
        } else {
          req.resolve(msg)
        }
        delete activeRequests[key]
      }
      listeners.filter(l => l.type === msg.type).forEach(l => l.callback(msg))
    }
    socket.onerror = (e) => {
      console.log('ws.onerror', 'readyState:', socket.readyState, e)
      // socket.close()
    }
  }
  init()
  return ws
}
