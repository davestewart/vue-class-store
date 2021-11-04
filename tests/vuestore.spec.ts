import chai, {assert, expect} from 'chai';
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
    store.$watch('plain', plainSpy)
    store.$watch('declared', declaredSpy)
    store.$watch('notDeclared', notDeclaredSpy)
    store.$watch('late', lateSpy)

    store.plain = 100
    store.declared = 200
    store['notDeclared'] = 300
    store['late'] = 400

    await store.$nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
    expect(declaredSpy).to.be.called.with(200, 20)
    expect(notDeclaredSpy).to.be.called.with(300, 30)
    expect(lateSpy).to.not.be.called()
  });

  it("watches should trigger", async () => {
    @storeFunction
    class Store {
      plain = 10
      deep = {value: 20}
      immediate = 30

      constructor(
          private spies: { plainSpy(...args), deepSpy(...args), immediateSpy(...args) }
      ) {
      }

      'on:plain'(...args) {
        this.spies.plainSpy(...args)
      }

      'on:deep#deep'(...args) {
        this.spies.deepSpy(...args)
      }

      'on:immediate#immediate'(...args) {
        this.spies.immediateSpy(...args)
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

  it("instanceof should be preserved", () => {
    @VueStore
    class Store {}

    let store = new Store()
    expect(store).to.be.instanceof(Store)
  });

  it("should not hold references", function(done) {
    this.timeout(5000)

    @VueStore
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
});

describe("VueStore.create", () => {
  testStores(<T extends C>(constructor: T) => {
        return function (...args: any[]) {
          return VueStore.create(new (constructor as C)(...args))
        } as unknown as T
      }
  )
});
