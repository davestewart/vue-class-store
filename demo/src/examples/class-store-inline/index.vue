<template>
  <div>
    <p>Convert any class into a reactive, computed store in one line</p>
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
import { makeStore } from './store'

export default {
  name: 'InlineClassStore',

  computed: {
    model () {
      return makeStore()
    }
  },
}
</script>
