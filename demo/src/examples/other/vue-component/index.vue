<template>
  <div>
    <p>All logic and data needs to be baked into the visual component itself</p>
    <CodeView>
      examples/other/vue-component/index.vue
    </CodeView>
    <hr>
    <RectangleView
      :width.sync="width"
      :height.sync="height"
      :area="area"
      :logs="logs"
      @randomize="randomize"
    />
  </div>
</template>

<script>

export default {
  name: 'VueComponent',

  data () {
    return {
      width: 20,
      height: 20,
      logs: []
    }
  },

  computed: {
    area () {
      return this.width * this.height
    }
  },

  watch: {
    area (value) {
      this.log(`Area is ${value}`)
    }
  },

  created () {
    this.log(`Vue Component created!`)
  },

  methods: {
    randomize () {
      this.width = Math.random() * 20
      this.height = Math.random() * 10
    },

    log (message) {
      this.logs.push(`${new Date().toISOString().match(/\d{2}:\d{2}:\d{2}/)}: ${message}`)
    }
  }
}
</script>
