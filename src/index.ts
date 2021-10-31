import Vue, {ComponentOptions, WatchOptions} from 'vue'

/*
 * The general idea here is that we first merge the Vue prototype into your class, making your instance look like a Vue
 * instance. Then, once your instance has been constructed, we go and extract all the data, leaving the object empty
 * again. We then use this empty Vue-like object and call `this._init(options)`, passing in all the data we extracted.
 */

type C = {new(...args: any[]): {}}

type R = Record<any, any>

function copyStatics(source: R, destination: R) {
  let descriptors = Object.getOwnPropertyDescriptors(source)
  delete descriptors['length']
  delete descriptors['name']
  delete descriptors['prototype']
  Object.defineProperties(destination, descriptors)
}

function injectVue(prototype: R) {
  let descriptors = Object.getOwnPropertyDescriptors(Vue.prototype)
  delete descriptors['constructor']
  Object.defineProperties(prototype, descriptors)
}

// 'on:target', 'on:target#immediate', 'on:target#deep', 'on:target#immediate,deep'
let watchPattern = /^on:(.*?)(?:#(immediate|deep)(?:,(immediate|deep))?)?$/

function createWatcher(name: String, handler: any): {name: string, watcher: any} {
  let match = name.match(watchPattern)!
  let target = match[1]
  let flags = [match[2], match[3]]
  return {
    name: target,
    watcher: {
      handler,
      deep: flags.indexOf('deep') != -1,
      immediate: flags.indexOf('immediate') != -1
    }
  }
}

/**
 * Collects all the "static" options for the given prototype. That includes:
 * - methods
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
  const methods: R = {}
  const watch: R = {}

  Object.keys(descriptors).forEach(key => {
    if (key !== 'constructor' && !key.startsWith('__')) {
      const {value, get, set} = descriptors[key]
      if (key.startsWith('on:')) {
        let {name, watcher} = createWatcher(key, value)
        watch[name] = watcher
      } else if (value) {
        methods[key] = value
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
    computed,
    methods,
    watch,
    // data: // this will be added after we extract the data
  }
}

/**
 * Extracts the data and string watches from the passed instance. This _extracts_ the data, leaving the object empty at
 * the end.
 */
function extractData(instance: R): {data: object, watch: object} {
  const data: R = {}
  const watch: R = {}

  // extract the data and watches from the object. Emphasis on _extract_.
  // We _remove_ the data, then give it to vue, which puts it back.
  for(let key of Object.keys(instance)) {
    const value = instance[key]
    if(key.startsWith('__')) {
      continue
    }
    if (key.startsWith('on:')) {
      let {name, watcher} = createWatcher(key, value)
      watch[name] = watcher
    } else {
      data[key] = value
    }
    delete instance[key]
  }

  return {data, watch}
}

function mergeData(
    options: Partial<ComponentOptions<any>>, data: {data: object, watch: object}
): ComponentOptions<any> {
  return {
    ...options,
    watch: {...options.watch, ...data.watch},
    data: data.data
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

  const data = extractData(instance);
  (instance as any)._init(mergeData(classOptions, data))
  return instance
}

export default function VueStore<T extends C>(constructor: T): T {
  const classOptions = collectClassOptions(constructor.prototype);
  injectVue(constructor.prototype)

  let wrapper = function(...args: any[]) {
    const instance = new (constructor as C)(...args);
    const data = extractData(instance);
    (instance as any)._init(mergeData(classOptions, data));
    return (instance);
  }

  copyStatics(constructor, wrapper); // make static functions/properties work
  wrapper.prototype = constructor.prototype; // makes instanceof work
  return wrapper as unknown as T;
}

VueStore.create = makeVue
