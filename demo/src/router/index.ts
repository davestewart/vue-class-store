import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../components/Home.vue'
import * as examples from '../examples'

Vue.use(VueRouter)

function route (path, component, folder = '') {
  const title = (component.name || '').replace(/([a-z])([A-Z])/g, '$1 $2')
  return { path, component, title, meta: { folder, title } }
}

function example (path, component) {
  const [src, examples, folder, file] = component.__file.split('/')
  return route(`/${folder + path}`, component, folder)
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
