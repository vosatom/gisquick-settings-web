<template>
  <div class="page-content light f-col-ac">
    <span class="title m-4">Gisquick QGIS plugin</span>
    <p class="info">
      <!-- <v-badge color="#999" class="dark m-1">
        <v-icon name="circle-i-outline" size="16"/>
        <span>Note</span>
      </v-badge> -->
      <!-- <v-icon name="circle-i-outline" size="16"/> -->
      <!-- <span class="note">
        <v-icon name="warning" size="16"/>
        <span>Important</span>
      </span> -->
      <span class="important">
        Gisquick plugin contains binary code compiled for particular platform,
        therefore you need to use repository for your platform.
      </span>
      <br/>
      <br/>
      <span class="note dark">
        <v-icon name="circle-i-outline" size="16"/>
        <span>Tip</span>
      </span>
      <span>
        If you plan to use data in Geopackage format, it is recommended to install
        version of plugin with SQLite's <a href="https://www.sqlite.org/dbhash.html">dbhash</a>
        program for better detection of changes for later updates.
      </span>
    </p>
    <div class="repositories m-2">
      <div
        v-for="({ url, icon }, name) in repositories"
        :key="name"
        class="repo"
        :class="{ active: name === detectedPlatform }"
      >
        <v-icon :name="icon" size="28"/>
        <span v-text="name"/>
        <span class="repo-link f-grow" v-text="url"/>
        <v-btn class="icon" @click="copyToClipboard(url)">
          <v-icon name="copy"/>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    repositories () {
      return {
        Linux: { icon: 'linux', url: 'https://plugins.gisquick.org/platform/lin64' },
        Windows: { icon: 'windows', url: 'https://plugins.gisquick.org/platform/win64' },
        MacOS:  { icon: 'apple', url: 'https://plugins.gisquick.org/platform/mac64' },
      }
    },
    detectedPlatform () {
      const { userAgent } = navigator
      if (userAgent.indexOf('Win') != -1) {
        return 'Windows'
      } else if (userAgent.indexOf('Linux')) {
        return 'Linux'
      } else if (userAgent.indexOf('Mac')) {
        return 'MacOS'
      }
      return null
    }
  },
  methods: {
    copyToClipboard (text) {
      navigator.clipboard.writeText(text)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-content {
  grid-column: 2 / 3;
  font-size: 16px;

  @media (max-width: 960px) {
    grid-column: 1 / 4;
  }
}
.title {
  font-weight: 500;
  font-size: 24px;
}
a {
  color: var(--color-primary);
}
.repo-link {
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 6px;
}
.info {
  max-width: 550px;
  margin: 24px 12px;
  .icon {
    vertical-align: middle;
  }
  .badge {
    display: inline-flex;
    vertical-align: middle;
  }
  .important {
    font-weight: 500;
  }
}
.note {
  display: inline-flex;
  // vertical-align: middle;
  align-items: center;
  background-color: var(--color-green);
  padding: 5px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  height: 20px;
  .icon {
    margin-right: 2px;
  }
}
.repositories {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 20px 10px;
  .repo {
    display: contents;
    &.active {
      color: var(--color-primary);
    }
  }
}
</style>
