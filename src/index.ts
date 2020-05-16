import Vue, { ComponentOptions } from 'vue'

type Created = { new (...args: any[]): {} }

type Instance = Record<any, any>

export default function VueStore<T extends Created> (constructor: T): T {
  function construct (...args: any[]) {
    const instance = new (constructor as Created)(...args)
    return makeVueModel(instance)
  }
  return (construct as unknown) as T
}

export function makeVueModel<T extends Instance> (model: T): T {
  const options = makeOptions(model)
  return (new Vue(options) as unknown) as T
}

export function makeOptions(model: Instance): ComponentOptions<any> {
  // prototype
  const prototype = Object.getPrototypeOf(model)
  if (!prototype || prototype === Object.prototype) {
    return {}
  }

  // parent options
  const extendsOptions = makeOptions(prototype)

  // descriptors
  const descriptors = Object.getOwnPropertyDescriptors(prototype)

  // options
  const name = prototype.constructor.name
  const data = {}
  const computed = {}
  const methods = {}
  const watch = {}

  // data, string watches
  Object.keys(model).forEach(key => {
    const value = model[key]
    if (key.startsWith('on:')) {
      watch[key.substring(3)] = value
    }
    else {
      data[key] = value
    }
  })

  // function watches, methods, computed
  Object.keys(descriptors).forEach(key => {
    if (key !== 'constructor') {
      const { value, get, set } = descriptors[key]
      if (key.startsWith('on:')) {
        watch[key.substring(3)] = value
      }
      else if (value) {
        methods[key] = value
      }
      else if (get && set) {
        computed[key] = { get, set }
      }
      else if (get) {
        computed[key] = get
      }
    }
  })

  // return
  return {
    name,
    extends: extendsOptions,
    computed,
    methods,
    watch,
    data,
  }
}
