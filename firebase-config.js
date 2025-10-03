import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1ShbTDoztdOWWEnFbTPAgW4mhKpdLIK4",
  authDomain: "mussa2030-35f77.firebaseapp.com",
  projectId: "mussa2030-35f77",
  storageBucket: "mussa2030-35f77.appspot.com",
  messagingSenderId: "267072856781",
  appId: "1:267072856781:web:22d84c86fc9d7f83657f84",
  measurementId: "G-8ZR4Y9GN6G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);