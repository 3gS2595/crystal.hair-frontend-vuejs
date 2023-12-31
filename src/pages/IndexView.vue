<template>
  <div class='contentMain' id="contentMain" @drop.prevent="dragInFile" @dragenter.prevent @dragover.prevent>
    <ProgressBar v-if="store.uploadView" :value="store.uploadPercent"></ProgressBar>
    <LightBox v-if='store.lightBoxView' :viewerData="kernals"/>
    <AddContentBox v-if='store.uploadBoxView'/>
    <AddMixtapeBox v-if='store.addMixtapeBoxView'/>
    <AddSrcUrlSubset v-if='store.addSrcUrlSubset'/>

    <splitpanes class="default-theme"
      style="width=100%"
      @ready="resizeContentFit()"
      @resize="paneSize = $event[0].size; "
      @resized="resizeContentFit()"
    >

  <!-- NAVIGATION PANE-->
      <pane id="main-l" :size="paneSize + paneSizeOffSet">
        <nav class='nav'>
          <img class='navItem' src="logout.png" @click="logout"/>
          <input class='search input-standard text-main-0' v-model="searchValue" placeholder="search" @keyup.enter="search(searchValue)" />
        </nav>

        <div class="mixtape-pane">
          <div class="tabs">
            <div class="tabs-l">
              <div class="tab" :class="{'tab-active': currentTab === 1}" @click='currentTab = 1; changeTab()'>
                <img class="tab-icon" src="icon-web.png"/>
              </div>
              <div class="tab" :class="{'tab-active': currentTab === 2}" @click='currentTab = 2; changeTab()'>
                <img class="tab-icon" src="icon-spider.png"/>
              </div>
            </div>
            <div class="tabs-r" v-if="currentTab == 1">
              <a class="tab tab-active tab-add" @click='toggleAddMixtapeBox()'>+</a>
            </div>
            <div class="tabs-r" v-if="currentTab == 2">
              <a class="tab tab-active tab-add" @click='toggleAddSrcUrlSubset()'>+</a>
            </div>
          </div>
          <div class="tab-content-mixtape" v-if='currentTab === 1'>
            <MixtapeModule :id="0"/>
          </div>
          <div class="tab-content-mixtape" v-if='currentTab === 2'>
            <ScrapersModule :id="0"/>
          </div>
        </div>

        <div  class="forceGraph" >
          <ForceGraph :propKernals="forceGraph" :propMixtapes="mixtapes" :propMixtape="mixtape"/>
        </div>
      </pane>

  <!-- CONTENT PANE -->
      <pane id="main-r" @paste.prevent="pasteInFile()" :size="100 - (paneSize + paneSizeOffSet)">
        <div class="tabs tabs-content">
          <div class="tabs-l">
            <a class="tab tab-active" @click='viewSettings = !viewSettings'>⛓&#xFE0E;</a>
            <a class="tab tab-active current-dir" v-if="store.filter!=''" @click='store.setFilter("")'>{{store.filter}}</a>
            <a class="tab tab-active current-dir" v-if="mixtapeHeader!=''" @click='closeHeader()'>{{mixtapeHeader}}</a>
          </div>

          <div class="tabs-r">
            <a class="tab tab-active tab-add" @click='toggleUploadBox()'>+</a>
          </div>

          <div class="settings" v-if="viewSettings" v-click-away='onClickAway'>
            <a class="set-btn" id="set-btn-1" @click="darkToggle()">dark mode</a>
            <a class="set-btn" id="set-btn-2" @click="cgbPlus()">+</a>
            <a class="set-btn" id="set-btn-3" @click="cgbMinus()">-</a>
            <a class="set-btn" id="set-btn-4" v-if="store.mixtape!=''" @click="apiStore.deleteMixtape(store.mixtape);viewSettings=!viewSettings">delete mixtape</a>
          </div>
        </div>

        <div class="tab-content-kernal">
          <ContentModule v-on:dblclick="resize(0)" :id="1"/>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import { directive } from 'vue3-click-away'

import { darkToggle, darkSet } from '@/lib/DarkMode'
import { dragInFile, pasteInFile } from '@/lib/UploadKernal'
import DropDown from '@/components/menuDropDown/DropDown.vue'
import ForceGraph from '@/components/forceGraph/ForceGraph.vue'
import ContentModule from '@/components/dataGrids/ContentModule.vue'
import MixtapeModule from '@/components/dataGrids/MixtapeModule.vue'
import ScrapersModule from '@/components/dataGrids/ScrapersModule.vue'
import LightBox from '@/components/contentViewers/LightBox.vue'
import AddContentBox from '@/components/uploaders/AddContent.vue'
import AddMixtapeBox from '@/components/uploaders/AddMixtape.vue'
import AddSrcUrlSubset from '@/components/uploaders/AddSrcUrlSubset.vue'

import { storeToRefs } from 'pinia'
import { ApiStore } from '@/store/ApiStore'
import { GlobalStore } from '@/store/GlobalStore'
import { useMixtapeStore } from '@/store/api/MixtapeStore'
import { useForceGraphStore } from '@/store/api/ForceGraphStore'
import { useSrcUrlSubsetStore } from '@/store/api/SrcUrlSubsetStore'

export default defineComponent({
  components: {
    Splitpanes,
    Pane,
    ContentModule,
    MixtapeModule,
    ScrapersModule,
    ForceGraph,
    LightBox,
    AddContentBox,
    AddMixtapeBox,
    AddSrcUrlSubset
  },


// Page Variables
  data () {
    return {
      paneSizeTemp: 0,
      paneSize: 30.0,
      paneSizeOffSet: 0.0,
      store: GlobalStore(),
      apiStore: ApiStore(),
      viewSettings: false,
      currentTab: 1,
      searchValue: '',
      mixtapeHeader: '',
    }
  },
  watch: {
    mixtape() {
      const result = this.mixtapes.find(m => m.id === this.store.mixtape)
      this.mixtapeHeader = (result !== undefined) ? result.name : ''
    },
    srcUrlSubset() {
      const result = this.srcUrlSubsets.find(s => s.id === this.store.srcUrlSubset)
      this.mixtapeHeader = (result !== undefined) ? result.name : ''
    }
  },


// Page Lifecycle hooks
  setup () {
    const { mixtapes } = storeToRefs(useMixtapeStore())
    const { srcUrlSubsets } = storeToRefs(useSrcUrlSubsetStore())
    const {forceGraph } = storeToRefs(useForceGraphStore())
    const { mixtape, srcUrlSubset } = storeToRefs(GlobalStore());
    return { mixtapes, mixtape, srcUrlSubsets, srcUrlSubset, forceGraph }
  },
  mounted () {
    window.addEventListener('visibilitychange', this.resizeContentFit)
    window.addEventListener('orientationchange', this.resizeContentFit)
    window.addEventListener('resize', this.resizeContentFit)
    window.addEventListener('paste', this.pasteInFile)
    this.resizeContentFit()
    ApiStore().initialize()
  },
  unmounted () {
    window.removeEventListener('visibilitychange', this.resizeContentFit)
    window.removeEventListener('orientationchange', this.resizeContentFit, true)
    window.removeEventListener('resize', this.resizeContentFit, true)
  },


// Page Methods
  methods: {
    darkToggle,
    darkSet,
    dragInFile,
    pasteInFile,
    closeHeader () {
      this.store.setMixtape("")
      if(this.currentTab === 2){
        this.store.setSrcUrlSubset("-1")
      } else {
        this.store.setSrcUrlSubset("")
      }
    },
    changeTab () {
      this.store.setSrcUrlSubset("")
      this.store.setMixtape("")
      if (this.store.mixtape == "" && (this.store.srcUrlSubset == "-1" || this.store.srcUrlSubset == "")) {
        if (this.currentTab === 1){
          this.store.setSrcUrlSubset("")
        } else if (this.currentTab === 2){
          this.store.setSrcUrlSubset("-1")
        }
      }
    },
    logout () {
      localStorage.removeItem('auth_token')
      location.reload()
    },
    cgbPlus () {
      this.stepContentFit(1)
    },
    cgbMinus () {
      this.stepContentFit(-1)
    },
    toggleUploadBox() {
      this.store.setUploadBoxView(!this.store.uploadBoxView)
    },
    toggleAddMixtapeBox() {
      this.store.setAddMixtapeBoxView(!this.store.addMixtapeBoxView)
    },
    toggleAddSrcUrlSubset() {
      this.store.setAddSrcUrlSubset(!this.store.addSrcUrlSubset)
    },
    search: function (e: string) {
      this.store.setFilter(e)
      this.searchValue = ''
    },
    resizeContentFit: function () {
      const el = document.getElementById('app')
      const cgb_width = this.store.cgbWidth
      const cgb = document.querySelector('.cgb-0')
      let cgb_margin = 5
      let scroll_width = 8
      if (cgb != null) {
        const width  = window.getComputedStyle(cgb).marginLeft
        cgb_margin = Number(width.substring(0, width.length - 2))
        scroll_width = cgb_margin * 2
      }
      if ( el != null) {
        if (this.paneSize === 30 ){
          const max_cont_width = el.offsetWidth - 203 - scroll_width - (cgb_margin)
          const extra_width = max_cont_width % (cgb_width + (cgb_margin)) - 15
          const tt = (max_cont_width  - extra_width) / (cgb_width + (cgb_margin))
          const content_width_percent = (max_cont_width) / el.offsetWidth
          const offset_size = ((-1 * (content_width_percent - 1)) - .3) * 100
          this.paneSizeOffSet =(offset_size)
          this.store.setCgbWidthSized(this.store.cgbWidth + (extra_width / Math.trunc(tt)))
        }
        if (this.paneSize === 0 ){
          const max_cont_width = el.offsetWidth - scroll_width - (cgb_margin + 7)
          const extra_width = max_cont_width % (cgb_width + (cgb_margin))
          const tt = (max_cont_width  - extra_width) / (cgb_width + (cgb_margin))
          this.store.setCgbWidthSized(this.store.cgbWidth + (extra_width / Math.trunc(tt)))
        }
      }
    },
    stepContentFit: function (step: number) {
      const el = document.getElementById('app')
      const cgb_width = this.store.cgbWidth
      const cgb = document.querySelector('.cgb-0')
      let cgb_margin = 5
      let scroll_width = 8
      if (cgb != null) {
        const width  = window.getComputedStyle(cgb).marginLeft
        cgb_margin = Number(width.substring(0, width.length - 2))
        scroll_width = cgb_margin * 2
      }
      if ( el != null) {
        if (this.paneSize === 30 ){
          const max_cont_width = el.offsetWidth - 202 - scroll_width - (cgb_margin) - 20
          const extra_width = max_cont_width % (cgb_width + (cgb_margin)) - 18
          const tt = (max_cont_width  - extra_width) / (cgb_width + (cgb_margin))
          if(step + Math.trunc(tt) >= 1){
            const fitWidth = (max_cont_width - (step + Math.trunc(tt)) * cgb_margin) / (step + Math.trunc(tt))
            this.store.setCgbWidth(fitWidth - (this.store.cgbWidthSized - this.store.cgbWidth))
            this.store.setCgbWidthSized(fitWidth)
            this.resizeContentFit()
          }
        }
      }
    },
    resize: function (size: number) {
      if (this.paneSize !== size) {
        this.paneSizeTemp = this.paneSize
        this.paneSize = size
        this.paneSizeOffSet = 0
      } else {
        this.paneSize = this.paneSizeTemp
      }
      this.resizeContentFit()
    },
    onClickAway () {
      this.viewSettings = false
    },
  },
  directives: {
    ClickAway: directive
  }
})
</script>
