import chai, {assert, expect} from 'chai';
import spies from 'chai-spies';
import VueStore from '../src';
import Vue, {nextTick, watch} from "vue";

chai.use(spies)

type C = { new(...args: any[]): {} }

function testStores(storeFunction: <T extends C>(constructor: T) => T) {
  it("`this` should be preserved when extending VueStore", () => {
    let constructedInstance: Store | null = null

    @storeFunction
    class Store extends VueStore {
      constructor() {
        super()
        constructedInstance = this
      }
    }

    let store = new Store()
    expect(constructedInstance).to.equal(store)
  });

  it("`this` should not be preserved when not extending VueStore", () => {
    let constructedInstance: Store | null = null

    @storeFunction
    class Store {
      constructor() {
        constructedInstance = this
      }
    }

    let store = new Store()
    expect(constructedInstance).to.not.equal(store)
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

      constructor() {
        this.declared = 20
        this['notDeclared'] = 30
      }
    }

    let store = new Store()
    store['late'] = 40

    let plainSpy = chai.spy()
    let declaredSpy = chai.spy()
    let notDeclaredSpy = chai.spy()
    let lateSpy = chai.spy()
    watch(() => store.plain, plainSpy)
    watch(() => store.declared, declaredSpy)
    watch(() => store['notDeclared'], notDeclaredSpy)
    watch(() => store['late'], lateSpy)

    store.plain = 100
    store.declared = 200
    store['notDeclared'] = 300
    store['late'] = 400

    await nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
    expect(declaredSpy).to.be.called.with(200, 20)
    expect(notDeclaredSpy).to.be.called.with(300, 30)
    expect(lateSpy).to.be.called.with(400, 40)
  });

  it("getters should be reactive", async () => {
    @storeFunction
    class Store {
      value = 10

      get plusTen() {
        return this.value + 10
      }
    }

    let store = new Store()

    let plusTenSpy = chai.spy()
    watch(() => store.plusTen, plusTenSpy)

    store.value = 100

    await nextTick()

    expect(plusTenSpy).to.be.called.with(110, 20)
  });

  it("methods should work", async () => {
    @storeFunction
    class Store {
      plain = 10

      changePlain() {
        this.plain = 100
      }
    }

    let store = new Store()

    let plainSpy = chai.spy()
    watch(() => store.plain, plainSpy)

    store.changePlain()

    await nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
  });
  it("watches should trigger", async () => {
    @storeFunction
    class Store {
      plain = 10
      deep = {value: 20}
      stringData = 'old'
      immediate = 30
      nesting = {value: 40}
      replace: object = {value: 50}
      syncValue = 30
      replaceWithMissing: object = {value: 10}
      replaceFromMissing: object = {}

      constructor(public spies: {
        plainSpy(...args),
        deepSpy(...args),
        immediateSpy(...args),
        syncSpy(...args),
        stringSpy(...args),
        nestingSpy(...args),
        replaceSpy(...args),
        nestedReplaceSpy(...args),
        nestedReplaceWithMissingSpy(...args),
        nestedReplaceFromMissingSpy(...args),
      }) {
      }

      stringChanged(...args) {
        this.spies.stringSpy(...args)
      }
      'on:stringData' = 'stringChanged'

      'on:plain'(...args) {
        this.spies.plainSpy(...args)
      }

      'on.deep:deep'(...args) {
        this.spies.deepSpy(...args)
      }

      'on.immediate:immediate'(...args) {
        this.spies.immediateSpy(...args)
      }

      'on.sync:syncValue'(...args) {
        this.spies.syncSpy(...args)
      }

      'on:nesting.value'(...args) {
        this.spies.nestingSpy(...args)
      }

      'on:replace'(...args) {
        this.spies.replaceSpy(...args)
      }

      'on:replace.value'(...args) {
        this.spies.nestedReplaceSpy(...args)
      }

      'on:replaceWithMissing.value'(...args) {
        this.spies.nestedReplaceWithMissingSpy(...args)
      }

      'on:replaceFromMissing.value'(...args) {
        this.spies.nestedReplaceFromMissingSpy(...args)
      }
    }

    let store = new Store({
      plainSpy: chai.spy(),
      deepSpy: chai.spy(),
      immediateSpy: chai.spy(),
      stringSpy: chai.spy(),
      nestingSpy: chai.spy(),
      replaceSpy: chai.spy(),
      nestedReplaceSpy: chai.spy(),
      syncSpy: chai.spy(),
      nestedReplaceWithMissingSpy: chai.spy(),
      nestedReplaceFromMissingSpy: chai.spy(),
    })
    let spies = store.spies

    expect(spies.immediateSpy).to.be.called.with(30)

    store.plain = 100
    store.deep.value = 200
    store.immediate = 300
    store.stringData = 'new'
    store.nesting.value = 400
    let original = store.replace
    let replacement = {value: 500}
    store.replace = replacement
    store.replaceWithMissing = {}
    store.replaceFromMissing = {value: 10}

    await nextTick()

    expect(spies.plainSpy).to.be.called.with(100, 10)
    expect(spies.deepSpy).to.be.called.with({value: 200}, {value: 200})
    expect(spies.immediateSpy).to.be.called.with(300, 30)
    expect(spies.stringSpy).to.be.called.with('new', 'old')
    expect(spies.nestingSpy).to.be.called.with(400, 40)
    expect(spies.replaceSpy).to.be.called.with(replacement, original)
    expect(spies.nestedReplaceSpy).to.be.called.with(500, 50)
    expect(spies.nestedReplaceWithMissingSpy).to.be.called.with(undefined, 10)
    expect(spies.nestedReplaceFromMissingSpy).to.be.called.with(10, undefined)

    store.syncValue = 300
    expect(spies.syncSpy).to.be.called.with(300, 30)
    store.syncValue = 3000
    expect(spies.syncSpy).to.be.called.with(3000, 300)
  });

  it("should not hold references", function(done) {
    this.timeout(5000)

    @storeFunction
    class Store {
      constructor(public prop: number) {}
    }

    let blackhole: (Store | null)[] = [null, null]
    let baseline = process.memoryUsage().heapUsed
    let didCollect = false // whether a net-negative GC pass was executed
    for (let i = 0; i < 20; i++) {
      let start = process.memoryUsage().heapUsed
      for(let j = 0; j < 10000; j++) {
        blackhole[j % 2] = new Store(j)
      }
      let end = process.memoryUsage().heapUsed
      if(end < start) {
        didCollect = true
        break
      }
    }
    if(!didCollect) {
      assert.fail('a net-negative GC pass should run when creating 200,000 stores')
    }
    done()
  })
}


describe("@VueStore", () => {
  testStores(VueStore)

  it("a store extending VueStore should be instanceof VueStore and itself", () => {
    class Store extends VueStore {}

    let store = new Store()
    expect(store).to.be.instanceof(VueStore)
    expect(store).to.be.instanceof(Store)
  });

  it("constructor name should match", () => {
    @VueStore
    class Store {}

    expect(Store.name).to.equal("Store")
  });

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

  it("instanceof should be preserved", () => {
    @VueStore
    class Store {}

    let store = new Store()
    expect(store).to.be.instanceof(Store)
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
