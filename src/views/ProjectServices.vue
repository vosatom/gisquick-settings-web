<template>
  <div class="topics">
    <div class="f-col panel box">
      <scroll-area>
        <div class="f-col f-grow">
          <div class="f-row label px-2 toolbar">
            <span class="f-grow">Storage providers</span>
            <div class="actions">
              <v-btn
                @click="addStorageProvider"
                title="Add storage provider"
                class="icon small m-0"
              >
                <v-icon name="plus" />
              </v-btn>
            </div>
          </div>

          <v-list
            class="flat f-grow m-0"
            empty-text="No storage providers"
            item-key="id"
            item-text="label"
            :items="savedStorageArray"
            :selected="active.type === 'storage' && active.item?.id"
            @click-item="(item) => selectItem('storage', item.id)"
          >
            <template v-slot:item="{ item, selected }">
              <v-icon
                v-if="item.invalid"
                name="warning"
                color="orange"
                class="mr-2"
              />
              <span v-text="item.label" class="f-grow" />
              <v-btn
                v-if="selected && item.type !== 'local'"
                v-show="active.item === item"
                class="remove icon small m-0"
                tabindex="-1-"
                @click.stop="removeActiveItem('storage')"
              >
                <v-icon name="delete_forever" />
              </v-btn>
            </template>
          </v-list>
        </div>
        <div v-if="tasks.appData.pending">Loading services</div>
        <template v-else>
          <div class="f-col f-grow">
            <div class="f-row label px-2 toolbar">
              <span class="f-grow">Feature providers</span>
              <v-btn
                @click="addProvider"
                title="Add feature provider"
                class="icon small m-0"
              >
                <v-icon name="plus" />
              </v-btn>
            </div>
            <v-list
              class="flat f-grow m-0"
              empty-text="No providers"
              item-key="id"
              item-text="label"
              :items="savedProvidersArray"
              :selected="active.type === 'provider' && active.item?.id"
              @click-item="(item) => selectItem('provider', item.id)"
            >
              <template v-slot:item="{ item, selected }">
                <v-icon
                  v-if="item.invalid"
                  name="warning"
                  color="orange"
                  class="mr-2"
                />
                <span v-text="item.label" class="f-grow" />
                <div class="actions">
                  <v-btn
                    v-show="selected"
                    class="remove icon small m-0"
                    tabindex="-1-"
                    @click.stop="removeActiveItem('provider')"
                  >
                    <v-icon name="delete_forever" />
                  </v-btn>
                </div>
              </template>
            </v-list>
          </div>
          <div class="f-col f-grow">
            <div class="f-row label px-2 toolbar">
              <span class="f-grow">Features</span>
            </div>
            <v-list
              class="flat f-grow m-0"
              item-key="id"
              empty-text="No available features"
              item-text="label"
              :items="availableFeatures"
              :selected="active.type === 'feature' && active.item?.id"
              @click-item="(item) => selectFeature(item.id)"
            >
              <template #item="{ item }">
                <span v-text="item.label" class="f-grow" />
                <v-icon
                  name="check"
                  title="Active"
                  v-if="settings.services.features?.[item.id]?.enabled"
                />
              </template>
            </v-list>
          </div>
        </template>
      </scroll-area>
    </div>

    <div class="form py-2">
      <span class="f-col-ac f-justify-center empty-message" v-if="!active.item">
        Select service from sidebar
      </span>
      <div class="f-col" v-else-if="active.type === 'provider'">
        <div class="px-2">
          <h2>{{ active.item.label }}</h2>
        </div>

        <div>
          <v-text-field
            class="filled"
            label="Provider name"
            v-model="active.item.label"
            lazy
          />

          <v-select
            :items="supportedProvidersArray"
            item-value="id"
            item-text="label"
            v-model="active.item.type"
            label="Provider type"
            class="filled"
          />

          <v-text-field
            class="filled"
            label="Base URL"
            v-model="active.item.settings.baseUrl"
            lazy
          >
            <v-btn
              slot="append"
              tabindex="-1"
              class="small"
              v-if="active.item.type === 'wfs'"
              @click="
                $set(
                  active.item.settings,
                  'baseUrl',
                  `/api/map/ows/${project.name}`,
                )
              "
            >
              Set current
            </v-btn>
          </v-text-field>
          <div v-if="active.item.type === 'wfs'">
            <AttributesSelect
              :settings="settings"
              :project="project"
              :config="active.item.settings"
            />
          </div>
          <div v-else-if="active.item.type === 'cusdis'">
            <v-text-field
              class="filled"
              label="App ID"
              v-model="active.item.settings.appId"
            />
            <v-text-field
              class="filled"
              label="Locale"
              v-model="active.item.settings.locale"
            />
          </div>
          <div v-else>
            <v-text-field
              class="filled"
              label="API key"
              v-model="active.item.settings.key"
            />
            <v-text-field
              class="filled"
              label="Locale"
              v-model="active.item.settings.locale"
            />
          </div>
        </div>

        <pre v-if="debug">{{ JSON.stringify(active.item, null, '  ') }}</pre>
      </div>
      <div class="f-col" v-else-if="active.type === 'feature'">
        <div class="px-2">
          <h2>Feature {{ featureConfig.label }}</h2>
        </div>

        <div class="f-row">
          <v-select
            class="filled f-grow"
            :items="featureProviders"
            item-value="id"
            item-text="label"
            @input="assignProvidersToFeature"
            :value="active.item.provider ?? null"
            label="Provider"
            placeholder="None"
            :multiple="!!featureConfig.multipleProviders"
          >
            <template v-slot:selection="{ text }">
              <span class="value f-grow" v-text="text" />
              <v-btn
                v-if="!Array.isArray(active.item.provider)"
                class="small"
                :disabled="!active.item.provider"
                @click="selectItem('provider', active.item.provider)"
              >
                Open settings
              </v-btn>
            </template>
          </v-select>
        </div>

        <div v-if="featureConfig.settings">
          <div v-for="setting in featureConfig.settings" :key="setting.id">
            <v-checkbox
              v-model="active.item.settings[setting.id]"
              :label="setting.label"
              v-if="setting.type === 'boolean'"
            />
            <v-select
              v-else-if="setting.type === 'select'"
              item-value="id"
              item-text="label"
              v-model="active.item.settings[setting.id]"
              :label="setting.label"
              class="filled"
              v-bind="setting.props"
            />
          </div>
        </div>

        <pre v-if="debug">{{ JSON.stringify(active.item, null, '  ') }}</pre>
      </div>
      <div class="f-col" v-else-if="active.type === 'storage'">
        <div class="px-2">
          <h2>{{ active.item.label }} storage</h2>
        </div>

        <div>
          <v-text-field
            class="filled"
            label="Storage label"
            v-model="active.item.label"
            :disabled="active.item.type === 'local'"
            lazy
          />

          <div
            v-if="active.item.type !== 'local' && supportedStorage.length > 1"
          >
            <v-select
              :items="supportedStorage"
              item-value="id"
              item-text="label"
              v-model="active.item.type"
              label="Storage type"
              class="filled"
              :disabled="active.item.type === 'local'"
            />
          </div>

          <div v-if="active.item.type === 's3'">
            <v-text-field
              class="filled"
              label="Bucket name"
              v-model="active.item.bucket"
              lazy
            />
            <v-text-field
              class="filled"
              label="Store_url"
              v-model="active.item.store_url"
              lazy
            />
            <v-text-field
              class="filled"
              label="Region"
              v-model="active.item.region"
              lazy
            />
            <v-text-field
              class="filled"
              label="Access Key"
              v-model="active.item.access_key"
              lazy
            />
            <v-text-field
              class="filled"
              label="Secret Key"
              v-model="active.item.secret_key"
              lazy
              :type="currentPasswordVisible ? 'text' : 'password'"
            >
              <v-btn
                slot="append"
                tabindex="-1"
                class="small icon flat"
                @click="currentPasswordVisible = !currentPasswordVisible"
              >
                <v-icon
                  :name="
                    currentPasswordVisible ? 'visibility_off' : 'visibility'
                  "
                />
              </v-btn>
            </v-text-field>
          </div>
        </div>
        <pre v-if="debug">{{ JSON.stringify(active.item, null, '  ') }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
// Based on ./src/components/TopicsEditor.vue
import ScrollArea from '@/ui/ScrollArea.vue'
import Vue from 'vue'
import { nanoid } from 'nanoid'
import cloneDeep from 'lodash/cloneDeep'

import { defaultFeaturesSettings } from '@/modules/mnk/features'
import AttributesSelect from '@/components/AttributesSelect.vue'
import { TaskState, watchTask } from '@/tasks'

export default {
  components: { ScrollArea, AttributesSelect },
  inject: ['project', 'settings'],
  props: {
    type: String,
    id: String,
  },
  data() {
    return {
      currentPasswordVisible: false,
      supportedProviders: {},
      supportedFeatures: {},
      tasks: {
        appData: TaskState(),
      },
    }
  },
  setup() {
    return { debug: false, supportedStorage: [{ id: 's3', label: 'S3' }] }
  },
  mounted() {
    const task = this.$http.get('/map/config.json').then((resp) => {
      this.supportedProviders = resp.data.providers
      this.supportedFeatures = resp.data.features
      return resp.data
    })
    watchTask(task, this.tasks.appData)
  },
  computed: {
    savedProvidersArray() {
      return Object.values(this.settings.services.providers ?? {})
    },
    savedFeaturesArray() {
      return Object.values(this.settings.services.features ?? {})
    },
    savedStorageArray() {
      return Object.values(this.settings.storage ?? {})
    },
    supportedProvidersArray() {
      return Object.values(this.supportedProviders)
    },
    supportedFeaturesArray() {
      return Object.values(this.supportedFeatures)
    },
    availableFeatures() {
      const features = {}
      this.savedProvidersArray.forEach((provider) => {
        const type = provider.type
        const providerConfig = this.supportedProviders[type]
        if (providerConfig?.features) {
          Object.keys(providerConfig?.features).forEach((featureKey) => {
            if (this.supportedFeatures[featureKey]) {
              features[featureKey] = this.supportedFeatures[featureKey]
            }
          })
        }
      })

      return Object.values(features)
    },
    featureConfig() {
      if (this.active.item && this.active.type === 'feature') {
        return this.supportedFeatures[this.active.item.id]
      }
      return {}
    },
    featureProviders() {
      if (this.active.type !== 'feature') return {}
      const items = this.savedProvidersArray.filter(
        (savedProvider) =>
          this.supportedProviders[savedProvider.type]?.features?.[
            this.active.item.id
          ],
      )
      if (this.featureConfig.multipleProviders) {
        return items
      }
      return [{ id: null, label: 'None' }, ...items]
    },
    active() {
      const type = this.type
      let item = null
      if (this.type === 'feature') {
        item = this.settings.services.features[this.id]
      } else if (this.type === 'provider') {
        item = this.settings.services.providers[this.id]
      } else if (this.type === 'storage') {
        item = this.settings.storage.find((item) => item.id === this.id)
      }
      return { type, item }
    },
  },
  methods: {
    selectItem(type, id) {
      this.$router.push({
        path: `/${this.project.name}/services/${type}/${id}`,
      })
    },

    selectFeature(id) {
      let item = this.settings.services.features[id]
      if (!item) {
        item = cloneDeep(defaultFeaturesSettings[id])
        Vue.set(this.settings.services.features, id, item)
      }

      this.selectItem('feature', item.id)
    },

    addStorageProvider() {
      const id = nanoid()

      const activeItem = {
        id,
        label: 'New provider',
        type: 's3',
        access_key: '',
        bucket: '',
        secret_key: '',
        store_url: '',
        region: '',
      }

      Vue.set(this.settings, 'storage', [
        ...(this.settings.storage ?? []),
        activeItem,
      ])
      this.selectItem('storage', activeItem.id)
    },

    addProvider() {
      const id = nanoid()

      const activeItem = {
        id,
        type: this.supportedProvidersArray[0].id,
        label: 'New provider',
        settings: {},
      }

      Vue.set(this.settings.services.providers, id, activeItem)
      this.selectItem('provider', activeItem.id)
    },

    assignProvidersToFeature(newValue) {
      if (Array.isArray(newValue)) {
        this.active.item.provider = newValue.filter((v) => v !== null)
        this.active.item.enabled = this.active.item.provider.length > 0
        return
      }
      this.active.item.provider = newValue
      this.active.item.enabled = newValue !== null
    },

    removeActiveItem(type) {
      if (!this.active || this.active.type !== type) return
      const activeItem = this.active.item
      if (type === 'storage') {
        Vue.set(
          this.settings,
          'storage',
          this.settings.storage.filter((storage) => storage !== activeItem),
        )
      } else if (type === 'provider') {
        // Remove provider from features
        Object.values(this.settings.services.features).forEach((feature) => {
          if (Array.isArray(feature.provider)) {
            const index = feature.provider.indexOf(activeItem.id)
            if (index !== -1) {
              feature.provider.splice(index, 1)
            }
            feature.enabled = feature.provider.length > 0
          } else if (feature.provider === activeItem.id) {
            feature.provider = null
            feature.enabled = false
          }
        })

        Vue.delete(this.settings.services.providers, activeItem.id)
      } else if (type === 'feature') {
        Vue.delete(this.settings.services.features, activeItem.id)
      }
      this.selected = { type: null, id: null }
    },
  },
}
</script>

<style lang="scss" scoped>
.topics {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 3fr;
  grid-template-rows: auto 1fr;
  // max-height: 100%;

  min-height: 0;
  height: 100%;
  flex-shrink: 1;
  overflow: auto;

  .v-toolbar {
    grid-row: 1 / 2;
    grid-column: 1 / 3;
  }
  .panel {
    grid-row: 2 / 4;
    grid-column: 1 / 2;
  }
  .form {
    grid-row: 2 / 3;
    grid-column: 2 / 3;
    overflow-y: auto;
    .v-input {
      flex-grow: 0;
    }
    border: solid var(--border-color);
    border-width: 1px 1px 1px 0;
  }
  .box {
    border: 1px solid #ccc;
    // border-radius: 3px;
  }
}

.toolbar {
  background-color: #eee;
  border: 1px solid #ccc;
  border-width: 1px 0 1px 0;
  font-weight: 500;
}
</style>
