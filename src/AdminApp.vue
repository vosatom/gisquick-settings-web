<template>
  <div class="app">
    <div class="header-bg"/>
    <!-- <div class="logo f-row-ac m-2">
      <img src="./assets/text_logo_dark.svg"/>
    </div> -->
    <router-link class="logo f-row-ac px-2" to="/">
      <img src="./assets/text_logo_dark.svg"/>
    </router-link>
    <!-- <portal-target name="menu" class="menu">
    </portal-target> -->
      <nav class="nav-menu dark f-grow f-row-ac my-2">
        <router-link class="general m-2" :to="{name: 'users'}">Users</router-link>
        <router-link class="m-2" :to="{name: 'emails'}">Emails</router-link>
        <div class="f-grow"/>
      </nav>

    <div class="app-menu f-row-ac f-justify-end dark">
      <v-menu
        aria-label="Menu"
        transition="slide-y"
        align="rr;bb,tt"
        class="m-2"
        content-class="popup-menu"
        :items="menuItems"
      >
        <template v-slot:activator="{ toggle }">
          <v-btn aria-label="Menu" class="icon ml-0" @click="toggle">
            <v-icon name="account" size="24"/>
          </v-btn>
        </template>
      </v-menu>
    </div>

    <router-view v-if="!showLoginDialog" class="page-content"/>
    <login-dialog
      login-required
      :value="showLoginDialog"
      :password-reset-url="app.reset_password_url"
      @login="onLogin"
    />
    <change-password-dialog ref="changePasswordDialog"/>
    <popup-layer class="light"/>
    <v-notification ref="notification">
      <!-- <template v-slot="{icon, msg}">
        <v-icon v-if="icon" :name="icon"/>
        <span v-text="msg"/>
      </template> -->
    </v-notification>
  </div>
</template>

<script>
import Vue from 'vue'
import PopupLayer from '@/ui/PopupLayer.vue'

// import Settings from '@/Settings.vue'
import LoginDialog from '@/components/LoginDialog.vue'
import VNotification from '@/components/Notification.vue'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'

export default {
  name: 'app',
  components: {
    PopupLayer,
    LoginDialog,
    // Settings,
    VNotification,
    ChangePasswordDialog
  },
  computed: {
    app () {
      return this.$root.app
    },
    user () {
      return this.$root.user
    },
    showLoginDialog () {
      return !this.user?.is_superuser
    },
    pluginStatusImg () {
      return this.ws?.pluginConnected ? require('./assets/qgis-icon32.svg') : require('./assets/qgis-icon-black32.svg')
    },
    clientInfo () {
      return this.ws?.clientInfo
    },
    menuItems () {
      return [
        {
          key: 'change_password',
          text: 'Change password',
          action: () => this.$refs.changePasswordDialog.show()
        }, {
          text: 'Logout',
          action: this.logout
        }
      ]
    }
  },
  mounted () {
    // Vue.prototype.$notification = this.$refs.notification
    const notification = this.$refs.notification
    Vue.prototype.$notify = {
      success: notification.showSuccess,
      error: notification.showError
    }
    // console.log('Setup Focus Listener')
    // document.addEventListener('focus', function() {
    //   console.log('focused: ', document.activeElement)
    // }, true)

    // document.addEventListener('blur', function() {
    //   console.log('blur, focused: ', document.activeElement)
    // }, true)
  },
  methods: {
    logout () {
      this.$http.get('/api/auth/logout/').then(() => location.reload())
    },
    onLogin (user) {
      this.$root.user = user
    }
  }
}
</script>

<style lang="scss">
html {
  font-size: 15px;
  font-family: Roboto,sans-serif;
  line-height: 1.5;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  height: 100%;
  // overflow: auto;
}
html, body, .app {
  height: 100%;
  overflow: hidden;
}
#app {
  min-height: 100;
}
// .app {
//   display: grid;
//   grid-template-columns: minmax(auto,1fr) auto 1fr;
//   grid-template-rows: 48px 1fr;
// }

.app {
  width: 100%;
  height: 100%;
  display: grid;
  // grid-template-columns: minmax(auto, 1fr) auto 1fr;
  grid-template-columns: minmax(auto, 1fr) minmax(auto, 1200px) 1fr;
  grid-template-rows: 48px 1fr;
  // row-gap: 6px;
  // column-gap: 1px;
  // gap: 6px;
  // gap: 1px;
  // row-gap: 1px;
  @media (max-width: 1450px) {
    grid-template-columns: auto 1fr auto;
  }
  // @media (max-width: 600px) {
  //   grid-template-columns: 1fr;
  // }
  .header-bg {
    background-color: #3d3d3d;
    grid-column: 1 / 4;
    grid-row: 1 / 2;
    // border-bottom: 1px solid #222;
    // margin-bottom: 1px;
    // box-shadow: 0 2px 7px rgba(0,0,0,0.2), 0 3px 3px rgba(0,0,0,0.15);
    box-shadow: 0 3px 3px rgba(0,0,0,0.2);
    z-index: 1;
  }
  .logo {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    max-width: 250px;
    height: 100%;
    // width: 100%;
    z-index: 1;
    img {
      height: 28px;
    }
  }
  .nav-menu {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
    display: flex;
    z-index: 1;
  }
  .app-menu {
    grid-row: 1 / 2;
    grid-column: 3 / 4;
    min-width: 92px;
    z-index: 1;
    .plugin-status {
      height: 22px;
    }
  }
}

.nav-menu {
  a {
    // font-weight: 500;
    color: inherit;
    text-decoration: none;
    &.router-link-exact-active, &.router-link-active:not(.general) {
      color: var(--color-yellow);
      --icon-color: currentColor;
      font-weight: 500;
    }
  }
  .btn.small {
    padding-inline: 2px;
  }
}

// .app-header {
//   flex: 0 0 48px;
//   background-color: var(--color-dark);
//   .logo {
//     height: 28px;
//   }
//   .plugin-status {
//     height: 22px;
//   }
// }
.page-content {
  overflow: auto;
}
</style>
