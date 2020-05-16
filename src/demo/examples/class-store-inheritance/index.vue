<template>
  <RectangleView
    name="Square"
    :width.sync="model.width"
    :height.sync="model.height"
    :area="model.area"
    :logs="model.logs"
    @randomize="model.randomize"
  />
</template>

<script>
import { SquareStore } from './Square'

export default {
  name: 'ClassStoreInheritanceExample',

  computed: {
    model () {
      return new SquareStore(20, 10)
    }
  },
}
</script>
