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
        <div v-if="wfsNotEnabled">
          <v-btn color="orange" @click="enableWFS">Enable WFS</v-btn>
        </div>
        <qgis-layers-info :meta="projectInfo"/>
      </div>
      <div v-if="errors" class="card">
        <div class="header errors f-row-ac dark px-4">
          <span class="title">Errors</span>
        </div>
        <div class="p-2">
          {{ errors }}
        </div>
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

      <div v-if="tasks.clientFiles.success" class="f-row-ac f-justify-center">
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
          @click="uploadProgress ? upload.abort() : createProject()"
        >
          <template v-if="uploadProgress">
            <v-icon name="x"/>
            <v-linear-progress
              color="orange"
              :value="uploadProgress.totalProgress"
            />
          </template>
          <span v-else>Upload</span>
        </v-btn>
      </div>
    </template>
    <div v-else-if="error" class="error f-row-ac">
      <v-icon name="circle-error" color="red"/>
      <span class="title mx-2">Error:</span>
      {{ error.msg }}
      <div v-if="error.details" v-text="error.details" class="traceback"/>
    </div>
  </div>
</template>

<script>
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
      error: null,
      projectInfo: null,
      opened: [],
      tasks: {
        clientFiles: TaskState()
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
    errors () {
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
        // return 'Layers names are not unique. Duplicates: ' + Array.from(new Set(duplicates)).join(', ')
        const duplicates = layers.filter((l, i) => i !== names.indexOf(l.name))
        return 'Layers names are not unique. Duplicates: ' + duplicates.map(l => l.title)
      }
      const invalidNames = names.filter(n => !LayerNameRegex.test(n))
      if (invalidNames.length) {
        const helpText = 'It is recommended assign short names without special characters in Layer Properties -> QGIS Server -> Short name'
        return `Invalid layer names: ${invalidNames.join(', ')}. ${helpText}`
      }
      // return {
      //   unique: new Set(names).size === names.length,
      //   characters: invalidNames.length > 0,
      //   length: names.every(n => n.length > 0 && n.length < 30),
      //   names
      // }
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
      const { projection } = this.projectInfo
      return !!(projection.code && projection.proj4) // or alow emty proj4 def for well known projections (EPSG:4326, ...)?
    },
    layersValid () {
      // TODO: check source.file is relative to project dir
      // return Object.values(this.sourceInfo).every(l => !l.error)
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
    enableWFS () {
      this.$ws.request('EnableLayersWFS')
    },
    fetchLocalFiles () {
      const task = this.$ws.request('ProjectFiles')
      watchTask(task, this.tasks.clientFiles)
    },
    checkAvailability () {
      console.log('TODO: check availability', this.name)
    },
    async createProject () {
      console.log(this.files)
      // const data = {
      //   // name: 
      //   qgis: this.projectInfo,
      // }
      // await this.$http.post('/api/project/create', project)
      const projectName = `${this.user.username}/${this.name}`
      await this.$http.post(`/api/project/${projectName}`, this.projectInfo)
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
.error {
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
.header.errors {
  background-color: var(--color-red);
}
.note {
  display: flex;
  font-size: 13px;
  opacity: 0.75;
  padding: 3px 8px;
  // align-self: center;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  background-color: #f4f4f4;
}
.vjs-tree, .json-viewer, .json-diff-viewer {
  width: clamp(50vw, 960px, 80vw);
  min-height: 90vh;
  padding: 12px;
}
</style>
