function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'flex';
    } else {
        chatWindow.style.display = 'none';
    }
}

function handleUserInput(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        processUserMessage(message.toLowerCase());
    }
}

function addUserMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function addBotMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message');
    botMessage.textContent = message;
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function processUserMessage(message) {
    // Mensagens fixas de exemplo
    if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde')) {
        addBotMessage("Olá, sou um robô virtual com a finalidade de oferecer orientações sobre saúde. Como você prefere ser chamado?");
    } else if (message.includes('meu nome é') || message.includes('sou') || message.includes('me chamo')) {
        const name = message.split(' ').slice(-1)[0];
        addBotMessage(`Prazer em te conhecer, ${name}! Como posso te ajudar hoje?`);
    } else if (message.includes('insulina') || message.includes('aplicação de insulina')) {
        addBotMessage("A aplicação de insulina deve ser feita conforme a prescrição médica. Lembre-se de higienizar bem o local antes da aplicação.");
    } else {
        addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre saúde, como aplicação de insulina.");
    }
}

function toggleExpandChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('expanded');

    const expandButtonIcon = document.querySelector('.expand-button i');
    if (chatWindow.classList.contains('expanded')) {
        expandButtonIcon.classList.remove('fa-expand');
        expandButtonIcon.classList.add('fa-compress');
    } else {
        expandButtonIcon.classList.remove('fa-compress');
        expandButtonIcon.classList.add('fa-expand');
    }
}

function startRecording() {
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
}

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
