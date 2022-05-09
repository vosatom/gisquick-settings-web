<template>
  <div class="publish light f-col">
    <plugin-disconnected v-if="!connected"/>
    <template v-else-if="projectInfo">

      <v-dialog ref="jsonViewer">
        <template v-slot="{ data }">
          <json-viewer :data="data"/>
        </template>
      </v-dialog>

      <div class="card info f-col">
        <div class="header f-row-ac dark px-4">
          <span class="title">Basic Information</span>
          <div class="f-grow"/>
          <v-btn @click="$refs.jsonViewer.show(projectInfo)">Show JSON</v-btn>
        </div>
        <qgis-info :meta="projectInfo"/>
      </div>

      <div class="card layers f-col">
        <div class="header f-row-ac dark px-4">
          <span class="title">Layers</span>
        </div>
        <qgis-layers-info :meta="projectInfo"/>
        <div v-if="wfsNotEnabled" class="note">
          <v-icon name="unknown"/>
          <span class="m-2">Vector layers without WFS service enabled cannot be queryable.</span>
          <v-btn class="small" color="orange" @click="enableWFS">Enable WFS</v-btn>
        </div>
      </div>
      <div v-if="errors" class="card errors f-col">
        <div class="header errors f-row-ac dark px-4">
          <v-icon name="warning" class="mr-2"/>
          <span class="title">Errors</span>
        </div>

        <template v-if="errors.duplicateLayersNames">
          <span class="p-2"><strong>Layers does not have unique names.</strong> Layers with duplicit names (or short names):</span>
          <ul>
            <li v-for="n in errors.duplicateLayersNames" :key="n" v-text="n"/>
          </ul>
        </template>

        <template v-if="errors.invalidLayersNames">
          <strong class="p-2">Invalid layers names:</strong>
          <ul>
            <li v-for="n in errors.invalidLayersNames" :key="n" v-text="n"/>
          </ul>
          <p class="hint p-2">
            <span>It is recommended set a <strong>Short name</strong> property without spaces and special characters in</span>
            <span class="breadcrumb mx-1">
              <strong>Layer Properties</strong>
              <v-icon name="arrow-right" size="12"/>
              <strong>QGIS Server</strong>
              <!-- <v-icon name="arrow-right" size="12"/>
              <strong>Short name</strong> -->
            </span>
          </p>
        </template>

        <template v-if="errors.filesOutsideDirectory">
          <strong class="p-2">Data files outside of project's directory:</strong>
          <ul>
            <li v-for="n in errors.filesOutsideDirectory" :key="n" v-text="n"/>
          </ul>
        </template>
      </div>

      <div v-else class="card files f-col">
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
          :loading="tasks.clientFiles.pending"
          @click="fetchLocalFiles"
        >
          Load Files
        </v-btn>

        <template v-else>
          <files-tree :files="files" :progress="uploadProgress && uploadProgress.files"/>
          <!-- <div class="f-row-ac f-justify-center">
            <span>{{ user.username }}/</span>
            <v-text-field class="filled" placeholder="name" v-model="name"/>
            <v-btn color="primary" @click="createProject">Upload</v-btn>
          </div> -->
          <div class="note">
            <v-icon name="circle-i-outline" class="mr-2"/>
            <p>You can use .gisquickignore file to exclude some files from uploading them to the server</p>
          </div>
        </template>
      </div>
      <!-- <div v-if="error" class="error f-row-ac f-justify-center m-2">
        <v-icon name="warning" size="19" class="mr-2"/>
        <span v-text="error"/>
      </div> -->
      <div v-if="tasks.clientFiles.success" class="submit-form f-row-ac f-justify-center py-2">
        <!-- <span>{{ user.username }} /</span> -->
        <!-- <v-text-field class="filled" readonly disabled :value="user.username + '/'"/>
        <v-text-field class="filled" placeholder="name" v-model="name"/> -->
        <v-text-field
          class="filled inline"
          label="Project Name"
          placeholder="name"
          v-model="name"
          @change="checkAvailability"
        >
          <template v-slot:prepend>
            <span>{{ user.username }}/</span>
          </template>
        </v-text-field>
        <v-btn
          class="upload"
          color="primary"
          :disabled="!name || !projectValid"
          :loading="tasks.createProject.pending"
          @click="uploadProgress ? upload.abort() : createProject()"
        >
          <template v-if="uploadProgress">
            <v-icon name="x"/>
            <v-linear-progress
              color="orange"
              :value="uploadProgress.totalProgress"
            />
            <span>Uploading</span>
          </template>
          <span v-else-if="tasks.createProject.success">Upload</span>
          <span v-else>Create</span>
        </v-btn>
      </div>
    </template>
    <div v-else-if="pluginError" class="plugin-error f-col">
      <div class="title f-row-ac my-2">
        <v-icon name="warning" color="red"/>
        <span class="mx-2">Error:</span>
        <span v-text="pluginError.msg"/>
      </div>
      <div v-if="pluginError.details" v-text="pluginError.details" class="traceback"/>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'

import QgisInfo from '@/components/QgisInfo.vue'
import FilesTree from '@/components/FilesTree.vue'
import QgisLayersInfo from '@/components/QgisLayersInfo.vue'
import PluginDisconnected from '@/components/PluginDisconnected.vue'
import JsonViewer from '@/components/JsonDiffViewer.vue'
// import JsonViewer from '@/components/JsonViewer2.vue'
import { TaskState, watchTask } from '@/tasks'
import { createUpload } from '@/upload'

function layersTree (tree, layers) {
  return tree.map(i => {
    if (i.layers) {
      return {
        name: i.name,
        layers: layersTree(i.layers, layers)
      }
    } else {
      return layers[i.id]
    }
  })
}

const SourceIcons = {
  file: 'hdd',
  postgres: 'storage',
  url: 'globe',
}

const LayerNameRegex = new RegExp('^[a-zA-Z][a-zA-Z0-9_.-]*$')

export default {
  name: 'PublishView',
  components: { FilesTree, QgisInfo, QgisLayersInfo, PluginDisconnected, JsonViewer },
  data () {
    return {
      name: '',
      pluginError: null,
      projectInfo: null,
      opened: [],
      tasks: {
        clientFiles: TaskState(),
        createProject: TaskState()
      },
      uploadProgress: null
      // test data for styling
      // uploadProgress: { files: {'ku.gpkg': {progress: 33}} }
    }
  },
  computed: {
    user () {
      return this.$root.user
    },
    connected () {
      return this.$ws.pluginConnected
    },
    layersHeaders () {
      return [
        {
          text: 'Queryable',
          value: 'queryable'
        },
        {
          text: 'CRS',
          value: 'projection',
          align: 'left'
        },
        {
          text: 'Provider',
          value: 'provider_type',
          align: 'left'
        },
        {
          text: 'Source',
          value: 'source',
          align: 'left',
          tdClass: 'src'
        }
      ]
    },
    layers () {
      if (this.projectInfo) {
        const { layers_tree, layers } = this.projectInfo
        return layersTree(layers_tree, layers)
      }
      return []
    },
    filesOutsideDirectory () {
      const layers = Object.values(this.projectInfo.layers)
      const dataFiles = layers.reduce((files, l) => {
        const { file } = l.source_params
        if (file && file.startsWith('..')) {
          files.add(file)
        }
        return files
      }, new Set())
      return Array.from(dataFiles)
    },
    errors () {
      const errors = {}
      const layers = Object.values(this.projectInfo.layers)
      const names = layers.map(l => l.name)
      const nSet = new Set(names)
      if (nSet.size !== names.length) {
        // const duplicates = names.filter(n => {
        //   if (nSet.has(n)) {
        //     nSet.delete(n)
        //   } else {
        //     return true
        //   }
        // })
        const duplicates = layers.filter((l, i) => i !== names.indexOf(l.name))
        errors.duplicateLayersNames = duplicates.map(l => l.name)
      }
      const invalidNames = names.filter(n => !LayerNameRegex.test(n))
      if (invalidNames.length) {
        errors.invalidLayersNames = invalidNames
      }
      if (this.filesOutsideDirectory?.length) {
        errors.filesOutsideDirectory = this.filesOutsideDirectory
      }
      return isEmpty(errors) ? null : errors
    },
    sourceIcons () {
      return SourceIcons
    },
    files () {
      return this.tasks.clientFiles.data?.files
    },
    wfsNotEnabled () {
      const vectorLayers = Object.values(this.projectInfo.layers).filter(l => l.type === 'VectorLayer')
      return vectorLayers.length && vectorLayers.every(l => !l.options.wfs.length)
    },
    projectionValid () {
      const projCode = this.projectInfo.projection
      // or allow emty proj4 def for well known projections (EPSG:4326, ...)?
      return Boolean(projCode && this.projectInfo.projections[projCode]?.proj4)
    },
    layersValid () {
      return true
    },
    projectValid () {
      return this.projectionValid && this.layersValid
    }
  },
  created () {
    const unbind = this.$ws.bind('ProjectChanged', this.onProjectChange)
    this.$once('hook:deactivated', unbind)
    // this.fetchProjectInfo()
  },
  watch: {
    connected: {
      immediate: true,
      handler (connected) {
        if (connected) {
          this.onProjectChange()
        }
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
    enableWFS () {
      this.$ws.request('EnableLayersWFS')
    },
    async fetchLocalFiles () {
      const task = this.$ws.request('ProjectFiles')
      await watchTask(task, this.tasks.clientFiles)
      this.$nextTick(() => {
        this.$el.querySelector('.submit-form')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    },
    checkAvailability () {
      console.log('TODO: check availability', this.name)
    },
    async createProject () {
      const projectName = `${this.user.username}/${this.name}`
      if (!this.tasks.createProject.success) {
        const create = this.$http.post(`/api/project/${projectName}`, this.projectInfo)
        await watchTask(create, this.tasks.createProject)
        if (!this.tasks.createProject.success) {
          this.$notify.error(this.tasks.createProject.error)
          return
        }
      }
      // TODO: or create global upload manager, page independent?
      this.upload = createUpload(this.$ws, this.files, projectName)
      this.uploadProgress = this.upload.info
      try {
        await this.upload.start()
        // this.saveConfig()

        // TODO: or maybe project info should be taken from server response
        const project = {
          name: projectName,
          meta: this.projectInfo,
          settings: null,
          thumbnail: false
        }
        this.$router.push({ name: 'project', params: { user: this.user.username, name: this.name, project } })
      } catch (e) {
        if (e !== 'aborted') {
          this.$notify.error(e.message ?? 'Error')
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
@import '@/card.scss';

.publish {
  // width: clamp(600px, 100%, 1200px);
  grid-column: 2 / 3;
}
.layers-table {
  flex: 0 0 auto;
  // overflow: auto;
  ::v-deep td.src {
    white-space: normal;
  }
}
.files {
  border: 1px solid #eee;
  .load {
    align-self: center;
    justify-self: center;
    min-width: 150px;
  }
}
.upload.btn {
  min-width: 120px;
}
.linear-progress {
  min-width: 80px;
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
.errors {
  .header {
    background-color: var(--color-red);
  }
  .hint {
    font-size: 13px;
    color: #707070;
  }
}
// .error {
//   color: var(--color-red);
//   --icon-color: currentColor;
// }
.note {
  display: flex;
  font-size: 13px;
  // opacity: 0.75;
  padding: 3px 8px;
  // align-self: center;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  background-color: #f4f4f4;
  color: #777;
  --icon-color: #777;
}
.breadcrumb {
  display: inline-flex;
  align-items: center;
  > * {
    margin: 0 3px;
  }
}
.vjs-tree, .json-viewer, .json-diff-viewer {
  width: clamp(50vw, 960px, 80vw);
  min-height: 90vh;
  padding: 12px;
}
</style>
