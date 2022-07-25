const minSupportedVersion = '2.4.0'

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
    send (name, data) {
      if (socket.readyState === socket.OPEN) {
        const msg = { type: name, data }
        socket.send(JSON.stringify(msg))
      } else {
        console.warn('ws:send readyState', socket.readyState)
      }
    },
    request (name, data) {
      return new Promise((resolve, reject) => {
        activeRequests[name] = { resolve, reject }
        this.send(name, data)
      })
    },
    close () {
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
      ws.send('PluginStatus')
      timer = setInterval(() => {
        ws.send('PluginStatus')
      }, 30 * 1000)
    }
    socket.onclose = () => {
      // console.log('ws.onclose')
      ws.connected = false
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      // reconnect
      setTimeout(() => {
        // console.log('ws:reconnecting...')
        socket = new WebSocket(url)
        init()
      }, 5000)
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

      if (activeRequests[msg.type]) {
        if (msg.status && msg.status >= 400) {
          activeRequests[msg.type].reject(msg)
        } else {
          activeRequests[msg.type].resolve(msg)
        }
        delete activeRequests[msg.type]
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
