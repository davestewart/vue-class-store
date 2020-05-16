<template>
  <div>
    <p>Simple and intuitive reactive, computed, and watched properties, all within a single model.</p>
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
import { RectangleStore } from './Rectangle'

export default {
  name: 'ClassStoreExample',

  computed: {
    model () {
      return new RectangleStore(20, 10)
    }
  },
}
</script>
