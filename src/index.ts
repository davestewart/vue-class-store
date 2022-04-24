import {reactive, shallowReactive, watch} from 'vue'

type C = { new (...args: any[]): {} }

type R = Record<any, any>

function getDescriptors (model: R): { [x: string]: PropertyDescriptor } {
  if(model === null || model === Object.prototype) {
    return {}
  }
  const parentDescriptors = getDescriptors(Object.getPrototypeOf(model))
  const descriptors = Object.getOwnPropertyDescriptors(model)
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

type WatchInfo = {
  callback: string | Function,
  target: string,
  deep: boolean,
  immediate: boolean,
  flush?: 'pre' | 'post' | 'sync'
}

// 'on.flag:target', 'on.flag1.flag2:target'
// flags: deep, immediate, pre, post, sync
let watchPattern = /^on(\.[.a-zA-Z]*)?:(.*)$/

function isWatch(key: string): boolean {
  return watchPattern.test(key)
}
function parseWatch(key: string, callback: string | Function): WatchInfo {
  let match = key.match(watchPattern)!
  // the initial period will create an empty element, but all we do is check if specific values exist, so we don't care
  let flags = new Set((match[1] ?? '').split('.'))
  let target = match[2]
  return {
    callback: callback,
    target: target,
    deep: flags.has('deep'),
    immediate: flags.has('immediate'),
    flush: flags.has('pre') ? 'pre' : flags.has('post') ? 'post' : flags.has('sync') ? 'sync' : undefined
  }
}

/**
 * Scans the model for `on:*` watchers and then creates watches for them. This method expects to be passed a reactive
 * model.
 */
function addWatches (state) {
  const descriptors = getDescriptors(state)

  // collect watches
  const watches: WatchInfo[] = []

  // method watches - 'on:foo'() { ... }
  Object.keys(descriptors).forEach(key => {
    if (isWatch(key)) {
      watches.push(parseWatch(key, descriptors[key].value))
    }
  })

  // set up watches
  watches.forEach(watchInfo => {
    const callback = typeof watchInfo.callback === 'string' ? state[watchInfo.callback] : watchInfo.callback
    if (typeof callback === 'function') {
      watch(() => getValue(state, watchInfo.target), callback.bind(state), {
        deep: watchInfo.deep,
        immediate: watchInfo.immediate,
        flush: watchInfo.flush
      })
    }
  })
}

function wrapConstructor<T extends C>(constructor: T, wrap: (instance: {}) => {}): T {
  let wrapper = {
    // preserve the constructor name. Useful for instanceof checks. https://stackoverflow.com/a/9479081
    // the `]: function(` instead of `](` here is necessary, otherwise the function is declared using the es6 class
    // syntax and thus can't be called as a constructor. https://stackoverflow.com/a/40922715
    [constructor.name]: function(...args) {
      return wrap(new constructor!(...args))
    }
  }[constructor.name]
  // set the wrapper's `prototype` property to the wrapped class's prototype. This makes instanceof work.
  wrapper.prototype = constructor.prototype
  // set the prototype to the constructor instance so you can still access static methods/properties.
  // This is how JS implements inheriting statics from superclasses, so it seems like a good solution.
  Object.setPrototypeOf(wrapper, constructor)
  return wrapper as unknown as T
}

export function makeReactive<T extends object>(model: T, shallow: boolean = false): T {
  // if the model is reactive (such as an object extending VueStore) this will return the model
  const state = shallow ? shallowReactive(model) : reactive(model)
  addWatches(state)
  return state as T
}

export interface VueStore {
  new (): object
  <T extends C> (constructor: T): T
  create<T extends object> (model: T): T
}

const VueStore: VueStore & {Shallow: VueStore} = function VueStore (this: object, constructor?: C): any {
  if(constructor === undefined) { // called as a constructor
    return reactive(this)
  } else { // called as a decorator
    return wrapConstructor(constructor as C, instance => makeReactive(instance, false))
  }
} as VueStore & {Shallow: VueStore}
VueStore.Shallow = function ShallowVueStore (this: object, constructor?: C): any {
  if(constructor === undefined) { // called as a constructor
    return shallowReactive(this)
  } else { // called as a decorator
    return wrapConstructor(constructor as C, instance => makeReactive(instance, true))
  }
} as VueStore

VueStore.create = instance => makeReactive(instance, false)
VueStore.Shallow.create = instance => makeReactive(instance, true)

export default VueStore
