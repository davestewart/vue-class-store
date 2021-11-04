import {reactive, watch} from 'vue'

type C = { new (...args: any[]): {} }

type R = Record<any, any>

function getPrototypeDescriptors (model: R): { [x: string]: PropertyDescriptor } {
  const prototype = Object.getPrototypeOf(model)
  if (prototype === null || prototype === Object.prototype) {
    return {}
  }
  const parentDescriptors = getPrototypeDescriptors(prototype)
  const descriptors = Object.getOwnPropertyDescriptors(prototype)
  return { ...parentDescriptors, ...descriptors }
}

function getValue (value: Record<any, any>, path: string | string[]) {
  const segments = typeof path === 'string'
    ? path.split('.')
    : path
  const segment: string | undefined = segments.shift()
  return segment
    ? getValue(value[segment], segments)
    : value
}

type Flush = 'pre' | 'post' | 'sync'

// 'on:target', 'on:target#flag', 'on:target#flag1,flag2'
// flags: deep, immediate, pre, post, sync
let watchPattern = /^on:(.*?)(?:#([a-z,]+))?$/

function parseWatch(name: String): {target: string, deep: boolean, immediate: boolean, flush?: Flush} {
  let match = name.match(watchPattern)!
  let target = match[1]
  let flags = (match[2] ?? '').split(',')
  return {
    target: target,
    deep: flags.indexOf('deep') != -1,
    immediate: flags.indexOf('immediate') != -1,
    flush: flags.find((flag) => flag == 'pre' || flag == 'post' || flag == 'sync') as Flush | undefined
  }
}

/**
 * Scans the model for `on:*` watchers and then creates watches for them. This method expects to be passed a reactive
 * model.
 */
function addWatches (state) {
  const descriptors = getPrototypeDescriptors(state)

  // options
  const watched = {}

  // string watches
  Object.keys(state).forEach((key: string) => {
    if (key.startsWith('on:')) {
      watched[key] = state[key]
    }
  })
  // method watches
  Object.keys(descriptors).forEach((key: string) => {
    if(key.startsWith('on:')) {
      watched[key] = descriptors[key].value
    }
  })

  // set up watches
  Object.keys(watched).forEach(key => {
    const callback: Function = typeof watched[key] === 'string'
      ? state[getValue(state, key)]
      : watched[key]
    if (typeof callback === 'function') {
      let {target, deep, immediate, flush} = parseWatch(key)
      watch(() => getValue(state, target), callback.bind(state), {deep, immediate, flush})
    }
  })
}

export function makeReactive<T extends object>(model: T): T {
  // if the model is reactive (such as an object extending VueStore) this will return the model
  const state = reactive(model)
  addWatches(state)
  return state as T
}

export interface VueStore {
  new (): VueStore
  <T extends C> (constructor: T): T
  create<T extends object> (model: T): T
}

const VueStore: VueStore = function VueStore (this: object, constructor?: C): any {
  if(constructor === undefined) { // called as a constructor
    return reactive(this)
  } else { // called as a decorator
    function construct(...args: any[]) {
      const instance = new constructor!(...args)
      // if(instance instanceof VueStore)
      return makeReactive(instance)
    }
    return construct
  }
} as VueStore
VueStore.create = makeReactive

export default VueStore
