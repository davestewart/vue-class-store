const state = function () {
  return {
    width: 2,
    height: 2,
    logs: []
  }
}

const actions = {
  randomize ({ commit }, [width, height]) {
    commit('width', Math.random() * width)
    commit('height', Math.random() * height)
  },

  log ({ commit }, value) {
    commit('logs', value)
  }
}

const getters = {
  area (state) {
    return state.width * state.height
  }
}

const mutations = {
  width (state, value) {
    state.width = value
  },

  height (state, value) {
    state.height = value
  },

  logs (state, message) {
    state.logs.push(`${new Date().toISOString().match(/\d{2}:\d{2}:\d{2}/)}: ${message}`)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
