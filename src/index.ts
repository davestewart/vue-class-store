import { computed, reactive, watch } from 'vue'

type C = { new (...args: any[]): {} }

type R = Record<any, any>

function getDescriptors (model: R) {
  const prototype = Object.getPrototypeOf(model)
  if (prototype === null || prototype === Object.prototype) {
    return {}
  }
  const prototypeDescriptors = getDescriptors(prototype)
  const descriptors = Object.getOwnPropertyDescriptors(prototype)
  return { ...prototypeDescriptors, ...descriptors }
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

export function makeReactive (model) {
  // properties
  const descriptors = getDescriptors(model)

  // options
  const watched = {}

  // data, string watches
  Object.keys(model).forEach((key: string) => {
    if (key.startsWith('on:')) {
      watched[key.substring(3)] = model[key]
    }
  })
  Object.keys(descriptors).forEach((key: string) => {
    if(key.startsWith('on:')) {
      watched[key.substring(3)] = model[key]
    }
  })

  const state = reactive(model)

  // set up watches
  Object.keys(watched).forEach(key => {
    const callback: Function = typeof watched[key] === 'string'
      ? model[getValue(model, 'on:' + key)]
      : watched[key]
    if (typeof callback === 'function') {
      watch(() => getValue(state, key), callback.bind(state))
    }
  })

  // return
  return state
}

export default function VueStore<T extends C> (constructor: T): T {
  function construct (...args: any[]) {
    const instance = new (constructor as C)(...args)
    return makeReactive(instance)
  }
  return (construct as unknown) as T
}

VueStore.create = makeReactive
