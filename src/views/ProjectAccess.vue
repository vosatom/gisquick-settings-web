<template>
  <div v-if="authSettingsValid" class="page-content f-col f-grow light">
    <div class="l-col2">
      <v-select
        class="filled"
        label="Project Access"
        :items="accessOptions"
        :value="settings.auth.type"
        @input="setAuthType"
      />
      <v-switch
        class="round my-4"
        color="primary"
        label="Multiple roles permissions"
        :value="!!settings.auth.roles"
        @input="toggleRolesMode"
      />
      <users-list
        v-if="settings.auth.type === 'users'"
        :task="tasks.users"
        v-model="settings.auth.users"
      />
    </div>
    <!-- <div class="my-2"/>
    <radio-group
      label="Permissions Model"
      color="primary"
      :items="permModes"
      :value="mode"
      @input="setModel"
    /> -->

    <div
      v-if="settings.auth.roles"
      class="roles-settings mt-4"
    >
      <confirm-dialog
        ref="confirmDeleteDialog"
        :action="removeRole"
        icon="warning"
        text="Are you sure to delete access group?"
      />
      <template>
        <!-- <div class="toolbar f-row-ac">
          <v-btn @click="addRole">
            <v-icon name="plus"/>
            <span>New</span>
          </v-btn>
          <v-btn :disabled="!selectedRole" @click="removeRole">
            <v-icon name="delete_forever"/>
            <span>Delete</span>
          </v-btn>
        </div> -->

        <v-list
          class="roles-panel"
          :items="settings.auth.roles"
          :selected="selectedIndex"
          @click-item="selectRole"
        >
          <template v-slot:item="{ item }">
            <span v-text="item.name"/>
          </template>
          <template v-slot:prepend>
            <div class="toolbar f-row-ac">
              <span class="label px-2 f-grow">Groups</span>
              <v-btn class="icon small m-1" @click="addRole">
                <v-icon name="plus"/>
              </v-btn>
              <v-btn class="icon small m-1" :disabled="!selectedRole" @click="$refs.confirmDeleteDialog.show()">
                <v-icon name="delete_forever"/>
              </v-btn>
            </div>
          </template>

          <!-- <template v-slot:append>
            <div class="toolbar f-row-ac">
              <v-btn @click="addRole">
                <v-icon name="plus"/>
                <span>New</span>
              </v-btn>
              <v-btn :disabled="!selectedRole" @click="removeRole">
                <v-icon name="delete_forever"/>
                <span>Delete</span>
              </v-btn>
            </div>
          </template> -->
        </v-list>
      </template>

      <div v-if="selectedRole" class="role-settings f-col">
        <text-tabs-header
          :items="roleTabs"
          v-model="roleTab"
        />
        <!-- <div class="tabs-header f-row-ac">
          <div
            v-for="tab in roleTabs"
            :key="tab.key"
            role="button"
            class="tab"
            :class="{active: roleTab === tab.key}"
            @click="roleTab = tab.key"
          >
            <span v-text="tab.label"/>
          </div>
        </div> -->
        <div v-if="roleTab === 'settings'" class="role-config f-col">
          <v-text-field
            class="filled"
            label="Name"
            lazy
            v-model="selectedRole.name"
          />
          <!-- <v-select
            class="filled"
            label="Access"
            :items="rolesTypes"
            v-model="selectedRole.type"
          /> -->
          <radio-group
            label="Access"
            color="primary"
            :items="rolesTypes"
            v-model="selectedRole.type"
          >
            <template v-slot:item-append="{ item }">
              <span v-if="item.desc" class="desc-text ml-2">({{ item.desc }})</span>
            </template>
          </radio-group>
          <template v-if="selectedRole.type === 'users'">
            <v-select
              v-if="settings.auth.type === 'users'"
              label="Users"
              class="filled"
              placeholder="Users"
              item-value="username"
              item-text="full_name"
              :items="projectUsers"
              v-model="selectedRole.users"
              multiple
            />
            <users-list
              v-else
              :task="tasks.users"
              v-model="selectedRole.users"
            />
          </template>
        </div>
        <layers-table
          v-if="selectedRole && roleTab === 'base-layers'"
          key="base-layers"
          label="Layer name"
          :items="baseLayers"
          :columns="baseLayersColumns"
          :collapsed.sync="collapsedLayers"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:leaf.perms="{ item }">
            <div class="f-row-ac f-justify-center">
              <v-btn
                v-if="item.attributes"
                class="icon flat"
                :color="selectedRole.permissions.layers[item.id].includes('view') ? 'primary' : '#aaa'"
                @click="toggleBaseLayerPermission(item)"
              >
                <v-icon name="visibility" size="18"/>
              </v-btn>
            </div>
          </template>
        </layers-table>
        <layers-table
          v-if="selectedRole && roleTab === 'overlays'"
          key="overlays"
          label="Layer name"
          :detail="attributesDetail"
          :items="overlays"
          :columns="overlaysColumns"
          :collapsed.sync="collapsedLayers"
          @click:row="toggleAttributes"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:leaf.attrs="{ item }">
            <v-btn
              v-if="item.attributes"
              class="icon flat"
              :color="attributesDetail === item.id ? '' : '#aaa'"
              @click="toggleAttributes(item)"
            >
              <v-icon name="attribute-table" size="18"/>
            </v-btn>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:leaf.perms="{ item }">
            <layer-permissions-flags
              :capabilities="layersPermissionsCapabilities[item.id]"
              :value="layersPerms[item.id]"
            />
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:detail="{ layer, attr }">
            <td>
              <attribute-permissions-flags
                :attribute-meta="attr"
                :layer-capabilities="layersPermissionsCapabilities[layer.id]"
                :layer-permissions="layersPerms[layer.id]"
                :value="attrsPerms[layer.id][attr.name]"
                class="f-justify-end"
              />
            </td>
            <td/>
          </template>

          <!-- eslint-disable-next-line -->
          <!-- <template v-slot:leaf.view="{ item }">
            <v-checkbox
              class="f-justify-center"
              v-model="perms.layers[item.id].view"
            />
          </template> -->
        </layers-table>
      </div>
    </div>
  </div>
  <div v-else class="m-4 f-col-ac">
    <div class="error f-row-ac my-4">
      <v-icon name="warning" class="mr-2"/>
      <span>Invalid Authentication Settings</span>
    </div>
    <v-btn color="primary" @click="initAuthSettings">
      New Authentication Settings
    </v-btn>
  </div>
</template>

<script>
import mapValues from 'lodash/mapValues'
import pickBy from 'lodash/pickBy'
import has from 'lodash/has'
import UsersList from '@/components/UsersList.vue'
import LayersTable from '@/components/LayersTable.vue'
import RadioGroup from '@/ui/RadioGroup.vue'
import TextTabsHeader from '@/ui/TextTabsHeader.vue'
import VTabsHeader from '@/ui/TabsHeader.vue'
import AttributePermissionsFlags from '@/components/AttributePermissionsFlags.vue'
import LayerPermissionsFlags from '@/components/LayerPermissionsFlags.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

import { transformLayersTree } from '@/utils/layers'
import { layerCapabilities, layerPermissionsCapabilities } from '@/flags'
import { TaskState, watchTask } from '@/tasks'

function fullName (user) {
  const parts = [ user.first_name, user.last_name ]
  return parts.filter(p => p).join(' ')
}

export function initLayersPermissions (layers) {
  return {
    layers: mapValues(layers, () => ['view']),
    attributes: mapValues(
      pickBy(layers, l => l.attributes),
      l => Object.fromEntries(l.attributes.map(a => [a.name, ['view']]))
    ),
    // attributes: mapValues(this.project.meta.layers, l => l.attributes && Object.fromEntries(l.attributes.map(a => [a.name, ['view']]))),
    // layers: mapValues(this.project.meta.layers, l => ({
    //   flags: ['view'],
    //   attributes: l.attributes && Object.fromEntries(l.attributes.map(a => [a.name, ['view']]))
    // }))
  }
}

export default {
  name: 'ProjectAccess',
  components: { ConfirmDialog, UsersList, LayersTable, VTabsHeader, TextTabsHeader, RadioGroup, AttributePermissionsFlags, LayerPermissionsFlags },
  props: {
    project: Object,
    settings: Object
  },
  data () {
    return {
      // auth: 'users',
      users: [],
      collapsedLayers: [],
      selectedIndex: 0,
      attributesDetail: null,
      roleTab: 'settings',
      tasks: {
        users: TaskState()
      }
    }
  },
  computed: {
    authSettingsValid () {
      const { auth } = this.settings
      return !!auth && has(auth, 'type')// && has(auth, 'roles')
    },
    accessOptions () {
      return [
        { text: 'Public', value: 'public' },
        { text: 'Private', value: 'private' },
        { text: 'Authenticated', value: 'authenticated' },
        { text: 'Selected Users', value: 'users' }
      ]
    },
    permModes () {
      return [
        { text: 'Read-only access to the whole content', value: 'simple' },
        { text: 'Single permissions group', value: 'advanced' },
        { text: 'Multiple permissions groups', value: 'roles' }
      ]
    },
    rolesTypes () {
      return [
        // { text: 'Project Access', value: 'all' },
        {
          text: 'Selected Users',
          value: 'users',
          // desc: 'Group of listed users'
        },
        {
          text: 'All authenticated users',
          value: 'authenticated',
          // desc: 'All authenticated users'
        }, // if settings.auth === 'public'
        // { text: 'Anonymous', value: 'anonymous' }, // if settings.auth === 'public' // maybe not needed
        {
          text: 'Other',
          value: 'other',
          desc: 'Special group of users not matched by any other role/group'
        }
      ]
    },
    roleTabs () {
      return [
        { label: 'Role Settings', key: 'settings' },
        { label: 'Base Layers', key: 'base-layers' },
        { label: 'Layers & Attributes', key: 'overlays' }
      ]
    },
    selectedRole () {
      return this.settings.auth?.roles?.[this.selectedIndex]
    },
    layersPerms () {
      return this.selectedRole?.permissions?.layers
    },
    attrsPerms () {
      return this.selectedRole?.permissions?.attributes
    },
    baseLayers () {
      const meta = this.project.meta
      const tree = meta.layers_tree.filter(i => this.settings.base_layers.includes(i.id || i.name))
      return transformLayersTree(
        tree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ name: g.name, layers })
      )
    },
    overlays () {
      const meta = this.project.meta
      const overlaysTree = meta.layers_tree.filter(i => !this.settings.base_layers.includes(i.id || i.name))
      return transformLayersTree(
        overlaysTree,
        l => ({ ...meta.layers[l.id] }),
        (g, layers) => ({ name: g.name, layers })
      )
    },
    baseLayersColumns () {
      return [
        { text: 'Permissions', value: 'perms', header: { attrs: { width: 1 } } }
      ]
    },
    // overlaysColumns () {
    //   return [
    //     {
    //       text: 'View',
    //       value: 'view'
    //     }, {
    //       text: 'Query',
    //       value: 'query'
    //     }, {
    //       text: 'Insert',
    //       value: 'insert'
    //     }, {
    //       text: 'Update',
    //       value: 'update'
    //     }, {
    //       text: 'Delete',
    //       value: 'delete'
    //     }
    //   ]
    // },
    overlaysColumns () {
      return [
        { text: 'Permissions', value: 'perms', header: { attrs: { width: 1 } } },
        { text: 'Attributes', value: 'attrs', header: { attrs: { width: 1 } } },
      ]
    },
    projectUsers () {
      if (this.tasks.users.success) {
        const usernames = new Set(this.settings.auth.users)
        return this.tasks.users.data.filter(u => usernames.has(u.username))
      }
      return []
    },
    layersProjectCapabilities () {
      return mapValues(this.project.meta.layers, l => layerCapabilities(l, this.settings.layers[l.id]))
    },
    layersPermissionsCapabilities () {
      return mapValues(this.project.meta.layers, l => layerPermissionsCapabilities(
        this.layersProjectCapabilities[l.id], this.settings.layers[l.id]?.flags, this.layersPerms[l.id])
      )
    }
  },
  mounted () {
    this.fetchUsers()
  },
  methods: {
    initAuthSettings () {
      this.$set(this.settings, 'auth', { type: 'private', users: null, roles: null })
    },
    createRole (params) {
      return {
        name: 'New',
        type: 'users',
        ...params,
        users: [],
        permissions: initLayersPermissions(this.project.meta.layers)
      }
    },
    setAuthType (type) {
      if (type !== 'users' && this.settings.auth.users) {
        this.$delete(this.settings.auth, 'users')
      }
      if (type === 'users' && !this.settings.auth.users) {
        this.$set(this.settings.auth, 'users', [])
      }
      this.settings.auth.type = type
    },
    async fetchUsers () {
      const setFullName = u => {
        u.full_name = fullName(u)
      }
      const task = this.$http.get('/api/users').then(resp => {
        resp.data.forEach(setFullName)
        return resp
      })
      watchTask(task, this.tasks.users)
    },
    addRole () {
      this.settings.auth.roles.push(this.createRole())
    },
    removeRole () {
      this.settings.auth.roles = this.settings.auth.roles.filter(r => r !== this.selectedRole)
      this.selectedIndex = 0
    },
    selectRole (_, index) {
      this.selectedIndex = index
    },
    toggleBaseLayerPermission (layer) {
      const visible = this.selectedRole.permissions.layers[layer.id].includes('view')
      this.selectedRole.permissions.layers[layer.id] = visible ? [] : ['view']
    },
    toggleAttributes (layer) {
      if (layer.attributes) {
        this.attributesDetail = this.attributesDetail === layer.id ? null : layer.id
      }
    },
    toggleRolesMode (enable) {
      if (enable) {
        // this.settings.auth.roles = this._rolesBackupValue ?? []
        this.$set(this.settings.auth, 'roles', this._rolesBackupValue ?? [])
      } else {
        this._rolesBackupValue = this.settings.auth.roles
        // this.settings.auth.roles = null
        this.$set(this.settings.auth, 'roles', null)
      }
      // this.settings.auth.roles = enable ? [] : null
    }
  }
}
</script>

<style lang="scss" scoped>
.users-list {
  // max-width: 400px;
  display: flex;
  flex-direction: column;
}
.l-col2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  .switch {
    align-self: end;
    justify-self: start;
  }
}
// .l-col2 {
//   display: flex;
//   flex-direction: column;
//   max-width: 460px;
// }

.roles-settings {
  display: grid;
  grid-template-columns: 275px 1fr;
  gap: 6px;
  .roles-panel {
    grid-row: 1 / 3;
    align-self: start;
    grid-column: 1 / 2;
    position: sticky;
    top: 0;
    .label {
      font-weight: 500;
    }
  }
}
.access-settings {
  // border: 1px solid var(--border-color);
  // &.simple {
  //   display: flex;
  //   flex-direction: column;
  // }
  &.roles {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 6px;
    .roles-panel {
      grid-row: 1 / 3;
      align-self: start;
      grid-column: 1 / 2;
      position: sticky;
      top: 0;
      .label {
        font-weight: 500;
      }
    }
  }
}
.role-config {
  .i-field {
    max-width: 500px;
  }
}
.tabs {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  .tab {
    height: 32px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: #eee;
    &.active {
      background-color: var(--color-primary);
      color: #fff;
    }
  }
}
.toolbar {
  // position: sticky;
  // top: 0;
  background-color: #eee;
  border: 1px solid #ccc;
  border-bottom: none;
}
.error {
  color: var(--color-red);
  --icon-color: currentColor;
}
.tabs-header {
  background-color: #eee;
  height: 32px;
  .tab {
    padding-inline: 6px;
    height: inherit;
    // padding: 3px;
    display: flex;
    align-items: center;
    &.active {
      color: #fff;
      background-color: var(--color-primary);
    }
  }
}
.desc-text {
  opacity: 0.6;
  font-size: 13.5px;
}
.layers-table {
  margin: 6px;
  border: 1px solid #ddd;
  border-top: none;
}
</style>
