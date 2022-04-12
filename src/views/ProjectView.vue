<template>
  <div style="display: contents;">
    <v-dialog :value="!!jsonDialog" @closed="jsonDialog = null">
      <div v-if="jsonDialogData" class="json-dialog f-col">
        <div class="toolbar dark f-row-ac px-2">
          <span class="title" v-text="jsonDialogData.title"/>
          <div class="f-grow"/>
          <v-checkbox label="Content filter" v-model="jsonRouteFilter"/>
          <v-btn class="icon" @click="jsonDialog = null">
            <v-icon name="x"/>
          </v-btn>
        </div>
        <json-viewer2 :data="jsonDialogData.json"/>
        <!-- <json-pretty v-if="project" :data="project.meta"/> -->
      </div>
    </v-dialog>
    <!-- <v-dialog ref="metaDialog">
      <template v-slot="{ close, data }">
        <div class="json-dialog f-col">
          <div class="toolbar f-row-ac">
            <v-checkbox label="Page filter" v-model="jsonRouteFilter"/>
            <div class="f-grow"/>
            <v-btn class="icon" @click="close"><v-icon name="x"/></v-btn>
          </div>
          <json-viewer2 v-if="data" :data="data.json"/>
        </div>
      </template>
    </v-dialog> -->
    <div class="panel dark p-2">
      Panel
    </div>
    <div v-if="project && settings" class="project-page f-col light">
      <portal to="menu">
      <nav class="menubar2 dark f-grow f-row-ac">
      <!-- <nav class="menubar f-row-ac mb-2 px-2"> -->
        <router-link class="general m-2" :to="{name: 'project'}">General</router-link>
        <router-link class="m-2" :to="{name: 'files'}">Files</router-link>
        <router-link class="m-2" :to="{name: 'map'}">Map</router-link>
        <router-link class="m-2" :to="{name: 'layers'}">Layers</router-link>
        <router-link class="m-2" :to="{name: 'topics'}">Topics</router-link>
        <router-link class="m-2" :to="{name: 'access'}">Permissions</router-link>
        <!-- <div class="v-separator"/> -->
        <div class="f-grow"/>
        <v-btn class="small" :to="{name: 'update'}">
          <v-icon name="qgis" class="mr-2"/>
          <span>Update</span>
        </v-btn>
        <v-btn
          class="small"
          :disabled="!settingsChanged || projectErrors.length > 0"
          @click="saveSettings"
        >
          <v-icon name="save" class="mr-2"/>
          <!-- <span v-if="refSettings">Save</span> -->
          <span v-if="project.settings">Save</span>
          <span v-else>Publish</span>
        </v-btn>
        <v-icon v-if="projectErrors.length" name="circle-error" color="red"/>
        <v-menu
          aria-label="Project actions"
          transition="slide-y"
          align="rr;bb,tt"
          content-class="popup-menu"
          :items="projectMenu"
        >
          <template v-slot:activator="{ toggle }">
            <v-btn aria-label="Menu" class="icon" @click="toggle">
              <v-icon name="menu-dots"/>
            </v-btn>
          </template>
        </v-menu>
      </nav>
      </portal>

      <div v-if="$route.name === 'project'" class="f-col page-content">

        <!-- Header -->
        <div class="header dark">
          <div class="thumbnail light f-col-ac">
            <img v-if="project.thumbnail" :src="`/api/project/thumbnail/${project.name}`"/>
            <!-- <img v-else src="@/assets/map.svg"/> -->
            <template v-else>
              <map-img width="150"/>
              <small class="uppercase">No Thumbnail</small>
            </template>
            <!-- <map-img v-else width="100%"/> -->
          </div>
          <div class="text f-col px-2">
            <!-- <v-icon v-if="!settings.title" name="warning" color="orange" class="mr-2"/> -->
            <v-text-field
              color="yellow"
              class="title m-0"
              placeholder="- No Title -"
              v-model="settings.title"
              lazy
            >
              <template v-if="!settings.title" v-slot:prepend>
                <v-icon name="warning" color="orange" class="mr-2"/>
              </template>
              <template v-slot:append>
                <v-icon class="edit ml-2" name="pencil"/>
              </template>
            </v-text-field>
            <span v-text="project.name" class="name"/>
          </div>
          <div class="details f-row f-align-end">
            <v-badge color="dark" glow>{{ project.meta.projection.code }}</v-badge>
            <div class="f-row-ac m-2">
              <v-icon name="storage" size="16" class="m-1"/>
              <span v-text="$format.filesize(project.size)"/>
            </div>
          </div>
          <v-badge class="auth uppercase" :color="statusColorMap[project.state]">
            <span v-text="project.state"/>
            <v-icon v-if="project.authentication" :name="authIcons[project.authentication]" xsize="16"/>
          </v-badge>
          <div class="time-info f-col">
            <div><strong>Created:</strong> <span :title="createdAt.datetime" v-text="createdAt.date"/></div>
            <div><strong>Updated:</strong> <span :title="updatedAt.datetime" v-text="updatedAt.date"/></div>
          </div>
        </div>

        <div v-if="false" class="card f-row f-space-between">
          <qgis-info v-if="project" class="xcard" :meta="project.meta"/>
          <div class="xcard f-col f-align-end xf-grow p-2">
            <!-- <div><strong>Created:</strong> {{ createdAt.datetime }}</div>
            <div><strong>Updated:</strong> {{ updatedAt.datetime }}</div> -->
            <div class="date m-2">
              <strong>Created:</strong>
              <v-icon name="calendar"/>
              <span v-text="createdAt.date"/>
              <v-icon name="clock"/>
              <span v-text="createdAt.time"/>
            </div>
            <div class="date m-2">
              <strong>Udated:</strong>
              <v-icon name="calendar"/>
              <span v-text="updatedAt.date"/>
              <v-icon name="clock"/>
              <span v-text="updatedAt.time"/>
            </div>
            <div class="f-row-ac">
              <strong>Status:</strong>
              <v-badge
                :color="statusColorMap[project.state]"
                class="uppercase">{{ project.state }}
              </v-badge>
            </div>
          </div>
        </div>

        <!-- <json-viewer :data="json"/> -->
        <!-- <json-viewer2 :data="json"/> -->

        <!-- <json-viewer :data="project.meta"/> -->
        <!-- <json-viewer2 :data="project.meta"/> -->
        <qgis-layers-info :meta="project.meta"/>
      </div>

      <keep-alive>
        <router-view
          v-if="project"
          :project="project"
          :settings="settings"
        />
      </keep-alive>
    </div>
    <div v-else-if="fetchTask.pending">
      <v-spinner/>
    </div>
    <div v-else-if="fetchTask.error" class="f-col-ac">
      <p>
        Error: {{ fetchTask.error.message }} / {{ fetchTask.error.status }}
      </p>
      <v-btn @click="deleteProject">
        <v-icon name="delete_forever"/>
        <span class="ml-2">Delete Project</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
// import JsonPretty from 'vue-json-pretty'
// import 'vue-json-pretty/lib/styles.css'
import mapValues from 'lodash/mapValues'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

import QgisInfo from '@/components/QgisInfo.vue'
import QgisLayersInfo from '@/components/QgisLayersInfo.vue'
import JsonViewer from '@/components/JsonViewer.vue'
// import JsonViewer2 from '@/components/JsonViewer2.vue'
import JsonViewer2 from '@/components/JsonDiffViewer.vue'
import { scalesToResolutions, ProjectionsScales } from '@/utils/scales'
import { TaskState, watchTask } from '@/tasks'
import MapImg from '@/assets/map.svg?inline'

const TestJson = {
  text: 'string value',
  bool: true,
  bool_false: false,
  null: null,
  inline: [1, 2, "3", false],
  nested_array: [
    [1, 2],
    [2, 3],
    {},
    {a: 0},
    "text"
  ],
  nested_object: {
    empty: {},
    full: {
      name: 'qwerty'
    }
  },
  empty_array: []
}

export default {
  name: 'ProjectView',
  components: { QgisInfo, QgisLayersInfo, MapImg, JsonViewer, JsonViewer2 },
  // components: { QgisInfo, QgisLayersInfo, MapImg, JsonPretty, JsonViewer, JsonViewer2 },
  props: {
    user: String,
    name: String,
    publishedProject: Object // when redirected from Publish View
  },
  data () {
    return {
      fetchTask: TaskState(),
      filesTask: this.createFilesTask(),
      settings: null,
      jsonRouteFilter: false,
      jsonDialog: null,
      editTitle: false
    }
  },
  computed: {
    json () {
      return TestJson
    },
    createdAt () {
      return this.formatDate(this.project?.created)
    },
    updatedAt () {
      return this.formatDate(this.project?.last_update)
    },
    projectName () {
      return `${this.user}/${this.name}`
    },
    project () {
      // return this.publishedProject || this.fetchTask.data
      const data = this.publishedProject || this.fetchTask.data

      return {
        ...data,
        files: this.filesTask,
        fetch: this.fetchProjectInfo
      }
    },
    statusColorMap () {
      return {
        empty: 'grey',
        staged: 'orange',
        published: 'green'
      }
    },
    authIcons () {
      return {
        private: 'lock',
        public: 'globe',
        users: 'users'
      }
    },
    // project () {
    //   if (this.qgisMeta) {
    //     return {
    //       // user: this.user,
    //       name: this.projectName,
    //       qgisMeta: this.qgisMeta,
    //       settings: this.settings
    //     }
    //   }
    //   return null
    // },
    settingsChanged () {
      return this.project && !isEqual(this.project.settings, this.settings)
    },
    projectMenu () {
      return [
        // { text: 'Download Project', action: this.downloadProject },
        { text: 'Reset Settings', action: this.resetSettings },
        { text: 'Delete Project', action: this.deleteProject },
        { text: 'Debug', separator: true },
        { text: 'QGIS Meta', action: () => this.jsonDialog = 'meta' },
        { text: 'Show settings', action: () => this.jsonDialog = 'settings' },
        // { text: 'QGIS Meta', action: () => this.$refs.metaDialog.show(this.project.meta) },
        // { text: 'Show settings', action: () => this.$refs.metaDialog.show(this.settings) },
        // { text: 'QGIS Meta', action: () => this.jsonDialog = { title: 'QGIS meta', json: this.project.meta } },
        // { text: 'Show settings', action: () => this.jsonDialog = { title: 'QGIS meta', json: this.settings } } },
      ]
    },
    projectErrors () {
      const errors = []
      if (!this.settings.scales?.length > 0) {
        errors.push('Invalid map scales')
      }
      return errors // errors.length ? errors : null
    },
    jsonDialogData () {
      let data
      if (this.jsonDialog === 'meta') {
        data = { title: 'QGIS Meta', json: this.project.meta }
      } else if (this.jsonDialog === 'settings') {
        data =  { title: 'Gisquick Settings', json: this.settings }
      }
      if (data && this.jsonRouteFilter) {
        const { name, params } = this.$route
        if (name === 'layers') {
          data.json = data.json.layers
        } else if (name === 'attributes') {
          data.json = data.json.layers[params.layerId]
        }
      }
      return data
    }
    // layersProjectCapabilities () {
    //   console.log('# layersProjectCapabilities')
    //   return this.settings && mapValues(this.project.meta.layers, l => this.settings.layers[l.id].flags)
    // },
  },
  // watch: {
  //   projectName: {
  //     immediate: true,
  //     handler: 'fetchProjectInfo'
  //   }
  // },
  created () {
    if (this.publishedProject) {
      this.settings = this.newSettings(this.publishedProject.meta)
    } else {
      this.fetchProjectInfo()
    }
  },
  methods: {
    createFilesTask () {
      const state = TaskState()
      state.fetch = () => {
        const task = this.$http.get(`/api/project/files/${this.project.name}`)
        watchTask(task, state)
      }
      state.invalidate = () => {
        state.success = false
        state.data = null
      }
      return state
    },
    newSettings (meta) {
      const layers = mapValues(meta.layers, (l) => ({
        // publish: true,
        // hidden: false,
        // flags: [l.queryable ? 'query' : null].filter(f => !!f),
        flags: [...l.flags],
        // how about attr_table_fields/info_panel_fields?
        // attributes: {}
      }))
      const settings = {
        auth: {
          type: 'private',
          roles: null,
          users: null
        },
        base_layers: [],
        extent: meta.extent,
        layers,
        title: meta.title,
        topics: [],
        use_mapcache: false
      }
      if (meta.scales.length) {
        Object.assign(settings, {
          scales: meta.scales,
          tile_resolutions: scalesToResolutions(meta.scales, meta.units)
        })
      } else {
        const projInfo = ProjectionsScales[meta.projection.code]
        if (projInfo) {
          Object.assign(settings, projInfo)
        }
      }
      return settings
    },
    async fetchProjectInfo () {
      const task = this.$http.get(`/api/project/full-info/${this.projectName}`)
      // watchTask(task, this.fetchTask).then(({ data }) => {
      //     this.fetchedProject = data
      //     const { meta, settings } = data
      //     this.settings = settings ? cloneDeep(settings) : this.newSettings(meta)
      //   })

      const { data } = await watchTask(task, this.fetchTask)
      if (this.fetchTask.success) {
        const { meta, settings } = data
        this.settings = settings ? cloneDeep(settings) : this.newSettings(meta)
      }
    },
    async saveSettings () {
      try {
        await this.$http.post(`/api/project/settings/${this.projectName}`, this.settings)
      } catch (err) {
        console.error(err)
        this.$notify.error('Failed to save')
        return
      }
      this.$notify.success('Project settings was updated')
      this.fetchProjectInfo()
      this.refSettings = cloneDeep(this.settings) // or use fetched project's settings ?
    },
    resetSettings () {
      // this.settings = this.newSettings(this.qgisMeta)
      this.settings = this.newSettings(this.project.meta)
    },
    async deleteProject () {
      try {
        await this.$http.delete(`/api/project/${this.projectName}`)
        this.$router.push('/')
      } catch (err) {
        // TODO
      }
    },
    formatDate (d) {
      return {
        date: this.$format.date(d),
        datetime: this.$format.datetime(d),
        time: this.$format.time(d)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.project-page {
  // width: clamp(600px, 100%, 1200px);
  // align-self: center;

  // min-height: 0;
  // flex: 1 1 0;
  overflow: hidden;
  // display: grid;
  // grid-template-columns: auto 1fr;
  @media (max-width: 1200px) {
    grid-column: 2 / 4;
  }
}
.panel {
  // background-color: var(--color-dark);
  background-color: #3d3d3d;
}
.menubar {
  background-color: #eee;
  border: 1px solid #ddd;

  a {
    // font-weight: 500;
    color: inherit;
    text-decoration: none;
    &.router-link-exact-active, &.router-link-active:not(.general) {
      color: var(--color-primary);
      --icon-color: currentColor;
      font-weight: 500;
    }
  }
}

.menubar2 {
  a {
    // font-weight: 500;
    color: inherit;
    text-decoration: none;
    &.router-link-exact-active, &.router-link-active:not(.general) {
      color: var(--color-yellow);
      --icon-color: currentColor;
      font-weight: 500;
    }
  }
}

.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr auto;
  gap: 8px;
  padding: 8px 12px;
  // background-color: var(--color-primary);
  // background-color: var(--color-dark);
  background: linear-gradient(to right, #444, hsl(0, 4%, 35%));
  .thumbnail {
    // max-height: 120px;
    // max-width: 100%;
    // width: auto;
    // height: auto;
    grid-row: 1 / 3;
    // justify-self: center;
    // align-self: center;
    position: relative;
    background-color: #fff;
    svg, img {
      // width: auto;
      // height: auto;
      max-width: 180px;
      max-height: 120px;
    }
    small {
      font-weight: bold;
      font-size: 11px;
      color: #999;
    }
  }
  .text {
    .title {
      align-self: start;
      font-size: 20px;
      .edit {
        transition: opacity .25s cubic-bezier(.25,.8,.25,1);
        transition-delay: 0.25s;
      }
      &:not(:hover) {
        .edit {
          opacity: 0;
        }
      }
    }
  }
  .details {
    font-size: 13px;
    font-weight: 500;
    // opacity: 0.8;
    grid-column: 2 / 3;
  }
  .time-info {
    text-align: right;
    font-size: 13.5px;
  }
  .auth {
    grid-area: 1 / 3 / 2 / 4;
    align-self: start;
    justify-self: end;
  }
}

.card {
  background-color: #f2f2f2;
  border: 1px solid #ddd;
}
.date {
  display: grid;
  grid-template-columns: 1fr auto auto;
  // grid-template-columns: 1fr auto auto auto auto;
  row-gap: 2px;
  column-gap: 6px;
  text-align: right;
  .icon {
    grid-column: 2 / 3;
  }
}
.vjs-tree, .json-viewer, .json-diff-viewer {
  width: clamp(50vw, 960px, 80vw);
  min-height: 90vh;
  padding: 12px;
  overflow: auto;
}
.json-dialog {
  overflow: hidden;
  .toolbar {
    height: 38px;
    flex-shrink: 0;
    background-color: #444;
    background-color: var(--color-orange);
    border-bottom: 1px solid #ddd;
    --fill-color: #fff;
    .title {
      font-size: 17px;
      font-weight: 500;
    }
  }
}
</style>
