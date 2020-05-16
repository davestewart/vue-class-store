import Vue from 'vue'
import Vuex, {Store} from 'vuex'
import rectangle from './modules/rectangle'

Vue.use(Vuex)

const store: Store<any> = new Vuex.Store({
  modules: {
    rectangle
  }
})

store.watch((state: any) => state.rectangle.width, updateLog)

function updateLog (oldValue, newValue) {
  store.dispatch('rectangle/log', `Area is ${store.getters['rectangle/area']}`)
}

export default store
