// Importando as funções necessárias do SDK Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const analytics = getAnalytics(app);

// Inicializa o serviço de autenticação
const auth = getAuth();

// Função de login
document.getElementById('login-button').addEventListener('click', function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('login-error');

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login bem-sucedido
            window.location.href = 'tabela.html';  // Redireciona para a próxima página
        })
        .catch((error) => {
            // Exibe a mensagem de erro
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Credenciais inválidas. Tente novamente.';
        });
});
