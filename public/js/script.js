// script.js (sem áudio) — imagens locais + pergunta->imagem (sem fallback)

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* =========================================================
   0) Normalização (usada em todo o fluxo e no mapa de perguntas)
   ========================================================= */
function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/* =========================================================
   1) Mapa de ASSETS (imagens locais do projeto)
   ========================================================= */
const ASSETS = {
  // ícones/figuras gerais
  "bot/camila": "img/enfermeira02.png",
  "logo/unilab": "img/logo-unilab.png",

  // saúde renal (presentes no seu HTML)
  "renal/drc": "img/renal.png",
  "renal/hemodialise": "img/hemodialise.png",
  "renal/alimentacao": "img/fruit.png",
  "renal/cateter": "img/cateter.png",
  "renal/fistula": "img/fistula.png",
  "renal/liquidos": "img/liquido.png",
  "renal/peso": "img/peso.png",
  "renal/medicacoes": "img/medicamentos.png",

  // extras
  "tips/liquidos": "img/ideia-consumo.png",
  "calc/peso": "img/calculo-pesp.png",
  "curiosidades/icone": "img/icone1.png",
  "drc/oque": "img/oq-DRC.png",
  "drc/fatores": "img/fatores-DRC.png",
};

/* =========================================================
   1.1) Mapa PERGUNTA -> IMAGENS (SEM fallback)
   - Edite abaixo para amarrar perguntas a chaves do ASSETS
   ========================================================= */
const QUESTION_IMAGE_RAW = {
  "o que e hemodialise?": ["renal/hemodialise"],
  "me fale sobre hemodialise": ["renal/hemodialise"],
  "o que e fistula arteriovenosa": ["renal/fistula"],
  "o que e cateter de hemodialise": ["renal/cateter"],
  "dicas para consumo de liquidos": ["renal/liquidos", "tips/liquidos"],
  "qual a dieta/alimentacao na hemodialise": ["renal/alimentacao"],
  "posso calcular meu peso": ["renal/peso", "calc/peso"],
};

// Normaliza as chaves do mapa acima
const QUESTION_IMAGE_MAP = (() => {
  const out = {};
  for (const [q, imgs] of Object.entries(QUESTION_IMAGE_RAW)) {
    out[normalizeText(q)] = imgs;
  }
  return out;
})();

/* =========================================================
   1.2) Helpers de render
   ========================================================= */
function resolveAssetUrls(tokens = []) {
  return tokens.flatMap(t => {
    const key = t.startsWith("asset:") ? t.slice(6) : t; // aceita "asset:..." ou só a chave
    const url = ASSETS[key];
    if (!url) { console.warn(`[chat] imagem não mapeada: "${t}"`); return []; }
    return [url];
  });
}

function addBotMessageRich({ html = "", text = "", images = [], alts = [] }) {
  const chat = document.getElementById('chat-body');
  const wrap = document.createElement('div');
  wrap.className = 'chat-message bot';

  if (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    wrap.appendChild(div);
  } else if (text) {
    const p = document.createElement('p');
    p.textContent = text;
    wrap.appendChild(p);
  }

  if (images.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'img-grid';
    images.forEach((url, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'img-item';

      const img = document.createElement('img');
      img.src = url;
      img.alt = (alts[idx] || "").toString();
      img.loading = "lazy";
      img.decoding = "async";

      fig.appendChild(img);

      if (alts[idx]) {
        const cap = document.createElement('figcaption');
        cap.textContent = alts[idx];
        fig.appendChild(cap);
      }

      grid.appendChild(fig);
    });
    wrap.appendChild(grid);
  }

  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

// Compat: aceita só texto/HTML
function addBotMessage(message) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(message);
  addBotMessageRich({ html: looksHtml ? message : "", text: looksHtml ? "" : message });
}

/* =========================================================
   UI BÁSICA
   ========================================================= */
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

/* =========================================================
   Helpers de parsing
   ========================================================= */
function looksLikeList(text) {
  return /(?:^|\n)\s*(?:•|-|\*|\d+\))/m.test(text);
}

function joinSoftLineBreaks(text) {
  return text.replace(/\r\n/g, "\n")
             .replace(/\n(?!\s*(?:•|-|\*|\d+\)))/g, " ");
}

function splitIntoTopics(raw) {
  const text = joinSoftLineBreaks(raw).trim();

  let intro = "";
  let body = text;
  const colonIdx = text.indexOf(":");
  if (colonIdx !== -1 && colonIdx < text.length - 1) {
    intro = text.slice(0, colonIdx + 1).trim();
    body  = text.slice(colonIdx + 1).trim();
  }

  const normalized = body
    .replace(/(?:^|\n)\s*-\s*/g, "\n• ")
    .replace(/(?:^|\n)\s*\*\s*/g, "\n• ")
    .replace(/(?:^|\n)\s*\d+\)\s*/g, "\n• ")
    .replace(/(?:^|\n)\s*•\s*/g, "\n• ");

  const parts = normalized
    .split(/\n•\s*/).map(s => s.trim()).filter(Boolean);

  const topics = parts.map(t => t.replace(/[;,\s]+$/g, "").trim());
  return { intro, topics };
}

function formatTopicsNumbered(intro, topics) {
  const introLine = intro ? `${intro}\n\n` : "";
  const list = topics.map((t, i) => `${i + 1}. ${t}`).join("\n");
  return introLine + list;
}

/* =========================================================
   2) Fluxo principal — suporta imagens locais
   ========================================================= */
async function processUserMessage(message) {
  // 1) Se a mensagem "parece lista", já responde separado em tópicos
  if (looksLikeList(message)) {
    const { intro, topics } = splitIntoTopics(message);
    if (topics.length > 0) {
      const formatted = formatTopicsNumbered(intro, topics);
      addBotMessage(formatted);
      return;
    }
  }

  // 2) Buscar no Firestore por pergunta correspondente
  const normalizedMessage = normalizeText(message);
  const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
  let foundResponse = false;

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    if (Array.isArray(data.perguntas)) {
      const perguntaCorreta = data.perguntas.find(pergunta =>
        normalizeText(pergunta).includes(normalizedMessage)
      );
      if (perguntaCorreta) {
        foundResponse = true;
        await handleResponse(docSnap, data, message, perguntaCorreta);
        break;
      }
    }
  }

  if (!foundResponse) {
    addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre saúde.");
  }
}

/* =========================================================
   3) Render da resposta + botão "saiba mais" (se houver)
   ========================================================= */
async function handleResponse(doc, data, userMessage = "", perguntaCorreta = "") {
  const text = data.resposta || "Desculpe, não encontrei detalhes.";

  // 1) Se o Firestore já trouxe imagens, usa.
  let keys = Array.isArray(data.imagens) ? data.imagens : [];

  // 2) Senão, usa o mapeamento pergunta->imagens (sem fallback)
  if (keys.length === 0) {
    const normQ = normalizeText(perguntaCorreta || userMessage);
    keys = QUESTION_IMAGE_MAP[normQ] || [];
  }

  const alts = Array.isArray(data.alts) ? data.alts : [];
  const images = resolveAssetUrls(keys);

  addBotMessageRich({ text, images, alts });

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

/* =========================================================
   Utilidades diversas
   ========================================================= */
function addUserMessage(message) {
  const chatBody = document.getElementById('chat-body');
  const userMessage = document.createElement('div');
  userMessage.classList.add('chat-message', 'user');
  userMessage.textContent = message;
  chatBody.appendChild(userMessage);
  chatBody.scrollTop = chatBody.scrollHeight;
}

window.handleUserInput = function handleUserInput(event) {
  if (event.key === 'Enter') window.sendMessage();
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

/* =========================================================
   (Sem áudio) — esconder elementos e evitar erro dos onclicks no HTML
   ========================================================= */
window.startRecording = function () {
  // Áudio desativado: apenas avisa (ou deixe vazio se preferir)
  console.info('[chat] Função de áudio desativada.');
};
window.stopRecording = function () {
  console.info('[chat] Função de áudio desativada.');
};

// Esconde botões/indicador se existirem
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.audio-button').forEach(btn => {
    btn.style.display = 'none';
  });
  const rec = document.getElementById('recording-indicator');
  if (rec) rec.style.display = 'none';
});

/* =========================================================
   Botões de assuntos/atalhos
   ========================================================= */
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

/* =========================================================
   Modal de cálculo
   ========================================================= */
const modalEl      = document.getElementById('calc-modal');
const backdropEl   = document.getElementById('calc-backdrop');
const viewMenu     = document.getElementById('calc-view-menu');
const viewWeight   = document.getElementById('calc-view-weight');
const inputPeso    = document.getElementById('peso-seco');
const resultEl     = document.getElementById('resultado-calculo');

function openCalcModal(){
  modalEl.style.display = 'grid';
  backdropEl.style.display = 'block';
  showView('menu');
  setTimeout(() => modalEl.querySelector('h3, .calc-type')?.focus(), 0);
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

backdropEl.addEventListener('click', closeCalcModal);

function clearFields(){
  inputPeso.value = '';
  resultEl.textContent = '';
}

function showView(which){
  viewMenu.style.display   = 'none';
  viewWeight.style.display = 'none';
  if(which === 'menu'){
    viewMenu.style.display = 'block';
  } else if(which === 'weight'){
    viewWeight.style.display = 'block';
    inputPeso.focus();
  }
}

window.showCalc = function(kind){
  if(kind === 'weight') showView('weight');
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
