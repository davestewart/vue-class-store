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
  name: 'VueModelExample',

  computed: {
    model () {
      return new Rectangle({propsData: {
        width: 20,
        height: 10,
      }})
    }
  },
}
</script>
