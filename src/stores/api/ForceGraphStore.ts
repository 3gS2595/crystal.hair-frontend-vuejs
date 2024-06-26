import { defineStore } from 'pinia'
import { GlobalStore } from '@/stores/GlobalStore'
import { SessionStore } from '@/stores/SessionStore'
import axios from 'axios'

import type { forceGraph } from '@/types/ApiTypes'
const defaultState = {
    forceGraph: <forceGraph[]>[],
}
export const useForceGraphStore = defineStore({
  id: 'useForceGraphStore',
  state: () => ({ ...structuredClone(defaultState)}),

  actions: {
    async fetchForceGraph () {
      let params = '?q=' + GlobalStore().filter + '&forceGraph=true'
      const config = {
        headers: { Authorization: SessionStore().auth_token },
      }
      if (GlobalStore().mixtape != '') { params = params + '&mixtape=' +  GlobalStore().mixtape }
      try {
        const forceGraph = await axios.get(SessionStore().getUrlRails + 'kernals'+ params, config)
        this.forceGraph = forceGraph.data
      } catch (e) {
        console.error(e);
      }
    },
    reset() {
      Object.assign(this, structuredClone(defaultState));
    }
  }
})
