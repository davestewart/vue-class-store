<template>
  <RectangleView
    :width="width"
    :height="height"
    :area="area"
    :logs="logs"
    @update:width="onWidth"
    @update:height="onHeight"
    @randomize="randomize"
  />
</template>

<script>
export default {
  name: 'VuexExample',

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
