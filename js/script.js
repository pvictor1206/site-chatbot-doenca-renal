function processUserMessage(message) {
    // Normaliza a mensagem: remove espaços extras, sinais, interrogação e converte para minúsculas
    const normalizedMessage = message.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\?/g, '') // Remove o símbolo de interrogação
        .replace(/[^\w\s]/gi, '') // Remove outros caracteres especiais
        .trim(); // Remove espaços extras no início e no final

    // Mensagens fixas de exemplo
    if (/oi|ola|bom dia|boa tarde/.test(normalizedMessage)) {
        addBotMessage("Olá, sou um robô virtual com a finalidade de oferecer orientações sobre saúde. Como você prefere ser chamado?");
    } else if (/meu nome e|sou|me chamo/.test(normalizedMessage)) {
        const name = message.split(' ').slice(-1)[0].replace(/[^\w\s]/gi, '').trim();
        addBotMessage(`Prazer em te conhecer, ${name}! Como posso te ajudar hoje?`);
    } else if (/insulina|aplicacao de insulina/.test(normalizedMessage)) {
        addBotMessage("A aplicação de insulina deve ser feita conforme a prescrição médica. Lembre-se de higienizar bem o local antes da aplicação.");
    } else if (/o que e doenca renal cronica|poderia me explicar o que e a doenca renal cronica|o que exatamente significa ter doenca renal cronica|o que e essa tal de doenca renal cronica|o que e drc|o que e que acontece quando a pessoa tem doenca renal cronica|doenca renal cronica o que e isso|eu posso saber mais sobre a doenca renal cronica|o que significa ser diagnosticado com doenca renal cronica|voce pode me dar mais detalhes sobre a doenca renal cronica|gostaria de entender melhor o que e a doenca renal cronica|o que e drc no contexto da saude renal|como se define a doenca renal cronica/.test(normalizedMessage)) {
        addBotMessage("A Doença Renal Crônica (DRC) ocorre de forma lenta e gradual quando as principais funções dos rins, como filtrar e eliminar líquido e toxinas são comprometidas. No início é assintomática, sendo difícil de ser diagnosticada.");
        addBotMessage('<button class="read-more-button" onclick="showRiskFactors()">Leia também, quais os principais fatores de riscos da DRC?</button>');
    } else {
        addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre saúde, como aplicação de insulina.");
    }
}

function addBotMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message');
    botMessage.innerHTML = message; // Permite HTML para o botão e listas
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showRiskFactors() {
    addBotMessage(`
        <ul>
            <li>Diabetes (tipo I ou II);</li>
            <li>Hipertensão;</li>
            <li>Idosos;</li>
            <li>Portadores de obesidade (IMC > 30 Kg/m²);</li>
            <li>Histórico familiar de doenças renais;</li>
            <li>Histórico de doença do aparelho circulatório (doença coronariana, acidente vascular cerebral, doença vascular periférica, insuficiência cardíaca);</li>
            <li>Uso de medicamentos nefrotóxicos, ou seja, que causam danos aos rins como os anti-inflamatórios não esteroides.</li>
        </ul>
        <button class="read-more-button" onclick="showSymptoms()">Veja também, quais os sintomas comuns da DRC?</button>
    `);
}

function showSymptoms() {
    addBotMessage(`
        Nos estágios iniciais, a DRC pode não apresentar sintomas. Quando os sintomas surgem em estágios avançados, incluem inchaços nas mãos, pés e ao redor dos olhos, alteração na cor e cheiro da urina, insônia, fadiga, perda de apetite, náuseas/enjoo, vômitos e perda de peso.
        <button class="read-more-button" onclick="showDiagnosis()">Leia também, como é feito o diagnóstico da DRC?</button>
    `);
}

function showDiagnosis() {
    addBotMessage(`
        O diagnóstico da DRC geralmente é feito por meio de exames de sangue, dentre eles, um dos principais é creatinina sérica, usada para calcular a Taxa de Filtração Glomerular (TFG). Também é analisada a urina para identificar a presença de sangue e proteínas. Em alguns casos, exames de imagem e biópsia são necessários.
        <button class="read-more-button" onclick="showStages()">Veja também, quais são os estágios da doença renal crônica?</button>
    `);
}

function showStages() {
    addBotMessage("Os estágios da Doença Renal Crônica variam de 1 a 5, dependendo da Taxa de Filtração Glomerular (TFG). O estágio 1 indica dano renal com função normal, enquanto o estágio 5 representa a falência renal, onde a diálise ou transplante pode ser necessário.");
}

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

function toggleMinimizeChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';  // Mostra a janela de chat
    } else {
        chatWindow.style.display = 'none';   // Esconde a janela de chat
    }
}
