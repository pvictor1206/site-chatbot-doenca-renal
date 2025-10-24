// firebase-init.js

// Importa os módulos do Firebase a partir da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configurações do Firebase
const firebaseConfig = {
 
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializa o serviço de autenticação
const db = getFirestore(app); // Inicializa o Firestore

// Exporta os objetos para serem usados em outros módulos
export { auth, db };
