<template>
  <RectangleView
    :width.sync="model.width"
    :height.sync="model.height"
    :area="model.area"
    :logs="model.logs"
    @randomize="model.randomize"
  />
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
