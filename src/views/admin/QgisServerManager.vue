<template>
  <div class="page dark f-col">
    <div class="f-row">
      <h1>QGIS Server Manager</h1>
      <div class="f-grow"/>
      <v-btn @click="getStatus">
        <v-icon name="reload" class="mr-2"/>
        <span>Update</span>
      </v-btn>
    </div>
    <div v-if="status" class="grid light">
      <div
        v-for="cluster in clusters"
        :key="cluster.id"
        class="cluster info-grid shadow-1 m-2"
        :class="{active: cluster.workers > 0}"
      >
        <span class="label">ID</span>
        <!-- <span class="value" v-text="cluster.id"/> -->
        <div class="value f-row-ac">
          <span class="f-grow" v-text="cluster.id"/>
          <div class="f-row">
            <v-tooltip content-class="dark">
              <json-viewer class="json-config light" :data="cluster.config"/>
            </v-tooltip>
            <v-icon class="ml-2" name="settings"/>
          </div>
        </div>
        <span class="label">Workers</span>
        <span class="value" v-text="cluster.workers"/>
        <span class="label">Available</span>
        <span class="value" v-text="cluster.available"/>
        <span class="label">Idle</span>
        <span class="value" v-text="cluster.idle"/>
        <span class="label">Waiting</span>
        <span class="value" v-text="cluster.waiting"/>

        <span class="label">Last Access</span>
        <span class="value" v-text="$format.datetime(cluster.last_access)"/>
        <span class="label">Last Update</span>
        <!-- <span class="value" v-text="formatElapsed(cluster.last_update)"/> -->
        <span class="value">{{ formatElapsed(cluster.last_update) }} (from {{ cluster.last_update.prev_size }} to {{ cluster.last_update.new_size }})</span>
        <span class="label">Access Log</span>
        <span class="value" v-text="cluster.access_log"/>
      </div>
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash/orderBy'
import { formatDistanceToNow } from 'date-fns'

import JsonViewer from '@/components/JsonDiffViewer.vue'

export default {
  components: { JsonViewer },
  data () {
    return {
      status: null
    }
  },
  computed: {
    clusters () {
      return orderBy(this.status?.clusters, 'id')
    }
  },
  created () {
    this.getStatus()
  },
  methods: {
    async getStatus () {
      const { data } = await this.$http.get('/api/qgis-man/status')
      this.status = data
    },
    formatElapsed (d) {
      return formatDistanceToNow(new Date(d.time))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/info-grid.scss';

.page {
  @media (min-width: 601px) {
    padding: 8px;
  }
  background-color: #5a5a5a;
}
.cluster {
  background-color: #fafafa;
  // border: 1px solid #ccc;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 500px));
}
.info-grid.cluster {
  border-radius: 4px;
  --label-bg: rgba(var(--color-orange-rgb), 0.3);
  &.active {
    --label-bg: rgba(var(--color-green-rgb), 0.3);
  }
}
</style>
