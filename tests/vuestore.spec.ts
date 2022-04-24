import chai, {assert, expect} from 'chai';
import spies from 'chai-spies';
import VueStore from '../src';
import Vue, {nextTick, reactive, watch} from "vue";

chai.use(spies)

function spy(): (...args) => void {
  return chai.spy()
}

type C = { new(...args: any[]): {} }

function testStores(storeFunction: <T extends C>(constructor: T) => T, shallow: boolean) {
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

  it("`this` should be preserved when extending VueStore.Shallow", () => {
    let constructedInstance: Store | null = null

    @storeFunction
    class Store extends VueStore.Shallow {
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

    let plainSpy = spy()
    let declaredSpy = spy()
    let notDeclaredSpy = spy()
    let lateSpy = spy()
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

  it("methods should work", async () => {
    @storeFunction
    class Store {
      plain = 10

      changePlain() {
        this.plain = 100
      }
    }

    let store = new Store()

    let plainSpy = spy()
    watch(() => store.plain, plainSpy)

    store.changePlain()

    await nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
  });

  it("watches should trigger", async () => {
    let spies = {
      plainSpy: spy(),
      deepSpy: spy(),
      immediateSpy: spy(),
      indirectStringSpy: spy(),
      instanceFunctionSpy: spy(),
      nestingSpy: spy(),
      replaceSpy: spy(),
      nestedReplaceSpy: spy(),
      syncSpy: spy(),
      nestedReplaceWithMissingSpy: spy(),
      nestedReplaceFromMissingSpy: spy(),
      explicitNestedSpy: spy(),
      unwatchedGetterSpy: spy(),
      watchedGetterSpy: spy(),
      getterWatchSpy: spy(),
    }

    @storeFunction
    class Store {
      plain = 10
      deep = {value: 20}
      indirectStringData = 'old'
      instanceFunctionData = 'old'
      immediate = 30
      nesting = {value: 40}
      replace: object = {value: 50}
      syncValue = 30
      replaceWithMissing: object = {value: 10}
      replaceFromMissing: object = {}
      explicitNested = reactive({value: 60})

      get watchedGetter() {
        spies.watchedGetterSpy(this.plain)
        return `${this.plain}`
      }

      get unwatchedGetter() {
        spies.unwatchedGetterSpy(this.plain)
        return `${this.plain}`
      }

      'on:indirectStringData' = 'indirectStringChanged'
      indirectStringChanged(...args) {
        spies.indirectStringSpy(...args)
      }

      'on:instanceFunctionData' = (...args) => spies.instanceFunctionSpy(...args)

      'on:plain'(...args) {
        spies.plainSpy(...args)
      }

      'on.deep:deep'(...args) {
        spies.deepSpy(...args)
      }

      'on.immediate:immediate'(...args) {
        spies.immediateSpy(...args)
      }

      'on.sync:syncValue'(...args) {
        spies.syncSpy(...args)
      }

      'on:nesting.value'(...args) {
        spies.nestingSpy(...args)
      }

      'on:replace'(...args) {
        spies.replaceSpy(...args)
      }

      'on:replace.value'(...args) {
        spies.nestedReplaceSpy(...args)
      }

      'on:replaceWithMissing.value'(...args) {
        spies.nestedReplaceWithMissingSpy(...args)
      }

      'on:replaceFromMissing.value'(...args) {
        spies.nestedReplaceFromMissingSpy(...args)
      }

      'on:explicitNested.value'(...args) {
        spies.explicitNestedSpy(...args)
      }

      'on:watchedGetter'(...args) {
        spies.getterWatchSpy(...args)
      }
    }

    let store = new Store()

    expect(spies.immediateSpy).to.be.called.with(30)
    expect(spies.watchedGetterSpy, 'watched getter never accessed').to.be.called.with(10)
    expect(spies.unwatchedGetterSpy, 'unwatched getter never accessed').not.to.be.called()

    store.plain = 100
    store.deep.value = 200
    store.immediate = 300
    store.indirectStringData = 'new'
    store.instanceFunctionData = 'new'
    store.nesting.value = 400
    let original = store.replace
    let replacement = {value: 500}
    store.replace = replacement
    store.replaceWithMissing = {}
    store.replaceFromMissing = {value: 10}
    store.explicitNested.value = 70

    await nextTick()

    expect(spies.plainSpy, 'plain').to.be.called.with(100, 10)
    expect(spies.immediateSpy, 'immediate').to.be.called.with(300, 30)
    expect(spies.indirectStringSpy, 'indirectString').to.be.called.with('new', 'old')
    expect(spies.instanceFunctionSpy, 'instanceFunction').to.be.called.with('new', 'old')
    expect(spies.replaceSpy, 'replace').to.be.called.with(replacement, original)
    expect(spies.nestedReplaceSpy, 'nestedReplace').to.be.called.with(500, 50)
    expect(spies.nestedReplaceWithMissingSpy, 'nestedReplaceWithMissing').to.be.called.with(undefined, 10)
    expect(spies.nestedReplaceFromMissingSpy, 'nestedReplaceFromMissing').to.be.called.with(10, undefined)
    expect(spies.explicitNestedSpy, 'explicit nested reactive({})').to.be.called.with(70, 60)
    expect(spies.watchedGetterSpy, 'watched getter changed never accessed').to.be.called.with(100)
    expect(spies.unwatchedGetterSpy, 'unwatched getter changed never accessed').not.to.be.called()
    expect(spies.getterWatchSpy, 'getter watch').to.be.called.with('100', '10')

    if(shallow) {
      expect(spies.deepSpy, 'deep').not.to.be.called()
      expect(spies.nestingSpy, 'nesting').not.to.be.called()
    } else {
      expect(spies.deepSpy, 'deep').to.be.called.with({value: 200}, {value: 200})
      expect(spies.nestingSpy, 'nesting').to.be.called.with(400, 40)
    }

    store.syncValue = 300
    expect(spies.syncSpy, 'sync').to.be.called.with(300, 30)
    store.syncValue = 3000
    expect(spies.syncSpy, 'sync').to.be.called.with(3000, 300)
  });

  // disabled as this depends on GC behavior and thus is unreliable
  xit("should not hold references", function(done) {
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

function testExtends(storeFunction: <T extends C>(constructor: T) => T, shallow: boolean) {
  it("a store extending VueStore should be instanceof VueStore and itself", () => {
    class Store extends VueStore {}

    let store = new Store()
    expect(store).to.be.instanceof(VueStore)
    expect(store).to.be.instanceof(Store)
  });

  it("constructor name should match", () => {
    @storeFunction
    class Store {}

    expect(Store.name).to.equal("Store")
  });

  it("statics should work", () => {
    @storeFunction
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
    @storeFunction
    class Store {}

    let store = new Store()
    expect(store).to.be.instanceof(Store)
  });
}

function testCreate(storeFunction: <T extends object>(instance: T) => T, shallow: boolean) {
}

describe("@VueStore", () => {
  testStores(VueStore, false)
  testExtends(VueStore, false)
});

describe("@VueStore.Shallow", () => {
  testStores(VueStore.Shallow, true)
  testExtends(VueStore.Shallow, true)
});

describe("VueStore.create", () => {
  testStores(
      <T extends C>(constructor: T) => {
        return function (...args: any[]) {
          return VueStore.create(new (constructor as C)(...args))
        } as unknown as T
      },
      false
  )
  testCreate(VueStore.create, false)
});

describe("VueStore.Shallow.create", () => {
  testStores(
      <T extends C>(constructor: T) => {
        return function (...args: any[]) {
          return VueStore.Shallow.create(new (constructor as C)(...args))
        } as unknown as T
      },
      true
  )
  testCreate(VueStore.Shallow.create, false)
});
