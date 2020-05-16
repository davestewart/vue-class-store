import Vue from 'vue'

export function makeRectangle (width, height) {
  return new Vue({
    data () {
      return {
        width: width,
        height: height,
        logs: [],
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
}
