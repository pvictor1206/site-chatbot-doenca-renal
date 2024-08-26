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
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            addUserMessage(message);
            input.value = '';
            processUserMessage(message.toLowerCase());
        }
    }
}

function addUserMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll automático para a última mensagem
}

function addBotMessage(message) {
    const chatBody = document.getElementById('chat-body');
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message');
    botMessage.textContent = message;
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll automático para a última mensagem
}

function processUserMessage(message) {
    if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde')) {
        addBotMessage("Olá, sou um robô virtual com a finalidade de oferecer orientações às pessoas em hemodiálise sobre cuidados diários e bem-estar, então vamos lá! Como você prefere ser chamado?");
    } else if (message.includes('meu nome é') || message.includes('sou') || message.includes('me chamo')) {
        const name = message.split(' ').slice(-1)[0]; // Captura o último nome como o nome do usuário
        addBotMessage(`${name}, para que esse momento seja mais prático, você tem a opção de colocar a tela em modo cheio/grande, digitar ou gravar suas perguntas como também ouvir suas respostas caso prefira. Vamos começar, coloque abaixo sua dúvida.`);
    } else if (message.includes('doença renal crônica') || message.includes('drc')) {
        addBotMessage("A Doença Renal Crônica (DRC) ocorre de forma lenta e gradual quando as principais funções dos rins como filtrar e eliminar líquido e toxinas são comprometidas. No início, é assintomática, sendo difícil de ser diagnosticada. Leia também: quais são os principais fatores de risco para a DRC?");
    } else if (message.includes('fatores de risco')) {
        addBotMessage("Os principais fatores de risco para DRC incluem diabetes (tipo I ou II), hipertensão, idade avançada, obesidade (IMC > 30 Kg/m²), histórico familiar de doenças renais, doenças do aparelho circulatório e uso de medicamentos nefrotóxicos. Veja também: quais são os sintomas comuns da DRC?");
    } else if (message.includes('sintomas') || message.includes('sinais')) {
        addBotMessage("Nos estágios iniciais, a DRC pode não apresentar sintomas. Quando os sintomas surgem em estágios avançados, incluem inchaços nas mãos, pés e ao redor dos olhos, alteração na cor e cheiro da urina, insônia, fadiga, perda de apetite, náuseas, vômitos e perda de peso. Leia também: como é feito o diagnóstico da DRC?");
    } else if (message.includes('diagnóstico') || message.includes('exames')) {
        addBotMessage("O diagnóstico da DRC geralmente é feito por meio de exames de sangue, sendo a creatinina sérica usada para calcular a Taxa de Filtração Glomerular (TFG). Exames de urina também são realizados para identificar a presença de sangue e proteínas. Em alguns casos, exames de imagem e biópsia são necessários.");
    } else {
        addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre a Doença Renal Crônica (DRC), como sintomas, fatores de risco, ou tratamentos.");
    }
}
