import VueStore from 'vue-class-store'

export class Rectangle {
  public width: number

  public height: number

  public logs: string[] = []

  constructor(width = 2, height = 2)  {
    this.width = width
    this.height = height
    this.log(`Rectangle constructor called!`)
  }

  get area () {
    return this.width * this.height
  }

  'on:area' (value) {
    this.log(`Area is ${value}`)
  }

  randomize () {
    this.width = Math.random() * 20
    this.height = Math.random() * 10
  }

  log (message) {
    this.logs.push(`${new Date().toISOString().match(/\d{2}:\d{2}:\d{2}/)}: ${message}`)
  }
}

@VueStore
export class RectangleStore extends Rectangle {
  // there's no need to provide a constructor here, this is just to log some output
  constructor (width, height) {
    super(width, height);
    this.log(`RectangleStore constructor called!`)
  }
}
