import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Função de logout
document.getElementById('logout-button').addEventListener('click', function() {
    signOut(auth).then(() => {
        window.location.href = 'auth.html';
    }).catch((error) => {
        console.error('Erro ao sair:', error);
    });
});

// Verifica o estado de autenticação do usuário ao carregar a página
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'auth.html';
    } else {
        console.log('Usuário autenticado:', user);
        loadTableData(); // Carrega os dados existentes
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
            <select class="extra-info">
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
            </select>
        </td>
        <td class="extra-info-container">
            <textarea placeholder="Informação Extra"></textarea>
        </td>
        <td>
            <select class="resposta-encaminhada">
                <option value="">Selecione</option>
            </select>
        </td>
        <td>
            <button class="delete-row-button">Excluir</button>
        </td>
    `;

    tableBody.appendChild(newRow);
    updateQuestionInputs(newRow.querySelector('.num-questions'));
    handleExtraInfo(newRow.querySelector('.extra-info'), newRow.querySelector('.extra-info-container'));

    const docRef = await addDoc(collection(db, "tabelaRespostas"), {
        resposta: "",
        numeroDePerguntas: 1,
        perguntas: [""],
        extraInfo: "",
        temExtraInfo: "nao",
        respostaEncaminhada: "",
        timestamp: new Date()  // Adiciona a data e hora de envio
    });

    newRow.dataset.id = docRef.id;
    handleRowUpdates(newRow, docRef.id);
    updateDropdown(); // Atualiza o dropdown com as respostas disponíveis
});

// Função para carregar dados existentes do Firestore na tabela em ordem cronológica
async function loadTableData() {
    const q = query(collection(db, "tabelaRespostas"), orderBy("timestamp", "asc"));  // Ordena por timestamp
    const querySnapshot = await getDocs(q);
    
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
                <select class="extra-info">
                    <option value="nao" ${data.temExtraInfo === "nao" ? "selected" : ""}>Não</option>
                    <option value="sim" ${data.temExtraInfo === "sim" ? "selected" : ""}>Sim</option>
                </select>
            </td>
            <td class="extra-info-container ${data.temExtraInfo === "sim" ? "visible" : ""}">
                <textarea placeholder="Informação Extra">${data.extraInfo}</textarea>
            </td>
            <td>
                <select class="resposta-encaminhada">
                    <option value="">Selecione</option>
                    ${getDropdownOptions(data.respostaEncaminhada)}
                </select>
            </td>
            <td>
                <button class="delete-row-button">Excluir</button>
            </td>
        `;

        tableBody.appendChild(newRow);
        newRow.dataset.id = doc.id;

        updateQuestionInputs(newRow.querySelector('.num-questions'));
        handleExtraInfo(newRow.querySelector('.extra-info'), newRow.querySelector('.extra-info-container'));
        handleRowUpdates(newRow, doc.id);
    });
    updateDropdown();  // Atualiza o dropdown de respostas
}

// Função para gerar as opções do dropdown e selecionar a correta
async function getDropdownOptions(selectedValue) {
    let options = '<option value="">Selecione</option>';
    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    const respostas = querySnapshot.docs.map((doc) => doc.data().resposta);

    respostas.forEach((resposta) => {
        if (resposta === selectedValue) {
            options += `<option value="${resposta}" selected>${resposta}</option>`;
        } else {
            options += `<option value="${resposta}">${resposta}</option>`;
        }
    });
    return options;
}


// Função para lidar com as mudanças do campo "Extra Info"
function handleExtraInfo(selectElement, extraInfoContainer) {
    selectElement.addEventListener('change', function() {
        if (this.value === "sim") {
            extraInfoContainer.classList.add('visible');
        } else {
            extraInfoContainer.classList.remove('visible');
        }
    });
}

// Função para lidar com atualizações automáticas ao editar a linha
function handleRowUpdates(row, docId) {
    let perguntas = [];  // Declarar o array de perguntas aqui

    row.querySelector('textarea').addEventListener('blur', debounce(async (e) => {
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            resposta: e.target.value
        });
        updateDropdown();
    }, 500));

    row.querySelector('.num-questions').addEventListener('change', async (e) => {
        const numPerguntas = parseInt(e.target.value);
        const questionsContainer = row.querySelector('.questions-container');

        // Redefinir o array `perguntas`, preservando as já preenchidas
        perguntas = perguntas.slice(0, numPerguntas);  // Mantém as perguntas já preenchidas até o limite

        // Se o número de perguntas for maior que o atual, preenche o array com strings vazias
        if (perguntas.length < numPerguntas) {
            perguntas = perguntas.concat(Array(numPerguntas - perguntas.length).fill(''));
        }

        // Limpa o container e adiciona as perguntas existentes ou vazias
        questionsContainer.innerHTML = '';
        for (let i = 1; i <= numPerguntas; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Pergunta ${i}`;
            input.value = perguntas[i - 1];  // Preenche com o valor atual ou vazio

            // Atualiza o array de perguntas ao digitar
            input.addEventListener('input', async function() {
                perguntas[i - 1] = input.value;  // Atualiza o array de perguntas
                await updateDoc(doc(db, "tabelaRespostas", docId), {
                    perguntas: perguntas  // Atualiza o Firestore com o array de perguntas atualizado
                });
            });

            questionsContainer.appendChild(input);
        }

        // Atualiza o Firestore com o novo número de perguntas e mantém o array de perguntas
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            numeroDePerguntas: numPerguntas,
            perguntas: perguntas
        });
    });

    // Atualiza as perguntas em tempo real enquanto o usuário digita
    const questionInputs = row.querySelectorAll('.questions-container input');
    questionInputs.forEach((input, index) => {
        input.addEventListener('input', async function() {
            perguntas[index] = input.value;  // Atualiza o array de perguntas enquanto o usuário digita
            await updateDoc(doc(db, "tabelaRespostas", docId), {
                perguntas: perguntas  // Atualiza o Firestore com o array de perguntas atualizado
            });
        });
    });

    row.querySelector('.extra-info').addEventListener('change', async (e) => {
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            temExtraInfo: e.target.value
        });
    });

    row.querySelector('.extra-info-container textarea').addEventListener('blur', async (e) => {
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            extraInfo: e.target.value
        });
    });

    // Atualizando o campo de resposta encaminhada
    row.querySelector('.resposta-encaminhada').addEventListener('change', async (e) => {
        console.log("Doc ID:", docId); // Verifica se o ID está correto
        await updateDoc(doc(db, "tabelaRespostas", docId), {
            respostaEncaminhada: e.target.value
        });
    });

    row.querySelector('.delete-row-button').addEventListener('click', async () => {
        await deleteDoc(doc(db, "tabelaRespostas", docId));
        row.remove();
        updateDropdown();
    });
}



// Atualiza as perguntas para cada linha quando o número de perguntas é alterado
function updateQuestionInputs(selectElement) {
    selectElement.addEventListener('change', function() {
        const numQuestions = parseInt(this.value);
        const questionsContainer = this.parentNode.nextElementSibling;

        questionsContainer.innerHTML = '';
        for (let i = 1; i <= numQuestions; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Pergunta ${i}`;
            questionsContainer.appendChild(input);
        }
    });
}

// Função para atualizar o dropdown com as respostas disponíveis
async function updateDropdown() {
    const dropdowns = document.querySelectorAll('.resposta-encaminhada');
    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    
    const respostas = [];
    querySnapshot.forEach((doc) => {
        respostas.push(doc.data().resposta);
    });

    // Limpa o dropdown de respostas existentes e popula com os valores corretos
    dropdowns.forEach(dropdown => {
        const selectedValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Selecione</option>';
        respostas.forEach(resposta => {
            const option = document.createElement('option');
            option.value = resposta;
            option.textContent = resposta;
            if (selectedValue === resposta) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    });
}

// Função de debounce para evitar várias atualizações de uma vez
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.querySelectorAll('.num-questions').forEach(updateQuestionInputs);