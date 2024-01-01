<template>
  <div>
    <h2 class="subheader px-2">Default project settings</h2>

    <div class="mx-2">
      This feature helps you to set recommended project settings faster. It will
      replace your current project settings based on the selected scopes.
    </div>

    <div>
      <v-checkbox
        v-for="scope in initScopes"
        :key="scope.id"
        :label="scope.label"
        :value="selectedScopes.includes(scope.id)"
        @input="selectedScopes = toggleArrayValue(selectedScopes, scope.id)"
      >
        <div class="f-col px-2">
          <span
            v-if="scope.label"
            class="checkbox-label"
            v-text="scope.label"
          />
          <span
            v-if="scope.description"
            class="checkbox-description"
            v-text="scope.description"
          />
        </div>
      </v-checkbox>
    </div>

    <div class="f-row-ac">
      <v-btn @click="initProject" color="primary">
        Set recommended settings
      </v-btn>

      <div v-if="settingsSet" class="info-success">Done</div>
    </div>

    <div v-if="diff">
      <JsonDiffViewer
        :data="diff"
        v-if="
          diff.$diff.added.length > 0 ||
          diff.$diff.removed.length > 0 ||
          diff.$diff.changed.length > 0
        "
      />
      <div class="mx-2" v-else>No settings changed.</div>
    </div>
  </div>
</template>

<script>
import JsonDiffViewer from '@/components/JsonDiffViewer.vue'
import * as init from './init'
import { objectDiff } from '@/utils/diff'

function toggleArrayValue(array, value) {
  if (array.includes(value)) {
    return array.filter((item) => item !== value)
  }

  return [...array, value]
}

export default {
  inject: ['project', 'settings'],
  computed: {
    diff() {
      if (this.from && this.to) {
        const diff = objectDiff(this.to, this.from)
        return diff
      }
      return null
    },
  },
  setup() {
    return {
      toggleArrayValue,
      initScopes: [
        {
          id: 'topics',
          method: init.initTopics,
          label: 'Topics',
          description: 'Create topics and assign them to layers.',
        },
        {
          id: 'auth',
          method: init.initAuth,
          label: 'Authentication',
          description: 'Set permissions for users and groups.',
        },
        {
          id: 'content',
          method: init.initContent,
          label: 'Content',
          description:
            'Set content related settings (such as description, language or initial extent).',
        },
        {
          id: 'services',
          method: init.initServices,
          label: 'Services',
          description:
            'Set storage providers. Set features and assign them to providers.',
        },
        {
          id: 'layers',
          method: init.initLayers,
          label: 'Layers',
          description: 'Set layers filters, fields and InfoPanel component.',
        },
        {
          id: 'bookmarks',
          method: init.initBookmarks,
          label: 'Bookmarks',
          description: 'Add description to bookmarks.',
        },
      ],
    }
  },
  data() {
    return {
      selectedScopes: this.initScopes.map((scope) => scope.id),
      settingsSet: false,
      from: null,
      to: null,
    }
  },
  methods: {
    initProject() {
      this.from = JSON.parse(JSON.stringify(this.settings))

      this.selectedScopes.forEach((scopeId) => {
        const scope = this.initScopes.find((scope) => scope.id === scopeId)
        scope.method({ project: this.project, settings: this.settings })
        this.settingsSet = true
      })

      this.to = JSON.parse(JSON.stringify(this.settings))

      delete this.from.description
      delete this.to.description
    },
  },
  components: { JsonDiffViewer },
}
</script>

<style scoped>
.checkbox-label {
}
.checkbox-description {
  font-size: 0.8em;
  opacity: 0.75;
  display: block;
}

.info-success {
  color: var(--color-green);
}
</style>
