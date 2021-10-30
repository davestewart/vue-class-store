import chai, {expect} from 'chai';
import spies from 'chai-spies';
import VueStore from '../src';
import Vue from "vue";

chai.use(spies)

type C = { new(...args: any[]): {} }

function testStores(storeFunction: <T extends C>(constructor: T) => T) {
  it("`this` should be preserved", () => {
    @storeFunction
    class Store {
      constructedInstance: Store

      constructor() {
        this.constructedInstance = this
      }
    }

    let store = new Store()
    expect(store.constructedInstance).to.equal(store)
  });

  it("the instance should be vue-like", () => {
    @storeFunction
    class Store {
    }

    let store = new Store()
    expect(store['$data']).to.exist
    expect(store['$options']).to.exist
    expect(store['$attrs']).to.exist
    expect(store['$listeners']).to.exist
    expect(store['$watch']).to.exist
    expect(store['$set']).to.exist
    expect(store['$delete']).to.exist
  });

  it("properties should be preserved", () => {
    @storeFunction
    class Store {
      plain = 10
      'quotes!' = 20
      declared: number

      constructor() {
        this.declared = 30
        this['notDeclared'] = 40
      }
    }

    let store = new Store()
    expect(store).to.include({plain: 10, 'quotes!': 20, declared: 30, notDeclared: 40})
  });

  it("properties should be reactive", async () => {
    @storeFunction
    class Store {
      plain = 10
      declared: number
      __private = -1

      constructor() {
        this.declared = 20
        this['notDeclared'] = 30
      }
    }

    interface Store extends Vue {
    }

    let store = new Store()
    store['late'] = 40

    let plainSpy = chai.spy()
    let declaredSpy = chai.spy()
    let notDeclaredSpy = chai.spy()
    let lateSpy = chai.spy()
    let privateSpy = chai.spy()
    store.$watch('plain', plainSpy)
    store.$watch('declared', declaredSpy)
    store.$watch('notDeclared', notDeclaredSpy)
    store.$watch('late', lateSpy)
    store.$watch('__private', privateSpy)

    store.plain = 100
    store.declared = 200
    store['notDeclared'] = 300
    store['late'] = 400
    store.__private = -10

    await store.$nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
    expect(declaredSpy).to.be.called.with(200, 20)
    expect(notDeclaredSpy).to.be.called.with(300, 30)
    expect(lateSpy).to.not.be.called()
    expect(privateSpy).to.not.be.called()
  });

  it("watches should trigger", async () => {
    @storeFunction
    class Store {
      plain = 10
      deep = {value: 20}
      immediate = 30

      constructor(
          private __spies: { plainSpy(...args), deepSpy(...args), immediateSpy(...args) }
      ) {
      }

      'on:plain'(...args) {
        this.__spies.plainSpy(...args)
      }

      'on:deep#deep'(...args) {
        this.__spies.deepSpy(...args)
      }

      'on:immediate#immediate'(...args) {
        this.__spies.immediateSpy(...args)
      }
    }

    interface Store extends Vue {
    }

    let plainSpy = chai.spy()
    let deepSpy = chai.spy()
    let immediateSpy = chai.spy()
    let store = new Store({plainSpy, deepSpy, immediateSpy})

    store.plain = 100
    store.deep.value = 200
    store.immediate = 300

    expect(immediateSpy).to.be.called.with(30)

    await store.$nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
    expect(deepSpy).to.be.called.with({value: 200}, {value: 200})
    expect(immediateSpy).to.be.called.with(300, 30)
  });
}


describe("@VueStore", () => {
  testStores(VueStore)

  it("statics should work", () => {
    @VueStore
    class Store {
      static prop = 10
      static bump() {
        this.prop += 10
      }
    }

    expect(Store.prop).to.equal(10)
    Store.bump()
    expect(Store.prop).to.equal(20)
  });
});

describe("VueStore.create", () => {
  testStores(<T extends C>(constructor: T) => {
        return function (...args: any[]) {
          return VueStore.create(new (constructor as C)(...args))
        } as unknown as T
      }
  )
});