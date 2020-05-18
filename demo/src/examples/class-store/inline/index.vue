<template>
  <div>
    <p>Convert any class into a reactive, computed store in one line</p>
    <CodeView>
      examples/class-store/inline/index.vue
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
import VueStore from 'vue-class-store'
import { Rectangle } from '../basic/Rectangle'

export default {
  name: 'InlineClassStore',

  computed: {
    model () {
      return VueStore.create(new Rectangle(20, 10))
    }
  },
}
</script>
