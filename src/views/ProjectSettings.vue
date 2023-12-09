<template>
  <div class="page-content light">
    <ScrollArea>
      <div>
        <h2 class="subheader px-2">Project settings</h2>
      </div>
    </ScrollArea>
  </div>
</template>

<script>
import ScrollArea from '@/ui/ScrollArea.vue'

export default {
  components: { ScrollArea },
  props: {
    project: Object,
    settings: Object,
  },
}
</script>
