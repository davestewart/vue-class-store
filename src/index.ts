import {reactive, watch} from 'vue'

type C = { new (...args: any[]): {} }

type R = Record<any, any>

function getPrototypeDescriptors (model: R) {
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
      watched[key.substring(3)] = state[key]
    }
  })
  // method watches
  Object.keys(descriptors).forEach((key: string) => {
    if(key.startsWith('on:')) {
      watched[key.substring(3)] = state[key]
    }
  })

  // set up watches
  Object.keys(watched).forEach(key => {
    const callback: Function = typeof watched[key] === 'string'
      ? state[getValue(state, 'on:' + key)]
      : watched[key]
    if (typeof callback === 'function') {
      watch(() => getValue(state, key), callback.bind(state))
    }
  })
}

export function makeReactive<T extends object>(model: T): T {
  const state = reactive(model)
  addWatches(state)
  return state as T
}

export default function VueStore<T extends C> (constructor: T): T {
  function construct (...args: any[]) {
    const instance = new (constructor as C)(...args)
    return makeReactive(instance)
  }
  return (construct as unknown) as T
}

VueStore.create = makeReactive
