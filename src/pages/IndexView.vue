<template>
  <div class="contentMain" id="contentMain">
    <splitpanes class="default-theme" @resize="paneSize = $event[0].size">
      <pane :size="paneSize + paneSizeOffSet" id="main-l">
        <navPane />
      </pane>
      <pane :size="100 - (paneSize + paneSizeOffSet)" id="main-r">
        <mediaPane />
      </pane>
    </splitpanes>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Splitpanes, Pane } from 'splitpanes'

import { ApiStore } from '@/stores/ApiStore'
import { GlobalStore } from '@/stores/GlobalStore'

import mediaPane from '@/components/MediaPane.vue'
import navPane from '@/components/NavPane.vue'

const globalStore = GlobalStore()
const { paneSize, paneSizeOffSet } = storeToRefs(globalStore)

onMounted(() => {
  const apiStore = ApiStore()
  apiStore.initialize()
})
</script>

