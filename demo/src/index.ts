import Vue from 'vue'
import Demo from './Demo.vue'
import router from './router'
import RectangleView from './components/RectangleView.vue'
import CodeView from './components/CodeView.vue'
import store from './examples/other/vuex/store'
import './styles/index.css'

// install
import VueStore from 'vue-class-store'
Vue.use(VueStore.install)

// global components
Vue.component('RectangleView', RectangleView)
Vue.component('CodeView', CodeView)

// setup and mount
Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(Demo)
}).$mount('#app')
