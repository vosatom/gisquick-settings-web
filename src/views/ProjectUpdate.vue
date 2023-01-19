<template>
  <div class="update page-content f-col f-grow">
    <plugin-disconnected v-if="!connected" class="my-auto"/>
    <error-message
      v-else-if="$ws.pluginUpdateRequired"
      class="my-auto"
      title="Warning"
      color="orange"
    >
      Your QGIS plugin is not supported anymore.<br/>
      Please update your plugin in order to continue.
    </error-message>
    <template v-else-if="projectInfo">
      <v-dialog v-model="showMetadata">
        <div v-if="diffs.raw2" class="metadata-view f-col">
          <div class="toolbar dark f-row-ac px-2">
            <span class="title">Gisquick Metadata</span>
            <div class="f-grow"/>
            <v-checkbox class="filter p-2 m-0 shadow-1" label="Only changes" v-model="showMetadataDiff"/>
            <v-btn class="icon" @click="showMetadata = false">
              <v-icon name="x"/>
            </v-btn>
          </div>
          <json-viewer :data="showMetadataDiff ? diffs.raw2 : projectInfo"/>
        </div>
      </v-dialog>

      <div class="card f-col">
        <div class="header f-row-ac dark px-4">
          <span class="title">Overview</span>
        </div>
        <div class="info-grid">
          <span class="label">QGIS Project File</span>
          <span v-if="currentProjectFile === lastProjectFile" v-text="currentProjectFile"/>
          <div v-else class="f-col-as">
            <strong class="warning f-row-ac">
              <v-icon color="orange" name="warning" class="mr-2"/>
              <span>Project file doesn't match</span>
            </strong>
            <div class="info-grid nested my-2">
              <span class="label">Current</span>
              <span v-text="currentProjectFile"/>
              <span class="label">Previous</span>
              <span v-text="lastProjectFile"/>
            </div>
          </div>
          <!-- <span class="label">Projection</span>
          <span v-text="projectInfo.projection"/> -->
          <span class="label">Gisquick Metadata</span>
          <span v-if="diffs.raw2">
            <a class="link-btn" @click="showMetadata = true">
              <span>Show</span>
            </a>
          </span>
          <span v-else>Without change</span>
        </div>
      </div>

      <!-- <div v-if="diffs.raw2" class="m-2">
        <div><strong>Layers with changed attributes:</strong> {{ diffs.changedAttrsLayers }}</div>
      </div> -->

      <div class="card f-col">
        <div class="header f-row-ac dark px-4">
          <span class="title">Layers</span>
        </div>
        <qgis-layers-info :meta="projectInfo2" :classes="diffLayersClasses"/>
        <layers-errors class="my-2" :errors="layersErrors" :project-info="projectInfo"/>
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
          v-if="!clientFiles || !serverFiles"
          class="load my-4"
          color="primary"
          :loading="tasks.clientFiles.pending"
          @click="fetchFiles"
        >
          Load Files
        </v-btn>
        <files-tree
          v-if="filesDiff"
          :files="filesDiff.files"
          :flags="filesDiff.flags"
          :progress="uploadProgress && uploadProgress.files"
          :selected="updateOpts.files ? selectedFiles : null"
          :disabled="isFileDisabled"
        />
        <template v-if="filesDiff">
          <hr/>
          <div class="statusbar p-2">
            <small>New files: {{ filesDiff.new.length }}, </small>
            <small>Modified files: {{ filesDiff.updated.length }}, </small>
            <small>Missing files: {{ filesDiff.removed.length }}</small>
          </div>
        </template>
      </div>

      <div class="update-card f-col-ac py-4 xshadow-2">
        <div v-if="projectChangesDetected" class="content f-col">
          <v-checkbox
            label="Update QGIS project"
            :disabled="!!layersErrors"
            v-model="updateOpts.qgisProject"
          />
          <div class="f-row-ac">
            <v-checkbox
              label="Update files"
              :disabled="!filesDiff"
              v-model="updateOpts.files"/>
            <div class="f-grow"/>
            <div class="files-options f-row-ac">
              <v-radio-btn
                label="All"
                :disabled="!updateOpts.files"
                :value="updateOpts.files && !selectedFiles"
                @input="selectedFiles = null"
              />
              <v-radio-btn
                label="Selected"
                :disabled="!updateOpts.files"
                :value="updateOpts.files && !!selectedFiles"
                @input="enableFilesSelection"
              />
            </div>
          </div>
          <v-btn
            class="round"
            color="primary"
            :disabled="!updateOpts.qgisProject && !updateOpts.files"
            :loading="!!uploadProgress"
            @click="updateProject"
          >
            <v-icon name="upload" class="mr-2"/>
            <span>Update</span>
          </v-btn>
        </div>
        <p v-else class="p-2">No changes detected</p>
      </div>

    </template>
    <template v-else-if="pluginError">
      <error-message
        v-if="pluginError.code === 404"
        class="my-auto"
        title="Warning"
        color="primary"
      >
        No project is currently opened in QGIS
      </error-message>
      <div v-else class="plugin-error f-col p-2">
        <div class="title f-row-ac my-2">
          <v-icon name="warning" color="red"/>
          <span class="mx-2">Error:</span>
          <span v-text="pluginError.msg"/>
        </div>
        <div v-if="pluginError.details" v-text="pluginError.details" class="traceback"/>
      </div>
    </template>
  </div>
</template>

<script>
import path from 'path'
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
import ErrorMessage from '@/components/ErrorMessage.vue'
import LayersErrors, { layersErrors } from '@/components/LayersErrors.vue'

// import { initLayersPermissions } from '@/views/ProjectAccess.vue'
import { objDiff, objectDiff } from '@/utils/diff'
import { TaskState, watchTask } from '@/tasks'
import { createUpload } from '@/upload'


function findLayer (items, id) {
  for (const item of items) {
    if (item.layers) {
      const match = findLayer(item.layers, id)
      if (match) {
        return [item.name, ...match]
      }
    } else if (item.id === id) {
      return [id]
    }
  }
}
function insertLayer (tree, path) {
  if (path.length === 1) {
    tree.push({ id: path[0] })
  } else if (path.length > 1) {
    const [name, ...rest] = path
    const g = tree.find(i => i.name === name)
    if (g) {
      insertLayer(g.layers, rest)
    } else {
      const newGroup = { name, layers: [] }
      tree.push(newGroup)
      insertLayer(newGroup.layers, rest)
    }
  }
}

export default {
  name: 'ProjectUpdate',
  components: { JsonViewer, FilesTree, QgisLayersInfo, PluginDisconnected, ErrorMessage, LayersErrors },
  props: {
    project: Object,
    settings: Object
  },
  inject: ['reloadProject'],
  data () {
    return {
      pluginError: null,
      projectInfo: null,
      opened: [],
      selectedFiles: null,
      updateOpts: {
        qgisProject: false,
        files: false
      },
      tasks: {
        clientFiles: TaskState()
      },
      uploadProgress: null,
      showMetadata: false,
      showMetadataDiff: true
    }
  },
  computed: {
    connected () {
      return this.$ws.pluginConnected
    },
    clientFiles () {
      return this.tasks.clientFiles.data?.files?.filter(f => !f.path.startsWith('.gisquick/'))
    },
    serverFiles () {
      return this.project.files.data
    },
    filesDiff () {
      if (this.clientFiles && this.serverFiles) {
        const sfMap = keyBy(this.serverFiles, 'path')
        const cfMap = keyBy(this.clientFiles, 'path')
        // const clientFilesPaths = new Set(this.clientFiles.map(f => f.path))

        const newFiles = this.clientFiles.filter(f => !sfMap[f.path])
        const updatedFiles = this.clientFiles.filter(f => sfMap[f.path] && sfMap[f.path].hash !== f.hash)
        const removedFiles = this.serverFiles.filter(f => !cfMap[f.path] && !f.path.startsWith('web/components'))

        const newPaths = new Set(newFiles.map(f => f.path))
        const updatedPaths = new Set(updatedFiles.map(f => f.path))
        const removedPaths = new Set(removedFiles.map(f => f.path))

        const files = [...this.serverFiles, ...newFiles]

        const flags = files.reduce((flags, f) => {
          if (newPaths.has(f.path)) {
            flags[f.path] = 'new'
          }
          if (updatedPaths.has(f.path)) {
            flags[f.path] = 'changed'
          }
          if (removedPaths.has(f.path)) {
            flags[f.path] = 'deleted'
          }
          return flags
        }, {})
        return {
          files,
          flags,
          new: newFiles,
          updated: updatedFiles,
          removed: Array.from(removedPaths)
        }
      }
      return null
    },
    projectChangesDetected () {
      return !!this.diffs.raw2 || !isEmpty(this.filesDiff?.flags)
    },
    // files () {
    //   if (this.clientFiles && this.serverFiles) {
    //     const clientFilesPaths = new Set(this.clientFiles.map(f => f.path))
    //     const serverFilesPaths = new Set(this.serverFiles.map(f => f.path))
    //     const files = [...this.serverFiles]
    //     this.clientFiles.forEach(f => {
    //       if (!serverFilesPaths.has(f.path)) {
    //         files.push(f)
    //       }
    //     })
    //     return files
    //   }
    //   return null
    // },
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
    projectInfo2 () {
      if (this.projectInfo && this.diffs.removedLayers.length) {
        const orig = this.project.meta
        const tree = cloneDeep(this.projectInfo.layers_tree)
        const layers = { ...this.projectInfo.layers }
        this.diffs.removedLayers.forEach(id => {
          const path = findLayer(orig.layers_tree, id)
          insertLayer(tree, path)
          layers[id] = orig.layers[id]
        })
        return {
          layers_tree: tree,
          layers
        }
      }
      return this.projectInfo
    },
    diffLayersClasses () {
      const classes = {}
      if (this.diffs) {
        this.diffs.removedLayers.forEach(id => {
          classes[id] = 'removed'
        })
        this.diffs.newLayers.forEach(id => {
          classes[id] = 'new'
        })
        this.diffs.changedLayers.forEach(id => {
          classes[id] = 'changed'
        })
      }
      return classes
    },
    lastProjectFile () {
      return path.join(this.project.meta.client_info.directory, this.project.meta.file)
    },
    currentProjectFile () {
      return this.projectInfo && path.join(this.projectInfo.client_info.directory, this.projectInfo.file)
    },
    layersErrors () {
      return layersErrors(this.projectInfo)
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
      if (this.tasks.clientFiles.success) {
        this.tasks.clientFiles = TaskState()
        this.fetchLocalFiles()
      }
    },
    async fetchProjectInfo (skipLayersWithError=false) {
      if (!this.connected) {
        return
      }
      this.pluginError = null
      const params = {
        skip_layers_with_error: skipLayersWithError
      }
      try {
        const { data } = await this.$ws.request('ProjectInfo', params)
        this.projectInfo = data
      } catch (err) {
        this.projectInfo = null
        this.pluginError = {
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
      if (!this.tasks.clientFiles.data) {
        this.fetchLocalFiles()
      }
      if (!this.project.files.data) {
        this.fetchServerFiles()
      }
    },
    async updateFiles (files, removedFiles) {
      if (removedFiles?.length) {
        const data = {
          files: removedFiles
        }
        try {
          await this.$http.delete(`/api/project/files/${this.project.name}`, { data })
        } catch (err) {
          throw new Error('Failed to remove files')
        }
      }
      this.upload = createUpload(this.$ws, files, this.project.name)
      this.uploadProgress = this.upload.info
      try {
        await this.upload.start()
      } catch (e) {
        if (e !== 'aborted') {
          throw e
        }
      } finally {
        // this.fetchServerFiles()
        this.uploadProgress = null
        // this.$notify.success('Files was uploaded')
      }
    },
    getFilesToUpdate () {
      const files = { upload: [], remove: [] }
      if (this.updateOpts.files) {
        files.upload = [...this.filesDiff.new, ...this.filesDiff.updated]
        files.remove = this.filesDiff.removed
      } else if (this.updateOpts.qgisProject) {
        if (this.filesDiff) {
          files.upload = this.filesDiff?.updated.filter(f => f.path === this.projectInfo.file)
        } else {
          files.upload = [{
            path: this.projectInfo.file,
            hash: this.projectInfo.project_hash
          }]
        }
      }
      if (this.selectedFiles) {
        const lookup = new Set(this.selectedFiles)
        files.upload = files.upload.filter(f => lookup.has(f.path))
        files.remove = files.remove.filter(p => lookup.has(p))
      }
      return files
    },
    async updateProject () {
      const { upload: filesToUpload, remove: filesToRemove } = this.getFilesToUpdate()
      // console.log('upload files', filesToUpload)
      // console.log('files to remove', filesToRemove)
      // return

      if (this.updateOpts.qgisProject) {
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
              const currentAttrs = layerMeta.attributes?.map(a => a.name)
              const origAttrs = this.project.meta.layers[id].attributes?.map(a => a.name)
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
        if (this.diffs.changedAttrsLayers.length) {
          this.diffs.changedAttrsLayers.forEach(id => {
            const layerMeta = this.projectInfo.layers[id]
            const lset = settings.layers[id]
            const currentAttrs = layerMeta.attributes?.map(a => a.name)
            // v1 - applies changes from metadata diff
            /*
            const origAttrs = this.project.meta.layers[id].attributes?.map(a => a.name)
            const newAttrs = difference(currentAttrs, origAttrs)
            const removedAttrs = difference(origAttrs, currentAttrs)
            console.log('newAttrs', newAttrs, 'removedAttrs', removedAttrs)
            removedAttrs.forEach(n => delete lset.attributes?.[n])
            if (lset.fields_order) {
              for (const [k, v] of Object.entries(lset.fields_order)) {
                const newList = v.filter(n => !removedAttrs.includes(n))
                lset.fields_order[k] = [...newList, ...newAttrs.filter(n => !newList.includes(n))]
              }
            }
            if (lset.excluded_fields) {
              // remove non existing attributes
              for (const [k, v] of Object.entries(lset.excluded_fields)) {
                lset.excluded_fields[k] = v.filter(n => !removedAttrs.includes(n))
              }
            }
            */
            // v2 - applies changes to match latest metadata
            // delete settings of not existing attributes
            if (lset.attributes) {
              Object.keys(lset.attributes).forEach(n => {
                if (!currentAttrs.includes(n)) {
                  delete lset.attributes[n]
                }
              })
            }
            if (lset.fields_order) {
              for (const [k, v] of Object.entries(lset.fields_order)) {
                // remove non existing attributes
                const fields = v.filter(n => currentAttrs.includes(n))
                // add missing attributes
                fields.push(...currentAttrs.filter(n => !fields.includes(n)))
                lset.fields_order[k] = fields
              }
            }
            if (lset.excluded_fields) {
              // remove non existing attributes
              for (const [k, v] of Object.entries(lset.excluded_fields)) {
                lset.excluded_fields[k] = v.filter(n => currentAttrs.includes(n))
              }
            }
          })
        }
        await this.$http.post(`/api/project/meta/${this.project.name}`, omit(this.projectInfo, ['dirty', 'filesize']))
        await this.$http.post(`/api/project/settings/${this.project.name}`, settings)
      }
      if (filesToUpload.length || filesToRemove.length) {
        try {
          await this.updateFiles(filesToUpload, filesToRemove)
        } catch (err) {
          console.error(err)
          this.$notify.error(err.message || 'Failed to update files')
          return
        }
        this.fetchServerFiles()
      }
      this.$notify.success('Project was updated')
      this.reloadProject()
      const [ user, name ] = this.project.name.split('/')
      this.$router.push({ name: 'project', params: { user, name: name } })
    },
    enableFilesSelection () {
      this.selectedFiles = this.updateOpts.qgisProject ? [this.projectInfo.file] : []
    },
    isFileDisabled (item) {
      return !(this.filesDiff.flags?.[item.path])
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/card.scss';
@import '@/info-grid.scss';

.card {
  border: 1px solid #ddd;
  margin: 0 1px 12px 1px;
}

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
.plugin-error {
  .title {
    color: var(--color-red);
    font-size: 18px;
  }
  .traceback {
    white-space: pre-line;
    font-family: monospace;
    font-size: 13px;
  }
}
.files-options {
  padding-left: 12px;
}
.statusbar {
  background-color: #f2f2f2;
}
.update-card {
  // background-color: #e5e5e5;
  // width: 500px;
  // align-self: center;
  // background-color: var(--color-primary);

  .content {
    width: 420px;
    align-self: center;
    background-color: #fff;
  }
}
::v-deep .layers-table {
  tr {
    --status-color: #2c3036;
    color: var(--status-color, currentColor);
    --icon-color: var(--color-status);
  }
  tr.new {
    // background-color: rgba(var(--color-green-rgb), 0.3);
    --status-color: var(--color-green);
  }
  tr.removed {
    // background-color: rgba(var(--color-red-rgb), 0.3);
    --status-color: var(--color-red);

  }
  tr.changed {
    // background-color: rgba(var(--color-orange-rgb), 0.3);
    --status-color: var(--color-orange);
  }
}
.vjs-tree, .json-viewer, .json-diff-viewer {
  width: clamp(50vw, 1260px, 90vw);
  min-height: 90vh;
  padding: 12px;
  overflow: auto;
}
.metadata-view {
  overflow: hidden;
}
.info-grid {
  border: 1px solid #e7e7e7;
  border-width: 1px 1px 0 1px;
  &:not(.nested) {
    margin: 4px;
  }
}
.dialog {
  .toolbar {
    height: 38px;
    flex-shrink: 0;
    background-color: var(--color-dark);
    border-bottom: 1px solid #ddd;
    --fill-color: #fff;
    .title {
      font-size: 17px;
      font-weight: 500;
    }
  }
}
</style>
