import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../components/Home.vue'
import * as examples from '../examples'

Vue.use(VueRouter)

function route (path, component) {
  const title = (component.name || '').replace(/([a-z])([A-Z])/g, '$1 $2')
  return { path, component, title, meta: { title } }
}

function example (path, component) {
  const folder = component.__file.split('/')[2]
  return route(`/${folder + path}`, component)
}

export function getRoutes (group = false) {
  return Object.keys(examples).map(key => {
    const component = examples[key]
    return example('/' + key, component)
  })
}

const routes= [
  route('/', Home),
  ...getRoutes()
]

const router = new VueRouter({
  mode: 'history',
  // @ts-ignore
  base: process.env.BASE_URL,
  routes
})

export default router
