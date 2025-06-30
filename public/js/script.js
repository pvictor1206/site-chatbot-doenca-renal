// script.js

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Definindo toggleChat no escopo global
window.toggleChat = function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = (chatWindow.style.display === 'none' || chatWindow.style.display === '') ? 'flex' : 'none';
};

window.toggleExpandChat = function toggleExpandChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('expanded');
};

window.toggleMinimizeChat = function toggleMinimizeChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
    } else {
        chatWindow.style.display = 'none';
    }
};

// Função para processar a mensagem do usuário
async function processUserMessage(message) {
    const normalizedMessage = normalizeText(message);

    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    let foundResponse = false;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Verifica se perguntas é um array
        if (Array.isArray(data.perguntas)) {
            const perguntaCorreta = data.perguntas.find(pergunta => normalizeText(pergunta).includes(normalizedMessage));
            console.log('Pergunta encontrada:', perguntaCorreta);

            if (perguntaCorreta) {
                foundResponse = true;
                handleResponse(doc, data);
            }
        }
    });

    if (!foundResponse) {
        addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre saúde.");
    }
}

async function handleResponse(doc, data) {
    addBotMessage(data.resposta);

    // Normalizar o valor de 'temExtraInfo' para evitar problemas de comparação
    const hasExtraInfo = data.temExtraInfo && data.temExtraInfo.toLowerCase() === "sim";

    if (hasExtraInfo) {
        const encaminhamento = data.respostaEncaminhada;

        // Exibe o botão de informação extra
        addExtraInfoButton(data.extraInfo, encaminhamento);
    }
}

// Função para adicionar o botão de informação extra
function addExtraInfoButton(extraInfo, encaminhamento) {
    const chatBody = document.getElementById('chat-body');
    const extraButton = document.createElement('button');
    extraButton.classList.add('read-more-button');
    extraButton.textContent = extraInfo; // Botão exibe o texto de 'extraInfo'
    
    // Ao clicar no botão, encaminha para a respostaEncaminhada
    extraButton.onclick = async () => {
        const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
        querySnapshot.forEach((docEnc) => {
            const dataEnc = docEnc.data();
            if (dataEnc.resposta === encaminhamento) {
                handleResponse(docEnc, dataEnc); // Chama handleResponse para mostrar a resposta
            }
        });
    };
    
    chatBody.appendChild(extraButton);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Função para adicionar a mensagem do bot
function addBotMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message');
    botMessage.innerHTML = message;
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Função para normalizar texto
function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '').trim();
}

// Função para lidar com a entrada do usuário via teclado (Enter)
window.handleUserInput = function handleUserInput(event) {
    if (event.key === 'Enter') {
        window.sendMessage();
    }
};

// Função para enviar a mensagem
window.sendMessage = function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message) {
        addUserMessage(message);
        input.value = '';
        processUserMessage(message);
    }
};

// Função para adicionar a mensagem do usuário
function addUserMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}


// Função para iniciar a gravação de áudio
window.startRecording = function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported on your browser!');
        return;
    }

    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            const audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();

                // Processar o áudio
                transcribeAudio(audioBlob);
            });

            setTimeout(() => {
                mediaRecorder.stop();
            }, 5000); // Grava por 5 segundos
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
        });
};



// Função para transcrever o áudio usando Whisper API (Hugging Face)
async function transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large", {
        method: "POST",
        headers: {
            "Authorization": "Bearer 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", // ID
        },
        body: formData,
    });

    if (!response.ok) {
        console.error('Erro na transcrição:', await response.text());
        return;
    }

    const result = await response.json();
    const transcription = result.text;

    addUserMessage(transcription);
    processUserMessage(transcription.toLowerCase());
}


// Função para aumentar o tamanho da fonte do chat
window.increaseChatFontSize = function increaseChatFontSize() {
    const chatBody = document.getElementById('chat-body');
    const currentFontSize = window.getComputedStyle(chatBody).fontSize;
    const newFontSize = parseFloat(currentFontSize) + 2 + 'px'; // Aumenta em 2px
    chatBody.style.fontSize = newFontSize;

    // Aumenta também o tamanho da fonte das mensagens, caso necessário
    const messages = chatBody.querySelectorAll('.chat-message');
    messages.forEach(message => {
        message.style.fontSize = newFontSize;
    });
};

// Função para aumentar o tamanho da fonte do chat
window.increaseChatFontSize = function increaseChatFontSize() {
    const chatBody = document.getElementById('chat-body');
    const currentFontSize = window.getComputedStyle(chatBody).fontSize;
    const newFontSize = parseFloat(currentFontSize) + 2 + 'px'; // Aumenta em 2px
    chatBody.style.fontSize = newFontSize;

    // Aumenta também o tamanho da fonte das mensagens
    const messages = chatBody.querySelectorAll('.chat-message');
    messages.forEach(message => {
        message.style.fontSize = newFontSize;
    });
};

// Função para diminuir o tamanho da fonte do chat
window.decreaseChatFontSize = function decreaseChatFontSize() {
    const chatBody = document.getElementById('chat-body');
    const currentFontSize = window.getComputedStyle(chatBody).fontSize;
    const newFontSize = parseFloat(currentFontSize) - 2 + 'px'; // Diminui em 2px
    chatBody.style.fontSize = newFontSize;

    // Diminui também o tamanho da fonte das mensagens
    const messages = chatBody.querySelectorAll('.chat-message');
    messages.forEach(message => {
        message.style.fontSize = newFontSize;
    });
};



// Controle de mostrar/ocultar os botões de assuntos
const toggleSubjectsBtn = document.getElementById('toggle-subjects-btn');
const subjectsContainer = document.getElementById('subjects-container');
const toggleIcon = document.getElementById('toggle-subjects-icon');

toggleSubjectsBtn.addEventListener('click', () => {
    if (subjectsContainer.style.display === 'none' || subjectsContainer.style.display === '') {
        subjectsContainer.style.display = 'flex';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
    } else {
        subjectsContainer.style.display = 'none';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
    }
});

// Adiciona evento para cada botão de assunto para enviar a mensagem ao chat
document.querySelectorAll('.subject-btn').forEach(button => {
    button.addEventListener('click', () => {
        const assunto = button.textContent;
        addUserMessage(assunto);
        processUserMessage(assunto);
    });
});


document.querySelectorAll('.tool-button').forEach(button => {
    button.addEventListener('click', () => {
        const label = button.querySelector('p').textContent;
        toggleChat(); // Abre o chat se estiver fechado
        addUserMessage(label); // Adiciona mensagem como se fosse o usuário
        processUserMessage(label); // Processa a mensagem
    });
});



// Abrir/Fechar modal
window.openCalcModal = function () {
    document.getElementById('calc-modal').style.display = 'block';
};

window.closeCalcModal = function () {
    document.getElementById('calc-modal').style.display = 'none';
    document.getElementById('weight-calc').style.display = 'none';
    document.getElementById('resultado-calculo').innerText = '';
};

window.showWeightCalc = function () {
    document.getElementById('weight-calc').style.display = 'block';
};

window.calcularPesoMaximo = function () {
    const pesoSeco = parseFloat(document.getElementById('peso-seco').value);
    const resultadoEl = document.getElementById('resultado-calculo');

    if (!isNaN(pesoSeco) && pesoSeco > 0) {
        const resultado = (pesoSeco * 3) / 100;
        resultadoEl.innerText = `Você pode ganhar no máximo ${resultado.toFixed(2)} Kg entre as sessões.`;
    } else {
        resultadoEl.innerText = 'Por favor, insira um valor válido para o peso seco.';
    }
};


// Parar gravação
let mediaRecorder;
let audioChunks = [];

window.startRecording = function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported on your browser!');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();

                // Oculta botão de parar após finalização
                document.getElementById('stop-button').style.display = 'none';

                // Transcrição
                transcribeAudio(audioBlob);
            };

            mediaRecorder.start();
            document.getElementById('stop-button').style.display = 'inline-block';

            console.log('Gravação iniciada...');
        })
        .catch(error => {
            console.error('Erro ao acessar microfone:', error);
        });
};

window.stopRecording = function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log('Gravação parada manualmente.');
    }
};