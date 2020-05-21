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
  const data = {}
  const watched = {}

  // data, string watches
  Object.keys(model).forEach((key: string) => {
    const value = model[key]
    if (key.startsWith('on:')) {
      watched[key.substring(3)] = value
    }
    else {
      data[key] = value
    }
  })

  // function watches, methods, computed
  const state = reactive({
    ...data,
    ...Object.keys(descriptors).reduce((output, key) => {
      if (key !== 'constructor' && !key.startsWith('__')) {
        const { value, get, set } = descriptors[key]
        // watch
        if (key.startsWith('on:')) {
          watched[key.substring(3)] = value
        }
        // method
        else if (value) {
          output[key] = (...args) => value.call(state, ...args)
        }
        // computed
        else if (get && set) {
          output[key] = computed({
            set: (value) => set.call(state, value),
            get: () => get.call(state),
          })
        }
        else if (get) {
          output[key] = computed(() => get.call(state))
        }
      }
      return output
    }, {}),
  })

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
