import VueStore from 'vue-class-store'

let id = 1

export class ItemModel {
  public id: number
  public title: string

  constructor () {
    this.id = id++
    this.title = `Item ${this.id}`
  }
}

@VueStore
export class ItemsStore {
  public items: ItemModel[] = []

  public selectedIds: number[] = []

  constructor(numItems: number = 0)  {
    for (let i = 0; i < numItems; i++) {
      this.addItem()
    }
  }

  get numSelected () {
    return this.selectedIds.length
  }

  addItem () {
    this.items.push(new ItemModel())
  }

  toggleRandom () {
    const item = this.items[Math.floor(Math.random() * this.items.length)]
    this.toggleItem(item.id)
  }

  toggleItem (id: number) {
    const index = this.selectedIds.indexOf(id)
    index === -1
      ? this.selectedIds.push(id)
      : this.selectedIds.splice(index, 1)
  }
}
