<template>
  <div v-if="formattedProjects.length" class="projects light">
    <div class="toolbar f-row-ac">
      <span class="title mx-2">Projects</span>
      <v-text-field class="filled" placeholder="Search" v-model="filter">
        <template v-slot:append>
          <v-icon name="search" class="mx-2"/>
        </template>
      </v-text-field>
      <div class="f-grow"/>
      <v-select
        align="rr;bb,tt"
        class="sort filled"
        placeholder="Sort by"
        :items="sortingItems"
        v-model="sortBy"
      >
        <!-- <template v-slot:item="{ item }">
        </template> -->
      </v-select>

      <!-- <v-btn class="icon flat" :disabled="!sortBy" @click="toggleSortDir">
        <v-icon size="24" :name="sortDir === 'asc' ? 'sort-down' : 'sort-up'"/>
      </v-btn> -->

      <v-btn class="icon flat" :disabled="!sortBy" @click="toggleSortDir">
        <v-icon :name="sortDir === 'asc' ? 'sort-down2' : 'sort-up2'"/>
      </v-btn>

      <v-btn color="primary" to="/publish">
        New Project
      </v-btn>
    </div>
    <div class="list mx-auto">
      <div
        v-for="p in sortedProjects"
        :key="p.name"
        class="card"
      >
        <a class="map-link" :href="`/?PROJECT=${p.name}`">
          <img v-if="p.thumbnail" :src="`/api/project/thumbnail/${p.name}`"/>
          <map-img v-else/>
        </a>
        <router-link :to="{ path: '/' + p.name }" class="project-link f-col px-2">
          <span v-text="p.title" class="title"/>
          <span v-text="p.name" class="name"/>
        </router-link>
        <div class="details f-row-ac">
          <v-badge color="#626262" glow>{{ p.projection }}</v-badge>
          <div class="f-row-ac m-2">
            <v-icon name="storage" color="#626262" size="16" class="m-1"/>
            <span v-text="p.size"/>
          </div>
        </div>
        <div class="time-info f-col">
          <div>Created: <span :title="p.created.datetime" v-text="p.created.date"/></div>
          <div>Updated: <span :title="p.updated.datetime" v-text="p.updated.date"/></div>
        </div>
        <v-badge class="auth dark" :color="statusColorMap[p.state]">
          <span class="uppercase" v-text="p.state"/>
          <v-icon v-if="p.authentication" :name="authIcons[p.authentication]" size="18"/>
        </v-badge>
      </div>
    </div>
  </div>
  <div v-else-if="!fetchTask.pending" class="projects empty light f-col-ac">
    <template v-if="isUserProfile">
      <h1 class="my-4">Welcome to the</h1>
      <img class="logo mb-4" src="@/assets/text_logo.svg"/>
      <div class="spacer f-grow"/>
      <h2 class="my-4">So far, you haven't published any projects</h2>
      <span class="hint">
        If you don't know how publishing in Gisquick works,
        you can see the whole process in the <a target="_blank" href="https://gisquick.org/#get-started">Get Started</a> video
      </span>
      <v-btn color="primary" to="/publish">
        New Project
      </v-btn>
    </template>
    <div v-else class="msg-no-projects">User doesn't have any projects</div>
  </div>
</template>

<script>
import orderBy from 'lodash/orderBy'
import MapImg from '@/assets/map.svg?component'
import { TaskState, watchTask } from '@/tasks'
import { sanitize, escapeRegExp, removeDiacritics } from '@/ui/utils/text'

export default {
  name: 'ProjectsPage',
  components: { MapImg },
  props: {
    user: String
  },
  data () {
    return {
      sortBy: '',
      sortDir: 'desc',
      fetchTask: TaskState(),
      filter: ''
    }
  },
  computed: {
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
    projects () {
      return this.fetchTask.data || []
    },
    sortingItems () {
      return [{
        text: 'Creation Date',
        value: 'created.raw'
      }, {
        text: 'Last Updated',
        value: 'updated.raw'
      }, {
        text: 'Title',
        value: 'title'
      }]
    },
    formattedProjects () {
      return this.projects.map(({ size, created, last_update, ...data }) => ({
        ...data,
        created: this.formatDate(created),
        updated: this.formatDate(last_update),
        size: this.$format.filesize(size)
      }))
    },
    sortedProjects () {
      let projects = this.formattedProjects
      if (this.filter) {
        const regex = new RegExp(escapeRegExp(sanitize(removeDiacritics(this.filter))), 'i')
        projects = projects.filter(p => regex.test(removeDiacritics(p.title)) || regex.test(removeDiacritics(p.name)))
      }
      if (this.sortBy) {
        return orderBy(projects, this.sortBy || 'title', this.sortDir)
      }
      return orderBy(projects, 'title', 'asc')
    },
    isUserProfile () {
      // this.user is url path param (username)
      return !this.user || this.$root.user.username === this.user
    }
  },
  watch: {
    user: 'fetchProjects'
  },
  mounted () {
    this.fetchProjects()
  },
  methods: {
    formatDate (d) {
      return {
        raw: d,
        date: this.$format.date(d),
        datetime: this.$format.datetime(d)
      }
    },
    fetchProjects () {
      const url = this.user ? `/api/projects/${this.user}/` : '/api/projects/'
      const t = this.$http.get(url)
      watchTask(t, this.fetchTask)
    },
    toggleSortDir () {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
    }
  }
}
</script>

<style lang="scss" scoped>
.projects {
  width: clamp(600px, 100%, 1200px);
  // align-self: center;
  grid-column: 2 / 3;
  &.empty {
    padding: 24px 12px;
    text-align: center;
    .logo {
      max-width: 320px;
      height: auto;
    }
    .spacer {
      max-height: 160px;
    }
    .hint {
      font-size: 16px;
      max-width: 500px;
      margin: 20px 10px;
      a {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
      }
    }
  }
  h1 {
    font-size: 40px;
    font-weight: 500;
  }
  h2 {
    font-size: 28px;
    font-weight: 500;
  }
}
.card {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 8px;
  padding: 4px 8px;
  .map-link {
    grid-row: 1 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      max-height: 120px;
      max-width: 100%;
      width: auto;
      height: auto;
    }
    svg {
      height: 120px;
    }
  }
  .project-link {
    justify-self: start;
    text-decoration: none;
    color: var(--color-primary);
    .title {
      font-size: 20px;
    }
    .name {
      font-weight: 500;
    }
  }
  .details {
    font-size: 13px;
    font-weight: 500;
    color: #555;
    grid-column: 2 / 3;
  }
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
.toolbar {
  // background-color: rgb(255, 255, 255);
  .title {
    font-size: 26px;
    font-weight: 500;
    opacity: 0.85;
  }
  .select.sort {
    min-width: 130px;
  }
}
.msg-no-projects {
  font-size: 20px;
  font-weight: 500;
}

</style>
