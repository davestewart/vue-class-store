import chai, {assert, expect} from 'chai';
import spies from 'chai-spies';
import VueStore from '../src';
import Vue, {nextTick, watch} from "vue";

chai.use(spies)

type C = { new(...args: any[]): {} }

function testStores(storeFunction: <T extends C>(constructor: T) => T) {
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
      stringData = 'old'

      constructor(
          private __spies: { plainSpy(...args), stringSpy(...args) }
      ) {
      }

      stringChanged(...args) {
        this.__spies.stringSpy(...args)
      }

      'on:stringData' = 'stringChanged'

      'on:plain'(...args) {
        this.__spies.plainSpy(...args)
      }
    }

    let plainSpy = chai.spy()
    let stringSpy = chai.spy()
    let store = new Store({plainSpy, stringSpy})

    store.plain = 100
    store.stringData = 'new'

    await nextTick()

    expect(plainSpy).to.be.called.with(100, 10)
    expect(stringSpy).to.be.called.with('new', 'old')
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
});

describe("VueStore.create", () => {
  testStores(<T extends C>(constructor: T) => {
        return function (...args: any[]) {
          return VueStore.create(new (constructor as C)(...args))
        } as unknown as T
      }
  )
});
