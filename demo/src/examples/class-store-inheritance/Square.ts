import VueStore from 'vue-class-store'
import { Rectangle } from '../class-store/Rectangle'

export class Square extends Rectangle {

  constructor (size) {
    super(size)
    this.update(size)
    this.log(`Square constructor called!`)
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
  // there's no need to provide a constructor here, this is just to log some output
  constructor (size) {
    super(size);
    this.log(`SquareStore constructor called!`)
  }
}
