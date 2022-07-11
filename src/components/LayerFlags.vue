<template>
  <v-select
    multiple
    class="flags"
    align="rr;bb,tt"
    :items="options"
    :value="layerSettings.flags"
    @input="updateFlags"
  >
    <template v-slot:item="{ item }">
      <div class="px-2 f-row-ac f-grow">
        <span class="f-grow" v-text="item.text"/>
        <v-icon :name="item.icon"/>
      </div>
    </template>
    <template v-slot:selection="">
      <div class="selection f-row-ac f-justify-end f-grow">
        <template v-if="!flagsSet.has('excluded')">
          <!-- <v-icon v-if="flagsSet.has('hidden')" name="visibility_off"/> -->
          <!-- <template v-else> -->
            <!-- <v-icon v-if="flagsSet.has('view')" name="visibility"/> -->

            <!-- <v-icon name="identification" :color="capabilities.query && flagsSet.has('query') ? 'primary' : '#ccc'"/>
            <v-icon name="pencil" :color="capabilities.edit && flagsSet.has('edit') ? 'primary' : '#ccc'"/>
            <v-icon name="download" :color="capabilities.export && flagsSet.has('export') ? 'primary' : '#ccc'"/> -->

            <v-icon v-if="flagsSet.has('hidden')" name="visibility_off" color="primary"/>
            <v-icon v-if="flagsSet.has('render_off')" name="map_off" color="primary"/>
            <v-icon name="identification" :color="capabilities.query ? flagsSet.has('query') ? 'primary' : '#aaa' : '#ddd'"/>
            <v-icon name="pencil" :color="capabilities.edit ? flagsSet.has('edit') ? 'primary' : '#aaa' : '#ddd'"/>
            <v-icon name="download" :color="capabilities.export ? flagsSet.has('export') ? 'primary' : '#aaa' : '#ddd'"/>

          <!-- </template> -->
        </template>
      <v-icon v-else name="disabled"/>
      </div>
    </template>
  </v-select>

    <!-- <v-icon v-if="settings.hidden" name="visibility_off"/>
    <v-icon v-if="settings.published" name="visibility"/> -->

    <!-- <v-btn
      class="icon flat"
      :color="settings.hidden ? 'primary' : '#777'"
      @click="settings.hidden = !settings.hidden"
    >
      <v-icon name="visibility_off"/>
    </v-btn> -->
    <!-- <v-icon name="identification" :color="identifySupported ? 'grey' : '#777'"/> -->
    <!-- <v-icon name="pencil" :color="editable ? '' : 'grey'"/> -->
    
    <!-- <v-menu
      transition="slide-y"
      align="rr;bb,tt"
      :items="options"
    >
      <template v-slot:activator="{ toggle }">
        <div class="f-row-ac">
          <v-icon v-if="flagsSet.has('hidden')" name="visibility_off"/>
          <template v-else>
            <v-icon name="identification" :color="flagsSet.has('query') ? '' : '#ddd'"/>
            <v-icon name="pencil" :color="flagsSet.has('edit') ? '' : '#ddd'"/>
          </template>
          <div class="v-separator"/>
          <v-btn class="icon" @click="toggle">
            <v-icon name="menu-dots"/>
          </v-btn>
        </div>
      </template>
    </v-menu> -->
</template>

<script>
import { layerCapabilities } from '@/flags'

export default {
  props: {
    layerMeta: Object,
    layerSettings: Object,
  },
  computed: {
    flagsSet () {
      return new Set(this.layerSettings.flags || [])
    },
    capabilities () {
      return layerCapabilities(this.layerMeta, this.layerSettings)
    },
    options () {
      const excluded = this.flagsSet.has('excluded')
      return [
        {
          // text: excluded ? 'Include' : 'Exclude',
          text: 'Excluded',
          value: 'excluded',
          icon: 'disabled'
        }, {
          text: 'Visibility',
          separator: true
        }, {
          text: 'Hidden',
          value: 'hidden',
          icon: 'visibility_off',
          disabled: excluded
        }, {
          text: 'Renderless',
          value: 'render_off',
          icon: 'map_off',
          disabled: excluded
          // text: 'Layers Tree',
          // value: 'render_off',
          // icon: 'check',
          // disabled: excluded

        // }, {
        //   text: 'Visible',
        //   value: 'view',
        //   disabled: hidden
        }, {
          text: 'Data',
          separator: true
        }, {
          text: 'Queryable',
          value: 'query',
          icon: 'identification',
          disabled: !this.capabilities.query
        }, {
          text: 'Editable',
          value: 'edit',
          icon: 'pencil',
          disabled: !this.capabilities.edit
        }, {
          text: 'Exportable',
          value: 'export',
          icon: 'download',
          disabled: !this.capabilities.export || !this.flagsSet.has('query')
        }
      ]
    }
  },
  methods: {
    updateFlags (flags) {
      // if (flags.includes('export')) {
      //   if (!this.layerSettings.export_fields) {
      //     this.$set(this.layerSettings, 'export_fields', [])
      //   }
      // } else if (this.layerSettings.export_fields) {
      //   this.$delete(this.layerSettings, 'export_fields')
      // }
      this.layerSettings.flags = flags
    }
  }
}
</script>

<style lang="scss" scoped>
.selection {
  // gap: 6px;
  > * {
    margin-inline: 3px;
  }
}
</style>
