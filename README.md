# Vue Class Store

> Zero-boilerplate class-based stores for Vue

## Abstract

### Problem

Vue's system of reactive data, computed properties and watchers makes it very easy to write expressive code.

Unfortunately, to take advantage, you need to structure your data in a non-standard maner using the verbose Options format or even more verbose and structured Vuex schema and module setup.

This makes it very difficult to manage, rewrite, extend or refactor your logic and data once in, and introduces a lot of boilerplate, new concepts and so-called best practices. 

### Solution

Vue Class Store is a one-liner TypeScript decorator or single ES6 helper function that makes any class fully reactive, with computed properties, watches and methods.

Converted classes can be used locally or globally, outside or inside components, or even nested in other stores and are fully compatible with the Vue ecosystem because they are converted into `Vue` instances.

Working with class stores is easy as they are *just* classes, which means you can even inherit from superclasses, and debugging and breakpoints work like you expect!

![devtools](https://raw.githubusercontent.com/davestewart/vue-class-store/master/dev/devtools.png)

### Features

- Zero boilerplate
- Reactive data, computed properties and watches
- Class-based syntax
- Proper inheritance
- IDE / DevTools friendly

## Installation

### Setup

Install from NPM:

```bash
npm i vue-class-store
```

```bash
yarn add vue-class-store
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

Behind the scenes, the decorator will convert the class to a new Vue instance and return it.

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

Wherever you do it, the decorator will return a new `Vue` instance, but your IDE will think it's an instance of the original class, and it will have *exactly* the same properties.

### Inheritance

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

### Global / shared state

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

## Demo

The demo folder compares various state management approaches; check `demo/src/examples/*` :

- [Basic Class Store](./src/demo/examples/class-store)
- [Class Store with Inheritance](./src/demo/examples/class-store-inheritance)
- [Global Class Store](./src/demo/examples/class-store-global)
- [Vue Component](./src/demo/examples/vue-component)
- [Vue Model](./src/demo/examples/vue-model)
- [Vuex](./src/demo/examples/vuex)

To run the demo, clone the repo and run the `demo` script:

```
git clone https://github.com/davestewart/vue-class-store.git
cd vue-class-store/demo
npm install
npm run demo
```
