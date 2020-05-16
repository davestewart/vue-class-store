<template>
  <div class="rectangle">
    <p>Rectangle, area: <output>{{ area }}</output></p>
    <input type="number" v-model="width" @input="e => $emit('update', e.value)">
    <input type="number" v-model="height" @input="e => $emit('update', e.value)">
    <button @click="$emit('randomize')">Randomize</button>
    <pre>{{ logs.join('\n') }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    width: Number,
    height: Number,
    area: Number,
    logs: Array,
  }
}
</script>

<style>

</style>
