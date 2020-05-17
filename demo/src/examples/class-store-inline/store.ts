import VueStore from 'vue-class-store'
import { Rectangle } from '../class-store/Rectangle'

// using a function here, because the router will load and execute this file before we get to install
export function makeStore (): Rectangle {
  return VueStore.create(new Rectangle(20, 10))
}
