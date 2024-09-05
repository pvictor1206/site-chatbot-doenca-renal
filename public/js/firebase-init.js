import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importa o Firestore

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

// Inicializa o Firestore
const db = getFirestore(app); // Obtenha uma instância do Firestore

export { auth, db };