import firebase from 'firebase'
import 'firebase/firestore'

const config = {
  apiKey: 'AIzaSyBOP8FBalg586oiflqQG4y84RGAjlMQRQg',
  authDomain: 'todo-app-cc949.firebaseapp.com',
  databaseURL: 'https://todo-app-cc949.firebaseio.com',
  projectId: 'todo-app-cc949',
  storageBucket: 'todo-app-cc949.appspot.com',
  messagingSenderId: '968808580427'
}

const firebaseApp = firebase.initializeApp(config)

const firestore = firebaseApp.firestore()
firestore.settings({ timestampsInSnapshots: true })

export default firestore
