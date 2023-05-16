import Vue, {ComponentOptions, ComputedOptions, WatchOptions, WatchOptionsWithHandler} from 'vue'

/*
 * The general idea here is that we first merge the Vue prototype into your class, making your instance look like a Vue
 * instance. Then, once your instance has been constructed, we go and extract all the data, leaving the object empty
 * again. We then use this empty Vue-like object and call `this._init(options)`, passing in all the data we extracted.
 */

type C = {new(...args: any[]): {}}

type R = Record<any, any>

function injectVue(prototype: R) {
  let descriptors = Object.getOwnPropertyDescriptors(Vue.prototype)
  delete descriptors['constructor']
  Object.defineProperties(prototype, descriptors)
}

// 'on.flag:target', 'on.flag1.flag2:target'
// flags: deep, immediate, pre, post, sync
let watchPattern = /^on(\.[.a-zA-Z]*)?:(.*)$/

function isWatch(key: string): boolean {
  return watchPattern.test(key)
}
function createWatcher(name: String, handler: any): {name: string, watcher: any} {
  let match = name.match(watchPattern)!
  // the initial period will create an empty element, but all we do is check if specific values exist, so we don't care
  let flags = new Set((match[1] ?? '').split('.'))
  let target = match[2]
  return {
    name: target,
    watcher: {
      handler,
      deep: flags.has('deep'),
      immediate: flags.has('immediate')
    }
  }
}

/**
 * Collects all the "static" options for the given prototype. That includes:
 * - watch methods (only methods. string watches like `'on:thing' = 'name'` wind up in the instance, not the prototype)
 * - computed property getters and setters
 */
function collectClassOptions(prototype: R): Partial<ComponentOptions<any>> {
  if (!prototype || prototype === Object.prototype) {
    return {}
  }

  const extendsOptions = collectClassOptions(Object.getPrototypeOf(prototype))
  const descriptors = Object.getOwnPropertyDescriptors(prototype)

  const name = prototype.constructor.name
  const computed: R = {}
  const watch: R = {}

  Object.keys(descriptors).forEach(key => {
    if (key !== 'constructor') {
      const {value, get, set} = descriptors[key]
      if (isWatch(key)) {
        let {name, watcher} = createWatcher(key, value)
        watch[name] = watcher
      } else if (get && set) {
        computed[key] = {get, set}
      } else if (get) {
        computed[key] = get
      }
    }
  })

  return {
    name,
    extends: extendsOptions,
    created: prototype.created,
    computed,
    methods: {}, // unnecessary, they're already in the prototype
    watch,
    // data: // this will be added after we extract the data
  }
}

/**
 * Extracts the data and string watches from the passed instance. This _extracts_ the data, leaving the object empty at
 * the end.
 */
function extractData(instance: R): {data: object, watches: object} {
  const data: R = {}
  const watches: R = {}

  // extract the data and watches from the object. Emphasis on _extract_.
  // We _remove_ the data, then give it to vue, which puts it back.
  Object.keys(instance).forEach((key) => {
    const value = instance[key]
    if (key.startsWith('on:')) {
      let {name, watcher} = createWatcher(key, value)
      watches[name] = watcher
    } else {
      data[key] = value
    }
    delete instance[key]
  })

  return {data, watches}
}

function mergeData(
    options: Partial<ComponentOptions<any>>, data: object, watches: object
): ComponentOptions<any> {
  return {
    ...options,
    watch: {...options.watch, ...watches},
    data
  }
}

function makeVue<T extends R>(instance: T): T {
  const prototype = Object.getPrototypeOf(instance)
  const classOptions = collectClassOptions(prototype);

  // wrap the prototype so we don't modify the base class
  const wrapper = {}
  Object.setPrototypeOf(wrapper, prototype)
  Object.setPrototypeOf(instance, wrapper)
  injectVue(wrapper)

  const {data, watches} = extractData(instance);
  (instance as any)._init(mergeData(classOptions, data, watches))
  return instance
}

const vueStoreClass = Symbol("isVueStore")

export default function VueStore<T extends C>(constructor: T): T {
  // Subclassing a VueStore decorated class causes a lot of problems.
  // - properties defined in subclasses won't be reactive
  // - getters and setters won't be called, since Vue will define reactive getters and setters in the object instance
  //   itself, which override the prototype of the subclass, and these getters/setters will directly reference the
  //   @VueStore getters/setters, not the subclass getters/setters
  // - watches won't be detected in subclasses
  // - overriding watchers in subclasses will call the originals, since they reference the VueStore methods directly

  // when decorated, we fail fast instead of waiting for instantiation
  if (constructor.prototype[vueStoreClass]) {
    throw Error(`Illegal subclass (${constructor.name}) of @VueStore class ${constructor.prototype[vueStoreClass].name}`)
  }

  // the class options are "static" in the class, we only need to do this once
  const classOptions = collectClassOptions(constructor.prototype);
  // we take the contents of the vue prototype, aside from the constructor, and copy them into the store's prototype
  injectVue(constructor.prototype)

  let wrapper = {
    // preserve the constructor name. https://stackoverflow.com/a/9479081
    // the `]: function(` instead of `](` here is necessary, otherwise the function is declared using the es6 class
    // syntax and thus can't be called as a constructor. https://stackoverflow.com/a/40922715
    [constructor.name]: function(...args) {
      // Subclassing causes problems (see the top of the decorator function)
      if(this.constructor !== wrapper) {
        throw Error(`Illegal subclass (${this.constructor.name}) of @VueStore class ${constructor.name}`)
      }

      // First we call the constructor, which may or may not set some state in the object
      const instance = new (constructor as C)(...args);

      // Currently:
      //   instance = {...state, [[Prototype]]: StoreClass}

      // Now we rip out all the state, and collect any "dynamic" watches
      const {data, watches} = extractData(instance);

      // Currently:
      //   instance = { [[Prototype]]: StoreClass }
      //   data = {...state}

      // now we ask Vue to initialize the empty object with the data we extracted
      (instance as any)._init(mergeData(classOptions, data, watches));
      return instance;
    }
  }[constructor.name]
  // set the wrapper's `prototype` property to the wrapped class's prototype. This makes instanceof work.
  wrapper.prototype = constructor.prototype
  // make this.constructor the new constructor
  constructor.prototype.constructor = wrapper
  // record this for the fail-fast error
  constructor.prototype[vueStoreClass] = wrapper

  // set the prototype to the constructor instance so you can still access static methods/properties.
  // This is how JS implements inheriting statics from superclasses, so it seems like a good solution.
  Object.setPrototypeOf(wrapper, constructor)

  return wrapper as unknown as T;
}

VueStore.create = makeVue
