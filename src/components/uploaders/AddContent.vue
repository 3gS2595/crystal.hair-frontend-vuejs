<template>
  <div class ='lightbox'>
    <vue-resizable
      class='resizable'
      ref='resizableComponent'
      :dragSelector='dragSelector'
      :active='handlers'
      :fit-parent='true'
      :max-width='maxW'
      :max-height='maxH'
      :width='width'
      :height='height'
      :left='left'
      :top='top'
      @mount='res'
      @resize:move='eHandler'
      @resize:start='eHandler'
      @resize:end='eHandler'
      @drag:move='eHandler'
      @drag:start='eHandler'
      @drag:end='eHandler'
    >
      <div class='block'>
        <div class="uploader">
          <div class="txt">
            <editor-content :editor="editor" id="textEditor" />
          </div>
          <label id="fileSelect">
            <input v-show="editorEmpty" type="file" class="file-upload input-standard text-main-0" @change="handleFileUpload( $event )"/>
          </label>
        </div>

        <div class='drag-container-1'>
         <a class='navItem' @click='close'>exit</a>
         <a class='navItem' @click='submitFile()'>submit</a>
        </div>

      </div>
    </vue-resizable>
  </div>
</template>

<script lang='ts'>
import type { kernalType } from '@/types/ApiTypes'
import type { InputFileEvent } from '@/types/index'
import type { UploadBoxState } from '@/types/index'

import { defineComponent, type PropType, ref } from 'vue'
import axios from 'axios'
import VueResizable from 'vue-resizable'

import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { GlobalStore } from '@/store/GlobalStore'
import { ApiStore } from '@/store/ApiStore'
import { SessionStore } from '@/store/SessionStore'

const sessionStore = SessionStore()
const store = GlobalStore()
export default defineComponent({
  name: 'App',
  components: {
    VueResizable,
    EditorContent,
  },
  props: {
    viewerData: {
      type: Object as PropType<kernalType[]> ,
      required: true
    }
  },
  data(): UploadBoxState {
    return {
      handlers: ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'],
      left: 50,
      top: 50,
      height: 200,
      width: 200,
      maxW: window.innerWidth,
      maxH: window.innerHeight,
      dragSelector: '.drag-container-1, .drag-container-2',
      index: 9,
      store: GlobalStore(),
      sessionStore: SessionStore(),
      file: null,
      editor: null,
      enteredText: ref(''),
      editorEmpty: true
    }
  },
  methods: {
    handleFileUpload (event: InputFileEvent) {
      const element = event.currentTarget as HTMLInputElement;
      const fileList: FileList | null = element.files;
      if (fileList && event) {
        this.file = fileList[0]
      }
      this.submitFile()
    },
    async submitFile(){
      console.log(this.editor.view.dom.innerText)
      this.editorEmpty = false
      let formData = new FormData();
      if(this.file != null){
        formData.append('file_type', this.file.type)
        if (this.file.type.includes('pdf')) {
          formData.append('pdf', this.file)
          formData.set('file_type','.pdf');
        } else {
          formData.append('image', this.file)
        }
      }
      if(store.mixtape !== ''){
        formData.append('mixtape', store.mixtape)
      }
      if(this.editor.getHTML() !== "<p></p>"){
        if(this.editor.view.dom.innerText.match(/([\w+]+\:\/\/)?([\w\d-]+\.)*[\w-]+[\.\:]\w+([\/\?\=\&\#\.]?[\w-]+)*\/?/gm) && !this.editor.view.dom.innerText.includes(' ')){
          console.log("winner")
          formData.append('url', this.editor.view.dom.innerText)
          formData.append('file_type', 'link')
        } else {
          formData.append('text', this.editor.view.dom.innerText)
          formData.append('file_type', '.txt')
        }
      }
      if(formData.has("file_type")){
        store.setUploadBoxView(false)
        ApiStore().addKernal(formData)
      }
    },
    eHandler () {
      this.maxW = window.innerWidth
      this.maxH = window.innerHeight
    },
    orientationChange () {
      const orientation = window.orientation

      if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
        if (orientation === 0) {
          this.width = window.innerWidth
          this.height = window.innerHeight - 300
          this.left = 0
          this.top = 40
        } else if (orientation === 90 || orientation === -90) {
          this.width = window.innerWidth - 124
          this.height = window.innerHeight - 17
          this.left = 40
          this.top = 0
          }
        } else {
          this.width = window.innerWidth - 63
          this.height = window.innerHeight - 180
          this.left = 30
          this.top = 30
      }
    },
    res () {
      window.addEventListener('resize', this.orientationChange)
      window.addEventListener('orientationchange', this.orientationChange)
      window.addEventListener('keyup', this.esc, true)

      this.orientationChange()
    },
    esc (e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.close()
      }
    },
    close () {
      store.setUploadBoxView(false)
      window.removeEventListener('keyup', this.esc, true)
    }
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit
      ],
      content: this.enteredText.split("\n").join("<br />"),
      onUpdate: () => {
        this.editorEmpty = (this.editor.getHTML() !== "<p></p>") ? false : true
      }
    })
  },
  beforeUnmount() {
    this.editor.destroy()
  }
})

</script>