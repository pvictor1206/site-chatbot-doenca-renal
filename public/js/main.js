import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

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
