# Vue Class Store

> Fully-reactive, zero-boilerplate, class-based stores for Vue

## Abstract

Vue Class Store is a one-liner upgrade that adds reactivity, computed properties, caching and watches to regular TS/ES6 classes.

It allows you to leverage the advanced reactivity features of Vue whilst retaining familiar classical syntax, structure and functionality, such as simple instantiation, parametized constructors and inheritance – with zero setup or bloat.

With Vue Class Store there's no refactoring data into components or abstracting into modules, writing mutations or mapping getters; you simply write and instantiate classes then work with them directly.

Stores can be used locally or globally, outside or inside components, nested in other stores and are fully compatible with the Vue ecosystem (including Nuxt) because they are transparently converted into `Vue` instances.

Working with stores in both the IDE and DevTools is easy as they are *just* classes, which means source maps, debugging and breakpoints work like you expect:

![devtools](https://raw.githubusercontent.com/davestewart/vue-class-store/master/dev/devtools.png)

## Installation

### Setup

Install the package from NPM:

```bash
npm i vue-class-store
```

```bash
yarn add vue-class-store
```

In your main project file, install the plugin:

```javascript
import Vue from 'vue'
import VueStore from 'vue-class-store'

Vue.use(VueStore.install)
```

## Usage

### Declaration

Write classes as normal, and add the decorator `@VueStore` to those you want to become reactive.

```typescript
import VueStore from 'vue-class-store'

@VueStore
export class Store {
  // properties are rebuilt as reactive data values
  public value: number

  // getters are converted to (cached) computed properties
  public get double (): number {
    return this.value * 2
  }

  // constructor parameters serve as props
  constructor (value: number = 1) {
    // constructor function serves as the created hook
    this.value = value
  }

  // prefix properties with `on:` to convert to watches
  'on:value' () {
    console.log('value changed to:', this.value)
  }

  // you can even drill into sub properties!
  'on:some.other.value' = 'log'

  // class methods are added as methods
  log () {
    console.log('value is:', this.value)
  }
}
```

When the class is instantiated, the decorator will convert it to a new Vue instance and return it.

### Instantiation

To use a store, simply instantiate the class.

You can do this outside of a component, and it will be completely reactive:

```typescript
const store = new Store(10)
```

Or you can instantiate within a component:

```javascript
export default {
  props: {
    value: Number
  },
  
  computed: {
    model () {
      return new Store(this.value)
    }
  }
}
```

Alternatively, you can make any non-decorated class reactive using the static `.create()` method:

```typescript
import VueStore from 'vue-class-store'
import Model from './Model'

const reactive: Model = VueStore.create(new Model(1, 2, 3))
```

Wherever you do it, the decorator will return a new reactive `Vue` instance, but your IDE will think it's an instance of the original class, and it will have *exactly* the same properties.

## Inheritance

The decorator supports class inheritance, by chaining the prototypes as Vue `extends` options, meaning you can do things like this:

```typescript
class Rectangle {
  width: number
  height: number
  
  constructor (width, height) {
    this.width = width
    this.height = height
  }
  
  get area () { return this.width * this.height }
}

@VueStore
class Square extends Rectangle {
  constructor (size) {
    super(size, size)
  }

  'on:width' (value) { this.height = value }
  'on:height' (value) { this.width = value }
}
```

Make sure you **don't inherit from another decorated class** because the original link to the prototype chain will have been broken by the substituted object returned by the previous decorator:

```typescript
// don't do this!

@VueStore
class Rectangle { ... }

@VueStore
class Square extends Rectangle { ... }
```

If you need to keep the original Rectangle and Square intact, decorate a final empty class that leaves the original classes untouched:

```typescript
// do this instead...

class Rectangle { ... }
class Square extends Rectangle { ... }

@VueStore
class SquareStore extends Square { } 
```

Alternatively, use inline creation:

```typescript
import Square from './Square'

const model: Square = VueStore.create(new Square(10))
```

## Global / shared state

Because the class itself is reactive, you could inject it into a component tree, simulating global state:

```javascript
export default {
  provide () {
    return {
      $store: new Store(10)
    }
  },
}
```

```javascript
export default {
  inject: [
    '$store'
  ],
  
  computed: {
    value () {
      return this.$store.value
    }
  },
  
  setValue (value) {
    this.$store.value = value
  }
}
```

## Nuxt

Because all data is passed by the constructor, Vue Class Store just works with SSR.

To set up, add a plugin file and config option:

```javascript
// plugins/vue-class-store.js
import Vue from 'vue'
import VueStore from 'vue-class-store'

Vue.use(VueStore.install)
```

```javascript
// nuxt.config.js
plugins: [
  '~/plugins/vue-class-store',
],
```

## Demo

### Vue

The demo folder compares various state management approaches; check `demo/src/examples/*` .

Class Store:

- [Basic Class Store](demo/src/examples/class-store/basic)
- [Inline Class Store](demo/src/examples/class-store/inline)
- [Class Store with Inheritance](demo/src/examples/class-store/inherit)
- [Global Class Store](demo/src/examples/class-store/global)

Alternatives:

- [Vue Component](demo/src/examples/other/vue-component)
- [Vue Model](demo/src/examples/other/vue-model)
- [Vuex](demo/src/examples/other/vuex)

To run the demo, clone the repo and install and run the `demo`:

```
git clone https://github.com/davestewart/vue-class-store.git
cd vue-class-store/demo
npm install
npm run demo
```

### Nuxt

Nuxt has its own demo here:

- https://github.com/davestewart/nuxt-class-store

## Development

The package has various scripts:

- `npm run dev` - build and watch for development
- `npm run build` - build for production
- `npm run demo` - run the demo
