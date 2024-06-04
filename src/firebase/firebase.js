
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABfRH2bHKjk9qXhybvyfePzerHTdjeLTY",
  authDomain: "kvpublication-daat.firebaseapp.com",
  projectId: "kvpublication-daat",
  storageBucket: "kvpublication-daat.appspot.com",
  messagingSenderId: "527176238828",
  appId: "1:527176238828:web:91b4e6a5443b9c531507c9",
  measurementId: "G-61RC0BWNG9"
};


// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const storage = firebase.storage();

export { db, storage , firebaseApp};
