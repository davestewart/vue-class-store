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
import Rectangle from './Rectangle'

export default {
  name: 'ClassStoreExample',

  computed: {
    model () {
      return new Rectangle(20, 10)
    }
  },
}
</script>
