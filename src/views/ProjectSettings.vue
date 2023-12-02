<template>
  <div class="page-content light">
    <ScrollArea>
      <div>
        <h2 class="subheader px-2">Project settings</h2>
        <TextEditor
          class="filled"
          label="Project description"
          v-model="settings.description"
          multiline
          lazy
        />

        <v-select
          class="filled"
          label="Language"
          v-model="settings.lang"
          :items="availableLanguages"
          itemValue="code"
          itemText="name"
        />
      </div>
    </ScrollArea>
  </div>
</template>

<script>
import ScrollArea from '@/ui/ScrollArea.vue'
import TextEditor from '@/components/TextEditor.vue'
import { TaskState, watchTask } from '@/tasks'

export default {
  components: { ScrollArea, TextEditor },
  props: {
    project: Object,
    settings: Object,
  },
  data() {
    return {
      task: TaskState(),
      availableLanguages: [],
    }
  },
  mounted() {
    const task = this.$http.get('/map/config.json').then((resp) => {
      this.availableLanguages = resp.data.languages
      return resp.data
    })
    watchTask(task, this.task)
  },
}
</script>

<style lang="scss" scoped>
:deep {
  .text-editor {
    > label {
      order: 0;
    }

    > .input {
      order: 2;
    }

    > .toolbar {
      order: 1;
      top: 0;
      position: sticky;
    }
  }
}
</style>
