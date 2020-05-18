<template>
  <div>
    <p>Simple and intuitive reactive, computed, and watched properties, within a single, reusable, extensible model</p>
    <CodeView>
      examples/class-store/basic/index.vue
      examples/class-store/basic/Rectangle.ts
    </CodeView>
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
  name: 'BasicClassStore',

  computed: {
    model () {
      return new RectangleStore(20, 10)
    }
  },
}
</script>
