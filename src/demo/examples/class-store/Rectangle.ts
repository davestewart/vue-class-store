import VueStore from '../../../lib'

export class Rectangle {
  public width: number

  public height: number

  public logs: string[] = []

  constructor(width = 2, height = 2)  {
    this.width = width
    this.height = height
    this.log(`Class Store created!`)
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
export class RectangleStore extends Rectangle {}
