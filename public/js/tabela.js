import { auth } from './firebase-init';
import { onAuthStateChanged } from "firebase/auth";

// Função de logout
document.getElementById('logout-button').addEventListener('click', function() {
    auth.signOut().then(() => {
        // Redireciona para a página de login após logout
        window.location.href = 'auth.html';
    }).catch((error) => {
        console.error('Erro ao sair:', error);
    });
});

// Verifica o estado de autenticação do usuário ao carregar a página
auth.onAuthStateChanged((user) => {
  if (!user) {
      // Se o usuário não está autenticado, redirecione para a página de login
       window.location.href = 'auth.html';
  } else {
      // O usuário está autenticado, pode acessar a página
      console.log('Usuário autenticado:', user);
   }
});

// Verifica o estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redireciona para a página de login
        window.location.href = 'auth.html';
    }
});


document.getElementById('add-row-button').addEventListener('click', function() {
    const tableBody = document.getElementById('table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><textarea placeholder="Resposta"></textarea></td>
        <td>
            <select class="num-questions">
                ${Array.from({ length: 40 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
            </select>
        </td>
        <td class="questions-container">
            <input type="text" placeholder="Pergunta 1">
        </td>
    `;

    tableBody.appendChild(newRow);
    updateQuestionInputs(newRow.querySelector('.num-questions'));
});

// Atualiza as perguntas para cada linha quando o número de perguntas é alterado
function updateQuestionInputs(selectElement) {
    selectElement.addEventListener('change', function() {
        const numQuestions = parseInt(this.value);
        const questionsContainer = this.parentNode.nextElementSibling;

        // Limpa as perguntas existentes
        questionsContainer.innerHTML = '';

        // Adiciona novas perguntas com base na seleção
        for (let i = 1; i <= numQuestions; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Pergunta ${i}`;
            questionsContainer.appendChild(input);
        }
    });
}

// Aplica a função a todos os selects existentes ao carregar a página
document.querySelectorAll('.num-questions').forEach(updateQuestionInputs);
