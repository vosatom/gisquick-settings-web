<template>
  <div v-if="showUsers" class="users page f-col light">
    <!-- <v-dialog ref="invitationDialog" title="New User" persistent>
      <div class="dialog-content f-col">
        <invitation-form class="p-2"/>
        <div class="f-row f-justify-end p-2">
          <v-btn color="#777" @click="$refs.invitationDialog.close()">Cancel</v-btn>
          <v-btn color="primary">Submit</v-btn>
        </div>
      </div>
    </v-dialog> -->

    <div class="f-row-ac">
      <v-text-field class="filled" placeholder="Search" v-model="searchText">
        <template v-slot:append>
          <v-icon name="search" color="#777"/>
        </template>
      </v-text-field>
      <div class="f-grow"/>
      <v-btn class="icon flat" @click="fetchUsers">
        <v-icon name="reload"/>
      </v-btn>
      <v-btn class="round" color="green" @click="showUsers = false">
        <v-icon class="mr-2" name="plus"/>
        <span>New User</span>
      </v-btn>
    </div>
    <v-table
      class="users outlined m-2"
      :columns="columns"
      :items="usersList"
      :sort="sort"
      @update:sort="sort = $event"
    >
      <template v-slot:cell(username)="{ value }">
        <router-link :to="{ name: 'user-detail', params: { username: value }}" v-text="value"/>
      </template>
      <template v-slot:cell(active)="{ value }">
        <v-icon v-if="value" name="check"/>
        <span v-else/>
      </template>
      <template v-slot:cell(superuser)="{ value }">
        <v-icon v-if="value" name="check"/>
        <span v-else/>
      </template>
    </v-table>
  </div>
  <div v-else class="page new-user f-col light py-2">
    <!-- <h1 class="m-2">New User</h1> -->
    <!-- <div class="form-box f-col shadow-1 m-2"> -->
    <div class="form-box f-col">
      <h1 class="m-2">New User</h1>
      <account-form
        :extra-fields="accountExtraFields"
        @cancel="showUsers = true"
        @success="onUserCreated"
      />
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash/orderBy'

import AccountForm from '@/components/admin/AccountForm.vue'
import { sanitize, escapeRegExp, removeDiacritics } from '@/ui/utils/text'

export default {
  components: { AccountForm },
  data () {
    return {
      showUsers: true,
      users: [],
      sort: {
        sort: 'asc',
        sortBy: 'username'
      },
      searchText: ''
    }
  },
  computed: {
    columns () {
      return [
        {
          key: 'username',
          label: 'Username',
          sortable: true
        }, {
          key: 'email',
          label: 'Email',
          sortable: true
        }, {
          key: 'first_name',
          label: 'First Name'
        }, {
          key: 'last_name',
          label: 'Last Name'
        }, {
          key: 'active',
          label: 'Active',
          align:' right'
        }, {
          key: 'superuser',
          label: 'Superuser',
          align:' right'
        }, {
          key: 'date_joined',
          label: 'Date Joined',
          format: 'date',
          sortable: true
        }, {
          key: 'last_login',
          label: 'Last Login',
          format: 'datetime',
          sortable: true
        }
      ]
    },
    usersList () {
      const users = this.users
      if (this.searchText) {
        const regex = new RegExp(escapeRegExp(sanitize(removeDiacritics(this.searchText))), 'i')
        return users.filter(u => regex.test(u.email)
          || regex.test(removeDiacritics(u.username))
          || regex.test(removeDiacritics(u.first_name))
          || regex.test(removeDiacritics(u.last_name))
        )
      }
      return this.sort ? orderBy(users, this.sort.sortBy, this.sort.sort) : users
    },
    accountExtraFields () {
      return this.$root.config?.account?.extra_fields
    }
  },
  created () {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers () {
      const { data } = await this.$http.get('/api/admin/users')
      this.users = data
    },
    onUserCreated () {
      this.showUsers = true
      this.fetchUsers()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 1200px;
  padding: 4px;
  @media (min-width: 601px) {
    padding: 8px;
  }
}
.table-container.users {
  :deep(tbody td) {
    height: 38px;
    a {
      color: var(--color-primary);
      text-decoration: none;
    }
  }
}
.dialog-content {
  width: clamp(300px, 500px, 90vw);
}
.form-box {
  width: clamp(320px, 600px, 100%);
}
.form-box2 {
  width: clamp(300px, 500px, 100%);
  background-color: #ddd;
  border: 1px solid var(--border-color);
}
</style>
