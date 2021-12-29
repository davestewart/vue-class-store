# Vue Class Store

> Universal Vue stores you write once and use anywhere

<p align="center">
  <img src="https://raw.githubusercontent.com/davestewart/vue-class-store/master/docs/logo.png" alt="Vue Class Store logo">
</p>

## Abstract

### So Vue, Vuex and Vue Class Store walk into a bar...

**Vue says:** "I'll give you reactivity, computed properties and watches, but only in components, only using a special objects-and-function schema, and I demand initial values be passed in from a parent component using props! I don't get along particularly well with TypeScript either, so good luck with figuring that one out, buddy"

**Vuex says:** "I'll give you global reactivity and computed properties, but I'm going to call them esoteric names and require you set them up globally with a convoluted schema, access them only through a centralised store, and I'll force you to make all updates through string-based paths, with different formats, helpers, terminology and best practices. I'll also make it difficult to go more than a couple of levels deep, and I'll give you watches but you'll hate them so probably best not to use those either"

**Vue Class Store says:** "I'll give you reactivity, computed properties and watches, written in standard JavaScript or TypeScript, with no setup or boilerplate, and you can use me anywhere"

*The end*

## Usage

### Installation

Install the package from NPM:

```bash
#vue 2
npm i vue-class-store@^2.0.0

#vue 3
npm i vue-class-store@^3.0.0
```

Yarn users, replace `npm i` with `yarn add`.

### Declaration

Write classes as normal, and add the decorator `@VueStore` to those you want to become reactive.

```typescript
import VueStore from 'vue-class-store'

@VueStore
export class Store {
  // any properties present after constructing your object are made reactive
  private value = 10
  name: string
  
  // construct your object like normal
  constructor(name: string) {
    this.name = 'reactive ' + name 
    // You can use `this` in the constructor, because
    // VueStore adds reactivity to the object in-place.
    setInterval(() => this.value++, 1000);
  }

  // You can't call $emit/$watch/etc. in your constructor, since your 
  // object isn't a fully-fledged Vue object yet, so the 'created' 
  // lifecycle hook is exposed for that purpose. Properties added here
  // will not be reactive.
  created() {
    this.$watch('name', () => { console.log('the name changed') })
  }

  // getters are converted to (cached) computed properties
  public get double(): number {
    return this.value * 2
  }

  // prefix properties/methods with `on:` to convert to watches.
  'on:value'() {
    console.log('value changed to:', this.value)
  }
  
  // you can add `.immediate` and/or `.deep` to set those watch flags
  'on.immediate:name'() {
    console.log('name is now:', this.name)
  }

  // you can drill into sub properties
  'on:some.other.value' = 'log'

  // methods work as normal
  log() {
    console.log('value is:', this.value)
  }
  
  // static properties and methods work
  static stuff = 100
  static doStuff() {
    console.log('doing things #' + stuff)
    stuff += 10
  }
}

// instanceof works
new Store() instanceof Store;

// your store behaves just like a `Vue` instance, including methods like $emit.
// however, you have to tell typescript that by creating an identically-named
// interface which extends `Vue`. You can't use any of them in your constructor 
// though, since your object isn't a fully-initialized Vue instance yet.
import Vue from 'vue'
interface Store extends Vue {}
```

### Instantiation

To use a store, simply instantiate the class.

You can do this outside of a component, and it will be completely reactive:

```typescript
const store = new Store(...)
```

Or you can instantiate within a component:

```javascript
export default {
  ...
  computed: {
    model () {
      return new Store(...)
    }
  }
}
```

Alternatively, you can make any non-decorated object reactive on the fly using the static `.create()` method:

```typescript
import VueStore from 'vue-class-store'

const store: Store = VueStore.create({someData: 10, otherData: 20, 'on:someData'() {...}})
```

## How it works

This is probably a good point to stop and explain what is happening under the hood. 

First we do some prep work. When and how exactly this happens depends on whether you use `@VueStore` or
`VueStore.create`, but whatever the method, the entire contents of `Vue.prototype` is merged into your prototype. This
makes your instances "look" just like `Vue`.

Your constructor is then called, returning your new object. `VueStore` intercepts the object, rips out all the data,
then turns around and tells Vue to initialize this (now empty) object as a Vue instance, passing it your data. Vue then
happily puts that data right back where it came from, but with added reactivity.

### `@VueStore`
`@VueStore` is able to frontload both the injection of `Vue.prototype` and collecting your prototype's methods to form
the basis of the options object sent to vue. It also does a couple `class`-specific things. It copies the static methods
and properties from the base class into itself, ensuring that statics continue to work, and sets its `prototype` to the
wrapped class's `prototype`, meaning `obj instanceof Store` still works.

### `VueStore.create`
`VueStore.create` differs somewhat in the way it injects `Vue.prototype`. Because we don't want to modify the entire
class of the object, we create a new "anonymous" prototype which extends the original one. We then inject vue into that
prototype, leaving the original intact.

## Inheritance

The decorator supports class inheritance meaning you can do things like this:

```typescript
class Rectangle {
  width = 0
  height = 0
  
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

Make sure you **don't inherit from another decorated class**. Initializing a vue instance adds tons of data to the
object, which will then wind up being fed into the next vue initializer, which will gum things up horribly.

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
      $products: new ProductsStore()
    }
  },
}
```

```javascript
export default {
  inject: [
    '$products'
  ],
  
  computed: {
    items () {
      return this.$products.items
    }
  },
  
  filterProducts (value) {
    this.$products.filter = value
  }
}
```

## Development

### Demo

The library has demos for Vue 2, Vue 3 and Nuxt, and can be found in the following repo:

- https://github.com/davestewart/vue-class-store-demos

### Scripts

The package uses Yarn, and has only two scripts, to build for development and production:

- `yarn dev` - build and watch for development
- `yarn build` - build for production

