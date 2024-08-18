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
            simulateBotResponse(message);
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

function simulateBotResponse(userMessage) {
    const chatBody = document.getElementById('chat-body');
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message');
    
    // Simulação simples de resposta
    botMessage.textContent = 'Lina está processando sua mensagem: ' + userMessage;
    
    setTimeout(() => {
        chatBody.appendChild(botMessage);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll automático para a última mensagem
    }, 1000);
}
