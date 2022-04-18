<template>
  <div class="update page-content f-col">
    <plugin-disconnected v-if="!connected"/>
    <template v-else-if="projectInfo">
      <div v-if="projectInfo.file !== project.meta.file" class="f-row-ac warning p-2">
        <v-icon name="warning"/>
        <span class="ml-2">Project filename doesn't match!</span>
      </div>
      <!-- <json-viewer v-if="diffs.raw" :data="diffs.raw"/> -->
      <div v-if="diffs.raw2" class="m-2">
        <div class="f-row-ac">
          <strong>Metadata Differences</strong>
          <v-btn color="primary" class="flat small my-0 n-case" @click="showMetaDiff = !showMetaDiff">
            <span v-text="showMetaDiff ? 'Hide' : 'Show'"/>
          </v-btn>
        </div>
        <json-viewer v-if="showMetaDiff" :data="diffs.raw2"/>
      </div>
      <div v-else class="p-2">No changes in QGIS metadata!</div>

      <div v-if="diffs.raw2" class="m-2">
        <div class="f-row-ac">
          <strong>Summary of layer changes</strong>
          <v-btn color="primary" class="flat small my-0 n-case" @click="showLayerSummary = !showLayerSummary">
            <span v-text="showLayerSummary ? 'Hide' : 'Show'"/>
          </v-btn>
        </div>

        <div v-if="showLayerSummary" class="f-row">
          <div
            v-for="[label, list], in [['New', layersSummary.newLayers], ['Removed', layersSummary.removedLayers], ['Changed', layersSummary.changedLayers]]"
            :key="label"
            class="mx-4 my-2"
          >
            <span class="subtitle">{{ label }}:</span>
            <ul>
              <li v-for="n in list" :key="n" v-text="n"/>
            </ul>
          </div>
        </div>

        <!-- <div class="ml-4">
          <span class="subtitle">New:</span> {{ diffs.newLayers.join(', ') }}
        </div>
        <div class="ml-4">
          <span class="subtitle">Removed:</span> {{ diffs.removedLayers.join(', ') }}
        </div>
        <div class="ml-4">
          <span class="subtitle">Changed:</span> {{ diffs.changedLayers.join(', ') }}
        </div> -->

        <!-- <div><strong>Layers with changed attributes:</strong> {{ diffs.changedAttrsLayers }}</div> -->
      </div>
      <div class="card f-col">
        <div class="header f-row-ac dark px-4">
          <span class="title">Layers</span>
        </div>
        <qgis-layers-info :meta="projectInfo"/>
      </div>

      <div class="card f-col">
        <div class="header f-row-ac dark px-4">
          <span class="title">Files</span>
          <span class="f-grow"/>
          <v-btn
            v-if="tasks.clientFiles.data"
            class="icon"
            :loading="tasks.clientFiles.pending"
            @click="fetchLocalFiles"
          >
            <v-icon name="reload"/>
          </v-btn>
        </div>

        <v-btn
          v-if="!tasks.clientFiles.data"
          class="load"
          color="primary"
          @click="fetchFiles"
        >
          Load Files
        </v-btn>
        <files-tree
          v-if="clientFiles && filesDiff"
          :files="clientFiles"
          :flags="filesDiff.flags"
          :progress="uploadProgress && uploadProgress.files"
        />
        <template v-if="filesDiff">
          <hr/>
          <div class="p-2">
            <small>New Files: {{ filesDiff.new.length }}, </small>
            <small>Modified Files: {{ filesDiff.updated.length }}</small>
          </div>
        </template>
      </div>

      <div class="f-row-ac m-2 f-justify-center">
        <template v-if="diffs.raw2">
          <v-btn
            color="primary"
            :disabled="!diffs || !clientFiles"
            @click="updateProject"
          >
            Update Project
          </v-btn>
          <v-checkbox
            :disabled="!filesDiff"
            label="Update all files"
            v-model="shouldUpdateAllFiles"
          />
        </template>
        <v-btn
          v-else-if="filesDiff"
          color="primary"
          :loading="!!uploadProgress"
          @click="updateAllFiles"
        >
          Update Files
        </v-btn>
        <p v-else class="p-2">No changes detected</p>
      </div>
    </template>
  </div>
</template>

<script>
import omit from 'lodash/omit'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import difference from 'lodash/difference'
import keyBy from 'lodash/keyBy'
import cloneDeep from 'lodash/cloneDeep'

// import JsonViewer from '@/components/JsonViewer2.vue'
import JsonViewer from '@/components/JsonDiffViewer.vue'
import FilesTree from '@/components/FilesTree.vue'
import QgisLayersInfo from '@/components/QgisLayersInfo.vue'
import PluginDisconnected from '@/components/PluginDisconnected.vue'

// import { initLayersPermissions } from '@/views/ProjectAccess.vue'
import { objDiff, objectDiff } from '@/utils/diff'
import { TaskState, watchTask } from '@/tasks'
import { createUpload } from '@/upload'

export default {
  name: 'ProjectUpdate',
  components: { JsonViewer, FilesTree, QgisLayersInfo, PluginDisconnected },
  props: {
    project: Object,
    settings: Object
  },
  data () {
    return {
      error: null,
      projectInfo: null,
      opened: [],
      tasks: {
        clientFiles: TaskState()
      },
      uploadProgress: null,
      showMetaDiff: false,
      showLayerSummary: false,
      shouldUpdateAllFiles: false
    }
  },
  computed: {
    connected () {
      return this.$ws.pluginConnected
    },
    clientFiles () {
      return this.tasks.clientFiles.data?.files
    },
    serverFiles () {
      return this.project.files.data
    },
    filesDiff () {
      if (this.clientFiles && this.serverFiles) {
        const sfMap = keyBy(this.serverFiles, 'path')
        const newFiles = this.clientFiles.filter(f => !sfMap[f.path])
        const updatedFiles = this.clientFiles.filter(f => sfMap[f.path] && sfMap[f.path].hash !== f.hash)

        const newPaths = new Set(newFiles.map(f => f.path))
        const updatedPaths = new Set(updatedFiles.map(f => f.path))
        const flags = this.clientFiles.reduce((flags, f) => {
          if (newPaths.has(f.path)) {
            flags[f.path] = 'new'
          }
          if (updatedPaths.has(f.path)) {
            flags[f.path] = 'changed'
          }
          return flags
        }, {})
        return {
          new: newFiles,
          updated: updatedFiles,
          flags
        }
      }
      return null
    },
    diffs () {
      if (this.projectInfo) {
        const ignoredFields = ['client_info', 'project_hash']
        const orig = omit(this.project.meta, ignoredFields)
        const current = omit(this.projectInfo, ignoredFields)
        const meta = isEqual(current, orig)

        const layersIds = {
          orig: Object.keys(orig.layers),
          current: Object.keys(current.layers)
        }
        const newLayers = difference(layersIds.current, layersIds.orig)
        const removedLayers = difference(layersIds.orig, layersIds.current)
        const changedLayers = layersIds.current.filter(id => orig.layers[id] && !isEqual(current.layers[id], orig.layers[id]))
        const checkAttribs = (l1, l2) => isEqual(l1.attributes?.map(a => a.name), l2.attributes?.map(a => a.name))
        const changedAttrsLayers = changedLayers.filter(id => !checkAttribs(orig.layers[id], current.layers[id]))
        const metaDiff = objDiff(current, orig)
        const metaDiff2 = objectDiff(current, orig)
        return {
          equal: meta,
          raw: isEmpty(metaDiff) ? null : metaDiff,
          raw2: Object.keys(metaDiff2).length > 1 ? metaDiff2 : null, // empty object will have $diff property
          newLayers,
          // newLayers: newLayers.map(id => current.layers[id].title),
          removedLayers,
          // removedLayers: removedLayers.map(id => orig.layers[id].title),
          changedLayers,
          // changedLayers: changedLayers.map(id => current.layers[id].title),
          changedAttrsLayers
        }
      }
      return null
    },
    layersSummary () {
      if (this.diffs) {
        return {
          newLayers: this.diffs.newLayers.map(id => this.projectInfo.layers[id].title),
          changedLayers: this.diffs.changedLayers.map(id => this.projectInfo.layers[id].title),
          removedLayers: this.diffs.removedLayers.map(id => this.project.meta.layers[id].title)
        }
      }
      return null
    }
  },
  activated () {
    const unbind = this.$ws.bind('ProjectChanged', this.onProjectChange)
    this.$once('hook:deactivated', unbind)
    if (this.connected) {
       this.fetchProjectInfo()
    }
  },
  watch: {
    connected (connected) {
      if (!this._inactive && connected) {
        this.onProjectChange()
      }
    }
  },
  methods: {
    async onProjectChange () {
      await this.fetchProjectInfo()
      if (!!this.files) {
        this.tasks.clientFiles = TaskState()
        this.fetchLocalFiles()
      }
    },
    async fetchProjectInfo (skipLayersWithError=false) {
      if (!this.connected) {
        return
      }
      this.error = null
      const params = {
        skip_layers_with_error: skipLayersWithError
      }
      try {
        const { data } = await this.$ws.request('ProjectInfo', params)
        this.projectInfo = data
      } catch (err) {
        this.projectInfo = null
        this.error = {
          code: err.status,
          msg: err.data || 'Error',
          details: err.traceback
        }
      }
    },
    fetchLocalFiles () {
      const task = this.$ws.request('ProjectFiles')
      watchTask(task, this.tasks.clientFiles)
    },
    fetchServerFiles () {
      this.project.files.fetch()
    },
    fetchFiles () {
      this.fetchLocalFiles()
      if (!this.project.files.data) {
        this.fetchServerFiles()
      }
    },
    async updateFiles (files) {
      // console.log(files)
      this.upload = createUpload(this.$ws, files, this.project.name)
      this.uploadProgress = this.upload.info
      try {
        await this.upload.start()
      } catch (e) {
        if (e !== 'aborted') {
          console.error(e)
          // this.$notification.error(e)
        }
      } finally {
        // this.fetchServerFiles()
        this.uploadProgress = null
        this.$notify.success('Files was uploaded')
      }
    },
    async updateAllFiles () {
      const files = [...this.filesDiff.new, ...this.filesDiff.updated]
      this.updateFiles(files)
      this.fetchServerFiles()
    },
    async updateProject () {
      const files = this.shouldUpdateAllFiles
        ? [...this.filesDiff.new, ...this.filesDiff.updated]
        : this.clientFiles.filter(f => f.path === this.projectInfo.file)

      const settings = cloneDeep(this.settings)
      this.diffs.newLayers.forEach(id => {
        const layerMeta = this.projectInfo.layers[id]
        settings.layers[id] = { flags: [...layerMeta.flags] }
        settings.auth.roles?.forEach(role => {
          role.permissions.layers[id] = ['view']
          if (layerMeta.attributes) {
            role.permissions.attributes[id] = Object.fromEntries(layerMeta.attributes.map(a => [a.name, ['view']]))
          }
        })
      })
      if (settings.auth.roles) {
        this.diffs.changedLayers.forEach(id => {
          const layerMeta = this.projectInfo.layers[id]
          if (layerMeta.attributes) {
            const currentAttrs = layerMeta.attributes.map(a => a.name)
            const origAttrs = this.project.meta.layers[id].attributes.map(a => a.name)
            const newAttrs = difference(currentAttrs, origAttrs)
            const removedAttrs = difference(origAttrs, currentAttrs)
            if (newAttrs.length || removedAttrs.length) {
              settings.auth.roles?.forEach(role => {
                removedAttrs.forEach(name => delete role.permissions.attributes[id][name])
                newAttrs.forEach(name => {
                  role.permissions.attributes[id][name] = ['view']
                })
              })
            }
          }
        })
      }
      if (this.diffs.removedLayers.length) {
        this.diffs.removedLayers.forEach(id => {
          delete settings.layers[id]
          settings.auth.roles?.forEach(role => {
            delete role.permissions.layers[id]
            delete role.permissions.attributes[id]
          })
        })
        settings.topics?.forEach(t => {
          t.visible_overlays = t.visible_overlays.filter(id => !this.diffs.removedLayers.includes(id))
        })
      }

      // console.log('upload files', files)
      // console.log('update settings', settings)

      await this.updateFiles(files)
      await this.$http.post(`/api/project/meta/${this.project.name}`, this.projectInfo)
      await this.$http.post(`/api/project/settings/${this.project.name}`, settings)
      this.$notify.success('Project was updated')
      this.project.fetch()
      const [ user, name ] = this.project.name.split('/')
      this.$router.push({ name: 'project', params: { user, name: name } })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/card.scss';

.files-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.btn.load {
  align-self: center;
}
.warning {
  color: var(--color-orange);
  --icon-color: currentColor;
}
.subtitle {
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 500;
  text-decoration: underline;
}
ul {
  padding-left: 18px;
}
</style>
