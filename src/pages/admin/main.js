import Vue from 'vue'
import PortalVue from 'portal-vue'

import App from './App.vue'
import ServerError from '@/ServerError.vue'
import router from '@/router/admin'
import http from '@/http'
import format from '@/format'
import UI from '@/ui'
import '@/theme.scss'
import '@/assets/fonts/fonts.css'
import '@/ui/base.scss'
import '@/ui/layout.scss'
import '@/ui/transitions/transitions.scss'

Vue.config.productionTip = false

Vue.use(UI)
Vue.use(PortalVue)
Vue.prototype.$http = http
Vue.prototype.$format = format
Vue.prototype.$gettext = v => v

// new Vue({
//   router,
//   render: h => h(App)
// }).$mount('#app')

function createApp (data) {
  new Vue({
    router,
    data () {
      return {
        ...data,
        projects: [],
        config: null
      }
    },
    created () {
      http.interceptors.response.use(
        resp => resp,
        error => {
          if (error?.response?.status === 401) {
            this.user = null
          }
          return Promise.reject(error)
        }
      )
    },
    render: h => h(App)
  }).$mount('#app')
}

http.get('/api/app/')
  .then(resp => {
    const data = resp.data
    if (data.user && data.user.is_guest) {
      data.user = null
    }
    createApp(data)
  })
  .catch(() => {
    new Vue({
      render: h => h(ServerError)
    }).$mount('#app')
  })
