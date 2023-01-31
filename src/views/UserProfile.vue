<template>
  <div style="display: contents;">
    <projects-view
      class="page-content"
      :user="user"
      @projectsFetched="onProjectsFetched"
    />
    <div v-if="showAccountLimits" class="storage-card light f-col p-2 xm-2">
      <!-- <span class="xtext-right mx-2">Storage usage</span> -->

      <template v-if="account.projects_limit !== -1">
        <div class="f-row-ac mx-2 mt-2">
          <span class="label">Projects</span>
          <span class="f-grow"/>
          <span class="">
            {{ projectsCount }} / {{ account.projects_limit }}
          </span>
        </div>
        <v-linear-progress :value="projectsUsage"/>
      </template>

      <template v-if="account.storage_limit !== -1">
        <div class="f-row-ac mx-2 mt-2">
          <span class="label">Storage usage</span>
          <span class="f-grow"/>
          <span class="">
            {{ $format.filesize(projectsSize) }} / {{ $format.filesize(account.storage_limit) }}
          </span>
        </div>
        <v-linear-progress :color="storageColor" :value="storageUsage"/>
      </template>

      <!-- <div class="f-col-ac mt-4">
        <span class="mt-2">Not enough storage space or performance?</span>
        <v-btn class="round outlined n-case" color="primary">See Hosting Plans</v-btn>
      </div> -->
    </div>
  </div>
</template>

<script>
import ProjectsView from './ProjectsView.vue'

export default {
  name: 'UserProfile',
  components: { ProjectsView },
  props: {
    user: String
  },
  data () {
    return {
      account: null,
      projectsSize: null,
      projectsCount : null
    }
  },
  computed: {
    // account () {
    //   return this.$root.account
    // },
    showAccountLimits () {
      return this.projectsSize !== null && this.account && (this.account.storage_limit !== -1 || this.account.projects_limit !== -1)
    },
    storageUsage () {
      return 100 * (this.projectsSize / this.account.storage_limit)
    },
    storageColor () {
      if (this.storageUsage > 90) { 
        return 'red'
      } else if (this.storageUsage > 75) {
        return 'orange'
      }
      return 'primary'
    },
    projectsUsage () {
      return 100 * (this.projectsCount / this.account.projects_limit)
    }
  },
  created () {
    this.fetchAccountInfo()
  },
  methods: {
    onProjectsFetched (projects) {
      this.projectsSize = projects.reduce((sum, p) => sum + p.size, 0)
      this.projectsCount = projects.length
    },
    async fetchAccountInfo () {
      const { data } = await this.$http.get('/api/account')
      this.account = data.limits
    }
  }
}
</script>

<style lang="scss" scoped>
.storage-card {
  margin-block: 6px;
  margin-inline: 12px;
  align-self: end;

  border: 1px solid #ddd;
  // background-color: #fafafa;
  background-color: #f5f5f5;
  // background: linear-gradient(to bottom, #f5f5f5, #ddd);
  background: linear-gradient(155deg, #e2e2e2, #fafafa);
  // background: linear-gradient(130deg, red, green);
  border-radius: 4px;
  grid-column: 3 / 4;
  .label {
    text-transform: uppercase;
    font-weight: 500;
    font-size: 13.5px;
    opacity: 0.75;
  }
  .btn.n-case {
    height: 30px;
    font-size: 14px;
  }
}
</style>