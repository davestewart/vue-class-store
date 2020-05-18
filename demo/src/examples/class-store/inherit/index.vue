<template>
  <div>
    <p>One class extends another's reactive, computed and watched properties, adding and modifying some of its own</p>
    <CodeView>
      examples/class-store/inherit/index.vue
      examples/class-store/inherit/Square.ts
      examples/class-store/basic/Rectangle.ts
    </CodeView>
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
  name: 'ClassStoreInheritance',

  computed: {
    model () {
      return new SquareStore(20)
    }
  },
}
</script>
