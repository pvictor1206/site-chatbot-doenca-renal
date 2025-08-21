// script.js

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let mediaRecorder;
let audioChunks = [];
let countdownInterval;

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
    chatWindow.style.display = (chatWindow.style.display === 'none' || chatWindow.style.display === '') ? 'block' : 'none';
};

async function processUserMessage(message) {
    const normalizedMessage = normalizeText(message);
    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    let foundResponse = false;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.perguntas)) {
            const perguntaCorreta = data.perguntas.find(pergunta => normalizeText(pergunta).includes(normalizedMessage));
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
    const hasExtraInfo = data.temExtraInfo && data.temExtraInfo.toLowerCase() === "sim";

    if (hasExtraInfo) {
        const encaminhamento = data.respostaEncaminhada;
        addExtraInfoButton(data.extraInfo, encaminhamento);
    }
}

function addExtraInfoButton(extraInfo, encaminhamento) {
    const chatBody = document.getElementById('chat-body');
    const extraButton = document.createElement('button');
    extraButton.classList.add('read-more-button');
    extraButton.textContent = extraInfo;

    extraButton.onclick = async () => {
        const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
        querySnapshot.forEach((docEnc) => {
            const dataEnc = docEnc.data();
            if (dataEnc.resposta === encaminhamento) {
                handleResponse(docEnc, dataEnc);
            }
        });
    };

    chatBody.appendChild(extraButton);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function addBotMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message');
    botMessage.innerHTML = message;
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '').trim();
}

window.handleUserInput = function handleUserInput(event) {
    if (event.key === 'Enter') {
        window.sendMessage();
    }
};

window.sendMessage = function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message) {
        addUserMessage(message);
        input.value = '';
        processUserMessage(message);
    }
};

function addUserMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

window.startRecording = function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported on your browser!');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            let countdown = 5;
            const timerElement = document.getElementById('countdown-timer');
            timerElement.textContent = `00:0${countdown}`;

            countdownInterval = setInterval(() => {
                countdown--;
                timerElement.textContent = `00:0${countdown}`;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                clearInterval(countdownInterval);
                document.getElementById('stop-button').style.display = 'none';
                document.getElementById('recording-indicator').style.display = 'none';

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();

                transcribeAudio(audioBlob);
            };

            mediaRecorder.start();
            document.getElementById('stop-button').style.display = 'inline-block';
            document.getElementById('recording-indicator').style.display = 'flex';
        })
        .catch(error => {
            console.error('Erro ao acessar microfone:', error);
        });
};

window.stopRecording = function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        clearInterval(countdownInterval);
        mediaRecorder.stop();
        document.getElementById('recording-indicator').style.display = 'none';
        console.log('Gravação parada manualmente.');
    }
};

async function transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large", {
        method: "POST",
        headers: {
            "Authorization": "Bearer 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",
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

window.increaseChatFontSize = function increaseChatFontSize() {
    const chatBody = document.getElementById('chat-body');
    const currentFontSize = window.getComputedStyle(chatBody).fontSize;
    const newFontSize = parseFloat(currentFontSize) + 2 + 'px';
    chatBody.style.fontSize = newFontSize;

    const messages = chatBody.querySelectorAll('.chat-message');
    messages.forEach(message => {
        message.style.fontSize = newFontSize;
    });
};

window.decreaseChatFontSize = function decreaseChatFontSize() {
    const chatBody = document.getElementById('chat-body');
    const currentFontSize = window.getComputedStyle(chatBody).fontSize;
    const newFontSize = parseFloat(currentFontSize) - 2 + 'px';
    chatBody.style.fontSize = newFontSize;

    const messages = chatBody.querySelectorAll('.chat-message');
    messages.forEach(message => {
        message.style.fontSize = newFontSize;
    });
};

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
        toggleChat();
        addUserMessage(label);
        processUserMessage(label);
    });
});



const modalEl      = document.getElementById('calc-modal');
  const backdropEl   = document.getElementById('calc-backdrop');
  const viewMenu     = document.getElementById('calc-view-menu');
  const viewWeight   = document.getElementById('calc-view-weight');
  const inputPeso    = document.getElementById('peso-seco');
  const resultEl     = document.getElementById('resultado-calculo');

  function openCalcModal(){
    modalEl.style.display = 'grid';
    backdropEl.style.display = 'block';
    // estado inicial sempre no menu
    showView('menu');
    // foco para acessibilidade
    setTimeout(() => modalEl.querySelector('h3, .calc-type')?.focus(), 0);
    // esc para fechar
    document.addEventListener('keydown', onEscClose);
  }

  function closeCalcModal(){
    modalEl.style.display = 'none';
    backdropEl.style.display = 'none';
    clearFields();
    document.removeEventListener('keydown', onEscClose);
  }

  function onEscClose(e){
    if(e.key === 'Escape') closeCalcModal();
  }

  // fecha ao clicar fora
  backdropEl.addEventListener('click', closeCalcModal);

  function clearFields(){
    inputPeso.value = '';
    resultEl.textContent = '';
  }

  function showView(which){
    // esconde tudo
    viewMenu.style.display   = 'none';
    viewWeight.style.display = 'none';

    if(which === 'menu'){
      viewMenu.style.display = 'block';
    }else if(which === 'weight'){
      viewWeight.style.display = 'block';
      inputPeso.focus();
    }
  }

  // API pública usada no HTML
  window.showCalc = function(kind){
    if(kind === 'weight') showView('weight');
    // future: else if(kind === 'outra') showView('outra');
  }

  window.goBackToMenu = function(){
    clearFields();
    showView('menu');
  }

  window.openCalcModal = openCalcModal;
  window.closeCalcModal = closeCalcModal;

  window.calcularPesoMaximo = function () {
    const pesoSeco = parseFloat(inputPeso.value);
    if (!isNaN(pesoSeco) && pesoSeco > 0) {
      const resultado = (pesoSeco * 3) / 100;
      resultEl.textContent = `Você pode ganhar no máximo ${resultado.toFixed(2)} kg entre as sessões.`;
    } else {
      resultEl.textContent = 'Por favor, insira um valor válido para o peso seco.';
    }
  };
