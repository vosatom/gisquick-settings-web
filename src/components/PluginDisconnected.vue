<template>
  <div class="f-col-ac f-justify-center">
    <span class="title m-2">QGIS plugin is not connected</span>
    <disconnected-img class="image"/>
    <span class="link m-2">Do not have Gisquick QGIS plugin installed?</span>
    <v-btn
      color="green"
      class="round"
      to="/plugin"
    >
      Get Plugin
    </v-btn>
  </div>
</template>

<script>
import DisconnectedImg from '@/assets/qgis_disconnected.svg?inline'

export default {
  components: { DisconnectedImg }
}
</script>

<style lang="scss" scoped>
.title {
  color: var(--color-red);
  font-weight: 500;
  font-size: 22px;
}
.image {
  width: 600px;
  max-width: 80%;
  margin: 48px 12px;
}
</style>