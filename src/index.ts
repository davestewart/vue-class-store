import {computed, reactive, watch, WatchOptions} from 'vue'

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

function getValue (value: Record<any, any>, path: string[]) {
  const segment = path.shift()
  return segment !== undefined ? getValue(value[segment], path) : value
}

// 'on.flag:target', 'on.flag1.flag2:target'
// flags: deep, immediate, pre, post, sync
let watchPattern = /^on(\.[.a-zA-Z]*)?:(.*)$/

function isWatch(key: string): boolean {
  return watchPattern.test(key)
}

function parseWatchOptions(key: string): [string, WatchOptions] {
  let match = key.match(watchPattern)!
  // the initial period will create an empty element, but all we do is check if specific values exist, so we don't care
  let flags = new Set((match[1] ?? '').split('.'))
  let target = match[2]
  return [
    target,
    {
      deep: flags.has('deep'),
      immediate: flags.has('immediate'),
      flush: flags.has('pre') ? 'pre' : flags.has('post') ? 'post' : flags.has('sync') ? 'sync' : undefined
    }
  ]
}

/**
 * Adds ComputedRef instances to the model for each getter/setter pair. When accessing the reactive object Vue will
 * unwrap those refs. This method expects to be passed a reactive model.
 *
 * Before:
 * ```js
 * {
 *   <prototype>: {
 *     get x(),
 *     set x(value),
 *     get y(),
 *   },
 *   val: 10,
 *   get z(),
 *   set z(value),
 * }
 * ```
 * After:
 * ```js
 * {
 *   <prototype>: {...},
 *   val: 10,
 *   x: computed({get: <prototype x getter>, set: <prototype x setter>}),
 *   y: computed(<prototype y getter>),
 *   z: computed({get: <original z getter>, set: <original z setter>}),
 * }
 * ```
 */
function addComputed(state) {
  Object.entries(getDescriptors(state)).forEach(([key, desc]) => {
    const {get, set} = desc
    if(get) {
      let ref = set
          ? computed({get: get.bind(state), set: set.bind(state)})
          : computed(get.bind(state))

      Object.defineProperty(state, key, {
        value: ref, // vue unwraps this automatically when accessing it
        writable: desc.writable,
        enumerable: desc.enumerable,
        configurable: true
      })
    }
  })
}

/**
 * Scans the model for `on:*` watchers and then creates watches for them. This method expects to be passed a reactive
 * model.
 */
function addWatches (state) {
  Object.entries(getDescriptors(state)).forEach(([key, desc]) => {
    if (isWatch(key)) {
      let [watchTarget, watchOptions] = parseWatchOptions(key)
      let callback = typeof desc.value === 'string' ? state[desc.value] : desc.value
      if(typeof callback === 'function') {
        watch(() => getValue(state, watchTarget.split('.')), callback.bind(state), watchOptions)
      }
    }
  })
}

export function makeReactive<T extends object>(model: T): T {
  // if the model is reactive (such as an object extending VueStore) this will return the model directly
  const state = reactive(model)
  addComputed(state)
  addWatches(state)
  return state as T
}

export interface VueStore {
  new (): object
  <T extends C> (constructor: T): T
  create<T extends object> (model: T): T
}

const VueStore: VueStore = function VueStore (this: object, constructor?: C): any {
  if(constructor === undefined) { // called as a constructor
    return reactive(this)
  } else { // called as a decorator
    let wrapper = {
      // preserve the constructor name. Useful for instanceof checks. https://stackoverflow.com/a/9479081
      // the `]: function(` instead of `](` here is necessary, otherwise the function is declared using the es6 class
      // syntax and thus can't be called as a constructor. https://stackoverflow.com/a/40922715
      [constructor.name]: function(...args) {
        return makeReactive(new constructor!(...args))
      }
    }[constructor.name]
    // set the wrapper's `prototype` property to the wrapped class's prototype. This makes instanceof work.
    wrapper.prototype = constructor.prototype
    // set the prototype to the constructor instance so you can still access static methods/properties.
    // This is how JS implements inheriting statics from superclasses, so it seems like a good solution.
    Object.setPrototypeOf(wrapper, constructor)
    return wrapper
  }
} as VueStore

VueStore.create = makeReactive

export default VueStore
