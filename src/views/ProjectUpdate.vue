<template>
  <div class="update page-content">
    <plugin-disconnected v-if="!connected"/>
    <template v-else-if="projectInfo">
      <div v-if="projectInfo.file !== project.meta.file" class="f-row-ac warning p-2">
        <v-icon name="warning"/>
        <span class="ml-2">Project filename doesn't match!</span>
      </div>
      <!-- <json-viewer v-if="diffs.raw" :data="diffs.raw"/> -->
      <json-viewer v-if="diffs.raw2" :data="diffs.raw2"/>
      <div v-if="diffs">
        <div><strong>New Layers:</strong> {{ diffs.newLayers }}</div>
        <div><strong>Removed Layers:</strong> {{ diffs.removedLayers }}</div>
        <div><strong>Changed Layers:</strong> {{ diffs.changedLayers }}</div>
        <div><strong>Layers with changed attributes:</strong> {{ diffs.changedAttrsLayers }}</div>
      </div>
      <div v-else class="p-2">No changes in QGIS metadata!</div>
      <qgis-layers-info :meta="projectInfo"/>
      <hr/>

      <!-- <div>Files Diff: {{ filesDiff }}</div> -->
      <!-- <div class="files-section"> -->
        <div class="f-col">
          <div class="toolbar f-row-ac">
             <v-btn @click="fetchFiles">Load Files</v-btn>
          </div>
          <files-tree
            v-if="clientFiles && filesDiff"
            :files="clientFiles"
            :flags="filesDiff.flags"
            :progress="uploadProgress && uploadProgress.files"
          />
          <div v-if="filesDiff">
            <div><strong>New Files:</strong> {{ diffs.new }}</div>
            <div><strong>Modified Files:</strong> {{ diffs.updated }}</div>
          </div>
        </div>
        <!-- <files-tree
          v-if="serverFiles"
          :files="serverFiles"
        /> -->
      <!-- </div> -->
      <hr/>
      <div class="toolbar f-row-ac">
        <v-btn color="primary" @click="updateQgisMetadata">Update QGIS Metadata</v-btn>
        <v-btn
          color="primary"
          :disabled="!filesDiff"
          :loading="!!uploadProgress"
          @click="updateFiles"
        >
          Update Files
        </v-btn>
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

// import JsonViewer from '@/components/JsonViewer2.vue'
import JsonViewer from '@/components/JsonDiffViewer.vue'
import FilesTree from '@/components/FilesTree.vue'
import QgisLayersInfo from '@/components/QgisLayersInfo.vue'
import PluginDisconnected from '@/components/PluginDisconnected.vue'

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
      uploadProgress: null
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
    },
    diffs () {
      if (this.projectInfo) {
        const ignoredFields = ['client_info', 'project_hash']
        const orig = omit(this.project.meta, ignoredFields)
        const current = omit(this.projectInfo, ignoredFields)
        const meta = isEqual(current, orig)

        console.log(Object.keys(current.layers))
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
        console.log('isEmpty', isEmpty(metaDiff))
        return {
          equal: meta,
          raw: isEmpty(metaDiff) ? null : metaDiff,
          raw2: isEmpty(metaDiff2) ? null : metaDiff2,
          newLayers,
          removedLayers,
          changedLayers,
          changedAttrsLayers
        }
      }
    }
  },
  activated () {
    console.log('activated')
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
      console.log('fetchProjectInfo')
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
    updateQgisMetadata () {
      this.$http.post(`/api/project/meta/${this.project.name}`, this.projectInfo)
    },
    async updateFiles () {
      const files = [...this.filesDiff.new, ...this.filesDiff.updated]
      // const uploadFilesSet = new Set([...this.filesDiff.new, ...this.filesDiff.updated])
      // console.log(this.filesDiff)
      // console.log(uploadFilesSet)
      // const files = this.clientFiles.filter(f => uploadFilesSet.has(f.path))
      console.log(files)
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
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.files-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.toolbar {
  background-color: #eee;
}
.warning {
  color: var(--color-orange);
  --icon-color: currentColor;
}
</style>
