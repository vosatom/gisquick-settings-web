<template>
  <div v-if="user" class="page light f-col">
    <confirm-dialog
      ref="confirmDeleteDialog"
      :action="deleteUser"
      icon="warning"
      text="Are you sure to delete this user?"
    />
    <h1 class="mx-2">User Profile</h1>
    <div class="profile">
      <div class="form f-col my-2">
        <v-text-field
          class="filled"
          label="Email"
          readonly
          v-model="user.username"
        />
        <v-text-field
          class="filled"
          label="Email"
          v-model="user.email"
        />
        <v-text-field
          class="filled"
          label="First Name"
          v-model="user.first_name"
        />
        <v-text-field
          class="filled"
          label="Last Name"
          v-model="user.last_name"
        />
        <v-checkbox label="Active" v-model="user.active"/>
        <v-checkbox label="Superuser" v-model="user.superuser"/>
      </div>
      <div class="info my-4 p-2">
        <span class="label">Created</span>
        <span class="value">{{ $format.datetime(user.created_at) || '—' }}</span>
        <span class="label">Confirmed</span>
        <span class="value">{{ $format.datetime(user.confirmed_at) || '—' }}</span>
        <span class="label">Last Login</span>
        <span class="value">{{ $format.datetime(user.last_login_at) || '—' }}</span>
        <hr/>
        <v-btn class="outlined round" color="primary" disabled>
          <span>Reset Password</span>
        </v-btn>
        <v-btn class="round" color="dark" :disabled="user.active || !user.email">
          <v-icon name="mail" class="mr-2"/>
          <span>Send Activation Email</span>
        </v-btn>
        <v-btn color="orange" class="round" :href="`/user/${user.username}`">
          <v-icon name="exit_to_app" class="mr-2"/>
          <span>User projects</span>
        </v-btn>
        <!-- <hr/>
        <a class="m-2" :href="`/user/${user.username}`">User projects</a> -->
      </div>
      <div class="form-actions f-row mt-4">
        <v-btn class="round" color="red" @click="$refs.confirmDeleteDialog.show()">Delete</v-btn>
        <div class="f-grow"/>
        <!-- <v-menu
          aria-label="Menu"
          transition="slide-y"
          align="rr;bb,tt"
          content-class="popup-menu"
          :items="menuItems"
        >
          <template v-slot:activator="{ toggle }">
            <v-btn aria-label="Menu" class="icon p-2" color="dark" @click="toggle">
              <v-icon name="menu-dots" size="24"/>
            </v-btn>
          </template>
        </v-menu> -->
        <v-btn class="outlined round" xcolor="#777" :to="{ name: 'users' }">Back</v-btn>
        <v-btn class="round" color="green" @click="updateUser">Save</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import omit from 'lodash/omit'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  components: { ConfirmDialog },
  props: {
    username: String
  },
  data () {
    return {
      user: null
    }
  },
  computed: {
    menuItems () {
      return [{
        text: 'Reset Password',
        disabled: true
      }, {
        text: 'Send Activation Email',
        icon: 'mail',
        disabled: this.user.active || !this.user.email
      }]
    }
  },
  mounted () {
    this.fetchUserData()
  },
  methods: {
    async fetchUserData () {
      const { data } = await this.$http.get(`/api/admin/users/${this.username}`)
      this.user = data
    },
    updateUser () {
      this.$http.put(`/api/admin/users/${this.username}`, omit(this.user, ['date_joined', 'last_login']))
    },
    async deleteUser () {
      await this.$http.delete(`/api/admin/users/${this.username}`)
      this.$router.push({ name: 'users' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  overflow: auto;
  max-width: 1200px;

  @media (min-width: 601px) {
    padding: 8px;
  }
}
.profile {
  display: grid;
  // grid-template-rows: 1fr auto;
  grid-template-rows: auto 1fr;
  // grid-template-rows: clamp(300px, 50vh, 100%) 1fr;
  grid-template-columns: clamp(320px, 700px, calc(100% - 220px)) minmax(200px, 1fr);
  gap: 6px;
  // background-color: #ddd;
}
.form {
  align-self: flex-start;
}
.form-actions {
  .btn {
    min-width: 130px;
  }
}
.info {
  align-self: start;
  justify-self: end;
  background-color: #f5f5f5;
  // background-color: #b6a498;
  border: 1px solid #ddd;
  display: grid;
  min-width: 200px;
  font-size: 13.5px;
  width: clamp(200px, 250px, 100%);

  .label {
    font-weight: 500;
    margin-inline: 6px;
    &::after {
      // content: ":";
    }
  }
  .value {
    margin: 3px 6px 6px 6px;
  }
  a {
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    color: var(--color-primary);
  }
  hr {
    margin-block: 3px;
  }
  .btn.round {
    height: 30px;
    font-size: 13px;
  }
}
</style>
