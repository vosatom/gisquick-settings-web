<template>
  <div class="users-list">
    <!-- <v-text-field
      class="filled"
      v-model="searchText"
    /> -->

    <v-text-field
      class="filled"
      valid-chars="[0-9.]"
      placeholder="Nested"
    >
      <template v-slot:append>
        <v-menu
          ref="menu"
          aria-label="Vybrať dátum"
          transition="slide-y"
          align="rr;bb,tt"
          content-class="popup-content popup-menu light"
        >
          <template v-slot:activator="{ open }">
            <!-- <div class="btn f-row-ac" @click="open">
              <v-icon name="menu"/>
            </div> -->
            <v-btn class="icon" @click="open">
              <v-icon name="menu"/>
            </v-btn>
          </template>
          <template v-slot:menu>
            <div class="card">
              <v-select
                :items="['item 1', 'item 2']"
                value="item 1"
              />
            </div>
          </template>
        </v-menu>
      </template>
    </v-text-field>

    <v-text-field
      class="filled"
      label="Text"
      v-model="text"
    >
      <template v-slot:append>
        <v-icon name="search" class="mx-2" color="#aaa"/>
      </template>
    </v-text-field>

    <v-autocomplete
      placeholder="Autocomplete"
      field-class="filled"
      :min-chars="2"
      :items="filteredUsers"
      highlight-fields="username,first_name,last_name"
      @input="onInput"
      @text:update="onTextChange"
    >
      <template v-slot:item="{ item, html }">
        <div class="item f-row f-grow">
          <div class="f-grow">
            <div class="title" v-html="html.username"/>
            <small v-if="item.first_name" class="name first" v-html="html.first_name"/>
            <small v-html="html.last_name"/>
          </div>
        </div>
      </template>
    </v-autocomplete>

    <v-autocomplete2
      placeholder="Autocomplete 2"
      class="filled"
      :min-chars="2"
      :items="filteredUsers"
      highlight-fields="username,first_name,last_name"
      @input="onInput"
      @text:update="onTextChange"
    >
      <template v-slot:item="{ item, html }">
        <div class="item f-row f-grow">
          <div class="f-grow">
            <div class="title" v-html="html.username"/>
            <small v-if="item.first_name" class="name first" v-html="html.first_name"/>
            <small v-html="html.last_name"/>
          </div>
        </div>
      </template>

      <template v-slot:append>
        <v-menu
          ref="menu"
          aria-label="Vybrať dátum"
          transition="slide-y"
          align="rr;bb,tt"
          content-class="popup-content popup-menu light"
        >
          <template v-slot:activator="{ open }">
            <!-- <div class="btn f-row-ac" @click="open">
              <v-icon name="menu"/>
            </div> -->
            <v-btn class="icon" @click.stop="open">
              <v-icon name="menu"/>
            </v-btn>
          </template>
          <template v-slot:menu>
            <div class="card">
              <v-select
                :items="['item 1', 'item 2']"
                value="item 1"
              />
            </div>
          </template>
        </v-menu>
      </template>
    </v-autocomplete2>

    <div class="list m-2">
      <v-autocomplete
        placeholder="Find by username or name"
        field-class="xfilled"
        :min-chars="2"
        :items="filteredUsers"
        highlight-fields="username,first_name,last_name"
        @input="onInput"
        @text:update="onTextChange"
      >
        <template v-slot:item="{ item, html }">
          <div class="item f-row f-grow">
            <div class="f-grow">
              <div class="title" v-html="html.username"/>
              <small v-if="item.first_name" class="name first" v-html="html.first_name"/>
              <small v-html="html.last_name"/>
            </div>
          </div>
        </template>
      </v-autocomplete>
      <hr/>
      <div v-if="!users.length" class="item p-2 text-center">
        Empty List
      </div>
      <div
        v-for="user in users"
        :key="user.username"
        class="item f-row-ac p-2"
        :class="{selected: selected === user.username}"
        @click="selected = user.username"
      >
        <span class="f-grow">
          {{ user.username }} <span v-if="user.fullName"> ({{ user.fullName }})</span>
        </span>
        <v-btn v-show="selected === user.username" class="remove icon" tabindex="-1-" @click="removeUser(user.username)">
          <v-icon name="delete_forever"/>
        </v-btn>
      </div>
    </div>
    <!-- <v-btn
      color="red"
      class="round small"
      :disabled="!selected"
      @click="removeUser(selected)"
    >
      Remove
    </v-btn> -->

    <v-list label="Users" :items="users">
      <template v-slot:prepend="">
        <v-autocomplete
          placeholder="Find by username or name"
          class="xm-0"
          field-class="xfilled"
          :min-chars="2"
          :items="filteredUsers"
          highlight-fields="username,first_name,last_name"
          @input="onInput"
          @text:update="onTextChange"
        >
          <template v-slot:item="{ item, html }">
            <div class="item f-row f-grow">
              <div class="f-grow">
                <div class="title" v-html="html.username"/>
                <small v-if="item.first_name" class="name first" v-html="html.first_name"/>
                <small v-html="html.last_name"/>
              </div>
            </div>
          </template>
        </v-autocomplete>
      </template>
      <template v-slot:item="{ item }">
        <span>{{ item.username }}</span>
      </template>
    </v-list>

  </div>
</template>

<script>
import keyBy from 'lodash/keyBy'
import InputField from '@/ui/InputField.vue'
import VAutocomplete from '@/ui/Autocomplete.vue'
import VAutocomplete2 from '@/ui/Autocomplete2.vue'
// import VList from '@/ui/ActionList.vue'
import VList from '@/ui/List.vue'
import { TaskState, watchTask } from '@/tasks'
import { sanitize, escapeRegExp, removeDiacritics } from '@/ui/utils/text'


function fullName (user) {
  const parts = [ user.first_name, user.last_name ]
  return parts.filter(p => p).join(' ')
}

export default {
  components: { InputField, VAutocomplete, VAutocomplete2, VList },
  props: {
    value: Array
  },
  data () {
    return {
      text: '',
      selected: null,
      task: TaskState()
    }
  },
  computed: {
    focusedEl () {
      return this.$ui.activeEl
    },
    usersList () {
      return this.task.data?.map(u => ({ ...u, fullName: fullName(u) })) || []
    },
    usersMap () {
      return keyBy(this.usersList, 'username')
    },
    users () {
      return this.value.map(k => this.usersMap[k])
    },
    filteredUsers () {
      if (this.usersList.length && this.text?.length > 1) {
        const regex = new RegExp(escapeRegExp(sanitize(removeDiacritics(this.text))), 'i')
        return this.usersList
          .filter(u => this.value.indexOf(u.username) === -1)
          .filter(u => regex.test(removeDiacritics(u.username)))
      }
      return []
    }
  },
  mounted () {
    this.fetchUsers()
  },
  methods: {
    onTextChange (text) {
      this.text = text
      // this.filterUsers(text)
    },
    onInput (user) {
      if (this.value && this.value.some(u => u.username === user.username)) {
        return
      }
      this.$emit('input', Array.isArray(this.value) ? [...this.value, user.username] : [user.username])
      this.text = ''
    },
    async fetchUsers () {
      const task = this.$http.get('/api/users')
      watchTask(task, this.task)
    },
    removeUser (username) {
      const value = this.value.filter(u => u !== username)
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.name.first {
  margin-right: 3px;
}
.list {
  // background-color: #f5f5f5;
  border: 1px solid var(--border-color, #ddd);
  .autocomplete {
    background-color: #f2f2f2;
  }
  .item {
    height: 36px;
    &.selected {
      background-color: var(--color-primary);
      color: #fff;
    }
  }
}
</style>
