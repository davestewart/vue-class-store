import Vue from 'vue'
import Vuex from 'vuex'
import rectangle from './modules/rectangle'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    rectangle
  }
})

store.watch((state) => state.rectangle.width, updateLog)

function updateLog (oldValue, newValue) {
  store.dispatch('rectangle/log', `Area is ${store.getters['rectangle/area']}`)
}

export default store
