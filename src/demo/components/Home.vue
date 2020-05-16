<template>
  <div>
    <h4>Examples:</h4>
    <ul>
      <li v-for="route in routes":key="route.path">
        <router-link :to="route.path">{{ route.meta.title }}</router-link>
      </li>
    </ul>

    <h4>Intro</h4>
    <p>This demo shows 4 examples of modeling and presenting data in Vue.</p>
    <p>Each example uses a single strategy, and models a rectangle model, including:</p>
    <ul>
      <li>Width and height props / parameters</li>
      <li>Area computed / getter property</li>
      <li>Watched area property</li>
      <li>Randomize method</li>
      <li>Log method</li>
    </ul>
    <p>Look in the <code>src/demo/examples/*</code> folder to compare the code.</p>
    <p>Make sure to check both the view and the model files within each!</p>
  </div>
</template>

<script>
import { getRoutes } from '../router'

export default {
  name: 'VueClassStoreDemo',

  computed: {
    routes () {
      return getRoutes()
    }
  },
}

</script>

<style lang="scss">

</style>
