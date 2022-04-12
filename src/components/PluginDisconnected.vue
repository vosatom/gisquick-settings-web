<template>
  <div class="f-col-ac f-justify-center f-grow">
    <span class="title my-2">QGIS plugin is not connected!</span>
    <img src="@/assets/qgis_disconnected.svg">
    <small class="m-2">You can download required plugin here (64-bit OS):</small>
    <div class="f-row">
      <v-btn href="https://projects.gisquick.org/media/files/gisquick2_lin64.zip">
        <v-icon name="linux"/>
      </v-btn>
      <v-btn href="https://projects.gisquick.org/media/files/gisquick2_win64.zip">
        <v-icon name="windows"/>
      </v-btn>
      <v-btn href="https://projects.gisquick.org/media/files/gisquick2_darwin64.zip">
        <v-icon name="apple"/>
      </v-btn>
    </div>
    <!-- <small class="orange--text mt-3">
      <v-icon color="orange" class="mr-1 mb-1">warning</v-icon>
      <span>After changes in API, previous version will not work (2.0.0). Update to the latest version.</span>
    </small> -->
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
.title {
  color: var(--color-red);
  font-weight: 500;
  font-size: 18px;
}
small {
  color: #777;
  font-weight: 500;
  text-align: center;
}
img {
  width: 600px;
  max-width: 80%;
  margin: 48px 12px;
}
</style>