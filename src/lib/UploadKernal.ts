import { useKernalStore } from '@/stores/api/KernalStore'
import { GlobalStore } from '@/stores/GlobalStore'

function dragInFile (ev: DragEvent) {
  ev.preventDefault();
  if (ev.dataTransfer !== null) {
    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item) => {
        if (item.kind === "file") {
          GlobalStore().uploadBoxView = false
          uploadFile(item.getAsFile())
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
      });
    }
  }
}
function pasteInFile (ev: ClipboardEvent) {
  if (ev != undefined) {
    if (ev.clipboardData !== null) {
      if (ev.clipboardData.items) {
        [...ev.clipboardData.items].forEach((item) => {
          if (item.kind === "file") {
            GlobalStore().uploadBoxView = false
            uploadFile(item.getAsFile())
          }
        });
      } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.clipboardData.files].forEach((file, i) => {
          console.log(`… file[${i}].name = ${file.name}`);
        });
      }
    }
  }
 }
async function uploadFile(file: File | null){
  let formData = new FormData();
  if(file != null){
    formData.append('file_type', file.type)
    if (file.type.includes('pdf')) {
      formData.append('pdf', file)
      formData.set('file_type','.pdf');
    } else {
      formData.append('image', file)
    }
  }
  if(GlobalStore().mixtape !== ''){
    formData.append('mixtape', GlobalStore().mixtape)
  }
  if(formData.has("file_type")){
    useKernalStore().addKernal(formData)
  }
}
export { dragInFile, pasteInFile }
