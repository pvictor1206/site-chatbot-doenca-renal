document.getElementById('send-btn').addEventListener('click', function() {
    let userInput = document.getElementById('user-input').value;
    if (userInput.trim() === "") return;

    // Adiciona a mensagem do usuário à janela de chat
    addMessage('user', userInput);
    
    // Resposta do bot (simples exemplo)
    setTimeout(function() {
        let botResponse = getBotResponse(userInput);
        addMessage('bot', botResponse);
    }, 1000);

    document.getElementById('user-input').value = '';
});

function addMessage(sender, text) {
    let chatWindow = document.getElementById('chat-window');
    let messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    let messageText = document.createElement('p');
    messageText.textContent = text;
    messageDiv.appendChild(messageText);
    chatWindow.appendChild(messageDiv);

    // Rola para a última mensagem
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getBotResponse(userInput) {
    // Simula uma resposta simples do bot
    const responses = {
        "oi": "Olá! Como posso ajudar?",
        "tudo bem?": "Tudo ótimo! E com você?",
        "qual é o seu nome?": "Eu sou um chatbot criado para ajudar você!",
        "obrigado": "De nada! Estou aqui para ajudar."
    };
    
    // Retorna uma resposta baseada na entrada do usuário, ou uma padrão
    return responses[userInput.toLowerCase()] || "Desculpe, não entendi. Pode repetir?";
}
