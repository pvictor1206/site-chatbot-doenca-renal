// firebase-init.js

// Importa os módulos do Firebase a partir da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyACe0H1mia7FrM3_3C131adLwV1BVVGCvQ",
  authDomain: "chat-doenca-renal.firebaseapp.com",
  projectId: "chat-doenca-renal",
  storageBucket: "chat-doenca-renal.appspot.com",
  messagingSenderId: "378280331607",
  appId: "1:378280331607:web:1ed58036b69356b1655612",
  measurementId: "G-2VFMSCE9BP"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializa o serviço de autenticação
const db = getFirestore(app); // Inicializa o Firestore

// Exporta os objetos para serem usados em outros módulos
export { auth, db };
