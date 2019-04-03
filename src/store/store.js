import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import db from '../firebase'

Vue.use(Vuex)

axios.defaults.baseURL = process.env.API_ENDPOINT

export const store = new Vuex.Store({
  state: {
    token: localStorage.getItem('access_token') || null,
    loading: true,
    filter: 'all',
    todos: []
  },
  getters: {
    loggedIn (state) {
      return state.token !== null
    },
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
        timestamp: new Date(),
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
      if (index >= 0) { state.todos.splice(index, 1) }
    },
    clearCompleted (state) {
      state.todos = state.todos.filter(todo => !todo.completed)
    },
    updateFilter (state, filter) {
      state.filter = filter
    },
    checkAll (state, checked) {
      state.todos.forEach(todo => (todo.completed = checked))
    },
    retrieveTodos (state, todos) {
      state.todos = todos
    },
    retrieveToken (state, token) {
      state.token = token
    },
    destroyToken (state) {
      state.token = null
    }
  },
  actions: {
    register (context, data) {
      return new Promise((resolve, reject) => {
        axios.post('/register', {
          name: data.name,
          email: data.email,
          password: data.password
        })
          .then(response => {
            resolve(response)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    destroyToken (context) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token

      if (context.getters.loggedIn) {
        return new Promise((resolve, reject) => {
          axios.post('/logout')
            .then(response => {
              localStorage.removeItem('access_token')
              context.commit('destroyToken')
              resolve(response)
            })
            .catch(err => {
              localStorage.removeItem('access_token')
              context.commit('destroyToken')
              reject(err)
            })
        })
      }
    },
    retrieveToken (context, credentials) {
      return new Promise((resolve, reject) => {
        axios.post('http://localhost:8000/oauth/token', {
          grant_type: process.env.API_GRANT_TYPE,
          client_id: process.env.API_CLIENT_ID,
          client_secret: process.env.API_CLIENT_SECRET,
          username: credentials.username,
          password: credentials.password
        })
          .then(response => {
            const token = response.data.access_token

            localStorage.setItem('access_token', token)
            context.commit('retrieveToken', token)
            resolve(response)
          })
          .catch(err => {
            console.log('err', err)
            reject(err)
          })
      })
    },
    // initRealtimeListeners (context) {
    //   db.collection('todos').onSnapshot(snapshot => {
    //     snapshot.docChanges().forEach(change => {
    //       if (change.type === 'added') {
    //         const source = change.doc.metadata.hasPendingWrites ? 'Local' : 'Server'
    //         if (source === 'Server') {
    //           context.commit('addTodo', {
    //             id: change.doc.id,
    //             title: change.doc.data().title,
    //             completd: false
    //           })
    //         }
    //       }
    //       if (change.type === 'modified') {
    //         context.commit('updateTodo', {
    //           id: change.doc.id,
    //           title: change.doc.data().title,
    //           completed: change.doc.data().completed
    //         })
    //       }
    //       if (change.type === 'removed') {
    //         context.commit('deleteTodo', change.doc.id)
    //       }
    //     })
    //   })
    // },
    addTodo (context, todo) {
      axios.post(`/todos`, {
        title: todo.title,
        completed: false
        // timestamp: new Date()
      })
        .then(response => {
          context.commit('addTodo', response.data)
        })
        .catch(err => {
          console.log(err)
        })
      // db.collection('todos')
      //   .add({
      //     title: todo.title,
      //     completed: false,
      //     timestamp: new Date()
      //   })
      //   .then(docRef => {
      //     context.commit('addTodo', {
      //       id: docRef.id,
      //       title: todo.title,
      //       completed: false
      //     })
      //   })
    },
    updateTodo (context, todo) {
      axios.patch(`/todos/${todo.id}`, {
        title: todo.title,
        completed: todo.completed
      })
        .then(response => {
          context.commit('updateTodo', response.data)
        })
        .catch(err => {
          console.log(err)
        })
      // db.collection('todos')
      //   .doc(todo.id)
      //   .set({
      //     // id: todo.id,
      //     title: todo.title,
      //     completed: todo.completed
      //     // timestamp: new Date()
      //   }, { merge: true })
      //   .then(() => {
      //     context.commit('updateTodo', todo)
      //   })
    },
    deleteTodo (context, id) {
      axios.delete(`/todos/${id}`)
        .then(response => {
          context.commit('deleteTodo', id)
        })
        .catch(err => {
          console.log(err)
        })
      // db.collection('todos')
      //   .doc(id)
      //   .delete()
      //   .then(() => {
      //     context.commit('deleteTodo', id)
      //   })
    },
    clearCompleted (context, checked) {
      const completed = store.state.todos
        .filter(todo => todo.completed)
        .map(todo => todo.id)

      axios.delete(`/todosDeleteCompleted`, {
        data: {
          todos: completed
        }
      })
        .then(response => {
          context.commit('clearCompleted')
        })
        .catch(err => {
          console.log(err)
        })

      // db.collection('todos')
      //   .where('completed', '==', true)
      //   .get()
      //   .then(querySnapshot => {
      //     querySnapshot.forEach(doc => {
      //       doc.ref.delete().then(() => {
      // context.commit('clearCompleted')
      //       })
      //     })
      //   })
    },
    updateFilter (context, filter) {
      context.commit('updateFilter', filter)
    },
    checkAll (context, checked) {
      axios.patch(`/todosCheckAll`, {
        completed: checked
      })
        .then(response => {
          context.commit('checkAll', checked)
        })
        .catch(err => {
          console.log(err)
        })

      // db.collection('todos')
      //   .get()
      //   .then(querySnapshot => {
      //     querySnapshot.forEach(doc => {
      //       doc.ref
      //         .update({
      //           completed: checked
      //         })
      //         .then(() => {
      //           context.commit('checkAll', checked)
      //         })
      //     })
      //   })
    },
    retrieveTodos (context) {
      axios.get('/todos')
        .then(response => {
          console.log(response.data)
          context.commit('retrieveTodos', response.data)
        })
        .catch(err => {
          console.log(err)
        })

      context.state.loading = false
      // db.collection('todos')
      //   .get()
      //   .then(querySnapshot => {
      //     let tempTodos = []
      //     querySnapshot.forEach(doc => {
      //       const data = {
      //         id: doc.id,
      //         title: doc.data().title,
      //         completed: doc.data().completed,
      //         timestamp: doc.data().timestamp
      //       }
      //       tempTodos.push(data)
      //     })
      //     context.state.loading = false
      // const tempTodosSorted = tempTodos.sort((a, b) => {
      //   return a.timestamp - b.timestamp
      // })

      // context.commit('retrieveTodos', tempTodosSorted)
      // })
    }
  }
})
