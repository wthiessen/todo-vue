import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)
axios.defaults.baseURL = 'http://localhost/api'

export const store = new Vuex.Store({
  state: {
    loading: true,
    filter: 'all',
    todos: [
      // {
      //   id: 1,
      //   title: 'Finish vue screencast',
      //   completed: false,
      //   editing: false
      // },
      // {
      //   id: 2,
      //   title: 'take over world',
      //   completed: false,
      //   editing: false
      // }
    ]
  },
  getters: {
    remaining (state) {
      return state.todos.filter(todo => !todo.completed).length
    },
    anyRemaining (state, getters) {
      return getters.remaining != 0
    },
    todosFiltered (state) {
      if (state.filter == 'all') {
        return state.todos
      } else if (state.filter == 'active') {
        return state.todos.filter(todo => !todo.completed)
      } else if (state.filter == 'completed') {
        return state.todos.filter(todo => todo.completed)
      }
      return state.todos
    },
    showClearCompletedButton (state) {
      return state.todos.filter(todo => todo.completed).length > 0
    }
  },
  mutations: {
    addTodo (state, todo) {
      state.todos.push({
        id: todo.id,
        title: todo.title,
        completed: false,
        editing: false
      })
    },
    updateTodo (state, todo) {
      const index = state.todos.findIndex(item => item.id == todo.id)
      state.todos.splice(index, 1, {
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        editing: todo.editing
      })
    },
    deleteTodo (state, id) {
      const index = state.todos.findIndex(item => item.id == id)
      state.todos.splice(index, 1)
    },
    clearCompleted (state) {
      state.todos = state.todos.filter(todo => !todo.completed)
    },
    updateFilter (state, filter) {
      state.filter = filter
    },
    checkAll (state, checked) {
      console.log('checked!!', checked)
      state.todos.forEach(todo => (todo.completed = checked))
    },
    retrieveTodos (state, todos) {
      state.todos = todos
    }
  },
  actions: {
    addTodo (context, todo) {
      axios
        .post('http://localhost:8000/todos', {
          title: todo.title,
          completed: false
        })
        .then(response => {
          context.commit('addTodo', todo)
        })
        .catch(error => {
          console.log(error)
        })
    },
    updateTodo (context, todo) {
      axios
        .patch(`http://localhost:8000/todos/${todo.id}`, {
          title: todo.title,
          completed: todo.completed
        })
        .then(response => {
          context.commit('updateTodo', todo)
        })
        .catch(error => {
          console.log(error)
        })
    },
    deleteTodo (context, id) {
      axios
        .delete(`http://localhost:8000/todos/${id}`)
        .then(response => {
          context.commit('deleteTodo', id)
        })
        .catch(error => {
          console.log(error)
        })
    },
    clearCompleted (context, checked) {
      axios
        .delete(`http://localhost:8000/todosDeleteCompleted`)
        .then(response => {
          context.commit('clearCompleted', checked)
        })
        .catch(error => {
          console.log(error)
        })
    },
    updateFilter (context, filter) {
      context.commit('updateFilter', filter)
    },
    checkAll (context, checked) {
      axios
        .patch(`http://localhost:8000/todosAllChecked`)
        .then(response => {
          context.commit('checkAll', checked)
        })
        .catch(error => {
          console.log(error)
        })
    },
    retrieveTodos (context) {
      context.state.loading = true
      console.log(context.state.loading)
      axios
        .get('http://localhost:8000/todos')
        .then(response => {
          context.commit('retrieveTodos', response.data)
          context.state.loading = false
          console.log(context.state.loading)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
})
