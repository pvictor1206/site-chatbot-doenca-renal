import { auth, db } from './firebase-init';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from "firebase/firestore"; // Funções do Firestore

// Função de logout
document.getElementById('logout-button').addEventListener('click', function() {
    signOut(auth).then(() => {
        // Redireciona para a página de login após logout
        window.location.href = 'auth.html';
    }).catch((error) => {
        console.error('Erro ao sair:', error);
    });
});

// Verifica o estado de autenticação do usuário ao carregar a página
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Se o usuário não está autenticado, redirecione para a página de login
        window.location.href = 'auth.html';
    } else {
        // O usuário está autenticado, pode acessar a página
        console.log('Usuário autenticado:', user);
        loadTableData(); // Carrega os dados existentes na tabela
    }
});

// Função para adicionar uma nova linha na tabela
document.getElementById('add-row-button').addEventListener('click', async function() {
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
        <td>
            <button class="delete-row-button">Excluir</button>
        </td>
    `;

    tableBody.appendChild(newRow);
    updateQuestionInputs(newRow.querySelector('.num-questions'));

    // Salva a nova linha no Firestore
    const docRef = await addDoc(collection(db, "tabelaRespostas"), {
        resposta: "",
        numeroDePerguntas: 1,
        perguntas: [""]
    });

    newRow.dataset.id = docRef.id; // Atribui o ID do documento à linha
    handleRowUpdates(newRow, docRef.id);
});

// Função para carregar dados existentes do Firestore na tabela
async function loadTableData() {
    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const tableBody = document.getElementById('table-body');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td><textarea placeholder="Resposta">${data.resposta}</textarea></td>
            <td>
                <select class="num-questions">
                    ${Array.from({ length: 40 }, (_, i) => `<option value="${i + 1}" ${i + 1 == data.numeroDePerguntas ? 'selected' : ''}>${i + 1}</option>`).join('')}
                </select>
            </td>
            <td class="questions-container">
                ${data.perguntas.map((pergunta, i) => `<input type="text" placeholder="Pergunta ${i + 1}" value="${pergunta}">`).join('')}
            </td>
            <td>
                <button class="delete-row-button">Excluir</button>
            </td>
        `;

        tableBody.appendChild(newRow);
        newRow.dataset.id = doc.id; // Atribui o ID do documento à linha
        updateQuestionInputs(newRow.querySelector('.num-questions'));
        handleRowUpdates(newRow, doc.id); // Função para lidar com as atualizações
    });
}

// Função para lidar com atualizações automáticas ao editar a linha
function handleRowUpdates(row, docId) {
    // Atualizar a resposta
    row.querySelector('textarea').addEventListener('input', async (e) => {
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            resposta: e.target.value
        });
    });

    // Atualizar o número de perguntas e as perguntas
    row.querySelector('.num-questions').addEventListener('change', async (e) => {
        const numPerguntas = parseInt(e.target.value);
        const perguntas = [];
        const questionsContainer = row.querySelector('.questions-container');
        
        // Atualiza o Firestore
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            numeroDePerguntas: numPerguntas,
            perguntas: perguntas
        });

        // Limpa as perguntas existentes e adiciona as novas
        questionsContainer.innerHTML = '';
        for (let i = 1; i <= numPerguntas; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Pergunta ${i}`;
            input.addEventListener('input', async function() {
                perguntas[i - 1] = input.value;
                await updateDoc(doc(db, "tabelaRespostas", docId), {
                    perguntas: perguntas
                });
            });
            questionsContainer.appendChild(input);
        }
    });

    // Função para excluir a linha
    row.querySelector('.delete-row-button').addEventListener('click', async () => {
        await deleteDoc(doc(db, "tabelaRespostas", docId)); // Deleta o documento no Firestore
        row.remove(); // Remove a linha da tabela
    });
}

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
