// script.js — imagens locais + vídeos YouTube via mapa no código (sem fallback, sem áudio)

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* =========================================================
   0) Normalização
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
  "bot/camila": "img/enfermeira02.png",
  "logo/unilab": "img/logo-unilab.png",

  // saúde renal
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
   1.1) Pergunta -> IMAGENS (SEM fallback)
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
const QUESTION_IMAGE_MAP = (() => {
  const out = {};
  for (const [q, imgs] of Object.entries(QUESTION_IMAGE_RAW)) out[normalizeText(q)] = imgs;
  return out;
})();

/* =========================================================
   1.2) Pergunta -> VÍDEOS do YouTube (SEM fallback, só no código)
   - IDs/URLs resolvidos automaticamente para embed
   - Suas perguntas abaixo todas apontam para o vídeo: https://www.youtube.com/watch?v=p-mXfadnpZI
   ========================================================= */
const QUESTION_VIDEO_RAW = {
  "Como faço para seguir o tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "O que posso fazer para não falhar no tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Quais meus cuidados quando faço hemodiálise?": ["p-mXfadnpZI"],
  "Dicas para seguir firme no tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Como manter o comprometido com a hemodiálise?": ["p-mXfadnpZI"],
  "O que preciso fazer no tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Como posso me manter - tratamento de hemodiálise?": ["p-mXfadnpZI"],
};
const QUESTION_VIDEO_MAP = (() => {
  const out = {};
  for (const [q, vids] of Object.entries(QUESTION_VIDEO_RAW)) out[normalizeText(q)] = vids;
  return out;
})();

/* =========================================================
   1.3) Helpers de mídia
   ========================================================= */
function resolveAssetUrls(tokens = []) {
  return tokens.flatMap(t => {
    const key = t.startsWith("asset:") ? t.slice(6) : t;
    const url = ASSETS[key];
    if (!url) { console.warn(`[chat] imagem não mapeada: "${t}"`); return []; }
    return [url];
  });
}

// Extrai ID do YouTube e monta URL de embed nocookie
function toYouTubeEmbedUrl(idOrUrl) {
  if (!idOrUrl) return null;
  let id = idOrUrl.trim();
  try {
    const u = new URL(idOrUrl);
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.replace("/", "");
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) {
        id = u.searchParams.get("v") || idOrUrl;
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/").pop();
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/").pop();
      }
    }
  } catch { /* não era URL, trata como ID */ }
  id = (id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
function resolveVideoEmbeds(tokens = []) {
  return tokens.map(toYouTubeEmbedUrl).filter(Boolean);
}

/* =========================================================
   1.4) Render de mensagem (texto + imagens + vídeos)
   ========================================================= */
function addBotMessageRich({ html = "", text = "", images = [], alts = [], videos = [] }) {
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

  if (videos.length > 0) {
    const vgrid = document.createElement('div');
    vgrid.className = 'video-grid';

    videos.forEach(embedUrl => {
      const card = document.createElement('div');
      card.className = 'video-card';

      const frameWrap = document.createElement('div');
      frameWrap.className = 'video-frame';

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.title = "Vídeo educativo";
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;

      frameWrap.appendChild(iframe);
      card.appendChild(frameWrap);
      vgrid.appendChild(card);
    });

    wrap.appendChild(vgrid);
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
  return text.replace(/\r\n/g, "\n").replace(/\n(?!\s*(?:•|-|\*|\d+\)))/g, " ");
}
function splitIntoTopics(raw) {
  const text = joinSoftLineBreaks(raw).trim();
  let intro = "", body = text;
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
  const parts = normalized.split(/\n•\s*/).map(s => s.trim()).filter(Boolean);
  const topics = parts.map(t => t.replace(/[;,\s]+$/g, "").trim());
  return { intro, topics };
}
function formatTopicsNumbered(intro, topics) {
  const introLine = intro ? `${intro}\n\n` : "";
  const list = topics.map((t, i) => `${i + 1}. ${t}`).join("\n");
  return introLine + list;
}

/* =========================================================
   2) Fluxo principal — busca Firestore e injeta mídia
   ========================================================= */
async function processUserMessage(message) {
  if (looksLikeList(message)) {
    const { intro, topics } = splitIntoTopics(message);
    if (topics.length > 0) {
      const formatted = formatTopicsNumbered(intro, topics);
      addBotMessage(formatted);
      return;
    }
  }

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
   3) Render da resposta + “saiba mais”
   ========================================================= */
async function handleResponse(doc, data, userMessage = "", perguntaCorreta = "") {
  const text = data.resposta || "Desculpe, não encontrei detalhes.";

  // IMAGENS: Firestore (se houver) senão mapa local
  let imageKeys = Array.isArray(data.imagens) ? data.imagens : [];
  if (imageKeys.length === 0) {
    const normQ = normalizeText(perguntaCorreta || userMessage);
    imageKeys = QUESTION_IMAGE_MAP[normQ] || [];
  }
  const alts = Array.isArray(data.alts) ? data.alts : [];
  const images = resolveAssetUrls(imageKeys);

  // VÍDEOS: **somente** do mapa local
  const normQ = normalizeText(perguntaCorreta || userMessage);
  const videoTokens = QUESTION_VIDEO_MAP[normQ] || [];
  const videos = resolveVideoEmbeds(videoTokens);

  addBotMessageRich({ text, images, alts, videos });

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
   Modal de cálculo (inalterado)
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
function onEscClose(e){ if(e.key === 'Escape') closeCalcModal(); }
backdropEl.addEventListener('click', closeCalcModal);
function clearFields(){ inputPeso.value = ''; resultEl.textContent = ''; }
function showView(which){
  viewMenu.style.display   = 'none';
  viewWeight.style.display = 'none';
  if(which === 'menu'){ viewMenu.style.display = 'block'; }
  else if(which === 'weight'){ viewWeight.style.display = 'block'; inputPeso.focus(); }
}
window.showCalc = function(kind){ if(kind === 'weight') showView('weight'); }
window.goBackToMenu = function(){ clearFields(); showView('menu'); }
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
