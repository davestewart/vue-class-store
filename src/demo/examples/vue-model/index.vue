<template>
  <div>
    <p>Logic and data moved into a factory, but that logic still requires a non standard format</p>
    <hr>
    <RectangleView
      :width.sync="model.width"
      :height.sync="model.height"
      :area="model.area"
      :logs="model.logs"
      @randomize="model.randomize"
    />
  </div>
</template>

<script>
import { makeRectangle } from './Rectangle'

export default {
  name: 'VueModelExample',

  computed: {
    model () {
      return makeRectangle(20, 10)
    }
  },
}
</script>
