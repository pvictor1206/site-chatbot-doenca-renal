import { db } from 'firebase-init.js';
import { collection, getDocs } from "firebase/firestore";

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

                // Processar o áudio com o Google Cloud Speech-to-Text
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

// Função para transcrever o áudio
async function transcribeAudio(audioBlob) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(audioBlob);

    reader.onloadend = async () => {
        const audioBytes = reader.result;

        const audio = {
            content: audioBytes.toString('base64'),
        };

        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'pt-BR',
        };

        const request = {
            audio: audio,
            config: config,
        };

        const response = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        const result = await response.json();
        const transcription = result.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        addUserMessage(transcription);
        processUserMessage(transcription.toLowerCase());
    };
}
