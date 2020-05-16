<template>
  <RectangleView
    :width.sync="model.model.width"
    :height.sync="model.model.height"
    :area="model.area"
    :logs="model.logs"
    @randomize="model.randomize"
  />
</template>

<script>
import Rectangle from './Rectangle'

export default {
  name: 'VueComponentExample',

  computed: {
    model () {
      return new Rectangle({
        propsData: {
          width: 20,
          height: 10,
        }
      })
    }
  },
}
</script>
