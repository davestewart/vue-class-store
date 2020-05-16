<template>
  <div>
    <p>One class extends another's reactive, computed and watched properties, adding and modifying some of its own</p>
    <hr>
    <RectangleView
      name="Square"
      :width.sync="model.width"
      :height.sync="model.height"
      :area="model.area"
      :logs="model.logs"
      @randomize="model.randomize"
    />
  </div>
</template>

<script>
import { SquareStore } from './Square'

export default {
  name: 'ClassStoreInheritanceExample',

  computed: {
    model () {
      return new SquareStore(20)
    }
  },
}
</script>
