// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQWvrAm83z95OlGffXhupjbq56WYlF2KA",
  authDomain: "razak-4cc63.firebaseapp.com",
  databaseURL: "https://razak-4cc63-default-rtdb.firebaseio.com",
  projectId: "razak-4cc63",
  storageBucket: "razak-4cc63.appspot.com",
  messagingSenderId: "642042424650",
  appId: "1:642042424650:web:627ef2cb378ef375b6a5b3",
  measurementId: "G-BYXG8182FQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);