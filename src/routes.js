import App from './App'
import LandingPage from './components/marketing/LandingPage'
import About from './components/marketing/About'
import TestTodosVariable from './components/marketing/TestTodosVariable'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

const routes = [
  { path: '/', name: 'home', component: LandingPage },
  { path: '/about', name: 'about', component: About },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/todo', name: 'todo', component: App },
  { path: '/todo/:id', name: 'todos', component: TestTodosVariable }
]

export default routes
