import Vue from 'vue'
import Demo from './Demo.vue'
import router from './router'
import RectangleView from './components/RectangleView.vue'
import store from './examples/vuex/store'
import './styles/index.css'

Vue.component('RectangleView', RectangleView)

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(Demo)
}).$mount('#app')
