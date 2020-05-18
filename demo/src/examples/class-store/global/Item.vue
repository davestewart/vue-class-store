<template>
  <div class="item" :class="classes">
    <label>
      <input type="checkbox" :checked="isSelected" @change="toggleItem">
      {{ model.title }}
    </label>
  </div>
</template>

<script>
import { ItemModel } from './ItemsStore'

export default {
  inject: [
    '$store'
  ],

  props: {
    model: ItemModel
  },

  computed: {
    isSelected () {
      return this.$store.selectedIds.includes(this.model.id)
    },

    classes () {
      return {
        isSelected: this.isSelected
      }
    }
  },

  methods: {
    toggleItem () {
      this.$store.toggleItem(this.model.id)
    }
  }
}
</script>

<style>
.item {
  display: inline-block;
  margin: 3px;
  padding: .2em .6em;
  border-radius: 4px;
  background-color: #EEE;
  color: #0FA0CE;
}

.item.isSelected {
  background-color: #333;
  color: #FFF;
}

.item label,
.item input {
  margin: 0;
}
</style>
