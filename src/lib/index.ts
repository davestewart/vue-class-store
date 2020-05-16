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
  return (new Vue(makeOptions(model)) as unknown) as T
}

export function makeOptions(model: Instance): ComponentOptions<any> {
  const prototype = Object.getPrototypeOf(model)
  const descriptors = Object.getOwnPropertyDescriptors(prototype)

  // core options
  const data = {}
  const computed = {}
  const methods = {}
  const watch = {}

  // properties
  Object.keys(model).forEach(key => {
    const value = model[key]
    if (key.startsWith('on:')) {
      watch[key.substring(3)] = value
    }
    else {
      data[key] = value
    }
  })

  // descriptors
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
    name: prototype.constructor.name,
    computed,
    methods,
    watch,
    data,
  }
}
