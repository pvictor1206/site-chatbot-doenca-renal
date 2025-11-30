// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACe0H1mia7FrM3_3C131adLwV1BVVGCvQ",
  authDomain: "chat-doenca-renal.firebaseapp.com",
  projectId: "chat-doenca-renal",
  storageBucket: "chat-doenca-renal.appspot.com",
  messagingSenderId: "378280331607",
  appId: "1:378280331607:web:1ed58036b69356b1655612",
  measurementId: "G-2VFMSCE9BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);