<template>
  <div>
    <p>Verbose, proprietary, and often tricky model and accessor formats required to do even simple updates</p>
    <hr>
    <RectangleView
      :width="width"
      :height="height"
      :area="area"
      :logs="logs"
      @update:width="onWidth"
      @update:height="onHeight"
      @randomize="randomize"
    />
  </div>
</template>

<script>
export default {
  name: 'Vuex',

  computed: {
    width () {
      return this.$store.state.rectangle.width
    },

    height () {
      return this.$store.state.rectangle.height
    },

    logs () {
      return this.$store.state.rectangle.logs
    },

    area () {
      return this.$store.getters['rectangle/area']
    },
  },

  mounted () {
    this.log('Vuex Store created!')
  },

  methods: {
    randomize () {
      this.$store.dispatch('rectangle/randomize', [20, 10])
    },

    log (message) {
      this.$store.dispatch('rectangle/log', message)
    },

    onWidth (value) {
      this.$store.commit('rectangle/width', value)
    },

    onHeight (value) {
      this.$store.commit('rectangle/height', value)
    },
  },
}
</script>
