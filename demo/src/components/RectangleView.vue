<template>
  <div class="rectangle">
    <p>{{ name }}, area: <output>{{ area }}</output></p>
    <input type="number" :value="width" @input="e => $emit('update:width', Number(e.target.value))">
    <input type="number" :value="height" @input="e => $emit('update:height', Number(e.target.value))">
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
    name: {
      type: String,
      default: 'Rectangle'
    },
  }
}
</script>
