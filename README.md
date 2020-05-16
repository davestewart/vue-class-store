# Vue Class Store

> Zero-boilerplate class-based stores for Vue

## Abstract

#### Problem

Vue's system of reactive data, computed properties and watchers makes it very easy to write expressive code.

Unfortunately, to take advantage, you need to structure your data in a non-standard maner using the verbose Options format or even more verbose and structured Vuex schema and module setup.

This makes it very difficult to manage, rewrite, extend or refactor your logic and data once in, and introduces a lot of boilerplate, new concepts and so-called best practices. 

#### Solution

Vue Class Store is a one-liner TypeScript decorator or single ES6 helper function that makes any class fully reactive, with computed properties, watched properties and methods.

Converted classes can be used locally or globally, outside or inside components, or even nested in other stores and are fully compatible with the Vue ecosystem because they are converted into `Vue` instances.

Working with class stores is easy as they are *just* classes, which means you can even inherit from superclasses, and debugging and breakpoints work like you expect!

![devtools](https://raw.githubusercontent.com/davestewart/vue-class-store/master/docs/breakpoints.png)

#### Features

- Zero boilerplate
- Class-based syntax
- Reactive data, real computed properties and watches
- IDE, source panel / debugger and devtools friendly
- Inherit from multiple classes
- Pass parameters in constructors

## Installation

#### Setup

Install from NPM:

```bash
npm i vue-class-store
```

```bash
yarn add vue-class-store
```

## Usage

#### Declaration

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

#### Instantiation

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

#### Inheritance

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

Make sure you don't inherit from another decorated class, because when created, it will no longer be a class instance, but a Vue instance, with all its properties already created:

```typescript
// don't do this!

@VueStore
class Rectangle { }

@VueStore
class Square extends Rectangle { }
```

If you need to keep the original Rectangle and Square classes as vanilla classes, create a final store class that leaves the original classes untouched:

```typescript
class Rectangle { }
class Square extends Rectangle { }

@VueStore
class SquareStore extends Square { } 
```

#### Global / shared state

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

There is a demo folder to compare code; look in `src/demo/examples/*` to compare the code for Vue Class Store compared to other state management approaches:

- [Class Store](./src/demo/examples/class-store)
- [Class Store Inheritance](./src/demo/examples/class-store-inheritance)
- [Vue Component](./src/demo/examples/vue-component)
- [Vue Model](./src/demo/examples/vue-model)
- [Vuex](./src/demo/examples/vuex)

Run the demo with:

```
npm run demo
```

