<template>
  <div>
    <p>Independent global and local data working together, with no special setup</p>
    <hr>
    <p>Managing {{ model.items.length }} items ( {{ model.numSelected }} selected )</p>
    <button @click="model.addItem">Add Item</button>
    <button @click="model.toggleRandom">Toggle Random</button>
    <div class="items">
      <Item v-for="item in model.items" :model="item" />
    </div>
  </div>
</template>

<script>
import { ItemsStore } from './ItemsStore'
import Item from './Item.vue'

export default {
  name: 'GlobalClassStore',

  components: {
    Item: Item,
  },

  provide () {
    return {
      $store: this.model
    }
  },

  computed: {
    model () {
      return new ItemsStore(2)
    }
  },
}
</script>

<style>
#global pre {
  display: none
}
</style>
