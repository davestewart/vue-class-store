<template>
  <div>
    <h4>Examples</h4>
    <section v-for="folder in folders" :key="folder.title">
      <p>{{ folder.title }}</p>
      <ul>
        <li v-for="route in folder.routes":key="route.path">
          <router-link :to="route.path">{{ route.meta.title }}</router-link>
        </li>
      </ul>
    </section>

    <h4>Intro</h4>
    <p>This demo compares various state management approaches.</p>
    <p>Each example uses a single methodology to model a rectangle with the following common functionality:</p>
    <ul>
      <li><strong>Width</strong> and <strong>height</strong> props / parameters</li>
      <li>Computed / getter <strong>area</strong> property</li>
      <li>A watch on the area property</li>
      <li>A <strong>logs</strong> property and <strong>log</strong> method</li>
      <li>A <strong>randomize</strong> method</li>
    </ul>
    <p>Look in the <code>demo/src/examples/*</code> folder to compare the code.</p>
    <p>Make sure to check both the view and the model files within each!</p>
  </div>
</template>

<script>
import { getRoutes } from '../router'

export default {
  name: 'VueClassStoreDemo',

  computed: {
    folders () {
      return getRoutes().reduce((folders, route) => {
        const folder = route.meta.folder
        if (!folders[folder]) {
          folders[folder] = {
            title: folder.replace(/\W/g, ' ').replace(/\w/, c =>c.toUpperCase()),
            routes: []
          }
        }
        folders[folder].routes.push(route)
        return folders
      }, {})

    }
  },
}

</script>
