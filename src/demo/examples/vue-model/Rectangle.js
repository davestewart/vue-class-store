import Vue from 'vue'

export default Vue.extend({
  props: {
    width: {
      type: Number,
      default: 2
    },

    height: {
      type: Number,
      default: 2
    }
  },

  data () {
    return {
      model: {
        width: this.width,
        height: this.height,
      },
      logs: [],
    }
  },

  computed: {
    area () {
      return this.model.width * this.model.height
    }
  },

  watch: {
    area (area) {
      this.log(`Area is ${area.toFixed(2)}`)
    }
  },

  mounted () {
    this.log('Vue Model created!')
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
})
