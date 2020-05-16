import VueStore from '../../../lib'
import { Rectangle } from '../class-store/Rectangle'

export default class Square extends Rectangle {

  constructor (size) {
    super(size)
    this.update(size)
    this.log(`Class Store (Square) created!`)
  }

  'on:width' = 'update'

  'on:height' = 'update'

  randomize () {
    this.width = this.height = Math.random() * 20
  }

  update (value) {
    this.width = value
    this.height = value
  }
}

@VueStore
export class SquareStore extends Square {
}
